# EmotiSound 🎵♿

A privacy-first, full-stack accessibility web application that translates facial expressions into non-verbal sensory feedback (sound and color). This tool helps blind, low-vision, and neurodivergent users perceive emotional context through alternative sensory channels.

## 📋 Project Structure

```
emotisound/                      # React frontend
emotisound-backend/              # Express backend API
emotion-sound-readme.md          # Original product specification
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A modern web browser with camera support

### Frontend Setup

```bash
cd emotisound
npm install
npm start
```

Frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd emotisound-backend
npm install
npm start
```

Backend API will be running on `http://localhost:3001`

## 🎯 Features

### Authentication
- Email/password registration and login
- JWT-based session management
- User preferences persistence
- Privacy-focused (no facial data stored)

### Facial Expression Detection
- Real-time single-face detection
- 4 basic emotions: Happy, Sad, Angry, Neutral
- Uses face-api.js for browser-side processing
- Confidence scoring for detection accuracy

### Sensory Feedback

#### Audio Mapping
- **Happy** → 440 Hz (A4) - Bright, ascending arpeggio
- **Sad** → 220 Hz (A3) - Deep, descending tone
- **Angry** → 330 Hz (E4) - Sharp, staccato
- **Neutral** → 261.63 Hz (C4) - Pure sine wave

#### Visual Feedback
- Real-time color changing based on detected emotion
- **Happy** → Yellow/Gold (#FFD700)
- **Sad** → Blue (#4169E1)
- **Angry** → Red (#DC143C)
- **Neutral** → Gray (#808080)

### User Controls
- Camera enable/disable toggle with visual indicator
- Audio mute/unmute button
- Volume level slider
- Sensitivity adjustment for emotion detection

### Analytics
- Anonymized emotion detection frequency tracking
- Emotion distribution charts (pie and bar charts)
- Detection count statistics
- Session history tracking

## 📁 Frontend Architecture

```
src/
├── components/
│   ├── Auth/              # Login & Register components
│   ├── Camera/            # Video preview and controls
│   ├── Audio/             # Audio controls (volume, mute)
│   ├── Analytics/         # Analytics dashboard
│   └── UI/                # Display components
├── hooks/
│   ├── useAuth.ts         # Authentication logic
│   ├── useCamera.ts       # Camera stream management
│   └── useEmotionDetection.ts  # Real-time emotion detection
├── services/
│   ├── apiClient.ts       # HTTP API client
│   ├── faceDetection.ts   # face-api.js wrapper
│   └── audioEngine.ts     # Tone.js audio synthesis
├── types/
│   └── index.ts           # TypeScript type definitions
├── utils/
│   ├── emotionMapper.ts   # Emotion mapping logic
│   └── constants.ts       # Configuration constants
└── App.tsx                # Main app component
```

## 🔧 Backend Architecture

```
src/
├── routes/
│   ├── auth.js            # Authentication endpoints
│   ├── user.js            # User preferences endpoints
│   └── analytics.js       # Analytics endpoints
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── db/
│   └── database.js        # SQLite database initialization
└── utils/
    └── jwt.js             # JWT token generation and verification
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

#### User
- `GET /api/user/preferences` - Get user preferences (protected)
- `PATCH /api/user/preferences` - Update preferences (protected)

#### Analytics
- `POST /api/analytics/emotion` - Log emotion event (protected)
- `GET /api/analytics/stats` - Get emotion statistics (protected)
- `GET /api/analytics/sessions` - Get session history (protected)
- `POST /api/analytics/session/start` - Start a session (protected)
- `POST /api/analytics/session/:sessionId/end` - End a session (protected)

## 🔐 Privacy & Security

### Privacy Guarantees
- ✅ Video processing happens entirely in the browser
- ✅ No facial images are stored or transmitted
- ✅ No facial recognition is performed
- ✅ Only anonymous emotion counts are stored on the backend
- ✅ Users can disable camera and audio at any time

### Security Features
- JWT-based authentication with 7-day token expiry
- Bcrypt password hashing
- CORS protection
- Environment variables for sensitive secrets

## 📦 Tech Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS for styling
- face-api.js for emotion detection
- Tone.js for audio synthesis
- Recharts for data visualization
- Lucide React for icons
- Axios for HTTP requests

### Backend
- Node.js with Express
- SQLite for data storage
- JWT for authentication
- Bcryptjs for password hashing
- CORS for cross-origin requests

## 🚀 Deployment

### Frontend (Vercel/Netlify)

```bash
cd emotisound
npm run build
# Deploy the build directory
```

### Backend (Heroku/Railway/Render)

```bash
cd emotisound-backend
npm install
npm start
```

Update the `REACT_APP_API_URL` environment variable to point to your deployed backend.

## 📊 Testing the Application

1. **Register a new account** with email and password
2. **Click "Start Camera"** to enable video stream
3. **Position your face** in front of the camera
4. **Observe emotion detection** in real-time with sound and color feedback
5. **Adjust volume and sensitivity** as needed
6. **View analytics** to see emotion distribution over time

## ♿ Accessibility Features

- Screen reader support with ARIA labels
- Keyboard navigation throughout the app
- High contrast color palette
- Clear visual and audio feedback
- Simple, intuitive UI design
- Descriptive button labels and error messages

## 🔄 Development Workflow

### Adding a New Feature

1. Create components in `src/components/`
2. Add types in `src/types/`
3. Create services in `src/services/` if needed
4. Add custom hooks in `src/hooks/` for logic
5. Use in `App.tsx` or child components

### Backend Development

1. Create route handlers in `src/routes/`
2. Use database utilities from `src/db/database.js`
3. Apply auth middleware for protected routes
4. Test endpoints using curl or Postman

## 📝 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
```

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions for camera access
- Ensure the camera device is connected and not in use elsewhere
- Try a different browser

### No sound feedback
- Check browser audio permissions
- Ensure volume slider is not at 0%
- Check browser console for errors
- Verify Tone.js initialized successfully

### Authentication errors
- Clear browser localStorage (dev tools)
- Check backend is running (`npm start`)
- Verify `.env` files are configured correctly
- Check API endpoint in browser Network tab

### Models not loading
- Check that `/public/models/` directory exists
- Ensure face-api.js model files are present
- Check browser console for specific errors
- Verify models URL in constants

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Open source and accessible to all

## 🙏 Acknowledgments

- face-api.js for emotion detection
- Tone.js for web audio synthesis
- Supabase for inspiration on privacy-first design
- The accessibility community for feedback and guidance

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for a more accessible world**
