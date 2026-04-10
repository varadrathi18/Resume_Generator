"""
train_model.py — One-time script to train and serialize the domain classifier.
Run:  python train_model.py
"""

import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# ── Synthetic training data ─────────────────────────────────────────────

TRAINING_DATA = [
    # TECH
    ("python java javascript react node sql aws docker kubernetes machine learning deep learning tensorflow pytorch data structures algorithms API REST microservices cloud computing DevOps CI/CD git agile scrum software development full stack backend frontend web development mobile app database mongodb postgresql linux", "TECH"),
    ("developed RESTful APIs using Flask and Django deployed on AWS EC2 with Docker containers implemented CI/CD pipelines using Jenkins and GitHub Actions worked with relational and NoSQL databases", "TECH"),
    ("built machine learning models using scikit-learn and tensorflow for natural language processing computer vision recommendation systems big data analytics hadoop spark data engineering ETL pipelines", "TECH"),
    ("software engineer with expertise in java spring boot microservices architecture system design distributed systems redis kafka message queues event-driven architecture", "TECH"),
    ("cybersecurity network security penetration testing ethical hacking firewall configuration vulnerability assessment security auditing SIEM tools incident response", "TECH"),
    ("ios android mobile development swift kotlin flutter react native cross-platform apps UI/UX mobile design app store deployment", "TECH"),
    ("data analyst SQL tableau power bi excel data visualization statistical analysis python pandas numpy matplotlib business intelligence reporting dashboards", "TECH"),
    ("cloud architect azure google cloud platform serverless lambda functions terraform infrastructure as code monitoring observability grafana prometheus", "TECH"),

    # BUSINESS
    ("business analysis strategic planning financial modeling project management stakeholder management revenue growth market research competitive analysis KPI metrics ROI marketing sales operations supply chain management", "BUSINESS"),
    ("managed cross-functional teams of 15 people increased quarterly revenue by 25% developed go-to-market strategies conducted SWOT analysis business development account management CRM Salesforce", "BUSINESS"),
    ("MBA finance investment banking equity research portfolio management risk assessment financial planning budgeting forecasting mergers and acquisitions venture capital private equity", "BUSINESS"),
    ("digital marketing SEO SEM social media marketing content strategy email campaigns Google Analytics conversion optimization brand management market segmentation customer acquisition", "BUSINESS"),
    ("product management roadmap planning user stories sprint planning stakeholder communication product lifecycle competitive benchmarking pricing strategy market fit analysis", "BUSINESS"),
    ("supply chain optimization logistics inventory management procurement vendor management demand forecasting lean six sigma process improvement operations excellence", "BUSINESS"),
    ("human resources talent acquisition employee engagement performance management compensation benefits organizational development workforce planning HRIS succession planning", "BUSINESS"),
    ("management consulting strategy advisory change management transformation digital strategy client relationship enterprise solutions", "BUSINESS"),

    # CREATIVE
    ("graphic design adobe photoshop illustrator figma sketch UI/UX design wireframing prototyping user research typography color theory branding logo design visual identity creative direction", "CREATIVE"),
    ("video editing premiere pro after effects motion graphics animation storyboarding cinematography photography content creation social media content creative storytelling", "CREATIVE"),
    ("creative writing copywriting content strategy blog posts articles editorial storytelling brand voice tone of voice narrative design scriptwriting", "CREATIVE"),
    ("web design responsive design interaction design design systems user experience user interface accessibility WCAG design thinking information architecture", "CREATIVE"),
    ("3D modeling rendering blender maya cinema 4d game design character design environment art concept art digital illustration", "CREATIVE"),
    ("music production audio engineering sound design podcast production voiceover mixing mastering DAW ableton logic pro", "CREATIVE"),
    ("art direction visual design publication layout editorial design magazine newspaper print design packaging design", "CREATIVE"),

    # HEALTH
    ("registered nurse patient care clinical assessment vital signs medication administration EMR electronic medical records healthcare hospital ICU emergency department nursing care plans", "HEALTH"),
    ("medical doctor physician diagnosis treatment surgery clinical trials patient outcomes healthcare management public health epidemiology", "HEALTH"),
    ("pharmaceutical research drug development clinical research regulatory affairs FDA compliance GMP quality assurance pharmacology biotechnology", "HEALTH"),
    ("physical therapy rehabilitation exercise prescription patient education musculoskeletal assessment treatment planning occupational therapy", "HEALTH"),
    ("mental health counseling psychotherapy CBT cognitive behavioral therapy patient assessment diagnosis treatment planning crisis intervention substance abuse", "HEALTH"),
    ("public health epidemiology disease surveillance health education community outreach health policy biostatistics environmental health global health", "HEALTH"),
    ("medical research laboratory analysis biochemistry molecular biology genetics genomics clinical laboratory science pathology", "HEALTH"),

    # LEGAL_ADMIN
    ("legal research case analysis litigation contract drafting compliance regulatory affairs corporate law intellectual property trademark patent legal writing memoranda briefs", "LEGAL_ADMIN"),
    ("paralegal legal assistant court filings document review discovery process legal databases westlaw lexis administrative support office management", "LEGAL_ADMIN"),
    ("executive assistant office administration scheduling calendar management document preparation filing systems records management correspondence travel arrangements", "LEGAL_ADMIN"),
    ("compliance officer regulatory compliance audit risk management internal controls policy development SOX GDPR data privacy", "LEGAL_ADMIN"),
    ("contract management negotiation vendor agreements SLA service level agreements procurement legal review terms and conditions", "LEGAL_ADMIN"),
    ("immigration law visa processing work permits legal documentation government relations public policy advocacy lobbying", "LEGAL_ADMIN"),

    # EDUCATION
    ("teacher instructor professor curriculum development lesson planning student assessment classroom management pedagogy educational technology differentiated instruction special education STEM education", "EDUCATION"),
    ("academic research published papers peer-reviewed journals thesis dissertation research methodology qualitative quantitative mixed methods literature review", "EDUCATION"),
    ("educational leadership school administration principal superintendent education policy accreditation program development faculty development", "EDUCATION"),
    ("online education e-learning instructional design LMS learning management system moodle canvas blackboard course development educational content", "EDUCATION"),
    ("tutoring mentoring academic advising student support college counseling career guidance test preparation SAT GRE GMAT", "EDUCATION"),
    ("early childhood education preschool kindergarten child development play-based learning montessori reggio emilia elementary education", "EDUCATION"),
    ("training and development corporate training workshop facilitation employee learning onboarding professional development continuing education", "EDUCATION"),

    # OTHER
    ("volunteer community service nonprofit organization fundraising event planning social work youth development mentoring advocacy", "OTHER"),
    ("freelance self-employed consultant independent contractor multiple projects diverse experience versatile adaptable", "OTHER"),
    ("sports athlete coaching fitness training personal trainer nutrition wellness health and fitness yoga meditation", "OTHER"),
    ("agriculture farming sustainable development environmental science conservation ecology renewable energy solar wind green technology", "OTHER"),
    ("hospitality hotel management restaurant food service customer service guest relations tourism travel event management", "OTHER"),
    ("construction architecture building design civil engineering structural engineering project management site supervision safety compliance", "OTHER"),
    ("transportation logistics fleet management delivery driver CDL commercial driving dispatching route planning warehouse operations", "OTHER"),
]


def train_and_save():
    texts, labels = zip(*TRAINING_DATA)

    vectorizer = TfidfVectorizer(max_features=10_000, stop_words="english")
    X = vectorizer.fit_transform(texts)

    clf = LogisticRegression(max_iter=1000, solver="lbfgs")
    clf.fit(X, labels)

    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    joblib.dump(vectorizer, os.path.join(models_dir, "tfidf_vectorizer.pkl"))
    joblib.dump(clf, os.path.join(models_dir, "resume_classifier.pkl"))

    print("✅ Model and vectorizer saved to models/")
    print(f"   Classes: {list(clf.classes_)}")
    print(f"   Training accuracy: {clf.score(X, labels):.2%}")


if __name__ == "__main__":
    train_and_save()
