
import sys
from pathlib import Path

# Locate Person 3's existing ML repository.
def _resolve_ml_root():
    candidates = [
        Path(__file__).resolve().parents[3] / "ml-team-repo" / "ml",
        Path(__file__).resolve().parents[2] / "ml-team-repo" / "ml",
        Path("/app/ml-team-repo/ml"),
        Path.cwd() / "ml-team-repo" / "ml",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]

ML_ROOT = _resolve_ml_root()

if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from predict import predictor


def get_predictor():
    """Return the loaded LightGBM predictor."""
    if predictor.model is None:
        raise RuntimeError("The AtmosAI ML model could not be loaded.")

    return predictor


def predict_forecast(features: dict) -> dict:
    """Run the existing team's prediction logic."""
    model_predictor = get_predictor()
    return model_predictor.predict(features)
