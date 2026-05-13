import agricultureRequest from '../utils/agricultureRequest'

/**
 * 投入品流通管理 API
 * Input Circulation Management API
 */

// ==================== 投入品配额查看 ====================

/**
 * 获取投入品配额列表
 * Get input quota list
 */
export const getInputQuotaList = (params) => {
  return agricultureRequest({
    url: '/invested/quota/list',
    method: 'get',
    params
  })
}

/**
 * 获取投入品配额详情
 * Get input quota detail
 */
export const getInputQuotaDetail = (id) => {
  return agricultureRequest({
    url: `/invested/quota/detail/${id}`,
    method: 'get'
  })
}

// ==================== OSE分发种子到Union ====================

/**
 * 获取OSE分发单列表
 * Get OSE release list
 */
export const getOseReleaseList = (params) => {
  return agricultureRequest({
    url: '/invested/release/ose/list',
    method: 'get',
    params
  })
}

/**
 * 新增OSE分发单
 * Add OSE release
 */
export const addOseRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/ose/add',
    method: 'post',
    data
  })
}

/**
 * 编辑OSE分发单
 * Edit OSE release
 */
export const editOseRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/ose/edit',
    method: 'put',
    data
  })
}

/**
 * 获取OSE分发单详情
 * Get OSE release detail
 */
export const getOseReleaseDetail = (id, flag) => {
  return agricultureRequest({
    url: `/invested/release/ose/detail/${id}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

/**
 * 根据releaseId获取OSE分发单详情
 * Get OSE release detail by releaseId
 */
export const getOseReleaseDetailByReleaseId = (releaseId, flag) => {
  return agricultureRequest({
    url: `/invested/release/ose/detailByReleaseId/${releaseId}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

/**
 * 删除OSE分发单
 * Delete OSE release
 */
export const deleteOseRelease = (ids, flag) => {
  return agricultureRequest({
    url: `/invested/release/ose/delete/${ids}`,
    method: 'delete',
    params: flag === undefined ? undefined : { flag }
  })
}

/**
 * 获取分发单出入库状态
 * Get release stock status
 * @param {string} releaseIds - 逗号分隔的分发单ID列表
 */
export const getReleaseStockStatus = (releaseIds, flag) => {
  return agricultureRequest({
    url: '/invested/release/ose/stockStatus',
    method: 'get',
    params: {
      releaseIds,
      ...(flag === undefined ? {} : { flag })
    }
  })
}

export const getBoaZoneReleaseList = (params) => {
  return agricultureRequest({
    url: '/invested/release/boa-zone/list',
    method: 'get',
    params
  })
}

export const addBoaZoneRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/boa-zone/add',
    method: 'post',
    data
  })
}

export const editBoaZoneRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/boa-zone/edit',
    method: 'put',
    data
  })
}

export const getBoaZoneReleaseDetail = (id) => {
  return agricultureRequest({
    url: `/invested/release/boa-zone/detail/${id}`,
    method: 'get'
  })
}

