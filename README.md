NeuroHeart.AI Mindfulness Coach 🧘‍♀️
A sophisticated AI-powered mindfulness and wellness companion built with React, TypeScript, and Supabase. This application provides personalized meditation guidance, stress relief techniques, and wellness coaching through an intuitive chat interface with advanced audio capabilities.

🌟 About
NeuroHeart.AI Mindfulness Coach is your personal wellness companion designed to help you navigate stress, anxiety, and daily challenges through evidence-based mindfulness practices. The application combines the power of AI with carefully crafted wellness techniques to provide personalized guidance for meditation, breathing exercises, sleep improvement, and overall mental well-being.

✨ Key Features

🤖 AI-Powered Conversations
- Intelligent Chat Interface: Engage in natural conversations with an AI mindfulness coach
- Contextual Responses: AI provides personalized guidance based on your specific needs and emotional state
- Suggested Questions: Smart question suggestions to help guide your wellness journey
- Real-time Processing: Instant responses with typing indicators and smooth animations
🎵 Advanced Audio System
- Text-to-Speech Integration: Convert AI responses to natural-sounding speech
- Multiple Voice Options: Choose from 4 different AI voices (James, Cassidy, Drew, Lavender)
- Background Music Support: Upload and play custom background music during sessions
- Volume Controls: Independent volume control for voice and background music
- Smart Audio Coordination: Automatic background music management during voice playback
🎙️ Voice Input & Recognition
- Speech-to-Text: Speak your questions directly to the AI coach
- Voice Commands: Hands-free interaction for meditation sessions
- Real-time Processing: Instant voice recognition with visual feedback
📱 Responsive Design
- Mobile-First: Optimized for all device sizes
- Collapsible Sidebar: Smart navigation that adapts to screen size
- Touch-Friendly: Intuitive touch interactions for mobile devices
- Dark/Light Theme: Automatic theme switching based on user preference
💾 Data Management
- Chat History: Persistent conversation history across sessions
- User Profiles: Personalized user accounts with avatar support
- Session Management: Organize conversations into separate chat sessions
- Real-time Sync: Instant synchronization across devices
🔐 Security & Authentication
- Supabase Authentication: Secure user registration and login
- Data Privacy: End-to-end encryption for user conversations
- Session Security: Secure session management with automatic cleanup
- User Agreement: GDPR-compliant disclaimer and terms acceptance
🛠️ Developer Experience
- TypeScript: Full type safety and enhanced development experience
- Modular Architecture: Clean, maintainable code structure
- Custom Hooks: Reusable logic for audio, chat, and state management
- Component Library: Built with Shadcn/UI components
- Real-time Updates: WebSocket integration for live updates
🚀 Technology Stack
Frontend
- React 18.3.1: Modern UI library with hooks and concurrent features
- TypeScript: Type-safe development
- Vite: Lightning-fast build tool and development server
- Tailwind CSS: Utility-first CSS framework
- Shadcn/UI: Beautiful, accessible component library
- React Router: Client-side routing
- React Query: Data fetching and caching
Backend & Services
- Supabase: Backend-as-a-Service with PostgreSQL database
- Edge Functions: Serverless functions for AI integration
- Real-time Subscriptions: Live data synchronization
- File Storage: Secure file upload and management
Audio & Media
- Web Audio API: Advanced audio processing
- Speech Recognition API: Voice input capabilities
- Blob Storage: Efficient audio file handling
- Media Controls: Play, pause, volume management
UI/UX Libraries
- Lucide React: Beautiful icon library
- Radix UI: Accessible component primitives
- Sonner: Toast notifications
- React Hook Form: Form management
- Zod: Schema validation

🏗️ Project Structure
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Shadcn)
│   ├── Auth.tsx        # Authentication component
│   ├── ChatBot.tsx     # Main chat interface
│   ├── ChatSidebar.tsx # Navigation and chat history
│   ├── MessageBubble.tsx # Individual message display
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAudioManager.tsx    # Audio system management
│   ├── useBackgroundMusic.tsx # Background music control
│   ├── useTTSAudio.tsx       # Text-to-speech functionality
│   ├── useChatManager.tsx    # Chat state management
│   └── ...
├── contexts/           # React contexts
│   └── ThemeContext.tsx
├── integrations/       # External service integrations
│   └── supabase/
├── utils/             # Utility functions
└── pages/             # Page components
🛠️ Installation & Setup

Prerequisites
- Node.js 18+
- npm or yarn package manager
- Supabase account (for backend services)

Local Development
1. Clone the repositorygit clone <repository-url>
2. cd neuroheart-ai-mindfulness-coach
3. Install dependenciesnpm install
4. Environment Setup Create a .env.local file with your Supabase credentials:VITE_SUPABASE_URL=your_supabase_url
5. VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
6. Start development servernpm run dev
7. Open in browser Navigate to http://localhost:5173

Production Build
npm run build

🎯 Usage Guide
Getting Started
- Sign Up/Login: Create an account or sign in with existing credentials
- Accept Terms: Review and accept the user agreement
- Start Chatting: Begin your conversation with the AI mindfulness coach
- Explore Features: Try voice input, background music, and different AI voices

Core Features Usage
Chat Interface
- Type your questions or concerns in the chat input
- Use suggested questions to get started
- View conversation history in the sidebar
- Create new chat sessions for different topics
Audio Features
- Click the microphone icon to use voice input
- Use the "Play Script" button to hear AI responses
- Upload background music via the music button in the sidebar
- Adjust volume controls for personalized experience
Personalization
- Change AI voice in user settings
- Upload a profile picture
- Switch between light and dark themes
- Manage chat history and sessions
🔧 Configuration

Audio Settings
- Voice Selection: Choose from 4 AI voices in user settings
- Background Music: Upload MP3/WAV files up to 10MB
- Volume Controls: Independent sliders for voice and music
- Auto-play: Configurable automatic audio playback

Theme & Appearance
- Automatic Theme: Follows system preference
- Manual Toggle: Switch between light/dark modes
- Responsive Design: Adapts to screen size automatically
- Custom Styling: Tailwind CSS for easy customization

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
- Bolt new for free credits
- Elevenlabs for free credits
- Supabase: For providing excellent backend infrastructure
- Shadcn/UI: For beautiful, accessible components
- Radix UI: For primitive component foundation
- OpenAI: For AI integration capabilities
- React Community: For continuous innovation and support

📞 Support
For support, email ai@neuroheart.ai or join our community Discord server.

Built with ❤️ for mental wellness and mindfulness

NeuroHeart.AI - Your journey to inner peace starts here 🧘‍♀️✨
