# Deployment Guide – ResumeForge

A comprehensive guide to deploying the AI-Powered Domain-Aware Resume Generator.

## Technologies Used
- **Frontend**: React (Vite)
- **Backend/ML Service**: Python (Flask) + Scikit-Learn
- **AI Engine**: Google Gemini API
- **Database**: MongoDB Atlas
- **Email Service**: SMTP (Gmail)
- **Deployment Platforms**: Vercel (Frontend), Render/Railway (Backend)

---

## System Architecture
**Frontend** (Vercel) → **Backend/ML** (Render) → **Gemini API** / **MongoDB Atlas**

---

## Step 1: Clone Repository
```bash
git clone <repository-link>
cd PBL
```

## Step 2: Set up Database (MongoDB Atlas)
1.  **Create Cluster**: Log in to MongoDB Atlas and create a new free-tier cluster.
2.  **Create DB User**: Add a database user with `readWrite` permissions.
3.  **Allow Access**: In "Network Access", allow `0.0.0.0/0` for global access.
4.  **Get Connection String**: Copy the connection string (SRV) for the next steps.

## Step 3: Set up Gemini AI
1.  Go to [Google AI Studio](https://aistudio.google.com/).
2.  Generate an **API Key** for Gemini.
3.  Note the model name (default: `gemini-1.5-flash` or `gemini-2.0-flash`).

## Step 4: Deploy Backend (Render)
1.  **New Web Service**: Connect your GitHub repository to Render.
2.  **Configuration**:
    - **Runtime**: `Python`
    - **Root Directory**: `backend`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`
3.  **Environment Variables**:
    | Variable | Value |
    | :--- | :--- |
    | `GEMINI_API_KEY` | Your Gemini API Key |
    | `MONGODB_URI` | Your MongoDB Connection String |
    | `JWT_SECRET_KEY` | A random secure string |
    | `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (The Vercel URL) |
    | `USE_TRANSFORMER_MODEL` | `false` |
    | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |

## Step 5: Deploy Frontend (Vercel)
1.  **Import Project**: Select the repository in Vercel.
2.  **Configuration**:
    - **Framework Preset**: `Vite`
    - **Root Directory**: `frontend`
3.  **Environment Variables**:
    | Variable | Value |
    | :--- | :--- |
    | `VITE_API_URL` | `https://your-backend-url.onrender.com` |

---

## Testing & Verification
1.  **Check Health**: Visit `https://your-backend.onrender.com/api/health`.
2.  **Open App**: Visit your Vercel URL.
3.  **Basic Flow**: Sign up → AI Forge → Generate Resume → Download Outcome.

---

## Common Issues
- **Failed to Fetch**: Ensure `VITE_API_URL` in Vercel does NOT have a trailing slash (e.g., `https://api.com` instead of `https://api.com/`).
- **CORS Error**: Ensure the Vercel URL in `ALLOWED_ORIGINS` is exactly what the browser uses.
- **Render Cold Start**: The free tier of Render spins down; the first request may take up to 1 minute.

---

**Hosted Link**: [https://careerforge-puce.vercel.app](https://careerforge-puce.vercel.app)
