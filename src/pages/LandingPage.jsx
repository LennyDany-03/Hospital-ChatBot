"use client"
 
 import { useState, useEffect } from "react"
 import { motion } from "framer-motion"
 import { useNavigate } from "react-router-dom"
 import { Hospital, ArrowRight, Heart, Stethoscope, MessageCircle, Calendar, MapPin } from "lucide-react"
 
 import ChatBot from "../assets/ChatBot.jpg"
 
 const LandingPage = () => {
   const navigate = useNavigate()
   const [activeFeature, setActiveFeature] = useState(null)
   const [particles, setParticles] = useState([])
 
   // Generate particles for the background
   useEffect(() => {
     const newParticles = []
     for (let i = 0; i < 30; i++) {
       newParticles.push({
         id: i,
         x: Math.random() * 100,
         y: Math.random() * 100,
         size: 3 + Math.random() * 8,
         duration: 15 + Math.random() * 30,
         delay: Math.random() * 2,
       })
     }
     setParticles(newParticles)
   }, [])
 
   const features = [
     {
       id: 1,
       icon: <Stethoscope size={28} />,
       title: "Expert Doctors",
       description: "Connect with specialized healthcare professionals instantly",
       color: "#6a3de8",
     },
     {
       id: 2,
       icon: <Calendar size={28} />,
       title: "Easy Booking",
       description: "Schedule appointments with just a few clicks",
       color: "#ff7849",
     },
     {
       id: 3,
       icon: <Heart size={28} />,
       title: "Health Advice",
       description: "Get instant medical guidance and support",
       color: "#ff4b6e",
     },
     {
       id: 4,
       icon: <MapPin size={28} />,
       title: "Hospital Navigation",
       description: "Find your way to departments and doctor cabins",
       color: "#00c896",
     },
   ]
 
   return (
     <div className="landing-container">
       {/* Animated background particles */}
       {particles.map((particle) => (
         <motion.div
           key={particle.id}
           className="particle"
           initial={{ x: `${particle.x}vw`, y: `${particle.y}vh`, opacity: 0 }}
           animate={{
             x: [`${particle.x}vw`, `${(particle.x + 20) % 100}vw`, `${particle.x}vw`],
             y: [`${particle.y}vh`, `${(particle.y + 15) % 100}vh`, `${particle.y}vh`],
             opacity: [0, 0.5, 0],
           }}
           transition={{
             duration: particle.duration,
             repeat: Number.POSITIVE_INFINITY,
             delay: particle.delay,
             ease: "linear",
           }}
           style={{
             position: "absolute",
             width: `${particle.size}px`,
             height: `${particle.size}px`,
             borderRadius: "50%",
             background: "var(--primary-color)",
             zIndex: 1,
           }}
         />
       ))}
 
       <div className="modern-landing-content">
         <motion.div
           className="hospital-header"
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
         >
           <div className="hospital-logo">
             <Hospital size={36} className="hospital-icon" />
             <h1>Sara HealthBridge</h1>
           </div>
         </motion.div>
 
         <div className="hero-section">
           <motion.div
             className="hero-content"
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.2 }}
           >
             <h2 className="hero-title">Your AI Health Assistant</h2>
             <p className="hero-description">
               Get instant medical guidance, book appointments with specialists, and navigate hospital services with our
               intelligent chatbot assistant.
             </p>
 
             <motion.button
               className="get-started-btn"
               whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(106, 61, 232, 0.5)" }}
               whileTap={{ scale: 0.98 }}
               onClick={() => navigate("/langpage")}
               initial={{ opacity: 1, y: 0 }}
               animate={{ opacity: 1, y: 0 }}
             >
               Get Started
               <ArrowRight size={20} />
             </motion.button>
           </motion.div>
 
           <motion.div
             className="hero-image-container"
             initial={{ opacity: 0, scale: 0.8, x: 50 }}
             animate={{ opacity: 1, scale: 1, x: 0 }}
             transition={{ duration: 0.6, delay: 0.3 }}
           >
             <div className="chat-preview">
               <div className="chat-bubble bot">
                 <p>Hi! I'm Sara. How can I help you today?</p>
               </div>
               <div className="chat-bubble user">
                 <p>I need to book an appointment with a cardiologist.</p>
               </div>
               <div className="chat-bubble bot">
                 <p>I can help you with that! Dr. Arvind Bhatia is available.</p>
               </div>
             </div>
             <motion.div
               className="assistant-image"
               animate={{
                 y: [0, -10, 0],
               }}
               transition={{
                 repeat: Number.POSITIVE_INFINITY,
                 duration: 3,
                 ease: "easeInOut",
               }}
             >
               <img src={ChatBot || "/placeholder.svg"} className="SaraImage" alt="Sara - Health Assistant" />
             </motion.div>
           </motion.div>
         </div>
 
         <motion.div
           className="features-grid"
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.5 }}
         >
           {features.map((feature) => (
             <motion.div
               key={feature.id}
               className={`feature-card ${activeFeature === feature.id ? "active" : ""}`}
               whileHover={{
                 scale: 1.05,
                 boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
                 backgroundColor: feature.color,
                 color: "#fff",
               }}
               onHoverStart={() => setActiveFeature(feature.id)}
               onHoverEnd={() => setActiveFeature(null)}
               onClick={() => navigate("/langpage")}
             >
               <div
                 className="feature-icon-wrapper"
                 style={{
                   backgroundColor: activeFeature === feature.id ? "#fff" : `${feature.color}20`,
                   color: activeFeature === feature.id ? feature.color : feature.color,
                 }}
               >
                 {feature.icon}
               </div>
               <h3>{feature.title}</h3>
               <p>{feature.description}</p>
             </motion.div>
           ))}
         </motion.div>
 
         <motion.div
           className="cta-section"
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.7 }}
         >
           <div className="cta-content">
             <h2>Ready to experience the future of healthcare?</h2>
             <p>Our AI assistant is available 24/7 to help with your health needs.</p>
           </div>
           <motion.button
             className="cta-button"
             whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(106, 61, 232, 0.5)" }}
             whileTap={{ scale: 0.98 }}
             onClick={() => navigate("/langpage")}
           >
             <MessageCircle size={20} />
             Chat with Sara
           </motion.button>
         </motion.div>
       </div>
     </div>
   )
 }
 
 export default LandingPage