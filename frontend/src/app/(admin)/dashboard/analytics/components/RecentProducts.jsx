import { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getProducts } from '@/http/Product';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';

const RecentProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentProducts();
  }, []);

  const fetchRecentProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts({ page: 1, limit: 50 });
      const allProducts = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || [];
      
      // Sort by createdAt and take latest 5
      const recent = allProducts
        .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
        .slice(0, 5);
      
      setProducts(recent);
    } catch (error) {
      console.error('Error fetching recent products:', error);
      toast.error('Failed to load recent products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <CardTitle className="mb-0">Recent Products</CardTitle>
          <Link to="/ecommerce/products" className="btn btn-sm btn-outline-primary">
            View All
            <IconifyIcon icon="bx:arrow-right" className="ms-1" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No products found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="table-nowrap mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url || product.images[0]}
                            alt={product.title}
                            className="rounded me-2"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className="rounded me-2 bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <IconifyIcon icon="bx:package" className="text-muted" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/ecommerce/products/${product.id}`}
                            className="text-reset fw-semibold"
                          >
                            {product.title || product.name || 'Untitled Product'}
                          </Link>
                          {product.sku && (
                            <small className="d-block text-muted">SKU: {product.sku}</small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      {product.category?.title || product.category?.name || '-'}
                    </td>
                    <td>
                      {product.brand?.title || product.brand?.name || '-'}
                    </td>
                    <td>
                      <span className={`badge bg-${product.isActive !== false ? 'success' : 'secondary'}`}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RecentProducts;

