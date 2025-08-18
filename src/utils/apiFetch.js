export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token'); 
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
      throw new Error(data.message || 'API request failed');
    }

    return data; 
  } catch (err) {
    console.error('API Fetch Error:', err);
    throw err;
  }
};
