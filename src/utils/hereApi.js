const geocodeCache = JSON.parse(localStorage.getItem("geocodeCache") || "{}");

export const reverseGeocode = async (lat, lng) => {
  const key = `${lat},${lng}`;

  if (geocodeCache[key]) {
    console.log(`Cache hit for ${key}`);
    return geocodeCache[key];
  }

  try {
    console.log(`Calling HERE API for ${key}`);
    const response = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=en-US&apikey=${process.env.REACT_APP_HERE_API_KEY}`
    );
    const data = await response.json();
    const address = (data.items && data.items.length > 0) 
      ? data.items[0].address.label 
      : `${lat}, ${lng}`;

    geocodeCache[key] = address;
    localStorage.setItem("geocodeCache", JSON.stringify(geocodeCache));

    return address;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `${lat}, ${lng}`;
  }
};