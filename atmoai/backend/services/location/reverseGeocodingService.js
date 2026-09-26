export async function reverseGeocode(latitude, longitude) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}` +
    `&format=jsonv2` +
    `&addressdetails=1` +
    `&zoom=14`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AtmoSphere/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Reverse geocoding request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return {
    latitude: Number(data.lat),
    longitude: Number(data.lon),
    displayName: data.display_name ?? null,
    address: data.address ?? {},
  };
}