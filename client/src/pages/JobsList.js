import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getJobs, getJobImages } from "../api/jobApi";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [jobImages, setJobImages] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
        
        // Fetch preview images for each job
        const imagePromises = data.map(async (job) => {
          try {
            const images = await getJobImages(job.id);
            return { jobId: job.id, images: images || [] };
          } catch (error) {
            console.error(`Failed to fetch images for job ${job.id}:`, error);
            return { jobId: job.id, images: [] };
          }
        });
        
        const imageResults = await Promise.all(imagePromises);
        const imageMap = {};
        imageResults.forEach(({ jobId, images }) => {
          imageMap[jobId] = images;
        });
        setJobImages(imageMap);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-workzzy-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                    <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-workzzy-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-workzzy-700 to-blue-700 bg-clip-text text-transparent mb-2">
            Available Jobs
          </h1>
          <p className="text-gray-600">
            Discover opportunities and apply for jobs that match your skills
          </p>
        </div>

        {jobs.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-semibold text-workzzy-700">{jobs.length}</span> 
                {jobs.length === 1 ? ' job' : ' jobs'} available
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Click on any job to view full details and apply
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => {
                const images = jobImages[job.id] || [];
                const previewImage = images.find(img => img.isPublic) || images[0];
                
                return (
                  <Link 
                    key={job.id} 
                    to={`/jobs/${job.id}`}
                    className="block group hover:scale-105 transition-transform duration-200"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden h-full">
                      {/* Image Preview */}
                      {previewImage ? (
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={previewImage.url}
                            alt={previewImage.caption || job.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-3 right-3">
                            <StatusBadge status={job.status} type="job" />
                          </div>
                          {images.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              +{images.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-workzzy-100 to-blue-100 flex items-center justify-center">
                          <div className="text-center">
                            <svg className="w-12 h-12 text-workzzy-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                            </svg>
                            <p className="text-sm text-workzzy-600">No images</p>
                          </div>
                          <div className="absolute top-3 right-3">
                            <StatusBadge status={job.status} type="job" />
                          </div>
                        </div>
                      )}
                      
                      {/* Fallback for failed image loads */}
                      <div className="hidden h-48 bg-gradient-to-br from-workzzy-100 to-blue-100 items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-workzzy-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-workzzy-600">Image unavailable</p>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-workzzy-700 transition-colors duration-200">
                          {job.title}
                        </h2>
                        
                        <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                          {job.initialDescription}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Apply now
                          </div>
                          
                          <div className="flex items-center text-workzzy-600 font-medium group-hover:text-workzzy-700">
                            View Details
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-workzzy-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-workzzy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Jobs Available
              </h3>
              <p className="text-gray-600 mb-6">
                There are currently no job postings available. Check back later for new opportunities!
              </p>
              {user?.user_metadata?.role === "HIRER" && (
                <Link 
                  to="/jobs/new"
                  className="inline-flex items-center btn btn-primary"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post Your First Job
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;
