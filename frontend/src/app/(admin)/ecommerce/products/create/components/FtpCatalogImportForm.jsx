// Import products from FTP catalog: use internal_sku/mfr_sku + brand from FTP, fetch data from Icecat (no file upload).
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, Alert, Button, Spinner, Table, Form } from 'react-bootstrap';
import { getFtpProducts, syncFtpCacheAll } from '@/http/FtpProducts';
import { importProductsFromExcel } from '@/http/Product';

const PER_PAGE = 50;

export default function FtpCatalogImportForm({ onProductsImported }) {
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [syncing, setSyncing] = useState(false);

  const loadPage = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoadingList(true);
    try {
      const res = await getFtpProducts({
        page: pageNum,
        per_page: PER_PAGE,
        ...(searchTerm ? { search: searchTerm } : {}),
      });
      const list = res?.data ?? [];
      const metaInfo = res?.meta ?? null;
      setRows(list);
      setMeta(metaInfo);
      setPage(pageNum);
      setSelectedIds(new Set());
    } catch (err) {
      console.error('FTP catalog load error:', err);
      setError(err?.message || 'Failed to load FTP catalog');
      setRows([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1, search);
  }, []);

  const keyOf = (row) => `${row.vendor_name || ''}|${row.mfr_sku || row.internal_sku || ''}`;

  const toggleOne = (row) => {
    const k = keyOf(row);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const togglePage = () => {
    const allKeys = rows.map(keyOf);
    const allSelected = allKeys.every((k) => selectedIds.has(k));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) allKeys.forEach((k) => next.delete(k));
      else allKeys.forEach((k) => next.add(k));
      return next;
    });
  };

  const handleImportSelected = async () => {
    const selectedRows = rows.filter((row) => selectedIds.has(keyOf(row)));
    if (selectedRows.length === 0) {
      setError('Please select at least one product from the list.');
      return;
    }

    const products = selectedRows.map((row) => ({
      productCode: (row.mfr_sku || row.internal_sku || '').trim(),
      brand: (row.vendor_name || row.brand || '').trim(),
      price: row.msrp ? parseFloat(row.msrp) : 0,
      quantity: row.stock ? parseInt(row.stock, 10) : 0,
      weight: row.weight != null ? parseFloat(row.weight) : undefined,
      dimensions: row.dimensions ? String(row.dimensions).trim() || undefined : undefined,
    }));

    const valid = products.filter((p) => p.productCode && p.brand);
    if (valid.length === 0) {
      setError('Selected rows must have SKU (mfr_sku/internal_sku) and Brand (vendor_name).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await importProductsFromExcel({ products: valid });
      if (response.success) {
        setSuccess(
          `Import started for ${valid.length} products. Job ID: ${response.jobId}. Icecat data will be fetched for each.`
        );
        setSelectedIds(new Set());
        if (onProductsImported) onProductsImported(response.jobId);
      } else {
        setError(response.error || 'Import failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadPage(1, search);
  };

  const handleSyncFullCatalog = async () => {
    setSyncing(true);
    setError('');
    try {
      const result = await syncFtpCacheAll({ per_page: 200, max_pages: 0 });
      setSuccess(
        `Cache synced: ${result.upserted ?? result.fetched ?? 0} products. You can now browse all pages.`
      );
      loadPage(1, search);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Full sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Import from FTP Catalog</h5>
        <small className="text-muted">
          Direct from FTP catalog API (no cache). Use SKU and Brand; data is fetched from Icecat on import.
        </small>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          <Form onSubmit={handleSearch} className="d-flex gap-2">
            <Form.Control
              type="search"
              placeholder="Search SKU, brand, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 260 }}
            />
            <Button type="submit" variant="outline-secondary">Search</Button>
          </Form>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleSyncFullCatalog}
            disabled={syncing || loadingList}
            title="Optional: fill local cache from FTP API (for other flows). List above is always direct from API."
          >
            {syncing ? <><Spinner size="sm" className="me-1" /> Syncing…</> : 'Fill cache (optional)'}
          </Button>
          <Button
            variant="primary"
            onClick={handleImportSelected}
            disabled={loading || selectedIds.size === 0}
          >
            {loading ? <><Spinner size="sm" className="me-1" /> Importing…</> : `Import selected (${selectedIds.size})`}
          </Button>
        </div>

        {loadingList ? (
          <div className="text-center py-4 text-muted">
            <Spinner className="me-2" /> Loading FTP catalog…
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table bordered hover size="sm">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>
                      <Form.Check
                        type="checkbox"
                        checked={rows.length > 0 && rows.every((r) => selectedIds.has(keyOf(r)))}
                        onChange={togglePage}
                        aria-label="Select page"
                      />
                    </th>
                    <th>SKU (mfr / internal)</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th className="text-muted">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No FTP products found. Check FTP API credentials or try another page/search.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const k = keyOf(row);
                      const sku = row.mfr_sku || row.internal_sku || '—';
                      return (
                        <tr key={k}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedIds.has(k)}
                              onChange={() => toggleOne(row)}
                              aria-label={`Select ${sku}`}
                            />
                          </td>
                          <td>{sku}</td>
                          <td>{row.vendor_name || row.brand || '—'}</td>
                          <td>{row.category || row.sub_category || '—'}</td>
                          <td className="text-muted small" style={{ maxWidth: 280 }}>
                            {row.description ? String(row.description).slice(0, 80) + (row.description.length > 80 ? '…' : '') : '—'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
            {meta && (meta.total > PER_PAGE) && (
              <div className="d-flex justify-content-between align-items-center mt-2">
                <small className="text-muted">
                  Page {meta.current_page} of {meta.last_page} ({meta.total} total)
                </small>
                <div className="d-flex gap-1">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={page <= 1}
                    onClick={() => loadPage(page - 1, search)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={page >= meta.last_page}
                    onClick={() => loadPage(page + 1, search)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
}
