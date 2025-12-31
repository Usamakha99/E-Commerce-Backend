import { useState, useEffect } from 'react';
import { Col, Row, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { createProductTag, updateProductTag } from '@/http/ProductTag';

const CreateProductTagForm = ({ isEditMode, initialData, tagId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#007bff',
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        description: initialData.description || '',
        color: initialData.color || '#007bff',
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
    // Auto-generate slug if not manually edited
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleInputChange('slug', generateSlug(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      if (isEditMode) {
        await updateProductTag(tagId, formData);
        toast.success('Product tag updated successfully!');
      } else {
        await createProductTag(formData);
        toast.success('Product tag created successfully!');
      }
      navigate('/ecommerce/producttags');
    } catch (error) {
      console.error('Error saving product tag:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} product tag`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Row>
        {/* Tag Name */}
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Tag Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter tag name (e.g., New Arrival, Best Seller)"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
        </Col>

        {/* Slug */}
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
            <small className="form-text text-muted">
              URL-friendly version of the tag name
            </small>
          </div>
        </Col>
      </Row>

      {/* Description */}
      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Enter tag description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </Col>
      </Row>

      {/* Color and Status */}
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">Tag Color</label>
            <div className="d-flex align-items-center gap-3">
              <input
                type="color"
                className="form-control form-control-color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                style={{ width: '60px', height: '40px' }}
              />
              <input
                type="text"
                className="form-control"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#007bff"
              />
            </div>
            <small className="form-text text-muted">
              Choose a color to visually identify this tag
            </small>
          </div>
        </Col>

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

      {/* Preview */}
      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <label className="form-label">Preview</label>
            <div className="p-3 border rounded">
              <span
                className="badge"
                style={{
                  backgroundColor: formData.color,
                  color: '#fff',
                  fontSize: '14px',
                  padding: '8px 12px',
                }}
              >
                {formData.name || 'Tag Preview'}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Submit Button */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/ecommerce/producttags')}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          {isEditMode ? 'Update' : 'Create'} Product Tag
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </button>
      </div>
    </form>
  );
};

export default CreateProductTagForm;

