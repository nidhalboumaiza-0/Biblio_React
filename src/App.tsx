import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import Books from "./pages/Books";
import Authors from "./pages/Authors";
import Members from "./pages/Members";
import Borrowings from "./pages/Borrowings";
import Classes from "./pages/Classes";
import Genres from "./pages/Genres";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="authors" element={<Authors />} />
          <Route path="members" element={<Members />} />
          <Route path="borrowings" element={<Borrowings />} />
          <Route path="classes" element={<Classes />} />
          <Route path="genres" element={<Genres />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
