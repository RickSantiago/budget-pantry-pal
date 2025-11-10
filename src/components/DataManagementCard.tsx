import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, FileDown, ShieldX } from 'lucide-react';

interface DataManagementCardProps {
  onExport: () => void;
  onDelete: () => void;
}

const DataManagementCard = ({ onExport, onDelete }: DataManagementCardProps) => {
  return (
    <Card className="glass border-border/50 p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Database className="w-5 h-5 mr-2 text-gray-500" />
        Gerenciamento de Dados
      </h2>
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Você tem o controle sobre os seus dados. Exporte suas informações ou exclua sua conta permanentemente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
           <Button variant="outline" className="w-full glass" onClick={onExport}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar Meus Dados
          </Button>
          <Button variant="destructive" className="w-full" onClick={onDelete}>
            <ShieldX className="w-4 h-4 mr-2" />
            Excluir Minha Conta
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DataManagementCard;
