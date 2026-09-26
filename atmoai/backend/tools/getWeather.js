// getWeather.js
import { fetchWeather } from "../services/openMeteo/weatherServices.js";

export async function getWeather({ latitude, longitude }) {
  return await fetchWeather(latitude, longitude);
}