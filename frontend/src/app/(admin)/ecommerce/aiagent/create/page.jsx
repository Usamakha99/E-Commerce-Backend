import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateAIAgentForm from './components/CreateAIAgentForm';
import PageMetaData from '@/components/PageTitle';
import { getAIAgent } from '@/http/AIAgent';

const CreateAIAgent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const fetchAgent = async () => {
        try {
          setLoading(true);
          const response = await getAIAgent(editId);
          if (response.data?.success) {
            setInitialData(response.data.data);
          } else {
            setInitialData(response.data);
          }
        } catch (error) {
          console.error('Error fetching AI agent:', error);
          navigate('/ecommerce/aiagents');
        } finally {
          setLoading(false);
        }
      };
      fetchAgent();
    }
  }, [editId, navigate]);

  if (loading) {
    return (
      <>
        <PageMetaData title={isEditMode ? 'Edit AI Agent' : 'Create AI Agent'} />
        <PageBreadcrumb
          title={isEditMode ? 'Edit AI Agent' : 'Create AI Agent'}
          subName="Ecommerce"
        />
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

  return (
    <>
      <PageMetaData title={isEditMode ? 'Edit AI Agent' : 'Create AI Agent'} />
      <PageBreadcrumb
        title={isEditMode ? 'Edit AI Agent' : 'Create AI Agent'}
        subName="Ecommerce"
      />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateAIAgentForm
                isEditMode={isEditMode}
                initialData={initialData}
                agentId={editId}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateAIAgent;

