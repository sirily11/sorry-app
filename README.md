# The Sorry App 💐

An AI-powered web application that helps you craft heartfelt, sincere apology messages. Whether you need to say sorry to your girlfriend, partner, or loved one, The Sorry App uses advanced AI to generate thoughtful, personalized apology messages based on your specific situation.

## ✨ Features

- **AI-Generated Apologies**: Uses advanced AI models to create genuine, heartfelt apology messages
- **Custom Scenarios**: Describe your situation and get a personalized apology
- **Custom Instructions**: Add specific instructions to tailor the apology to your needs
- **Rate Limiting**: Fair usage with 5 apologies per day per user (configurable)
- **Session Management**: Secure fingerprint-based session tracking
- **Public Sharing**: Option to make your apology public and share with others
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Real-time Generation**: Stream apology text as it's being generated

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5.4](https://nextjs.org) with App Router
- **Runtime**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Build Tool**: Turbopack (faster than webpack)
- **Linting/Formatting**: [Biome](https://biomejs.dev/) (instead of ESLint/Prettier)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Animations**: Framer Motion
- **Database**: PostgreSQL with [Neon](https://neon.tech/)
- **ORM**: Drizzle ORM
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Rate Limiting**: [Upstash Rate Limit](https://upstash.com/docs/redis/features/ratelimiting)
- **Caching**: [Upstash Redis](https://upstash.com/)
- **User Tracking**: FingerprintJS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 20 or later
- npm, yarn, pnpm, or bun package manager

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sirily11/sorry-app.git
cd sorry-app
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Create a `.env` or `.env.local` file in the root directory with the following variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Upstash Redis (for rate limiting and caching)
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
REDIS_URL="redis://..."

# AI Gateway (OpenAI or compatible API)
AI_GATEWAY_API_KEY="..."
AI_MODEL_NAME="gpt-4" # or your preferred model

# Rate Limiting (optional, defaults to 5)
RATE_LIMIT_MAX=5
```

### 4. Set up the database

Run the database migrations using Drizzle Kit:

```bash
npx drizzle-kit push
```

This will create the necessary tables in your PostgreSQL database.

### 5. Run the development server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📦 Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

## 🗄️ Database Schema

The app uses a simple PostgreSQL schema with one main table:

**messages**
- `cid` (UUID): Primary key, unique message ID
- `content` (Text): The generated apology message
- `scenario` (Text): User's description of the situation
- `title` (Text): Optional title for the apology
- `summary` (Text): Short summary for sharing
- `isPublic` (Boolean): Whether the apology can be shared publicly
- `fingerprint` (VARCHAR): User's fingerprint for session tracking
- `createdAt` (Timestamp): Creation timestamp

## 🏗️ Project Structure

```
sorry-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── actions.ts       # Server Actions
│   │   ├── api/             # API routes
│   │   ├── session/         # Session pages
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── sorry-form.tsx   # Main apology form
│   │   ├── share-dialog.tsx # Share dialog
│   │   └── ui/              # shadcn/ui components
│   └── lib/                 # Utility libraries
│       ├── db/              # Database configuration
│       ├── auth.ts          # Authentication utilities
│       ├── ratelimit.ts     # Rate limiting configuration
│       └── utils.ts         # Helper functions
├── public/                  # Static assets
├── drizzle/                 # Database migrations
└── ...config files
```

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy The Sorry App is to use the [Vercel Platform](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Configure the environment variables in the Vercel dashboard
4. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

### Environment Variables

Make sure to add all required environment variables in your deployment platform:
- Database connection string
- Upstash Redis credentials
- AI API key and model name
- Rate limit configuration (optional)

## 🔒 Security Features

- **Fingerprint-based authentication**: Uses FingerprintJS for secure, privacy-friendly user tracking
- **Rate limiting**: Prevents abuse with configurable daily limits per user
- **Session cookies**: Secure cookie-based session management
- **Input validation**: All user inputs are validated server-side
- **Public/private messages**: Users control whether apologies can be shared

## 🎨 Customization

The app uses Tailwind CSS v4 with a custom theme. You can customize colors, fonts, and spacing in:
- `src/app/globals.css` - Global styles and CSS variables
- `tailwind.config.js` - Tailwind configuration
- `components.json` - shadcn/ui configuration

## 📝 License

This project is open source and available for personal and commercial use.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Vercel AI SDK](https://sdk.vercel.ai/)
- Database by [Neon](https://neon.tech/)
- Rate limiting by [Upstash](https://upstash.com/)

---

Made with ❤️ using AI
