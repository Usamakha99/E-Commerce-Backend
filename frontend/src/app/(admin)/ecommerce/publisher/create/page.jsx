import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreatePublisherForm from './components/CreatePublisherForm';
import PageMetaData from '@/components/PageTitle';
import { getPublisher } from '@/http/Publisher';

const CreatePublisher = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const fetchPublisher = async () => {
        try {
          setLoading(true);
          const response = await getPublisher(editId);
          if (response.data?.success) {
            setInitialData(response.data.data);
          } else {
            setInitialData(response.data);
          }
        } catch (error) {
          console.error('Error fetching publisher:', error);
          navigate('/ecommerce/publishers');
        } finally {
          setLoading(false);
        }
      };
      fetchPublisher();
    }
  }, [editId, navigate]);

  if (loading) {
    return (
      <>
        <PageMetaData title={isEditMode ? 'Edit Publisher' : 'Create Publisher'} />
        <PageBreadcrumb
          title={isEditMode ? 'Edit Publisher' : 'Create Publisher'}
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
      <PageMetaData title={isEditMode ? 'Edit Publisher' : 'Create Publisher'} />
      <PageBreadcrumb
        title={isEditMode ? 'Edit Publisher' : 'Create Publisher'}
        subName="Ecommerce"
      />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreatePublisherForm
                isEditMode={isEditMode}
                initialData={initialData}
                publisherId={editId}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreatePublisher;

