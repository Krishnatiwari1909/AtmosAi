import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

class TestCoordinateForecast(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_live_forecast_by_named_location(self):
        """Verify backwards compatibility for named locations."""
        response = self.client.get("/api/forecast/live?location=yelahanka&profile=runner")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("predicted_pm25", data)
        self.assertIn("risk", data)
        self.assertEqual(data.get("profile"), "runner")
        self.assertFalse(data.get("is_custom_coordinates", False))

    def test_live_forecast_by_valid_coordinates(self):
        """Verify coordinate-based forecast with valid Bengaluru coords."""
        response = self.client.get("/api/forecast/live?lat=12.9716&lon=77.5946&profile=runner")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("predicted_pm25", data)
        self.assertIn("risk", data)
        self.assertTrue(data.get("is_custom_coordinates"))
        self.assertIsNotNone(data.get("coordinates"))
        self.assertAlmostEqual(data["coordinates"]["lat"], 12.9716, places=3)
        self.assertAlmostEqual(data["coordinates"]["lon"], 77.5946, places=3)
        self.assertIn("telemetry_source", data)

    def test_dedicated_live_coords_endpoint(self):
        """Verify /api/forecast/live-coords endpoint with Delhi coordinates."""
        response = self.client.get("/api/forecast/live-coords?lat=28.6139&lon=77.2090&profile=asthma_patient")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("profile"), "asthma_patient")
        self.assertTrue(data.get("is_custom_coordinates"))
        self.assertIn("telemetry_source", data)
        self.assertIn("features_used", data)
        self.assertIn("current_observations", data)

    def test_missing_one_coordinate_parameter_400(self):
        """Verify HTTP 400 if lat is supplied without lon."""
        response = self.client.get("/api/forecast/live?lat=12.9716")
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Both 'lat' (-90 to 90) and 'lon' (-180 to 180)", data.get("detail", ""))

        response2 = self.client.get("/api/forecast/live?lon=77.5946")
        self.assertEqual(response2.status_code, 400)

    def test_out_of_range_coordinates_422(self):
        """Verify FastAPI validation rejects coordinates outside [-90, 90] and [-180, 180]."""
        response_lat_high = self.client.get("/api/forecast/live?lat=95.0&lon=77.5946")
        self.assertEqual(response_lat_high.status_code, 422)

        response_lat_low = self.client.get("/api/forecast/live?lat=-91.0&lon=77.5946")
        self.assertEqual(response_lat_low.status_code, 422)

        response_lon_high = self.client.get("/api/forecast/live?lat=12.9716&lon=185.0")
        self.assertEqual(response_lon_high.status_code, 422)

        response_lon_low = self.client.get("/api/forecast/live?lat=12.9716&lon=-181.0")
        self.assertEqual(response_lon_low.status_code, 422)

    def test_demographic_profiles_preservation(self):
        """Verify that various user profiles are preserved in coordinate forecasts."""
        for profile in ["delivery_rider", "parent", "runner", "general", "school_admin"]:
            response = self.client.get(f"/api/forecast/live?lat=12.9716&lon=77.5946&profile={profile}")
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertEqual(data.get("profile"), profile)
            if data.get("explanation"):
                self.assertIn("action", data["explanation"])

if __name__ == "__main__":
    unittest.main()
