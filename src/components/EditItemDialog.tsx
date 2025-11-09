import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useSupermarkets } from "@/hooks/useSupermarkets";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingItem } from "@/types/shopping";
import { getCategoryIcon } from "@/utils/categoryIcons";

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
];

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditItem: (item: ShoppingItem) => void;
  item: ShoppingItem | null;
  listTitle?: string;
}

const EditItemDialog = ({ open, onOpenChange, onEditItem, item, listTitle }: EditItemDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("un");
  const [price, setPrice] = useState("");
  const [supermarket, setSupermarket] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const { supermarkets, addSupermarket, searchSupermarkets } = useSupermarkets();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity);
      setUnit(item.unit);
      setPrice(item.price.toString());
      setSupermarket(item.supermarket || "");
      setExpiryDate(item.expiryDate || "");
      setIsRecurring(item.isRecurring || false);
    }
  }, [item]);

  useEffect(() => {
    if (supermarket) {
      setSuggestions(searchSupermarkets(supermarket));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [supermarket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item || !name || !category || !quantity || !price) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (supermarket) {
      addSupermarket(supermarket);
    }

    onEditItem({
      ...item,
      name,
      category,
      quantity,
      unit,
      price: parseFloat(price),
      supermarket: supermarket || undefined,
      expiryDate: expiryDate || undefined,
      isRecurring,
    });
    
    toast.success("Item atualizado com sucesso!");
    onOpenChange(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSupermarket(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Item</DialogTitle>
          {listTitle && <p className="text-sm text-muted-foreground mt-1">{listTitle}</p>}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
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

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
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
              onFocus={() => supermarket && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Ex: Carrefour"
              className="glass border-border/50"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 glass border border-border/50 rounded-lg shadow-lg max-h-48 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
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
            <Label htmlFor="price">Preço (R$)</Label>
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

          <Button 
            type="submit" 
            className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300"
          >
            Salvar alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
