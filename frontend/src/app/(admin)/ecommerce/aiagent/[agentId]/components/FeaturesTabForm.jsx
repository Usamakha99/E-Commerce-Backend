import { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';

const FeaturesTabForm = ({ agent, onUpdate }) => {
  const [formData, setFormData] = useState({
    featuresContent: {
      trustCenter: {
        title: 'Trust Center',
        description: '',
        buttonText: 'View Trust Center →',
        buttonLink: '',
      },
      buyerGuide: {
        title: 'Buyer Guide',
        description: '',
        buttonText: 'Get the Buyer Guide →',
        buttonLink: '',
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        featuresContent: agent.featuresContent || {
          trustCenter: {
            title: 'Trust Center',
            description: '',
            buttonText: 'View Trust Center →',
            buttonLink: '',
          },
          buyerGuide: {
            title: 'Buyer Guide',
            description: '',
            buttonText: 'Get the Buyer Guide →',
            buttonLink: '',
          },
        },
      });
    }
  }, [agent]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      featuresContent: {
        ...prev.featuresContent,
        [section]: {
          ...prev.featuresContent[section],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAIAgent(agent.id, { featuresContent: formData.featuresContent });
      toast.success('Features updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating features:', error);
      toast.error(error.response?.data?.error || 'Failed to update features');
    } finally {
      setLoading(false);
    }
  };

  // Check if features content has any data
  const hasFeaturesData = () => {
    if (!agent?.featuresContent) return false;
    const fc = agent.featuresContent;
    return (
      (fc.trustCenter?.description && fc.trustCenter.description.trim()) ||
      (fc.buyerGuide?.description && fc.buyerGuide.description.trim())
    );
  };

  // Display View (Read-only)
  if (!isEditing && agent) {
    const featuresContent = agent.featuresContent || {};
    const trustCenter = featuresContent.trustCenter || {};
    const buyerGuide = featuresContent.buyerGuide || {};

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">⚡ Features and Programs</h2>
          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </Button>
        </div>

        {!hasFeaturesData() ? (
          <div className="text-center py-5">
            <p className="text-muted mb-0">No features and programs available at this time.</p>
          </div>
        ) : (
          <Row>
            {/* Trust Center Card */}
            {trustCenter.description && trustCenter.description.trim() && (
              <Col lg={6} className="mb-4">
                <div
                  className="border rounded p-4"
                  style={{ height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}
                >
                  <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                    {trustCenter.title || 'Trust Center'}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      flex: 1,
                    }}
                  >
                    {trustCenter.description}
                  </p>
                  {trustCenter.buttonLink && (
                    <Button
                      variant="primary"
                      href={trustCenter.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {trustCenter.buttonText || 'View Trust Center →'}
                    </Button>
                  )}
                </div>
              </Col>
            )}

            {/* Buyer Guide Card */}
            {buyerGuide.description && buyerGuide.description.trim() && (
              <Col lg={6} className="mb-4">
                <div
                  className="border rounded p-4"
                  style={{ height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}
                >
                  <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                    {buyerGuide.title || 'Buyer Guide'}
                  </h3>
                  <p
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.7',
                      marginBottom: '20px',
                      flex: 1,
                    }}
                  >
                    {buyerGuide.description}
                  </p>
                  {buyerGuide.buttonLink && (
                    <Button
                      variant="outline-primary"
                      href={buyerGuide.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px 24px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        alignSelf: 'flex-start',
                      }}
                    >
                      {buyerGuide.buttonText || 'Get the Buyer Guide →'}
                    </Button>
                  )}
                </div>
              </Col>
            )}
          </Row>
        )}
      </div>
    );
  }

  // Edit Form View
  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">⚡ Features and Programs</h2>
        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>

      <Row>
        <Col lg={6} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Trust Center</h4>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.featuresContent.trustCenter.title}
                onChange={(e) => handleInputChange('trustCenter', 'title', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.featuresContent.trustCenter.description}
                onChange={(e) => handleInputChange('trustCenter', 'description', e.target.value)}
                placeholder="Access real-time vendor security and compliance information..."
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Text</label>
              <input
                type="text"
                className="form-control"
                value={formData.featuresContent.trustCenter.buttonText}
                onChange={(e) => handleInputChange('trustCenter', 'buttonText', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Link</label>
              <input
                type="url"
                className="form-control"
                value={formData.featuresContent.trustCenter.buttonLink}
                onChange={(e) => handleInputChange('trustCenter', 'buttonLink', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </Col>

        <Col lg={6} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Buyer Guide</h4>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.featuresContent.buyerGuide.title}
                onChange={(e) => handleInputChange('buyerGuide', 'title', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.featuresContent.buyerGuide.description}
                onChange={(e) => handleInputChange('buyerGuide', 'description', e.target.value)}
                placeholder="Gain valuable insights from real users..."
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Text</label>
              <input
                type="text"
                className="form-control"
                value={formData.featuresContent.buyerGuide.buttonText}
                onChange={(e) => handleInputChange('buyerGuide', 'buttonText', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Link</label>
              <input
                type="url"
                className="form-control"
                value={formData.featuresContent.buyerGuide.buttonLink}
                onChange={(e) => handleInputChange('buyerGuide', 'buttonLink', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" variant="success" disabled={loading}>
          {loading ? 'Saving...' : 'Save Features'}
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </Button>
      </div>
    </form>
  );
};

export default FeaturesTabForm;

