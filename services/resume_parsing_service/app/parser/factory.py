from __future__ import annotations

"""Parser factory helpers for selecting the active parser implementation."""

import os

from .parser_v1 import ParserV1
from .parser_v2 import ParserV2


def normalize_parser_version(version: str | None) -> str:
    """Collapse environment and request values into a canonical parser version label."""

    return (version or os.getenv("DEFAULT_PARSER_VERSION", "v2")).strip().lower().replace("parser-", "")


def build_parser(version: str | None, **kwargs):
    selected = normalize_parser_version(version)
    if selected in {"v1", "1"}:
        return ParserV1(**kwargs)
    if selected in {"v2", "2"}:
        return ParserV2(**kwargs)
    raise ValueError(f"Unsupported parser_version '{version}'. Supported: v1, v2")
