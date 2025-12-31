import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateProductTagForm from './components/CreateProductTagForm';
import PageMetaData from '@/components/PageTitle';
import { getProductTag } from '@/http/ProductTag';

const CreateProductTag = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const fetchTag = async () => {
        try {
          setLoading(true);
          const response = await getProductTag(editId);
          setInitialData(response.data);
        } catch (error) {
          console.error('Error fetching product tag:', error);
          navigate('/ecommerce/producttags');
        } finally {
          setLoading(false);
        }
      };
      fetchTag();
    }
  }, [editId, navigate]);

  if (loading) {
    return (
      <>
        <PageMetaData title={isEditMode ? 'Edit Product Tag' : 'Create Product Tag'} />
        <PageBreadcrumb
          title={isEditMode ? 'Edit Product Tag' : 'Create Product Tag'}
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
      <PageMetaData title={isEditMode ? 'Edit Product Tag' : 'Create Product Tag'} />
      <PageBreadcrumb
        title={isEditMode ? 'Edit Product Tag' : 'Create Product Tag'}
        subName="Ecommerce"
      />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateProductTagForm
                isEditMode={isEditMode}
                initialData={initialData}
                tagId={editId}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateProductTag;

