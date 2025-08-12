import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    jobs: 0,
    payments: 0,
    earnings: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        jobs: 12,
        payments: 8,
        earnings: 2450,
      });
    }, 500);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.jobs}</p>
          <div className="mt-2 flex items-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">+3 this week</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Payments Processed
          </h3>
          <p className="text-3xl font-bold text-gray-800">{stats.payments}</p>
          <div className="mt-2 flex items-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">+2 this week</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50">
          <h3 className="text-gray-500 text-sm font-medium mb-1">
            Total Earnings
          </h3>
          <p className="text-3xl font-bold text-gray-800">
            ${stats.earnings.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">+$420 this week</span>
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Jobs</h2>
          <button className="text-primary hover:text-secondary text-sm font-medium flex items-center transition-colors">
            View all
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((job) => (
            <div
              key={job}
              className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors last:border-b-0"
            >
              <div>
                <h3 className="font-medium text-gray-800">
                  Website Redesign Project
                </h3>
                <p className="text-gray-500 text-sm">Posted 2 days ago</p>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  In Progress
                </span>
                <span className="ml-4 font-medium text-gray-800">$1,200</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-blue-50 transition-all">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">New Job</span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-blue-50 transition-all">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Request Payment</span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-blue-50 transition-all">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Reports</span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-blue-50 transition-all">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
