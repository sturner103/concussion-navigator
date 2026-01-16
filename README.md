# Concussion Navigator

A free, private assessment tool that helps people recovering from concussion understand their symptoms and find appropriate healthcare providers in their area.

## Features

- **22-Question Assessment**: Covers injury details, symptoms, impact, medical history, and recovery journey
- **Smart Categorization**: Places users into appropriate recovery categories (Acute Care, Active Recovery, Persistent Symptoms, etc.)
- **Intelligent Resource Suggestions**: Based on symptom patterns, suggests relevant specialists (vestibular therapy for dizziness, vision therapy for visual symptoms, etc.)
- **AI-Powered Local Search**: Uses Claude with web search to find real, specific providers in the user's area
- **Resource Details**: Additional AI-powered research on specific providers

## Categories

- **Acute Care**: Recent injury requiring initial assessment
- **Active Recovery**: Progressing through recovery with proper support
- **Persistent Symptoms**: Symptoms lasting longer than typical recovery
- **Complex Presentation**: Multiple factors requiring comprehensive care
- **Return-to-Activity Focus**: Ready to safely return to sport, work, or school

## Resource Types

- Concussion clinics and specialists
- Sports medicine physicians
- Neurologists
- Concussion-trained physiotherapists
- Vestibular therapists
- Neuro-optometrists / Vision therapy
- Neuropsychologists
- Mental health professionals

## Tech Stack

- **Frontend**: React + Vite
- **Hosting**: Netlify
- **Backend**: Netlify Functions (serverless)
- **AI**: Claude API with web search
- **Job Queue**: Upstash Redis

## Environment Variables Required

```
ANTHROPIC_API_KEY=your_key_here
UPSTASH_REDIS_REST_URL=your_url_here
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Push to GitHub and connect to Netlify. Set environment variables in Netlify dashboard.

## Disclaimer

This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. If you have red flag symptoms (severe worsening headache, repeated vomiting, seizures, weakness, or worsening confusion), seek emergency care immediately.
