import agricultureRequest, { toSnakeCase } from '../utils/agricultureRequest'

const normalizeListResponse = (res) => {
  if (res.data && Array.isArray(res.data.rows)) {
    res.data.list = res.data.rows.map(item => toSnakeCase(item))
    res.data.total = res.data.total || 0
  } else if (res.rows && Array.isArray(res.rows)) {
    res.data = {
      list: res.rows.map(item => toSnakeCase(item)),
      total: res.total || 0
    }
  } else if (res.data && Array.isArray(res.data.list)) {
    res.data.list = res.data.list.map(item => toSnakeCase(item))
  }
  return res
}

export const listProductManage = (params = {}) => {
  const requestParams = {
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 10
  }

  if (params.productCode) requestParams.productCode = params.productCode
  if (params.productName) requestParams.productName = params.productName
  if (params.categoryName) requestParams.categoryName = params.categoryName
  if (params.mainCategory) requestParams.mainCategory = params.mainCategory
  if (params.subCategory) requestParams.subCategory = params.subCategory
  if (params.brand) requestParams.brand = params.brand
  if (params.status) requestParams.status = params.status
  if (params.keyword) requestParams.keyword = params.keyword
  if (params.flag !== undefined && params.flag !== null && params.flag !== '') requestParams.flag = params.flag

  return agricultureRequest({
    url: '/inventory/product-manage/list',
    method: 'get',
    params: requestParams
  }).then(normalizeListResponse)
}

export const getProductManage = (id) => {
  return agricultureRequest({
    url: `/inventory/product-manage/${id}`,
    method: 'get'
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

export const addProductManage = (data) => {
  return agricultureRequest({
    url: '/inventory/product-manage',
    method: 'post',
    data
  })
}

export const updateProductManage = (data) => {
  return agricultureRequest({
    url: '/inventory/product-manage',
    method: 'put',
    data
  })
}

export const deleteProductManage = (id) => {
  return agricultureRequest({
    url: `/inventory/product-manage/${id}`,
    method: 'delete'
  })
}

export const listProductMainCategories = () => {
  return agricultureRequest({
    url: '/inventory/product-manage/main-categories',
    method: 'get'
  }).then(res => {
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => toSnakeCase(item))
    }
    return res
  })
}
