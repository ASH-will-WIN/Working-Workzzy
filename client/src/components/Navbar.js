import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import UnreadMessagesBadge from "./UnreadMessagesBadge";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserRole = () => {
    return user?.user_metadata?.role || "USER";
  };

  const getRoleColor = () => {
    const role = getUserRole();
    switch (role) {
      case "CLIENT":
        return "bg-wurkzi-500";
      case "WORKER":
        return "bg-success-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link to="/" className="nav-brand flex items-center">
            <img
              src={logo}
              alt="Workzzy Logo"
              className="w-14 h-14 sm:w-10 sm:h-10 object-contain mr-3"
            />
            <span className="sr-only">Workzzy</span>
          </Link>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-wurkzi-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-wurkzi-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden sm:flex nav-links">
            {isAuthenticated ? (
              <>
                <Link
                  to="/jobs"
                  className={`nav-link ${isActive("/jobs") ? "active" : ""}`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z"
                    />
                  </svg>
                  Jobs
                </Link>

                {user?.user_metadata?.role === "HIRER" && (
                  <Link
                    to="/jobs/new"
                    className={`nav-link ${isActive("/jobs/new") ? "active" : ""
                      }`}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Post Job
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard") ? "active" : ""
                    }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 00-2 2H5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2z"
                    />
                  </svg>
                  Dashboard
                </Link>

                <Link
                  to="/messages"
                  className={`nav-link relative ${isActive("/messages") ? "active" : ""
                    }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9 8a9.013 9.013 0 01-5.314-1.757l-3.42 1.026a.756.756 0 01-.932-.932l1.026-3.42A9.013 9.013 0 013 12c0-4.962 4.037-9 9-9s9 4.037 9 9z"
                    />
                  </svg>
                  Messages
                  <UnreadMessagesBadge />
                </Link>

                {/* User Menu */}
                <div className="flex items-center ml-4 space-x-3">
                  {/* User Role Badge */}
                  <div className="hidden sm:flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getRoleColor()}`}
                    >
                      {getUserRole()}
                    </span>
                  </div>

                  {/* User Avatar */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {getUserInitials()}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center text-gray-600 hover:text-wurkzi-600 font-medium transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`nav-link ${isActive("/") ? "active" : ""}`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  Home
                </Link>
                <Link
                  to="/login"
                  className={`nav-link ${isActive("/login") ? "active" : ""}`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Login
                </Link>

                <Link
                  to="/register"
                  className={`btn btn-primary btn-sm ${isActive("/register") ? "ring-2 ring-wurkzi-300" : ""
                    }`}
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/jobs"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${isActive("/jobs") ? "bg-gray-100" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jobs
                </Link>
                {user?.user_metadata?.role === "HIRER" && (
                  <Link
                    to="/jobs/new"
                    className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${isActive("/jobs/new") ? "bg-gray-100" : ""
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Post Job
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${isActive("/dashboard") ? "bg-gray-100" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/messages"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium relative ${isActive("/messages") ? "bg-gray-100" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                  <UnreadMessagesBadge />
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="nav-link block px-3 py-2 rounded-md text-base font-medium text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${isActive("/") ? "bg-gray-100" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/login"
                  className={`nav-link block px-3 py-2 rounded-md text-base font-medium ${isActive("/login") ? "bg-gray-100" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`btn btn-primary btn-sm block px-3 py-2 rounded-md text-base font-medium text-center ${isActive("/register") ? "ring-2 ring-wurkzi-300" : ""
                    }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile-friendly user info bar (only when authenticated) */}
      {isAuthenticated && (
        <div className="sm:hidden bg-gray-50 border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Welcome back!</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRoleColor()}`}
              >
                {getUserRole()}
              </span>
            </div>
            <div className="text-gray-500 text-xs">{user?.email}</div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
