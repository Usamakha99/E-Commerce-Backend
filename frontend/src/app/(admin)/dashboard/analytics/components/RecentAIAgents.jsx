import { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAIAgents } from '@/http/AIAgent';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';

const RecentAIAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentAgents();
  }, []);

  const fetchRecentAgents = async () => {
    try {
      setLoading(true);
      const response = await getAIAgents({ limit: 5, sortBy: 'createdAt', sortOrder: 'DESC' });
      const agentsData = response.data?.data || [];
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching recent AI agents:', error);
      toast.error('Failed to load recent AI agents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <CardTitle className="mb-0">Recent AI Agents</CardTitle>
          <Link to="/ecommerce/aiagents" className="btn btn-sm btn-outline-primary">
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
        ) : agents.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No AI agents found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table className="table-nowrap mb-0">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Provider</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {agent.logo ? (
                          <img
                            src={agent.logo}
                            alt={agent.name}
                            className="rounded me-2"
                            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                          />
                        ) : (
                          <div
                            className="rounded me-2 bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <IconifyIcon icon="bx:bot" className="text-muted" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/ecommerce/aiagents/${agent.id}`}
                            className="text-reset fw-semibold"
                          >
                            {agent.name}
                          </Link>
                          {agent.shortDescription && (
                            <small className="d-block text-muted text-truncate" style={{ maxWidth: '200px' }}>
                              {agent.shortDescription}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{agent.provider || agent.soldBy || '-'}</td>
                    <td>
                      {agent.rating != null && !Number.isNaN(Number(agent.rating)) ? (
                        <div className="d-flex align-items-center gap-1">
                          <IconifyIcon icon="bx:star" className="text-warning" />
                          <span>{Number(agent.rating).toFixed(1)}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <Badge bg={agent.isActive !== false ? 'success' : 'secondary'}>
                        {agent.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
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

export default RecentAIAgents;

