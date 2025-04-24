"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { getGeminiResponse } from "../api/gemini"
import { Send, Bot, User, Clock, Calendar, Download, X } from "lucide-react"
import jsPDF from "jspdf"

const ChatBot = () => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [appointmentData, setAppointmentData] = useState(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const messagesEndRef = useRef(null)
  const chatBoxRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
        const botReply = await getGeminiResponse(input)
        setIsTyping(false)

        // Process the response to check for appointment confirmation
        const processedReply = processResponse(botReply)

        setMessages([...newMessages, { type: "bot", text: processedReply, timestamp: new Date() }])

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

  return (
    <>
      <div className="modern-chat-container">
        <div className="chat-header">
          <Bot size={20} />
          <span>Sage Assistant</span>
        </div>

        <div className="modern-chat-box" ref={chatBoxRef}>
          {messages.length === 0 && (
            <div className="empty-chat">
              <Bot size={40} />
              <p>Say hello to Sage, your HealthBridge Hospital assistant!</p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`message-container ${msg.type}-container`}
              >
                <div className={`message-bubble ${msg.type}-bubble`}>
                  <div className="message-icon">{msg.type === "user" ? <User size={16} /> : <Bot size={16} />}</div>
                  <div className="message-content">
                    <div className="message-text">{msg.type === "bot" ? formatMessageText(msg.text) : msg.text}</div>
                    <div className="message-time">
                      <Clock size={12} />
                      <span>{formatTime(msg.timestamp)}</span>
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
            placeholder="Ask Sage about health issues or appointments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isTyping}
          />
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
                <h2>Appointment Confirmed!</h2>
                <button className="close-button" onClick={() => setShowAppointmentModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="appointment-details">
                <div className="appointment-card">
                  <div className="appointment-card-header">
                    <Calendar size={24} />
                    <h3>HealthBridge Hospital</h3>
                  </div>

                  <div className="appointment-info">
                    <div className="info-row">
                      <span className="info-label">Patient:</span>
                      <span className="info-value">{appointmentData.patientName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Doctor:</span>
                      <span className="info-value">{appointmentData.doctor}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{appointmentData.date}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Time:</span>
                      <span className="info-value">{appointmentData.time}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Appointment ID:</span>
                      <span className="info-value">{appointmentData.appointmentId}</span>
                    </div>
                  </div>

                  <div className="appointment-footer">
                    <p>Please arrive 15 minutes before your scheduled time.</p>
                    <button className="download-button" onClick={downloadAppointmentPDF}>
                      <Download size={16} />
                      Download Appointment
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
