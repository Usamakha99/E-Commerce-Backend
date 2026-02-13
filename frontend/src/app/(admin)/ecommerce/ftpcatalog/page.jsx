import { useCallback, useEffect, useState } from 'react';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import PageBreadcrumb from '@/components/layout/PageBreadcrumb';
import PageMetaData from '@/components/PageTitle';
import { getFtpProducts, enrichFtpProductDetail } from '@/http/FtpProducts';
import FtpCatalogTable from './components/FtpCatalogTable';
import FtpProductDetailModal from './components/FtpProductDetailModal';

const keyOf = (row) => `${row.vendor_name || ''}|${row.mfr_sku || row.internal_sku || ''}`;
const PER_PAGE = 50;

export default function FtpCatalogPage() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [enrichingKeys, setEnrichingKeys] = useState(() => new Set());
  const [modalShow, setModalShow] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const loadRows = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getFtpProducts({ page: pageNum, per_page: PER_PAGE });
      const list = res?.data ?? [];
      setRows(list);
      setMeta(res?.meta ?? null);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load FTP catalog:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRows(page);
  }, [loadRows, page]);

  const onEnrichRow = useCallback(async (original) => {
    const k = keyOf(original);
    setEnrichingKeys((prev) => new Set(prev).add(k));
    try {
      await enrichFtpProductDetail(original);
      await loadRows(page);
    } catch (err) {
      console.error('Enrich failed:', err);
    } finally {
      setEnrichingKeys((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
    }
  }, [loadRows, page]);

  const onViewRow = useCallback((original) => {
    setSelectedRow(original);
    setModalShow(true);
    setModalError(null);
    setModalPayload(null);
    setModalLoading(true);
    enrichFtpProductDetail(original)
      .then((payload) => {
        setModalPayload(payload);
      })
      .catch((err) => {
        setModalError(err?.message || 'Failed to load details');
      })
      .finally(() => {
        setModalLoading(false);
      });
  }, []);

  const onHideModal = useCallback(() => {
    setModalShow(false);
    setSelectedRow(null);
    setModalPayload(null);
    setModalError(null);
  }, []);

  return (
    <>
      <PageMetaData title="FTP Catalog" />
      <PageBreadcrumb title="FTP Catalog" subName="Ecommerce" />
      <Row>
        <Col>
          <Card>
            <Card.Header className="py-2">
              <small className="text-muted">Direct from FTP catalog API (no cache).</small>
            </Card.Header>
            <CardBody>
              {loading ? (
                <div className="text-center py-4 text-muted">Loading FTP catalog…</div>
              ) : (
                <>
                  <FtpCatalogTable
                    rows={rows}
                    enrichingKeys={enrichingKeys}
                    onEnrichRow={onEnrichRow}
                    onViewRow={onViewRow}
                  />
                  {meta && meta.last_page > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-muted">
                        Page {meta.current_page} of {meta.last_page} ({meta.total} total)
                      </small>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                        <Button size="sm" variant="outline-secondary" disabled={page >= meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <FtpProductDetailModal
        show={modalShow}
        onHide={onHideModal}
        loading={modalLoading}
        error={modalError}
        payload={modalPayload}
      />
    </>
  );
}
