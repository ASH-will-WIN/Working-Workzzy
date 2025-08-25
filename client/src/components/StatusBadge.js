import React from 'react';

const StatusBadge = ({ status, type = 'job' }) => {
  const getStatusStyles = () => {
    if (type === 'application') {
      const applicationStyles = {
        APPLIED: "bg-blue-100 text-blue-800 border-blue-200",
        ACCEPTED: "bg-green-100 text-green-800 border-green-200",
        REJECTED: "bg-red-100 text-red-800 border-red-200",
        WITHDRAWN: "bg-gray-100 text-gray-800 border-gray-200",
      };
      return applicationStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";
    }

    // Job status styles
    const jobStyles = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      COMMITTED: "bg-blue-100 text-blue-800 border-blue-200",
      IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
    };
    return jobStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;