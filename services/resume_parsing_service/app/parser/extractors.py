import io
import re
from typing import List
import pdfplumber
from docx import Document
from itertools import groupby


# Precompile regex patterns
RE_HYPHEN = re.compile(r"(\w)-\s*\n\s*(\w)")
RE_SPACES = re.compile(r"[ \t]+")
RE_NEWLINES = re.compile(r"\n{3,}")

def _words_to_lines(words: List[dict], y_tol: float = 3.0) -> List[str]:
    if not words:
        return []
    # Sort once
    words.sort(key=lambda w: (w.get("top", 0.0), w.get("x0", 0.0)))
    out = []
    for _, group in groupby(words, key=lambda w: round(w.get("top", 0.0) / y_tol)):
        line = " ".join((w.get("text") or "").strip() for w in group).strip()
        if line:
            out.append(line)
    return out

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
                buf.write("\n".join(cell.text.strip() for cell in row.cells if cell.text.strip()))
        return buf.getvalue().strip()

    return content.decode("utf-8", errors="ignore")

def normalize_text(text: str) -> str:
    text = (text or "").replace("\x00", " ")
    text = RE_HYPHEN.sub(r"\1\2", text)
    text = RE_SPACES.sub(" ", text)
    text = RE_NEWLINES.sub("\n\n", text)
    return text.strip()
