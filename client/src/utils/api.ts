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

  const token = includeAuth ? sessionStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: 'include', // ✨ Important for cookie handling
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    } catch (error) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  return await response.json();
};


// Specialized API functions
// api.ts
// api.ts
// export const login = async (username: string, password: string) => {
//   const response = await fetch(`${API_URL}/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     credentials: 'include', // Send cookie
//     body: JSON.stringify({ username, password }),
//   });
//   return response;
// };

interface LoginResponse {
  ok: boolean;
  status: number;
  json: () => Promise<any>;
}

// Login API function
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ username, password }),
    });
    
    console.log('Login function called with:', username, 'password:', '*****', 'status:', response.status); 

    // Return full response to handle different status codes in the component
    return {
      ok: response.ok,
      status: response.status,
      json: () => response.json()
    };
    
  } catch (error) {
    console.log('Login request failed:', error);
    throw error;
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
  const responseData = await response.json(); // ✅ Read once here!
  console.log('Response data:', responseData); // ✅ Debugging line 
    if (!response.ok) {
      throw new Error(responseData.error || responseData.message || 'Sign up Failed');
    }

  // If the signup is successful, return the response JSON
  return responseData; // Successful signup returns data from the backend
};


export const uploadImage = async (formData: FormData) => {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const responseData = await response.json(); // ✅ Read once here!
    console.log('Response data:', responseData); // ✅ Debugging line 
    if (!response.ok) {
      throw new Error(responseData.message || 'Prediction failed');
    }

    console.log('Image upload function called with:', response, responseData); // ✅ Only log responseData
    return responseData;
    
  } catch (error) {
    console.error('Error during image upload:', error);
    throw error;
  }
};




export const handleLogout = async () => {
  try {
    // Call the API using fetchApi, which already returns parsed JSON data
    const response = await fetchApi('/logout', {
      method: 'POST',
      includeAuth: true, // Send token with request
    });

    // Check if response has expected message or status
    if (response && response.message) {
      console.log('Logout successful:', response.message);
    } else {
      console.error('Error during logout:', response);
      throw new Error('Logout failed');
    }

    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    return null;
  }
};


