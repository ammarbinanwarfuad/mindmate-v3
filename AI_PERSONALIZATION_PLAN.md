# AI Personalization Plan - Gemini with Full User Context

## 🎯 **Goal**
Enhance the Gemini AI chat to have full access to each user's data and provide personalized, context-aware responses based on:
- User's mood history and patterns
- Encrypted journal entries
- Previous conversations
- User profile and preferences
- Triggers and activities
- Behavioral patterns

## ✅ **Is This Possible?**
**YES! This is 100% possible and recommended for better user experience.**

### Why This Works:
1. **Gemini supports context injection** - We can pass user data in system prompts
2. **All data exists** - We already have mood entries, journals, conversations stored
3. **Privacy-controlled** - We can respect user privacy settings
4. **Dynamic context** - We can update context in real-time as users interact

---

## 📋 **Implementation Plan**

### **Phase 1: User Context Service** 
Create a service to aggregate all user data into a comprehensive context.

### **Phase 2: Enhanced Gemini Service**
Modify Gemini service to accept and use personalized context.

### **Phase 3: Chat API Integration**
Update chat API to fetch context and pass it to Gemini.

### **Phase 4: Privacy & Security**
Ensure secure handling of encrypted data and privacy settings.

### **Phase 5: Optimization**
Add caching and performance optimizations.

---

## 🏗️ **Detailed Implementation**

### **Step 1: Create User Context Service**

**File**: `lib/services/user-context.ts`

**Purpose**: Aggregate all user data into a structured context object.

**What to Include:**
1. **User Profile**
   - Name, university, year
   - Bio, preferences
   - Privacy settings

2. **Mood Data** (Last 30 days)
   - Mood scores and trends
   - Common triggers
   - Activities that help
   - Sleep patterns

3. **Journal Entries** (Last 10 entries, decrypted)
   - Key themes and concerns
   - Emotional patterns
   - Significant events mentioned

4. **Previous Conversations**
   - Recent chat history summaries
   - Topics discussed
   - Coping strategies mentioned

5. **Behavioral Patterns**
   - Best time of day for mood
   - Most common triggers
   - Effective activities

**Output**: Structured context string for Gemini

---

### **Step 2: Enhanced System Prompt**

**File**: `lib/services/gemini.ts`

**Changes:**
1. Accept `userContext` parameter
2. Build dynamic system prompt with user context
3. Inject context into first message or system message
4. Maintain conversation history with context awareness

**Context Format:**
```
System Prompt + User Context:

You are MindMate, an empathetic AI wellness companion for [USER_NAME].

USER CONTEXT:
- Profile: [Name], [University], [Year]
- Recent Mood: Average [X]/10, trending [up/down/stable]
- Common Triggers: [List]
- Helpful Activities: [List]
- Recent Journal Themes: [Themes]
- Previous Conversations: [Summary]

Based on this context, provide personalized support...
```

---

### **Step 3: Update Chat API**

**File**: `app/api/chat/route.ts`

**Changes:**
1. Fetch user context before calling Gemini
2. Pass context to `getChatResponse()`
3. Handle context updates dynamically
4. Cache context for performance (refresh every 5 minutes)

**Flow:**
```
User sends message
  ↓
Fetch user context (or use cached)
  ↓
Decrypt journal entries if needed
  ↓
Build personalized context
  ↓
Pass to Gemini with context
  ↓
Return personalized response
```

---

### **Step 4: Privacy & Security**

**Considerations:**
1. **Encryption**: Decrypt journal entries only when needed
2. **Privacy Settings**: Respect user's privacy preferences
3. **Opt-in/Opt-out**: Allow users to control data usage
4. **Data Minimization**: Only include relevant, recent data
5. **Secure Storage**: Never log decrypted journal entries

**Settings to Add:**
- `privacy.allowPersonalization`: Allow AI to use my data
- `privacy.includeJournalEntries`: Include journal entries in context
- `privacy.includeMoodData`: Include mood tracking data

---

### **Step 5: Context Caching**

**Optimization:**
- Cache user context for 5 minutes
- Refresh on new mood entry or journal entry
- Use Redis or in-memory cache (optional)
- Invalidate cache on data updates

