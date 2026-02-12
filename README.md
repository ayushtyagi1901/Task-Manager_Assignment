# Project A: Tasks Generator (Mini Planning Tool)

A production-ready demo app that helps users turn feature ideas into structured user stories and engineering tasks using AI.

## Features

- **Spec Creation**: Simple form to capture goal, target users, constraints, risks, and platform.
- **AI Generation**: Automatically generates User Stories and Engineering Tasks based on the spec.
- **Task Management**: Drag-and-drop interface to reorder and group engineering tasks.
- **Export**: Copy to clipboard or download as Markdown.
- **History**: View recent specs.
- **Status Dashboard**: Real-time health checks for Backend, Database, and LLM.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, dnd-kit.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL, Drizzle ORM.
- **AI**: Google Gemini API (gemini-1.5-pro).
- **Build**: Vite.

## How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials (Database URL, Supabase URL, Anon Key, Service Role Key)
   - Add your Google Gemini API key
   - See `.env.example` for details

3. **Set up the database:**
   ```bash
   npm run db:push
   ```
   This will create the necessary tables in your Supabase database.

4. **Enable Email Authentication in Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Email" provider

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   - Navigate to `http://localhost:5000`
   - You'll be redirected to `/auth` to sign up or sign in
   - After authentication, you can start creating specs

## Status

### Done
- ✅ Spec creation form with validation and error handling.
- ✅ AI generation of User Stories and Tasks (structured JSON format).
- ✅ Task Board with drag-and-drop reordering and grouping.
- ✅ Markdown export (copy to clipboard and download).
- ✅ Status page with real-time health checks for Backend, Database, and LLM.
- ✅ User Authentication (Supabase Auth - sign up/login).
- ✅ User-specific data isolation (users can only see their own specs).
- ✅ Responsive UI with Dark Mode support (via Tailwind/Shadcn).
- ✅ Persistent storage (PostgreSQL via Supabase).
- ✅ Templates support (Web App, Mobile App, API Service, Internal Tool).
- ✅ Risk/Unknowns section in spec form.
- ✅ View last 5 generated specs.

### Not Done / Future Improvements
- ❌ Multiple plan iterations per spec (currently supports regeneration by creating new output).
- ❌ PDF export (markdown export available).
- ❌ Task editing (currently supports reordering only).

## Environment Variables

Required environment variables (see `.env.example` for template):

- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `VITE_SUPABASE_URL` - Supabase project URL (for frontend)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key (for frontend)
- `SUPABASE_URL` - Supabase project URL (for backend)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for backend auth verification)
- `GEMINI_API_KEY` - Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/apikey))
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Hosting

This project can be easily deployed to Vercel, Railway, Render, or any Node.js hosting platform.
- **Database**: Uses Supabase PostgreSQL
- **Authentication**: Uses Supabase Auth
- **AI**: Uses Google Gemini API
