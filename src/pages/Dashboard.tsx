import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Book,
  Users,
  BookMarked,
  Clock,
  TrendingUp,
  UserCheck,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { format } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalBooks: number;
  totalMembers: number;
  activeBorrowings: number;
  overdueBooks: number;
  topBorrowers: Array<{ name: string; count: number }>;
  mostBorrowedBooks: Array<{ title: string; count: number }>;
  genderDistribution: { male: number; female: number };
  recentBorrowings: Array<{
    id: number;
    bookTitle: string;
    memberName: string;
    borrowDate: string;
  }>;
}

export default function Dashboard() {
  const { user = { role: "user" } } = useAuth();
  const isAdmin = user?.role === "admin";

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await axios.get(
        "http://localhost:5000/dashboard/stats"
      );
      return response.data;
    },
    initialData: {
      totalBooks: 0,
      totalMembers: 0,
      activeBorrowings: 0,
      overdueBooks: 0,
      topBorrowers: [],
      mostBorrowedBooks: [],
      genderDistribution: { male: 0, female: 0 },
      recentBorrowings: [],
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">Failed to load dashboard data.</p>
      </div>
    );
  }

  const StatCard = ({
    icon: Icon,
    title,
    value,
    className,
  }: {
    icon: any;
    title: string;
    value: number | string;
    className?: string;
  }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const barChartData = {
    labels: stats?.topBorrowers.map((b) => b.name) || [],
    datasets: [
      {
        label: "Number of Books Borrowed",
        data: stats?.topBorrowers.map((b) => b.count) || [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [
          stats?.genderDistribution.male || 0,
          stats?.genderDistribution.female || 0,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.5)",
          "rgba(236, 72, 153, 0.5)",
        ],
        borderColor: ["rgb(59, 130, 246)", "rgb(236, 72, 153)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500">
          {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          key="totalBooks"
          icon={Book}
          title="Total Books"
          value={stats?.totalBooks || 0}
        />
        <StatCard
          key="totalMembers"
          icon={Users}
          title="Total Members"
          value={stats?.totalMembers || 0}
        />
        <StatCard
          key="activeBorrowings"
          icon={BookMarked}
          title="Active Borrowings"
          value={stats?.activeBorrowings || 0}
        />
        <StatCard
          key="overdueBooks"
          icon={Clock}
          title="Overdue Books"
          value={stats?.overdueBooks || 0}
          className="bg-red-50"
        />
      </div>

      {isAdmin && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Top Borrowers Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                Top Borrowers
              </h2>
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>

            {/* Gender Distribution Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4">
                Gender Distribution
              </h2>
              <div className="h-[300px] flex items-center justify-center">
                <Doughnut
                  data={doughnutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Borrowings Table */}
          <div className="bg-white rounded-lg shadow-md mt-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Recent Borrowings
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrow Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats?.recentBorrowings.length > 0 ? (
                      stats.recentBorrowings.map((borrowing) => (
                        <tr key={borrowing.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {borrowing.bookTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {borrowing.memberName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {format(
                              new Date(borrowing.borrowDate),
                              "MMM d, yyyy"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No recent borrowings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* User Dashboard */}
      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Your Borrowing History
            </h2>
            <div className="space-y-4">
              {stats?.recentBorrowings.map((borrowing) => (
                <div
                  key={borrowing.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        {borrowing.bookTitle}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(
                          new Date(borrowing.borrowDate),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">
              Important Notices
            </h2>
            <div className="space-y-4">
              {stats?.overdueBooks > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-600">
                      Overdue Books
                    </p>
                    <p className="text-sm text-red-500">
                      You have {stats.overdueBooks} overdue book(s).
                      Please return them as soon as possible.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
