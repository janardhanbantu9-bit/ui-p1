import { reverseGeocode } from "../services/location/reverseGeocodingService.js";

export async function reverseGeocodeTool({ latitude, longitude }) {
  return await reverseGeocode(latitude, longitude);
}