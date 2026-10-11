import json
from pathlib import Path
from fastapi import APIRouter


router = APIRouter(
    prefix="/accuracy",
    tags=["Accuracy"]
)


@router.get("")
def get_accuracy():
    accuracy_file = Path(__file__).resolve().parents[3] / "ml-team-repo" / "ml" / "accuracy.json"
    if accuracy_file.exists():
        try:
            with open(accuracy_file, "r") as f:
                metrics = json.load(f)
            return {
                "status": "available",
                "metrics": metrics
            }
        except Exception:
            pass

    return {
        "status": "not_available",
        "message": "Accuracy will be available after model backtesting."
    }