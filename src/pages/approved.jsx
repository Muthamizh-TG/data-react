import React, { useState, useEffect } from 'react';

const ApprovedBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoData, setShowNoData] = useState(false);

  // Mock API configuration - replace with your actual API URL
  const VIEW_API_URL = 'https://ybsmlyja21.execute-api.ap-south-1.amazonaws.com/project_synapse/PS_VIEW';

  const fetchApproved = async () => {
    setLoading(true);
    setError(null);
    setShowNoData(false);
    
    try {
      const response = await fetch(VIEW_API_URL, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      // Only show approved businesses
      const approvedBusinesses = (result.data || []).filter(b => 
        b.approved === true || b.approved === "true"
      );

      if (approvedBusinesses.length > 0) {
        setBusinesses(approvedBusinesses);
      } else {
        setShowNoData(true);
      }
    } catch (error) {
      console.error("Error fetching approved businesses:", error);
      let msg = error.message;
      if (msg.includes('Failed to fetch')) {
        msg = `Unable to load data due to server restrictions (CORS).

What is CORS? Cross-Origin Resource Sharing (CORS) is a browser security feature that blocks web pages from making requests to a different domain than the one that served the web page.

How to fix?
• Contact the API provider or backend admin to enable CORS for your domain.
• If you are testing locally, use a browser extension like Moesif Origin & CORS Changer to bypass CORS (for development only).
• Check the browser console (F12 > Network tab) for more details.`;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex-shrink-0">
                <img className="h-8 w-auto" src="/api/placeholder/200/40" alt="Logo" />
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Add
                </a>
                <a href="/edit" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Edit
                </a>
                <a href="/admin" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </a>
                <a href="/approved" className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium">
                  Approved
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Approved Businesses</h2>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-400">Loading approved businesses...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-6">
            <h5 className="text-lg font-semibold mb-2">Error loading data</h5>
            <p className="text-red-200 whitespace-pre-line">{error}</p>
            <button 
              onClick={fetchApproved}
              className="mt-4 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded border border-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Data Message */}
        {showNoData && (
          <div className="text-center py-12">
            <h5 className="text-xl font-semibold mb-2">No approved businesses found</h5>
            <p className="text-gray-400">There are currently no approved businesses to display.</p>
          </div>
        )}

        {/* Table */}
        {businesses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Business Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Working Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Why Visit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {businesses.map((business, index) => (
                  <tr key={index} className="hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {business.businessName || business.name || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {business.phone || ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-200 max-w-xs">
                      <div className="truncate" title={business.address || ''}>
                        {business.address || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {business.locationLink ? (
                        <a 
                          href={business.locationLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Map
                        </a>
                      ) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {business.workingHours !== undefined ? business.workingHours : (business.workinghours || '')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-200 max-w-xs">
                      <div className="truncate" title={business.specialization || ''}>
                        {business.specialization || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-200 max-w-xs">
                      <div className="truncate" title={business.whyVisit !== undefined ? business.whyVisit : (business.whyvisit || '')}>
                        {business.whyVisit !== undefined ? business.whyVisit : (business.whyvisit || '')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-center text-gray-400">
              <small>Total approved businesses: {businesses.length}</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovedBusinesses;