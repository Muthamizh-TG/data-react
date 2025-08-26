import React, { useState, useEffect, useRef } from 'react';

// Mock API configuration - replace with your actual config
const API_CONFIG = {
    VIEW_API: 'https://ybsmlyja21.execute-api.ap-south-1.amazonaws.com/project_synapse/PS_VIEW',
    UPDATE_API: 'https://hzz9hr3re8.execute-api.ap-south-1.amazonaws.com/project_synapes/PS_UPDATE'
};

function MapPicker({ business, onLocationChange }) {
    const mapRef = useRef(null);
    const searchRef = useRef(null);
    const markerRef = useRef(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current || !searchRef.current) return;

            const defaultLatLng = { lat: 10.817585900291174, lng: 78.68545440761824 };
            let latLng = defaultLatLng;

            if (business?.locationLink && business.locationLink.includes('?q=')) {
                const coords = business.locationLink.split('=')[1]?.split(',');
                if (coords && coords.length >= 2) {
                    latLng = { lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) };
                }
            }

            const map = new window.google.maps.Map(mapRef.current, {
                center: latLng,
                zoom: 12
            });

            const marker = new window.google.maps.Marker({
                position: latLng,
                map,
                draggable: true
            });

            markerRef.current = marker;

            // Initialize location
            onLocationChange(`https://maps.google.com/?q=${latLng.lat},${latLng.lng}`);

            // Places Autocomplete
            const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current);
            autocomplete.bindTo('bounds', map);
            autocomplete.setFields(['geometry', 'name']);
            autocompleteRef.current = autocomplete;

            autocomplete.addListener('place_changed', function () {
                const place = autocomplete.getPlace();
                if (!place.geometry) return;

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(15);
                }

                marker.setPosition(place.geometry.location);
                onLocationChange(`https://maps.google.com/?q=${place.geometry.location.lat()},${place.geometry.location.lng()}`);
            });

            // Map click
            map.addListener('click', function (e) {
                marker.setPosition(e.latLng);
                onLocationChange(`https://maps.google.com/?q=${e.latLng.lat()},${e.latLng.lng()}`);
            });

            // Marker drag
            marker.addListener('dragend', function () {
                const pos = marker.getPosition();
                onLocationChange(`https://maps.google.com/?q=${pos.lat()},${pos.lng()}`);
            });
        };

        // Load Google Maps script if not already loaded
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDBAKGwpzHfMUPKvye-YjOxer_XjWjjsjQ&libraries=places';
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.body.appendChild(script);
        } else {
            setTimeout(initMap, 100);
        }
    }, [business, onLocationChange]);

    return (
        <div>
            <input
                ref={searchRef}
                type="text"
                placeholder="Search for a place or address"
                style={{
                    backgroundColor: '#6c757d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '8px 12px',
                    width: '100%',
                    marginBottom: '8px'
                }}
            />
            <div
                ref={mapRef}
                style={{
                    height: '320px',
                    width: '100%',
                    border: '1px solid #333',
                    borderRadius: '0.375rem',
                    background: '#222'
                }}
            />
            <div style={{ color: '#b0b0b0', fontSize: '0.875rem', marginTop: '8px' }}>
                Click on the map or use the search box to select a location. The Google Maps link will be saved.
            </div>
        </div>
    );
}

