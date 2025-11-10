import { ShoppingItem } from '@/types/shopping';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit2, Store, CalendarDays, Repeat, Trash2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { getCategoryStyle } from '@/utils/categoryMetadata';

interface ListItemProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void; // Added onDelete prop
}

const ListItem = ({ item, onToggle, onEdit, onDelete }: ListItemProps) => {

  const handleCheckboxChange = () => {
    onToggle(item.id);
  };

  const categoryStyle = item.category ? getCategoryStyle(item.category) : null;
  const CategoryIcon = categoryStyle?.icon;

  const price = Number(item.price) || 0;
  const quantity = Number(item.quantity) || 1;
  const unit = (item.unit || '').toLowerCase();
  const isMultipliable = ['unidade', 'caixa', 'pacote', 'un', 'cx', 'pct'].includes(unit);
  const totalPrice = isMultipliable ? price * quantity : price;

  return (
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

        {categoryStyle && CategoryIcon && (
          <div className='mt-1.5'>
            <Badge 
              variant="outline"
              className={`py-0.5 px-1.5 font-normal border-current h-fit ${categoryStyle.color}`}>
                <CategoryIcon size={12} className="mr-1.5" />
                {item.category}
            </Badge>
          </div>
        )}

        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-2'>
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
        
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground mt-2'>
            {item.supermarket && (
                <span className='flex items-center gap-1.5'>
                    <Store size={14} /> {item.supermarket}
                </span>
            )}
            {item.expiryDate && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} /> {new Date(item.expiryDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                </span>
            )}
            {item.isRecurring && (
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                    <Repeat size={14} /> Recorrente
                </span>
            )}
        </div>

      </div>

      <div className='flex items-center gap-1 flex-shrink-0'>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:h-9" onClick={() => onEdit(item.id)}>
          <Edit2 className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:h-9" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default ListItem;
