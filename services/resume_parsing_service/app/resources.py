import pandas as pd
from typing import Set, Tuple, Optional
import json


def _clean(s: str) -> str:
    return " ".join(str(s).strip().split()).lower()

def load_experience_gazetteer(experience_csv_path: str) -> Tuple[Set[str], Set[str]]:
    df = pd.read_csv(str(experience_csv_path), usecols=["title", "firm"])
    titles = set(_clean(x) for x in df["title"].dropna().astype(str))
    firms = set(_clean(x) for x in df["firm"].dropna().astype(str))

    titles = {t for t in titles if len(t) >= 2}
    firms = {f for f in firms if len(f) >= 2}
    return titles, firms


def load_education_programs(education_csv_path: str) -> Set[str]:
    df = pd.read_csv(str(education_csv_path))

    if "program" not in df.columns:
        raise ValueError(f"education.csv must have 'program' column. Found: {list(df.columns)}")

    programs = set(_clean(x) for x in df["program"].dropna().astype(str))
    programs = {p for p in programs if len(p) >= 2}
    return programs

def load_jz_skill_phrases(jsonl_path: str) -> Set[str]:
    phrases: Set[str] = set()

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            pat = obj.get("pattern")

            if isinstance(pat, list):
                toks = []
                ok = True
                for tok in pat:
                    if "OP" in tok:
                        ok = False
                        break
                    val = tok.get("TEXT") or tok.get("LOWER")
                    if not val or not str(val).strip():
                        ok = False
                        break
                    toks.append(str(val))
                if ok and toks:
                    phrases.add(" ".join(toks).strip())
            elif isinstance(pat, str) and pat.strip():
                phrases.add(pat.strip())

    return phrases