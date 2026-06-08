"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export interface CompareItem {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  featuredImage?: string;
  category: string;
  overallScore: number;
}

interface CompareState {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const currentItems = get().items;
        
        // Check if item already in tray
        if (currentItems.some(i => i.id === item.id)) {
          toast.info(`${item.name} is already in the comparison tray.`);
          return;
        }
        
        // Check maximum 3 items limit
        if (currentItems.length >= 3) {
          toast.error("Remove one to add another. Maximum 3 items allowed for comparison.");
          return;
        }
        
        set({ items: [...currentItems, item] });
        toast.success(`Added ${item.name} to comparison.`);
      },
      
      removeItem: (id) => {
        const currentItems = get().items;
        const itemToRemove = currentItems.find(i => i.id === id);
        set({ items: currentItems.filter(item => item.id !== id) });
        if (itemToRemove) {
          toast.info(`Removed ${itemToRemove.name} from comparison.`);
        }
      },
      
      clearItems: () => {
        set({ items: [] });
        toast.info("Comparison tray cleared.");
      }
    }),
    {
      name: "compare-tray-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
