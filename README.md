# AI-Powered Domain-Aware Resume Generator

A production-grade, full-stack application that generates professional, ATS-optimized resumes using **Machine Learning** for domain classification and **Google Gemini AI** for content generation. Supports input via both a **React web interface** and **Google Forms** with automated email delivery.

## 🚀 Key Features

- **Dual ML Classification** — DistilBERT transformer (86% F1) + TF-IDF fallback with ensemble voting
- **Domain-Aware Generation** — 7 professional domain categories with tailored ATS keywords
- **Google Gemini AI** — Chain-of-thought prompt engineering for high-quality resume output
- **Google Forms Integration** — Automated pipeline via Apps Script webhook
- **Email Delivery** — Resumes emailed as PDF + DOCX attachments
- **Resume Quality Scoring** — Multi-dimensional scoring (completeness, skills, action verbs, quantification)
- **Multiple Export Formats** — Professional PDF, editable DOCX, styled HTML
- **Research-Grade Evaluation** — Built-in metrics pipeline for academic publication

## 🏗️ Architecture

```
┌──────────────────┐      ┌──────────────────┐
│   Google Form    │      │  React Frontend  │
└────────┬─────────┘      └────────┬─────────┘
         │ Apps Script              │ Axios
         ▼                         ▼
┌─────────────────────────────────────────────┐
│              Flask Backend API              │
│                                             │
│  Preprocessing → ML Classification →        │
│  Prompt Engineering → Gemini Generation →   │
│  PDF/DOCX Formatting → Email Delivery       │
└─────────────────────────────────────────────┘
```

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, TailwindCSS 4, Axios |
| Backend | Python Flask 3, Flask-CORS, Gunicorn |
| ML (Primary) | DistilBERT (HuggingFace Transformers) |
| ML (Fallback) | Scikit-learn (TF-IDF + Logistic Regression) |
| AI | Google Gemini 1.5 Pro API |
| Export | ReportLab (PDF), python-docx (DOCX) |
| Email | SMTP (Gmail App Password) |
| Integration | Google Apps Script |

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cd backend
# Edit .env with your Gemini API key and (optionally) SMTP credentials

# Start the server
python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Open
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 🤖 Domain Classification

The ML classifier recognizes **7 professional domains**:

| Domain | Description | Use Case |
|--------|-------------|----------|
| TECH | Software, Data Science, IT, Cloud | Emphasizes technical skills, system design |
| BUSINESS | Marketing, Finance, Operations, HR | Highlights revenue impact, leadership |
| CREATIVE | Design, UX/UI, Content, Media | Showcases portfolio, design thinking |
| HEALTH | Healthcare, Pharma, Clinical | Focuses on patient outcomes, compliance |
| LEGAL_ADMIN | Legal, Compliance, Administration | Emphasizes legal expertise, policy |
| EDUCATION | Teaching, Research, Ed-Tech | Highlights publications, student outcomes |
| OTHER | Multi-disciplinary backgrounds | Transferable skills focus |

### Model Performance

| Model | Accuracy | F1 (Weighted) | Inference Time |
|-------|----------|---------------|----------------|
| DistilBERT | 86.2% | 85.9% | ~50ms |
| TF-IDF + LR | 82.4% | 82.1% | <1ms |
| Ensemble | **87.1%** | **86.8%** | ~51ms |

## 📬 Google Forms Integration

1. Create a Google Form with the recommended fields
2. Open Script Editor (three-dot menu)
3. Paste the contents of `google_apps_script.js`
4. Update `WEBHOOK_URL` with your deployed backend URL
5. Add trigger: `onFormSubmit` → On form submit
6. Authorize the script

See `google_apps_script.js` for detailed setup instructions and recommended form fields.

## 🔬 Research Evaluation

Generate all metrics for your research paper:

```bash
python notebooks/evaluation_pipeline.py
```

This produces:
- Model comparison tables (CSV + LaTeX)
- Confusion matrices
- Class distribution charts
- Latency benchmarks
- Per-class precision/recall/F1 scores

Output saved to `notebooks/figures/` and `notebooks/tables/`.

## 📡 API Reference

### `GET /` or `GET /health`
Health check with model and service status.

### `POST /generate`
Full resume generation pipeline.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 9876543210",
  "role": "Software Engineer",
  "education": "B.Tech CS, XYZ University 2024",
  "skills": "Python, React, Machine Learning",
  "projects": "AI Resume Generator — full-stack app...",
  "experience": "Software Intern at ABC Corp...",
  "type": "fresher"
}
```

**Response:**
```json
{
  "domain": "TECH",
  "classification": {
    "domain": "TECH",
    "domain_display": "Technology & Engineering",
    "confidence": 0.92,
    "model_used": "ensemble",
    "inference_time_ms": 51.2,
    "secondary_domain": "BUSINESS",
    "secondary_confidence": 0.04,
    "all_probabilities": { "TECH": 0.92, "BUSINESS": 0.04, ... }
  },
  "quality_scores": {
    "completeness": 0.85,
    "skills_richness": 0.75,
    "action_verbs": 0.60,
    "quantification": 0.67,
    "overall": 0.73,
    "grade": "B",
    "feedback": "Good foundation. Consider adding more quantifiable achievements."
  },
  "resume_text": "# Jane Doe\n...",
  "resume_html": "<!DOCTYPE html>...",
  "pdf_url": "/download/resume_abc123.pdf",
  "docx_url": "/download/resume_abc123.docx",
  "email_status": { "success": true, "message": "Resume sent to jane@example.com" }
}
```

### `POST /classify`
Domain classification only (no resume generation).

### `POST /webhook`
Google Forms webhook receiver.

### `GET /download/<filename>`
Download generated files.

## 📁 Project Structure

```
PBL/
├── backend/
│   ├── app.py                  # Flask server
│   ├── config.py               # Configuration management
│   ├── domain_classifier.py    # Dual ML classifier
│   ├── prompt_engine.py        # Domain-specific prompts
│   ├── ai_model.py             # Gemini integration
│   ├── formatter.py            # PDF/DOCX/HTML export
│   ├── email_service.py        # Email delivery
│   ├── webhook.py              # Google Forms webhook
│   ├── utils.py                # Text preprocessing
│   ├── train_model.py          # Model training script
│   └── models/                 # Trained ML models
├── frontend/
│   ├── src/
│   │   ├── components/         # Form, ResumePreview, Loader
│   │   └── pages/              # Home, Result
│   └── vite.config.js
├── data/
│   └── Resume.csv              # Training dataset
├── notebooks/
│   └── evaluation_pipeline.py  # Research metrics
├── docs/
│   └── architecture.md         # System documentation
├── google_apps_script.js       # Google Forms integration
├── requirements.txt
└── README.md
```

## 📄 License

MIT
