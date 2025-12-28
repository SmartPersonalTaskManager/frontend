const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
console.log("API Base URL:", BASE_URL);

// Timeout wrapper for fetch
const fetchWithTimeout = async (url, options, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - backend may be waking up. Please try again.');
        }
        throw error;
    }
};

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

// Simple In-Memory Mock Database
const MOCK_DB = {
    tasks: [],
    missions: [],
    visions: [],
    values: [],
    contexts: []
};

// Initialize Mock DB from LocalSupport if empty (Persistence)
const initMockDB = () => {
    const stored = localStorage.getItem('sptm_mock_db');
    if (stored) {
        Object.assign(MOCK_DB, JSON.parse(stored));
    }
    // Simulate user ID if not exists
    if (!localStorage.getItem('sptm_userId')) {
        localStorage.setItem('sptm_userId', '1');
    }
};

const saveMockDB = () => {
    localStorage.setItem('sptm_mock_db', JSON.stringify(MOCK_DB));
};

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

if (useMock) initMockDB();

export const api = {
    get: async (endpoint) => {
        if (useMock) {
            await new Promise(r => setTimeout(r, 300)); // Simulate delay

            // Tasks
            if (endpoint.includes('/tasks/user/')) {
                return MOCK_DB.tasks;
            }
            // Contexts
            if (endpoint.includes('/contexts')) {
                return MOCK_DB.contexts;
            }
            // Missions
            if (endpoint.includes('/missions/user/')) {
                return MOCK_DB.missions;
            }
            // Visions
            if (endpoint.includes('/visions/user/')) {
                return MOCK_DB.visions;
            }
            // Values
            if (endpoint.includes('/core-values/user/')) {
                return MOCK_DB.values;
            }
            return [];
        }

        const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    post: async (endpoint, body) => {
        if (useMock) {
            await new Promise(r => setTimeout(r, 300));
            const id = Date.now();
            const newItem = { ...body, id };

            if (endpoint.includes('/tasks')) {
                MOCK_DB.tasks.push(newItem);
            } else if (endpoint.includes('/submissions')) {
                // Format: /missions/{parentId}/submissions
                // Extract parentId
                // But wait, the hook passes parentId in payload? 
                // MissionContext: post(`/missions/${parentId}/submissions`, payload);
                // Payload has parentId.
                newItem.parentId = parseInt(endpoint.split('/')[2]);
                MOCK_DB.missions.push(newItem);
            } else if (endpoint.includes('/missions')) {
                MOCK_DB.missions.push(newItem);
            } else if (endpoint.includes('/visions')) {
                MOCK_DB.visions.push(newItem);
            } else if (endpoint.includes('/core-values')) {
                MOCK_DB.values.push(newItem);
            } else if (endpoint.includes('/contexts')) {
                MOCK_DB.contexts.push(newItem);
            }

            saveMockDB();
            return newItem;
        }

        const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            let msg = response.statusText;
            try {
                const text = await response.text();
                // Check if it's JSON error
                try {
                    const json = JSON.parse(text);
                    if (json.error) msg += ` - ${json.error}`;
                    else msg += ` - ${text}`;
                } catch {
                    if (text) msg += ` - ${text}`;
                }
            } catch (e) { }
            throw new Error(`API Error: ${msg}`);
        }
        return response.json();
    },

    put: async (endpoint, body) => {
        if (useMock) {
            await new Promise(r => setTimeout(r, 300));
            // Extract ID from endpoint: /tasks/123
            const parts = endpoint.split('/');
            const id = parseInt(parts[parts.length - 1]);

            let collection = null;
            if (endpoint.includes('tasks')) collection = MOCK_DB.tasks;
            else if (endpoint.includes('missions') || endpoint.includes('submissions')) collection = MOCK_DB.missions;
            else if (endpoint.includes('visions')) collection = MOCK_DB.visions; // Not implemented in details but for safety
            else if (endpoint.includes('core-values')) collection = MOCK_DB.values;

            if (collection) {
                const index = collection.findIndex(i => i.id === id);
                if (index !== -1) {
                    collection[index] = { ...collection[index], ...body };
                    saveMockDB();
                    return collection[index];
                }
            }
            return body;
        }

        const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    delete: async (endpoint) => {
        if (useMock) {
            await new Promise(r => setTimeout(r, 300));
            const parts = endpoint.split('/');
            const id = parseInt(parts[parts.length - 1]);

            if (endpoint.includes('tasks')) {
                MOCK_DB.tasks = MOCK_DB.tasks.filter(i => i.id !== id);
            } else if (endpoint.includes('missions')) {
                MOCK_DB.missions = MOCK_DB.missions.filter(i => i.id !== id);
            } else if (endpoint.includes('core-values')) {
                MOCK_DB.values = MOCK_DB.values.filter(i => i.id !== id);
            }
            saveMockDB();
            return true;
        }

        const response = await fetchWithTimeout(`${BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return true;
    },
};

export default BASE_URL;
