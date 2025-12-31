import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAIAgents } from '@/http/AIAgent';
import AIAgentsListTable from './components/AIAgentsListTable';
import toast from 'react-hot-toast';

const AIAgents = () => {
  const [agentsList, setAgentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, [pagination.page, searchQuery]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await getAIAgents(params);
      if (response.data?.success) {
        setAgentsList(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 0,
        }));
      } else {
        setAgentsList(response.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching AI agents:', error);
      toast.error('Failed to fetch AI agents');
      setAgentsList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchAgents();
  };

  const handleDelete = () => {
    fetchAgents();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <PageMetaData title="AI Agents List" />
      <PageBreadcrumb title="AI Agents List" subName="Ecommerce" />
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
                      placeholder="Search AI Agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                <Link to="/ecommerce/aiagents/create">
                  <Button variant="primary" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="bx:plus" className="fs-18" />
                    Add AI Agent
                  </Button>
                </Link>
              </div>

              <AIAgentsListTable
                agents={agentsList}
                loading={loading}
                onDelete={handleDelete}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AIAgents;

