from pydantic import BaseModel
from typing import List

class UserPreferences(BaseModel):
    # ── Hard filter fields ─────────────────────────────────────────────────────
    budget:    float
    duration:  int
    adults:    int
    children:  int = 0

    # ── Soft match fields ──────────────────────────────────────────────────────
    categories: List[str] = []
    weather:    List[str] = []
    location:   str = ""
    interests:  List[str] = []