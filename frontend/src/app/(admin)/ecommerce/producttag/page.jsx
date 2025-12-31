import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getProductTags } from '@/http/ProductTag';
import ProductTagsListTable from './components/ProductTagsListTable';

const ProductTags = () => {
  const [tagsList, setTagsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getProductTags();
        setTagsList(response.data || []);
      } catch (error) {
        console.error('Error fetching product tags:', error);
        setTagsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    // Refresh list after delete
    const response = await getProductTags();
    setTagsList(response.data || []);
  };

  return (
    <>
      <PageMetaData title="Product Tags List" />
      <PageBreadcrumb title="Product Tags List" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3">
                <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input type="search" className="form-control" id="search" placeholder="Search ..." />
                </div>
                <div>
                  <Link to="/ecommerce/producttags/create" className="btn btn-primary d-flex align-items-center">
                    <IconifyIcon icon="bx:plus" className="me-1" />
                    Add Product Tag
                  </Link>
                </div>
              </div>
            </CardBody>
            <div>
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                tagsList && <ProductTagsListTable tags={tagsList} onDelete={handleDelete} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProductTags;

