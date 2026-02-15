from typing import Set
from spacy.matcher import PhraseMatcher

def build_phrase_matcher(nlp, phrases: Set[str], label: str) -> PhraseMatcher:
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(p) for p in phrases if 2 <= len(p) <= 80]
    if patterns:
        matcher.add(label, patterns)
    return matcher