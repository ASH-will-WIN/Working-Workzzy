import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900">Workzzy</h1>
            <nav className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  window.location.href = "/login";
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
