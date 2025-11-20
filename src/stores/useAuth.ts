import { create } from "zustand";
import axios from "axios";

interface AuthState {
  token: string | null;
  role: string | null; // Add role to the state
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"), // Initialize role from localStorage

  login: async (username: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          username,
          password,
        }
      );

      const { access_token, user_role } = response.data; // Extract token and role from the response
      console.log(response.data);
      console.log(user_role);
      // Store the token and role in localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", user_role);

      // Set the token and role in the state
      set({ token: access_token, role: user_role });

      // Set the default Authorization header for axios
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  },

  logout: () => {
    // Remove the token and role from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");

    // Remove the Authorization header from axios
    delete axios.defaults.headers.common["Authorization"];

    // Reset the state
    set({ token: null, role: null });
  },
}));
