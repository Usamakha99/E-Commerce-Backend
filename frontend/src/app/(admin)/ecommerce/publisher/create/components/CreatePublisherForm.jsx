import { useState, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { createPublisher, updatePublisher } from '@/http/Publisher';

const CreatePublisherForm = ({ isEditMode, initialData, publisherId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: '',
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        logo: initialData.logo || '',
        website: initialData.website || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Publisher name is required');
      return;
    }

    try {
      if (isEditMode) {
        await updatePublisher(publisherId, formData);
        toast.success('Publisher updated successfully!');
      } else {
        await createPublisher(formData);
        toast.success('Publisher created successfully!');
      }
      navigate('/ecommerce/publishers');
    } catch (error) {
      console.error('Error saving publisher:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} publisher`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Publisher Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g., Okta, Inc"
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
            <label className="form-label">Website</label>
            <input
              type="url"
              className="form-control"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter publisher description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">Status</label>
            <br />
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id="activeStatus"
                checked={formData.isActive === true}
                onChange={() => handleInputChange('isActive', true)}
              />
              <label className="form-check-label" htmlFor="activeStatus">
                Active
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id="inactiveStatus"
                checked={formData.isActive === false}
                onChange={() => handleInputChange('isActive', false)}
              />
              <label className="form-check-label" htmlFor="inactiveStatus">
                Inactive
              </label>
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/ecommerce/publishers')}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEditMode ? 'Update' : 'Create'} Publisher
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </button>
      </div>
    </form>
  );
};

export default CreatePublisherForm;