---

## 📊 **Data Sources to Include**

### **1. Mood Data (High Priority)**
```typescript
- Last 30 days mood entries
- Average mood score
- Mood trend (improving/declining/stable)
- Most common mood scores
- Day of week patterns
- Trigger frequency
- Activity effectiveness
```

### **2. Journal Entries (High Priority - if user opts in)**
```typescript
- Last 10 journal entries (decrypted)
- Key themes extracted (via Gemini)
- Emotional patterns
- Significant life events mentioned
- Struggles and concerns
- Goals and aspirations
```

### **3. Previous Conversations (Medium Priority)**
```typescript
- Last 20 messages summary
- Topics discussed
- Coping strategies mentioned
- Progress made
- Issues currently working on
```

### **4. User Profile (Low Priority - Already Known)**
```typescript
- Name, university, year
- Bio and interests
- Privacy preferences
```

### **5. Behavioral Patterns (Medium Priority)**
```typescript
- Best time of day for mood
- Correlation between triggers and mood
- Most effective activities
- Sleep patterns vs mood
```

---

## 🎨 **Context Building Strategy**

### **Option 1: Full Context Every Time** ⚠️ (Heavy)
- Include all data in every request
- Most accurate but expensive
- Good for: Important conversations

### **Option 2: Summarized Context** ✅ (Recommended)
- Build context summary once, cache it
- Update summary periodically
- Include recent changes only
- Good for: Regular conversations

### **Option 3: Dynamic Context** ⭐ (Best)
- Start with summary
- Add specific context based on user's message
- Example: If user mentions "exam", include exam-related journal entries
- Good for: Context-aware responses

**RECOMMENDED: Option 3 (Dynamic Context)**

---

## 🔧 **Technical Implementation**

### **File Structure:**
```
lib/services/
  ├── user-context.ts          # NEW: Context aggregation
  ├── gemini.ts                # MODIFY: Add context support
  └── context-summarizer.ts   # NEW: Summarize context for Gemini

app/api/chat/
  └── route.ts                 # MODIFY: Fetch and pass context
```

### **Key Functions:**

#### **1. Build User Context**
```typescript
async function buildUserContext(userId: string): Promise<UserContext> {
  // Fetch all user data
  // Decrypt journal entries
  // Analyze patterns
  // Return structured context
}
```

#### **2. Generate Context Summary**
```typescript
async function generateContextSummary(context: UserContext): Promise<string> {
  // Use Gemini to summarize user's context
  // Return concise summary string
}
```

#### **3. Dynamic Context Selection**
```typescript
function selectRelevantContext(
  userMessage: string,
  fullContext: UserContext
): Partial<UserContext> {
  // Analyze user message
  // Select relevant context pieces
  // Return filtered context
}
```

---

## 📝 **Example Context Output**

```typescript
{
  profile: {
    name: "John Doe",
    university: "MIT",
    year: 3
  },
  moodPatterns: {
    averageScore: 6.2,
    trend: "improving",
    commonTriggers: ["Academic Stress", "Sleep Issues"],
    helpfulActivities: ["Exercise", "Meditation"],
    recentMood: "Last week: 7, 6, 8, 7, 6, 7, 8"
  },
  journalThemes: [
    "Stress about finals",
    "Difficulty sleeping",
    "Feeling overwhelmed"
  ],
  conversationHistory: {
    recentTopics: ["Exam stress", "Sleep issues", "Time management"],
    strategiesDiscussed: ["Deep breathing", "Study schedule"]
  },
  behavioralInsights: {
    bestTimeOfDay: "Morning",
    triggerFrequency: { "Academic Stress": 8, "Sleep Issues": 5 },
    activityEffectiveness: { "Exercise": 8.5, "Meditation": 7.2 }
  }
}
```

---

## 🚀 **Implementation Steps**

### **Step 1: Create User Context Service** (1-2 hours)
- [ ] Create `lib/services/user-context.ts`
- [ ] Implement data fetching functions
- [ ] Add journal decryption handling
- [ ] Build context structure

