import { useState, useEffect } from 'react';
import { Col, Row, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';
import RichTextEditor from '@/components/form/RichTextEditor';
import RichTextHtml from '@/components/form/RichTextHtml';
import { highlightsHaveContent, isRichTextEmpty, normalizeHighlightsForEditor } from '@/utils/rich-text';

const OverviewTabForm = ({ agent, onUpdate, isCreateMode, formData: parentFormData, onFormDataChange }) => {
  const [formData, setFormData] = useState({
    highlights: '',
    overview: '',
    shortDescription: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isCreateMode && parentFormData) {
      setFormData({
        highlights: normalizeHighlightsForEditor(parentFormData.highlights),
        overview: parentFormData.overview || '',
        shortDescription: parentFormData.shortDescription || '',
      });
    } else if (agent) {
      setFormData({
        highlights: normalizeHighlightsForEditor(agent.highlights),
        overview: agent.overview || '',
        shortDescription: agent.shortDescription || '',
      });
    }
  }, [agent, isCreateMode, parentFormData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (isCreateMode && onFormDataChange) {
        onFormDataChange({
          ...parentFormData,
          ...updated,
          highlights: updated.highlights,
          description: null,
        });
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCreateMode) {
      if (onFormDataChange) {
        onFormDataChange({
          ...parentFormData,
          ...formData,
          description: null,
        });
      }
      return;
    }
    try {
      setLoading(true);
      await updateAIAgent(agent.id, { ...formData, description: null });
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
    const highlightsHtml = normalizeHighlightsForEditor(agent.highlights);

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
          <Col lg={6} className="mb-3">
            <div className="border rounded p-4" style={{ height: '100%', backgroundColor: 'white' }}>
              <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                ✨ Key Highlights
              </h3>
              {highlightsHaveContent(agent.highlights) ? (
                <div style={{ fontSize: '15px', lineHeight: 1.7 }}>
                  <RichTextHtml html={highlightsHtml} />
                </div>
              ) : (
                <p className="text-muted mb-0">No highlights available.</p>
              )}
            </div>
          </Col>

          <Col lg={6} className="mb-3">
            <div className="border rounded p-4" style={{ height: '100%', backgroundColor: 'white' }}>
              <h3 className="mb-3" style={{ fontSize: '18px', fontWeight: '600' }}>
                Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Sold by
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>
                    {agent.publisher?.name || agent.soldBy || 'Not specified'}
                  </div>
                </div>

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

        <Row>
          <Col lg={12}>
            <div className="border rounded p-4" style={{ backgroundColor: 'white' }}>
              <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                {(() => {
                  const body = agent.overview || agent.shortDescription || agent.description;
                  return body && !isRichTextEmpty(body) ? (
                    <RichTextHtml html={body} style={{ fontSize: '15px', lineHeight: 1.8 }} />
                  ) : (
                    <p className="text-muted mb-0">No description available.</p>
                  );
                })()}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

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
          <RichTextEditor
            value={formData.shortDescription}
            onChange={(v) => handleInputChange('shortDescription', v)}
            placeholder="Brief description for listing page"
            editorMinHeight={220}
          />
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-3">
          <label className="form-label">Overview</label>
          <RichTextEditor
            value={formData.overview}
            onChange={(v) => handleInputChange('overview', v)}
            placeholder="Comprehensive overview"
            editorMinHeight={310}
          />
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-3">
          <label className="form-label">Key Highlights</label>
          <RichTextEditor
            value={formData.highlights}
            onChange={(v) => handleInputChange('highlights', v)}
            placeholder="List key highlights — use bullet lists, bold, links, or images"
            editorMinHeight={310}
          />
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
