import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Book,
  Users,
  BookOpen,
  UserSquare2,
  GraduationCap,
  BookMarked,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../stores/useAuth";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const logout = useAuth((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b">
          <Book className="w-8 h-8 text-indigo-600" />
          <span className="ml-2 text-xl font-semibold text-gray-800">
            Library System
          </span>
        </div>
        <nav className="mt-6">
          {/* Dashboard Button */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? "bg-indigo-50 text-indigo-600" : ""
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="mx-3">Dashboard</span>
          </NavLink>

          {/* Other Sidebar Links */}
          <NavLink
            to="/books"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? "bg-indigo-50 text-indigo-600" : ""
              }`
            }
          >
            <BookOpen className="w-5 h-5" />
            <span className="mx-3">Books</span>
          </NavLink>

          <NavLink
            to="/authors"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? "bg-indigo-50 text-indigo-600" : ""
              }`
            }
          >
            <UserSquare2 className="w-5 h-5" />
            <span className="mx-3">Authors</span>
          </NavLink>

          <NavLink
            to="/members"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? "bg-indigo-50 text-indigo-600" : ""
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="mx-3">Members</span>
          </NavLink>

          <NavLink
            to="/borrowings"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? "bg-indigo-50 text-indigo-600" : ""
              }`
            }
          >
            <BookMarked className="w-5 h-5" />
            <span className="mx-3">Borrowings</span>
          </NavLink>

          <NavLink
            to="/classes"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 ${
                isActive ? "bg-indigo-50 text-indigo-600" : ""
              }`
            }
          >
            <GraduationCap className="w-5 h-5" />
            <span className="mx-3">Classes</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="mx-3">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
