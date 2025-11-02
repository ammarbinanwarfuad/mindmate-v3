# MindMate v3 - Complete Setup Guide

This guide will walk you through setting up MindMate v3 from scratch.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] MongoDB database (local or cloud)
- [ ] Google Gemini API key
- [ ] Code editor (VS Code recommended)

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd mindmate-v3
npm install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mindmate
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindmate

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Gemini AI (get from: https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key

# Encryption (must be exactly 32 characters)
ENCRYPTION_KEY=12345678901234567890123456789012

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Step 3: Verify Environment Setup

```bash
npm run check-env
```

### Step 4: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🗄️ Database Setup

### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. Use connection string: `mongodb://localhost:27017/mindmate`

### Option B: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address
5. Get connection string and add to `.env.local`

### Seed Test Data (Optional)

```bash
npm run seed
```

This creates a test user:
- Email: `test@example.com`
- Password: `password123`

## 🔑 Getting API Keys

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and add to `.env.local`

### Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

## 🔐 Security Setup

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy output to `NEXTAUTH_SECRET` in `.env.local`

### Generate Encryption Key

Create a 32-character string for `ENCRYPTION_KEY`. Example:
```
abcdefghijklmnopqrstuvwxyz123456
```

## ✅ Verification Steps

Run these commands to verify everything is working:

1. **Type Check**
   ```bash
   npm run type-check
   ```

2. **Lint**
   ```bash
   npm run lint
   ```

3. **Build**
   ```bash
   npm run build
   ```

If all pass, you're ready to develop! ✨

## 🧪 Testing the Application

### 1. Register a New Account

1. Visit http://localhost:3000
2. Click "Get Started Free"
3. Fill in registration form
4. Accept terms and conditions
5. Create account

### 2. Test Core Features

- **Dashboard**: View mood stats and quick entry
- **Chat**: Send a message to AI
- **Mood**: Log a mood entry
- **Community**: Browse forum (or create a post)
- **Matches**: Find potential peer matches
- **Profile**: Update your profile information

## 🐛 Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseServerSelectionError`

**Solutions**:
- Verify MongoDB is running
- Check connection string in `.env.local`
- Ensure IP is whitelisted (if using Atlas)
- Check network connection

### Gemini API Error

**Error**: `Gemini API Error: 401`

**Solutions**:
- Verify API key is correct
- Check if API is enabled
- Ensure you have quota available
- Try regenerating API key

### Build Errors

**Error**: TypeScript or ESLint errors

**Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install

# Check Node version
node --version  # Should be 18+
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Use different port
PORT=3001 npm run dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill
```

## 📱 Development Tips

### Hot Reload Issues

If changes aren't reflecting:
```bash
# Restart dev server
Ctrl+C
npm run dev
```

### Clear Next.js Cache

```bash
rm -rf .next
npm run dev
```

### Database Reset

To start fresh:
1. Drop database in MongoDB
2. Restart dev server
3. Run `npm run seed` if needed

## 🚀 Production Deployment

### Vercel (Easiest)

1. Push code to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Update these in production:
- `NEXTAUTH_URL` → Your production URL
- `NEXT_PUBLIC_APP_URL` → Your production URL
- `NODE_ENV` → `production`

## 📚 Next Steps

- [ ] Customize branding and colors
- [ ] Add your university logo
- [ ] Configure email notifications
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics
- [ ] Review privacy policy
- [ ] Set up backup strategy

## 🆘 Getting Help

- Check README.md for features
- Review CONTRIBUTING.md for guidelines
- Check existing GitHub issues
- Create new issue for bugs

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Google Gemini API](https://ai.google.dev/docs)

---

**Need Help?** Create an issue on GitHub or contact the development team.

Happy coding! 🚀

