const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const getHeaders = () => {
    const headers = {
        "Content-Type": "application/json",
    };
    const token = localStorage.getItem("googleAccessToken") || localStorage.getItem("googleCalendarToken");
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    get: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    post: async (endpoint, body) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    put: async (endpoint, body) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    delete: async (endpoint) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return true; // Return true on success
    },
};

export default BASE_URL;
