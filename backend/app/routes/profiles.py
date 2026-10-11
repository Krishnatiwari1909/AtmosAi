from fastapi import APIRouter


router = APIRouter(
    prefix="/profiles",
    tags=["Profiles"]
)


@router.get("")
def get_profiles():

    return {
        "profiles": [
            {
                "id": "general",
                "name": "General Public",
                "description": "Standard precautions and advisory"
            },
            {
                "id": "parent",
                "name": "Parent / Guardian",
                "description": "Children playtime and outdoor exposure protection"
            },
            {
                "id": "delivery_rider",
                "name": "Delivery Rider",
                "description": "High-mileage route and shift scheduling advice"
            },
            {
                "id": "asthma_patient",
                "name": "Respiratory Sensitive",
                "description": "Asthma and pulmonary vulnerability safeguards"
            },
            {
                "id": "runner",
                "name": "Runner / Athlete",
                "description": "Endurance training and workout timing"
            },
            {
                "id": "office_commuter",
                "name": "Office Commuter",
                "description": "Rush-hour transit and traffic exposure windows"
            },
            {
                "id": "school_admin",
                "name": "School Administrator",
                "description": "Recess, sports grounds and bus queue planning"
            }
        ]
    }