import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-50 selection:bg-primary-500 selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                M
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-primary-400 transition-colors">MOWHOOB</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-1">
              <Link 
                to="/" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/') ? 'text-primary-400 bg-primary-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <LayoutGrid size={18} />
                Marketplace
              </Link>
              <Link 
                to="/admin" 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/admin') ? 'text-primary-400 bg-primary-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Users size={18} />
                Manage Creators
              </Link>
            </div>

            {/* Mobile Menu Button (Placeholder) */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-primary-500 transition-colors">
                <Search size={20} />
              </button>
              <Link to="/admin" className="md:hidden p-2 text-slate-400 hover:text-primary-500 transition-colors">
                <Users size={20} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 mt-auto bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} MOWHOOB. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