function EditBusinessModal({ isOpen, onClose, business, onUpdate }) {
    const [formData, setFormData] = useState({
        businessName: '',
        address: '',
        phone: '',
        workingHours: '',
        specialization: '',
        whyVisit: '',
        locationLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (business) {
            setFormData({
                businessName: business.businessName || '',
                address: business.address || '',
                phone: business.phone || '',
                workingHours: business.workingHours || '',
                specialization: business.specialization || '',
                whyVisit: business.whyVisit || '',
                locationLink: business.locationLink || ''
            });
        }
    }, [business]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (locationLink) => {
        setFormData(prev => ({ ...prev, locationLink }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const updatedData = {
                _id: business.id || business._id,
                ...formData
            };

            const response = await fetch(API_CONFIG.UPDATE_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Update failed: ' + errorText);
            }

            await response.json();
            alert('Business updated successfully!');
            onUpdate();
            onClose();
        } catch (error) {
            alert('Error updating business: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputStyle = {
        backgroundColor: '#6c757d',
        color: '#ffffff',
        border: 'none',
        borderRadius: '0.375rem',
        padding: '8px 12px',
        width: '100%'
    };

    const labelStyle = {
        color: '#ffffff',
        marginBottom: '8px',
        display: 'block',
        fontSize: '0.875rem'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050
        }}>
            <div style={{
                backgroundColor: '#212529',
                color: '#ffffff',
                borderRadius: '0.5rem',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <div style={{
                    backgroundColor: '#181818',
                    padding: '16px 24px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h5 style={{ margin: 0 }}>Update Business</h5>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '24px',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{ padding: '24px' }}>
                    <div onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>Business Name</label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Pick Location on Map</label>
                            <MapPicker business={business} onLocationChange={handleLocationChange} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={labelStyle}>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Working Hours/Timing</label>
                                <input
                                    type="text"
                                    name="workingHours"
                                    value={formData.workingHours}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 9:00 AM - 6:00 PM"
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={labelStyle}>Specialization</label>
                            <textarea
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                rows="3"
                                required
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Why a customer should visit</label>
                            <textarea
                                name="whyVisit"
                                value={formData.whyVisit}
                                onChange={handleInputChange}
                                rows="3"
                                required
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{
                                    backgroundColor: '#0d6efd',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    padding: '8px 16px',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    opacity: isSubmitting ? 0.6 : 1
                                }}
                            >
                                {isSubmitting ? 'Updating...' : 'Update'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    backgroundColor: '#6c757d',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    padding: '8px 16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditBusinessPage() {
    const [businesses, setBusinesses] = useState([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingBusiness, setEditingBusiness] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(API_CONFIG.VIEW_API, { method: 'GET' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();
            if (!result || !Array.isArray(result.data)) {
                throw new Error("Invalid data format received from server");
            }

            setBusinesses(result.data);
            setFilteredBusinesses(result.data);
        } catch (error) {
            console.error("Error fetching businesses:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinesses();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        if (!term) {
            setFilteredBusinesses(businesses);
        } else {
            setFilteredBusinesses(businesses.filter(b => 
                (b.businessName && b.businessName.toLowerCase().includes(term)) ||
                (b.phone && b.phone.toLowerCase().includes(term)) ||
                (b.address && b.address.toLowerCase().includes(term))
            ));
        }
    }, [searchTerm, businesses]);

    const handleEdit = (business) => {
        setEditingBusiness(business);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBusiness(null);
    };

    const handleUpdate = () => {
        fetchBusinesses();
    };

    const escapeHtml = (text) => {
        if (typeof text !== "string") return text;
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Navigation */}
            <nav style={{
                backgroundColor: '#212529',
                padding: '16px 0',
                marginBottom: '32px'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Technology Garage</div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Add</a>
                        <a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 'bold' }}>Edit</a>
                        <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Admin</a>
                        <a href="#" style={{ color: '#ffffff', textDecoration: 'none' }}>Approved</a>
                    </div>
                </div>
            </nav>

            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>Edit Business</h2>

                {/* Search */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <input
                        type="text"
                        placeholder="Search by name, phone, or address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            width: '50%',
                            fontSize: '16px'
                        }}
                    />
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 2s linear infinite',
                            margin: '0 auto'
                        }}></div>
                        <p style={{ marginTop: '16px' }}>Loading approved businesses...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        backgroundColor: '#dc3545',
                        color: '#ffffff',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '24px'
                    }}>
                        <h5>Error loading data</h5>
                        <p>{error}</p>
                        <button
                            onClick={fetchBusinesses}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#ffffff',
                                border: '1px solid #ffffff',
                                borderRadius: '4px',
                                padding: '8px 16px',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Table */}
                {!loading && !error && filteredBusinesses.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            backgroundColor: '#212529',
                            color: '#ffffff',
                            borderCollapse: 'collapse'
                        }}>
                            <thead style={{ backgroundColor: '#343a40' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Business Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Phone</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Address</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Location</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Working Hours</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Specialization</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Why Visit</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #495057' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBusinesses.map((business, index) => (
                                    <tr key={business.id || business._id || index} style={{
                                        backgroundColor: index % 2 === 0 ? '#2c3034' : '#212529'
                                    }}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            <strong>{business.businessName || 'N/A'}</strong>
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            {business.phone || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            {business.address || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            {business.locationLink ? (
                                                <a 
                                                    href={business.locationLink} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#17a2b8',
                                                        textDecoration: 'none',
                                                        padding: '4px 8px',
                                                        border: '1px solid #17a2b8',
                                                        borderRadius: '4px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    View Map
                                                </a>
                                            ) : 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            {business.workingHours || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            {business.specialization || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            {business.whyVisit || 'N/A'}
                                        </td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #495057' }}>
                                            <button
                                                onClick={() => handleEdit(business)}
                                                style={{
                                                    backgroundColor: '#0d6efd',
                                                    color: '#ffffff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '4px 8px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ textAlign: 'center', marginTop: '16px', color: '#6c757d' }}>
                            <small>Total businesses: {filteredBusinesses.length}</small>
                        </div>
                    </div>
                )}

                {/* No data */}
                {!loading && !error && filteredBusinesses.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h5>No approved businesses found</h5>
                        <p style={{ color: '#6c757d' }}>There are currently no approved businesses to display.</p>
                    </div>
                )}
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

            {/* Edit Modal */}
            <EditBusinessModal
                isOpen={showModal}
                onClose={handleCloseModal}
                business={editingBusiness}
                onUpdate={handleUpdate}
            />

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    @media (max-width: 768px) {
                        table {
                            font-size: 14px;
                        }
                        th, td {
                            padding: 8px !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default EditBusinessPage;