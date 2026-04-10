"""
prompt_engine.py — Domain-specific, chain-of-thought prompt engineering.

Builds highly targeted prompts for Gemini based on ML-predicted domain,
user data quality, and ATS optimization requirements. This module is
crafted to produce consistent, high-quality resume output across all domains.
"""

# ── Domain Context & ATS Keywords ───────────────────────────────────────

DOMAIN_CONTEXT = {
    "TECH": {
        "description": "software engineering, data science, IT infrastructure, cloud computing, and emerging technologies",
        "ats_keywords": [
            "software development", "agile", "CI/CD", "REST API", "microservices",
            "cloud computing", "DevOps", "data structures", "algorithms",
            "full-stack", "scalable systems", "version control",
        ],
        "action_verbs": [
            "Engineered", "Architected", "Deployed", "Optimized", "Automated",
            "Developed", "Implemented", "Debugged", "Scaled", "Integrated",
        ],
        "section_focus": "Emphasize technical projects, system design, and measurable impact (latency, throughput, uptime).",
    },
    "BUSINESS": {
        "description": "business analytics, marketing, finance, operations management, and strategic planning",
        "ats_keywords": [
            "strategic planning", "revenue growth", "stakeholder management",
            "market analysis", "KPI", "ROI", "cross-functional",
            "business development", "process improvement", "P&L management",
        ],
        "action_verbs": [
            "Spearheaded", "Drove", "Managed", "Delivered", "Negotiated",
            "Increased", "Streamlined", "Launched", "Analyzed", "Forecasted",
        ],
        "section_focus": "Emphasize revenue impact, team leadership, and strategic initiatives with dollar amounts and percentages.",
    },
    "CREATIVE": {
        "description": "graphic design, UX/UI, content creation, media production, and creative direction",
        "ats_keywords": [
            "user experience", "visual design", "brand identity", "content strategy",
            "creative direction", "design systems", "prototyping", "wireframing",
            "typography", "responsive design", "accessibility",
        ],
        "action_verbs": [
            "Designed", "Created", "Conceptualized", "Directed", "Produced",
            "Illustrated", "Crafted", "Rebranded", "Curated", "Transformed",
        ],
        "section_focus": "Emphasize portfolio highlights, design thinking process, and user impact metrics.",
    },
    "HEALTH": {
        "description": "healthcare, clinical research, nursing, pharmaceuticals, and public health",
        "ats_keywords": [
            "patient care", "clinical research", "EMR/EHR", "HIPAA compliance",
            "quality assurance", "evidence-based", "patient outcomes",
            "regulatory compliance", "healthcare management", "treatment protocols",
        ],
        "action_verbs": [
            "Administered", "Assessed", "Coordinated", "Diagnosed", "Implemented",
            "Monitored", "Provided", "Treated", "Improved", "Advocated",
        ],
        "section_focus": "Emphasize patient outcomes, compliance certifications, and evidence-based practices.",
    },
    "LEGAL_ADMIN": {
        "description": "legal compliance, paralegal work, administrative management, and regulatory affairs",
        "ats_keywords": [
            "legal research", "compliance", "regulatory affairs", "contract management",
            "litigation support", "case management", "due diligence",
            "policy development", "corporate governance", "risk management",
        ],
        "action_verbs": [
            "Drafted", "Reviewed", "Negotiated", "Researched", "Managed",
            "Ensured", "Filed", "Advised", "Compiled", "Coordinated",
        ],
        "section_focus": "Emphasize legal expertise, compliance achievements, and case outcomes.",
    },
    "EDUCATION": {
        "description": "teaching, academic research, curriculum development, and educational administration",
        "ats_keywords": [
            "curriculum development", "student outcomes", "pedagogy",
            "instructional design", "assessment strategies", "differentiated instruction",
            "educational technology", "accreditation", "academic research",
            "published research", "classroom management",
        ],
        "action_verbs": [
            "Taught", "Developed", "Mentored", "Facilitated", "Designed",
            "Published", "Assessed", "Guided", "Implemented", "Innovated",
        ],
        "section_focus": "Emphasize student success metrics, published research, and curriculum impact.",
    },
    "OTHER": {
        "description": "a broad professional background spanning multiple disciplines",
        "ats_keywords": [
            "project management", "teamwork", "leadership", "communication",
            "problem-solving", "adaptability", "time management",
        ],
        "action_verbs": [
            "Managed", "Led", "Delivered", "Coordinated", "Improved",
            "Built", "Organized", "Achieved", "Executed", "Supported",
        ],
        "section_focus": "Highlight transferable skills and cross-functional achievements.",
    },
}


