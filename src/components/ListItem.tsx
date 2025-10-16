import { Check, Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ListItemProps {
  item: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    price: number;
    checked: boolean;
  };
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
}

const ListItem = ({ item, onToggle, onEdit }: ListItemProps) => {
  return (
    <div
      className={`glass rounded-2xl p-4 border border-border/50 transition-all duration-300 hover:shadow-md ${
        item.checked ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggle(item.id)}
          className="w-6 h-6 rounded-full border-2 data-[state=checked]:gradient-success"
        />
        
        <div className="flex-1">
          <h3 className={`font-semibold ${item.checked ? "line-through" : ""}`}>
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-semibold">
            R$ {(item.price * item.quantity).toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.quantity}{item.unit} x R$ {item.price.toFixed(2)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item.id)}
          className="flex-shrink-0 rounded-full h-9 w-9 hover:bg-primary/10"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ListItem;
