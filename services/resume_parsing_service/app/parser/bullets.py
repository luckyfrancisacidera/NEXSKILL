import re
from typing import List

def normalize_bullets(lines: List[str]) -> List[str]:
    bullets: List[str] = []
    for ln in lines:
        ln = (ln or "").strip()
        if not ln:
            continue

        if ln.startswith(("●", "•", "-", "–", "○")):
            bullets.append(ln.lstrip("●•-–○ ").strip())
        else:
            if bullets:
                bullets[-1] = (bullets[-1] + " " + ln).strip()
            else:
                bullets.append(ln)

    fixed = []
    for b in bullets:
        b = re.sub(r"\b(\w+)-\s+(\w+)\b", r"\1\2", b)
        b = b.replace("im- plementing", "implementing")
        fixed.append(b.strip())

    return [b for b in fixed if b and len(b) >= 2]