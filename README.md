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
