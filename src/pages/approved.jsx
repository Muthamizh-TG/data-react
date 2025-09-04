import React, { useState, useEffect } from 'react';

const ApprovedBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoData, setShowNoData] = useState(false);

  // const VIEW_API_URL = '/api/PS_VIEW';
  const VIEW_API_URL = 'https://ybsmlyja21.execute-api.ap-south-1.amazonaws.com/project_synapse/PS_VIEW'; // Use proxied path instead of direct URL  

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
• Contact the API provider or backend admin to enable CORS for your domain (http://localhost:5173 during development).
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
      {/* Inline CSS for this page */}
      <style>{`
        .approved-table-container {
          overflow-x: auto;
        }
        .approved-table {
          width: 100%;
          border-collapse: collapse;
          background: #222;
          color: #fff;
        }
        .approved-table th, .approved-table td {
          border: 1px solid #444;
          padding: 12px 8px;
          text-align: left;
        }
        .approved-table th {
          background: #333;
          font-weight: bold;
        }
        .approved-table tr:nth-child(even) {
          background: #282828;
        }
        .approved-table a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .approved-table a:hover {
          color: #93c5fd;
        }
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
          display: block;
        }
      `}</style>
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
          <div className="approved-table-container">
            <table className="approved-table">
              <thead>
                <tr>
                  <th>
                    Business Name
                  </th>
                  <th>
                    Phone
                  </th>
                  <th>
                    Address
                  </th>
                  <th>
                    Location
                  </th>
                  <th>
                    Working Hours
                  </th>
                  <th>
                    Specialization
                  </th>
                  <th>
                    Why Visit
                  </th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business, index) => (
                  <tr key={index}>
                    <td>
                      {business.businessName || business.name || ''}
                    </td>
                    <td>
                      {business.phone || ''}
                    </td>
                    <td className="max-w-xs">
                      <div className="truncate" title={business.address || ''}>
                        {business.address || ''}
                      </div>
                    </td>
                    <td>
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
                    <td>
                      {business.workingHours !== undefined ? business.workingHours : (business.workinghours || '')}
                    </td>
                    <td className="max-w-xs">
                      <div className="truncate" title={business.specialization || ''}>
                        {business.specialization || ''}
                      </div>
                    </td>
                    <td className="max-w-xs">
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