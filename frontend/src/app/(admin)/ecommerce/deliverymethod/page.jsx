import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getDeliveryMethods } from '@/http/DeliveryMethod';
import DeliveryMethodsListTable from './components/DeliveryMethodsListTable';
import toast from 'react-hot-toast';

const DeliveryMethods = () => {
  const [methodsList, setMethodsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMethods();
  }, [searchQuery]);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await getDeliveryMethods(params);
      if (response.data?.success) {
        setMethodsList(response.data.data || []);
      } else {
        setMethodsList(response.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching delivery methods:', error);
      toast.error('Failed to fetch delivery methods');
      setMethodsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMethods();
  };

  const handleDelete = () => {
    fetchMethods();
  };

  return (
    <>
      <PageMetaData title="Delivery Methods List" />
      <PageBreadcrumb title="Delivery Methods List" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                <div className="search-bar flex-grow-1" style={{ maxWidth: '400px' }}>
                  <form onSubmit={handleSearch}>
                    <span>
                      <IconifyIcon icon="bx:search-alt" className="mb-1" />
                    </span>
                    <input
                      type="search"
                      className="form-control"
                      id="search"
                      placeholder="Search Delivery Methods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                <Link to="/ecommerce/deliverymethods/create">
                  <Button variant="primary" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="bx:plus" className="fs-18" />
                    Add Delivery Method
                  </Button>
                </Link>
              </div>

              <DeliveryMethodsListTable
                methods={methodsList}
                loading={loading}
                onDelete={handleDelete}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DeliveryMethods;

