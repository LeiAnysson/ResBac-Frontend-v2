export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn("No token found — user may need to log in again.");
    throw new Error("Unauthorized: No token");
  }
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json(); 

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error(data.message || "API request failed");
    }

    return data; 
  } catch (err) {
    console.error('API Fetch Error:', err);
    throw err;
  }
};
