import React, { useEffect, useRef, useState } from 'react';

function MapPicker({ onLocationChange }) {
    const mapRef = useRef(null);
    const searchRef = useRef(null);
    const markerRef = useRef(null);
    const defaultLatLng = { lat: 10.817585900291174, lng: 78.68545440761824 };

    useEffect(() => {
        let scriptLoaded = false;
        let scriptTag = document.getElementById('google-maps-script');
        function initMapWhenReady() {
            if (window.google && window.google.maps && mapRef.current && searchRef.current) {
                if (mapRef.current._mapInitialized) return;
                mapRef.current._mapInitialized = true;
                const map = new window.google.maps.Map(mapRef.current, {
                    center: defaultLatLng,
                    zoom: 12
                });
                const marker = new window.google.maps.Marker({
                    position: defaultLatLng,
                    map,
                    draggable: true
                });
                markerRef.current = marker;
                if (onLocationChange) {
                    onLocationChange(`https://maps.google.com/?q=${defaultLatLng.lat},${defaultLatLng.lng}`);
                }
                const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current);
                autocomplete.bindTo('bounds', map);
                autocomplete.setFields(['geometry', 'name']);
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
                    if (onLocationChange) {
                        onLocationChange(`https://maps.google.com/?q=${place.geometry.location.lat()},${place.geometry.location.lng()}`);
                    }
                });
                map.addListener('click', function(e) {
                    marker.setPosition(e.latLng);
                    if (onLocationChange) {
                        onLocationChange(`https://maps.google.com/?q=${e.latLng.lat()},${e.latLng.lng()}`);
                    }
                });
                marker.addListener('dragend', function(e) {
                    const pos = marker.getPosition();
                    if (onLocationChange) {
                        onLocationChange(`https://maps.google.com/?q=${pos.lat()},${pos.lng()}`);
                    }
                });
            }
        }
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'google-maps-script';
            scriptTag.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDBAKGwpzHfMUPKvye-YjOxer_XjWjjsjQ&libraries=places';
            scriptTag.async = true;
            scriptTag.onload = () => {
                scriptLoaded = true;
                initMapWhenReady();
            };
            document.body.appendChild(scriptTag);
        } else if (window.google && window.google.maps) {
            initMapWhenReady();
        } else {
            scriptTag.onload = () => {
                scriptLoaded = true;
                initMapWhenReady();
            };
        }
        const interval = setInterval(() => {
            if (window.google && window.google.maps && mapRef.current && searchRef.current) {
                clearInterval(interval);
                initMapWhenReady();
            }
        }, 200);
        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div>
            <input 
                ref={searchRef} 
                className="form-control" 
                type="text" 
                placeholder="Search for a place or address"
                style={{
                    backgroundColor: '#f8f9fa',
                    color: '#000000',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    fontSize: '16px',
                    marginBottom: '8px'
                }}
            />
            <div 
                ref={mapRef} 
                className="map-container"
                style={{
                    height: '400px',
                    width: '100%',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    background: '#f8f9fa',
                    marginBottom: '8px'
                }}
            ></div>
            <div style={{
                color: '#6c757d',
                fontSize: '14px',
                fontStyle: 'italic'
            }}>
                Click on the map or use the search box to select a location. The Google Maps link will be saved.
            </div>
        </div>
    );
}

function AddBusiness() {
    const [formData, setFormData] = useState({
        businessName: '',
        address: '',
        phone: '',
        workingHours: '',
        specialization: '',
        whyVisit: ''
    });
    const [locationLink, setLocationLink] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLocationChange = (link) => {
        setLocationLink(link);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        const data = {
            ...formData,
            locationLink
        };

        try {
            const API_ENDPOINT = 'https://mxfqlwa1ek.execute-api.ap-south-1.amazonaws.com/project_synapse/PS_INSERT';
            
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to register business');
            }

            const result = await response.json();
            setSuccessMessage('Your business has been registered successfully.');
            setTimeout(() => setSuccessMessage(''), 5000);
            
            setFormData({
                businessName: '',
                address: '',
                phone: '',
                workingHours: '',
                specialization: '',
                whyVisit: ''
            });
            setLocationLink('');
            
        } catch (error) {
            console.error('Submission error:', error);
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
            setTimeout(() => setErrorMessage(''), 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputStyle = {
        backgroundColor: '#f8f9fa',
        color: '#000000',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '12px 16px',
        width: '100%',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        marginBottom: '24px'
    };

    const labelStyle = {
        color: '#000000',
        marginBottom: '8px',
        display: 'block',
        fontWeight: '600',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000000',
            color: '#ffffff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
            lineHeight: '1.6'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 20px'
            }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    borderRadius: '12px',
                    padding: '40px',
                    marginBottom: '30px',
                    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.1)',
                    border: '1px solid #e0e0e0'
                }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '30px',
                        color: '#000000'
                    }}>
                        Business Registration Form
                    </h2>
                    
                    {successMessage && (
                        <div style={{
                            backgroundColor: '#000000',
                            color: '#ffffff',
                            padding: '16px 20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            border: '2px solid #333333'
                        }}>
                            <strong>Success!</strong> {successMessage}
                        </div>
                    )}
                    
                    {errorMessage && (
                        <div style={{
                            backgroundColor: '#ffffff',
                            color: '#000000',
                            padding: '16px 20px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            border: '2px solid #dc3545'
                        }}>
                            <strong>Error!</strong> {errorMessage}
                        </div>
                    )}

                    <div onSubmit={handleSubmit}>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
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

                            <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
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

                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Pick Location on Map</label>
                            <MapPicker onLocationChange={handleLocationChange} />
                        </div>

                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
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

                            <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                                <label style={labelStyle}>Working Hours</label>
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

                        <div style={{ marginBottom: '24px' }}>
                            <label style={labelStyle}>Specialization</label>
                            <textarea
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                rows="4"
                                required
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '120px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={labelStyle}>Why Visit Us</label>
                            <textarea
                                name="whyVisit"
                                value={formData.whyVisit}
                                onChange={handleInputChange}
                                rows="4"
                                required
                                style={{
                                    ...inputStyle,
                                    resize: 'vertical',
                                    minHeight: '120px'
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            style={{
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                border: '2px solid #000000',
                                borderRadius: '8px',
                                padding: '14px 32px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                opacity: isSubmitting ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isSubmitting && (
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid transparent',
                                    borderTop: '2px solid currentColor',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            )}
                            <span>{isSubmitting ? 'Submitting...' : 'Submit Registration'}</span>
                        </button>
                    </div>
                </div>

                <footer style={{
                    color: '#cccccc',
                    textAlign: 'center',
                    padding: '30px 0',
                    fontSize: '14px',
                    borderTop: '1px solid #333333',
                    marginTop: '40px'
                }}>
                    &copy; 2025 <span style={{ color: '#ffffff', fontWeight: '600' }}>Technology Garage</span>. All rights reserved.
                </footer>
            </div>

            <style>
                {`
                    @keyframes spin {
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}
            </style>
        </div>
    );
}

export default AddBusiness;