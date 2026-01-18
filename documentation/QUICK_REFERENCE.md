# 🎵 EmotiSound - Quick Reference Card

## 🚀 Start Here

### 30-Second Setup
```bash
# Windows
setup.bat

# Mac/Linux
chmod +x setup.sh
./setup.sh
```

### Manual Start (2 terminals)
```bash
# Terminal 1
cd emotisound-backend && npm start

# Terminal 2
cd emotisound && npm start

# Open: http://localhost:3000
```

## 📖 Documentation Map

| Document | Purpose | Read When |
|----------|---------|-----------|
| **README.md** | Project overview | First - get the big picture |
| **SETUP_GUIDE.md** | Installation & deployment | Before running locally |
| **ARCHITECTURE.md** | Technical details | Understanding the system |
| **PROJECT_SUMMARY.md** | What was built | Want to know all features |
| **TESTING_CHECKLIST.md** | Verify everything works | Before going live |
| **FILE_INVENTORY.md** | File structure | Understanding codebase |

## 🔑 Key Endpoints

**Base URL:** `http://localhost:3001/api`

### Auth (No Token Required)
```
POST /auth/register      → Create account
POST /auth/login         → Login
POST /auth/logout        → Logout
```

### User (Token Required)
```
GET /user/preferences    → Get settings
PATCH /user/preferences  → Update settings
```

### Analytics (Token Required)
```
POST /analytics/emotion           → Log emotion
GET /analytics/stats              → Get counts
GET /analytics/sessions           → Get sessions
POST /analytics/session/start     → Start session
POST /analytics/session/:id/end   → End session
```

## 🎯 Emotion Mapping

```
Happy   → 440 Hz  + Yellow (#FFD700)
Sad     → 220 Hz  + Blue    (#4169E1)
Angry   → 330 Hz  + Red     (#DC143C)
Neutral → 261 Hz  + Gray    (#808080)
```

## 🏗️ Directory Structure

```
emotisound/           Frontend
├── src/
│   ├── components/   (Auth, Camera, Audio, Analytics, UI)
│   ├── hooks/        (useAuth, useCamera, useEmotionDetection)
│   ├── services/     (apiClient, faceDetection, audioEngine)
│   ├── utils/        (emotionMapper, constants)
│   └── types/        (TypeScript definitions)

emotisound-backend/   Backend
└── src/
    ├── routes/       (auth, user, analytics)
    ├── middleware/   (auth)
    ├── db/           (database)
    └── utils/        (jwt)
```

## 🔐 Security Quick Checklist

- [ ] Change JWT_SECRET in .env
- [ ] Use strong passwords in tests
- [ ] Enable HTTPS in production
- [ ] Set NODE_ENV=production on backend
- [ ] Update environment variables on deploy
- [ ] Keep dependencies updated

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 3000/3001 in use | `lsof -i :3000` or use different port |
| Module not found | Run `npm install` in that directory |
| API connection refused | Ensure backend is running on :3001 |
| Camera permission denied | Grant permission in browser settings |
| No face detected | Ensure good lighting and centered face |
| No sound | Check browser audio not muted, volume >0 |
| Models won't load | Check internet, will fallback to CDN |
| Database locked | Ensure only one backend instance running |

## 📊 API Response Format

### Success (200)
```json
{
  "token": "jwt.token.here",
  "user": { "id": "...", "email": "..." }
}
```

### Error (4xx/5xx)
```json
{
  "error": "Descriptive error message"
}
```

## 🧪 Test Flows

### User Registration & Login
1. POST /auth/register with email/password
2. Receive JWT token
3. POST /auth/login with credentials
4. Get JWT token
5. Use token in Authorization header

### Emotion Detection
1. User allows camera
2. Face detected by face-api.js (local)
3. Emotion mapped (local)
4. Sound played (local)
5. Color changed (local)
6. POST /analytics/emotion logs count (backend)

### Analytics View
1. GET /analytics/stats
2. Receive emotion counts
3. Charts render with data

## 📱 Responsive Breakpoints

- **Desktop**: 1920px+
- **Tablet**: 768px - 1919px
- **Mobile**: 375px - 767px

## ⚙️ Configuration

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🎓 Learning Path

1. Start: **README.md** (5 min)
2. Setup: **SETUP_GUIDE.md** (15 min)
3. Run: `setup.bat` or `setup.sh` (5 min)
4. Explore: Browse source code (30 min)
5. Test: **TESTING_CHECKLIST.md** (60 min)
6. Deploy: **SETUP_GUIDE.md** deployment section (30 min)
7. Extend: Add features based on **ARCHITECTURE.md**

## 💡 Quick Tips

- Check browser DevTools Console for errors
- Check backend terminal for server logs
- Use Network tab to see API calls
- Enable "Disable Cache" in DevTools while developing
- Hot reload works with `npm start`

## 🚀 Deployment Platforms

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Heroku
- **Database**: Can upgrade to PostgreSQL

## 📞 When Stuck

1. Check SETUP_GUIDE.md Troubleshooting
2. Check browser console (F12)
3. Check backend terminal logs
4. Verify .env files are correct
5. Try clearing browser cache (Ctrl+Shift+Del)
6. Try restarting both servers

## 🎯 Success Indicators

✅ Can register account
✅ Can login
✅ Camera shows live feed
✅ Emotion detected with sound
✅ Color changes with emotion
✅ Analytics dashboard loads
✅ Emotion counts increment
✅ Can adjust volume/sensitivity

## 📈 Performance Targets

- Page load: <3 seconds
- Model load: <10 seconds
- Detection: 30 FPS
- API response: <200ms
- Memory: <150MB frontend

## 🔄 Update & Maintain

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix
```

## 📚 External Resources

- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [Tone.js](https://tonejs.github.io)
- [Tailwind CSS](https://tailwindcss.com)

## 🎉 You're Ready!

Everything is set up and ready to go. Read the docs, run the setup script, and start testing!

---

**Quick Links:**
- 📋 Full Docs: See README.md, SETUP_GUIDE.md
- 🚀 Deploy: See SETUP_GUIDE.md Deployment section
- 🧪 Test: See TESTING_CHECKLIST.md
- 🏗️ Understand: See ARCHITECTURE.md

**Happy coding! 🚀**
