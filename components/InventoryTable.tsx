
import React from 'react';
import { MachinePart } from '../types.ts';
import { Trash2, Package, ArrowUpRight } from 'lucide-react';

interface Props {
  parts: MachinePart[];
  onDelete: (id: string) => void;
  onExport: () => void;
}

const InventoryTable: React.FC<Props> = ({ parts, onDelete, onExport }) => {
  if (parts.length === 0) {
    return (
      <div className="py-24 text-center border-t border-neutral-100">
        <div className="mx-auto w-12 h-12 flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-neutral-300" />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter italic">Your Inventory is Empty</h3>
        <p className="text-neutral-500 mt-2 max-w-xs mx-auto text-sm">
          Bring your physical tags into the digital ecosystem. Start your first scan above.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic italic-bold">Live Performance Database</h2>
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest mt-1">
            {parts.length} Active Assets Tracked
          </p>
        </div>
        <button 
          onClick={onExport}
          className="flex items-center gap-2 px-8 py-3 bg-white border border-black hover:bg-black hover:text-white transition-all rounded-full font-bold text-xs uppercase tracking-widest group"
        >
          Export Ledger
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border-t border-neutral-100">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">
              <th className="px-2 py-6">Machine Part</th>
              <th className="px-2 py-6">Classification</th>
              <th className="px-2 py-6">Material Component</th>
              <th className="px-2 py-6 text-center">Unit</th>
              <th className="px-2 py-6">Last Synced</th>
              <th className="px-2 py-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {parts.map((part) => (
              <tr key={part.id} className="group transition-colors">
                <td className="px-2 py-6 font-bold text-lg tracking-tight uppercase">{part.name}</td>
                <td className="px-2 py-6 text-neutral-500 text-sm">{part.type}</td>
                <td className="px-2 py-6 text-neutral-500 text-sm">{part.material}</td>
                <td className="px-2 py-6 text-center">
                  <span className="text-xs font-black px-3 py-1 bg-neutral-100 rounded-full">
                    {part.units}
                  </span>
                </td>
                <td className="px-2 py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  {new Date(part.lastUpdated).toLocaleDateString()} @ {new Date(part.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </td>
                <td className="px-2 py-6 text-right">
                  <button 
                    onClick={() => onDelete(part.id)}
                    className="p-2 text-neutral-300 hover:text-black transition-colors"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
