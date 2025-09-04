import React, { useState, useEffect } from 'react';

// Detect environment and set API endpoints
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_CONFIG = {
    VIEW_API: isLocal
        ? '/api/PS_VIEW'
        : 'https://ybsmlyja21.execute-api.ap-south-1.amazonaws.com/project_synapse/PS_VIEW', // Replace with your Lambda API Gateway URL
    APPROVAL_API: isLocal
        ? '/api/PS_Validation'
        : 'https://0wmmfash48.execute-api.ap-south-1.amazonaws.com/project_synapse/PS_Validation' // Replace with your Lambda API Gateway URL
};

function AdminReviewPage() {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [processingId, setProcessingId] = useState(null);

    const fetchAllForAdmin = async () => {
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(API_CONFIG.VIEW_API, { 
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            let result, data;
            try {
                result = JSON.parse(text);
                data = result.data || [];
                setBusinesses(data);
                setMessage({ 
                    text: 'Successfully fetched all data.', 
                    type: 'success' 
                });
            } catch (jsonError) {
                console.error('Response was not valid JSON:', text);
                throw new Error('Invalid JSON response. See console for details.');
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setMessage({ 
                text: `Error: ${error.message}`, 
                type: 'danger' 
            });
            setBusinesses([]);
        } finally {
            setLoading(false);
        }
    };

    const adminApprove = async (documentId, approve) => {
        setProcessingId(documentId);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch(API_CONFIG.APPROVAL_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    documentId: documentId,
                    approved: approve ? "true" : "false"
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }

            await response.json();
            
            setMessage({ 
                text: approve ? 'Business approved successfully!' : 'Business rejected successfully!', 
                type: 'success' 
            });

            // Refresh data after 1 second
            setTimeout(() => {
                fetchAllForAdmin();
            }, 1000);

        } catch (error) {
            console.error('Error updating approval status:', error);
            setMessage({ 
                text: 'Error updating approval status: ' + error.message, 
                type: 'danger' 
            });
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => {
        fetchAllForAdmin();
    }, []);

    const getStatusBadge = (approved) => {
        if (approved === true || approved === "true") {
            return <span style={{ color: '#28a745', fontWeight: 'bold' }}>Yes</span>;
        }
        return <span style={{ color: '#dc3545', fontWeight: 'bold' }}>No</span>;
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                <h2 style={{ 
                    textAlign: 'center', 
                    marginBottom: '32px',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                }}>
                    Admin Review
                </h2>

                {/* Message Display */}
                {message.text && (
                    <div style={{
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '24px'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Loading Spinner */}
                {loading && (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px'
                    }}>
                        <div style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #007bff',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }}></div>
                        <div style={{ marginTop: '16px' }}>Processing...</div>
                    </div>
                )}

                {/* Table */}
                <div style={{ 
                    overflowX: 'auto',
                    backgroundColor: '#212529',
                    borderRadius: '8px',
                    border: '1px solid #495057'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <thead style={{ backgroundColor: '#343a40' }}>
                            <tr>
                                <th style={headerStyle}>Business Name</th>
                                <th style={headerStyle}>Phone</th>
                                <th style={headerStyle}>Address</th>
                                <th style={headerStyle}>Location</th>
                                <th style={headerStyle}>Working Hours</th>
                                <th style={headerStyle}>Specialization</th>
                                <th style={headerStyle}>Why Visit</th>
                                <th style={headerStyle}>Approved</th>
                                <th style={headerStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {businesses.length === 0 ? (
                                <tr>
                                    <td 
                                        colSpan="9" 
                                        style={{
                                            ...cellStyle,
                                            textAlign: 'center',
                                            color: '#6c757d',
                                            padding: '40px'
                                        }}
                                    >
                                        {loading ? 'Loading...' : 'No results found'}
                                    </td>
                                </tr>
                            ) : (
                                businesses.map((business, index) => (
                                    <tr key={business._id || business.id || index} style={{
                                        backgroundColor: index % 2 === 0 ? '#2c3034' : '#212529'
                                    }}>
                                        <td style={cellStyle}>
                                            <strong>{business.businessName || business.name || 'N/A'}</strong>
                                        </td>
                                        <td style={cellStyle}>
                                            {business.phone || 'N/A'}
                                        </td>
                                        <td style={cellStyle}>
                                            {business.address || 'N/A'}
                                        </td>
                                        <td style={cellStyle}>
                                            {business.locationLink ? (
                                                <a 
                                                    href={business.locationLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#007bff',
                                                        textDecoration: 'none'
                                                    }}
                                                >
                                                    Map
                                                </a>
                                            ) : 'N/A'}
                                        </td>
                                        <td style={cellStyle}>
                                            {business.workingHours !== undefined ? business.workingHours : (business.workinghours || 'N/A')}
                                        </td>
                                        <td style={cellStyle}>
                                            {business.specialization || 'N/A'}
                                        </td>
                                        <td style={cellStyle}>
                                            {business.whyVisit !== undefined ? business.whyVisit : (business.whyvisit || 'N/A')}
                                        </td>
                                        <td style={cellStyle}>
                                            {getStatusBadge(business.approved)}
                                        </td>
                                        <td style={cellStyle}>
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                <button
                                                    onClick={() => adminApprove(business._id || business.id, true)}
                                                    disabled={processingId === (business._id || business.id)}
                                                    style={{
                                                        backgroundColor: '#28a745',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        cursor: processingId === (business._id || business.id) ? 'not-allowed' : 'pointer',
                                                        opacity: processingId === (business._id || business.id) ? 0.6 : 1,
                                                        minWidth: '60px'
                                                    }}
                                                >
                                                    {processingId === (business._id || business.id) ? '...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => adminApprove(business._id || business.id, false)}
                                                    disabled={processingId === (business._id || business.id)}
                                                    style={{
                                                        backgroundColor: '#dc3545',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        cursor: processingId === (business._id || business.id) ? 'not-allowed' : 'pointer',
                                                        opacity: processingId === (business._id || business.id) ? 0.6 : 1,
                                                        minWidth: '60px'
                                                    }}
                                                >
                                                    {processingId === (business._id || business.id) ? '...' : 'Reject'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid #333',
                backgroundColor: '#ffffff',
                color: '#1d1d1d',
                textAlign: 'center',
                padding: '20px 0',
                marginTop: '40px'
            }}>
                &copy; Copyright - 2025 <span style={{ textDecoration: 'underline' }}>Technology Garage</span>
            </footer>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @media (max-width: 768px) {
                        table {
                            font-size: 12px;
                        }
                    }
                    
                    @media (max-width: 576px) {
                        table {
                            font-size: 10px;
                        }
                        
                        th, td {
                            padding: 6px 4px !important;
                        }
                        
                        button {
                            padding: 2px 4px !important;
                            font-size: 10px !important;
                            min-width: 50px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

// Shared styles
const headerStyle = {
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '2px solid #495057',
    fontWeight: 'bold',
    fontSize: '13px',
    color: '#ffffff'
};

const cellStyle = {
    padding: '8px',
    borderBottom: '1px solid #495057',
    verticalAlign: 'middle',
    maxWidth: '150px',
    wordWrap: 'break-word',
    fontSize: '13px'
};

export default AdminReviewPage;