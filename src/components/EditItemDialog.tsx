import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingItem } from '@/types/shopping';
import { toast } from 'sonner';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { categories, units } from '@/constants/shopping';

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditItem: (item: ShoppingItem) => void;
  item: ShoppingItem | null;
  listTitle: string;
}

const EditItemDialog = ({ open, onOpenChange, onEditItem, item, listTitle }: EditItemDialogProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('un');
  const [price, setPrice] = useState('');
  const [supermarket, setSupermarket] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isOptional, setIsOptional] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || '');
      setQuantity(item.quantity || 1);
      setUnit(item.unit || 'un');
      setPrice(item.price?.toString() || '');
      setSupermarket(item.supermarket || '');
      setExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : '');
      setIsRecurring(item.isRecurring || false);
      setIsOptional(item.isOptional || false);
      
      const hasOptionalData = !!(item.category || item.price || item.supermarket || item.expiryDate || item.isRecurring || item.isOptional);
      setShowMoreOptions(hasOptionalData);

    } else {
        setShowMoreOptions(false);
    }
  }, [item]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (!name.trim()) {
      toast.error('O nome do item é obrigatório.');
      return;
    }

    const newPrice = parseFloat(price);

    const updatedItem: ShoppingItem = {
      ...item,
      name: name.trim(),
      quantity: Number(quantity) || 1,
      unit: unit,
      isRecurring,
      isOptional,
      category: category || undefined,
      price: !isNaN(newPrice) ? newPrice : undefined,
      supermarket: supermarket.trim() || undefined,
      expiryDate: expiryDate || undefined,
    };

    onEditItem(updatedItem);
    onOpenChange(false);
    toast.success(`"${updatedItem.name}" foi atualizado.`);
  };
  
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            // Reset state if needed when closing
        }
        onOpenChange(isOpen);
    };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-center text-2xl font-bold">Editar Item</DialogTitle>
          <p className="text-center text-sm text-muted-foreground -mt-1">{listTitle}</p>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pt-4 pr-6 -mr-6 pl-2 pb-4">
          <form id="edit-item-form" onSubmit={handleSave} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name">Nome do produto</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Leite integral" className="h-11" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-11 w-11">-</Button>
                  <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="text-center h-11" />
                  <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)} className="h-11 w-11">+</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {showMoreOptions && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => {
                        const Icon = getCategoryIcon(cat);
                        return (
                          <SelectItem key={cat} value={cat}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span>{cat}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="supermarket">Supermercado (opcional)</Label>
                  <Input id="supermarket" value={supermarket} onChange={e => setSupermarket(e.target.value)} placeholder="Ex: Carrefour" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input id="price" type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0,00" className="h-11" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Validade (opcional)</Label>
                  <div className="relative">
                      <Input id="expiryDate" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="h-11 w-full pr-10" />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox id="isRecurring" checked={isRecurring} onCheckedChange={checked => setIsRecurring(checked as boolean)} />
                  <Label htmlFor="isRecurring" className="cursor-pointer text-sm">Item de compra recorrente</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox id="isOptional" checked={isOptional} onCheckedChange={checked => setIsOptional(checked as boolean)} />
                  <Label htmlFor="isOptional" className="cursor-pointer text-sm">Item opcional</Label>
                </div>
              </div>
            )}
          </form>
        </div>
        <DialogFooter className="flex-shrink-0 pt-6 flex-col gap-2">
            <Button
                type="button"
                variant="ghost"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2"
            >
                <PlusCircle className="w-4 h-4" />
                {showMoreOptions ? "Menos opções" : "Mais opções"}
            </Button>
          <Button type="submit" form="edit-item-form" className="w-full h-12 text-base font-bold gradient-primary">Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
