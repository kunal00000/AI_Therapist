# AI Mental Health Therapist - Progressive Web App

A compassionate AI-powered mental health assistant built with Next.js, featuring real-time chat, voice interaction, and persistent chat history.

## Features

### 🤖 AI-Powered Conversations

- Empathetic mental health support using Google's Gemini AI
- Real-time streaming responses for natural conversation flow
- Contextual understanding of mental health topics

### 🎤 Voice Interaction

- **Speech-to-Text**: Speak your thoughts instead of typing
- **Text-to-Speech**: Listen to AI responses for accessibility
- Browser-based speech recognition (Chrome/Edge recommended)

### 💾 Chat History & Persistence

- **Save Conversations**: Automatically save your therapy sessions
- **Browse History**: Access previous conversations anytime
- **Local Storage**: All data stored securely in your browser using IndexedDB
- **Delete Options**: Remove individual chats or clear all history
- **Session Management**: Continue conversations across browser sessions

### 📱 Progressive Web App

- Mobile-responsive design
- Offline-capable service worker
- Install as a native app on mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Google AI API key (Gemini)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd AI_Therapist
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Set up environment variables:

```bash
# Create .env.local file
GOOGLE_API_KEY=your_google_ai_api_key_here
```

4. Run the development server:

```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Starting a Conversation

1. Type your message in the input field or click the microphone to speak
2. The AI therapist will respond with empathetic, helpful guidance
3. Continue the conversation naturally

### Managing Chat History

- **Save Chat**: Click the "Save Chat" button to preserve your conversation
- **View History**: Use the sidebar (hamburger menu on mobile) to browse saved chats
- **Load Previous Chat**: Click on any saved session to continue the conversation
- **Delete Chat**: Click the trash icon next to any saved session
- **New Chat**: Click "New" to start a fresh conversation
- **Clear All**: Remove all saved conversations at once

### Voice Features

- **Microphone Button**: Start/stop speech recognition
- **Speaker Button**: Listen to the last AI response
- Ensure microphone permissions are granted for speech recognition

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **AI Integration**: Google Generative AI (Gemini)
- **Database**: IndexedDB (client-side storage)
- **Voice**: Web Speech API (Speech Recognition & Synthesis)
- **PWA**: next-pwa for service worker and offline capabilities

## Privacy & Security

- **Local Storage**: All conversations are stored locally in your browser
- **No Server Storage**: Chat history never leaves your device
- **Privacy First**: Your mental health conversations remain completely private
- **Data Control**: You can delete all data anytime

## Browser Compatibility

- **Recommended**: Chrome, Edge (full feature support)
- **Supported**: Firefox, Safari (limited voice features)
- **Mobile**: iOS Safari, Chrome Mobile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you're experiencing a mental health crisis, please contact:

- **Emergency**: 911 (US) or your local emergency number
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988

This AI assistant is not a replacement for professional mental health care.
