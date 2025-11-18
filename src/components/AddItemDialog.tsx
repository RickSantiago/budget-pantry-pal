import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSupermarkets } from "@/hooks/useSupermarkets";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingItem } from "@/types/shopping";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { PlusCircle } from 'lucide-react';

const categories = [
  "Grãos e Cereais",
  "Carnes",
  "Hortifrúti",
  "Laticínios",
  "Padaria e Massas",
  "Bebidas",
  "Doces e Snacks",
  "Congelados",
  "Molhos e Condimentos",
  "Limpeza",
  "Higiene",
  "Frios",
  "Oleos e Gorduras",
  "Outros"
];

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Omit<ShoppingItem, "id" | "checked">) => void;
  listTitle?: string;
}

const AddItemDialog = ({ open, onOpenChange, onAddItem, listTitle }: AddItemDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("un");
  const [price, setPrice] = useState("");
  const [supermarket, setSupermarket] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const { supermarkets, addSupermarket } = useSupermarkets();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Preencha o nome do produto");
      return;
    }

    if (supermarket) {
      addSupermarket(supermarket);
    }

    const newItem: any = {
        name,
        quantity,
        unit,
        isRecurring,
    };

    if (category) {
        newItem.category = category;
    }
    if (price) {
        newItem.price = parseFloat(price);
    }
    if (supermarket) {
        newItem.supermarket = supermarket;
    }
    if (expiryDate) {
        newItem.expiryDate = expiryDate;
    }

    onAddItem(newItem);

    // Reset form
    setName("");
    setCategory("");
    setQuantity(1);
    setUnit("un");
    setPrice("");
    setSupermarket("");
    setExpiryDate("");
    setIsRecurring(false);
    setShowMoreOptions(false);
    toast.success("Item adicionado com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 shadow-xl max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">Adicionar Item</DialogTitle>
          {listTitle && <p className="text-sm text-muted-foreground mt-1">{listTitle}</p>}
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto mt-4 pr-6 -mr-6 pl-2 pb-4">
          <form onSubmit={handleSubmit} id="add-item-form" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do produto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Arroz"
                className="glass border-border/50"
              />
            </div>

            {showMoreOptions && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria (opcional)</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="glass border-border/50">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50">
                      {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat);
                        return (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{cat}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="supermarket">Supermercado (opcional)</Label>
                  <Input
                    id="supermarket"
                    value={supermarket}
                    onChange={(e) => setSupermarket(e.target.value)}
                    placeholder="Ex: Carrefour"
                    className="glass border-border/50"
                    list="supermarkets-list"
                  />
                  <datalist id="supermarkets-list">
                      {supermarkets.map((s) => (
                          <option key={s} value={s} />
                      ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="glass border-border/50 h-10 w-10"
                      >
                        -
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="glass border-border/50 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="glass border-border/50 h-10 w-10"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="glass border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-border/50">
                        <SelectItem value="un">Unidade</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="g">Gramas</SelectItem>
                        <SelectItem value="l">Litro</SelectItem>
                        <SelectItem value="ml">ML</SelectItem>
                        <SelectItem value="cx">Caixa</SelectItem>
                        <SelectItem value="pct">Pacote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço R$ (opcional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="glass border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Validade (opcional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="glass border-border/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                  />
                  <Label htmlFor="isRecurring" className="cursor-pointer">
                    Item de compra recorrente
                  </Label>
                </div>
              </div>
            )}
          </form>
        </div>

        <DialogFooter className="flex-shrink-0 pt-4 gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <PlusCircle className="w-4 h-4" />
            {showMoreOptions ? "Menos opções" : "Mais opções"}
          </Button>

          <Button 
            type="submit" 
            form="add-item-form"
            className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300"
          >
            Adicionar à lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;