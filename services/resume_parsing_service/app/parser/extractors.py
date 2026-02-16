import io
import re
from typing import List

import pdfplumber
from docx import Document


def _words_to_lines(words: List[dict], y_tol: float = 3.0) -> List[str]:

    if not words:
        return []

    words = sorted(words, key=lambda w: (w.get("top", 0.0), w.get("x0", 0.0)))

    lines: List[List[dict]] = []
    cur: List[dict] = []
    cur_top = words[0].get("top", 0.0)

    for w in words:
        top = w.get("top", 0.0)
        if abs(top - cur_top) <= y_tol:
            cur.append(w)
        else:
            lines.append(cur)
            cur = [w]
            cur_top = top
    if cur:
        lines.append(cur)

    out: List[str] = []
    for ln in lines:
        ln = sorted(ln, key=lambda w: w.get("x0", 0.0))
        txt = " ".join((w.get("text") or "").strip() for w in ln).strip()
        if txt:
            out.append(txt)
    return out


def extract_text_from_upload(filename: str, content: bytes) -> str:
    name = filename.lower()

    if name.endswith(".pdf"):
        parts: List[str] = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                words = page.extract_words(
                    use_text_flow=True,
                    keep_blank_chars=False,
                ) or []
                lines = _words_to_lines(words)
                text = "\n".join(lines).strip()

                if not text:
                    text = (page.extract_text() or "").strip()

                if text:
                    parts.append(text)

        return "\n".join(parts)

    if name.endswith(".docx"):
        doc = Document(io.BytesIO(content))
        parts: List[str] = []
        for p in doc.paragraphs:
            txt = (p.text or "").strip()
            if txt:
                parts.append(txt)
        #return "\n".join(p.text for p in doc.paragraphs if p.text and p.text.strip())
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    txt = (cell.text or "").strip()
                    if txt:
                        parts.append(txt)
        return "\n".join(parts)
    #try:
    #    return content.decode("utf-8", errors="ignore")
    #except Exception:
    #    return content.decode(errors="ignore")


def normalize_text(text: str) -> str:
    text = (text or "").replace("\x00", " ")

    text = re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)

    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()