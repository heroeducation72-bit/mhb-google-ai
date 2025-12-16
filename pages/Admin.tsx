import React, { useState } from 'react';
import { useCreators } from '../services/creatorService';
import { CreatorFormModal } from '../components/CreatorFormModal';
import { Plus, Edit2, Trash2, Search, Mic } from 'lucide-react';
import { Creator, CreatorFormData } from '../types';

export const Admin: React.FC = () => {
  const { creators, addCreator, updateCreator, deleteCreator } = useCreators();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCreator, setEditingCreator] = useState<Creator | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (creator: Creator) => {
    setEditingCreator(creator);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this creator?')) {
      deleteCreator(id);
    }
  };

  const handleAddNew = () => {
    setEditingCreator(undefined);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: CreatorFormData) => {
    if (editingCreator) {
      updateCreator(editingCreator.id, data);
    } else {
      addCreator(data);
    }
  };

  const filteredCreators = creators.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Creators</h1>
          <p className="text-slate-400 text-sm mt-2">Total Creators: {creators.length}</p>
        </div>
        
        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-0.5 hover:shadow-primary-500/40"
        >
          <Plus size={20} />
          Add Creator
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center gap-4">
           <div className="relative flex-grow max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
                type="text" 
                placeholder="Search by name..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent text-sm placeholder-slate-600 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 font-medium border-b border-slate-800">
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Niche</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Platforms</th>
                <th className="px-6 py-4 text-center">Sound</th>
                <th className="px-6 py-4 text-center">Verified</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredCreators.map((creator) => (
                <tr key={creator.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                        {creator.avatar_url ? (
                            <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-primary-500 font-bold">
                                {creator.name.charAt(0)}
                            </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{creator.name}</div>
                        {creator.alias && <div className="text-xs text-slate-500">@{creator.alias}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                        {creator.niche}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {creator.city}, {creator.country}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                        {creator.platforms.map((p, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm" title={`${p.platform}: ${p.followers}`}>
                                {p.platform.charAt(0)}
                            </div>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {creator.voice_sample_url ? (
                         <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-primary-500" title="Has Sound Sample">
                             <Mic size={14} />
                         </div>
                    ) : (
                        <span className="text-slate-700">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {creator.is_verified ? (
                        <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                    ) : (
                        <span className="inline-block w-2.5 h-2.5 bg-slate-700 rounded-full"></span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(creator)}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(creator.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredCreators.length === 0 && (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                        No creators found.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreatorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCreator}
      />
    </div>
  );
};
