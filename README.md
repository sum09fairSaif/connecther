# ConnectHer: An Early Pregnancy Fitness Platform

A web application helping women in early pregnancy stay active safely by providing personalized workout recommendations based on their daily symptoms, energy levels, and mood.

## Purpose Statement

First and second-trimester pregnant women face significant anxiety and stigma around exercise, often avoiding physical activity out of fear of harming their baby despite evidence that safe exercise is beneficial. 
Our app removes this barrier by providing personalized, vetted workout recommendations based on how a woman feels each day using their specific symptoms, energy levels, and emotional state. 
By meeting women where they are physically and mentally, we empower them to stay active safely during the most uncertain phase of pregnancy when support and reliable information are hardest to find.

## Features

* **Daily personalized check-in** - Quick assessment of symptoms (nausea, fatigue, dizziness), mood, and energy level
* **Smart workout matching** - Algorithm recommends 5-15 minute first-trimester-safe workouts based on user's current state
* **Curated video library** - Pre-vetted exercises across intensity levels (gentle stretching to moderate strength training)
* **Favorites library** - Save your preferred workouts for quick access
* **Safety-first design** - All workouts vetted for first trimester safety with clear modifications and rest encouragement
* **Removes guesswork** - Eliminates the "is this safe?" anxiety that keeps pregnant women sedentary
* **Builds healthy habits** - Encourages consistent movement adapted to the fluctuating reality of early pregnancy

## Tech Stack

**Frontend:** React + TypeScript + Vite  
**Backend:** Node.js + Express + TypeScript  
**Database:** PostgreSQL (via Supabase)  
**Auth:** Supabase Authentication  
**AI:** Gemini API for intelligent recommendations and chatbot

---

## Get Started

### Prerequisites
- Node.js (v18+)
- A Supabase account
- Gemini API key (for AI features)

### Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Set up environment variables**
   
   Frontend `.env`:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
   
   Backend `.env`:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_KEY=your-service-key
   GEMINI_API_KEY=your-gemini-key
   PORT=3000
   ```

3. **Set up the database**
   - Go to Supabase Dashboard → SQL Editor
   - Run the `supabase_schema.sql` script

4. **Run the app**
   ```bash
   # Frontend
   npm run dev
   
   # Backend (in another terminal)
   cd backend && npm run dev
   ```

## Safety

⚠️ **Important Disclaimer:** ConnectHER is an informational tool and not a substitute for professional medical advice. Always consult a healthcare provider before starting any exercise program during pregnancy.

All workout recommendations are:
- Vetted for first-trimester safety
- Include modifications for different symptom severities
- Encourage rest when needed
- Focus on low-impact, pregnancy-safe movements

---

## Future Additions

- [ ] Extend to 2nd and 3rd trimester
- [ ] Track workout completion history
- [ ] Progress analytics and insights
- [ ] Community features (share experiences)
- [ ] Integration with healthcare providers
- [ ] Push notifications for daily check-ins
- [ ] Wearable device integration

---

## Our Lovely Team! 👥

Built by women for women navigating the uncertainty of early pregnancy.

Team: Sumehra, Scar, Salena, Kaylee, & Agrima

Hack Beanpot 2026

---
