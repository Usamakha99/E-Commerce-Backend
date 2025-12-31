import React, { useState, useEffect } from 'react';
import { Col, Row, Form, Button, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';

const ProductComparisonTabForm = ({ agent, onUpdate }) => {
  const [formData, setFormData] = useState({
    productComparisonContent: {
      updatedWeekly: true,
      products: [],
      comparisonData: [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', provider: '', icon: '', iconColor: '#000000' });
  const [newComparisonRow, setNewComparisonRow] = useState({ 
    category: '', 
    feature: '', 
    values: {} 
  });

  useEffect(() => {
    if (agent) {
      const pc = agent.productComparisonContent || {};
      setFormData({
        productComparisonContent: {
          updatedWeekly: pc.updatedWeekly !== undefined ? pc.updatedWeekly : true,
          products: pc.products || [],
          comparisonData: pc.comparisonData || [],
        },
      });
    }
  }, [agent]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      productComparisonContent: {
        ...prev.productComparisonContent,
        [field]: value,
      },
    }));
  };

  const addProduct = () => {
    if (newProduct.name.trim()) {
      const products = [...(formData.productComparisonContent.products || []), {
        id: Date.now(),
        name: newProduct.name.trim(),
        provider: newProduct.provider.trim() || '',
        icon: newProduct.icon.trim() || newProduct.name.substring(0, 2).toUpperCase(),
        iconColor: newProduct.iconColor || '#000000',
      }];
      handleInputChange('products', products);
      setNewProduct({ name: '', provider: '', icon: '', iconColor: '#000000' });
    }
  };

  const removeProduct = (productId) => {
    const products = formData.productComparisonContent.products.filter(p => p.id !== productId);
    handleInputChange('products', products);
    // Also remove comparison data for this product
    const updatedComparisonData = formData.productComparisonContent.comparisonData.map(row => {
      const newValues = { ...row.values };
      delete newValues[`product_${productId}`];
      return { ...row, values: newValues };
    });
    handleInputChange('comparisonData', updatedComparisonData);
  };

  const addComparisonRow = () => {
    if (newComparisonRow.category.trim() && newComparisonRow.feature.trim()) {
      const row = {
        id: Date.now(),
        category: newComparisonRow.category.trim(),
        feature: newComparisonRow.feature.trim(),
        values: newComparisonRow.values || {},
      };
      const comparisonData = [...(formData.productComparisonContent.comparisonData || []), row];
      handleInputChange('comparisonData', comparisonData);
      setNewComparisonRow({ category: '', feature: '', values: {} });
    }
  };

  const removeComparisonRow = (rowId) => {
    const comparisonData = formData.productComparisonContent.comparisonData.filter(r => r.id !== rowId);
    handleInputChange('comparisonData', comparisonData);
  };

  const updateComparisonValue = (rowId, productId, value) => {
    const comparisonData = formData.productComparisonContent.comparisonData.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          values: {
            ...row.values,
            [`product_${productId}`]: value,
          },
        };
      }
      return row;
    });
    handleInputChange('comparisonData', comparisonData);
  };

  // Get sentiment color
  const getSentimentColor = (sentiment) => {
    if (!sentiment) return '#ddd';
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return '#10b981';
    if (s.includes('mixed')) return '#f59e0b';
    if (s.includes('negative')) return '#ef4444';
    return '#ddd';
  };

  // Get sentiment percentage (for progress bar)
  const getSentimentPercentage = (sentiment) => {
    if (!sentiment) return 0;
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return 85;
    if (s.includes('mixed')) return 50;
    if (s.includes('negative')) return 20;
    return 0;
  };

  // Group comparison data by category
  const groupedComparisonData = () => {
    const grouped = {};
    formData.productComparisonContent.comparisonData.forEach(row => {
      if (!grouped[row.category]) {
        grouped[row.category] = [];
      }
      grouped[row.category].push(row);
    });
    return grouped;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAIAgent(agent.id, { productComparisonContent: formData.productComparisonContent });
      toast.success('Product comparison updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating product comparison:', error);
      toast.error(error.response?.data?.error || 'Failed to update product comparison');
    } finally {
      setLoading(false);
    }
  };

  // Check if comparison data exists
  const hasComparisonData = () => {
    const pc = agent?.productComparisonContent || {};
    return (
      (pc.products && pc.products.length > 0) ||
      (pc.comparisonData && pc.comparisonData.length > 0)
    );
  };

  // Display View (Read-only)
  if (!isEditing && agent) {
    const pc = agent.productComparisonContent || {};
    const products = pc.products || [];
    const comparisonData = pc.comparisonData || [];
    const grouped = groupedComparisonData();

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-0">Product comparison</h2>
            {pc.updatedWeekly && (
              <p className="text-muted mb-0" style={{ fontSize: '13px', marginTop: '4px' }}>
                Updated weekly
              </p>
            )}
          </div>
          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </Button>
        </div>

        {!hasComparisonData() ? (
          <div className="text-center py-5">
            <p className="text-muted mb-0">Product comparison data is not available at this time.</p>
          </div>
        ) : (
          <div className="border rounded" style={{ backgroundColor: 'white', overflowX: 'auto' }}>
            <div style={{ padding: '20px', minWidth: '800px' }}>
              <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
                Compare this product with similar alternatives.
              </p>

              {products.length === 0 ? (
                <p className="text-muted">No products to compare.</p>
              ) : (
                <Table responsive bordered style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        backgroundColor: '#F9FAFB', 
                        fontWeight: '600',
                        padding: '12px',
                        border: '1px solid #D5D9D9'
                      }}></th>
                      {/* Current Product */}
                      <th style={{ 
                        backgroundColor: '#F9FAFB', 
                        fontWeight: '600',
                        padding: '12px',
                        textAlign: 'center',
                        border: '1px solid #D5D9D9'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#111A45',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {agent.name?.substring(0, 2).toUpperCase() || 'AI'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{agent.name}</div>
                            {agent.provider && (
                              <div style={{ fontSize: '12px', color: '#666' }}>by {agent.provider}</div>
                            )}
                          </div>
                        </div>
                      </th>
                      {/* Competitor Products */}
                      {products.map((product) => (
                        <th key={product.id} style={{ 
                          backgroundColor: '#F9FAFB', 
                          fontWeight: '600',
                          padding: '12px',
                          textAlign: 'center',
                          border: '1px solid #D5D9D9'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: product.iconColor || '#000000',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '14px'
                            }}>
                              {product.icon || product.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>{product.name}</div>
                              {product.provider && (
                                <div style={{ fontSize: '12px', color: '#666' }}>by {product.provider}</div>
                              )}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(grouped).map(([category, rows]) => (
                      <React.Fragment key={category}>
                        <tr>
                          <td colSpan={products.length + 2} style={{
                            backgroundColor: '#F3F4F6',
                            fontWeight: '600',
                            padding: '10px 12px',
                            border: '1px solid #D5D9D9'
                          }}>
                            {category}
                          </td>
                        </tr>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td style={{ 
                              padding: '12px',
                              border: '1px solid #D5D9D9',
                              fontWeight: '500'
                            }}>
                              {row.feature}
                            </td>
                            {/* Current Product Value */}
                            <td style={{ 
                              padding: '12px',
                              border: '1px solid #D5D9D9',
                              textAlign: 'center'
                            }}>
                              {row.values?.thisProduct ? (
                                <div>
                                  <div style={{ marginBottom: '4px' }}>{row.values.thisProduct}</div>
                                  {row.values.thisProduct.toLowerCase().includes('positive') || 
                                   row.values.thisProduct.toLowerCase().includes('mixed') || 
                                   row.values.thisProduct.toLowerCase().includes('negative') ? (
                                    <div style={{
                                      width: '100%',
                                      height: '8px',
                                      backgroundColor: '#E5E7EB',
                                      borderRadius: '4px',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{
                                        width: `${getSentimentPercentage(row.values.thisProduct)}%`,
                                        height: '100%',
                                        backgroundColor: getSentimentColor(row.values.thisProduct),
                                        transition: 'width 0.3s'
                                      }}></div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            {/* Competitor Products Values */}
                            {products.map((product) => (
                              <td key={product.id} style={{ 
                                padding: '12px',
                                border: '1px solid #D5D9D9',
                                textAlign: 'center'
                              }}>
                                {row.values[`product_${product.id}`] ? (
                                  <div>
                                    <div style={{ marginBottom: '4px' }}>{row.values[`product_${product.id}`]}</div>
                                    {row.values[`product_${product.id}`].toLowerCase().includes('positive') || 
                                     row.values[`product_${product.id}`].toLowerCase().includes('mixed') || 
                                     row.values[`product_${product.id}`].toLowerCase().includes('negative') ? (
                                      <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#E5E7EB',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                      }}>
                                        <div style={{
                                          width: `${getSentimentPercentage(row.values[`product_${product.id}`])}%`,
                                          height: '100%',
                                          backgroundColor: getSentimentColor(row.values[`product_${product.id}`]),
                                          transition: 'width 0.3s'
                                        }}></div>
                                      </div>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Edit Form View
  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Product comparison</h2>
          <Form.Check
            type="checkbox"
            label="Updated weekly"
            checked={formData.productComparisonContent.updatedWeekly}
            onChange={(e) => handleInputChange('updatedWeekly', e.target.checked)}
            className="mt-2"
          />
        </div>
        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>

      {/* Products Management */}
      <Row className="mb-4">
        <Col lg={12}>
          <div className="border rounded p-4">
            <h4 className="mb-3">Competitor Products</h4>
            
            <Row className="mb-3">
              <Col md={3}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Provider/Company"
                  value={newProduct.provider}
                  onChange={(e) => setNewProduct({ ...newProduct, provider: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Icon (e.g., OK)"
                  value={newProduct.icon}
                  onChange={(e) => setNewProduct({ ...newProduct, icon: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <input
                  type="color"
                  className="form-control"
                  value={newProduct.iconColor}
                  onChange={(e) => setNewProduct({ ...newProduct, iconColor: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Button type="button" variant="primary" onClick={addProduct} className="w-100">
                  <IconifyIcon icon="bx:plus" />
                </Button>
              </Col>
            </Row>

            <div className="border rounded p-3" style={{ minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}>
              {formData.productComparisonContent.products?.length === 0 ? (
                <p className="text-muted mb-0">No competitor products added</p>
              ) : (
                formData.productComparisonContent.products.map((product) => (
                  <div key={product.id} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: product.iconColor || '#000000',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}>
                        {product.icon || product.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <strong>{product.name}</strong>
                        {product.provider && <span className="text-muted ms-2">by {product.provider}</span>}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      <IconifyIcon icon="bx:trash" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Comparison Data Management */}
      <Row className="mb-4">
        <Col lg={12}>
          <div className="border rounded p-4">
            <h4 className="mb-3">Comparison Criteria</h4>
            
            <Row className="mb-3">
              <Col md={3}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category (e.g., Accolades)"
                  value={newComparisonRow.category}
                  onChange={(e) => setNewComparisonRow({ ...newComparisonRow, category: e.target.value })}
                />
              </Col>
              <Col md={3}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Feature (e.g., Reviews)"
                  value={newComparisonRow.feature}
                  onChange={(e) => setNewComparisonRow({ ...newComparisonRow, feature: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="This Product Value (e.g., 500 reviews)"
                  onChange={(e) => {
                    const values = { ...newComparisonRow.values, thisProduct: e.target.value };
                    setNewComparisonRow({ ...newComparisonRow, values });
                  }}
                />
              </Col>
              <Col md={2}>
                <Button type="button" variant="primary" onClick={addComparisonRow} className="w-100">
                  <IconifyIcon icon="bx:plus" />
                </Button>
              </Col>
            </Row>

            <div className="border rounded p-3" style={{ minHeight: '100px', maxHeight: '300px', overflowY: 'auto' }}>
              {formData.productComparisonContent.comparisonData?.length === 0 ? (
                <p className="text-muted mb-0">No comparison criteria added</p>
              ) : (
                formData.productComparisonContent.comparisonData.map((row) => (
                  <div key={row.id} className="mb-3 p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{row.category}</strong> - {row.feature}
                      </div>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeComparisonRow(row.id)}
                      >
                        <IconifyIcon icon="bx:trash" />
                      </Button>
                    </div>
                    <Row>
                      <Col md={4}>
                        <label className="form-label small">This Product</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={row.values?.thisProduct || ''}
                          onChange={(e) => updateComparisonValue(row.id, 'thisProduct', e.target.value)}
                          placeholder="Value for this product"
                        />
                      </Col>
                      {formData.productComparisonContent.products?.map((product) => (
                        <Col md={4} key={product.id}>
                          <label className="form-label small">{product.name}</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.values[`product_${product.id}`] || ''}
                            onChange={(e) => updateComparisonValue(row.id, product.id, e.target.value)}
                            placeholder={`Value for ${product.name}`}
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" variant="success" disabled={loading}>
          {loading ? 'Saving...' : 'Save Product Comparison'}
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </Button>
      </div>
    </form>
  );
};

export default ProductComparisonTabForm;

