import re
from typing import Any, Dict, List, Set, Optional
from .config import MONTHS
from .dates import parse_date_range, DATE_RANGE_RE
from .bullets import normalize_bullets
from .utils import clean

def _looks_like_institution(line: str) -> bool:
    l = clean(line)
    primary_keywords = ["university", "college", "institute", "school", "academy", "polytechnic"]
    if any(k in l for k in primary_keywords):
        return True
    
    # Check for capitalized words or patterns
    if len(line.strip()) > 5 and len(line.strip()) < 100:
        # Institution names are typically 10-80 chars with mixed capitalization
        words = line.strip().split()
        if len(words) <= 6 and any(w[0].isupper() for w in words if len(w) > 2):
            return True
    
    return False

def _looks_like_degree(line: str, program_set: Set[str]) -> bool:
    l = clean(line)
    
    if l in {clean(x) for x in program_set}:
        return True
    
    if len(l) > 50: 
        return False
    
    # Primary degree keywords
    primary_keywords = ["bachelor", "master", "phd", "doctor", "associate", 
                       "b.s", "bsc", "bs", "m.s", "msc", "ma", "m.a", "b.a", "ba",
                       "m.tech", "b.tech", "b.e", "m.e", "diploma", "certificate"]
    
    if any(k in l for k in primary_keywords):
        return True
    
    if re.match(r"^(b\.?[as]|m\.?[as]|phd|b\.?tech|m\.?tech|b\.?e|m\.?e)", l):
        return True
    
    return False

def parse_education(section_text: str, edu_programs: Set[str]) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in (section_text or "").splitlines() if l.strip()]
    if not lines:
        return []

    items: List[Dict[str, Any]] = []
    i = 0

    while i < len(lines):
        ln = lines[i]
        
        # Pattern 1: Date forward pattern 
        m = DATE_RANGE_RE.search(ln)
        if m:
            date_part = m.group(0)
            before_date = ln[:m.start()].strip(" -–—|,")
            after_date = ln[m.end():].strip(" -–—|,")
            institution = before_date or after_date
            
            if not institution:
                institution = lines[i + 1] if i + 1 < len(lines) else ""
                j = i + 2
            else:
                j = i + 1
            
            degree = ""
            if j < len(lines) and _looks_like_degree(lines[j], edu_programs):
                degree = lines[j]
                j += 1
            
            desc = []
            while j < len(lines):
                if DATE_RANGE_RE.search(lines[j]) and _looks_like_institution(lines[j]):
                    break
                if _looks_like_institution(lines[j]) and j + 1 < len(lines) and _looks_like_degree(lines[j + 1], edu_programs):
                    break
                desc.append(lines[j])
                j += 1

            start_date, end_date = parse_date_range(date_part)
            description_items = normalize_bullets(desc)
            embedding_text = " ".join([degree, institution, start_date, end_date, " ".join(description_items)]).strip()
            
            if degree or institution:
                items.append({
                    "degree": degree,
                    "institution": institution,
                    "start_date": start_date,
                    "end_date": end_date,
                    "description_items": description_items,
                    "embedding_text": embedding_text
                })
            i = j
            continue

        # Pattern 2: Institution + Degree on consecutive or nearby lines
        if _looks_like_institution(ln) and i + 1 < len(lines) and _looks_like_degree(lines[i + 1], edu_programs):
            institution = ln
            degree = lines[i + 1]
            
            rest = lines[i + 2:]
            start_date, end_date = parse_date_range("\n".join(rest))
            description_items = normalize_bullets(rest) if not start_date else []

            embedding_text = " ".join([degree, institution, start_date, end_date, " ".join(description_items)]).strip()
            items.append({
                "degree": degree,
                "institution": institution,
                "start_date": start_date,
                "end_date": end_date,
                "description_items": description_items,
                "embedding_text": embedding_text
            })
            i += 2
            continue
        
        # Pattern 3: Degree + Institution
        if _looks_like_degree(ln, edu_programs) and i + 1 < len(lines) and _looks_like_institution(lines[i + 1]):
            degree = ln
            institution = lines[i + 1]
            
            rest = lines[i + 2:]
            start_date, end_date = parse_date_range("\n".join(rest))
            description_items = normalize_bullets(rest) if not start_date else []

            embedding_text = " ".join([degree, institution, start_date, end_date, " ".join(description_items)]).strip()
            items.append({
                "degree": degree,
                "institution": institution,
                "start_date": start_date,
                "end_date": end_date,
                "description_items": description_items,
                "embedding_text": embedding_text
            })
            i += 2
            continue
        
        # Pattern 4: Degree with 'in' or 'from'
        degree_from_match = re.search(r"^(bachelor|master|phd|b\.?[as]|m\.?[as]|associate|diploma)[^,]*\s+(in|from|at)\s+(.+)$", ln, re.I)
        if degree_from_match:
            degree_text = degree_from_match.group(0).split(" in " if " in " in ln.lower() else " from ")[0]
            institution = degree_from_match.group(3)
            
            if _looks_like_degree(degree_text, edu_programs) or _looks_like_institution(institution):
                rest = lines[i + 1:]
                start_date, end_date = parse_date_range("\n".join(rest))
                description_items = normalize_bullets(rest) if not start_date else []
                
                embedding_text = " ".join([degree_text, institution, start_date, end_date, " ".join(description_items)]).strip()
                items.append({
                    "degree": degree_text,
                    "institution": institution,
                    "start_date": start_date,
                    "end_date": end_date,
                    "description_items": description_items,
                    "embedding_text": embedding_text
                })
                i += 1
                continue

        i += 1

    return items