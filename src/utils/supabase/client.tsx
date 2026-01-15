import { makeBaseUrl, publicAnonKey } from './info';

// Simple client utility for making requests to our Supabase Edge Functions
export const supabaseClient = {
  // This is just a placeholder - we'll use makeServerRequest for actual API calls
  url: makeBaseUrl,
  key: publicAnonKey
};

// Helper function to make authenticated requests to our server
export async function makeServerRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${makeBaseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server request failed: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Server request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
}