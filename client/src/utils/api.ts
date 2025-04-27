// API utility functions for making requests to the backend

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
}

export const API_URL = 'http://localhost:5000'; // Replace with your actual API URL

export const fetchApi = async (endpoint: string, options: ApiOptions = {}) => {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {},
    includeAuth = true,
  } = options;

  // Get token from session storage if includeAuth is true
  const token = includeAuth ? sessionStorage.getItem('token') : null;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers,
  };

  // Add body if it exists
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

  // Check if response is ok
  if (!response.ok) {
    // Try to parse error response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    } catch (error) {
      // If parsing fails, throw generic error with status
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  // Parse and return response
  return await response.json();
};

// Specialized API functions
// api.ts
// api.ts
export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (response.ok) {
    return data; // This should return { token: 'your-token', username: 'user' }
  } else {
    throw new Error(data.message || 'Login failed');
  }
};



// src/utils/api.ts
export const signup = async (username: string, password: string) => {
  console.log('Signup function called with:', username, password); // Debugging line
  
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  // If the response is not ok (i.e., status is not 200), throw an error
  if (!response.ok) {
    // Attempt to parse the response body (JSON error message) when status isn't OK
    const errorDetails = await response.json();  // Parsing response as JSON

    // If the error message exists, throw with details
    throw new Error(`${response.status} - ${errorDetails.error || 'Failed to signup'}`);
  }

  // If the signup is successful, return the response JSON
  return response.json(); // Successful signup returns data from the backend
};


// src/utils/api.ts
export const uploadImage = async (formData: FormData) => {
  const token = sessionStorage.getItem('token');
  console.log('Token:', token); // Debugging line
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/predict`, {  // API_URL should be the correct backend URL
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  console.log('Response:', response); // Debugging line
  if (!response.ok) {
    // throw new Error('Failed to upload image');
    const errorDetails = await response.json();  // Parsing response as JSON
    throw new Error(`${response.status} - ${errorDetails.error || 'Failed to signup'}`);

  }

  return await response.json();
};

