import { useState } from "react";

interface AuthData {
  name: string;
  email: string;
  phone?: string;
}

interface AuthResult {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
  };
  error?: string;
}

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  // Generic helper for making HTTP requests
  const makeRequest = async (
    url: string,
    method: "GET" | "POST" = "POST",
    body?: Record<string, unknown>
  ): Promise<AuthResult> => {
    setLoading(true);

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (body && method === "POST") {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);
      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        return {
          success: true,
          data: {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: data.message,
          },
        };
      } else {
        return {
          success: false,
          error: data.error || "Request failed",
        };
      }
    } catch {
      setLoading(false);
      return {
        success: false,
        error: "Network error",
      };
    }
  };

  const registerOrLogin = async (
    userData: AuthData,
    endpoint: string
  ): Promise<AuthResult> => {
    const { name, email, phone } = userData;

    if (!name || !email) {
      return {
        success: false,
        error: "Missing required fields: name, email",
      };
    }

    return makeRequest(endpoint, "POST", { name, email, phone: phone || "" });
  };

  const loginById = async (
    id: string,
    endpoint: string
  ): Promise<AuthResult> => {
    if (!id.trim()) {
      return {
        success: false,
        error: "ID is required",
      };
    }

    return makeRequest(`${endpoint}/${id}`, "GET");
  };

  return {
    loading,
    registerOrLogin,
    loginById,
  };
};
