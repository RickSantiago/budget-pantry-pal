import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { ShoppingList } from '@/types/shopping';
import { db } from '@/lib/firebase';
import { X, Link as LinkIcon, UserPlus, Globe, QrCode, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string | null;
}

const ShareListDialog: React.FC<Props> = ({ open, onOpenChange, listId }) => {
  const [input, setInput] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (!listId) return;
    const load = async () => {
      const ref = doc(db, 'lists', listId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as ShoppingList & { isPublic?: boolean };
        setCollaborators(data.sharedWith || data.members || []);
        setIsPublic(data.isPublic || false);
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

        <Tabs defaultValue="public" className="w-full">
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
            <div className="glass rounded-lg p-4 space-y-4 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="public-toggle" className="text-base font-semibold">
                    Acesso Público
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Qualquer pessoa com o link pode visualizar e marcar itens
                  </p>
                </div>
                <Switch
                  id="public-toggle"
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                />
              </div>

              {isPublic && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/shared/${listId}`}
                      readOnly
                      className="glass font-mono text-sm"
                    />
                    <Button onClick={handleCopyPublicLink} variant="default" className="flex-shrink-0">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  </div>

                  <div className="flex items-center justify-center p-6 glass rounded-lg border border-border/50">
                    <div className="text-center space-y-2">
                      <QrCode className="w-32 h-32 mx-auto text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">QR Code em breve</p>
                    </div>
                  </div>

                  <Alert className="glass border-primary/50">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Pessoas com este link podem ver todos os itens e marcar como comprados, mas não podem editar ou deletar.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="collaborators" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Cole o ID do usuário (UID) ou e-mail"
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
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Colaboradores ({collaborators.length})
                  </Label>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collaborators.length === 0 ? (
                    <div className="text-center py-8 glass rounded-lg border border-dashed">
                      <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum colaborador adicionado
                      </p>
                    </div>
                  ) : (
                    collaborators.map((c) => (
                      <div
                        key={c}
                        className="flex items-center justify-between glass rounded-lg p-3 border border-border/50"
                      >
                        <span className="truncate font-mono text-sm">{c}</span>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(c);
                              toast.success('ID copiado');
                            }}
                            title="Copiar ID"
                            className="h-8 w-8"
                          >
                            <LinkIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemove(c)}
                            title="Remover"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
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
