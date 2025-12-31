import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { updateProductInquiry, deleteProductInquiry } from '@/http/ProductInquiry';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';

const InquiriesListTable = ({ inquiries, onUpdate, filters, onFilterChange }) => {
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });

  const handleStatusChange = (inquiry) => {
    setSelectedInquiry(inquiry);
    setStatusForm({ status: inquiry.status, notes: inquiry.notes || '' });
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await updateProductInquiry(selectedInquiry.id, {
        status: statusForm.status,
        notes: statusForm.notes
      });
      toast.success('Inquiry status updated successfully');
      setShowStatusModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      toast.error(error.response?.data?.error || 'Failed to update inquiry');
    }
  };

  const handleDelete = async (id, customerName) => {
    if (window.confirm(`Are you sure you want to delete inquiry from ${customerName}?`)) {
      try {
        await deleteProductInquiry(id);
        toast.success('Inquiry deleted successfully');
        onUpdate();
      } catch (error) {
        console.error('Error deleting inquiry:', error);
        toast.error(error.response?.data?.error || 'Failed to delete inquiry');
      }
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

  const columns = [
    {
      header: 'Inquiry ID',
      cell: ({ row: { original: { id } } }) => (
        <span 
          onClick={() => navigate(`/ecommerce/inquiries/${id}`)}
          className="fw-semibold text-primary"
          style={{ cursor: 'pointer', textDecoration: 'none' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate(`/ecommerce/inquiries/${id}`);
            }
          }}
        >
          #{id}
        </span>
      ),
    },
    {
      header: 'Customer',
      cell: ({ row: { original: { firstName, lastName, email, username } } }) => (
        <div>
          <div className="fw-semibold">{firstName} {lastName}</div>
          <small className="text-muted">{email}</small>
          {username && <div><small className="text-muted">@{username}</small></div>}
        </div>
      ),
    },
    {
      header: 'Product',
      cell: ({ row: { original: { productName, product } } }) => (
        <div>
          {productName ? (
            <>
              <div className="fw-semibold">{productName}</div>
              {product?.sku && <small className="text-muted">SKU: {product.sku}</small>}
            </>
          ) : (
            <span className="text-muted">General Inquiry</span>
          )}
        </div>
      ),
    },
    {
      header: 'Inquiry Type',
      cell: ({ row: { original: { helpType } } }) => (
        <Badge bg="primary">{getHelpTypeLabel(helpType)}</Badge>
      ),
    },
    {
      header: 'Country',
      cell: ({ row: { original: { country } } }) => (
        <span className="text-capitalize">{country}</span>
      ),
    },
    {
      header: 'Status',
      cell: ({ row: { original: { status } } }) => getStatusBadge(status),
    },
    {
      header: 'Date',
      cell: ({ row: { original: { createdAt } } }) => (
        <div>
          <div>{new Date(createdAt).toLocaleDateString()}</div>
          <small className="text-muted">{new Date(createdAt).toLocaleTimeString()}</small>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: ({ row: { original: inquiry } }) => (
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-sm btn-soft-primary"
            onClick={() => handleStatusChange(inquiry)}
            title="Update Status"
          >
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-soft-info"
            title="View Details"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/ecommerce/inquiries/${inquiry.id}`);
            }}
          >
            <IconifyIcon icon="bx:eye" className="fs-18" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-soft-danger"
            onClick={() => handleDelete(inquiry.id, `${inquiry.firstName} ${inquiry.lastName}`)}
            title="Delete"
          >
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <ReactTable
        columns={columns}
        data={inquiries}
        rowsPerPageList={[10, 20, 50, 100]}
        pageSize={filters.limit || 20}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />

      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Inquiry Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInquiry && (
            <>
              <div className="mb-3">
                <strong>Inquiry ID:</strong> #{selectedInquiry.id}<br />
                <strong>Customer:</strong> {selectedInquiry.firstName} {selectedInquiry.lastName}<br />
                <strong>Email:</strong> {selectedInquiry.email}
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusForm.notes}
                  onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
                  placeholder="Add notes about this inquiry..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Update Status
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InquiriesListTable;

