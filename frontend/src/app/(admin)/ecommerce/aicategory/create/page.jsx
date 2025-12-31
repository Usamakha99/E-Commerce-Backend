import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateAICategoryForm from './components/CreateAICategoryForm';
import PageMetaData from '@/components/PageTitle';
import { getAICategory } from '@/http/AICategory';

const CreateAICategory = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const response = await getAICategory(editId);
          if (response.data?.success) {
            setInitialData(response.data.data);
          } else {
            setInitialData(response.data);
          }
        } catch (error) {
          console.error('Error fetching AI category:', error);
          navigate('/ecommerce/aicategories');
        } finally {
          setLoading(false);
        }
      };
      fetchCategory();
    }
  }, [editId, navigate]);

  if (loading) {
    return (
      <>
        <PageMetaData title={isEditMode ? 'Edit AI Category' : 'Create AI Category'} />
        <PageBreadcrumb
          title={isEditMode ? 'Edit AI Category' : 'Create AI Category'}
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
      <PageMetaData title={isEditMode ? 'Edit AI Category' : 'Create AI Category'} />
      <PageBreadcrumb
        title={isEditMode ? 'Edit AI Category' : 'Create AI Category'}
        subName="Ecommerce"
      />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateAICategoryForm
                isEditMode={isEditMode}
                initialData={initialData}
                categoryId={editId}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateAICategory;

