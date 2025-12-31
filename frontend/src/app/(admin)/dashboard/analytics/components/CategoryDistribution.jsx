import { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, ProgressBar } from 'react-bootstrap';
import { getCategoriesWithCounts } from '@/http/AIAgent';
import toast from 'react-hot-toast';

const CategoryDistribution = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategoriesWithCounts();
      const categoriesData = response.data?.data || [];
      
      // Sort by count and take top 5
      const topCategories = categoriesData
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 5);
      
      setCategories(topCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const maxCount = categories.length > 0 ? Math.max(...categories.map(c => c.count || 0)) : 1;

  return (
    <Card>
      <CardBody>
        <CardTitle className="mb-3">Top AI Agent Categories</CardTitle>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No categories found</p>
          </div>
        ) : (
          <div>
            {categories.map((category, index) => (
              <div key={category.id || index} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-semibold">{category.name}</span>
                  <span className="text-muted">{category.count || 0} agents</span>
                </div>
                <ProgressBar
                  now={((category.count || 0) / maxCount) * 100}
                  variant={index % 2 === 0 ? 'primary' : 'success'}
                  style={{ height: '8px' }}
                />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default CategoryDistribution;

