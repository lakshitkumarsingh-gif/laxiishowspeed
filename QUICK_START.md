# Neural Tutor Hub - Quick Setup Guide

## 🚀 Getting Started

### 1. **Get Your API Keys** (5 minutes)

#### Anthropic Claude (FREE $5 credit)
1. Go to https://console.anthropic.com/
2. Click "Sign up" or "Log in"
3. Create a new API key
4. Copy and save it

#### OpenAI GPT (Paid, $0.01+ per request)
1. Go to https://platform.openai.com/
2. Click "Sign up" or "Log in"
3. Go to "API keys" section
4. Create a new API key
5. Copy and save it

#### Google OAuth
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized origins: `http://localhost:3000` (and your production URL)
6. Copy Client ID and Client Secret

---

### 2. **Clone the Repository**

```bash
git clone https://github.com/lakshitkumarsingh-gif/laxiishowspeed.git
cd laxiishowspeed
```

---

### 3. **Setup Environment Variables**

```bash
# Copy the template
cp .env.example .env

# Edit with your API keys
nano .env
```

**Fill in:**
```env
# AI Models
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Security
JWT_SECRET=generate-random-secret-key-256-chars
```

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

### 4. **Install Dependencies**

#### Option A: Manual Setup (Recommended for development)

```bash
# Terminal 1: Install Backend
cd backend
npm install
cd ..

# Terminal 2: Install Frontend  
cd frontend
npm install
cd ..
```

#### Option B: Docker Setup (Recommended for production)

```bash
# Install Docker from https://www.docker.com/products/docker-desktop

# Then run:
docker-compose up -d
```

---

### 5. **Setup Database**

```bash
# Go to backend folder
cd backend

# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Seed sample data
npx prisma db seed
```

---

### 6. **Start Development Servers**

#### Manual Mode (Two terminals):

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

#### Docker Mode (One command):
```bash
docker-compose up -d
```

---

### 7. **Test the Application**

1. Open http://localhost:3000
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should see the dashboard
5. Click "Start a new lesson" to chat with Lumen

---

## 🔧 Troubleshooting

### "Google Sign-In not working"
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is in `.env`
- Verify OAuth callback URL is `http://localhost:3000` in Google Console

### "AI responses not working"
- Check that `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` are set in `.env`
- Check backend logs: `docker-compose logs -f backend`
- Verify API keys are valid

### "Database connection error"
- Make sure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run: `npx prisma db push`

### "Port 3000/3001 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

---

## 📝 Using the App

### Dashboard
- See your stats (conversations, subjects, quizzes, memories)
- Start a new conversation
- View recent chats

### Chat Interface
- Ask Lumen any question
- AI remembers your learning style
- Choose between Claude or GPT (in settings)

### Memory Page
- Manage what Lumen knows about you
- Set importance levels (1-10)
- Types: PREFERENCE, GOAL, STRENGTH, WEAKNESS

### Settings
- Change theme (Light/Dark/Rainbow)
- Switch AI model (Claude/GPT)
- Set learning level (Beginner/Intermediate/Advanced)

---

## 🚀 Deployment

### Deploy to Your Server

```bash
# 1. SSH into your server
ssh user@your-domain.com

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Clone repo
git clone https://github.com/your-username/laxiishowspeed.git
cd laxiishowspeed

# 4. Setup .env with production values
nano .env

# 5. Start with Docker
docker-compose up -d

# 6. Access at http://your-domain.com
```

### SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/

# Restart Nginx in docker-compose
docker-compose restart nginx
```

---

## 💡 Features

✅ Google OAuth authentication  
✅ Persistent memory with importance weighting  
✅ Dual AI (Claude Sonnet + GPT-4)  
✅ Beautiful dark/light/rainbow themes  
✅ Chat history and conversation management  
✅ User settings and preferences  
✅ Responsive design (mobile-friendly)  
✅ Real-time AI responses  
✅ Production-ready architecture  

---

## 🆘 Still Need Help?

1. Check logs: `docker-compose logs -f`
2. Read the [main README](./README.md)
3. Open a GitHub issue
4. Check API key permissions

---

**Happy learning! 🚀**
