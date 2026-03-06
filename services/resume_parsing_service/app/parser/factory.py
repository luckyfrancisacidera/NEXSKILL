from __future__ import annotations

import os

from .parser_v1 import ParserV1
from .parser_v2 import ParserV2


def build_parser(version: str | None, **kwargs):
    selected = (version or os.getenv("DEFAULT_PARSER_VERSION", "v2")).strip().lower().replace("parser-", "")
    if selected in {"v1", "1"}:
        return ParserV1(**kwargs)
    if selected in {"v2", "2"}:
        return ParserV2(**kwargs)
    raise ValueError(f"Unsupported parser_version '{version}'. Supported: v1, v2")
