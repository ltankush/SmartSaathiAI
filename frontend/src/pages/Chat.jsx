import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Loader2, MessageCircle, Trash2, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import PageWrapper from '@/components/PageWrapper'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { streamChat } from '@/utils/api'
import useStore from '@/store'

const STARTERS = [
  'Mujhe apna pehla SIP kahan se start karna chahiye?',
  'Old vs New tax regime — kaunsa better hai mere liye?',
  'Emergency fund kitna hona chahiye?',
  'NPS vs PPF — difference kya hai?',
  'Term insurance kaise choose karein?',
]

function ChatBubble({ message, isStreaming }) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${
        isUser
          ? 'bg-brand-500/20 border border-brand-500/30'
          : 'bg-[#21262d] border border-white/5'
      }`}>
        {isUser
          ? <User size={14} className="text-brand-400" />
          : <Bot size={14} className="text-[#8b949e]" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-500/15 border border-brand-500/20 text-[#e6edf3] rounded-tr-md'
            : 'bg-[#0d1117] border border-white/5 rounded-tl-md'
        }`}>
          {isUser ? (
            <p className="text-sm">{message.content}</p>
          ) : (
            <div className={`prose-chat ${isStreaming ? 'typing-cursor' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content || ''}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Chat() {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatHistory = useStore((s) => s.chatHistory)
  const addChatMessage = useStore((s) => s.addChatMessage)
  const updateLastAssistantMessage = useStore((s) => s.updateLastAssistantMessage)
  const clearChat = useStore((s) => s.clearChat)
  const profile = useStore((s) => s.profile)
  const bmsScore = useStore((s) => s.bmsScore)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const voice = useVoiceRecorder()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isStreaming])

  useEffect(() => {
    if (voice.transcript) {
      setInput(voice.transcript)
      voice.clear()
    }
  }, [voice.transcript])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || isStreaming) return
    setInput('')
    addChatMessage({ role: 'user', content: msg })
    setIsStreaming(true)

    const context = {}
    if (bmsScore) context.bms_score = bmsScore
    if (profile?.age) context.age = profile.age

    await streamChat(
      [...chatHistory, { role: 'user', content: msg }],
      context,
      (token) => updateLastAssistantMessage(token),
      () => setIsStreaming(false),
      (err) => {
        updateLastAssistantMessage(`\n\n*Error: ${err}. Please try again.*`)
        setIsStreaming(false)
      }
    )
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const toggleVoice = () => {
    if (voice.isRecording) voice.stop()
    else voice.start()
  }

  return (
    <PageWrapper className="flex flex-col">
      <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto w-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <MessageCircle size={17} className="text-brand-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">SmartSaathi AI</h1>
              <p className="text-xs text-[#484f58]">India's AI money mentor · Hinglish supported</p>
            </div>
          </div>
          {chatHistory.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-[#484f58] hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5"
            >
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5 scrollbar-thin">
          {chatHistory.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-6 py-12"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center shadow-glow-green">
                <Bot size={28} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white mb-1">Namaste! Main SmartSaathi hoon</h2>
                <p className="text-sm text-[#8b949e] max-w-sm">
                  Ask me anything about your finances — in English, Hindi, or Hinglish. Voice input bhi supported hai!
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs px-4 py-3 rounded-xl bg-[#0d1117] border border-white/5 text-[#8b949e] hover:text-white hover:border-brand-500/30 hover:bg-brand-500/5 transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {chatHistory.map((msg, i) => (
              <ChatBubble
                key={i}
                message={msg}
                isStreaming={isStreaming && i === chatHistory.length - 1 && msg.role === 'assistant'}
              />
            ))}
          </AnimatePresence>

          {isStreaming && chatHistory[chatHistory.length - 1]?.role === 'user' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#21262d] border border-white/5 flex items-center justify-center">
                <Bot size={14} className="text-[#8b949e]" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-[#0d1117] border border-white/5">
                <div className="flex gap-1.5 items-center h-5">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-brand-500"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Voice error */}
        {voice.error && (
          <p className="text-xs text-red-400 text-center mb-2">{voice.error}</p>
        )}

        {/* Input bar */}
        <div className="pb-4">
          <div className="flex gap-2 items-end p-2 rounded-2xl bg-[#0d1117] border border-white/8 focus-within:border-brand-500/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Kuch bhi poochho... (Press Enter to send)"
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm text-[#e6edf3] placeholder-[#484f58] outline-none resize-none px-2 py-2 max-h-32 leading-relaxed disabled:opacity-50"
              style={{ minHeight: 40 }}
            />

            {/* Voice button */}
            <button
              onClick={toggleVoice}
              disabled={voice.isTranscribing}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                voice.isRecording
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse'
                  : 'bg-[#21262d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
              }`}
              title={voice.isRecording ? 'Stop recording' : 'Voice input'}
            >
              {voice.isTranscribing
                ? <Loader2 size={15} className="animate-spin" />
                : voice.isRecording
                  ? <MicOff size={15} />
                  : <Mic size={15} />
              }
            </button>

            {/* Send button */}
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: input.trim() && !isStreaming ? 'linear-gradient(135deg,#13b88e,#0a9374)' : '#21262d' }}
            >
              {isStreaming
                ? <Loader2 size={15} className="animate-spin text-white" />
                : <Send size={15} className="text-white" />
              }
            </button>
          </div>
          <p className="text-center text-xs text-[#2d333b] mt-2">
            Investments mein risk hota hai · Always consult a SEBI-registered advisor
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}
