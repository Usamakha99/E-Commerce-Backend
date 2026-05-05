import { useState, useEffect } from 'react';
import { Col, Row, Form, Button, Table } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import toast from 'react-hot-toast';
import { updateAIAgent } from '@/http/AIAgent';
import RichTextEditor from '@/components/form/RichTextEditor';
import RichTextHtml from '@/components/form/RichTextHtml';
import { isRichTextEmpty } from '@/utils/rich-text';

const HowToBuyTabForm = ({ agent, onUpdate }) => {
  const [formData, setFormData] = useState({
    pricingContent: {
      freeTrial: {
        enabled: false,
        description: '',
        buttonText: 'Try for free',
      },
      pricing: {
        title: '',
        description: '',
        contracts: [],
      },
      refundPolicy: '',
      customPricing: {
        enabled: false,
        description: '',
        buttonText: 'Request private offer',
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newContract, setNewContract] = useState({ 
    title: '', 
    duration: '', 
    pricingRows: [] 
  });
  const [newPricingRow, setNewPricingRow] = useState({ 
    whereToBuy: '', 
    description: '', 
    cost: '' 
  });

  useEffect(() => {
    if (agent) {
      const pc = agent.pricingContent || {};
      setFormData({
        pricingContent: {
          freeTrial: pc.freeTrial || {
            enabled: agent.freeTrial || false,
            description: '',
            buttonText: 'Try for free',
          },
          pricing: pc.pricing || {
            title: '',
            description: '',
            contracts: [],
          },
          refundPolicy: pc.refundPolicy || '',
          customPricing: pc.customPricing || {
            enabled: false,
            description: '',
            buttonText: 'Request private offer',
          },
        },
      });
    }
  }, [agent]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      pricingContent: {
        ...prev.pricingContent,
        [section]: {
          ...prev.pricingContent[section],
          [field]: value,
        },
      },
    }));
  };

  const addContract = () => {
    if (newContract.title.trim()) {
      const contracts = [...(formData.pricingContent.pricing.contracts || []), {
        id: Date.now(),
        title: newContract.title.trim(),
        duration: newContract.duration.trim() || '',
        pricingRows: newContract.pricingRows || [],
      }];
      handleInputChange('pricing', 'contracts', contracts);
      setNewContract({ title: '', duration: '', pricingRows: [] });
    }
  };

  const removeContract = (contractId) => {
    const contracts = formData.pricingContent.pricing.contracts.filter(c => c.id !== contractId);
    handleInputChange('pricing', 'contracts', contracts);
  };

  const addPricingRow = (contractId) => {
    if (newPricingRow.whereToBuy.trim() && newPricingRow.cost.trim()) {
      const contracts = formData.pricingContent.pricing.contracts.map(contract => {
        if (contract.id === contractId) {
          return {
            ...contract,
            pricingRows: [...(contract.pricingRows || []), {
              id: Date.now(),
              whereToBuy: newPricingRow.whereToBuy.trim(),
              description: newPricingRow.description.trim() || '',
              cost: newPricingRow.cost.trim(),
            }],
          };
        }
        return contract;
      });
      handleInputChange('pricing', 'contracts', contracts);
      setNewPricingRow({ whereToBuy: '', description: '', cost: '' });
    }
  };

  const removePricingRow = (contractId, rowId) => {
    const contracts = formData.pricingContent.pricing.contracts.map(contract => {
      if (contract.id === contractId) {
        return {
          ...contract,
          pricingRows: contract.pricingRows.filter(r => r.id !== rowId),
        };
      }
      return contract;
    });
    handleInputChange('pricing', 'contracts', contracts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAIAgent(agent.id, { 
        pricingContent: formData.pricingContent,
        freeTrial: formData.pricingContent.freeTrial.enabled,
      });
      toast.success('Pricing information updated successfully!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast.error(error.response?.data?.error || 'Failed to update pricing');
    } finally {
      setLoading(false);
    }
  };

  // Display View (Read-only)
  if (!isEditing && agent) {
    const pc = agent.pricingContent || {};
    const pricing = pc.pricing || {};
    const contracts = pricing.contracts || [];

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Pricing</h2>
          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            <IconifyIcon icon="bx:edit" className="me-1" />
            Edit
          </Button>
        </div>

        {/* Pricing Information Section */}
        <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'white' }}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div style={{ flex: 1 }}>
              {pricing.description && !isRichTextEmpty(pricing.description) ? (
                <div style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '12px' }}>
                  <RichTextHtml html={pricing.description} />
                </div>
              ) : (
                <>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '12px' }}>
                    Pricing is based on the duration and terms of your contract with the vendor. This entitles you to a specified quantity of use for the contract duration. If you choose not to renew or replace your contract before it ends, access to these entitlements will expire.
                  </p>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: 0 }}>
                    Additional AWS infrastructure costs may apply. Use the{' '}
                    <a href="https://calculator.aws.amazon.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#007185', textDecoration: 'none' }}>
                      AWS Pricing Calculator
                    </a>
                    {' '}to estimate your infrastructure costs.
                  </p>
                </>
              )}
            </div>
            <Button
              variant="primary"
              style={{
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '600',
                marginLeft: '20px',
              }}
            >
              View purchase options
            </Button>
          </div>
        </div>

        {/* Contracts Section */}
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <div key={contract.id} className="border rounded p-4 mb-4" style={{ backgroundColor: 'white' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {contract.title}
                  {contract.pricingRows && contract.pricingRows.length > 0 && (
                    <span className="text-muted ms-2">({contract.pricingRows.length})</span>
                  )}
                </h3>
                <a href="#" style={{ fontSize: '14px', color: '#007185', textDecoration: 'none' }}>
                  Info
                </a>
              </div>

              {contract.pricingRows && contract.pricingRows.length > 0 ? (
                <Table bordered style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ backgroundColor: '#F9FAFB', fontWeight: '600', padding: '12px' }}>Where to buy</th>
                      <th style={{ backgroundColor: '#F9FAFB', fontWeight: '600', padding: '12px' }}>Description</th>
                      <th style={{ backgroundColor: '#F9FAFB', fontWeight: '600', padding: '12px' }}>Cost/{contract.duration || '12 months'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.pricingRows.map((row) => (
                      <tr key={row.id}>
                        <td style={{ padding: '12px' }}>{row.whereToBuy}</td>
                        <td style={{ padding: '12px' }}>{row.description || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            style={{
                              borderColor: '#17a2b8',
                              color: '#17a2b8',
                              borderRadius: '4px',
                              padding: '6px 16px',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#17a2b8';
                              e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#17a2b8';
                            }}
                          >
                            Request a quote
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">
                    No pricing options available at this time. Please contact the vendor for pricing information.
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'white' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>12-month contract</h3>
              <a href="#" style={{ fontSize: '14px', color: '#007185', textDecoration: 'none' }}>
                Info
              </a>
            </div>
            <div className="text-center py-4">
              <p className="text-muted mb-0">
                No pricing options available at this time. Please contact the vendor for pricing information.
              </p>
            </div>
          </div>
        )}

        {/* Vendor Refund Policy */}
        {pc.refundPolicy && !isRichTextEmpty(pc.refundPolicy) && (
          <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
              Vendor Refund Policy
            </h3>
            <div style={{ fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
              <RichTextHtml html={pc.refundPolicy} />
            </div>
          </div>
        )}

        {/* Custom Pricing Options */}
        {pc.customPricing?.enabled && (
          <div className="border rounded p-4" style={{ backgroundColor: 'white' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
              Custom Pricing Options
            </h3>
            {pc.customPricing.description && !isRichTextEmpty(pc.customPricing.description) ? (
              <div style={{ fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                <RichTextHtml html={pc.customPricing.description} />
              </div>
            ) : (
              <p style={{ fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                Request a private offer to receive a custom quote.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Edit Form View
  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Pricing</h2>
        <Button variant="outline-secondary" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>

      {/* Free Trial Section */}
      <Row>
        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Free Trial</h4>
            <div className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable Free Trial"
                checked={formData.pricingContent.freeTrial.enabled}
                onChange={(e) => handleInputChange('freeTrial', 'enabled', e.target.checked)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <RichTextEditor
                value={formData.pricingContent.freeTrial.description}
                onChange={(v) => handleInputChange('freeTrial', 'description', v)}
                placeholder="Try this product free according to the free trial terms..."
                editorMinHeight={220}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Text</label>
              <input
                type="text"
                className="form-control"
                value={formData.pricingContent.freeTrial.buttonText}
                onChange={(e) => handleInputChange('freeTrial', 'buttonText', e.target.value)}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Pricing Section */}
      <Row>
        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Pricing Information</h4>
            <div className="mb-3">
              <label className="form-label">Pricing Description (Optional - leave empty for default text)</label>
              <RichTextEditor
                value={formData.pricingContent.pricing.description}
                onChange={(v) => handleInputChange('pricing', 'description', v)}
                placeholder="Leave empty to use default pricing description..."
                editorMinHeight={270}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Contracts Management */}
      <Row>
        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Pricing Contracts</h4>
            
            <Row className="mb-3">
              <Col md={4}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contract Title (e.g., 12-month contract)"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Duration (e.g., 12 months)"
                  value={newContract.duration}
                  onChange={(e) => setNewContract({ ...newContract, duration: e.target.value })}
                />
              </Col>
              <Col md={4}>
                <Button type="button" variant="primary" onClick={addContract} className="w-100">
                  <IconifyIcon icon="bx:plus" className="me-1" />
                  Add Contract
                </Button>
              </Col>
            </Row>

            {formData.pricingContent.pricing.contracts?.map((contract) => (
              <div key={contract.id} className="border rounded p-3 mb-3 bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ margin: 0 }}>{contract.title}</h5>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeContract(contract.id)}
                  >
                    <IconifyIcon icon="bx:trash" />
                  </Button>
                </div>

                <Row className="mb-2">
                  <Col md={4}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Where to buy"
                      value={newPricingRow.whereToBuy}
                      onChange={(e) => setNewPricingRow({ ...newPricingRow, whereToBuy: e.target.value })}
                    />
                  </Col>
                  <Col md={4}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Description"
                      value={newPricingRow.description}
                      onChange={(e) => setNewPricingRow({ ...newPricingRow, description: e.target.value })}
                    />
                  </Col>
                  <Col md={3}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Cost (e.g., $1,000)"
                      value={newPricingRow.cost}
                      onChange={(e) => setNewPricingRow({ ...newPricingRow, cost: e.target.value })}
                    />
                  </Col>
                  <Col md={1}>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => addPricingRow(contract.id)}
                      className="w-100"
                    >
                      <IconifyIcon icon="bx:plus" />
                    </Button>
                  </Col>
                </Row>

                {contract.pricingRows && contract.pricingRows.length > 0 && (
                  <Table bordered size="sm">
                    <thead>
                      <tr>
                        <th>Where to buy</th>
                        <th>Description</th>
                        <th>Cost</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.pricingRows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.whereToBuy}</td>
                          <td>{row.description || '-'}</td>
                          <td>{row.cost}</td>
                          <td>
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removePricingRow(contract.id, row.id)}
                            >
                              <IconifyIcon icon="bx:trash" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            ))}
          </div>
        </Col>
      </Row>

      {/* Refund Policy */}
      <Row>
        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Vendor Refund Policy</h4>
            <div className="mb-3">
              <label className="form-label">Refund Policy Text</label>
              <RichTextEditor
                value={formData.pricingContent.refundPolicy}
                onChange={(v) => setFormData(prev => ({
                  ...prev,
                  pricingContent: {
                    ...prev.pricingContent,
                    refundPolicy: v,
                  },
                }))}
                placeholder="All orders are non-cancellable and all fees..."
                editorMinHeight={270}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Custom Pricing */}
      <Row>
        <Col lg={12} className="mb-4">
          <div className="border rounded p-4">
            <h4 className="mb-3">Custom Pricing Options</h4>
            <div className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable Custom Pricing"
                checked={formData.pricingContent.customPricing.enabled}
                onChange={(e) => handleInputChange('customPricing', 'enabled', e.target.checked)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <RichTextEditor
                value={formData.pricingContent.customPricing.description}
                onChange={(v) => handleInputChange('customPricing', 'description', v)}
                placeholder="Request a private offer to receive a custom quote."
                editorMinHeight={220}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Button Text</label>
              <input
                type="text"
                className="form-control"
                value={formData.pricingContent.customPricing.buttonText}
                onChange={(e) => handleInputChange('customPricing', 'buttonText', e.target.value)}
              />
            </div>
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button type="submit" variant="success" disabled={loading}>
          {loading ? 'Saving...' : 'Save Pricing'}
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </Button>
      </div>
    </form>
  );
};

export default HowToBuyTabForm;