### **Step 2: Enhance Gemini Service** (1 hour)
- [ ] Modify `getChatResponse()` to accept context
- [ ] Update system prompt generation
- [ ] Add context to message payload

### **Step 3: Update Chat API** (1 hour)
- [ ] Fetch user context before Gemini call
- [ ] Pass context to Gemini service
- [ ] Add error handling

### **Step 4: Add Privacy Controls** (1 hour)
- [ ] Add privacy settings to User model
- [ ] Respect privacy flags in context building
- [ ] Add user settings page option

### **Step 5: Testing & Optimization** (1-2 hours)
- [ ] Test with real user data
- [ ] Optimize context building performance
- [ ] Add caching
- [ ] Test privacy settings

**Total Estimated Time: 5-7 hours**

---

## 🔒 **Privacy Considerations**

### **What Users Can Control:**
1. **Opt-in/Opt-out**: Control if data is used for personalization
2. **Journal Privacy**: Choose if journal entries are included
3. **Data Scope**: Limit which data types are included
4. **Delete Data**: Remove data from context (delete account)

### **What We Must Do:**
1. **Encrypt at Rest**: Journal entries remain encrypted
2. **Decrypt Carefully**: Only decrypt when needed, discard immediately
3. **No Logging**: Never log decrypted journal entries
4. **Transparency**: Show users what data is being used
5. **Compliance**: Follow GDPR/privacy regulations

---

## 💡 **Advanced Features (Future)**

### **1. Learning from Interactions**
- Track which AI responses users find helpful
- Adjust response style based on user feedback
- Learn user's communication preferences

### **2. Predictive Context**
- Anticipate user needs based on patterns
- Proactive check-ins based on mood patterns
- Suggest activities before user asks

### **3. Multi-modal Context**
- Include forum posts user has made
- Consider peer matching compatibility
- Factor in community interactions

### **4. Context Summarization**
- Use Gemini to summarize user's entire history
- Store summarized context in database
- Update summary periodically

---

## ✅ **Success Metrics**

### **What to Measure:**
1. **Response Relevance**: Do responses reference user's specific situation?
2. **User Satisfaction**: Are users finding AI more helpful?
3. **Engagement**: Do users chat more frequently?
4. **Mood Improvement**: Does personalized AI correlate with better moods?

### **Testing:**
1. **A/B Testing**: Compare personalized vs generic responses
2. **User Feedback**: Ask users if responses feel more personal
3. **Analytics**: Track conversation length and frequency

---

## 🎯 **Recommended Approach**

**Start Simple, Iterate:**

1. **Phase 1**: Add mood data to context (easiest, high value)
2. **Phase 2**: Add journal entry themes (medium complexity)
3. **Phase 3**: Add conversation history (complex)
4. **Phase 4**: Add dynamic context selection (advanced)

**This allows gradual implementation and testing.**

---

## 📚 **Code Examples Preview**

### **Example 1: Building Context**
```typescript
const context = await buildUserContext(userId);
// Returns structured object with all user data
```

### **Example 2: Using Context in Gemini**
```typescript
const response = await getChatResponse(
  conversationHistory,
  userMessage,
  userContext  // NEW parameter
);
```

### **Example 3: Dynamic Context**
```typescript
if (userMessage.includes('exam')) {
  // Include exam-related journal entries
  context.journalEntries = await getExamRelatedJournals(userId);
}
```

---

## ⚠️ **Important Notes**

1. **Performance**: Context building can be slow - use caching
2. **Token Limits**: Gemini has context limits - summarize intelligently
3. **Privacy**: Always respect user privacy settings
4. **Security**: Handle decrypted data carefully
5. **Costs**: More context = more API tokens = higher costs

---

## 🚀 **Ready to Implement?**

This plan provides a complete roadmap for implementing personalized AI responses. Each phase builds on the previous one, allowing for incremental development and testing.

**Estimated Timeline:**
- MVP (Mood + Journal themes): 2-3 hours
- Full Implementation: 5-7 hours
- Advanced Features: 10+ hours

**Status**: ✅ **FEASIBLE AND RECOMMENDED**

---

Would you like me to start implementing this? I can begin with Phase 1 (User Context Service) and then proceed step by step.

