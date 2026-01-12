# Larrypixels 🎨✨

A retro 8-bit image pixelation web application with exclusive access control, social features, and gamification.

## Features

### 🔐 Security & Access
- 6-digit code gateway system for exclusive access
- Password-protected user accounts (bcrypt hashing)
- Admin dashboard for code generation and user management
- Session-based authentication

### 🎨 Image Creation
- Client-side pixelation with adjustable intensity (2-50 levels)
- 8 retro color palettes (Monochrome, Sepia, Green CRT, Blue Terminal, etc.)
- Image sharpening for enhanced clarity
- PNG download format
- Daily limit: 10 images (unlimited after 10 friend invitations)

### 👥 Social & Viral Features
- Daily shareable access codes (one per 24 hours)
- Invitation tracking system
- Twitter share with auto-download and webapp link
- Leaderboard with smart scoring formula
- Social links integration

### 📊 Gamification
- Personal stats dashboard
- Streak tracking
- Score calculation: (Images × 10) + (Codes × 20) + (Streak × 5)
- Unlimited access unlock at 10 invitations

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: bcrypt password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- Python 3.11+
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your credentials:
# - MONGO_URL: Your MongoDB connection string
# - ADMIN_PASSWORD: Your admin dashboard password
```

5. Start the backend server:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and set REACT_APP_BACKEND_URL to your backend URL
# For local development: http://localhost:8001
```

4. Start the development server:
```bash
yarn start
```

5. Open browser at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="larrypixels_db"
CORS_ORIGINS="*"
ADMIN_PASSWORD="your_secure_password"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Admin Access

1. Navigate to `/admin`
2. Enter your admin password (set in backend .env)
3. Generate 6-digit access codes for users
4. Monitor platform statistics and user activity

## User Flow

1. **Gateway**: Enter 6-digit access code
2. **Authentication**: Sign up with username, Discord handle, and password
3. **Studio**: Upload and pixelate images
4. **Dashboard**: View stats and generate daily shareable codes
5. **Leaderboard**: Compete with other users

## Security Notes

⚠️ **IMPORTANT**: Never commit `.env` files to Git

- All passwords are hashed using bcrypt
- Admin password stored in environment variable
- MongoDB credentials in environment variable
- `.gitignore` configured to exclude sensitive files

## Deployment

### Emergent Platform
- Use the native deployment option (50 credits/month)
- Environment variables managed through platform

### External Hosting
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Render, Heroku, or VPS
- **Database**: MongoDB Atlas (cloud)

Make sure to set all environment variables in your hosting platform.

## API Endpoints

### Authentication
- `POST /api/auth/verify-code` - Verify access code
- `POST /api/auth/signup` - Create user account
- `POST /api/auth/login` - User login

### Admin
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/generate-code` - Generate access code
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Platform statistics

### User
- `POST /api/user/daily-code` - Generate daily shareable code
- `POST /api/user/image-created` - Track image creation
- `GET /api/user/profile` - Get user profile

### Leaderboard
- `GET /api/leaderboard` - Get top users

## Contributing

This is a production application. For bugs or feature requests, please open an issue.

## License

All rights reserved.

## Contact

- Twitter: [@larrynfts](https://twitter.com/larrynfts)
- Discord: [Join Community](https://discord.gg/m4cA8sfMP)
- Larry Floor: [View Project](https://imbatman-03.github.io/Floor-Larry/)

---

**Built with ❤️ using Emergent Platform**