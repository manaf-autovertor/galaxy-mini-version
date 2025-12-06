import { create } from 'zustand';

export const useQueryStore = create((set, get) => ({
  queries: [],
  selectedQuery: null,
  messages: [],
  counts: {
    raised_by_you: { pending: 0, reverted: 0, closed: 0 },
    raised_to_you: { pending: 0, reverted: 0, closed: 0 },
  },
  
  setQueries: (queries) => set({ queries }),
  
  setSelectedQuery: (query) => set({ selectedQuery: query }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    )
  })),
  
  setCounts: (counts) => set({ counts }),
  
  updateQueryStatus: (queryId, status) => set((state) => ({
    queries: state.queries.map(q => 
      q.id === queryId ? { ...q, status } : q
    ),
    selectedQuery: state.selectedQuery?.id === queryId 
      ? { ...state.selectedQuery, status } 
      : state.selectedQuery
  })),
}));
