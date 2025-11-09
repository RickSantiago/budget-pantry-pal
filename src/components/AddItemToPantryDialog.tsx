import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PantryItem } from '@/types/shopping';

const pantryItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  quantity: z.number().min(1, "Quantidade deve ser maior que 0"),
  unit: z.string().min(1, "Unidade é obrigatória"),
  expiryDate: z.date({ required_error: "Data de validade é obrigatória" }),
});

interface AddItemToPantryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: Omit<PantryItem, 'id' | 'ownerId' | 'purchaseDate'>) => void;
}

const AddItemToPantryDialog = ({ isOpen, onClose, onConfirm }: AddItemToPantryDialogProps) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(pantryItemSchema),
  });

  const onSubmit = (data: any) => {
    onConfirm(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Item à Despensa</DialogTitle>
        </DialogHeader>
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
            <Button type="submit">Adicionar Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemToPantryDialog;
