import { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';

const OverviewTabForm = ({ agent, onUpdate, isCreateMode, formData: parentFormData, onFormDataChange }) => {
  const [formData, setFormData] = useState({
    highlights: [],
    overview: '',
    shortDescription: '',
    description: '',
  });
  const [highlightInput, setHighlightInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isCreateMode && parentFormData) {
      setFormData({
        highlights: parentFormData.highlights || [],
        overview: parentFormData.overview || '',
        shortDescription: parentFormData.shortDescription || '',
        description: parentFormData.description || '',
      });
    } else if (agent) {
      setFormData({
        highlights: agent.highlights || [],
        overview: agent.overview || '',
        shortDescription: agent.shortDescription || '',
        description: agent.description || '',
      });
    }
  }, [agent, isCreateMode, parentFormData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // If in create mode, update parent formData
      if (isCreateMode && onFormDataChange) {
        onFormDataChange({ ...parentFormData, ...updated });
      }
      return updated;
    });
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      handleInputChange('highlights', [...formData.highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const removeHighlight = (index) => {
    const newHighlights = formData.highlights.filter((_, i) => i !== index);
    handleInputChange('highlights', newHighlights);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCreateMode) {
      // In create mode, just update parent formData, don't submit
      if (onFormDataChange) {
        onFormDataChange({ ...parentFormData, ...formData });
      }
      return;
    }
    try {
      setLoading(true);
      await updateAIAgent(agent.id, formData);
      toast.success('Overview updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating overview:', error);
      toast.error(error.response?.data?.error || 'Failed to update overview');
    } finally {
      setLoading(false);
    }
  };

  // Display View (Read-only)
  if (!isEditing && !isCreateMode && agent) {
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Overview</h2>
          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </Button>
        </div>

        <Row className="mb-4">
          {/* Key Highlights Card */}
          <Col lg={6} className="mb-3">
            <div className="border rounded p-4" style={{ height: '100%', backgroundColor: 'white' }}>
              <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                ✨ Key Highlights
              </h3>
              {agent.highlights && agent.highlights.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {agent.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: '15px',
                        lineHeight: '1.7',
                        marginBottom: '15px',
                        paddingLeft: '25px',
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '8px',
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#111A45',
                          borderRadius: '50%',
                        }}
                      ></span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">No highlights available.</p>
              )}
            </div>
          </Col>

          {/* Details Card */}
          <Col lg={6} className="mb-3">
            <div className="border rounded p-4" style={{ height: '100%', backgroundColor: 'white' }}>
              <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Sold by */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Sold by
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>
                    {agent.publisher?.name || agent.soldBy || 'Not specified'}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>Categories</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {agent.categories && agent.categories.length > 0 ? (
                      agent.categories.map((category, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '14px',
                            color: '#007185',
                            textDecoration: 'underline',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content',
                          }}
                        >
                          {category.name}
                          <span style={{ fontSize: '11px' }}>🔗</span>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '14px', borderBottom: '1px dotted', display: 'inline-block' }}>
                        Not specified
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery method */}
                <div>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>Delivery method</div>
                  <span
                    style={{
                      fontSize: '14px',
                      borderBottom: '1px dotted',
                      display: 'inline-block',
                    }}
                  >
                    {agent.deliveryMethod?.name || 'Not specified'}
                  </span>
                </div>

                {/* Deployed on AWS */}
                <div>
                  <div style={{ fontSize: '13px', marginBottom: '6px' }}>Deployed on AWS</div>
                  <span
                    style={{
                      fontSize: '14px',
                      borderBottom: '1px dotted',
                      display: 'inline-block',
                    }}
                  >
                    {agent.deployedOnAWS ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Description Section */}
        <Row>
          <Col lg={12}>
            <div className="border rounded p-4" style={{ backgroundColor: 'white' }}>
              <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                {agent.overview || agent.description || agent.shortDescription || (
                  <p className="text-muted mb-0">No description available.</p>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  // Edit Form View
  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Overview</h2>
        {!isCreateMode && (
          <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </div>

      <Row>
        <Col lg={12} className="mb-3">
          <label className="form-label">Short Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={formData.shortDescription}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            placeholder="Brief description for listing page"
          />
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-3">
          <label className="form-label">Full Description</label>
          <textarea
            className="form-control"
            rows="5"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Detailed description"
          />
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-3">
          <label className="form-label">Overview</label>
          <textarea
            className="form-control"
            rows="6"
            value={formData.overview}
            onChange={(e) => handleInputChange('overview', e.target.value)}
            placeholder="Comprehensive overview"
          />
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-3">
          <label className="form-label">Key Highlights</label>
          <div className="d-flex gap-2 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Add a highlight"
              value={highlightInput}
              onChange={(e) => setHighlightInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHighlight();
                }
              }}
            />
            <Button type="button" variant="primary" onClick={addHighlight}>
              <IconifyIcon icon="bx:plus" />
            </Button>
          </div>
          <div className="border rounded p-3" style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}>
            {formData.highlights.length === 0 ? (
              <p className="text-muted mb-0">No highlights added</p>
            ) : (
              formData.highlights.map((highlight, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                  <span>{highlight}</span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                  >
                    <IconifyIcon icon="bx:trash" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Col>
      </Row>

      {!isCreateMode && (
        <div className="d-flex justify-content-end mt-4">
          <Button type="submit" variant="success" disabled={loading}>
            {loading ? 'Saving...' : 'Save Overview'}
            <IconifyIcon icon="bxs:check-circle" className="ms-2" />
          </Button>
        </div>
      )}
    </form>
  );
};

export default OverviewTabForm;

