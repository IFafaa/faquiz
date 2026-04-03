import { create } from 'zustand'

/** Estado do React Flow — preenchido na fase do builder. */
interface BuilderState {
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
}

export const useBuilderStore = create<BuilderState>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}))
