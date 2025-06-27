# 🧘‍♀️ NeuroHeart.AI Mindfulness Coach

A sophisticated AI-powered mindfulness and wellness companion built with **React**, **TypeScript**, and **Supabase**. This application provides personalized meditation guidance, stress relief techniques, and wellness coaching through an intuitive chat interface with advanced audio capabilities.

---

## 🌟 About

**NeuroHeart.AI Mindfulness Coach** is your personal wellness companion designed to help you navigate stress, anxiety, and daily challenges through evidence-based mindfulness practices.

It combines the power of AI with carefully crafted wellness techniques to provide:
- Personalized meditation
- Breathing exercises
- Sleep improvement tools
- Overall mental well-being support

---

## ✨ Key Features

### 🤖 AI-Powered Conversations
- **Intelligent Chat Interface** — Natural conversations with an AI mindfulness coach  
- **Contextual Responses** — Personalized suggestions based on emotional state  
- **Suggested Questions** — Smart question prompts to guide your journey  
- **Real-time Processing** — Typing indicators and smooth UI feedback  

### 🎵 Advanced Audio System
- **Text-to-Speech Integration** — Convert AI replies to natural-sounding speech  
- **Multiple Voice Options** — Choose from James, Cassidy, Drew, Lavender  
- **Background Music** — Upload & play your own calming tracks  
- **Independent Volume Controls** — Separate sliders for voice and music  
- **Smart Audio Coordination** — AI voice automatically mutes background music  

### 🎙️ Voice Input & Recognition
- **Speech-to-Text** — Ask questions by speaking  
- **Voice Commands** — Hands-free meditation interactions  
- **Real-time Recognition** — Instant visual feedback during speech  

### 📱 Responsive Design
- **Mobile-First** — Optimized for phones and tablets  
- **Collapsible Sidebar** — Adapts to screen width  
- **Touch-Friendly UI** — Gestures and smooth navigation  
- **Dark/Light Themes** — Follows user/system preferences  

### 💾 Data Management
- **Chat History** — Persistent, organized by session  
- **User Profiles** — Personalized accounts with avatars  
- **Real-Time Sync** — Sync chats across devices  

### 🔐 Security & Authentication
- **Supabase Auth** — Secure sign-in and signup  
- **GDPR Compliance** — Consent & data handling  
- **Session Cleanup** — Secure, auto-managed sessions  

### 🛠️ Developer Experience
- **TypeScript** — Full static typing  
- **Modular Architecture** — Clean codebase  
- **Custom Hooks** — Reusable logic (audio, chat, auth)  
- **Shadcn/UI** — Accessible, styled components  
- **WebSocket Updates** — Live feedback and sync  

---

## 🚀 Technology Stack

### Frontend
- `React 18.3.1`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `Shadcn/UI`
- `React Router`
- `React Query`

### Backend & Services
- `Supabase` (PostgreSQL, Auth, Edge Functions)
- `Real-time Subscriptions`
- `File Storage`

### Audio & Media
- `Web Audio API`
- `Speech Recognition API`
- `Blob Storage`

### UI/UX Libraries
- `Lucide React`
- `Radix UI`
- `Sonner`
- `React Hook Form`
- `Zod`

---

## 🏗️ Project Structure

```txt
src/
├── components/
│   ├── ui/
│   ├── Auth.tsx
│   ├── ChatBot.tsx
│   ├── ChatSidebar.tsx
│   ├── MessageBubble.tsx
├── hooks/
│   ├── useAudioManager.tsx
│   ├── useBackgroundMusic.tsx
│   ├── useTTSAudio.tsx
│   ├── useChatManager.tsx
├── contexts/
│   └── ThemeContext.tsx
├── integrations/
│   └── supabase/
├── utils/
├── pages/


````markdown
## 🛠️ Installation & Setup

### 🔧 Prerequisites
- [Node.js](https://nodejs.org/) v18 or above
- npm or yarn as a package manager
- A [Supabase](https://supabase.com) account for backend services

---

### ⚙️ Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/neuroheart-ai-mindfulness-coach.git

# 2. Navigate into the directory
cd neuroheart-ai-mindfulness-coach

# 3. Install dependencies
npm install
````

### 🌐 Environment Setup

Create a `.env.local` file at the root of your project with the following contents:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### ▶️ Run the Development Server

```bash
npm run dev
```

Then open your browser and navigate to:

```
http://localhost:5173
```

---

### 📦 Build for Production

```bash
npm run build
```

---

## 🎯 Usage Guide

### ✅ Getting Started

* 📝 Sign Up or Log In using your credentials
* 📜 Accept the User Agreement and Terms
* 💬 Start chatting with the AI Mindfulness Coach

---

### 💡 Core Features Usage

#### 🗨️ Chat Interface

* Type questions or concerns in the chat bar
* Use suggested prompts to guide interactions
* View past chats in the collapsible sidebar
* Create new sessions for different wellness topics

#### 🔊 Audio Features

* Click 🎤 to speak your query
* Hit ▶️ "Play Script" to hear AI's response
* Upload MP3/WAV background music in settings
* Adjust volume sliders for speech and music separately

#### 🧑‍🎨 Personalization

* Switch between 4 AI voices (James, Cassidy, Drew, Lavender)
* Upload your profile picture
* Choose between Dark or Light theme
* Manage chat history, sessions, and audio preferences

---

## 🔧 Configuration

### 🎛️ Audio Settings

* **Voice Selection**: Configurable in user settings
* **Background Music**: Accepts MP3/WAV files up to 10MB
* **Volume Control**: Independent sliders for voice/music
* **Auto-Play**: Enable/disable auto-play of responses

### 🎨 Theme & Appearance

* **Automatic Theme**: Matches system preferences
* **Manual Toggle**: User-controlled switching
* **Responsive Layout**: Mobile-first, adaptive
* **Tailwind Styling**: Easily extendable UI customizations

---

## 📄 License

This project is licensed under the **MIT License**. See the full license in the [LICENSE](./LICENSE) file.

---

## 🙏 Acknowledgments

Special thanks to the platforms and communities that enabled this project:

* 💡 [Bolt.new](https://bolt.new) – for free credits
* 🔊 [ElevenLabs](https://www.elevenlabs.io) – for audio voice synthesis
* 🌐 [Supabase](https://supabase.com) – for backend services and auth
* 💻 [Shadcn/UI](https://ui.shadcn.com) – for modern UI components
* 🧱 [Radix UI](https://www.radix-ui.com) – for headless component primitives
* 🤖 [OpenAI](https://openai.com) – for AI-generated content
* 🧑‍💻 React Community – for the ecosystem and continuous innovation

---

## 📞 Support

* 📧 Email: [ai@neuroheart.ai](mailto:ai@neuroheart.ai)
* 💬 Discord: Join our **Community Server** (link coming soon)

---

> Built with ❤️ for mental wellness and AI empowerment.

**NeuroHeart.AI** – *Your journey to inner peace starts here.* 🧘‍♀️✨
