// src/components/ProductsListTable.jsx
import { useEffect, useState, useCallback } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import ReactTable from '@/components/Table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { currency } from '@/context/constants'
import { getProducts } from '@/http/Product'
import { getStockStatus } from '@/utils/other'

const DEFAULT_PAGE_SIZE = 20
const PAGE_SIZE_OPTIONS = [20, 50, 100]

const ProductsListTable = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE)
  const [pagination, setPagination] = useState({ total: 0, pages: 1 })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getProducts({ page, limit, sort: 'latest' })
      const list = Array.isArray(result?.data) ? result.data : []
      setProducts(list)
      if (result?.pagination) {
        setPagination({
          total: result.pagination.total ?? 0,
          pages: result.pagination.pages ?? 1,
        })
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) setPage(newPage)
  }

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value)
    if (PAGE_SIZE_OPTIONS.includes(newSize)) {
      setLimit(newSize)
      setPage(1)
    }
  }

  const columns = [
    {
      header: 'Product Name',
      cell: ({
        row: {
          original: { id, title, shortDescp, mainImage },
        },
      }) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <Link to={`/ecommerce/products/${id}`}>
              <img src={`http://localhost:5000/uploads/products/${mainImage}`} alt={title} className="img-fluid avatar-sm" />
            </Link>
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/products/${id}`} className="text-reset">
                {title}
              </Link>
            </h5>
            <span className="fs-13 text-muted">{shortDescp}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: ({ row: { original } }) => original.category?.title || '-',
    },
    {
      header: 'Price',
      cell: ({ row: { original } }) => currency + (original.price || '0.00'),
    },
    {
      header: 'Inventory',
      cell: ({
        row: {
          original: { quantity },
        },
      }) => {
        const stockStatus = getStockStatus(quantity)
        return (
          <div className={'text-' + stockStatus.variant}>
            <IconifyIcon icon="bxs:circle" className={clsx('me-1', 'text-' + stockStatus.variant)} />
            {stockStatus.text}
          </div>
        )
      },
    },
    {
      header: 'Action',
      cell: ({ row: { original } }) => (
        <>
          <Link
            to={`/ecommerce/products/${original.id}`}
            className="btn btn-sm btn-soft-info"
          >
            <IconifyIcon icon="bx:show" className="fs-18" />
          </Link>
        </>
      ),
    },
  ]

  const from = pagination.total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, pagination.total)

  return (
    <>
      <ReactTable
        columns={columns}
        data={products}
        pageSize={limit}
        rowsPerPageList={PAGE_SIZE_OPTIONS}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination={false}
        loading={loading}
      />
      {!loading && pagination.total > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 p-3 border-top">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted text-nowrap">
              Showing <span className="fw-semibold">{from}</span> to <span className="fw-semibold">{to}</span> of <span className="fw-semibold">{pagination.total}</span>
            </span>
            <label htmlFor="products-page-size" className="text-muted text-nowrap">Per page:</label>
            <select
              id="products-page-size"
              className="form-select form-select-sm w-auto"
              value={limit}
              onChange={handlePageSizeChange}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <ul className="pagination pagination-rounded m-0">
            <li className="page-item">
              <button
                type="button"
                className="page-link"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <IconifyIcon icon="bx:left-arrow-alt" height={18} width={18} />
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                Page {page} of {pagination.pages || 1}
              </span>
            </li>
            <li className="page-item">
              <button
                type="button"
                className="page-link"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pages}
              >
                <IconifyIcon icon="bx:right-arrow-alt" height={18} width={18} />
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  )
}

export default ProductsListTable


//.... tomorrw check this
