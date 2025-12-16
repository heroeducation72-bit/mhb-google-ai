import { Creator, CreatorFormData } from '../types';
import { INITIAL_CREATORS } from '../constants';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mowhoob_creators';

export const useCreators = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async loading
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setCreators(JSON.parse(stored));
        } else {
          setCreators(INITIAL_CREATORS);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CREATORS));
        }
      } catch (e) {
        console.error("Failed to load creators", e);
        setCreators(INITIAL_CREATORS);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const saveCreators = (newCreators: Creator[]) => {
    setCreators(newCreators);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCreators));
  };

  const addCreator = (data: CreatorFormData) => {
    const newCreator: Creator = {
      ...data,
      id: crypto.randomUUID(),
      voice_sample_url: data.voice_sample_url || null,
      created_at: new Date().toISOString(),
      video_thumbnails: {},
    };
    saveCreators([newCreator, ...creators]);
  };

  const updateCreator = (id: string, data: Partial<Creator>) => {
    const updatedCreators = creators.map(c => 
      c.id === id ? { ...c, ...data } : c
    );
    saveCreators(updatedCreators);
  };

  const deleteCreator = (id: string) => {
    const filtered = creators.filter(c => c.id !== id);
    saveCreators(filtered);
  };

  return {
    creators,
    loading,
    addCreator,
    updateCreator,
    deleteCreator
  };
};
