import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ShoppingList } from '@/types/shopping';
import { db } from '@/lib/firebase';
import { X, Link as LinkIcon, UserPlus, Globe, QrCode, Info, User, Crown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string | null;
}

const ShareListDialog: React.FC<Props> = ({ open, onOpenChange, listId }) => {
  const [input, setInput] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    if (!listId) return;

    const loadListAndOwner = async () => {
      const listRef = doc(db, 'lists', listId);
      const listSnap = await getDoc(listRef);

      if (listSnap.exists()) {
        const listData = listSnap.data() as ShoppingList;
        setCollaborators(listData.sharedWith || []);
        setIsPublic(listData.isPublic || false);

        if (listData.ownerId) {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', listData.ownerId));
          const userSnap = await getDocs(q);
          if (!userSnap.empty) {
            const user = userSnap.docs[0].data();
            setOwnerEmail(user.email);
          }
        }
      }
    };
    loadListAndOwner();
  }, [listId, open]); // Reload when dialog opens

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

  const handleRemove = async (collaboratorEmail: string) => {
    if (!listId) return;
    try {
      const ref = doc(db, 'lists', listId);
      await updateDoc(ref, { sharedWith: arrayRemove(collaboratorEmail) });
      setCollaborators(prev => prev.filter(c => c !== collaboratorEmail));
      toast.success('Colaborador removido');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover colaborador');
    }
  };

  const handleCopyPublicLink = async () => {
    if (!listId) return;
    const shareUrl = `${window.location.origin}/shared/${listId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link público copiado');
  };

  const handleTogglePublic = async () => {
    if (!listId) return;
    try {
      const ref = doc(db, 'lists', listId);
      await updateDoc(ref, { isPublic: !isPublic });
      setIsPublic(!isPublic);
      toast.success(isPublic ? 'Lista agora é privada' : 'Lista agora é pública');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao atualizar visibilidade');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Compartilhar lista</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="collaborators" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="public" className="gap-2">
              <Globe className="w-4 h-4" />
              Link Público
            </TabsTrigger>
            <TabsTrigger value="collaborators" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Colaboradores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-4 mt-4">
            {/* Public sharing content remains the same */}
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Adicione o e-mail do colaborador"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="glass"
                />
                <Button onClick={handleAdd} variant="default" className="flex-shrink-0">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Acesso à lista
                </Label>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {ownerEmail && (
                    <div className="flex items-center justify-between glass rounded-lg p-3 border border-border/50">
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'><AvatarFallback><User className='w-4 h-4' /></AvatarFallback></Avatar>
                        <div className='flex flex-col'>
                          <span className="truncate text-sm font-medium">{ownerEmail}</span>
                          <span className="truncate text-xs text-muted-foreground">Proprietário</span>
                        </div>
                      </div>
                      <Crown className='w-5 h-5 text-primary' />
                    </div>
                  )}

                  {collaborators.map((c) => (
                    <div key={c} className="flex items-center justify-between glass rounded-lg p-3 border border-border/50">
                      <div className='flex items-center gap-3'>
                         <Avatar className='h-8 w-8'><AvatarFallback><User className='w-4 h-4' /></AvatarFallback></Avatar>
                        <div className='flex flex-col'>
                          <span className="truncate text-sm">{c}</span>
                          <span className="truncate text-xs text-muted-foreground">Editor</span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => handleRemove(c)} title="Remover" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListDialog;
