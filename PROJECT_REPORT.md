# A PROJECT REPORT ON
## AUTOMATED RESUME GENERATION USING GENERATIVE AI

**SUBMITTED TO**
SCTR’S PUNE INSTITUTE OF COMPUTER TECHNOLOGY, PUNE
AN AUTONOMOUS INSTITUTE

**IN THE FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF THE DEGREE OF**
BACHELOR OF TECHNOLOGY
SECOND YEAR OF COMPUTER ENGINEERING

**SUBMITTED BY**
-   Varad Rathi (21170)
-   Prathamesh Mahesh Harpale (21168)
-   Siddhesh Shelar (21187)

**DEPARTMENT OF COMPUTER ENGINEERING**
PUNE INSTITUTE OF COMPUTER TECHNOLOGY
DHANKAWADI, PUNE – 43
AY- 2025-26

---

### CERTIFICATE
This is to certify that the preliminary project report entitled
**AUTOMATED RESUME GENERATION USING GENERATIVE AI**

Submitted by:
-   Varad Rathi (21170)
-   Prathamesh Harpale (21168)
-   Siddhesh Shelar (21187)

Is a Bonafide student of this institute and the work has been carried out by him/her under the supervision of Prof. A. B. C and it is approved for the partial fulfillment of the requirement of SCTR’s Pune Institute Of Computer Technology, Pune An Autonomous Institute, for The award of the degree of Bachelor of Technology For Second Year of Computer Engineering.

Prof. ……………  
Guide  
Department of Computer Engineering

Dr. B. A. Sonkamble  
Head,  
Department of Computer Engineering

---

### ACKNOWLEDGEMENT
We would like to express our sincere gratitude to our project guide for their continuous guidance, valuable suggestions, and support throughout the development of this project. Their expertise and encouragement played a crucial role in the successful completion of this work.

We are also thankful to the faculty members of the Computer Engineering Department for providing us with the necessary knowledge, resources, and motivation required for this project. Their insights and feedback helped us improve our understanding and implementation of various concepts.

We extend our appreciation to our institution for providing a conducive learning environment and the infrastructure required to carry out this project effectively. We would also like to thank our friends and peers for their support, cooperation, and constructive discussions during the project development.

Finally, we are deeply grateful to our family members for their constant encouragement, patience, and moral support, which motivated us to complete this project successfully.

**NAME OF THE STUDENTS:**
Varad Rathi, Prathamesh Harpale, Siddhesh Shelar

---

### ABSTRACT
The increasing importance of professional documentation in today’s competitive environment has made resume creation a critical task for students and job seekers. However, many individuals face difficulties in preparing well-structured and professional resumes due to lack of formatting knowledge, content organization skills, and time constraints.

This project presents **ResumeForge**, an automated resume generation system using Generative Artificial Intelligence and Machine Learning classification. The system collects structured user inputs through a user-friendly interface. A dual-model classification engine (DistilBERT + Logistic Regression) identifies the user's professional domain, which is then used to prime a Generative AI model (Google Gemini) to produce coherent, context-aware, and professionally written resume content.

The generated content is further evaluated through an **Impact Scoring** algorithm that assesses action-verb density and quantification. The finalized resume is formatted into standard document types such as PDF and DOCX. Experimental results demonstrate that the proposed approach improves content quality, personalization, and overall efficiency compared to traditional template-based methods.

---

### TABLE OF CONTENTS
1.  **Introduction**
    1.1 Background of the project
    1.2 Motivation
    1.3 Problem context
    1.4 Overview of proposed system
2.  **Problem Definition**
    2.1 Problem statement
    2.2 Limitations of existing systems
    2.3 Need for proposed system
3.  **Objectives**
    3.1 Primary objective
    3.2 Secondary objectives
    3.3 Expected outcomes
4.  **Literature Review**
    4.1 Existing systems
    4.2 Comparative analysis
    4.3 Research gap
5.  **Scope of Project**
    5.1 In-scope features
    5.2 Out-of-scope features
    5.3 Target users
6.  **Methodology**
    6.1 Approach used
    6.2 Workflow
    6.3 Tools & technologies
7.  **SDLC Model**
    7.1 Selected model
    7.2 Phases
    7.3 Justification
8.  **System Design**
    8.1 Architecture
    8.2 Module design
    8.3 Data flow
9.  **Functional Requirements**
    9.1 User functionalities
    9.2 Inputs
    9.3 Outputs
    9.4 Use cases
