import { reverseGeocode } from "../backend/services/location/reverseGeocodingService.js";

export async function POST(request) {
  try {
    const body = await request.json();

    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return Response.json(
        { error: "Valid latitude and longitude are required" },
        { status: 400 }
      );
    }

    const result = await reverseGeocode(latitude, longitude);

    return Response.json(result);
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    return Response.json(
      { error: "Failed to resolve location" },
      { status: 500 }
    );
  }
}