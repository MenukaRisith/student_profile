// utils/api.ts

// Base URL of the backend
export const BASE_URL = "http://localhost:3000";

// Helper function to fetch data from the backend
export const fetchFromApi = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching from API:", error);
        throw error;
    }
};