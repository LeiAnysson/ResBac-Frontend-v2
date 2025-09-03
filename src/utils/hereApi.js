export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=en-US&apikey=${process.env.REACT_APP_HERE_API_KEY}`
    );
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].address.label || "Unknown location"; 
    }
    return `${lat}, ${lng}`;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `${lat}, ${lng}`;
  }
};
