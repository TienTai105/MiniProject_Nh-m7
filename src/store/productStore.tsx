import { create } from 'zustand';

type ProductStore = {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
};

export const useProductStore = create<ProductStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (q: string) => set({ searchQuery: q }),
}));
