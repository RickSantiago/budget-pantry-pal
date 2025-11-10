import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast("App pronto para funcionar offline.");
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      const toastId = toast("Nova versão disponível!", {
        action: (
          <Button
            size="sm"
            onClick={() => updateServiceWorker(true)}
          >
            Recarregar
          </Button>
        ),
        duration: Infinity, // Mantém o toast visível até ser dispensado
      });

      // Função para dispensar o toast quando o componente for desmontado
      return () => toast.dismiss(toastId);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}

export default ReloadPrompt;
