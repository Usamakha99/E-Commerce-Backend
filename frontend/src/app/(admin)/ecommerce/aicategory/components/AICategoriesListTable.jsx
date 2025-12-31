import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { deleteAICategory } from '@/http/AICategory';
import toast from 'react-hot-toast';
import { Badge } from 'react-bootstrap';

const AICategoriesListTable = ({ categories, loading, onDelete }) => {
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
      try {
        await deleteAICategory(id);
        toast.success('Category deleted successfully');
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/ecommerce/aicategories/create?edit=${id}`;
  };

  const columns = [
    {
      header: 'Category Name',
      cell: ({ row: { original: { id, name, isActive, count } } }) => (
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link
                to={`/ecommerce/aicategories/${id}`}
                className="text-reset"
                style={{ cursor: 'pointer' }}
              >
                {name}
              </Link>
            </h5>
            <Badge bg={isActive ? 'success' : 'secondary'} className="me-2">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge bg="info">
              {count || 0} {count === 1 ? 'agent' : 'agents'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: ({ row: { original: { description } } }) => (
        <div className="text-truncate" style={{ maxWidth: '300px' }}>
          {description || '-'}
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

  return <ReactTable columns={columns} data={categories} />;
};

export default AICategoriesListTable;

