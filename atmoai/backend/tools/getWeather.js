// getWeather.js
import { fetchWeather } from "../services/openMeteo/weatherService.js";

export async function getWeather({ latitude, longitude }) {
  return await fetchWeather(latitude, longitude);
}