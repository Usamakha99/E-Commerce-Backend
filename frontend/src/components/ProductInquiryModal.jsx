import React, { useState } from 'react';
import { createProductInquiry } from '@/http/ProductInquiry';
import toast from 'react-hot-toast';

const ProductInquiryModal = ({ isOpen, onClose, productName, productId }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    city: '',
    country: '',
    helpType: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const inquiryData = {
        ...formData,
        productId: productId || null,
        productName: productName || null,
      };

      await createProductInquiry(inquiryData);
      
      toast.success('Thank you for your inquiry! We will contact you soon.');
      
      // Reset form
      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        companyName: '',
        city: '',
        country: '',
        helpType: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(
        error.response?.data?.error || 
        'Failed to submit inquiry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '28px',
          width: '100%',
          maxWidth: '580px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f5f5f5',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            fontSize: '20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            opacity: loading ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = '#e0e0e0';
              e.target.style.color = '#333';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = '#f5f5f5';
              e.target.style.color = '#666';
            }
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          marginTop: 0,
          marginBottom: '20px',
          fontSize: '24px',
          fontWeight: '600',
          color: '#111A45',
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
          Product Inquiry
          {productName && (
            <span style={{
              fontSize: '16px',
              fontWeight: '400',
              color: '#666',
              display: 'block',
              marginTop: '4px'
            }}>
              {productName}
            </span>
          )}
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '14px',
            marginBottom: '14px'
          }}>
            {/* First Name and Last Name - One Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {/* First Name */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  First Name <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: loading ? '#f5f5f5' : '#fafafa',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#111A45';
                      e.target.style.backgroundColor = '#fff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = loading ? '#f5f5f5' : '#fafafa';
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  Last Name <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: loading ? '#f5f5f5' : '#fafafa',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#111A45';
                      e.target.style.backgroundColor = '#fff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = loading ? '#f5f5f5' : '#fafafa';
                  }}
                />
              </div>
            </div>

            {/* Username and Email - One Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {/* Username */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  Username <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: loading ? '#f5f5f5' : '#fafafa',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#111A45';
                      e.target.style.backgroundColor = '#fff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = loading ? '#f5f5f5' : '#fafafa';
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333',
                  fontFamily: 'Space Grotesk, sans-serif'
                }}>
                  Email <span style={{ color: '#ff4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Space Grotesk, sans-serif',
                    outline: 'none',
                    transition: 'all 0.2s',
                    backgroundColor: loading ? '#f5f5f5' : '#fafafa',
                    boxSizing: 'border-box',
                    cursor: loading ? 'not-allowed' : 'text'
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.target.style.borderColor = '#111A45';
                      e.target.style.backgroundColor = '#fff';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = loading ? '#f5f5f5' : '#fafafa';
                  }}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#333',
                fontFamily: 'Space Grotesk, sans-serif'
              }}>
                Country <span style={{ color: '#ff4444' }}>*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1.5px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  outline: 'none',
                  backgroundColor: loading ? '#f5f5f5' : '#fafafa',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  if (!loading) {
                    e.target.style.borderColor = '#111A45';
                    e.target.style.backgroundColor = '#fff';
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.backgroundColor = loading ? '#f5f5f5' : '#fafafa';
                }}
              >
                <option value="">Select Country</option>
                <option value="usa">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="canada">Canada</option>
                <option value="australia">Australia</option>
                <option value="pakistan">Pakistan</option>
                <option value="india">India</option>
                <option value="uae">UAE</option>
              </select>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid rgb(78, 78, 78)',
            margin: '18px 0'
          }}></div>

          {/* How can we help */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#333',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              How can we help? <span style={{ color: '#ff4444' }}>*</span>
            </label>
            <select
              name="helpType"
              value={formData.helpType}
              onChange={handleChange}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'Space Grotesk, sans-serif',
                outline: 'none',
                backgroundColor: loading ? '#f5f5f5' : '#fafafa',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!loading) {
                  e.target.style.borderColor = '#111A45';
                  e.target.style.backgroundColor = '#fff';
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.backgroundColor = loading ? '#f5f5f5' : '#fafafa';
              }}
            >
              <option value="">Please select...</option>
              <option value="pricing">Volume Pricing</option>
              <option value="shipping">Shipping Options</option>
              <option value="specs">Product Specifications</option>
              <option value="availability">Product Availability</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: 'white',
                border: '1.5px solid #111A45',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#111A45',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Space Grotesk, sans-serif',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#f5f5f5';
                  e.target.style.borderColor = '#1c1463';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#111A45';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: loading ? '#999' : '#df2020',
                border: 'none',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Space Grotesk, sans-serif',
                boxShadow: loading ? 'none' : '0 2px 8px rgba(223, 32, 32, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#c71b1b';
                  e.target.style.boxShadow = '0 4px 12px rgba(223, 32, 32, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#df2020';
                  e.target.style.boxShadow = '0 2px 8px rgba(223, 32, 32, 0.2)';
                }
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductInquiryModal;

