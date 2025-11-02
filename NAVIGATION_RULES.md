# Navigation Rules - MindMate v3

## 🔐 Authentication-Based Navigation

### **Rules Overview**

The app now has smart navigation that adapts based on authentication status:

---

## 📋 **Navigation Behavior**

### **When LOGGED IN** ✅

| Action | Result | Redirect |
|--------|--------|----------|
| Click MindMate Logo | → Dashboard | `/dashboard` |
| Visit `/` (root URL) | → Dashboard | `/dashboard` |
| Visit `/login` | → Dashboard | `/dashboard` |
| Visit `/register` | → Dashboard | `/dashboard` |
| Try to access landing page | ❌ Not allowed | `/dashboard` |

**Summary**: Logged-in users are **always redirected to dashboard** from public pages.

---

### **When LOGGED OUT** 🔓

| Action | Result | Redirect |
|--------|--------|----------|
| Click MindMate Logo | → Landing Page | `/` |
| Visit `/` (root URL) | ✅ Shows Landing Page | No redirect |
| Visit `/dashboard` | → Login Page | `/login?from=/dashboard` |
| Visit any protected route | → Login Page | `/login?from=...` |
| Visit `/login` | ✅ Shows Login Page | No redirect |
| Visit `/register` | ✅ Shows Register Page | No redirect |

**Summary**: Non-authenticated users see the **landing page** and can access login/register.

---

## 🔧 **Implementation Details**

### **Middleware Protection**

**File**: `middleware.ts`

```typescript
// Protected Routes:
- / (root)
- /dashboard/*
- /chat/*
- /mood/*
- /profile/*
- /matches/*
- /community/*
- /resources/*
- /notifications/*
- /settings/*
- /login (redirects if authenticated)
- /register (redirects if authenticated)
```

### **Logic Flow**

```
User visits "/"
    ↓
Check authentication
    ↓
┌─────────────────┬──────────────────┐
│   Logged IN     │   Logged OUT     │
├─────────────────┼──────────────────┤
│ Redirect to     │ Show landing     │
│ /dashboard      │ page (/)         │
└─────────────────┴──────────────────┘
```

### **Logo Click Behavior**

**File**: `components/layout/Navbar.tsx`

- **Logged IN**: Always navigates to `/dashboard`
- **Logged OUT**: Always navigates to `/`

---

## 🎯 **User Experience**

### **Scenario 1: New User (Not Logged In)**
```
1. Visit http://localhost:3005
   → ✅ Sees landing page with features

2. Click MindMate logo
   → ✅ Stays on landing page

3. Click "Get Started" or "Sign In"
   → ✅ Goes to registration/login page

4. Try to visit /dashboard directly
   → 🔐 Redirected to /login?from=/dashboard
```

### **Scenario 2: Existing User (Logged In)**
```
1. Login successfully
   → ✅ Redirected to /dashboard

2. Visit http://localhost:3005 (root URL)
   → ✅ Automatically redirected to /dashboard

3. Click MindMate logo
   → ✅ Goes to /dashboard

4. Try to visit /login or /register
   → ✅ Redirected to /dashboard

5. Type "/" in URL bar
   → ✅ Automatically redirected to /dashboard
```

### **Scenario 3: User Logs Out**
```
1. Click logout
   → ✅ Redirected to /login

2. Visit root URL "/"
   → ✅ Shows landing page again

3. Click MindMate logo
   → ✅ Goes to landing page
```

---

## 🚀 **Benefits**

✅ **Better UX**: Logged-in users don't see marketing page  
✅ **Security**: Protected routes require authentication  
✅ **Intuitive**: Logo always goes to the right place  
✅ **No confusion**: Clear separation between public/private areas  
✅ **Seamless**: Automatic redirects feel natural  

---

## 🔍 **Protected Routes List**

All these routes require authentication:

1. `/dashboard` - Main dashboard
2. `/chat` - AI chat interface
3. `/mood` - Mood tracking
4. `/mood/new` - New mood entry
5. `/profile` - User profile
6. `/matches` - Peer matching
7. `/community` - Community forum
8. `/community/new` - Create post
9. `/resources/*` - All wellness resources
10. `/notifications` - Notifications page
11. `/settings` - User settings

---

## 📝 **Public Routes List**

These routes are accessible without authentication:

1. `/` - Landing page (redirects if logged in)
2. `/login` - Login page (redirects if logged in)
3. `/register` - Registration page (redirects if logged in)

---

## ⚡ **Quick Reference**

### **Logged IN Users Cannot Access:**
- ❌ Landing page (`/`)
- ❌ Login page
- ❌ Register page

**They are redirected to**: `/dashboard`

### **Logged OUT Users Cannot Access:**
- ❌ Dashboard
- ❌ Any protected routes

**They are redirected to**: `/login?from={attempted-route}`

---

## 🎨 **Visual Flow**

```
┌─────────────────────────────────────────┐
│          User Authentication             │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼────┐      ┌───▼────┐
   │ Logged │      │Logged  │
   │  OUT   │      │   IN   │
   └───┬────┘      └───┬────┘
       │               │
       │               │
   ┌───▼────┐      ┌───▼────┐
   │Landing │      │Dashboard│
   │ Page   │      │  Page   │
   └────────┘      └─────────┘
       │               │
   ┌───▼────┐      ┌───▼────┐
   │Register│      │Protected│
   │ /Login │      │ Routes  │
   └────────┘      └─────────┘
```

---

## ✅ **Testing Checklist**

### **When Logged OUT:**
- [ ] Visit `/` shows landing page
- [ ] Click logo goes to `/`
- [ ] Visit `/dashboard` redirects to `/login`
- [ ] Visit `/login` shows login page
- [ ] Visit `/register` shows register page

### **When Logged IN:**
- [ ] Visit `/` redirects to `/dashboard`
- [ ] Click logo goes to `/dashboard`
- [ ] Visit `/login` redirects to `/dashboard`
- [ ] Visit `/register` redirects to `/dashboard`
- [ ] Can access all protected routes
- [ ] Logout redirects to `/login`

---

## 🔧 **Configuration Files**

1. **Middleware**: `middleware.ts`
   - Handles route protection
   - Manages redirects

2. **Navbar**: `components/layout/Navbar.tsx`
   - Dynamic logo link
   - Session-aware navigation

3. **Auth Config**: `auth.ts`
   - NextAuth pages configuration
   - Session management

---

**Status**: ✅ Fully Implemented and Working

**Last Updated**: Current Session


