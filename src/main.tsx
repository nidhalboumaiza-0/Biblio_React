import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"; // Import QueryClient and QueryClientProvider
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import App from "./App.tsx";
import "./index.css";

// Create a QueryClient instance
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Wrap the App component with QueryClientProvider and AuthProvider */}
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
