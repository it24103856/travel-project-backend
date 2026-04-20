import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

ALL_CATEGORIES = [
    "adventure", "wildlife", "historical",
    "cultural", "beach", "wellness", "eco", "family"
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

ALL_INTERESTS = [
    "hiking", "surfing", "nature_photography", "wildlife_spotting",
    "camping", "diving", "paddling_boats", "stargazing",
    "cycling", "rock_climbing", "bird_watching", "cultural_tours"
]

# categories (8) + weather (6) + location (26) + interests (12) + duration (1) = 53 dims


def build_user_vector(prefs: dict) -> np.ndarray:
    vector = []

    # 1. Categories — multi-hot
    for cat in ALL_CATEGORIES:
        vector.append(1.0 if cat in prefs.get("categories", []) else 0.0)

    # 2. Weather — multi-hot
    for w in ALL_WEATHER:
        vector.append(1.0 if w in prefs.get("weather", []) else 0.0)

    # 3. Location — one-hot (empty = anywhere = all 1s)
    user_location = prefs.get("location", "")
    for loc in ALL_LOCATIONS:
        if not user_location:
            vector.append(1.0)
        else:
            vector.append(1.0 if loc == user_location else 0.0)

    # 4. Interests — multi-hot
    for interest in ALL_INTERESTS:
        vector.append(1.0 if interest in prefs.get("interests", []) else 0.0)

    # 5. Duration — normalised 0–1
    duration = min(max(int(prefs.get("duration", 1)), 1), 30)
    vector.append(duration / 30.0)

    return np.array(vector, dtype=float)


def build_package_vector(pkg: dict) -> np.ndarray:
    vector = []

    # 1. Categories — multi-hot
    for cat in ALL_CATEGORIES:
        vector.append(1.0 if cat in pkg.get("categories", []) else 0.0)

    # 2. Weather — multi-hot
    for w in ALL_WEATHER:
        vector.append(1.0 if w in pkg.get("weather", []) else 0.0)

    # 3. Location — one-hot
    for loc in ALL_LOCATIONS:
        vector.append(1.0 if loc == pkg.get("location", "") else 0.0)

    # 4. Interests — multi-hot
    for interest in ALL_INTERESTS:
        vector.append(1.0 if interest in pkg.get("interests", []) else 0.0)

    # 5. Duration — normalised
    duration = min(max(int(pkg.get("no_of_days", 1)), 1), 30)
    vector.append(duration / 30.0)

    return np.array(vector, dtype=float)


def hard_filter(packages: list, prefs: dict) -> list:
    total_pax = int(prefs.get("adults", 1)) + int(prefs.get("children", 0))
    budget    = float(prefs.get("budget", 0))

    filtered = []
    for pkg in packages:
        price      = float(pkg.get("price", 0))
        total_cost = price * total_pax
        min_group  = int(pkg.get("min_group_size", 1))
        max_group  = int(pkg.get("max_group_size", 9999))

        if total_cost > budget:
            continue
        if total_pax < min_group:
            continue
        if total_pax > max_group:
            continue

        pkg["total_cost"] = round(total_cost, 2)
        filtered.append(pkg)

    return filtered


def recommend(packages: list, prefs: dict, top_n: int = 10) -> list:
    candidates = hard_filter(packages, prefs)

    if not candidates:
        return []

    user_vec = build_user_vector(prefs).reshape(1, -1)

    results = []
    for pkg in candidates:
        pkg_vec     = build_package_vector(pkg).reshape(1, -1)
        similarity  = cosine_similarity(user_vec, pkg_vec)[0][0]
        match_score = round(float(similarity) * 100, 1)
        results.append({ **pkg, "match_score": match_score })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:top_n]