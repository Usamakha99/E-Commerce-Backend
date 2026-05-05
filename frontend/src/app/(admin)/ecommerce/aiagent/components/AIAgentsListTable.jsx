import clsx from 'clsx';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { deleteAIAgent } from '@/http/AIAgent';
import toast from 'react-hot-toast';
import { Badge } from 'react-bootstrap';
import { stripHtml } from '@/utils/rich-text';

const AIAgentsListTable = ({ agents, loading, onDelete, pagination, onPageChange }) => {
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the AI Agent "${name}"?`)) {
      try {
        await deleteAIAgent(id);
        toast.success('AI Agent deleted successfully');
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Error deleting AI agent:', error);
        toast.error(error.response?.data?.error || 'Failed to delete AI agent');
      }
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/ecommerce/aiagents/create?edit=${id}`;
  };

  const columns = [
    {
      header: 'Agent Name',
      cell: ({ row: { original: { id, name, logo, provider, isActive } } }) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            {logo ? (
              <img
                src={logo}
                alt={name}
                style={{
                  width: '50px',
                  height: '50px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5',
                  padding: '5px',
                }}
                onError={(e) => {
                  e.target.src = '/src/assets/imgs/page/homepage1/imgsp1.png';
                }}
              />
            ) : (
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '8px',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                <IconifyIcon icon="bx:bot" className="fs-24" />
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link
                to={`/ecommerce/aiagents/${id}`}
                className="text-reset"
                style={{ cursor: 'pointer' }}
                title="Click to view details"
              >
                {name}
              </Link>
            </h5>
            {provider && (
              <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                by {provider}
              </p>
            )}
            <Badge bg={isActive ? 'success' : 'secondary'} className="mt-1">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: ({ row: { original: { shortDescription, description } } }) => {
        const raw = shortDescription || description || '';
        const text = raw ? stripHtml(raw) : '';
        return (
          <div className="text-truncate" style={{ maxWidth: '300px' }} title={text}>
            {text || '-'}
          </div>
        );
      },
    },
    {
      header: 'Rating',
      cell: ({ row: { original: { rating, awsReviews, externalReviews } } }) => {
        const totalReviews = (awsReviews || 0) + (externalReviews || 0);
        return (
          <div>
            {rating > 0 ? (
              <>
                <div className="d-flex align-items-center gap-1">
                  <IconifyIcon icon="bx:star" className="text-warning" />
                  <span className="fw-semibold">{rating}</span>
                </div>
                <small className="text-muted">({totalReviews} reviews)</small>
              </>
            ) : (
              <span className="text-muted">No ratings</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Features',
      cell: ({ row: { original: { freeTrial, deployedOnAWS, awsFreeTier } } }) => (
        <div className="d-flex flex-wrap gap-1">
          {freeTrial && (
            <Badge bg="success" className="text-nowrap">
              Free Trial
            </Badge>
          )}
          {deployedOnAWS && (
            <Badge bg="info" className="text-nowrap">
              AWS
            </Badge>
          )}
          {awsFreeTier && (
            <Badge bg="warning" className="text-nowrap">
              Free Tier
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      cell: ({ row: { original: { id, name } } }) => (
        <>
          <button
            type="button"
            className="btn btn-sm btn-soft-secondary me-1"
            onClick={() => handleEdit(id)}
            title="Edit"
          >
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-soft-danger"
            onClick={() => handleDelete(id, name)}
            title="Delete"
          >
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReactTable columns={columns} data={agents} />
      {pagination && pagination.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span className="text-muted">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} agents
            </span>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              disabled={pagination.page === 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <span className="d-flex align-items-center px-3">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              className="btn btn-sm btn-outline-primary"
              disabled={pagination.page === pagination.pages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAgentsListTable;

