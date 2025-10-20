const geocodeCache = JSON.parse(localStorage.getItem("geocodeCache") || "{}");

export const reverseGeocode = async (lat, lng) => {
  const key = `${lat},${lng}`;

  if (geocodeCache[key]) {
    return geocodeCache[key];
  }

  try {
    const response = await fetch(
      `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=en-US&apikey=${process.env.REACT_APP_HERE_API_KEY}`
    );
    const data = await response.json();

    let address = `${lat}, ${lng}`;

    if (data.items && data.items.length > 0) {
      const item = data.items[0].address;

      const label = item.label || ""; 
      const barangay = item.district || item.subdistrict || item.neighborhood || "";

      if (barangay) {
        const cityOrPostal = item.city || item.postalCode || "";
        if (cityOrPostal && label.includes(cityOrPostal)) {
          address = label.replace(cityOrPostal, `${barangay}, ${cityOrPostal}`);
        } else {
          address = `${label}, ${barangay}`;
        }
      } else {
        address = label;
      }
    }

    geocodeCache[key] = address;
    localStorage.setItem("geocodeCache", JSON.stringify(geocodeCache));

    return address;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return `${lat}, ${lng}`;
  }
};
