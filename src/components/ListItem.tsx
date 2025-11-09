import { useState } from 'react';
import { ShoppingItem, PantryItem } from '@/types/shopping';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit2, Store, CalendarDays, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { getCategoryColor } from '@/utils/categoryColors';
import AddToPantryDialog from './AddToPantryDialog';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface ListItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
}

const ListItem = ({ item, onToggle, onEdit }: ListItemProps) => {
  const [user] = useAuthState(auth);
  const [isPantryDialogOpen, setPantryDialogOpen] = useState(false);

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setPantryDialogOpen(true);
    } else {
      onToggle(item.id);
    }
  };

  const handleConfirmPantry = async (itemId: string, expiryDate: Date) => {
    if (!user) return;

    const pantryItem: Omit<PantryItem, 'id'> = {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      supermarket: item.supermarket,
      purchaseDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      ownerId: user.uid,
    };

    const newPantryItemRef = doc(collection(db, `users/${user.uid}/pantry`));
    await setDoc(newPantryItemRef, pantryItem);

    onToggle(itemId);
    setPantryDialogOpen(false);
  };

  const CategoryIcon = getCategoryIcon(item.category);
  const categoryColor = getCategoryColor(item.category);

  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 1;
  const unit = (item.unit || '').toLowerCase();
  const isMultipliable = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'].includes(unit);
  const totalPrice = isMultipliable ? price * quantity : price;

  return (
    <>
      <div
        className={`flex items-start gap-2 sm:gap-4 p-2.5 sm:p-3 rounded-lg transition-all duration-300 glass border ${item.checked ? 'border-green-500/30 bg-green-500/10' : 'border-border/50'}`}>
        
        <Checkbox
          checked={item.checked}
          onCheckedChange={handleCheckboxChange}
          className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded-md transition-all duration-300 ${item.checked ? 'border-green-500 bg-green-500' : ''}`}
        />
        
        <div className='flex-1 min-w-0'>
          <p className={`font-medium text-sm sm:text-base truncate ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
            {item.name}
          </p>

          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1'>
              {item.price != null && item.price > 0 && (
                  <span className='font-semibold text-primary/90'>
                      R$ {totalPrice.toFixed(2)}
                      {isMultipliable && quantity > 1 && (
                          <span className="text-muted-foreground font-normal text-xs ml-1.5">
                              (R$ {price.toFixed(2)} x {quantity})
                          </span>
                      )}
                  </span>
              )}
            
              {item.quantity && item.unit && (
                  <span className="before:content-['•'] before:mr-2">{item.quantity} {item.unit}(s)</span>
              )}
          </div>
          
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2'>
              {item.supermarket && (
                  <span className='flex items-center gap-1.5'>
                      <Store size={14} /> {item.supermarket}
                  </span>
              )}
              {item.expiryDate && (
                  <span className="flex items-center gap-1.5 before:content-['•'] before:mr-1.5">
                      <CalendarDays size={14} /> {new Date(item.expiryDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                  </span>
              )}
              {item.isRecurring && (
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium before:content-['•'] before:mr-1.5">
                      <Repeat size={14} /> Recorrente
                  </span>
              )}
          </div>

        </div>

        <div className='flex items-center gap-1 flex-shrink-0'>
          {item.category && (
            <Badge variant="outline" className={`hidden md:flex items-center gap-1.5 ${categoryColor}`}>
              <CategoryIcon className="h-3.5 w-3.5" />
              {item.category}
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:h-9" onClick={() => onEdit(item.id)}>
            <Edit2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <AddToPantryDialog
        item={item}
        isOpen={isPantryDialogOpen}
        onClose={() => setPantryDialogOpen(false)}
        onConfirm={handleConfirmPantry}
      />
    </>
  );
};

export default ListItem;
