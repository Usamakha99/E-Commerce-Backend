import clsx from 'clsx';
import { Link } from 'react-router-dom';
import ReactTable from '@/components/Table';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { deleteProductTag } from '@/http/ProductTag';
import toast from 'react-hot-toast';

const ProductTagsListTable = ({ tags, onDelete }) => {
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the tag "${name}"?`)) {
      try {
        await deleteProductTag(id);
        toast.success('Product tag deleted successfully');
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error('Error deleting tag:', error);
        toast.error(error.response?.data?.error || 'Failed to delete product tag');
      }
    }
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    window.location.href = `/ecommerce/producttags/create?edit=${id}`;
  };

  const columns = [
    {
      header: 'Tag Name',
      cell: ({ row: { original: { id, name, color, isActive } } }) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            {color && (
              <span
                className="badge"
                style={{
                  backgroundColor: color,
                  color: '#fff',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              />
            )}
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link 
                to={`/ecommerce/producttags/${id}`} 
                className="text-reset"
                style={{ cursor: 'pointer' }}
                title="Click to view products with this tag"
              >
                {name}
              </Link>
            </h5>
            <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
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
      header: 'Products Count',
      cell: ({ row: { original: { products } } }) => (
        <span className="badge bg-info">
          {products?.length || 0} {products?.length === 1 ? 'product' : 'products'}
        </span>
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

  const pageSizeList = [5, 10, 20, 50];

  return (
    <ReactTable
      columns={columns}
      data={tags}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
    />
  );
};

export default ProductTagsListTable;

