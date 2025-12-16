import React, { useState } from 'react';
import { useCreators } from '../services/creatorService';
import { CreatorCard } from '../components/CreatorCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export const Home: React.FC = () => {
  const { creators, loading } = useCreators();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>('All');

  const niches = ['All', ...Array.from(new Set(creators.map(c => c.niche)))];

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (creator.bio && creator.bio.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesNiche = selectedNiche === 'All' || creator.niche === selectedNiche;
    return matchesSearch && matchesNiche;
  });

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-primary-600 to-orange-600 text-white p-8 md:p-14 shadow-2xl shadow-primary-500/10 border border-white/5">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Discover Algeria's <br/>Top UGC Creators
          </h1>
          <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-xl font-light leading-relaxed">
            Connect with authentic talent to create engaging content for your brand. 
            MOWHOOB is the #1 marketplace for local creators.
          </p>
          
          {/* Search Bar */}
          <div className="bg-slate-950/80 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 max-w-lg transition-all focus-within:border-primary-500/50 focus-within:ring-4 focus-within:ring-primary-500/20">
            <Search className="text-slate-400 ml-4" size={20} />
            <input
              type="text"
              placeholder="Search creators, niches, cities..."
              className="flex-grow bg-transparent outline-none text-white placeholder-slate-500 py-3 px-1 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-white text-slate-900 px-7 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg">
              Search
            </button>
          </div>
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold whitespace-nowrap mr-2">
            <SlidersHorizontal size={16} /> Filters:
        </div>
        {niches.map(niche => (
          <button
            key={niche}
            onClick={() => setSelectedNiche(niche)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              selectedNiche === niche 
                ? 'bg-slate-100 text-slate-950 border-white shadow-lg shadow-white/10' 
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white hover:bg-slate-800'
            }`}
          >
            {niche}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading talent...</div>
      ) : filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCreators.map(creator => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-500 text-lg">No creators found matching your criteria.</p>
            <button 
                onClick={() => {setSearchTerm(''); setSelectedNiche('All');}}
                className="mt-4 text-primary-500 font-semibold hover:text-primary-400 transition-colors"
            >
                Clear Filters
            </button>
        </div>
      )}
    </div>
  );
};
