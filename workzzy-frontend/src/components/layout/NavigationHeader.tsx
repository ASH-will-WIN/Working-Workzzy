import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui";

export default function NavigationHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.user_metadata?.role;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Workzzy
            </Link>
            <nav className="ml-10 flex space-x-4">
              {user && (
                <>
                  {userRole === "hirer" && (
                    <>
                      <Link
                        to="/create-job"
                        className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Create Job
                      </Link>
                      <Link
                        to="/applications"
                        className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Applications
                      </Link>
                    </>
                  )}
                  {userRole === "worker" && (
                    <>
                      <Link
                        to="/job-discovery"
                        className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Job Discovery
                      </Link>
                      <Link
                        to="/applications"
                        className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Applications
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <span className="mr-4 text-gray-600">
                  {user.user_metadata?.name} ({userRole})
                </span>
                <Button variant="outline" onClick={handleLogout} size="sm">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
