import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Badge, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getProductInquiries } from '@/http/ProductInquiry';
import InquiriesListTable from './components/InquiriesListTable';
import toast from 'react-hot-toast';

const Inquiries = () => {
  const [inquiriesList, setInquiriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    helpType: 'all',
    page: 1,
    limit: 20
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, [filters.status, filters.helpType, filters.page]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.helpType !== 'all') params.helpType = filters.helpType;
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await getProductInquiries(params);
      setInquiriesList(response.data?.data || []);
      
      // Update pagination if available
      if (response.data?.pagination) {
        setFilters(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Failed to load inquiries');
      setInquiriesList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleHelpTypeFilter = (helpType) => {
    setFilters(prev => ({ ...prev, helpType, page: 1 }));
  };

  const handleRefresh = () => {
    fetchInquiries();
  };

  return (
    <>
      <PageMetaData title="Product Inquiries" />
      <PageBreadcrumb title="Product Inquiries" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
                <div className="search-bar">
                  <span>
                    <IconifyIcon icon="bx:search-alt" className="mb-1" />
                  </span>
                  <input 
                    type="search" 
                    className="form-control" 
                    id="search" 
                    placeholder="Search inquiries..." 
                  />
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Dropdown>
                    <DropdownToggle variant="outline-secondary" className="arrow-none">
                      <IconifyIcon icon="bx:filter" className="me-1" />
                      Status: {filters.status === 'all' ? 'All' : filters.status}
                      <IconifyIcon icon="bx:chevron-down" className="ms-2" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={() => handleStatusFilter('all')}>All</DropdownItem>
                      <DropdownItem onClick={() => handleStatusFilter('pending')}>Pending</DropdownItem>
                      <DropdownItem onClick={() => handleStatusFilter('in_progress')}>In Progress</DropdownItem>
                      <DropdownItem onClick={() => handleStatusFilter('resolved')}>Resolved</DropdownItem>
                      <DropdownItem onClick={() => handleStatusFilter('closed')}>Closed</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Dropdown>
                    <DropdownToggle variant="outline-secondary" className="arrow-none">
                      <IconifyIcon icon="bx:category" className="me-1" />
                      Type: {filters.helpType === 'all' ? 'All' : filters.helpType}
                      <IconifyIcon icon="bx:chevron-down" className="ms-2" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem onClick={() => handleHelpTypeFilter('all')}>All Types</DropdownItem>
                      <DropdownItem onClick={() => handleHelpTypeFilter('pricing')}>Pricing</DropdownItem>
                      <DropdownItem onClick={() => handleHelpTypeFilter('shipping')}>Shipping</DropdownItem>
                      <DropdownItem onClick={() => handleHelpTypeFilter('specs')}>Specifications</DropdownItem>
                      <DropdownItem onClick={() => handleHelpTypeFilter('availability')}>Availability</DropdownItem>
                      <DropdownItem onClick={() => handleHelpTypeFilter('other')}>Other</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>

                  <Button variant="outline-primary" onClick={handleRefresh}>
                    <IconifyIcon icon="bx:refresh" className="me-1" />
                    Refresh
                  </Button>
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
                inquiriesList && <InquiriesListTable 
                  inquiries={inquiriesList} 
                  onUpdate={fetchInquiries}
                  filters={filters}
                  onFilterChange={setFilters}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Inquiries;

