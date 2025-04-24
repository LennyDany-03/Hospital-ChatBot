import axios from "axios"

const API_KEY = "AIzaSyCcXkX4_LQxIvX1b53gDCAS7GTTzIiOE0k"

const systemPrompt = `
You are Sage, a caring and knowledgeable virtual assistant for HealthBridge Hospital.
Your role is to assist users in identifying their health issues, recommend specific doctors or departments, and guide them through the hospital layout if needed.

Hospital Info:
- Name: HealthBridge Hospital
- Location: 2nd Cross Road, Midtown
- Open Hours: 8 AM to 8 PM (Monday to Saturday)

Services & Doctors:
- General Medicine: Dr. Anita Rao (1st Floor, Room 101)
- Pediatrics: Dr. Rajiv Menon (1st Floor, Room 110)
- Dermatology: Dr. Shalini Das (2nd Floor, Cabin 204)
- Orthopedics: Dr. Vikram Sinha (2nd Floor, Cabin 210)
- ENT: Dr. Neha Kapoor (2nd Floor, Room 215)
- Cardiology: Dr. Arvind Bhatia (3rd Floor, Room 301)
- Neurology: Dr. Priya Sharma (3rd Floor, Room 310)
- Ophthalmology: Dr. Rahul Verma (1st Floor, Room 120)
- Psychiatry: Dr. Meera Patel (4th Floor, Room 405)
- Gynecology: Dr. Sunita Gupta (4th Floor, Room 410)

Features:
- Appointment booking with doctor and preferred time slot
- Floor and room number navigation
- Indoor roadmap to direct users to departments (mention "Would you like a map to reach Dr. X's cabin?")

Appointment Booking Process:
1. When a user wants to book an appointment, ask for their name
2. Then ask for their preferred date (format: DD/MM/YYYY or "tomorrow", "next Monday", etc.)
3. Then ask for their preferred time slot
4. After collecting all information, confirm the appointment with a message like:
   "Your appointment with [Doctor Name] has been confirmed for [Patient Name] on [Date] at [Time]. Your appointment ID is [ID]. You can download your appointment letter from the button below."

Interaction Guidelines:
- Greet users only on the **first** interaction.
- Be professional, empathetic, and clear.
- After understanding symptoms, suggest the specific doctor, department, and exact location (floor/room/cabin).
- Ask if they'd like to book an appointment or see a roadmap to the room.
- Provide consultation hours and help with follow-up queries.

Example:
User: I have chest pain.
Sage: I recommend you consult Dr. Arvind Bhatia, our cardiologist. He's available on the 3rd Floor, Room 301. Would you like to book an appointment or get a map to reach his cabin?

Make your responses natural, detailed, and supportive.
`

// Track conversation state
let conversationState = {
  isBookingAppointment: false,
  doctorName: null,
  patientName: null,
  appointmentDate: null,
  appointmentTime: null,
  stage: "initial", // initial, name, date, time, confirmed
}

export const getGeminiResponse = async (userPrompt) => {
  try {
    // Process user input based on conversation state
    if (conversationState.isBookingAppointment) {
      switch (conversationState.stage) {
        case "name":
          // User is providing their name
          conversationState.patientName = userPrompt
          conversationState.stage = "date"
          return `Thank you, ${userPrompt}. What date would you prefer for your appointment with ${conversationState.doctorName}? (Please specify a date like "tomorrow", "next Monday", or DD/MM/YYYY)`

        case "date":
          // User is providing the date
          conversationState.appointmentDate = userPrompt
          conversationState.stage = "time"
          return `Great! And what time would work best for you on ${userPrompt}? Dr. ${conversationState.doctorName.split(" ")[1]} is available between 9:00 AM and 5:00 PM.`

        case "time":
          // User is providing the time
          conversationState.appointmentTime = userPrompt
          conversationState.stage = "confirmed"

          // Generate a random appointment ID
          const appointmentId = `HB-${Math.floor(100000 + Math.random() * 900000)}`

          // Reset conversation state
          conversationState = {
            isBookingAppointment: false,
            doctorName: null,
            patientName: null,
            appointmentDate: null,
            appointmentTime: null,
            stage: "initial",
          }

          return `Your appointment with ${conversationState.doctorName} has been confirmed for ${conversationState.patientName} on ${conversationState.appointmentDate} at ${conversationState.appointmentTime}. Your appointment ID is ${appointmentId}. You can download your appointment letter from the button below.`
      }
    }

    // Check if user wants to book an appointment
    if (
      userPrompt.toLowerCase().includes("appointment") ||
      userPrompt.toLowerCase().includes("book") ||
      userPrompt.toLowerCase().includes("schedule")
    ) {
      // Extract doctor name if mentioned
      let doctorName = null
      const doctorMatches = [
        "Dr. Anita Rao",
        "Dr. Rajiv Menon",
        "Dr. Shalini Das",
        "Dr. Vikram Sinha",
        "Dr. Neha Kapoor",
        "Dr. Arvind Bhatia",
        "Dr. Priya Sharma",
        "Dr. Rahul Verma",
        "Dr. Meera Patel",
        "Dr. Sunita Gupta",
      ]

      for (const doctor of doctorMatches) {
        if (userPrompt.includes(doctor)) {
          doctorName = doctor
          break
        }
      }

      if (doctorName) {
        conversationState = {
          isBookingAppointment: true,
          doctorName: doctorName,
          patientName: null,
          appointmentDate: null,
          appointmentTime: null,
          stage: "name",
        }

        return `I'd be happy to book an appointment with ${doctorName} for you. Could you please provide your full name?`
      }
    }

    const fullPrompt = `${systemPrompt}\nUser: ${userPrompt}`

    console.log("Sending Request to Gemini API:")
    console.log("Request Payload:", {
      contents: [
        {
          role: "user",
          parts: [{ text: fullPrompt }],
        },
      ],
    })

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      },
    )

    // Log the full response for better understanding
    console.log("API Response:", response.data)

    const candidates = response.data.candidates
    return candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini."
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message) // Detailed error response
    return "Error fetching response from Gemini."
  }
}
