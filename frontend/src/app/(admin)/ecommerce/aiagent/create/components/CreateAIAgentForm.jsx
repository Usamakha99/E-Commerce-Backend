import { useState, useEffect } from 'react';
import { Col, Row, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { createAIAgent, updateAIAgent, getCategoriesWithCounts, getDeliveryMethodsWithCounts, getPublishersWithCounts } from '@/http/AIAgent';
import RichTextEditor from '@/components/form/RichTextEditor';
import { normalizeHighlightsForEditor } from '@/utils/rich-text';

const CreateAIAgentForm = ({ isEditMode, initialData, agentId }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [deliveryMethods, setDeliveryMethods] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    provider: '',
    logo: '',
    shortDescription: '',
    overview: '',
    highlights: '',
    badges: [],
    videoThumbnail: '',
    rating: 0,
    awsReviews: 0,
    externalReviews: 0,
    freeTrial: false,
    deployedOnAWS: false,
    awsFreeTier: false,
    deliveryMethodId: '',
    publisherId: '',
    soldBy: '',
    categoryIds: [],
    isActive: true,
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
    resourcesContent: {
      vendorResources: {
        title: 'Vendor resources',
        links: [],
      },
    },
    supportContent: {
      vendorSupport: {
        title: 'Vendor support',
        description: '',
        email: '',
        website: '',
      },
      awsSupport: {
        title: 'AWS infrastructure support',
        description: '',
        buttonText: 'Get support',
        buttonLink: '',
      },
    },
    productComparisonContent: {
      updatedWeekly: true,
      comparisonData: [],
    },
    pricingContent: {
      freeTrial: {
        enabled: false,
        description: '',
        buttonText: 'Try for free',
      },
      pricing: {
        title: '',
        description: '',
      },
      refundPolicy: '',
      customPricing: {
        enabled: false,
        description: '',
        buttonText: 'Request private offer',
      },
    },
  });

  const [badgeInput, setBadgeInput] = useState('');
  const [resourceLinkInput, setResourceLinkInput] = useState({ title: '', url: '' });

  const steps = [
    { key: 'basic', label: 'Basic Info', icon: 'bx:info-circle' },
    { key: 'overview', label: 'Overview', icon: 'bx:file' },
    { key: 'features', label: 'Features', icon: 'bx:star' },
    { key: 'resources', label: 'Resources', icon: 'bx:folder' },
    { key: 'support', label: 'Support', icon: 'bx:support' },
    { key: 'product-comparison', label: 'Product Comparison', icon: 'bx:compare', badge: 'NEW' },
    { key: 'how-to-buy', label: 'How to Buy', icon: 'bx:cart' },
  ];

  useEffect(() => {
    fetchDropdownData();
    if (initialData) {
      const data = {
        name: initialData.name || '',
        slug: initialData.slug || '',
        provider: initialData.provider || '',
        logo: initialData.logo || '',
        shortDescription: initialData.shortDescription || '',
        overview: initialData.overview || '',
        highlights: normalizeHighlightsForEditor(initialData.highlights),
        badges: initialData.badges || [],
        videoThumbnail: initialData.videoThumbnail || '',
        rating: initialData.rating || 0,
        awsReviews: initialData.awsReviews || 0,
        externalReviews: initialData.externalReviews || 0,
        freeTrial: initialData.freeTrial || false,
        deployedOnAWS: initialData.deployedOnAWS || false,
        awsFreeTier: initialData.awsFreeTier || false,
        deliveryMethodId: initialData.deliveryMethodId || '',
        publisherId: initialData.publisherId || '',
        soldBy: initialData.soldBy || '',
        categoryIds: initialData.categories?.map(c => c.id) || [],
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        featuresContent: initialData.featuresContent || formData.featuresContent,
        resourcesContent: initialData.resourcesContent || formData.resourcesContent,
        supportContent: initialData.supportContent || formData.supportContent,
        productComparisonContent: initialData.productComparisonContent || formData.productComparisonContent,
        pricingContent: initialData.pricingContent || formData.pricingContent,
      };
      setFormData(data);
    }
  }, [initialData]);

  const fetchDropdownData = async () => {
    try {
      const [catsRes, delRes, pubRes] = await Promise.all([
        getCategoriesWithCounts(),
        getDeliveryMethodsWithCounts(),
        getPublishersWithCounts(),
      ]);
      setCategories(catsRes.data?.data || catsRes.data || []);
      setDeliveryMethods(delRes.data?.data || delRes.data || []);
      setPublishers(pubRes.data?.data || pubRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleDeepNestedInputChange = (section, subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value) => {
    handleInputChange('name', value);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleInputChange('slug', generateSlug(value));
    }
  };

  const addBadge = () => {
    if (badgeInput.trim()) {
      handleInputChange('badges', [...formData.badges, badgeInput.trim()]);
      setBadgeInput('');
    }
  };

  const removeBadge = (index) => {
    const newBadges = formData.badges.filter((_, i) => i !== index);
    handleInputChange('badges', newBadges);
  };

  const addResourceLink = () => {
    if (resourceLinkInput.title.trim() && resourceLinkInput.url.trim()) {
      const newLinks = [...(formData.resourcesContent.vendorResources?.links || []), {
        title: resourceLinkInput.title.trim(),
        url: resourceLinkInput.url.trim(),
      }];
      handleNestedInputChange('resourcesContent', 'vendorResources', {
        ...formData.resourcesContent.vendorResources,
        links: newLinks,
      });
      setResourceLinkInput({ title: '', url: '' });
    }
  };

  const removeResourceLink = (index) => {
    const newLinks = formData.resourcesContent.vendorResources.links.filter((_, i) => i !== index);
    handleNestedInputChange('resourcesContent', 'vendorResources', {
      ...formData.resourcesContent.vendorResources,
      links: newLinks,
    });
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 0 && !formData.name.trim()) {
      toast.error('Agent name is required');
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        description: null,
        categoryIds: formData.categoryIds.map(id => parseInt(id)),
        deliveryMethodId: formData.deliveryMethodId ? parseInt(formData.deliveryMethodId) : null,
        publisherId: formData.publisherId ? parseInt(formData.publisherId) : null,
      };

      if (isEditMode) {
        await updateAIAgent(agentId, submitData);
        toast.success('AI Agent updated successfully!');
      } else {
        await createAIAgent(submitData);
        toast.success('AI Agent created successfully!');
      }
      navigate('/ecommerce/aiagents');
    } catch (error) {
      console.error('Error saving AI agent:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} AI agent`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          {steps.map((step, index) => (
            <div key={step.key} className="d-flex align-items-center" style={{ flex: 1 }}>
              <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${
                    index <= currentStep ? 'bg-primary text-white' : 'bg-light text-muted'
                  }`}
                  style={{
                    width: '40px',
                    height: '40px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onClick={() => setCurrentStep(index)}
                >
                  <IconifyIcon icon={step.icon} className="fs-18" />
                </div>
                <small className="mt-2 text-center" style={{ fontSize: '11px' }}>
                  {step.label}
                  {step.badge && (
                    <Badge bg="danger" className="ms-1" style={{ fontSize: '8px' }}>
                      {step.badge}
                    </Badge>
                  )}
                </small>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-grow-1 mx-2 ${
                    index < currentStep ? 'border-top border-primary' : 'border-top border-light'
                  }`}
                  style={{ height: '2px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Basic Information */}
      {currentStep === 0 && (
        <div>
          <h4 className="mb-4">Basic Information</h4>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">
                  Agent Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Okta Platform"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Auto-generated from name"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Provider</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Okta, Inc"
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Sold By</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Okta, Inc"
                  value={formData.soldBy}
                  onChange={(e) => handleInputChange('soldBy', e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Logo URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="/path/to/logo.png"
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Video Thumbnail URL</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="/path/to/thumbnail.png"
                  value={formData.videoThumbnail}
                  onChange={(e) => handleInputChange('videoThumbnail', e.target.value)}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Categories</label>
                <Form.Select
                  multiple
                  value={formData.categoryIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    handleInputChange('categoryIds', selected);
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.count || 0})
                    </option>
                  ))}
                </Form.Select>
                <small className="form-text text-muted">Hold Ctrl/Cmd to select multiple</small>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Delivery Method</label>
                <Form.Select
                  value={formData.deliveryMethodId}
                  onChange={(e) => handleInputChange('deliveryMethodId', e.target.value)}
                >
                  <option value="">Select Delivery Method</option>
                  {deliveryMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name} ({method.count || 0})
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Publisher</label>
                <Form.Select
                  value={formData.publisherId}
                  onChange={(e) => handleInputChange('publisherId', e.target.value)}
                >
                  <option value="">Select Publisher</option>
                  {publishers.map((publisher) => (
                    <option key={publisher.id} value={publisher.id}>
                      {publisher.name} ({publisher.count || 0})
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Status</label>
                <br />
                <Form.Check
                  inline
                  type="radio"
                  label="Active"
                  name="isActive"
                  checked={formData.isActive === true}
                  onChange={() => handleInputChange('isActive', true)}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Inactive"
                  name="isActive"
                  checked={formData.isActive === false}
                  onChange={() => handleInputChange('isActive', false)}
                />
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Step 1: Overview */}
      {currentStep === 1 && (
        <div>
          <h4 className="mb-4">Overview</h4>
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
        </div>
      )}

      {/* Step 2: Features */}
      {currentStep === 2 && (
        <div>
          <h4 className="mb-4">Features</h4>
          <Row>
            <Col lg={6} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Trust Center</h5>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.featuresContent.trustCenter.title}
                    onChange={(e) => handleDeepNestedInputChange('featuresContent', 'trustCenter', 'title', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.featuresContent.trustCenter.description}
                    onChange={(v) => handleDeepNestedInputChange('featuresContent', 'trustCenter', 'description', v)}
                    placeholder="Access real-time vendor security..."
                    editorMinHeight={260}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.featuresContent.trustCenter.buttonText}
                    onChange={(e) => handleDeepNestedInputChange('featuresContent', 'trustCenter', 'buttonText', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Link</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.featuresContent.trustCenter.buttonLink}
                    onChange={(e) => handleDeepNestedInputChange('featuresContent', 'trustCenter', 'buttonLink', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </Col>

            <Col lg={6} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Buyer Guide</h5>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.featuresContent.buyerGuide.title}
                    onChange={(e) => handleDeepNestedInputChange('featuresContent', 'buyerGuide', 'title', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.featuresContent.buyerGuide.description}
                    onChange={(v) => handleDeepNestedInputChange('featuresContent', 'buyerGuide', 'description', v)}
                    placeholder="Gain valuable insights..."
                    editorMinHeight={260}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.featuresContent.buyerGuide.buttonText}
                    onChange={(e) => handleDeepNestedInputChange('featuresContent', 'buyerGuide', 'buttonText', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Link</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.featuresContent.buyerGuide.buttonLink}
                    onChange={(e) => handleDeepNestedInputChange('featuresContent', 'buyerGuide', 'buttonLink', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Step 3: Resources */}
      {currentStep === 3 && (
        <div>
          <h4 className="mb-4">Resources</h4>
          <Row>
            <Col lg={12} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Vendor Resources</h5>
                <div className="mb-3">
                  <label className="form-label">Section Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.resourcesContent.vendorResources?.title || 'Vendor resources'}
                    onChange={(e) => handleNestedInputChange('resourcesContent', 'vendorResources', {
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
                        value={resourceLinkInput.title}
                        onChange={(e) => setResourceLinkInput({ ...resourceLinkInput, title: e.target.value })}
                      />
                    </Col>
                    <Col md={5}>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com"
                        value={resourceLinkInput.url}
                        onChange={(e) => setResourceLinkInput({ ...resourceLinkInput, url: e.target.value })}
                      />
                    </Col>
                    <Col md={2}>
                      <Button type="button" variant="primary" onClick={addResourceLink} className="w-100">
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
                          onClick={() => removeResourceLink(index)}
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
        </div>
      )}

      {/* Step 4: Support */}
      {currentStep === 4 && (
        <div>
          <h4 className="mb-4">Support</h4>
          <Row>
            <Col lg={6} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Vendor Support</h5>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.supportContent.vendorSupport.title}
                    onChange={(e) => handleDeepNestedInputChange('supportContent', 'vendorSupport', 'title', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.supportContent.vendorSupport.description}
                    onChange={(v) => handleDeepNestedInputChange('supportContent', 'vendorSupport', 'description', v)}
                    placeholder="Through our expert teams..."
                    editorMinHeight={270}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Support Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.supportContent.vendorSupport.email}
                    onChange={(e) => handleDeepNestedInputChange('supportContent', 'vendorSupport', 'email', e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Support Website</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.supportContent.vendorSupport.website}
                    onChange={(e) => handleDeepNestedInputChange('supportContent', 'vendorSupport', 'website', e.target.value)}
                    placeholder="https://support.example.com"
                  />
                </div>
              </div>
            </Col>

            <Col lg={6} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">AWS Infrastructure Support</h5>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.supportContent.awsSupport.title}
                    onChange={(e) => handleDeepNestedInputChange('supportContent', 'awsSupport', 'title', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.supportContent.awsSupport.description}
                    onChange={(v) => handleDeepNestedInputChange('supportContent', 'awsSupport', 'description', v)}
                    placeholder="AWS Support is a one-on-one..."
                    editorMinHeight={270}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.supportContent.awsSupport.buttonText}
                    onChange={(e) => handleDeepNestedInputChange('supportContent', 'awsSupport', 'buttonText', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Link</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.supportContent.awsSupport.buttonLink}
                    onChange={(e) => handleDeepNestedInputChange('supportContent', 'awsSupport', 'buttonLink', e.target.value)}
                    placeholder="https://aws.amazon.com/support"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Step 5: Product Comparison */}
      {currentStep === 5 && (
        <div>
          <h4 className="mb-4">Product Comparison</h4>
          <Row>
            <Col lg={12} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Comparison Settings</h5>
                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Updated weekly"
                    checked={formData.productComparisonContent.updatedWeekly}
                    onChange={(e) => handleNestedInputChange('productComparisonContent', 'updatedWeekly', e.target.checked)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Comparison Data (JSON)</label>
                  <textarea
                    className="form-control"
                    rows="10"
                    value={JSON.stringify(formData.productComparisonContent.comparisonData, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleNestedInputChange('productComparisonContent', 'comparisonData', parsed);
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='[{"feature": "Functionality", "thisProduct": "Positive"}]'
                  />
                  <small className="text-muted">Enter comparison data as JSON array</small>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Step 6: How to Buy */}
      {currentStep === 6 && (
        <div>
          <h4 className="mb-4">How to Buy</h4>
          <Row>
            <Col lg={12} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Free Trial</h5>
                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enable Free Trial"
                    checked={formData.pricingContent.freeTrial.enabled}
                    onChange={(e) => handleDeepNestedInputChange('pricingContent', 'freeTrial', 'enabled', e.target.checked)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.pricingContent.freeTrial.description}
                    onChange={(v) => handleDeepNestedInputChange('pricingContent', 'freeTrial', 'description', v)}
                    placeholder="Try this product free according to the free trial terms..."
                    editorMinHeight={220}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pricingContent.freeTrial.buttonText}
                    onChange={(e) => handleDeepNestedInputChange('pricingContent', 'freeTrial', 'buttonText', e.target.value)}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={12} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Pricing Information</h5>
                <div className="mb-3">
                  <label className="form-label">Pricing Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pricingContent.pricing.title}
                    onChange={(e) => handleDeepNestedInputChange('pricingContent', 'pricing', 'title', e.target.value)}
                    placeholder={formData.name || 'Product Name'}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pricing Description</label>
                  <RichTextEditor
                    value={formData.pricingContent.pricing.description}
                    onChange={(v) => handleDeepNestedInputChange('pricingContent', 'pricing', 'description', v)}
                    placeholder="Pricing is based on the duration and terms of your contract..."
                    editorMinHeight={270}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={12} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Vendor Refund Policy</h5>
                <div className="mb-3">
                  <label className="form-label">Refund Policy Text</label>
                  <RichTextEditor
                    value={formData.pricingContent.refundPolicy}
                    onChange={(v) => handleNestedInputChange('pricingContent', 'refundPolicy', v)}
                    placeholder="All orders are non-cancellable and all fees..."
                    editorMinHeight={270}
                  />
                </div>
              </div>
            </Col>
          </Row>

          <Row>
            <Col lg={12} className="mb-4">
              <div className="border rounded p-4">
                <h5 className="mb-3">Custom Pricing Options</h5>
                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Enable Custom Pricing"
                    checked={formData.pricingContent.customPricing.enabled}
                    onChange={(e) => handleDeepNestedInputChange('pricingContent', 'customPricing', 'enabled', e.target.checked)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.pricingContent.customPricing.description}
                    onChange={(v) => handleDeepNestedInputChange('pricingContent', 'customPricing', 'description', v)}
                    placeholder="Request a private offer to receive a custom quote."
                    editorMinHeight={220}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.pricingContent.customPricing.buttonText}
                    onChange={(e) => handleDeepNestedInputChange('pricingContent', 'customPricing', 'buttonText', e.target.value)}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4 pt-4 border-top">
        <div>
          {currentStep > 0 && (
            <Button type="button" variant="secondary" onClick={prevStep}>
              <IconifyIcon icon="bx:chevron-left" className="me-1" />
              Previous
            </Button>
          )}
        </div>
        <div className="d-flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button type="button" variant="primary" onClick={nextStep}>
              Next
              <IconifyIcon icon="bx:chevron-right" className="ms-1" />
            </Button>
          ) : (
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditMode ? 'Update' : 'Create'} AI Agent
                  <IconifyIcon icon="bxs:check-circle" className="ms-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateAIAgentForm;
