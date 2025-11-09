import { Check, Edit } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon } from "@/utils/categoryIcons";

interface ListItemProps {
  item: {
    id: string;
    name: string;
    category?: string;
    quantity?: number;
    unit?: string;
    price?: number;
    checked: boolean;
    supermarket?: string;
    expiryDate?: string;
    isRecurring?: boolean;
  };
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
}

const ListItem = ({ item, onToggle, onEdit }: ListItemProps) => {
  return (
    <div
      className={`glass rounded-2xl p-4 border border-border/50 transition-all duration-300 hover:shadow-md ${item.checked ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggle(item.id)}
          className="w-6 h-6 rounded-full border-2 data-[state=checked]:gradient-success"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold text-foreground ${item.checked ? "line-through" : ""}`}>{item.name}</h3>
            {item.category && (() => {
              const Icon = getCategoryIcon(item.category);
              return <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
            })()}
          </div>
          {item.category && (
            <Badge variant="secondary" className="text-xs mt-1">
              {item.category}
            </Badge>
          )}
          {item.supermarket && <p className="text-xs text-muted-foreground mt-1">Supermercado: {item.supermarket}</p>}
          {item.expiryDate && <p className="text-xs text-muted-foreground">Validade: {new Date(item.expiryDate).toLocaleDateString('pt-BR')}</p>}
          {item.isRecurring && <p className="text-xs text-primary font-medium">🔄 Recorrente</p>}
        </div>

        <div className="text-right flex-shrink-0">
          {/* allowedUnits: unidade, caixa, pacote */}
          <p className="font-semibold">
            {(() => {
              const allowedUnits = ["unidade", "caixa", "pacote"];
              const price = Number(item.price) || 0;
              const quantity = item.quantity ?? 1;
              const unit = item.unit ? String(item.unit).toLowerCase() : "";
              if (allowedUnits.includes(unit)) {
                return `R$ ${(price * quantity).toFixed(2)}`;
              } else {
                return `R$ ${price.toFixed(2)}`;
              }
            })()}
          </p>
          <p className="text-sm text-muted-foreground">
            {item.quantity ?? 1}{item.unit ?? ""} x R$ {item.price !== undefined ? Number(item.price).toFixed(2) : "-"}
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
