import { searchLocation } from "../services/openMeteo/geocodingService.js";

export async function getLocation({ query }) {
  const results = await searchLocation(query);

  if (!results.length) {
    return {
      found: false,
      results: [],
    };
  }

  return {
    found: true,
    results: results.map((location) => ({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      country_code: location.country_code,
      admin1: location.admin1 ?? null,
      timezone: location.timezone ?? null,
    })),
  };
}