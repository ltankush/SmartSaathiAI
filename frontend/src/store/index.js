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
<<<<<<< HEAD
=======
      language: 'en',
      goals: [],
      spendingResult: null,
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)

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
<<<<<<< HEAD

      setBmsScore: (score) => set({ bmsScore: score }),

      setFirePlan: (plan) => set({ firePlan: plan }),

      setTaxResult: (result) => set({ taxResult: result }),
=======
      setBmsScore: (score) => set({ bmsScore: score }),
      setFirePlan: (plan) => set({ firePlan: plan }),
      setTaxResult: (result) => set({ taxResult: result }),
      setLanguage: (lang) => set({ language: lang }),
      setGoals: (goals) => set({ goals }),
      setSpendingResult: (result) => set({ spendingResult: result }),
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)

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
<<<<<<< HEAD

=======
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
      setLoading: (v) => set({ isLoading: v }),

      reset: () =>
        set({
          sessionId: null,
          profile: {},
          bmsScore: null,
          firePlan: null,
          taxResult: null,
          chatHistory: [],
<<<<<<< HEAD
=======
          goals: [],
          spendingResult: null,
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
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
<<<<<<< HEAD
=======
        language: state.language,
>>>>>>> 1b68d14 (feat: v2.0 — Agentic AI, PDF reports, goal planner, spending analyzer, 3D animations, multi-language, hackathon-ready)
      }),
    }
  )
)

export default useStore
