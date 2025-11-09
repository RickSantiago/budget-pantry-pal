import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ShoppingItem } from '@/types/shopping';

interface AddToPantryDialogProps {
  item: ShoppingItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string, expiryDate: Date) => void;
}

const AddToPantryDialog = ({ item, isOpen, onClose, onConfirm }: AddToPantryDialogProps) => {
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(new Date());

  const handleConfirm = () => {
    if (expiryDate) {
      onConfirm(item.id, expiryDate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar "{item.name}" à Despensa</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-2 text-sm text-muted-foreground">
            Selecione a data de validade do produto para adicioná-lo à sua despensa.
          </p>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={expiryDate}
              onSelect={setExpiryDate}
              className="rounded-md border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!expiryDate}>
            Adicionar à Despensa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPantryDialog;
