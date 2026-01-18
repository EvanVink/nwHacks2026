# EmotiSound - Setup & Deployment Guide

## 🚀 Local Development Setup

### Step 1: Install Dependencies

#### Frontend
```bash
cd emotisound
npm install
```

#### Backend
```bash
cd ../emotisound-backend
npm install
```

### Step 2: Environment Configuration

#### Frontend (.env)
File: `emotisound/.env`
```env
REACT_APP_API_URL=http://localhost:3001/api
```

#### Backend (.env)
File: `emotisound-backend/.env`
```env
PORT=3001
JWT_SECRET=your-super-secret-key-change-in-production
NODE_ENV=development
```

### Step 3: Download Face Detection Models (Optional)

For production use, download face-api.js models from:
https://github.com/justadudewhohacks/face-api.js-models

Place these files in `emotisound/public/models/`:
- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-weights.bin`
- `face_expression_model-weights_manifest.json`
- `face_expression_model-weights.bin`

**Note:** The app will automatically fall back to CDN models if local files aren't found, so this step is optional for development.

### Step 4: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd emotisound-backend
npm start
# Server runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd emotisound
npm start
# App runs on http://localhost:3000
```

## 🧪 Testing the Application

1. **Open browser** to `http://localhost:3000`
2. **Create account** with email and password
3. **Click "Start Camera"** to enable video stream
4. **Make facial expressions** to test emotion detection
5. **Test controls:**
   - Toggle mute button to silence/enable audio
   - Adjust volume slider
   - Adjust sensitivity slider
6. **Check analytics** page for emotion statistics

## 🌐 Deployment

### Frontend Deployment (Vercel)

```bash
cd emotisound
npm run build
```

1. Connect your GitHub repository to Vercel
2. Set environment variable in Vercel dashboard:
   - `REACT_APP_API_URL` = your backend API URL
3. Deploy

### Backend Deployment (Railway/Render)

#### Using Railway:
1. Push code to GitHub
2. Connect repository to Railway
3. Add environment variables:
   - `PORT` = 3001
   - `JWT_SECRET` = generate a strong secret
   - `NODE_ENV` = production
4. Deploy

#### Using Render:
1. Push code to GitHub
2. Create new Web Service on Render
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables same as above
6. Deploy

### Production Environment Variables

**Frontend (.env.production)**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

**Backend (.env.production)**
```env
PORT=3001
JWT_SECRET=generate-a-long-random-string-here
NODE_ENV=production
```

## 📊 Database

The application uses SQLite by default. For larger deployments, consider:

### Upgrading to PostgreSQL

Update `emotisound-backend/src/db/database.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Update all db.run/db.get/db.all calls to use pool.query()
```

Environment variables for PostgreSQL:
```env
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=emotisound
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to a long random string
- [ ] Enable HTTPS in production
- [ ] Set NODE_ENV=production on backend
- [ ] Use strong database passwords
- [ ] Enable CORS only for your domain
- [ ] Implement rate limiting on API endpoints
- [ ] Add database backups
- [ ] Use environment variables for all secrets
- [ ] Keep dependencies updated: `npm audit fix`

## 📈 Scaling Recommendations

### For >1000 users:
- Switch to PostgreSQL with connection pooling
- Add Redis for session caching
- Implement API rate limiting (express-rate-limit)
- Use CDN for static assets
- Add monitoring (Sentry, DataDog)

### For >10000 users:
- Implement load balancing
- Use managed database services (AWS RDS, Heroku Postgres)
- Add caching layer (Redis/Memcached)
- Implement proper logging (Winston, Bunyan)
- Use object storage (S3) if storing files

## 🐛 Troubleshooting Deployment

### Frontend shows "Cannot GET /"
- Ensure `npm run build` completed successfully
- Check that static files are being served
- Verify environment variables are set

### Backend returns 503 errors
- Check that PORT is correctly set
- Verify database is initialized
- Check logs for connection errors

### CORS errors in browser
- Update CORS settings in `index.js` if needed
- Verify REACT_APP_API_URL matches backend domain
- Check that API_BASE_URL doesn't have trailing slash

### Database locked errors
- Ensure only one instance of backend is running
- Check file permissions on emotisound.db
- Consider upgrading to PostgreSQL

## 📝 Maintenance

### Regular Tasks
- Monitor application logs
- Review authentication logs
- Back up database regularly
- Update dependencies monthly
- Check for security vulnerabilities: `npm audit`

### Monitoring Endpoints
- Health check: `GET /health`
- App status: Check both frontend and backend

## 🚀 CI/CD Pipeline Example (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy EmotiSound

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Deploy backend to your service
          
      - name: Deploy Frontend
        run: |
          # Deploy frontend to Vercel/Netlify
```

## 📚 Additional Resources

- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [face-api.js Docs](https://github.com/justadudewhohacks/face-api.js)
- [Tone.js Guide](https://tonejs.github.io/)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app/)

---

For production deployments, ensure you test thoroughly and follow all security best practices.
