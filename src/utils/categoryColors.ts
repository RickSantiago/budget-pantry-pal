
export const getCategoryColor = (category: string | undefined): string => {
  if (!category) return 'bg-gray-200 text-gray-800'; // Cor padrão

  const colors: { [key: string]: string } = {
    "Grãos e Cereais": "bg-amber-200 text-amber-800",
    "Carnes": "bg-red-300 text-red-800",
    "Hortifrúti": "bg-green-300 text-green-800",
    "Laticínios": "bg-blue-200 text-blue-800",
    "Padaria e Massas": "bg-orange-300 text-orange-800",
    "Bebidas": "bg-sky-300 text-sky-800",
    "Doces e Snacks": "bg-pink-300 text-pink-800",
    "Congelados": "bg-cyan-200 text-cyan-800",
    "Molhos e Condimentos": "bg-lime-300 text-lime-800",
    "Limpeza": "bg-teal-200 text-teal-800",
    "Higiene": "bg-indigo-200 text-indigo-800",
    "Frios": "bg-blue-300 text-blue-900",
    "Oleos e Gorduras": "bg-yellow-200 text-yellow-800",
    "Outros": "bg-slate-300 text-slate-800",
  };

  return colors[category] || 'bg-gray-200 text-gray-800';
};
