import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PantryItem } from '@/types/shopping';
import { parseISO } from 'date-fns';

const pantryItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  quantity: z.number().min(0, "Quantidade não pode ser negativa"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  expiryDate: z.date({ required_error: "Data de validade é obrigatória" }),
});

interface EditPantryItemDialogProps {
  item: PantryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string, itemData: Partial<PantryItem>) => void;
}

const EditPantryItemDialog = ({ item, isOpen, onClose, onConfirm }: EditPantryItemDialogProps) => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pantryItemSchema),
  });

  useEffect(() => {
    if (item) {
      reset({
        ...item,
        expiryDate: parseISO(item.expiryDate),
      });
    }
  }, [item, reset]);

  const onSubmit = (data: any) => {
    if (!item) return;
    onConfirm(item.id, data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Item da Despensa</DialogTitle>
        </DialogHeader>
        {item && (
          <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
            <div>
              <Input {...register('name')} placeholder="Nome do item" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input type="number" {...register('quantity', { valueAsNumber: true })} placeholder="Quantidade" />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message as string}</p>}
              </div>
              <div>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade(s)</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message as string}</p>}
              </div>
            </div>
            <div className="flex flex-col">
              <p className="mb-2 text-sm text-muted-foreground">Data de Validade</p>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      className="rounded-md border self-center"
                  />
                )}
              />
              {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate.message as string}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPantryItemDialog;
