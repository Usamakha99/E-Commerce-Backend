import { useEffect, useState } from 'react';
import { Card, CardBody, Col, Row, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAICategories } from '@/http/AICategory';
import AICategoriesListTable from './components/AICategoriesListTable';
import toast from 'react-hot-toast';

const AICategories = () => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await getAICategories(params);
      if (response.data?.success) {
        setCategoriesList(response.data.data || []);
      } else {
        setCategoriesList(response.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching AI categories:', error);
      toast.error('Failed to fetch AI categories');
      setCategoriesList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories();
  };

  const handleDelete = () => {
    fetchCategories();
  };

  return (
    <>
      <PageMetaData title="AI Categories List" />
      <PageBreadcrumb title="AI Categories List" subName="Ecommerce" />
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
                      placeholder="Search Categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>
                <Link to="/ecommerce/aicategories/create">
                  <Button variant="primary" className="d-flex align-items-center gap-2">
                    <IconifyIcon icon="bx:plus" className="fs-18" />
                    Add Category
                  </Button>
                </Link>
              </div>

              <AICategoriesListTable
                categories={categoriesList}
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

export default AICategories;

