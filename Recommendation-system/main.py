from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import UserPreferences
from recommender import recommend
from database import get_all_packages

app = FastAPI(title="Tour Recommender API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/recommend")
def get_recommendations(prefs: UserPreferences):
    try:
        packages = get_all_packages()

        if not packages:
            return {"count": 0, "results": []}

        results = recommend(packages, prefs.dict())

        return {
            "success": True,
            "count":   len(results),
            "results": results
        }
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
from pydantic import BaseModel
from typing import List

class BehaviourRequest(BaseModel):
    user_interests:     List[str] = []
    interactions:       List[dict] = []
    already_booked_ids: List[str]  = []

@app.post("/recommend-behaviour")
def get_behaviour_recommendations(req: BehaviourRequest):
    try:
        packages = get_all_packages()
        if not packages:
            return {"success": True, "count": 0, "results": [], "has_data": False}

        from behaviour_recommender import recommend_by_behaviour
        results = recommend_by_behaviour(
            packages         = packages,
            interactions     = req.interactions,
            user_interests   = req.user_interests,
            already_booked_ids = req.already_booked_ids,
        )

        return {
            "success":  True,
            "count":    len(results),
            "has_data": len(results) > 0,
            "results":  results,
        }
    except Exception as e:
        print(f"❌ Behaviour error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))