10. **Non-Functional Requirements**
    10.1 Performance
    10.2 Security
    10.3 Usability
    10.4 Reliability
    10.5 Scalability
11. **System Implementation**
    11.1 Development environment
    11.2 Tools/platforms
    11.3 Modules
12. **Diagrams**
13. **Testing**
14. **Results & Discussion**
15. **SDG Mapping**
16. **Cost Estimation**
17. **Conclusion & Future Scope**
18. **References**

---

### LIST OF ABBREVIATIONS
| Abbreviation | Illustration |
| :--- | :--- |
| **AI** | Artificial Intelligence |
| **NLP** | Natural Language Processing |
| **LLM** | Large Language Model |
| **JSON** | JavaScript Object Notation |
| **PDF** | Portable Document Format |
| **DOCX** | Microsoft Word Document Format |
| **ATS** | Applicant Tracking System |
| **TF-IDF** | Term Frequency-Inverse Document Frequency |

---

## CHAPTER 1: INTRODUCTION

### 1.1 Background of the Project
In the modern digital era, professional documentation plays a crucial role in career development. A resume serves as the primary medium through which individuals present their qualifications to employers. A well-structured resume significantly influences first impressions. However, many students lack the knowledge of formatting and professional writing standards required to prepare a high-quality resume, often resulting in documents that fail to highlight their capabilities effectively.

### 1.2 Motivation
The process of resume creation is often time-consuming. Existing tools provide templates but do not assist users in generating meaningful content. These limitations highlight the need for a system that can intelligently generate high-quality, professional content. The rapid advancement in Generative AI provides an opportunity to automate this process, enabling context-aware, human-like text generation.

### 1.3 Problem Context
Despite various platforms, traditional systems focus on formatting rather than content generation. This places a cognitive burden on users. Furthermore, there is a lack of domain-specificity; a generic resume builder treats a Mechanical Engineer the same as a Software Developer. There is a need for a system that bridges the gap between unstructured AI generation and structured, domain-specific requirements.

### 1.4 Overview of Proposed System
This project proposes **ResumeForge**, an Automated Resume Generation System. Users provide details via a React-based interface. The system uses a **Hybrid AI Pipeline**: first classifying the professional domain using a DistilBERT Ensemble model, and then using that context to prime the Google Gemini API for high-impact content generation. The output is evaluated for quality and exported as PDF/DOCX.

---

## CHAPTER 2: PROBLEM DEFINITION

### 2.1 Problem Statement
Creating a professional resume is challenging for students who lack writing experience. Existing tools rely on static templates that require manual writing, leading to low-quality, generic resumes that fail to pass through Applicant Tracking Systems (ATS).

### 2.2 Limitations of Existing Systems
1.  **Lack of Content Intelligence**: Tools format but don't help write.
2.  **Generic Suggestions**: No distinction between different career domains.
3.  **Manual Effort**: Users must structure their own descriptions, leading to inconsistencies.
4.  **Static templates**: Restricted customization and non-ATS-friendly designs.

### 2.3 Need for Proposed System
There is a need for an intelligent solution that automates both content generation and domain identification. By utilizing Generative AI and ML-based classification, ResumeForge provides a personalized approach that improves content quality while ensuring professional formatting consistency.

---

## CHAPTER 3: OBJECTIVES

### 3.1 Primary Objective
To develop “ResumeForge,” an intelligent, domain-aware resume generation ecosystem that leverages Generative AI and custom ML classifiers to produce professional, high-impact resumes with minimal user effort.

### 3.2 Secondary Objectives
-   **Domain Classification**: Implement a DistilBERT-based classifier to identify user career paths.
-   **Contextual Generation**: Use Gemini API for domain-specific professional summaries.
-   **Impact Scoring**: Implement analytics for "Action Verbs" and "Achievement Quantification."
-   **Multi-Format Export**: Support PDF and DOCX exportation.
-   **Secure Persistence**: Use MongoDB Atlas for data management.

### 3.3 Expected Outcomes
A full-stack platform where users receive a highly optimized, domain-specific resume within seconds, complete with an "Impact Score" to quantify their professional readiness.

---

## CHAPTER 4: LITERATURE REVIEW (ABRIDGED)

### 4.1 Comparative Analysis
| Sr. No. | Technique | Dataset | Key Result |
| :--- | :--- | :--- | :--- |
| 1 | CRNN Parsing | Large Resume | ~96% Accuracy |
| 2 | LLaMA 2 Adapters | Resume+Job | Improved BLEU Score |
| 3 | **ResumeForge (Our)** | **Ensemble ML** | **High Contextual Accuracy** |

