import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateList: (list: { title: string; observation: string; date: string; plannedBudget?: number }) => void;
}

const CreateListDialog = ({ open, onOpenChange, onCreateList }: CreateListDialogProps) => {
  const [title, setTitle] = useState("");
  const [observation, setObservation] = useState("");
  const [plannedBudget, setPlannedBudget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Digite um título para a lista");
      return;
    }

    onCreateList({
      title: title.trim(),
      observation: observation.trim(),
      date: new Date().toISOString(),
      plannedBudget: plannedBudget ? parseFloat(plannedBudget) : undefined,
    });

    setTitle("");
    setObservation("");
    setPlannedBudget("");
    toast.success("Lista criada com sucesso!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/50 shadow-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nova Lista</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Lista</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lista Dezembro/2025"
              className="glass border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observation">Observação (opcional)</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Adicione uma observação..."
              className="glass border-border/50 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedBudget">Gasto Planejado (R$)</Label>
            <Input
              id="plannedBudget"
              type="number"
              step="0.01"
              min="0"
              value={plannedBudget}
              onChange={(e) => setPlannedBudget(e.target.value)}
              placeholder="0.00"
              className="glass border-border/50"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full gradient-primary border-none shadow-glow hover:shadow-lg transition-all duration-300"
          >
            Criar Lista
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