# ── Prompt Builder ──────────────────────────────────────────────────────

def build_prompt(data: dict, domain: str, confidence: float = 0.0) -> str:
    """
    Construct a domain-optimized, chain-of-thought prompt for Gemini.

    The prompt instructs Gemini to:
    1. Analyze the candidate's data
    2. Apply domain-specific ATS keywords
    3. Generate a properly formatted Markdown resume

    Args:
        data:       Standardized user data dict
        domain:     ML-predicted domain (e.g., "TECH", "BUSINESS")
        confidence: Classification confidence score (0-1)
    """
    ctx = DOMAIN_CONTEXT.get(domain, DOMAIN_CONTEXT["OTHER"])
    resume_type = data.get("type", "professional").lower()
    role = data.get("role", "")

    # ── System persona ──────────────────────────────────────────────
    prompt = f"""You are an elite resume writer with 15+ years of experience specializing in {ctx['description']}.

You are known for creating resumes that:
- Pass ATS (Applicant Tracking System) scanners with 95%+ match rates
- Use powerful, domain-specific action verbs
- Quantify achievements wherever possible
- Are concise, impactful, and professionally formatted

"""

    # ── Chain-of-thought instructions ───────────────────────────────
    prompt += """IMPORTANT INSTRUCTIONS — Follow this thinking process:

Step 1: Analyze the candidate data below carefully.
Step 2: Identify the strongest skills and achievements that match the target domain.
Step 3: Select the most impactful ATS keywords from the domain.
Step 4: Write each bullet point using the STAR format (Situation → Task → Action → Result).
Step 5: Format the output EXACTLY as specified below.

DO NOT include your thinking process in the output. Output ONLY the final resume.

"""

    # ── Candidate context ───────────────────────────────────────────
    if role:
        prompt += f"The candidate is targeting a **{role}** position (Level: {resume_type}).\n"
    else:
        prompt += f"The candidate is at the **{resume_type}** level.\n"

    prompt += f"Classified Domain: **{domain}**\n\n"

    # ── ATS keyword injection ───────────────────────────────────────
    prompt += f"**ATS Keywords to naturally incorporate:** {', '.join(ctx['ats_keywords'][:8])}\n"
    prompt += f"**Preferred action verbs:** {', '.join(ctx['action_verbs'][:6])}\n"
    prompt += f"**Section focus:** {ctx['section_focus']}\n\n"

    # ── Candidate data ──────────────────────────────────────────────
    prompt += "=== CANDIDATE INFORMATION ===\n\n"

    prompt += f"**Name:** {data.get('name', 'Not Provided')}\n"

    contact_parts = []
    if "email" in data:
        contact_parts.append(f"Email: {data['email']}")
    if "phone" in data:
        contact_parts.append(f"Phone: {data['phone']}")
    if contact_parts:
        prompt += f"**Contact:** {' | '.join(contact_parts)}\n"

    prompt += f"\n**Education:**\n{data.get('education', 'Not Provided')}\n"
    prompt += f"\n**Skills:**\n{data.get('skills', 'Not Provided')}\n"

    if "experience" in data:
        prompt += f"\n**Experience:**\n{data['experience']}\n"

    if "projects" in data:
        prompt += f"\n**Projects:**\n{data['projects']}\n"

    if "certifications" in data:
        prompt += f"\n**Certifications:**\n{data['certifications']}\n"

    if "achievements" in data:
        prompt += f"\n**Achievements:**\n{data['achievements']}\n"

    # ── Strict formatting template ──────────────────────────────────
    prompt += """
=== OUTPUT FORMAT (STRICT MARKDOWN) ===

You MUST format the output EXACTLY using this Markdown structure.
Do NOT include any greetings, `<br>` tags, comments, or explanations.
Start IMMEDIATELY with the candidate's name as an H1 heading.

# [Candidate Full Name]
[City, State] | [Email] | [Phone] | [LinkedIn/Portfolio if provided]

## Professional Summary
[Write a compelling 3-4 sentence professional summary. Focus on years of experience, core expertise, key achievements, and what makes this candidate unique. Use strong, confident language. Tailor to the target domain.]

## Core Competencies & Skills
### Technical Skills
- [List 8-12 relevant technical skills, comma-separated, matching ATS keywords]
### Soft Skills & Tools
- [List 5-8 soft skills and tools, comma-separated]

"""

    if "experience" in data:
        prompt += """## Professional Experience
### [Job Title] — [Company Name]
*[Start Date] – [End Date]*
- [STAR-format bullet: Led/Managed/Engineered X, resulting in Y% improvement in Z]
- [STAR-format bullet with quantifiable metrics]
- [STAR-format bullet highlighting technical or domain skills]

"""

    if "projects" in data:
        prompt += """## Key Projects
### [Project Name]
*[Technologies Used]*
- [Problem addressed and solution implemented]
- [Measurable outcome or impact]

"""

    prompt += """## Education
### [Degree Name] — [University / Institution]
*[Year of Graduation or Expected Year]*
[GPA, honors, relevant coursework if applicable]

"""

    if "certifications" in data:
        prompt += """## Certifications
- [Certification Name — Issuing Organization, Year]

"""

    # ── Critical requirements ──────────────────────────────────────
    prompt += """=== CRITICAL REQUIREMENTS ===
1. Use EXACT heading levels: '# ' for name, '## ' for sections, '### ' for subtitles.
2. Do NOT use blockquotes ('> ').
3. NEVER use first-person pronouns (I, me, my, we).
4. If a field says 'Not Provided', SKIP it entirely — do not write 'Not Provided'.
5. Each bullet point MUST start with a strong action verb.
6. At LEAST 2 bullet points per experience/project entry.
7. Include quantifiable metrics (percentages, dollar amounts, counts) wherever possible.
8. Keep the resume to 1-2 pages in length.

Generate the resume now:
"""

    return prompt


def build_scoring_prompt(resume_text: str, domain: str) -> str:
    """
    Build a prompt for Gemini to score/evaluate a generated resume.
    Used for quality assurance and research metrics.
    """
    return f"""You are an ATS (Applicant Tracking System) expert and resume reviewer.

Analyze the following resume for the **{domain}** domain and provide a JSON score.

Resume:
---
{resume_text}
---

Score each category from 0 to 100:
1. **ats_score**: How well would this pass an ATS scanner? (keyword density, format, structure)
2. **content_quality**: Are bullet points impact-driven with STAR format and metrics?
3. **formatting**: Is the Markdown consistently structured with proper heading hierarchy?
4. **domain_relevance**: How well does the content match the {domain} domain?
5. **professionalism**: Overall language quality, tone, and polish.

Also provide:
- **strengths**: List of 2-3 strongest aspects
- **improvements**: List of 2-3 areas for improvement
- **overall_score**: Weighted average (0-100)

Return ONLY valid JSON, no markdown fences:
{{"ats_score": 85, "content_quality": 80, "formatting": 90, "domain_relevance": 85, "professionalism": 88, "strengths": ["...", "..."], "improvements": ["...", "..."], "overall_score": 86}}
"""