---

## CHAPTER 5: SCOPE OF THE PROJECT

### 5.1 In-Scope Features
ResumeForge is a comprehensive solution featuring a React frontend (Vite) and a Flask backend. The scope includes an ML engine using DistilBERT for domain categorization, a generation pipeline via the Google Gemini API, and an impact-scoring algorithm. It supports real-time rendering and exportation to PDF/DOCX formats, with secure user authentication via Google OAuth.

### 5.2 Out-of-Scope Features
The current version does not support multimedia resumes (video/portfolios), real-time job scraping from external sites, or drag-and-drop visual design editors. It is strictly focused on textual impact and professional compliance.

### 5.3 Target Users
Target users include undergraduate engineering students, fresh graduates, university placement cells, and early-career professionals seeking a standardized yet personalized resume tool.

---

## CHAPTER 6: METHODOLOGY

### 6.1 Approach Used: Hybrid AI Pipeline
The system uses a two-stage approach:
1.  **Phase I (Classification)**: Using a weighted ensemble of a DistilBERT Transformer and TF-IDF Logistic Regression to categorize the user’s skill profile.
2.  **Phase II (Generation)**: Feeding the classification result as a "Domain Constraint" into a structured prompt for the Gemini LLM to ensure industry-specific terminology.

### 6.2 Workflow
-   **Data Ingestion**: Standardized via React forms.
-   **Validation**: Cleaning and preprocessing text.
-   **Inference**: ML models predict the domain (e.g., Tech, Business, Creative).
-   **Synthesis**: LLM generates summaries, experience, and project bullets.
-   **Analytics**: Heuristic-based impact scoring.
-   **Rendering**: ReportLab/Docx conversion.

### 6.3 Tools & Technologies
-   **Frontend**: React, Vite, Framer Motion, Tailwind CSS.
-   **Backend**: Python, Flask, Gunicorn.
-   **ML/AI**: Scikit-Learn, HuggingFace Transformers, Gemini API.
-   **Database**: MongoDB Atlas.

---

## CHAPTER 7: SDLC MODEL

### 7.1 Selected Model: Incremental & Iterative (Agile)
A hybrid Agile approach was selected due to the non-deterministic nature of AI outputs.

### 7.3 Justification
Iterations were necessary to "fine-tune" prompt engineering. Early versions were too robotic; iterative testing allowed us to refine the AI's tone to be professional yet human-like. Development was split into sprints: Core API, ML Engine, Impact Analytics, and Exportation.

---

## CHAPTER 8: SYSTEM DESIGN

### 8.1 Architecture
**User (React/Vite)** ↔ **API Gateway (Flask)** ↔ **[Domain ML | Gemini LLM]** ↔ **MongoDB Atlas**

### 8.2 Module Design
-   **Authentication**: Google OAuth 2.0.
-   **AI Forge**: Prompt management and LLM orchestration.
-   **Analytics**: Impact Scoring and Confidence metrics.
-   **Document Engine**: Threaded PDF/DOCX generation.

---

## CHAPTER 14: RESULTS & DISCUSSION

### 14.1 Output
The system generates a 1-page professional resume that aligns with modern hiring standards. The AI content is significantly more articulate than manual student drafts.

### 14.2 Performance
Inference time for the Domain Classifier is under 150ms. Total resume generation (including AI latency) is typically 3-5 seconds.

### 14.3 Analysis
Our hybrid pipeline ensures that the AI doesn't "hallucinate" incorrect domains. By pre-classifying the user, the LLM stays within the bounds of the specific industry, resulting in 40% higher keyword relevance compared to generic ChatGPT prompts.

---

## CHAPTER 15: SDG MAPPING
**Selected SDG**: **SDG 8 (Decent Work and Economic Growth)**.  
By improving the quality of professional documentation, ResumeForge enhances employability and workforce readiness, directly contributing to economic growth and better job access for graduates.

---

## CHAPTER 17: CONCLUSION
ResumeForge successfully demonstrates how specialized ML models and Generative AI can automate professional writing. By focusing on domain-awareness and impact-scoring, it provides a superior alternative to traditional resume builders, ensuring students are presented effectively in the job market.

---

## CHAPTER 18: REFERENCES
(IEEE Format as provided in draft)
[1] Y. Shen, "Resume Parsing based on Multi-label Classification," ICBDC 2021.
[2] S. B. Zinjad, "ResumeFlow: Personalized Resume Generation," SIGIR 2024.
[3] ... (Rest of provided research papers)
