import React from 'react';
import { Table } from '../types';
import { Grid, Utensils, Clock } from 'lucide-react';

interface TableGridProps {
  tables: Table[];
  onTableSelect: (tableId: number) => void;
  onParcelSelect: () => void;
}

export function TableGrid({ tables, onTableSelect }: TableGridProps) {
  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'free':
        return <Grid className="w-6 h-6 text-green-500" />;
      case 'occupied':
        return <Utensils className="w-6 h-6 text-blue-500" />;
      case 'order-in-progress':
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dining Tables</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => onTableSelect(table.id)}
            className={`p-6 rounded-lg shadow-md transition-all ${
              table.status === 'free'
                ? 'bg-green-50 hover:bg-green-100'
                : table.status === 'occupied'
                ? 'bg-blue-50 hover:bg-blue-100'
                : 'bg-yellow-50 hover:bg-yellow-100'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              {getStatusIcon(table.status)}
              <span className="text-lg font-semibold">Table {table.id}</span>
              <span className="text-sm text-gray-600 capitalize">{table.status.replace('-', ' ')}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}