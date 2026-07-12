# AssetFlow - Enterprise Asset & Resource Management System

## Environment Variables

Create a `.env.local` file at the root of your project and add the following variables. **Never commit `.env.local` to version control.**

### Where to get these values:

1. **NEXT_PUBLIC_SUPABASE_URL** & **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**
   - Go to your Supabase Project → Settings → API
   - Copy the "Project URL" as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the "anon public" key as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

2. **SUPABASE_SECRET_KEY**
   - In the same Supabase API settings page, copy the "service_role" key
   - ⚠️ **Important**: Keep this secret! Never expose it in frontend code.

3. **OPENAI_API_KEY**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key and copy it here

### Example .env.local:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-service-role-key

# OpenAI API Key (for AI Assistant)
OPENAI_API_KEY=sk-your-openai-api-key
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in all required values in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Supabase** (Auth, Database, Storage, Realtime)
- **OpenAI** API (AI Assistant)
- **Lucide React** icons
- **Framer Motion** for animations
- **React Hook Form** + **Zod** for form handling
- **Recharts** for analytics
- **TanStack Table** for data tables
- **date-fns** for date calculations
- **Zustand** for state management

## Project Structure
```
.
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── organization/
│   │   ├── assets/
│   │   ├── allocations/
│   │   ├── bookings/
│   │   ├── maintenance/
│   │   ├── audits/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── office-map/
│   │   └── ai-assistant/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── top-nav.tsx
│   └── ui/
├── hooks/
├── lib/
│   ├── supabase/
│   └── utils.ts
└── types/
```
