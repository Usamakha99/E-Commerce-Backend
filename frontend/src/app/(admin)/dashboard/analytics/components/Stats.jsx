import { useEffect, useState } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { getAIAgents, getCategoriesWithCounts } from '@/http/AIAgent';
import { getProducts } from '@/http/Product';
import toast from 'react-hot-toast';

const StatCard = ({ amount, icon, variant, name, loading }) => {
  return (
    <Card>
      <CardBody>
        <Row>
          <Col xs={6}>
            <div className={`avatar-md bg-opacity-10 rounded flex-centered bg-${variant}`}>
              <IconifyIcon icon={icon} height={32} width={32} className={`text-${variant}`} />
            </div>
          </Col>
          <Col xs={6} className="text-end">
            <p className="text-muted mb-0 text-truncate">{name}</p>
            {loading ? (
              <div className="spinner-border spinner-border-sm mt-1" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <h3 className="text-dark mt-1 mb-0">{amount}</h3>
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

const Stats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalAIAgents: 0,
    aiCategories: 0,
    productCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch Products
      const productsResponse = await getProducts();
      const products = Array.isArray(productsResponse.data) 
        ? productsResponse.data 
        : productsResponse.data?.data || [];
      
      // Fetch AI Agents
      const agentsResponse = await getAIAgents({ limit: 1 });
      const agentsTotal = agentsResponse.data?.pagination?.total || agentsResponse.data?.data?.length || 0;
      
      // Fetch AI Categories
      const categoriesResponse = await getCategoriesWithCounts();
      const aiCategories = categoriesResponse.data?.data?.length || 0;
      
      // Count unique product categories
      const uniqueCategories = new Set(products.map(p => p.categoryId).filter(Boolean));
      
      setStats({
        totalProducts: products.length,
        totalAIAgents: agentsTotal,
        aiCategories: aiCategories,
        productCategories: uniqueCategories.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      icon: 'iconamoon:shopping-bag-duotone',
      name: 'Total Products',
      amount: stats.totalProducts.toLocaleString(),
      variant: 'primary'
    },
    {
      icon: 'iconamoon:robot-duotone',
      name: 'AI Agents',
      amount: stats.totalAIAgents.toLocaleString(),
      variant: 'success'
    },
    {
      icon: 'iconamoon:tag-duotone',
      name: 'Product Categories',
      amount: stats.productCategories.toLocaleString(),
      variant: 'info'
    },
    {
      icon: 'iconamoon:category-duotone',
      name: 'AI Categories',
      amount: stats.aiCategories.toLocaleString(),
      variant: 'warning'
    }
  ];

  return (
    <Row>
      {statsData.map((stat, idx) => (
        <Col md={6} xxl={12} key={idx}>
          <StatCard {...stat} loading={loading} />
        </Col>
      ))}
    </Row>
  );
};

export default Stats;
