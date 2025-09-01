import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content is now full width without the local header */}

      <main className="flex-grow">
        {/* Value Proposition */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                <span className="block">Find Your Perfect Work</span>
                <span className="block text-workzzy-600">
                  Match with Opportunities
                </span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
                Connect with employers and professionals to grow your career or
                business.
              </p>
              <div className="mt-10 flex justify-center space-x-4">
                <Link
                  to="/register"
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-workzzy-600 hover:bg-workzzy-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-workzzy-500"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-workzzy-500"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Trusted by Thousands
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                Real people, real success stories
              </p>
            </div>

            <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Freelance Developer",
                  content:
                    "Workzzy helped me find amazing opportunities and grow my freelance career by 300% in just 6 months.",
                  avatar: "SJ",
                },
                {
                  name: "Michael Chen",
                  role: "Small Business Owner",
                  content:
                    "I've hired 5 talented professionals through Workzzy for my growing business. The platform is intuitive and effective.",
                  avatar: "MC",
                },
                {
                  name: "Emily Rodriguez",
                  role: "HR Manager",
                  content:
                    "The best platform I've used for connecting with qualified candidates quickly. The matching system is spot on.",
                  avatar: "ER",
                },
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-workzzy-600 py-16 px-6 sm:py-24 rounded-lg shadow-lg sm:px-12 lg:px-16">
              <div className="relative flex flex-col items-center text-center">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Ready to start your journey?
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-white/90">
                  Join our community of professionals and employers today.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
                  <Link
                    to="/register"
                    className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-workzzy-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Company
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Resources
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Community
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Forums
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-base text-gray-600 hover:text-gray-900"
                  >
                    Events
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-500 text-center">
              &copy; 2025 Workzzy, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
