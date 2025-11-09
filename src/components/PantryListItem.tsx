import { PantryItem } from '@/types/shopping';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, CheckCircle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface PantryListItemProps {
  item: PantryItem;
  onConsume: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PantryListItem = ({ item, onConsume, onEdit, onDelete }: PantryListItemProps) => {
  const daysUntilExpiry = differenceInDays(parseISO(item.expiryDate), new Date());

  const getExpiryColor = () => {
    if (daysUntilExpiry < 0) return 'text-red-500 font-bold'; // Vencido
    if (daysUntilExpiry <= 7) return 'text-yellow-500'; // Vence em breve
    return 'text-green-500'; // Longe de vencer
  };

  const expiryText = () => {
    if (daysUntilExpiry < 0) return `Vencido há ${Math.abs(daysUntilExpiry)} dia(s)`;
    if (daysUntilExpiry === 0) return 'Vence hoje';
    return `Vence em ${daysUntilExpiry} dia(s)`;
  };

  return (
    <Card className="p-4 flex justify-between items-center">
      <div>
        <p className="font-semibold">{item.name}</p>
        <p className={`text-sm ${getExpiryColor()}`}>{expiryText()}</p>
        <p className="text-xs text-muted-foreground">
          Comprado em: {new Date(item.purchaseDate).toLocaleDateString('pt-BR')}
        </p>
        {item.quantity && item.unit && (
          <p className="text-xs text-muted-foreground">Quantidade: {item.quantity} {item.unit}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="outline" onClick={() => onConsume(item.id)}>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => onEdit(item.id)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="destructive" onClick={() => onDelete(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default PantryListItem;
