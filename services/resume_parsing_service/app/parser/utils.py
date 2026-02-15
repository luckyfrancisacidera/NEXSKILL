import re
from typing import Iterable, List

def clean(s: str) -> str:
    return " ".join(str(s).strip().split()).lower()

def norm_spaces(s: str) -> str:
    return re.sub(r"\s{2,}", " ", (s or "")).strip()

def strip_trailing_punct(s: str) -> str:
    return (s or "").strip().strip(":-–—|,•●")

def looks_like_header_line(s: str) -> bool:
    s = (s or "").strip()
    if not s or len(s) > 90:
        return False
    letters = re.sub(r"[^A-Za-z ]", "", s)
    if len(letters) < 3:
        return False
    return len(s.split()) <= 6

def join_nonempty(lines: Iterable[str], sep="\n") -> str:
    return sep.join([x for x in (ln.strip() for ln in lines) if x])

def drop_noise_lines(lines: List[str], noise_phrases: List[str]) -> List[str]:
    out = []
    for ln in lines:
        cl = clean(ln)
        if any(p in cl for p in noise_phrases):
            continue
        out.append(ln)
    return out