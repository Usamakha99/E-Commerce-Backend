import { useState, useEffect } from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import CreateDeliveryMethodForm from './components/CreateDeliveryMethodForm';
import PageMetaData from '@/components/PageTitle';
import { getDeliveryMethod } from '@/http/DeliveryMethod';

const CreateDeliveryMethod = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditMode, setIsEditMode] = useState(!!editId);
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      const fetchMethod = async () => {
        try {
          setLoading(true);
          const response = await getDeliveryMethod(editId);
          if (response.data?.success) {
            setInitialData(response.data.data);
          } else {
            setInitialData(response.data);
          }
        } catch (error) {
          console.error('Error fetching delivery method:', error);
          navigate('/ecommerce/deliverymethods');
        } finally {
          setLoading(false);
        }
      };
      fetchMethod();
    }
  }, [editId, navigate]);

  if (loading) {
    return (
      <>
        <PageMetaData title={isEditMode ? 'Edit Delivery Method' : 'Create Delivery Method'} />
        <PageBreadcrumb
          title={isEditMode ? 'Edit Delivery Method' : 'Create Delivery Method'}
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
      <PageMetaData title={isEditMode ? 'Edit Delivery Method' : 'Create Delivery Method'} />
      <PageBreadcrumb
        title={isEditMode ? 'Edit Delivery Method' : 'Create Delivery Method'}
        subName="Ecommerce"
      />
      <Row>
        <Col>
          <Card>
            <CardBody>
              <CreateDeliveryMethodForm
                isEditMode={isEditMode}
                initialData={initialData}
                methodId={editId}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CreateDeliveryMethod;

