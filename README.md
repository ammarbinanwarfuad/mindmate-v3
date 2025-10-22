# MindMate v3 - AI Mental Wellness Companion

MindMate is a comprehensive mental wellness platform designed specifically for university students. It combines AI-powered chat support, mood tracking, peer matching, and community features to provide holistic mental health support.

## ✨ Features

- **🤖 AI Chat Support**: 24/7 empathetic AI companion powered by Google Gemini
- **😊 Mood Tracking**: Daily mood logging with beautiful visualizations and insights
- **👥 Community Forum**: Safe space to share experiences and support peers
- **🤝 Peer Matching**: Smart algorithm to connect you with compatible peers
- **📊 Analytics & Insights**: Track patterns and trends in your mental health
- **🔒 Privacy-First**: End-to-end encryption for journal entries
- **🆘 Crisis Detection**: Automatic detection with immediate resource access
- **📚 Wellness Resources**: Curated mental health resources and exercises

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **State Management**: React Hooks
- **Form Handling**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- MongoDB database
- Google Gemini API key

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mindmate-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key_here

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Encryption (must be exactly 32 characters)
   ENCRYPTION_KEY=your_32_character_encryption_key

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mindmate-v3/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── chat/               # Chat interface components
│   ├── community/          # Community forum components
│   ├── layout/             # Layout components
│   ├── matches/            # Peer matching components
│   ├── mood/               # Mood tracking components
│   ├── providers/          # Context providers
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility libraries
│   ├── db/                # Database models and connection
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
└── types/                 # Global type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run check-env` - Validate environment variables

## 🗄️ Database Models

- **User**: User accounts and profiles
- **MoodEntry**: Daily mood tracking entries
- **Conversation**: AI chat conversation history
- **Match**: Peer matching data
- **ForumPost**: Community forum posts
- **Notification**: User notifications

## 🔐 Security Features

- End-to-end encryption for journal entries (AES-256-GCM)
- Secure password hashing with bcrypt
- JWT-based authentication
- CSRF protection
- Rate limiting on API endpoints
- Content Security Policy headers

## 🌐 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Mood Tracking
- `GET /api/mood` - Get mood entries
- `POST /api/mood` - Create mood entry
- `GET /api/mood/stats` - Get mood statistics

### Chat
- `GET /api/chat` - Get conversation history
- `POST /api/chat` - Send message to AI

### Community
- `GET /api/community/posts` - Get forum posts
- `POST /api/community/posts` - Create forum post

### Matching
- `GET /api/matching/find` - Find potential matches
- `POST /api/matching/accept` - Accept a match

### User
- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Mark notifications as read

## 🎨 Customization

### Tailwind Theme

Modify `tailwind.config.ts` to customize colors, fonts, and other design tokens.

### Environment Configuration

Adjust settings in `next.config.ts` for production optimizations, image domains, headers, etc.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t mindmate-v3 .

# Run container
docker run -p 3000:3000 mindmate-v3
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Important Notes

- **Crisis Support**: MindMate is NOT a replacement for professional mental health care
- **Data Privacy**: All journal entries are encrypted at rest
- **Age Requirement**: Users must be 18+ to use the platform
- **Terms of Service**: Users must accept terms before registration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Next.js team for the amazing framework
- MongoDB for reliable data storage
- All contributors and users of MindMate

## 📞 Support

- **Crisis Hotline**: 988 (US)
- **Crisis Text Line**: Text HOME to 741741
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Voice chat with AI
- [ ] Group therapy sessions
- [ ] Integration with wearables
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Therapist directory
- [ ] Wellness challenges and gamification

---

**Remember**: If you or someone you know is in crisis, please contact emergency services or a crisis helpline immediately. MindMate is here to support you, but professional help is irreplaceable.

Made with ❤️ for student mental wellness

