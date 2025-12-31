import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getPublishers } from '@/http/Publisher';
import PublishersListTable from './components/PublishersListTable';
import toast from 'react-hot-toast';

const Publishers = () => {
  const [publishersList, setPublishersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublishers();
  }, [searchQuery]);

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await getPublishers(params);
      if (response.data?.success) {
        setPublishersList(response.data.data || []);
      } else {
        setPublishersList(response.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching publishers:', error);
      toast.error('Failed to fetch publishers');
      setPublishersList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPublishers();
  };

  const handleDelete = () => {
    fetchPublishers();
  };

  return (
    <>
      <PageMetaData title="Publishers List" />
      <PageBreadcrumb title="Publishers List" subName="Ecommerce" />
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
                      placeholder="Search Publishers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                <Link to="/ecommerce/publishers/create">
                  <Button variant="primary" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="bx:plus" className="fs-18" />
                    Add Publisher
                  </Button>
                </Link>
              </div>

              <PublishersListTable
                publishers={publishersList}
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

export default Publishers;

