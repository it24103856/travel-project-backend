import numpy as np
import math
from datetime import datetime, timezone
from sklearn.metrics.pairwise import cosine_similarity

ALL_CATEGORIES = [
    "adventure", "wildlife", "historical",
    "cultural", "beach", "wellness", "eco", "family"
]

ALL_INTERESTS = [
    "hiking", "surfing", "nature_photography", "wildlife_spotting",
    "camping", "diving", "paddling_boats", "stargazing",
    "cycling", "rock_climbing", "bird_watching", "cultural_tours"
]

ALL_WEATHER = ["sunny", "tropical", "humid", "cool", "dry", "rainy"]

ALL_LOCATIONS = [
    "Colombo", "Kandy", "Galle", "Jaffna", "Anuradhapura",
    "Polonnaruwa", "Sigiriya", "Ella", "Nuwara Eliya", "Trincomalee",
    "Batticaloa", "Hambantota", "Mirissa", "Hikkaduwa", "Arugam Bay",
    "Yala", "Wilpattu", "Udawalawe", "Dambulla", "Matara",
    "Bentota", "Negombo", "Ratnapura", "Badulla", "Ampara",
    "Multi-location"
]

# ── Signal weights ─────────────────────────────────────────────────────────────
SIGNAL_WEIGHTS = {
    "view_short":  1.0,   # viewed < 30 seconds
    "view_long":   2.0,   # viewed >= 30 seconds
    "booking":     3.0,   # booked a package
    "rating_high": 5.0,   # rated 4 or 5 stars (booked + loved it — strongest signal)
    "rating_mid":  2.0,   # rated 3 stars (booked + neutral)
    "rating_low":  1.0,   # rated 1 or 2 stars (booked but didn't enjoy)
}

DECAY_RATE = 0.008  # interaction 30 days ago retains ~79% weight


def decayed_weight(base_weight: float, created_at) -> float:
    """Apply time decay so recent interactions matter more."""
    try:
        if isinstance(created_at, str):
            ts = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        else:
            ts = created_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        days_ago = (datetime.now(timezone.utc) - ts).days
        return base_weight * math.exp(-DECAY_RATE * days_ago)
    except Exception:
        return base_weight


def get_signal_weight(action: str, rating=None, view_duration=None) -> float:
    """Convert an interaction into a numeric weight."""
    if action == "booking":
        return SIGNAL_WEIGHTS["booking"]

    if action == "rating" and rating is not None:
        if rating >= 4:
            return SIGNAL_WEIGHTS["rating_high"]
        elif rating == 3:
            return SIGNAL_WEIGHTS["rating_mid"]
        else:
            return SIGNAL_WEIGHTS["rating_low"]

    if action == "view":
        duration = view_duration or 0
        if duration >= 30:
            return SIGNAL_WEIGHTS["view_long"]
        return SIGNAL_WEIGHTS["view_short"]

    return 0.0


def build_behaviour_profile(interactions: list, user_interests: list) -> dict:
    """
    Aggregate all interactions into a profile dict with scores per feature.
    Each key maps to a weighted score — higher = stronger preference.

    Returns:
    {
        "categories": {"wildlife": 8.2, "beach": 3.1, ...},
        "interests":  {"hiking": 5.0, "diving": 2.4, ...},
        "weather":    {"sunny": 6.0, ...},
        "locations":  {"Yala": 5.0, ...},
        "has_data": True/False
    }
    """
    cat_scores  = {c: 0.0 for c in ALL_CATEGORIES}
    int_scores  = {i: 0.0 for i in ALL_INTERESTS}
    wea_scores  = {w: 0.0 for w in ALL_WEATHER}
    loc_scores  = {l: 0.0 for l in ALL_LOCATIONS}

    for log in interactions:
        pkg = log.get("package_id") or {}
        if not pkg:
            continue

        weight = get_signal_weight(
            log.get("action"),
            log.get("rating"),
            log.get("view_duration")
        )
        weight = decayed_weight(weight, log.get("createdAt", ""))

        is_negative = weight < 0

        # Categories
        for cat in pkg.get("categories", []):
            if cat in cat_scores:
                cat_scores[cat] += weight
               
        # Interests
        for interest in pkg.get("interests", []):
            if interest in int_scores:
                int_scores[interest] += weight

        # Weather
        for w in pkg.get("weather", []):
            if w in wea_scores:
                wea_scores[w] += weight

        # Location
        loc = pkg.get("location", "")
        if loc in loc_scores:
            loc_scores[loc] += weight

    total_signal = sum(abs(v) for v in cat_scores.values()) + \
                   sum(abs(v) for v in int_scores.values())

    return {
        "categories":        cat_scores,
        "interests":         int_scores,
        "weather":           wea_scores,
        "locations":         loc_scores,
        "has_data":          total_signal > 0,
    }


def build_user_behaviour_vector(profile: dict) -> np.ndarray:
    """
    Convert the behaviour profile into a flat numeric vector.
    Vector: categories(8) + interests(12) + weather(6) + locations(26) = 52 dims
    """
    vector = []

    # Normalise a score dict to 0–1
    def normalise(scores: dict, keys: list) -> list:
        values = [max(scores.get(k, 0.0), 0.0) for k in keys]  # clip negatives to 0
        max_val = max(values) if max(values) > 0 else 1.0
        return [v / max_val for v in values]

    vector.extend(normalise(profile["categories"], ALL_CATEGORIES))
    vector.extend(normalise(profile["interests"],  ALL_INTERESTS))
    vector.extend(normalise(profile["weather"],    ALL_WEATHER))
    vector.extend(normalise(profile["locations"],  ALL_LOCATIONS))

    return np.array(vector, dtype=float)


def build_package_behaviour_vector(pkg: dict) -> np.ndarray:
    """
    Convert a package into the same 52-dim vector space.
    """
    vector = []

    for cat in ALL_CATEGORIES:
        vector.append(1.0 if cat in pkg.get("categories", []) else 0.0)

    for interest in ALL_INTERESTS:
        vector.append(1.0 if interest in pkg.get("interests", []) else 0.0)

    for w in ALL_WEATHER:
        vector.append(1.0 if w in pkg.get("weather", []) else 0.0)

    for loc in ALL_LOCATIONS:
        vector.append(1.0 if loc == pkg.get("location", "") else 0.0)

    return np.array(vector, dtype=float)


def recommend_by_behaviour(
    packages: list,
    interactions: list,
    user_interests: list,
    already_booked_ids: list,
    top_n: int = 10
) -> list:
    """
    Main behaviour recommendation function.
    1. Build behaviour profile from interactions + registration interests
    2. Exclude already-booked packages
    3. Cosine similarity score each candidate
    4. Return top_n sorted results
    """
    profile = build_behaviour_profile(interactions, user_interests)

    if not profile["has_data"]:
        return []   # no history and no interests — caller should use preference-based instead

    user_vec = build_user_behaviour_vector(profile).reshape(1, -1)

    results = []
    for pkg in packages:
        pkg_id = str(pkg.get("id") or pkg.get("_id", ""))

        # Skip already booked packages
        if pkg_id in already_booked_ids:
            continue

        pkg_vec     = build_package_behaviour_vector(pkg).reshape(1, -1)
        similarity  = cosine_similarity(user_vec, pkg_vec)[0][0]
        match_score = round(float(similarity) * 100, 1)

        results.append({**pkg, "match_score": match_score})

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_n]