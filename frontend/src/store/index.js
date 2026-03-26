import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/utils/api'

const useStore = create(
  persist(
    (set, get) => ({
      sessionId: null,
      profile: {},
      bmsScore: null,
      firePlan: null,
      taxResult: null,
      chatHistory: [],
      isLoading: false,

      initSession: async () => {
        const existing = get().sessionId
        if (existing) return existing
        try {
          const { data } = await api.post('/session/create', { metadata: {} })
          set({ sessionId: data.session_id })
          return data.session_id
        } catch {
          const localId = crypto.randomUUID()
          set({ sessionId: localId })
          return localId
        }
      },

      setProfile: (profile) => set({ profile }),

      setBmsScore: (score) => set({ bmsScore: score }),

      setFirePlan: (plan) => set({ firePlan: plan }),

      setTaxResult: (result) => set({ taxResult: result }),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),

      updateLastAssistantMessage: (token) =>
        set((state) => {
          const history = [...state.chatHistory]
          const last = history[history.length - 1]
          if (last && last.role === 'assistant') {
            history[history.length - 1] = { ...last, content: last.content + token }
          } else {
            history.push({ role: 'assistant', content: token })
          }
          return { chatHistory: history }
        }),

      clearChat: () => set({ chatHistory: [] }),

      setLoading: (v) => set({ isLoading: v }),

      reset: () =>
        set({
          sessionId: null,
          profile: {},
          bmsScore: null,
          firePlan: null,
          taxResult: null,
          chatHistory: [],
        }),
    }),
    {
      name: 'smartsaathi-store',
      partialState: (state) => ({
        sessionId: state.sessionId,
        profile: state.profile,
        bmsScore: state.bmsScore,
        firePlan: state.firePlan,
        taxResult: state.taxResult,
      }),
    }
  )
)

export default useStore
