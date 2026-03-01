import io
import re
from typing import List, Optional, Union, Tuple
import pdfplumber
from docx import Document
from itertools import groupby


# -------------------------------------------------
# Precompiled regex patterns (existing)
# -------------------------------------------------
RE_HYPHEN = re.compile(r"(\w)-\s*\n\s*(\w)")
RE_SPACES = re.compile(r"[ \t]+")
RE_NEWLINES = re.compile(r"\n{3,}")


# -------------------------------------------------
# PDF word grouping helper (existing)
# -------------------------------------------------
def _words_to_lines(words: List[dict], y_tol: float = 3.0) -> List[str]:
    if not words:
        return []

    words.sort(key=lambda w: (w.get("top", 0.0), w.get("x0", 0.0)))
    out = []

    for _, group in groupby(words, key=lambda w: round(w.get("top", 0.0) / y_tol)):
        line = " ".join((w.get("text") or "").strip() for w in group).strip()
        if line:
            out.append(line)

    return out


# -------------------------------------------------
# Text extraction (existing)
# -------------------------------------------------
def extract_text_from_upload(filename: str, content: bytes) -> str:
    name = filename.lower()
    buf = io.StringIO()

    if name.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text = (page.extract_text() or "").strip()
                if not text:
                    words = page.extract_words(use_text_flow=True) or []
                    text = "\n".join(_words_to_lines(words)).strip()
                if text:
                    buf.write(text + "\n")
        return buf.getvalue().strip()

    if name.endswith(".docx"):
        doc = Document(io.BytesIO(content))
        buf.write("\n".join(p.text.strip() for p in doc.paragraphs if p.text.strip()))
        for table in doc.tables:
            for row in table.rows:
                buf.write(
                    "\n".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                )
        return buf.getvalue().strip()

    return content.decode("utf-8", errors="ignore")


# -------------------------------------------------
# Text normalization (existing)
# -------------------------------------------------
def normalize_text(text: str) -> str:
    text = (text or "").replace("\x00", " ")
    text = RE_HYPHEN.sub(r"\1\2", text)
    text = RE_SPACES.sub(" ", text)
    text = RE_NEWLINES.sub("\n\n", text)
    return text.strip()


# =================================================
# YEARS OF EXPERIENCE EXTRACTION (NEW)
# =================================================

WORD_NUMBERS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
    "fifteen": 15, "sixteen": 16, "seventeen": 17,
    "eighteen": 18, "nineteen": 19, "twenty": 20
}

RE_YEARS_EXPERIENCE = re.compile(
    r"""
    (?:
        (?P<num>\d{1,2})\s*(?:\+|\bto\b|-)?\s*(?P<num2>\d{1,2})?
        |
        (?P<word>one|two|three|four|five|six|seven|eight|nine|ten|
                 eleven|twelve|thirteen|fourteen|fifteen|sixteen|
                 seventeen|eighteen|nineteen|twenty)
    )
    \s*
    (?:\+?\s*)?
    (?:years?|yrs?)
    \s+
    (?:of\s+)?
    experience
    """,
    re.IGNORECASE | re.VERBOSE
)


def extract_years_of_experience(
    text: str
) -> Optional[Union[int, Tuple[int, int]]]:
    matches = []

    for m in RE_YEARS_EXPERIENCE.finditer(text):
        if m.group("num"):
            start = int(m.group("num"))
            end = m.group("num2")
            matches.append((start, int(end)) if end else start)

        elif m.group("word"):
            matches.append(WORD_NUMBERS[m.group("word").lower()])

    if not matches:
        return None

    # Prefer highest experience (ATS behavior)
    def max_value(v):
        return v[1] if isinstance(v, tuple) else v

    return max(matches, key=max_value)


# =================================================
# ATS-FRIENDLY EXPERIENCE SCORING (NEW)
# =================================================

def score_years_of_experience(
    extracted_exp: Optional[Union[int, Tuple[int, int]]],
    required_exp: int,
    max_bonus_years: int = 5
) -> int:
    """
    Returns an ATS-style score from 0–100
    """

    if extracted_exp is None:
        return 20  # Missing data penalty (not zero)

    # Use upper bound for ranges
    years = extracted_exp[1] if isinstance(extracted_exp, tuple) else extracted_exp

    if years >= required_exp:
        bonus = min(years - required_exp, max_bonus_years)
        return min(100, 80 + int((bonus / max_bonus_years) * 20))

    # Partial credit for underqualification
    ratio = years / required_exp
    return max(30, int(ratio * 80))


# =================================================
# PIPELINE USAGE EXAMPLE
# =================================================
"""
raw_text = extract_text_from_upload(filename, content)
clean_text = normalize_text(raw_text)

years_exp = extract_years_of_experience(clean_text)
experience_score = score_years_of_experience(
    extracted_exp=years_exp,
    required_exp=5
)
"""