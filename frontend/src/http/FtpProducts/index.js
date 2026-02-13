import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for FTP/cache (can be slow on first load)
})

export const getFtpProducts = async (params = {}) => {
  const res = await api.get('/api/ftpproducts', { params })
  return res.data
}

export const getCachedFtpProducts = async (params = {}) => {
  const res = await api.get('/api/ftpproducts/cache', { params })
  return res.data
}

export const syncFtpCachePage = async ({ page = 1, per_page = 200, distributor } = {}) => {
  const res = await api.post('/api/ftpproducts/cache/sync', {
    page,
    per_page,
    distributor,
  })
  return res.data
}

/** Sync all pages from FTP API into cache. max_pages=0 = no limit. */
export const syncFtpCacheAll = async ({ per_page = 200, max_pages = 0, distributor } = {}) => {
  const res = await api.post('/api/ftpproducts/cache/sync-all', {
    per_page,
    max_pages,
    distributor,
  }, { timeout: 300000 })
  return res.data
}

export const enrichFtpProductsBatch = async (items, { concurrency = 3 } = {}) => {
  const res = await api.post('/api/ftpproducts/enrich-batch', {
    items,
    concurrency,
  })
  return res.data
}

export const enrichFtpProductDetail = async (ftpItem) => {
  const res = await api.post('/api/ftpproducts/enrich', {
    ...(ftpItem || {}),
    detail: true,
  })
  return res.data
}

