/**
 * Standard Indian Central Pollution Control Board (CPCB) Air Quality Index (AQI) Calculation for PM2.5
 * Formula:
 *   AQI = ((I_Hi - I_Lo) / (B_Hi - B_Lo)) * (Cp - B_Lo) + I_Lo
 * (Round the final AQI result to the nearest integer).
 *
 * CPCB PM2.5 Breakpoints:
 *   1. 0.0 to 30.0 µg/m³:   AQI 0 to 50    (Good)
 *   2. 30.1 to 60.0 µg/m³:  AQI 51 to 100  (Satisfactory)
 *   3. 60.1 to 90.0 µg/m³:  AQI 101 to 200 (Moderate)
 *   4. 90.1 to 120.0 µg/m³: AQI 201 to 300 (Poor)
 *   5. 120.1 to 250.0 µg/m³:AQI 301 to 400 (Very Poor)
 *   6. > 250.0 µg/m³:       AQI 401 to 500 (Severe)
 *      (For values > 250, use B_Lo = 250, I_Lo = 401, B_Hi = 500, I_Hi = 500 for a linear projection).
 */

export function calculateAQI(pm25) {
  const Cp = Math.max(0, Number(pm25) || 0);

  let B_Lo;
  let B_Hi;
  let I_Lo;
  let I_Hi;
  let category;

  if (Cp <= 30.0) {
    B_Lo = 0;
    B_Hi = 30;
    I_Lo = 0;
    I_Hi = 50;
    category = "Good";
  } else if (Cp <= 60.0) {
    B_Lo = 31;
    B_Hi = 60;
    I_Lo = 51;
    I_Hi = 100;
    category = "Satisfactory";
  } else if (Cp <= 90.0) {
    B_Lo = 61;
    B_Hi = 90;
    I_Lo = 101;
    I_Hi = 200;
    category = "Moderate";
  } else if (Cp <= 120.0) {
    B_Lo = 91;
    B_Hi = 120;
    I_Lo = 201;
    I_Hi = 300;
    category = "Poor";
  } else if (Cp <= 250.0) {
    B_Lo = 121;
    B_Hi = 250;
    I_Lo = 301;
    I_Hi = 400;
    category = "Very Poor";
  } else {
    B_Lo = 250;
    B_Hi = 500;
    I_Lo = 401;
    I_Hi = 500;
    category = "Severe";
  }

  // Handle boundary float when concentration falls slightly below B_Lo (e.g. 30.5 falling in 31-60 bracket)
  const clampedCp = Math.max(B_Lo, Math.min(Cp, B_Hi));
  const rawAQI = ((I_Hi - I_Lo) / (B_Hi - B_Lo)) * (clampedCp - B_Lo) + I_Lo;
  const aqi = Math.round(rawAQI);

  return {
    aqi: Math.min(500, Math.max(0, aqi)),
    category,
  };
}
