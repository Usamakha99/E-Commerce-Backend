import { Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import Stats from './components/Stats';
import RecentProducts from './components/RecentProducts';
import RecentAIAgents from './components/RecentAIAgents';
import CategoryDistribution from './components/CategoryDistribution';

export default function Dashboard() {
  return (
    <>
      <PageBreadcrumb title="Dashboard" subName="Dashboards" />
      <PageMetaData title="Dashboard" />

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xxl={3}>
          <Stats />
        </Col>
        <Col xxl={9}>
          <CategoryDistribution />
        </Col>
      </Row>

      {/* Recent Items */}
      <Row>
        <Col lg={6}>
          <RecentProducts />
        </Col>
        <Col lg={6}>
          <RecentAIAgents />
        </Col>
      </Row>
    </>
  );
}