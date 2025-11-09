# MindMate Personalization Verification Guide

## ✅ **Yes, Personalization IS Implemented!**

MindMate AI currently **supports personalized replies** based on:
- Your profile (name, university, year)
- Your mood patterns and trends (last 30 days)
- Common triggers you experience
- Activities that help you
- Journal themes
- Previous conversation topics
- Behavioral insights

## 🔍 **How to Check if Personalization is Working**

### Method 1: Check the Chat Behavior

**Personalized responses will:**
- Use your name naturally in conversation
- Reference your specific mood patterns (e.g., "I noticed your mood has been improving...")
- Mention triggers or activities specific to you
- Remember past conversations
- Suggest activities that have worked for you before

**Non-personalized responses will:**
- Use generic language without your name
- Give generic advice not tied to your data
- Not reference your mood patterns or history

### Method 2: Check Browser Console/Server Logs

When you send a message in the chat:

1. **Check browser console** (F12 → Console tab):
   - Look for any API errors
   - Check network requests to `/api/chat`

2. **Check server logs** (terminal where `npm run dev` is running):
   - Look for "Error building user context" messages
   - Look for "Gemini API Error" messages

### Method 3: Test with Specific Questions

Try asking:
- "How have I been feeling lately?" (should reference your mood data)
- "What activities help me?" (should mention activities from your mood entries)
- "What are my common triggers?" (should list triggers from your data)

If the AI references your specific data → Personalization is working! ✅
If the AI gives generic responses → Personalization may not be working ❌

## 🐛 **Common Issues Preventing Personalization**

### Issue 1: Missing or Invalid Gemini API Key

**Symptom:** Error message "I'm having trouble connecting right now"

**Check:**
```bash
# Verify your .env.local file has:
GEMINI_API_KEY=your_actual_api_key_here

# Test if the key is loaded:
npm run check-env
```

**Fix:**
1. Get a Gemini API key from: https://makersuite.google.com/app/apikey
2. Add it to `.env.local`
3. Restart your dev server

### Issue 2: Privacy Settings Disabled

**Check:** Your privacy settings might disable personalization

**Fix:**
1. Go to Profile/Settings page
2. Check "Privacy" settings
3. Ensure "Allow Personalization" is enabled

### Issue 3: No User Data

**Symptom:** Personalization works but AI has nothing to personalize with

**Fix:**
1. Add some mood entries (go to Mood tracking)
2. Write a few journal entries
3. Have a conversation with the AI
4. Try asking again - now it will have data to reference!

### Issue 4: Database Connection Issues

**Symptom:** "Error building user context" in logs

**Check:**
```bash
# Verify MongoDB connection:
npm run check-env
```

**Fix:**
1. Ensure MongoDB is running
2. Check MONGODB_URI in `.env.local` is correct
3. Verify database credentials

## 🧪 **Quick Test Script**

Run this to verify your setup:

```bash
# Check environment variables
npm run check-env

# If everything is set up correctly, start the dev server
npm run dev
```

Then:
1. Log into MindMate
2. Add a mood entry (any mood, any score)
3. Go to Chat
4. Ask: "How am I feeling today?"
5. If it references your mood → **Personalization is working!** ✅

## 📊 **What Data is Used for Personalization?**

The AI uses:

| Data Type | How It's Used |
|-----------|---------------|
| **Profile** | Uses your name, university, year in conversation |
| **Mood Patterns** | References trends, average mood, recent scores |
| **Triggers** | Acknowledges your common triggers |
| **Activities** | Suggests activities that have helped you |
| **Journal Themes** | Understands topics you've written about |
| **Conversation History** | Remembers past discussions and strategies |

## 🔒 **Privacy Controls**

You can control what data is used:
- Go to Profile → Privacy Settings
- Toggle "Allow Personalization"
- When disabled, AI gives generic (non-personalized) responses

## 💡 **Testing Personalization Step-by-Step**

1. **Ensure you have data:**
   - Add at least 3-5 mood entries
   - Write 1-2 journal entries
   - Have at least one chat conversation

2. **Test specific questions:**
   - "What's my average mood lately?" → Should give your actual average
   - "What helps me feel better?" → Should mention your effective activities
   - "What triggers me?" → Should list your common triggers

3. **Check if name is used:**
   - AI should naturally use your name occasionally
   - Example: "Hi [YourName], I noticed..."

4. **Verify mood patterns:**
   - Ask about your mood trend
   - Should reference your actual data (not generic)

## ❓ **Still Not Working?**

If personalization still doesn't work after checking all above:

1. **Check server logs** for errors
2. **Verify Gemini API key** is valid and has quota
3. **Check database** has your user data
4. **Review privacy settings** are enabled
5. **Restart dev server** after changing `.env.local`

---

**Note:** Personalization respects your privacy settings. If you've disabled it, the AI will work but give non-personalized responses.
