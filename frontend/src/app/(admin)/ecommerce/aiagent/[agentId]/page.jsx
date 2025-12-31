import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Row, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAIAgent } from '@/http/AIAgent';
import toast from 'react-hot-toast';
import OverviewTabForm from './components/OverviewTabForm';
import FeaturesTabForm from './components/FeaturesTabForm';
import ResourcesTabForm from './components/ResourcesTabForm';
import SupportTabForm from './components/SupportTabForm';
import ProductComparisonTabForm from './components/ProductComparisonTabForm';
import HowToBuyTabForm from './components/HowToBuyTabForm';

const AIAgentDetail = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await getAIAgent(agentId);
      if (response.data?.success) {
        setAgent(response.data.data);
      } else {
        setAgent(response.data);
      }
    } catch (error) {
      console.error('Error fetching AI agent:', error);
      toast.error('Failed to fetch AI agent');
      navigate('/ecommerce/aiagents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchAgent(); // Refresh agent data after update
  };

  if (loading) {
    return (
      <>
        <PageMetaData title="Loading AI Agent..." />
        <PageBreadcrumb title="AI Agent Details" subName="Ecommerce" />
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

  if (!agent) {
    return (
      <>
        <PageMetaData title="AI Agent Not Found" />
        <PageBreadcrumb title="AI Agent Details" subName="Ecommerce" />
        <Row>
          <Col>
            <Card>
              <CardBody>
                <div className="text-center p-4">
                  <p>AI Agent not found</p>
                  <Button onClick={() => navigate('/ecommerce/aiagents')}>
                    Back to List
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  const tabs = [
    'Overview',
    'Features',
    'Resources',
    'Support',
    'Product comparison',
    'How to buy'
  ];

  return (
    <>
      <PageMetaData title={`${agent.name} - AI Agent Details`} />
      <PageBreadcrumb title="AI Agent Details" subName="Ecommerce" />
      
      {/* Agent Header */}
      <Row className="mb-3">
        <Col>
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex gap-3 align-items-center">
                  {/* Logo */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    flexShrink: 0,
                    backgroundColor: '#F3F4F6',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    border: '2px solid #E5E7EB'
                  }}>
                    {agent.logo ? (
                      <img
                        src={agent.logo}
                        alt={agent.name}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!agent.logo && (
                      <IconifyIcon icon="bx:bot" className="fs-36 text-muted" />
                    )}
                  </div>

                  {/* Agent Info */}
                  <div>
                    <h2 className="mb-1">{agent.name}</h2>
                    {agent.provider && (
                      <p className="text-muted mb-0">by {agent.provider}</p>
                    )}
                    <div className="d-flex gap-2 mt-2">
                      {agent.badges && agent.badges.map((badge, index) => (
                        <Badge key={index} bg="primary">{badge}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button variant="outline-secondary" onClick={() => navigate('/ecommerce/aiagents')}>
                  <IconifyIcon icon="bx:arrow-back" className="me-1" />
                  Back to List
                </Button>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tabs Navigation */}
      <Row className="mb-3">
        <Col>
          <Card>
            <CardBody className="p-0">
              <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-0">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.toLowerCase().replace(/\s+/g, '-')}
                    eventKey={tab.toLowerCase().replace(/\s+/g, '-')}
                    title={
                      <span>
                        {tab}
                        {tab === 'Product comparison' && (
                          <Badge bg="danger" className="ms-2" style={{ fontSize: '9px' }}>
                            NEW
                          </Badge>
                        )}
                      </span>
                    }
                  />
                ))}
              </Tabs>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Tab Content - Forms */}
      <Row>
        <Col>
          <Card>
            <CardBody>
              {activeTab === 'overview' && (
                <OverviewTabForm agent={agent} onUpdate={handleUpdate} />
              )}

              {activeTab === 'features' && (
                <FeaturesTabForm agent={agent} onUpdate={handleUpdate} />
              )}

              {activeTab === 'resources' && (
                <ResourcesTabForm agent={agent} onUpdate={handleUpdate} />
              )}

              {activeTab === 'support' && (
                <SupportTabForm agent={agent} onUpdate={handleUpdate} />
              )}

              {activeTab === 'product-comparison' && (
                <ProductComparisonTabForm agent={agent} onUpdate={handleUpdate} />
              )}

              {activeTab === 'how-to-buy' && (
                <HowToBuyTabForm agent={agent} onUpdate={handleUpdate} />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AIAgentDetail;
