# Neural Tutor Hub - My First AI

**Enterprise-Grade AI Tutoring Platform** - A personalized learning experience powered by Anthropic Claude & OpenAI GPT with persistent memory, multi-model support, and self-hosted architecture.

## 🚀 Features

✨ **Dual AI Models**: Seamlessly switch between Anthropic Claude and OpenAI GPT  
💾 **Persistent Memory**: AI remembers your learning style, goals, and preferences with importance weighting  
🎨 **Theme Support**: Dark, Light, and Rainbow themes  
🔐 **Google OAuth**: Secure authentication  
📊 **Personalized Dashboard**: Track progress, conversations, documents, and learning streaks  
⚙️ **Smart Settings**: Configure learning level (Beginner/Intermediate/Advanced), goals, and preferred model  
🎯 **Quick Actions**: Pre-built prompts for common learning scenarios  
🎤 **Voice I/O**: Speak to your tutor and hear responses  
📄 **PDF Learning**: Upload and learn from documents  
📋 **Auto Quizzes & Flashcards**: Generate quizzes from lessons  
🧠 **Memory Management**: Edit and manage what your AI tutor knows about you  
📱 **Responsive Design**: Works on all devices  
🌍 **Self-Hosted**: Deploy on your own server, build a company around it  

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **UI Components**: Shadcn/ui + Headless UI
- **Authentication**: NextAuth.js with Google OAuth
- **Real-time**: Socket.io for live updates

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth
- **AI Integration**: Anthropic SDK + OpenAI SDK
- **Caching**: Redis for session & context management
- **File Storage**: Multer + Sharp for PDFs

### DevOps & Infrastructure
- **Server**: Self-hosted (Docker containerized)
- **Database**: PostgreSQL 16+
- **Cache**: Redis 7+
- **Reverse Proxy**: Nginx with SSL support
- **Process Manager**: PM2
- **Monitoring**: Built-in health checks

## 📁 Project Structure

```
laxiishowspeed/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── (auth)/             # Authentication pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── signin/page.tsx # Sign in
│   │   │   └── callback/page.tsx # OAuth callback
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── chat/[id]/page.tsx
│   │   │   ├── memory/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── subjects/page.tsx
│   │   │   └── quizzes/page.tsx
│   │   └── api/                # API route handlers
│   ├── components/             # Reusable components
│   │   ├── Sidebar.tsx
│   │   ├── ChatInterface.tsx
│   │   ├── ThemeSwitcher.tsx
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & helpers
│   ├── styles/                 # Global styles
│   └── types/                  # TypeScript definitions
├── backend/                     # Express.js server
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Database models (Prisma)
│   │   ├── middleware/         # Auth, validation, errors
│   │   ├── services/           # AI, email, PDF parsing
│   │   ├── utils/              # Helpers
│   │   └── index.ts            # App entry point
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/
│   └── Dockerfile
├── docker-compose.yml          # Full stack setup
├── nginx.conf                  # Reverse proxy config
└── docs/                        # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (recommended)
- API Keys: Anthropic, OpenAI, Google OAuth

### Local Development

**1. Clone & Install**
```bash
git clone https://github.com/lakshitkumarsingh-gif/laxiishowspeed.git
cd laxiishowspeed

# Frontend
cd frontend
npm install

# Backend (new terminal)
cd backend
npm install
```

**2. Environment Setup**

```bash
# backend/.env
NODE_ENV=development
DATABASE_URL=postgresql://aiuser:aipassword@localhost:5432/my_first_ai
REDIS_URL=redis://localhost:6379
PORT=3001

# AI Models
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

**3. Database Setup**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed  # Optional: seed sample data
```

**4. Run Development Servers**
```bash
# Terminal 1: Backend
cd backend && npm run dev
# Runs on http://localhost:3001

# Terminal 2: Frontend  
cd frontend && npm run dev
# Runs on http://localhost:3000
```

**5. Access Application**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:3001
- 📚 API Docs: http://localhost:3001/api/docs

---

## 🐳 Docker Deployment (Self-Hosted)

### Quick Deploy
```bash
# One-command deployment
docker-compose up -d

# Access via Nginx
http://your-domain.com
```

### Production Setup

**1. Server Preparation**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose nginx postgresql postgresql-contrib
sudo usermod -aG docker $USER
```

**2. Environment Variables**
```bash
# Create .env file from template
cp .env.example .env
# Edit .env with production values
```

**3. SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

