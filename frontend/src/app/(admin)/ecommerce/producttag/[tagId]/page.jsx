import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Row, Badge } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getProductTag } from '@/http/ProductTag';
import { getProductsByTag } from '@/http/Product';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Link } from 'react-router-dom';

const ProductsByTag = () => {
  const { tagId } = useParams();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tag details
        const tagResponse = await getProductTag(tagId);
        setTag(tagResponse.data);

        // Fetch products by tag
        const productsResponse = await getProductsByTag({
          tagId: tagId,
          page: 1,
          limit: 20,
        });
        
        setProducts(productsResponse.data || []);
        setPagination(productsResponse.pagination);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/ecommerce/producttags');
      } finally {
        setLoading(false);
      }
    };

    if (tagId) {
      fetchData();
    }
  }, [tagId, navigate]);

  if (loading) {
    return (
      <>
        <PageMetaData title="Products by Tag" />
        <PageBreadcrumb title="Products by Tag" subName="Ecommerce" />
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

  if (!tag) {
    return (
      <>
        <PageMetaData title="Tag Not Found" />
        <PageBreadcrumb title="Tag Not Found" subName="Ecommerce" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <div className="text-center p-4">
                  <p>Tag not found</p>
                  <Link to="/ecommerce/producttags" className="btn btn-primary">
                    Back to Tags
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
      <PageMetaData title={`Products - ${tag.name}`} />
      <PageBreadcrumb title={`Products: ${tag.name}`} subName="Ecommerce" />
      
      <Row className="mb-3">
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="mb-2">
                    <Badge
                      style={{
                        backgroundColor: tag.color || '#007bff',
                        color: '#fff',
                        fontSize: '16px',
                        padding: '8px 16px',
                        marginRight: '10px',
                      }}
                    >
                      {tag.name}
                    </Badge>
                    Products
                  </h4>
                  {tag.description && (
                    <p className="text-muted mb-0">{tag.description}</p>
                  )}
                </div>
                <div>
                  <Link
                    to="/ecommerce/producttags"
                    className="btn btn-outline-secondary"
                  >
                    <IconifyIcon icon="bx:arrow-back" className="me-1" />
                    Back to Tags
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <CardBody>
              {products.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted">No products found with this tag.</p>
                  <Link to="/ecommerce/products" className="btn btn-primary">
                    Browse All Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="text-muted">
                      Showing {products.length} of {pagination?.total || 0} products
                    </p>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>SKU</th>
                          <th>Brand</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0].url || product.mainImage}
                                  alt={product.title}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  className="rounded"
                                />
                              ) : (
                                <div
                                  className="bg-light d-flex align-items-center justify-content-center"
                                  style={{ width: '50px', height: '50px' }}
                                >
                                  <IconifyIcon icon="bx:image" />
                                </div>
                              )}
                            </td>
                            <td>
                              <Link to={`/ecommerce/products/${product.id}`}>
                                {product.title || product.shortDescp || 'N/A'}
                              </Link>
                            </td>
                            <td>{product.sku || 'N/A'}</td>
                            <td>{product.brand?.title || 'N/A'}</td>
                            <td>{product.category?.title || 'N/A'}</td>
                            <td>${product.price || '0.00'}</td>
                            <td>
                              <Badge
                                bg={product.quantity > 0 ? 'success' : 'danger'}
                              >
                                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </td>
                            <td>
                              <Link
                                to={`/ecommerce/products/${product.id}`}
                                className="btn btn-sm btn-primary"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductsByTag;

