# AI Resume ATS Analyzer & Optimizer

A microservice-based architecture to scan, rate, and optimize professional resumes against customized Job Descriptions utilizing Docker, FastAPI, PostgreSQL, Redis, and Google's Gemini LLM.

## Service Breakdown

1. **Database**: PostgreSQL 15 running schemas for users, resumes, jobs, and audits.
2. **Redis**: Cache structures, rate limits, and authentication state blacklists.
3. **Gateway Service**: Single entry point API routing using FastAPI reverse-proxying.
4. **Auth Service**: User registrations, cryptographic hashing (bcrypt), and JWT access tokens.
5. **Resume Service**: Multi-format document parser parsing PDF, DOCX, and text formats.
6. **AI Service**: Gemini AI model orchestration generating ATS overall matches, missing keyword lists, and markdown bullet point refactors.
7. **Frontend Service**: React dashboard presenting metric scores, interactive bento grids, and responsive charts.

## Deployment Instructions

To spin up the entire multi-service container mesh, run:

```bash
docker-compose up --build -d
```

Ensure your `.env` file exists and holds a valid `GOOGLE_AI_API_KEY` credential prior to executing the command.
The services will be exposed at:
- **Frontend Panel**: `http://localhost:3000`
- **Gateway Gateway**: `http://localhost:8000`
