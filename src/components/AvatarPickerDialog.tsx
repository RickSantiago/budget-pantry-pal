import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AvatarPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarSelect: (seed: string) => void; // A função agora espera a string da 'seed'
}

export const avatarSeeds = [
    'Peanut', 'Leo', 'Gizmo', 'Muffin', 'Charlie', 'Cleo', 'Milo', 'Loki',
    'Zoe', 'Smokey', 'Angel', 'Tigger', 'Oreo', 'Cookie', 'Shadow', 'Tiger', 
    'Coco', 'Max', 'Lucy', 'Simba', 'Bella', 'Rocky', 'Luna', 'Lucky',
];

const AvatarPickerDialog = ({ open, onOpenChange, onAvatarSelect }: AvatarPickerDialogProps) => {

  const avatars = useMemo(() => {
    return avatarSeeds.map(seed => {
      const avatarSvg = createAvatar(adventurer, {
        seed: seed,
        size: 96,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf']
      }).toString();
      const svgDataUri = `data:image/svg+xml,${encodeURIComponent(avatarSvg)}`;
      return { seed, url: svgDataUri };
    });
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl glass border-border/50">
        <DialogHeader>
          <DialogTitle>Escolha seu Avatar</DialogTitle>
          <DialogDescription>Selecione um dos avatares abaixo para usar no seu perfil.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {avatars.map(({ seed, url }) => (
            <button
              key={seed}
              className="p-2 rounded-full border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-all duration-200"
              onClick={() => {
                // CORREÇÃO: Passando a 'seed' em vez da URL completa
                onAvatarSelect(seed);
                onOpenChange(false);
              }}
            >
              <img src={url} alt={`Avatar de ${seed}`} className="rounded-full w-full h-full" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AvatarPickerDialog;
