from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict


class ResumeParserBase(ABC):
    version: str

    @abstractmethod
    def parse(self, filename: str, content: bytes) -> Dict[str, Any]:
        raise NotImplementedError
