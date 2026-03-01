import re
from typing import Any, Dict, List, Set

from .config import MONTHS
from .utils import clean

DATE_SPAN_RE = re.compile(
    rf"\b({MONTHS})\b\s+\d{{4}}\s*[-–—]\s*(present|current|\b({MONTHS})\b\s+\d{{4}})",
    re.I,
)


def _looks_like_degree(line: str, program_set: Set[str]) -> bool:
    l = clean(line)
    if l in {clean(x) for x in program_set}:
        return True
    return any(
        k in l
        for k in [
            "bachelor",
            "master",
            "phd",
            "doctor",
            "associate",
            "b.s",
            "bsc",
            "bs ",
            "m.s",
            "msc",
        ]
    )


def parse_education(section_text: str, edu_programs: Set[str]) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    items: List[Dict[str, Any]] = []
    i = 0

    while i < len(lines):
        ln = lines[i]

        m = DATE_SPAN_RE.search(ln)
        if m:
            degree = lines[i + 1] if i + 1 < len(lines) else ""
            j = i + 2
            desc: List[str] = []

            while j < len(lines):
                if j + 1 < len(lines) and _looks_like_degree(lines[j + 1], edu_programs):
                    break
                desc.append(lines[j])
                j += 1

            items.append(
                {
                    "degree": degree,
   
                }
            )
            i = j
            continue

        if i + 1 < len(lines) and _looks_like_degree(lines[i + 1], edu_programs):
            degree = lines[i + 1]
            items.append({"degree": degree})
            break

        i += 1

    return items