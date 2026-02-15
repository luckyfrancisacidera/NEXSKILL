import re

SECTION_HEADERS = {
    "summary": ["summary", "professional summary", "profile", "about", "objective"],
    "skills": ["skills", "technical skills", "core competencies", "tools", "technologies"],
    "work_experience": ["work experience", "experience", "professional experience", "employment"],
    "education": ["education", "academic background", "academic"],
    "projects": ["projects", "project experience", "selected projects"],
    "certifications": ["certifications", "certification"],
    "events": ["events", "achievements", "awards", "honors"],
}

MONTHS = r"(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)"

EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)
PHONE_CANDIDATE_RE = re.compile(r"(\+?\d[\d\s().-]{7,}\d)")

NOISE_SKILLS = {
    "tools", "tool", "platform", "platforms", "code", "project", "system", "website",
    "using", "and", "or", "in", "to", "develop", "server", "core", "cloud", "microsoft",
    "visual", "studio", "frontend", "backend",
    "online", "coffee", "commerce", "shop", "boost", "daily", "time", "record",
    "analyzes", "innovative", "customer", "features", "outcome", "role", "used", "technologies",
    "application", "based", "built", "created", "help", "manage", "management", "operations",
    "order", "processing", "product", "support", "users", "workflows", "secure", "stack", "database",
    "api", "apis", "rest", "actions", "developed", "implementing", "integration"
}

KEEP_SHORT = {"aws", "api", "git", "sql", "css", "html", "c#", "c++", "js", ".net"}