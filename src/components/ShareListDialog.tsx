import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { ShoppingList } from '@/types/shopping';
import { db } from '@/lib/firebase';
import { X, Link as LinkIcon, UserPlus } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string | null;
}

const ShareListDialog: React.FC<Props> = ({ open, onOpenChange, listId }) => {
  const [input, setInput] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);

  useEffect(() => {
    if (!listId) return;
    const load = async () => {
      const ref = doc(db, 'lists', listId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as ShoppingList;
        setCollaborators(data.sharedWith || data.members || []);
      }
    };
    load();
  }, [listId]);

  const handleAdd = async () => {
    if (!listId || !input.trim()) return;
    try {
      const ref = doc(db, 'lists', listId);
      await updateDoc(ref, { sharedWith: arrayUnion(input.trim()) });
      setCollaborators(prev => Array.from(new Set([...prev, input.trim()])));
      setInput('');
      toast.success('Colaborador adicionado');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao adicionar colaborador');
    }
  };

  const handleRemove = async (id: string) => {
    if (!listId) return;
    try {
      const ref = doc(db, 'lists', listId);
      await updateDoc(ref, { sharedWith: arrayRemove(id) });
      setCollaborators(prev => prev.filter(p => p !== id));
      toast.success('Colaborador removido');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover colaborador');
    }
  };

  const handleCopyLink = async () => {
    if (!listId) return;
    const shareUrl = `${window.location.origin}/lists?list=${listId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado para a área de transferência');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Compartilhar lista</DialogTitle>
        </DialogHeader>
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <Input placeholder='Cole o ID do usuário (UID) ou e-mail' value={input} onChange={e => setInput(e.target.value)} />
            <Button onClick={handleAdd} variant='default'><UserPlus className='mr-2' />Adicionar</Button>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>Colaboradores</p>
              <Button variant='outline' size='sm' onClick={handleCopyLink}><LinkIcon className='mr-2' />Copiar link</Button>
            </div>
            <div className='space-y-1'>
              {collaborators.length === 0 ? (
                <p className='text-sm text-muted-foreground'>Nenhum colaborador adicionado.</p>
              ) : (
                collaborators.map(c => (
                  <div key={c} className='flex items-center justify-between bg-muted/10 rounded p-2'>
                    <span className='truncate'>{c}</span>
                    <div className='flex gap-2 items-center'>
                      <Button size='icon' variant='ghost' onClick={() => navigator.clipboard.writeText(c)} title='Copiar ID'>
                        <LinkIcon className='w-4 h-4' />
                      </Button>
                      <Button size='icon' variant='destructive' onClick={() => handleRemove(c)} title='Remover'>
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className='flex gap-2 justify-end w-full'>
            <Button variant='ghost' onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListDialog;
