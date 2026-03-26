import { useState, useRef, useCallback } from 'react'
import api from '@/utils/api'

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const start = useCallback(async () => {
    setError(null)
    setTranscript('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        setIsTranscribing(true)
        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const form = new FormData()
          form.append('audio', blob, 'recording.webm')
          const { data } = await api.post('/voice/stt', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          setTranscript(data.transcript || '')
        } catch (e) {
          setError('Could not transcribe. Try typing instead.')
        } finally {
          setIsTranscribing(false)
        }
      }
      mediaRef.current = mr
      mr.start()
      setIsRecording(true)
    } catch {
      setError('Microphone access denied. Please allow mic access.')
    }
  }, [])

  const stop = useCallback(() => {
    mediaRef.current?.stop()
  }, [])

  const clear = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return { isRecording, isTranscribing, transcript, error, start, stop, clear }
}
