import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingList, ShoppingItem } from "@/types/shopping";
import { useState } from "react";
import { toast } from "sonner";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AddSuggestionToListDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  suggestedItem: ShoppingItem | null;
  lists: ShoppingList[];
}

const AddSuggestionToListDialog = ({ isOpen, onOpenChange, suggestedItem, lists }: AddSuggestionToListDialogProps) => {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddItem = async () => {
    if (!selectedListId || !suggestedItem) {
      toast.error("Por favor, selecione uma lista.");
      return;
    }

    setIsSaving(true);
    try {
      const listRef = doc(db, "lists", selectedListId);
      
      // Create a new item object, resetting 'checked' status and adding a new unique id
      const newItem: ShoppingItem = {
        ...suggestedItem,
        id: `item-${Date.now()}`,
        checked: false, 
      };

      await updateDoc(listRef, {
        items: arrayUnion(newItem)
      });

      toast.success(`"${suggestedItem.name}" foi adicionado à sua lista!`)
      onOpenChange(false); // Close dialog on success
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Não foi possível adicionar o item à lista.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when dialog is closed
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setSelectedListId(null);
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar "{suggestedItem?.name}"</DialogTitle>
          <DialogDescription>
            Selecione em qual lista de compras você deseja adicionar este item.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <RadioGroup onValueChange={setSelectedListId}>
                <ScrollArea className="h-48 pr-4">
                    {lists.map(list => (
                        <div key={list.id} className="flex items-center space-x-2 mb-3 p-2 rounded-md hover:bg-muted/50">
                            <RadioGroupItem value={list.id} id={list.id} />
                            <Label htmlFor={list.id} className="flex-1 cursor-pointer">
                                {list.title}
                            </Label>
                        </div>
                    ))}
                </ScrollArea>
            </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleAddItem} disabled={!selectedListId || isSaving}>
            {isSaving ? "Adicionando..." : "Adicionar Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSuggestionToListDialog;
