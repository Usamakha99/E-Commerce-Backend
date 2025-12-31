import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Row, Badge, Button, Form } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getProductInquiry, updateProductInquiry } from '@/http/ProductInquiry';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const InquiryDetail = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });

  useEffect(() => {
    if (inquiryId) {
      fetchInquiry();
    }
  }, [inquiryId]);

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      const response = await getProductInquiry(inquiryId);
      setInquiry(response.data?.data || response.data);
      setFormData({
        status: response.data?.data?.status || response.data?.status || 'pending',
        notes: response.data?.data?.notes || response.data?.notes || ''
      });
    } catch (error) {
      console.error('Error fetching inquiry:', error);
      toast.error('Failed to load inquiry');
      navigate('/ecommerce/inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateProductInquiry(inquiryId, formData);
      toast.success('Inquiry updated successfully');
      setEditing(false);
      fetchInquiry();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error(error.response?.data?.error || 'Failed to update inquiry');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Pending' },
      in_progress: { bg: 'info', text: 'In Progress' },
      resolved: { bg: 'success', text: 'Resolved' },
      closed: { bg: 'secondary', text: 'Closed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getHelpTypeLabel = (helpType) => {
    const labels = {
      pricing: 'Volume Pricing',
      shipping: 'Shipping Options',
      specs: 'Product Specifications',
      availability: 'Product Availability',
      other: 'Other'
    };
    return labels[helpType] || helpType;
  };

  if (loading) {
    return (
      <>
        <PageMetaData title="Inquiry Details" />
        <PageBreadcrumb title="Inquiry Details" subName="Ecommerce" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (!inquiry) {
    return (
      <>
        <PageMetaData title="Inquiry Not Found" />
        <PageBreadcrumb title="Inquiry Not Found" subName="Ecommerce" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <div className="text-center p-4">
                  <p>Inquiry not found</p>
                  <Link to="/ecommerce/inquiries" className="btn btn-primary">
                    Back to Inquiries
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      <PageMetaData title={`Inquiry #${inquiry.id}`} />
      <PageBreadcrumb title={`Inquiry #${inquiry.id}`} subName="Ecommerce" />
      
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Inquiry #{inquiry.id}</h4>
              <small className="text-muted">
                Submitted: {new Date(inquiry.createdAt).toLocaleString()}
              </small>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={() => navigate('/ecommerce/inquiries')}>
                <IconifyIcon icon="bx:arrow-back" className="me-1" />
                Back
              </Button>
              {!editing && (
                <Button variant="primary" onClick={() => setEditing(true)}>
                  <IconifyIcon icon="bx:edit" className="me-1" />
                  Edit Status
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Customer Information</h5>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Name</label>
                    <div className="fw-semibold">{inquiry.firstName} {inquiry.lastName}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Username</label>
                    <div>{inquiry.username}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Email</label>
                    <div>
                      <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Country</label>
                    <div className="text-capitalize">{inquiry.country}</div>
                  </div>
                </Col>
                {inquiry.companyName && (
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="text-muted small">Company</label>
                      <div>{inquiry.companyName}</div>
                    </div>
                  </Col>
                )}
                {inquiry.city && (
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="text-muted small">City</label>
                      <div>{inquiry.city}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </CardBody>
          </Card>

          <Card className="mt-3">
            <CardBody>
              <h5 className="mb-3">Inquiry Details</h5>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Inquiry Type</label>
                    <div>
                      <Badge bg="primary">{getHelpTypeLabel(inquiry.helpType)}</Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="text-muted small">Status</label>
                    <div>{getStatusBadge(inquiry.status)}</div>
                  </div>
                </Col>
                {inquiry.productName && (
                  <Col md={12}>
                    <div className="mb-3">
                      <label className="text-muted small">Product</label>
                      <div>
                        <strong>{inquiry.productName}</strong>
                        {inquiry.product?.sku && (
                          <span className="text-muted ms-2">(SKU: {inquiry.product.sku})</span>
                        )}
                      </div>
                      {inquiry.productId && (
                        <Link 
                          to={`/ecommerce/products/${inquiry.productId}`}
                          className="btn btn-sm btn-outline-primary mt-2"
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                  </Col>
                )}
                {inquiry.message && (
                  <Col md={12}>
                    <div className="mb-3">
                      <label className="text-muted small">Message</label>
                      <div className="p-3 bg-light rounded">{inquiry.message}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </CardBody>
          </Card>

          {editing && (
            <Card className="mt-3">
              <CardBody>
                <h5 className="mb-3">Update Status</h5>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add notes about this inquiry..."
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={handleUpdate}>
                      Save Changes
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      setEditing(false);
                      setFormData({
                        status: inquiry.status,
                        notes: inquiry.notes || ''
                      });
                    }}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          )}

          {inquiry.notes && !editing && (
            <Card className="mt-3">
              <CardBody>
                <h5 className="mb-3">Admin Notes</h5>
                <div className="p-3 bg-light rounded">{inquiry.notes}</div>
              </CardBody>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          <Card>
            <CardBody>
              <h5 className="mb-3">Quick Actions</h5>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" as={Link} to={`mailto:${inquiry.email}`}>
                  <IconifyIcon icon="bx:envelope" className="me-1" />
                  Send Email
                </Button>
                {inquiry.productId && (
                  <Button variant="outline-info" as={Link} to={`/ecommerce/products/${inquiry.productId}`}>
                    <IconifyIcon icon="bx:package" className="me-1" />
                    View Product
                  </Button>
                )}
                <Button variant="outline-success" onClick={() => {
                  setFormData({ ...formData, status: 'resolved' });
                  setEditing(true);
                }}>
                  <IconifyIcon icon="bx:check-circle" className="me-1" />
                  Mark as Resolved
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card className="mt-3">
            <CardBody>
              <h5 className="mb-3">Timeline</h5>
              <div>
                <div className="mb-3">
                  <small className="text-muted">Created</small>
                  <div>{new Date(inquiry.createdAt).toLocaleString()}</div>
                </div>
                {inquiry.updatedAt !== inquiry.createdAt && (
                  <div className="mb-3">
                    <small className="text-muted">Last Updated</small>
                    <div>{new Date(inquiry.updatedAt).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default InquiryDetail;

