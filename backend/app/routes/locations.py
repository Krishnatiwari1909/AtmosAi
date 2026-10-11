from fastapi import APIRouter


router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)


@router.get("")
def get_locations():

    return {
        "locations": [
            {
                "id": "yelahanka",
                "name": "Bengaluru - Yelahanka",
                "region": "North Bengaluru",
                "lat": 13.1007,
                "lon": 77.5963,
                "type": "Residential / Suburb"
            },
            {
                "id": "peenya",
                "name": "Bengaluru - Peenya",
                "region": "Industrial Hub",
                "lat": 13.0285,
                "lon": 77.5197,
                "type": "Industrial"
            },
            {
                "id": "silk_board",
                "name": "Bengaluru - Silk Board",
                "region": "High Traffic Corridor",
                "lat": 12.9172,
                "lon": 77.6228,
                "type": "Traffic Hotspot"
            },
            {
                "id": "bengaluru",
                "name": "Bengaluru - Central",
                "region": "City Center",
                "lat": 12.9716,
                "lon": 77.5946,
                "type": "Urban Central"
            },
            {
                "id": "delhi",
                "name": "Delhi - NCR",
                "region": "National Capital",
                "lat": 28.6139,
                "lon": 77.2090,
                "type": "Megacity"
            },
            {
                "id": "hyderabad",
                "name": "Hyderabad - HITEC City",
                "region": "Tech Corridor",
                "lat": 17.3850,
                "lon": 78.4867,
                "type": "Urban / IT"
            }
        ]
    }