export const getBoaZoneReleaseDetailByReleaseId = (releaseId, flag) => {
  return agricultureRequest({
    url: `/invested/release/boa-zone/detailByReleaseId/${releaseId}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

export const deleteBoaZoneRelease = (ids, flag) => {
  return agricultureRequest({
    url: `/invested/release/boa-zone/delete/${ids}`,
    method: 'delete',
    params: flag === undefined ? undefined : { flag }
  })
}

export const getBoaZoneReleaseStockStatus = (releaseIds, flag) => {
  return agricultureRequest({
    url: '/invested/release/boa-zone/stockStatus',
    method: 'get',
    params: {
      releaseIds,
      ...(flag === undefined ? {} : { flag })
    }
  })
}

/**
 * 获取可用库存（仓库库存 - 未入库分发单数量）
 * Get available stock (warehouse stock - pending release quantity)
 * @param {string} inputType - 投入品类型
 * @param {string} inputCategory - 投入品类别（可选）
 * @param {string} organCode - 组织编码
 */
export const getAvailableStock = (inputType, inputCategory, organCode) => {
  return agricultureRequest({
    url: '/invested/release/ose/availableStock',
    method: 'get',
    params: { inputType, inputCategory, organCode }
  })
}

export const getDeptCategoryStock = (deptId, mainCategory, subCategory, productName, flag) => {
  const params = { dept_id: deptId }
  if (mainCategory) params.main_category = mainCategory
  if (subCategory) params.sub_category = subCategory
  if (productName) {
    params.productName = productName
    params.product_name = productName
  }
  if (flag !== undefined) params.flag = flag
  return agricultureRequest({
    url: '/inventory/warehouse-manage/list-by-dept',
    method: 'get',
    params
  })
}

// ==================== Union接收确认 ====================

/**
 * 获取Union接收确认列表
 * Get Union receive list
 */
export const getUnionReceiveList = (params) => {
  return agricultureRequest({
    url: '/invested/receive/union/list',
    method: 'get',
    params
  })
}

/**
 * Union确认接收
 * Confirm Union receive
 */
export const confirmUnionReceive = (id, data) => {
  return agricultureRequest({
    url: `/invested/receive/union/confirm/${id}`,
    method: 'put',
    data
  })
}

/**
 * 获取Union接收详情
 * Get Union receive detail
 */
export const getUnionReceiveDetail = (id) => {
  return agricultureRequest({
    url: `/invested/receive/union/detail/${id}`,
    method: 'get'
  })
}

// ==================== Union分发投入品到Woreda ====================

/**
 * 获取Union分发单列表
 * Get Union release list
 */
export const getUnionReleaseList = (params) => {
  return agricultureRequest({
    url: '/invested/release/union/list',
    method: 'get',
    params
  })
}

/**
 * 新增Union分发单
 * Add Union release
 */
export const addUnionRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/union/add',
    method: 'post',
    data
  })
}

/**
 * 编辑Union分发单
 * Edit Union release
 */
export const editUnionRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/union/edit',
    method: 'post',
    data
  })
}

/**
 * 获取Union分发单详情
 * Get Union release detail
 */
export const getUnionReleaseDetail = (id) => {
  return agricultureRequest({
    url: `/invested/release/union/detail/${id}`,
    method: 'get'
  })
}

/**
 * 根据releaseId获取Union分发单详情
 * Get Union release detail by releaseId
 */
export const getUnionReleaseDetailByReleaseId = (releaseId, flag) => {
  return agricultureRequest({
    url: `/invested/release/union/detailByReleaseId/${releaseId}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

/**
 * 删除Union分发单
 * Delete Union release
 */
export const deleteUnionRelease = (ids, flag) => {
  return agricultureRequest({
    url: `/invested/release/union/delete/${ids}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

// ==================== Woreda接收确认 ====================

/**
 * 获取Woreda接收确认列表
 * Get Woreda receive list
 */
export const getWoredaReceiveList = (params) => {
  return agricultureRequest({
    url: '/invested/receive/woreda/list',
    method: 'get',
    params
  })
}

/**
 * Woreda确认接收
 * Confirm Woreda receive
 */
export const confirmWoredaReceive = (id, confirmBy, confirmOrg, flag) => {
  return agricultureRequest({
    url: `/invested/receive/woreda/confirm/${id}`,
    method: 'post',
    params: {
      confirmBy,
      confirmOrg,
      ...(flag === undefined ? {} : { flag })
    }
  })
}

/**
 * 获取Woreda接收详情
 * Get Woreda receive detail
 */
export const getWoredaReceiveDetail = (id) => {
  return agricultureRequest({
    url: `/invested/receive/woreda/detail/${id}`,
    method: 'get'
  })
}

// ==================== Woreda分发投入品到农民 ====================

/**
 * 获取农民分发单列表
 * Get farmer release list
 */
export const getFarmerReleaseList = (params) => {
  return agricultureRequest({
    url: '/invested/release/farmer/list',
    method: 'get',
    params
  })
}

/**
 * 新增农民分发单
 * Add farmer release
 */
export const addFarmerRelease = (data) => {
  return agricultureRequest({
    url: '/invested/release/farmer/add',
    method: 'post',
    data,
  })
}

/**
 * 编辑农民分发单
 * Edit farmer release
 */
export const editFarmerRelease = (data, flag) => {
  return agricultureRequest({
    url: '/invested/release/farmer/edit',
    method: 'post',
    data,
    params: flag === undefined ? undefined : { flag }
  })
}

/**
 * 获取农民分发单详情
 * Get farmer release detail
 */
export const getFarmerReleaseDetail = (id, flag) => {
  return agricultureRequest({
    url: `/invested/release/farmer/detail/${id}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

/**
 * 删除农民分发单
 * Delete farmer release
 */
export const deleteFarmerRelease = (ids, flag) => {
  return agricultureRequest({
    url: `/invested/release/farmer/delete/${ids}`,
    method: 'get',
    params: flag === undefined ? undefined : { flag }
  })
}

// ==================== 农民领用 Farmer Receive ====================

/**
 * 获取农民领用列表
 * Get farmer receive list
 */
export const getFarmerReceiveList = (params) => {
  return agricultureRequest({
    url: '/invested/release/farmer/receive/list',
    method: 'get',
    params
  })
}

/**
 * 获取农民领用详情
 * Get farmer receive detail
 */
export const getFarmerReceiveDetail = (id) => {
  return agricultureRequest({
    url: `/invested/release/farmer/receive/detail/${id}`,
    method: 'get'
  })
}

/**
 * 确认农民领用
 * Confirm farmer receive
 */
export const confirmFarmerReceive = (id) => {
  return agricultureRequest({
    url: `/invested/release/farmer/receive/confirm/${id}`,
    method: 'post'
  })
}
