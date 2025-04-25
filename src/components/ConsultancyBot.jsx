"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { Send, Bot, User, Clock, Calendar, Download, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import jsPDF from "jspdf"
import { useTranslation } from "../context/TranslationContext"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import axios from "axios"
import { getGeminiResponse } from "../api/ConsultantModel"

const ChatBot = () => {
  const { translations, language, isLoading } = useTranslation()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const messagesEndRef = useRef(null)
  const chatBoxRef = useRef(null)
  const speechSynthRef = useRef(window.speechSynthesis)

  // Speech recognition
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel()
      }
    }
  }, [])

  // Handle microphone toggle
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening()
    } else {
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true, language: language === "ta" ? "ta-IN" : "en-US" })
      toast.info("Listening...", { autoClose: 2000 })
    }
  }

  // Replace the existing speakMessage function with this Google TTS implementation
  const speakMessage = async (text, messageId) => {
    // Cancel any ongoing speech
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel()
    }

    // If we're already speaking this message, stop it
    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null)
      return
    }

    // Set the speaking message ID to show the active state
    setSpeakingMessageId(messageId)

    try {
      // Determine language based on user selection
      const languageCode = language === "ta" ? "ta-IN" : "en-US"
      const voiceName = language === "ta" ? "ta-IN-Standard-A" : "en-US-Standard-C"

      const response = await axios.post(
        "https://texttospeech.googleapis.com/v1/text:synthesize?key=AIzaSyBU_VSOvAgHm6QgDPysqp2CxwGC8woPJ3o",
        {
          input: { text },
          voice: {
            languageCode,
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        },
      )

      const audioContent = response.data.audioContent
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`)

      // Add event listeners
      audio.onended = () => {
        setSpeakingMessageId(null)
      }

      audio.onerror = () => {
        setSpeakingMessageId(null)
        toast.error("Speech synthesis failed", { autoClose: 3000 })
      }

      // Play the audio
      await audio.play()
    } catch (error) {
      console.error("Google TTS Error:", error.response?.data || error.message)
      setSpeakingMessageId(null)
      toast.error("Failed to speak the text", { autoClose: 3000 })
    }
  }

  // Process the bot response to detect appointment confirmation
  const processResponse = (text) => {
    // Check if the response contains appointment confirmation
    if (
      (text.includes("appointment") && text.includes("confirmed")) ||
      (text.includes("appointment") && text.includes("ID is"))
    ) {
      // Extract doctor name
      const doctorMatch = text.match(/Dr\.\s([A-Za-z\s]+)/)
      const doctorName = doctorMatch ? doctorMatch[0] : "Doctor"

      // Extract date and time if present
      const dateMatch = text.match(/(\d{1,2}(st|nd|rd|th)?\s[A-Za-z]+|\d{1,2}\/\d{1,2}\/\d{4})/)
      const timeMatch = text.match(/(\d{1,2}:\d{2}\s?(AM|PM))/i)

      // Extract patient name - improved pattern matching
      const nameMatch = text.match(/for\s([A-Za-z\s]+)\son/) || text.match(/for\s([A-Za-z\s]+)\sat/)
      const patientName = nameMatch ? nameMatch[1].trim() : "Patient"

      // Create appointment data
      const newAppointmentData = {
        doctor: doctorName,
        date: dateMatch ? dateMatch[0] : "Scheduled Date",
        time: timeMatch ? timeMatch[0] : "Scheduled Time",
        patientName: patientName,
        hospitalName: "HealthBridge Hospital",
        address: "2nd Cross Road, Midtown",
        appointmentId: text.match(/ID is ([A-Z0-9-]+)/)
          ? text.match(/ID is ([A-Z0-9-]+)/)[1]
          : `HB-${Math.floor(100000 + Math.random() * 900000)}`,
      }

      setAppointmentData(newAppointmentData)
      setShowAppointmentModal(true)
    }

    return text
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { type: "user", text: input, timestamp: new Date() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)

    // Show toast notification
    toast.info("Sage is thinking...", { autoClose: 2000 })

    try {
      // Simulate a realistic typing delay (min 1 second, max based on message length)
      const typingDelay = Math.max(1000, Math.min(input.length * 50, 3000))

      setTimeout(async () => {
        // Pass the current language to the Gemini API
        const botReply = await getGeminiResponse(input, language)
        setIsTyping(false)

        // Process the response to check for appointment confirmation
        const processedReply = processResponse(botReply)

        const messageId = Date.now().toString()
        setMessages([...newMessages, { id: messageId, type: "bot", text: processedReply, timestamp: new Date() }])

        // Success notification
        toast.success("Sage responded!", { autoClose: 2000 })
      }, typingDelay)
    } catch (error) {
      setIsTyping(false)
      toast.error("Failed to get response", { autoClose: 3000 })
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Generate and download appointment PDF
  const downloadAppointmentPDF = () => {
    if (!appointmentData) return

    const doc = new jsPDF()

    // Add hospital logo (simulated)
    doc.setFillColor(106, 61, 232) // Primary color
    doc.rect(0, 0, 210, 20, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text("HealthBridge Hospital", 105, 12, { align: "center" })

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Add appointment details
    doc.setFontSize(22)
    doc.text("Appointment Confirmation", 105, 40, { align: "center" })

    doc.setFontSize(12)
    doc.text(`Appointment ID: ${appointmentData.appointmentId}`, 20, 60)
    doc.text(`Patient Name: ${appointmentData.patientName}`, 20, 70)
    doc.text(`Doctor: ${appointmentData.doctor}`, 20, 80)
    doc.text(`Date: ${appointmentData.date}`, 20, 90)
    doc.text(`Time: ${appointmentData.time}`, 20, 100)

    // Hospital details
    doc.setFontSize(10)
    doc.text(`${appointmentData.hospitalName}`, 20, 120)
    doc.text(`${appointmentData.address}`, 20, 130)
    doc.text("Phone: (555) 123-4567", 20, 140)

    // Instructions
    doc.setFontSize(11)
    doc.text("Important Instructions:", 20, 160)
    doc.setFontSize(10)
    doc.text("1. Please arrive 15 minutes before your scheduled appointment time.", 25, 170)
    doc.text("2. Bring your ID and insurance information.", 25, 180)
    doc.text("3. If you need to cancel, please do so at least 24 hours in advance.", 25, 190)

    // Footer
    doc.setFontSize(8)
    doc.text("This is an electronically generated document and requires no signature.", 105, 270, { align: "center" })

    // Save the PDF
    doc.save(`HealthBridge_Appointment_${appointmentData.appointmentId}.pdf`)

    toast.success("Appointment PDF downloaded successfully!", { autoClose: 3000 })
  }

  // Get plain text from message (remove formatting)
  const getPlainText = (text) => {
    if (!text) return ""

    // Remove markdown-style formatting
    return text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/^[*-]\s+/gm, "• ") // Convert bullet points
  }

  // Format message text to properly display bullet points and other formatting
  const formatMessageText = (text) => {
    if (!text) return ""

    // Replace emoji shortcodes with actual emojis
    const emojiMap = {
      ":)": "😊",
      ":smile:": "😊",
      ":hospital:": "🏥",
      ":doctor:": "👨‍⚕️",
    }

    let formattedText = text

    // Replace emoji shortcodes
    Object.entries(emojiMap).forEach(([code, emoji]) => {
      // Escape special regex characters in the code
      const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      formattedText = formattedText.replace(new RegExp(escapedCode, "g"), emoji)
    })

    // Split by lines to process bullet points
    const lines = formattedText.split("\n")

    return lines.map((line, i) => {
      // Format bullet points (lines starting with * or -)
      if (line.trim().match(/^[*-]\s+/)) {
        const bulletContent = line.trim().replace(/^[*-]\s+/, "")
        return (
          <div key={i} className="bullet-point">
            <span className="bullet">•</span>
            <span>{formatInlineStyles(bulletContent)}</span>
          </div>
        )
      }

      // Handle section headers (lines with ** at beginning and end)
      if (line.trim().match(/^\*\*[^*]+\*\*:/)) {
        const headerContent = line.trim().replace(/^\*\*([^*]+)\*\*:/, "$1:")
        return (
          <div key={i} className="section-header">
            {headerContent}
          </div>
        )
      }

      // Regular text
      return <div key={i}>{formatInlineStyles(line)}</div>
    })
  }

  // Format inline text styles like bold, italic
  const formatInlineStyles = (text) => {
    if (!text) return ""

    // Replace **text** with bold
    const formatted = text.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
      return <strong key={content}>{content}</strong>
    })

    // If the text wasn't modified by the replace (meaning it's a string not a React element)
    if (typeof formatted === "string") {
      // Split the text by ** markers
      const parts = formatted.split(/(\*\*[^*]+\*\*)/g)

      if (parts.length > 1) {
        return parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const content = part.slice(2, -2)
            return <strong key={i}>{content}</strong>
          }
          return part
        })
      }
    }

    return formatted
  }

  // Show loading indicator while translations are loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading translations...</p>
      </div>
    )
  }

  return (
    <>
      <div className="modern-chat-container">
        <div className="chat-header">
          <Bot size={20} />
          <span>Consultancy Bot</span>
        </div>

        <div className="modern-chat-box" ref={chatBoxRef}>
          {messages.length === 0 && (
            <div className="empty-chat">
              <Bot size={40} />
              <p>{translations.emptyChat}</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`message-container ${msg.type}-container`}
              >
                <div className={`message-bubble ${msg.type}-bubble`}>
                  <div className="message-icon">{msg.type === "user" ? <User size={16} /> : <Bot size={16} />}</div>
                  <div className="message-content">
                    <div className="message-text">{msg.type === "bot" ? formatMessageText(msg.text) : msg.text}</div>
                    <div className="message-footer">
                      <div className="message-time">
                        <Clock size={12} />
                        <span>{formatTime(msg.timestamp)}</span>
                      </div>

                      {/* Text-to-speech button for bot messages */}
                      {msg.type === "bot" && (
                        <button
                          className={`speak-button ${speakingMessageId === msg.id ? "speaking" : ""}`}
                          onClick={() => speakMessage(getPlainText(msg.text), msg.id)}
                          aria-label={speakingMessageId === msg.id ? "Stop speaking" : "Speak message"}
                        >
                          {speakingMessageId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="typing-indicator">
              <div className="typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="modern-input-area">
          <input
            type="text"
            placeholder={translations.chatPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isTyping}
          />
          {browserSupportsSpeechRecognition && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={toggleListening}
              className={`mic-button ${listening ? "listening" : ""}`}
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className={!input.trim() ? "disabled" : ""}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>

      {/* Appointment Confirmation Modal */}
      <AnimatePresence>
        {showAppointmentModal && appointmentData && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="appointment-modal"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="modal-header">
                <h2>{translations.appointmentConfirmed}</h2>
                <button className="close-button" onClick={() => setShowAppointmentModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="appointment-details">
                <div className="appointment-card">
                  <div className="appointment-card-header">
                    <Calendar size={24} />
                    <h3>{translations.appointmentDetails}</h3>
                  </div>

                  <div className="appointment-info">
                    <div className="info-row">
                      <span className="info-label">{translations.patientLabel}</span>
                      <span className="info-value">{appointmentData.patientName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{translations.doctorLabel}</span>
                      <span className="info-value">{appointmentData.doctor}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{translations.dateLabel}</span>
                      <span className="info-value">{appointmentData.date}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{translations.timeLabel}</span>
                      <span className="info-value">{appointmentData.time}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">{translations.appointmentIdLabel}</span>
                      <span className="info-value">{appointmentData.appointmentId}</span>
                    </div>
                  </div>

                  <div className="appointment-footer">
                    <p>{translations.arriveEarly}</p>
                    <button className="download-button" onClick={downloadAppointmentPDF}>
                      <Download size={16} />
                      {translations.downloadAppointment}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