**4. Deploy**
```bash
# Build and start
docker-compose -f docker-compose.yml up -d

# Monitor logs
docker-compose logs -f

# Stop services
docker-compose down
```

**5. Backup Database**
```bash
# Automatic daily backups
0 2 * * * docker exec postgres pg_dump -U aiuser my_first_ai > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 💾 Database Schema

### Core Models
- **User**: Profile, authentication, preferences
- **Conversation**: Chat sessions with metadata
- **Message**: Individual messages, AI model used, tokens
- **Memory**: User learning profile (preferences, goals, strengths, weaknesses)
- **Document**: Uploaded PDFs, lecture notes
- **Quiz**: Auto-generated quizzes and performance
- **Subject**: Learning subjects and progress tracking
- **Settings**: User preferences (theme, model, learning level)

---

## 🔌 API Endpoints

### Authentication
```
GET    /api/auth/google         - Google OAuth initiation
POST   /api/auth/google/callback - OAuth callback
POST   /api/auth/logout          - Logout
GET    /api/auth/me              - Current user profile
```

### Chat & Conversations
```
POST   /api/conversations        - Create new conversation
GET    /api/conversations        - List all conversations
GET    /api/conversations/:id    - Get conversation details
DELETE /api/conversations/:id    - Delete conversation

POST   /api/conversations/:id/messages    - Send message (streams response)
GET    /api/conversations/:id/messages    - Get message history
DELETE /api/messages/:id                  - Delete message
```

### Memory Management
```
GET    /api/memories             - Get user memories
POST   /api/memories             - Create memory entry
PUT    /api/memories/:id         - Update memory
DELETE /api/memories/:id         - Delete memory
PATCH  /api/memories/:id/importance - Update importance score
```

### Settings & Profile
```
GET    /api/settings             - Get user settings
PUT    /api/settings             - Update settings
GET    /api/profile              - Get user profile
PUT    /api/profile              - Update profile
```

### Documents
```
POST   /api/documents            - Upload PDF
GET    /api/documents            - List documents
GET    /api/documents/:id        - Get document
DELETE /api/documents/:id        - Delete document
```

### Subjects & Progress
```
GET    /api/subjects             - List all subjects
POST   /api/subjects             - Create subject
GET    /api/subjects/:id/progress - Get subject progress
```

### Quizzes
```
POST   /api/quizzes              - Generate quiz
GET    /api/quizzes              - List quizzes
POST   /api/quizzes/:id/submit   - Submit quiz answers
GET    /api/quizzes/:id/results  - Get quiz results
```

---

## 🔐 Security Features

✅ Google OAuth 2.0 with JWT tokens  
✅ Rate limiting (30 req/s general, 10 req/s API)  
✅ CORS protection  
✅ Input validation & sanitization  
✅ SQL injection prevention (Prisma ORM)  
✅ XSS protection  
✅ CSRF tokens  
✅ Secure password practices  
✅ Environment variable encryption  
✅ Database connection pooling  
✅ API key rotation support  

---

## 📊 Scaling & Performance

### Horizontal Scaling
- Stateless API design
- Load balancing with Nginx
- Database connection pooling (Prisma)
- Redis caching layer
- CDN-ready static assets

### Database Optimization
- PostgreSQL with proper indexing
- Connection pooling (PgBouncer)
- Automated backups
- Query optimization
- Partition strategy for large datasets

### Monitoring & Alerts
- PM2 process monitoring
- Health check endpoints
- Error logging (Winston)
- Performance metrics
- Database monitoring

---

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Team/organization support
- [ ] Custom AI model fine-tuning
- [ ] Integration with LMS platforms
- [ ] Mobile apps (React Native)
- [ ] Video tutorial support
- [ ] Collaboration features
- [ ] Certification system
- [ ] Payment integration (Stripe)
- [ ] Multi-language support

---

## 🤝 Building a Company

This platform is designed to be your business foundation:

1. **White Label**: Customize branding & colors
2. **Multi-tenant**: Support multiple organizations
3. **Pricing Tiers**: Implement subscription plans
4. **Analytics**: Track user engagement
5. **API Access**: Allow third-party integrations
6. **Support System**: Help desk integration
7. **Admin Panel**: User & content management

---

## 📄 License

AGPL-3.0

## 📧 Support

For issues, feature requests, or deployment help, open a GitHub issue.

---

**Built for lifelong learners • Self-hosted for your control • Scalable for your growth** ❤️
