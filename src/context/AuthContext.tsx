import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";

interface User {
  id: number;
  role: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      // Set axios default header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Set the user data from localStorage
      setUser({
        id: 1, // Replace with the actual user ID if available
        role,
        username: "admin", // Replace with the actual username if available
      });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          username,
          password,
        }
      );

      const { access_token, user_role } = response.data;

      // Store the token and role in localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", user_role);

      // Set the user data in the state
      setUser({
        id: 1, // Replace with the actual user ID if available
        role: user_role,
        username,
      });

      // Set the default Authorization header for axios
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    // Remove the token and role from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");

    // Remove the Authorization header from axios
    delete axios.defaults.headers.common["Authorization"];

    // Reset the user state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
