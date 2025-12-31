import { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';

const ResourcesTabForm = ({ agent, onUpdate }) => {
  const [formData, setFormData] = useState({
    resourcesContent: {
      vendorResources: {
        title: 'Vendor resources',
        links: [],
      },
      videos: [],
    },
  });
  const [linkInput, setLinkInput] = useState({ title: '', url: '' });
  const [videoInput, setVideoInput] = useState({ title: '', url: '', thumbnail: '' });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDisplayTab, setActiveDisplayTab] = useState('links');

  useEffect(() => {
    if (agent) {
      setFormData({
        resourcesContent: agent.resourcesContent || {
          vendorResources: {
            title: 'Vendor resources',
            links: [],
          },
          videos: [],
        },
      });
    }
  }, [agent]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      resourcesContent: {
        ...prev.resourcesContent,
        [field]: value,
      },
    }));
  };

  const addLink = () => {
    if (linkInput.title.trim() && linkInput.url.trim()) {
      const newLinks = [...(formData.resourcesContent.vendorResources?.links || []), {
        title: linkInput.title.trim(),
        url: linkInput.url.trim(),
      }];
      handleInputChange('vendorResources', {
        ...formData.resourcesContent.vendorResources,
        links: newLinks,
      });
      setLinkInput({ title: '', url: '' });
    }
  };

  const removeLink = (index) => {
    const newLinks = formData.resourcesContent.vendorResources.links.filter((_, i) => i !== index);
    handleInputChange('vendorResources', {
      ...formData.resourcesContent.vendorResources,
      links: newLinks,
    });
  };

  const addVideo = () => {
    if (videoInput.title.trim() && videoInput.url.trim()) {
      const newVideos = [...(formData.resourcesContent.videos || []), {
        title: videoInput.title.trim(),
        url: videoInput.url.trim(),
        thumbnail: videoInput.thumbnail.trim() || '',
      }];
      handleInputChange('videos', newVideos);
      setVideoInput({ title: '', url: '', thumbnail: '' });
    }
  };

  const removeVideo = (index) => {
    const newVideos = formData.resourcesContent.videos.filter((_, i) => i !== index);
    handleInputChange('videos', newVideos);
  };

  // Check if resources content has any data
  const hasResourcesData = () => {
    if (!agent?.resourcesContent) return false;
    const rc = agent.resourcesContent;
    return (
      (rc.vendorResources?.links && rc.vendorResources.links.length > 0) ||
      (rc.videos && rc.videos.length > 0)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAIAgent(agent.id, { resourcesContent: formData.resourcesContent });
      toast.success('Resources updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating resources:', error);
      toast.error(error.response?.data?.error || 'Failed to update resources');
    } finally {
      setLoading(false);
    }
  };

  // Extract YouTube/Vimeo video ID from URL
  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  // Display View (Read-only)
  if (!isEditing && agent) {
    const resourcesContent = agent.resourcesContent || {};
    const vendorResources = resourcesContent.vendorResources || {};
    const links = vendorResources.links || [];
    const videos = resourcesContent.videos || [];

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Resources</h2>
          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </Button>
        </div>

        <div className="border rounded" style={{ backgroundColor: 'white', overflow: 'hidden' }}>
          {/* Card Title */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #D5D9D9' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              {vendorResources.title || 'Vendor resources'}
            </h3>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #D5D9D9', padding: '0 24px' }}>
            <button
              onClick={() => setActiveDisplayTab('links')}
              style={{
                padding: '12px 0',
                marginRight: '24px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeDisplayTab === 'links' ? '3px solid #007185' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeDisplayTab === 'links' ? '600' : '400',
                color: activeDisplayTab === 'links' ? '#007185' : '#16191f',
                transition: 'all 0.2s',
              }}
            >
              Links
            </button>
            <span
              style={{
                borderLeft: '1px solid #D5D9D9',
                height: '40px',
                alignSelf: 'center',
              }}
            ></span>
            <button
              onClick={() => setActiveDisplayTab('videos')}
              style={{
                padding: '12px 0',
                marginLeft: '24px',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeDisplayTab === 'videos' ? '3px solid #007185' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeDisplayTab === 'videos' ? '600' : '400',
                color: activeDisplayTab === 'videos' ? '#007185' : '#16191f',
                transition: 'all 0.2s',
              }}
            >
              Videos
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '24px' }}>
            {activeDisplayTab === 'links' ? (
              links.length > 0 ? (
                links.map((link, index) => (
                  <div key={index} style={{ marginBottom: index < links.length - 1 ? '16px' : '0' }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '14px',
                        color: '#007185',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
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
                      {link.title}
                      <span style={{ fontSize: '12px' }}>🔗</span>
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">No resources available at this time.</p>
              )
            ) : (
              videos.length > 0 ? (
                <Row>
                  {videos.map((video, index) => (
                    <Col md={6} key={index} className="mb-3">
                      <div className="border rounded p-3">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '200px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '10px',
                            }}
                          >
                            <IconifyIcon icon="bx:play-circle" className="fs-48 text-muted" />
                          </div>
                        )}
                        <h5 style={{ fontSize: '16px', marginBottom: '8px' }}>{video.title}</h5>
                        {video.url && (
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '14px',
                              color: '#007185',
                              textDecoration: 'none',
                            }}
                          >
                            Watch Video →
                          </a>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-muted mb-0">No resources available at this time.</p>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit Form View
  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Resources</h2>
        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>

      <Row>
        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Vendor Resources</h4>
            
            <div className="mb-3">
              <label className="form-label">Section Title</label>
              <input
                type="text"
                className="form-control"
                value={formData.resourcesContent.vendorResources?.title || 'Vendor resources'}
                onChange={(e) => handleInputChange('vendorResources', {
                  ...formData.resourcesContent.vendorResources,
                  title: e.target.value,
                })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Add Resource Link</label>
              <Row>
                <Col md={5}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Link Title"
                    value={linkInput.title}
                    onChange={(e) => setLinkInput({ ...linkInput, title: e.target.value })}
                  />
                </Col>
                <Col md={5}>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com"
                    value={linkInput.url}
                    onChange={(e) => setLinkInput({ ...linkInput, url: e.target.value })}
                  />
                </Col>
                <Col md={2}>
                  <Button type="button" variant="primary" onClick={addLink} className="w-100">
                    <IconifyIcon icon="bx:plus" />
                  </Button>
                </Col>
              </Row>
            </div>

            <div className="border rounded p-3" style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}>
              {formData.resourcesContent.vendorResources?.links?.length === 0 ? (
                <p className="text-muted mb-0">No links added</p>
              ) : (
                formData.resourcesContent.vendorResources.links.map((link, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <div>
                      <strong>{link.title}</strong>
                      <br />
                      <small className="text-muted">{link.url}</small>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>

        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Videos</h4>
            
            <div className="mb-3">
              <label className="form-label">Add Video</label>
              <Row className="mb-2">
                <Col md={4}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Video Title"
                    value={videoInput.title}
                    onChange={(e) => setVideoInput({ ...videoInput, title: e.target.value })}
                  />
                </Col>
                <Col md={4}>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Video URL (YouTube/Vimeo)"
                    value={videoInput.url}
                    onChange={(e) => setVideoInput({ ...videoInput, url: e.target.value })}
                  />
                </Col>
                <Col md={3}>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Thumbnail URL (optional)"
                    value={videoInput.thumbnail}
                    onChange={(e) => setVideoInput({ ...videoInput, thumbnail: e.target.value })}
                  />
                </Col>
                <Col md={1}>
                  <Button type="button" variant="primary" onClick={addVideo} className="w-100">
                    <IconifyIcon icon="bx:plus" />
                  </Button>
                </Col>
              </Row>
            </div>

            <div className="border rounded p-3" style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}>
              {formData.resourcesContent.videos?.length === 0 ? (
                <p className="text-muted mb-0">No videos added</p>
              ) : (
                formData.resourcesContent.videos.map((video, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <div>
                      <strong>{video.title}</strong>
                      <br />
                      <small className="text-muted">{video.url}</small>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeVideo(index)}
                    >
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" variant="success" disabled={loading}>
          {loading ? 'Saving...' : 'Save Resources'}
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </Button>
      </div>
    </form>
  );
};

export default ResourcesTabForm;

