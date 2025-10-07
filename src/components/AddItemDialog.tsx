import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: any) => void;
}

const AddItemDialog = ({ open, onOpenChange, onAddItem }: AddItemDialogProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !quantity || !price) {
      toast.error("Preencha todos os campos");
      return;
    }

    onAddItem({
      name,
      category,
      quantity: parseInt(quantity),
      price: parseFloat(price),
    });

    // Reset form
    setName("");
    setCategory("");
    setQuantity("1");
    setPrice("");
    
    toast.success("Item adicionado com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Adicionar Item</DialogTitle>
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="glass border-border/50"
              />
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
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300"
          >
            Adicionar à lista
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
