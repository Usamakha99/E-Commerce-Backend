import { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';
import RichTextEditor from '@/components/form/RichTextEditor';
import RichTextHtml from '@/components/form/RichTextHtml';
import { isRichTextEmpty } from '@/utils/rich-text';

const SupportTabForm = ({ agent, onUpdate }) => {
  const [formData, setFormData] = useState({
    supportContent: {
      vendorSupport: {
        title: 'Vendor support',
        description: '',
        email: '',
        website: '',
        buttonText: '',
        buttonLink: '',
      },
      awsSupport: {
        title: 'AWS infrastructure support',
        description: '',
        buttonText: 'Get support',
        buttonLink: '',
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        supportContent: agent.supportContent || {
          vendorSupport: {
            title: 'Vendor support',
            description: '',
            email: '',
            website: '',
            buttonText: '',
            buttonLink: '',
          },
          awsSupport: {
            title: 'AWS infrastructure support',
            description: '',
            buttonText: 'Get support',
            buttonLink: '',
          },
        },
      });
    }
  }, [agent]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      supportContent: {
        ...prev.supportContent,
        [section]: {
          ...prev.supportContent[section],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAIAgent(agent.id, { supportContent: formData.supportContent });
      toast.success('Support information updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating support:', error);
      toast.error(error.response?.data?.error || 'Failed to update support');
    } finally {
      setLoading(false);
    }
  };

  // Check if support content has any data
  const hasSupportData = () => {
    if (!agent?.supportContent) return false;
    const sc = agent.supportContent;
    return (
      (sc.vendorSupport?.description && !isRichTextEmpty(sc.vendorSupport.description)) ||
      (sc.vendorSupport?.email && sc.vendorSupport.email.trim()) ||
      (sc.vendorSupport?.website && sc.vendorSupport.website.trim()) ||
      (sc.awsSupport?.description && !isRichTextEmpty(sc.awsSupport.description))
    );
  };

  // Display View (Read-only)
  if (!isEditing && agent) {
    const supportContent = agent.supportContent || {};
    const vendorSupport = supportContent.vendorSupport || {};
    const awsSupport = supportContent.awsSupport || {};

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Support</h2>
          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </Button>
        </div>

        <Row>
          {/* Vendor Support Card - Always Show */}
          <Col lg={6} className="mb-4">
            <div
              className="border rounded p-4"
              style={{ height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}
            >
              <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                {vendorSupport.title || 'Vendor support'}
              </h3>
              
              {vendorSupport.description && !isRichTextEmpty(vendorSupport.description) ? (
                <>
                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '16px',
                      flex: 1,
                    }}
                  >
                    <RichTextHtml html={vendorSupport.description} />
                  </div>
                  
                  {/* Support Links */}
                  {(vendorSupport.website || vendorSupport.email) && (
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {vendorSupport.website && (
                        <p style={{ marginBottom: '12px' }}>
                          For additional information please visit{' '}
                          <a
                            href={vendorSupport.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#007185',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#C7511F';
                              e.target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#007185';
                              e.target.style.textDecoration = 'none';
                            }}
                          >
                            {vendorSupport.website}
                            <span style={{ fontSize: '12px' }}>🔗</span>
                          </a>.
                        </p>
                      )}
                      {vendorSupport.email && (
                        <p style={{ margin: 0 }}>
                          You can also email{' '}
                          <a
                            href={`mailto:${vendorSupport.email}`}
                            style={{
                              color: '#007185',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#C7511F';
                              e.target.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#007185';
                              e.target.style.textDecoration = 'none';
                            }}
                          >
                            {vendorSupport.email}
                            <span style={{ fontSize: '12px' }}>🔗</span>
                          </a>.
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">No support contact information available.</p>
              )}
            </div>
          </Col>

          {/* AWS Infrastructure Support Card - Always Show */}
          <Col lg={6} className="mb-4">
            <div
              className="border rounded p-4"
              style={{ height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}
            >
              <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                {awsSupport.title || 'AWS infrastructure support'}
              </h3>
              
              {awsSupport.description && !isRichTextEmpty(awsSupport.description) ? (
                <>
                  <div
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                      flex: 1,
                    }}
                  >
                    <RichTextHtml html={awsSupport.description} />
                  </div>
                  {awsSupport.buttonLink && (
                    <Button
                      variant="outline-primary"
                      href={awsSupport.buttonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 24px',
                        borderRadius: '25px',
                        fontSize: '14px',
                        fontWeight: '600',
                        alignSelf: 'flex-start',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {awsSupport.buttonText || 'Get support'}
                      <span style={{ fontSize: '12px' }}>🔗</span>
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">No AWS support information available.</p>
              )}
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
        <h2 className="mb-0">Support</h2>
        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>

      <Row>
        <Col lg={6} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Vendor Support</h4>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.supportContent.vendorSupport.title}
                onChange={(e) => handleInputChange('vendorSupport', 'title', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <RichTextEditor
                value={formData.supportContent.vendorSupport.description}
                onChange={(v) => handleInputChange('vendorSupport', 'description', v)}
                placeholder="Through our expert teams and robust digital resources..."
                editorMinHeight={270}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Support Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.supportContent.vendorSupport.email}
                onChange={(e) => handleInputChange('vendorSupport', 'email', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Support Website</label>
              <input
                type="url"
                className="form-control"
                value={formData.supportContent.vendorSupport.website}
                onChange={(e) => handleInputChange('vendorSupport', 'website', e.target.value)}
                placeholder="https://support.example.com"
              />
            </div>
          </div>
        </Col>

        <Col lg={6} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">AWS Infrastructure Support</h4>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.supportContent.awsSupport.title}
                onChange={(e) => handleInputChange('awsSupport', 'title', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <RichTextEditor
                value={formData.supportContent.awsSupport.description}
                onChange={(v) => handleInputChange('awsSupport', 'description', v)}
                placeholder="AWS Support is a one-on-one, fast-response support channel..."
                editorMinHeight={270}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Text</label>
              <input
                type="text"
                className="form-control"
                value={formData.supportContent.awsSupport.buttonText}
                onChange={(e) => handleInputChange('awsSupport', 'buttonText', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Link</label>
              <input
                type="url"
                className="form-control"
                value={formData.supportContent.awsSupport.buttonLink}
                onChange={(e) => handleInputChange('awsSupport', 'buttonLink', e.target.value)}
                placeholder="https://aws.amazon.com/support"
              />
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" variant="success" disabled={loading}>
          {loading ? 'Saving...' : 'Save Support'}
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </Button>
      </div>
    </form>
  );
};

export default SupportTabForm;

