import agricultureRequest, { toCamelCase, toSnakeCase } from '../utils/agricultureRequest'

// ==================== 仓库管理 API ====================

/**
 * 查询仓库列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.warehouseName - 仓库名称(模糊查询)
 * @param {string} params.warehouseType - 仓库类型(normal/cold/dangerous)
 * @param {string} params.status - 状态(0-停用/1-启用)
 * @param {number} params.supplierId - 供应商ID
 */
export const getWarehouseList = (params = {}) => {
  const requestParams = {
    pageNum: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.warehouseName) requestParams.warehouseName = params.warehouseName
  if (params.type) requestParams.type = params.type
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }

  return agricultureRequest({
    url: '/inventory/warehouse-manage/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.rows) {
      res.rows = res.rows.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * Get inventory warehouse list (inventory-warehouse)
 * @param {Object} params - query params
 * @param {number} params.pageNum - page number
 * @param {number} params.pageSize - page size
 */
export const getInventoryWarehouseList = (params = {}) => {
  const requestParams = {
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 10000
  }
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }
  if (params.orgId !== undefined && params.orgId !== null && params.orgId !== '') {
    requestParams.orgId = params.orgId
  }
  if (params.org_id !== undefined && params.org_id !== null && params.org_id !== '') {
    requestParams.org_id = params.org_id
  }
  if (params.orgName !== undefined && params.orgName !== null && params.orgName !== '') {
    requestParams.orgName = params.orgName
  }
  if (params.org_name !== undefined && params.org_name !== null && params.org_name !== '') {
    requestParams.org_name = params.org_name
  }
  if (params.flag !== undefined && params.flag !== null && params.flag !== '') {
    requestParams.flag = params.flag
  }

  return agricultureRequest({
    url: '/inventory/inventory-warehouse/list',
    method: 'get',
    params: requestParams
  })
}

/**
 * Create inbound order for external system (open API)
 * @param {Object} data - inbound order data
 */
export const createOpenInbound = (data) => {
  return agricultureRequest({
    url: '/inventory/open/inbound',
    method: 'post',
    data
  })
}

/**
 * Create outbound order for external system (open API)
 * @param {Object} data - outbound order data
 */
export const createOpenOutbound = (data) => {
  return agricultureRequest({
    url: '/inventory/open/outbound',
    method: 'post',
    params: data?.flag === undefined ? undefined : { flag: data.flag },
    data
  })
}

/**
 * 查询仓库选项列表（供下拉选择使用）
 */
export const getWarehouseOptions = (params = {}) => {
  const requestParams = {}
  if (params.status) requestParams.status = params.status
  if (params.orgId !== undefined && params.orgId !== null && params.orgId !== '') {
    requestParams.orgId = params.orgId
  }
  if (params.org_id !== undefined && params.org_id !== null && params.org_id !== '') {
    requestParams.org_id = params.org_id
  }

  return agricultureRequest({
    url: '/inventory/warehouse-manage/options',
    method: 'get',
    params: requestParams
  }).then(res => {
    return res
  })
}

/**
 * 查询仓库选项（按当前登录用户组织ID强制过滤）
 */
export const getWarehouseOptionsByOrg = (params = {}) => {
  const requestParams = {}
  if (params.status) requestParams.status = params.status
  if (params.orgId !== undefined && params.orgId !== null && params.orgId !== '') {
    requestParams.orgId = params.orgId
  }
  if (params.org_id !== undefined && params.org_id !== null && params.org_id !== '') {
    requestParams.org_id = params.org_id
  }

  return agricultureRequest({
    url: '/inventory/warehouse-manage/options-by-org',
    method: 'get',
    params: requestParams
  }).then(res => {
    return res
  })
}

export const getWarehouseManageList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.warehouseName) requestParams.warehouseName = params.warehouseName
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }
  if (params.organCode) requestParams.organCode = params.organCode

  return agricultureRequest({
    url: '/inventory/warehouse-manage/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 查询仓库详情
 * @param {number} warehouseId - 仓库ID
 */
export const getWarehouseDetail = (warehouseId) => {
  return agricultureRequest({
    url: `/inventory/warehouse/${warehouseId}`,
    method: 'get'
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 添加仓库
 * @param {Object} data - 仓库数据
 * @param {string} data.warehouseCode - 仓库编码
 * @param {string} data.warehouseName - 仓库名称
 * @param {string} data.warehouseType - 仓库类型
 * @param {string} data.location - 仓库位置
 * @param {number} data.capacity - 仓库容量
 * @param {number} data.warehouseArea - 仓库面积
 * @param {string} data.organName - 仓库归属部门
 * @param {string} data.contactPerson - 联系人
 * @param {string} data.contactPhone - 联系电话
 * @param {string} data.siteCertificate - 场地证明材料
 * @param {string} data.remark - 备注
 */
export const addWarehouse = (data) => {
  const requestData = {
    warehouseCode: data.warehouseCode,
    warehouseName: data.warehouseName,
    warehouseType: data.warehouseType,
    location: data.location,
    capacity: data.capacity,
    warehouseArea: data.warehouseArea,
    organName: data.organName,
    organCode: data.organCode, // 添加部门ID
    contactPerson: data.contactPerson,
    contactPhone: data.contactPhone,
    siteCertificate: data.siteCertificate,
    remark: data.remark
  }

  return agricultureRequest({
    url: '/inventory/warehouse',
    method: 'post',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 更新仓库
 * @param {number} warehouseId - 仓库ID
 * @param {Object} data - 仓库数据
 */
export const updateWarehouse = (data) => {
  const requestData = {
    warehouseCode: data.warehouseCode,
    warehouseName: data.warehouseName,
    warehouseType: data.warehouseType,
    location: data.location,
    capacity: data.capacity,
    warehouseArea: data.warehouseArea,
    organName: data.organName,
    organCode: data.organCode, // 添加部门ID
    contactPerson: data.contactPerson,
    contactPhone: data.contactPhone,
    siteCertificate: data.siteCertificate,
    remark: data.remark
  }

  return agricultureRequest({
    url: '/inventory/warehouse/update',
    method: 'post',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 删除仓库
 * @param {number} warehouseId - 仓库ID
 */
export const deleteWarehouse = (warehouseId) => {
  return agricultureRequest({
    url: `/inventory/warehouse/delete/${warehouseId}`,
    method: 'post'
  })
}

// ==================== Warehouse Warning Config API ====================

export const updateWarehouseWarning = (data) => {
  return agricultureRequest({
    url: '/inventory/warehouse-manage/warning',
    method: 'put',
    data: toSnakeCase(data)
  })
}

// ==================== 入库管理 API ====================

/**
 * 查询入库单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.warehouseId - 仓库ID
 * @param {number} params.supplierId - 供应商ID
 * @param {string} params.type - 入库类型（0-采购/1-退货）
 * @param {string} params.status - 状态（0-未入库/1-已入库/2-作废）
 */
export const getStockInList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.supplierId) requestParams.supplierId = params.supplierId
  if (params.type !== undefined && params.type !== null && params.type !== '') {
    requestParams.type = params.type
  }
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }

  return agricultureRequest({
    url: '/inventory/inbound/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 查询入库单详情
 * @param {string} stockInId - 入库单号
 */
export const getStockInDetail = (stockInId) => {
  return agricultureRequest({
    url: `/inventory/inbound/${stockInId}`,
    method: 'get'
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
      if (res.data.items) {
        res.data.items = res.data.items.map(item => toSnakeCase(item))
      }
    }
    return res
  })
}

/**
 * 创建入库单
 * @param {Object} data - 入库单数据
 * @param {number} data.warehouseId - 仓库ID
 * @param {number} data.supplierId - 供应商ID
 * @param {string} data.type - 入库类型(0-采购/1-退货)
 * @param {string} data.operator - 操作员
 * @param {string} data.remarks - 备注
 * @param {Array} data.items - 入库商品明细
 * @param {number} data.items[].inputId - 投入品ID
 * @param {number} data.items[].quantity - 入库数量
 * @param {string} data.items[].expiryDate - 过期日期
 * @param {string} data.items[].remarks - 商品备注
 */
export const createStockIn = (data) => {
  const requestData = {
    warehouseId: data.warehouseId,
    supplierId: data.supplierId,
    type: data.type,
    operator: data.operator,
    remarks: data.remarks,
    items: data.items.map(item => ({
      inputId: item.inputId,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      remarks: item.remarks
    }))
  }

  return agricultureRequest({
    url: '/inventory/inbound',
    method: 'post',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 确认入库
 * @param {string} stockInId - 入库单号
 */
export const confirmStockIn = (stockInId) => {
  return agricultureRequest({
    url: `/inventory/inbound/${stockInId}/confirm`,
    method: 'post'
  })
}

/**
 * 删除入库单
 * @param {string} stockInId - 入库单号
 */
export const deleteStockIn = (stockInId) => {
  return agricultureRequest({
    url: `/inventory/inbound/${stockInId}`,
    method: 'delete'
  })
}

// ==================== 出库管理 API ====================

/**
 * 查询出库单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.warehouseId - 仓库ID
 * @param {string} params.customer - 客户
 * @param {string} params.type - 出库类型（0-销售）
 * @param {string} params.status - 状态（0-未出库/1-已出库/2-作废）
 */
export const getStockOutList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.customer) requestParams.customer = params.customer
  if (params.type !== undefined && params.type !== null && params.type !== '') {
    requestParams.type = params.type
  }
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }

  return agricultureRequest({
    url: '/inventory/outbound/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 查询出库单详情
 * @param {string} stockOutId - 出库单号
 */
export const getStockOutDetail = (stockOutId) => {
  return agricultureRequest({
    url: `/inventory/outbound/${stockOutId}`,
    method: 'get'
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
      if (res.data.items) {
        res.data.items = res.data.items.map(item => toSnakeCase(item))
      }
    }
    return res
  })
}

/**
 * 创建出库单
 * @param {Object} data - 出库单数据
 * @param {number} data.warehouseId - 仓库ID
 * @param {string} data.type - 出库类型（0-销售）
 * @param {string} data.operator - 操作员
 * @param {string} data.customer - 客户
 * @param {string} data.remark - 备注
 * @param {Array} data.items - 出库商品明细
 */
export const createStockOut = (data) => {
  const requestData = {
    warehouseId: data.warehouseId,
    type: data.type,
    operator: data.operator,
    customer: data.customer,
    remark: data.remark,
    items: data.items.map(item => ({
      inputId: item.inputId,
      batchNo: item.batchNo,
      quantity: item.quantity,
      remarks: item.remarks
    }))
  }

  return agricultureRequest({
    url: '/inventory/outbound',
    method: 'post',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 确认出库
 * @param {string} stockOutId - 出库单号
 */
export const confirmStockOut = (stockOutId) => {
  return agricultureRequest({
    url: `/inventory/outbound/${stockOutId}/confirm`,
    method: 'post'
  })
}

/**
 * 删除出库单
 * @param {string} stockOutId - 出库单号
 */
export const deleteStockOut = (stockOutId) => {
  return agricultureRequest({
    url: `/inventory/outbound/${stockOutId}`,
    method: 'delete'
  })
}

// ==================== 库存查询 API ====================

/**
 * 查询库存列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.warehouseId - 仓库ID
 * @param {number} params.inputId - 投入品ID
 * @param {string} params.batchNo - 批次号
 * @param {string} params.stockStatus - 库存状态（0-正常/1-临期/2-过期）
 */
export const getInventoryList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.inputId) requestParams.inputId = params.inputId
  if (params.batchNo) requestParams.batchNo = params.batchNo
  if (params.stockStatus !== undefined && params.stockStatus !== null && params.stockStatus !== '') {
    requestParams.stockStatus = params.stockStatus
  }

  return agricultureRequest({
    url: '/inventory/stock/query',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 查询库存详情
 * @param {string} inventoryId - 库存记录ID
 */
export const getInventoryDetail = (inventoryId) => {
  return agricultureRequest({
    url: `/inventory/stock/${inventoryId}`,
    method: 'get'
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 查询库存预警列表
 * @param {Object} params - 查询参数
 * @param {number} params.warehouseId - 仓库ID
 * @param {string} params.warningType - 预警类型（all/nearExpiry/expired）
 */
export const getInventoryWarning = (params = {}) => {
  const requestParams = {}

  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.warningType) requestParams.warningType = params.warningType

  return agricultureRequest({
    url: '/inventory/stock/warning',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 按投入品汇总库存
 * @param {Object} params - 查询参数
 * @param {number} params.warehouseId - 仓库ID
 * @param {string} params.inputType - 投入品类型
 */
export const getInventorySummaryByInput = (params = {}) => {
  const requestParams = {}

  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.inputType) requestParams.inputType = params.inputType

  return agricultureRequest({
    url: '/inventory/stock/summary/by-input',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 按仓库汇总库存
 * @param {Object} params - 查询参数
 * @param {number} params.supplierId - 供应商ID
 */
export const getInventorySummaryByWarehouse = (params = {}) => {
  const requestParams = {}

  if (params.supplierId) requestParams.supplierId = params.supplierId

  return agricultureRequest({
    url: '/inventory/stock/summary/by-warehouse',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 获取批次列表（用于出库选择）
 * @param {Object} params - 查询参数
 * @param {number} params.warehouseId - 仓库ID
 * @param {number} params.inputId - 投入品ID
 */
export const getBatchList = (params = {}) => {
  const requestParams = {}

  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.inputId) requestParams.inputId = params.inputId

  return agricultureRequest({
    url: '/inventory/batch/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && Array.isArray(res.data)) {
      res.data = res.data.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 根据仓库查询批次库存列表
 * @param {string} warehouseCode - 仓库编码
 */
export const getBatchesByWarehouse = (warehouseCode) => {
  return agricultureRequest({
    url: `/inventory/stock-batch/warehouse/${warehouseCode}`,
    method: 'get'
  })
}

/**
 * 根据批次号查询批次详情
 * @param {string} batchNo - 批次号
 * @param {string} warehouseCode - 仓库编码
 */
export const getBatchDetail = (batchNo, warehouseCode) => {
  return agricultureRequest({
    url: `/inventory/stock-batch/detail`,
    method: 'get',
    params: { batchNo, warehouseCode }
  })
}

// ==================== 入库管理 API (新) ====================

/**
 * 查询入库单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.warehouseId - 仓库ID
 * @param {string} params.type - 入库类型
 * @param {string} params.status - 状态
 */
export const getInboundList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.inboundNo) requestParams.inboundNo = params.inboundNo
  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.type !== undefined && params.type !== null && params.type !== '') {
    requestParams.type = params.type
  }
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }

  return agricultureRequest({
    url: '/inventory/inbound/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 查询入库单详情
 * @param {number} id - 入库单ID
 */
export const getInboundDetail = (id) => {
  return agricultureRequest({
    url: `/inventory/inbound/${id}`,
    method: 'get'
  })
}

/**
 * 创建入库单
 * @param {Object} data - 入库单数据
 */
export const createInbound = (data) => {
  const requestData = {
    inboundNo: data.inboundNo,
    warehouseCode: data.warehouseCode,
    warehouseName: data.warehouseName,
    type: data.type,
    bizNo: data.bizNo,
    operator: data.operator,
    orderDate: data.orderDate,
    remark: data.remark,
    detailList: data.detailList ? data.detailList.map(item => ({
      productId: item.productId,
      productName: item.productName,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      batchNo: item.batchNo,
      supplier: item.supplier,
      qty: item.qty,
      unit: item.unit,
      expireDate: item.expireDate
    })) : []
  }

  return agricultureRequest({
    url: '/inventory/inbound/create',
    method: 'post',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 更新入库单
 * @param {number} id - 入库单ID
 * @param {Object} data - 入库单数据
 */
export const updateInbound = (id, data) => {
  const requestData = {
    id: id,
    inboundNo: data.inboundNo,
    warehouseCode: data.warehouseCode,
    warehouseName: data.warehouseName,
    type: data.type,
    bizNo: data.bizNo,
    operator: data.operator,
    orderDate: data.orderDate,
    remark: data.remark,
    detailList: data.detailList ? data.detailList.map(item => ({
      productId: item.productId,
      productName: item.productName,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      batchNo: item.batchNo,
      supplier: item.supplier,
      qty: item.qty,
      unit: item.unit,
      expireDate: item.expireDate
    })) : []
  }

  return agricultureRequest({
    url: '/inventory/inbound',
    method: 'put',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 删除入库单
 * @param {number} id - 入库单ID
 */
export const deleteInbound = (id) => {
  return agricultureRequest({
    url: `/inventory/inbound/${id}`,
    method: 'delete'
  })
}

/**
 * 审核入库单
 * @param {number} id - 入库单ID
 * @param {Object} data - 审核数据
 * @param {string} data.auditStatus - 审核状态 (approved/rejected)
 * @param {string} data.auditComment - 审核意见
 */
export const auditInbound = (id, data) => {
  return agricultureRequest({
    url: '/inventory/inbound/audit',
    method: 'post',
    data: {
      id,
      auditStatus: data.auditStatus,
      status: data.auditStatus,
      auditComment: data.auditComment
    }
  })
}

// ==================== Additional API functions for pages ====================

/**
 * Submit inbound order (for approval)
 * @param {Object} data - inbound order data with id
 */
export const submitInbound = (data) => {
  return agricultureRequest({
    url: '/inventory/inbound/submit',
    method: 'post',
    data: { id: data.id }
  })
}

/**
 * Submit outbound order (for approval)
 * @param {Object} data - outbound order data with id
 */
export const submitOutbound = (data) => {
  return agricultureRequest({
    url: '/inventory/outbound/submit',
    method: 'post',
    data: { id: data.id }
  })
}

/**
 * Get inbound detail (alias for getInboundDetail)
 * @param {number} id - inbound order ID
 */
export const getInbound = (id) => {
  return getInboundDetail(id)
}

/**
 * Get outbound detail (alias for getOutboundDetail)
 * @param {number} id - outbound order ID
 */
export const getOutbound = (id) => {
  return getOutboundDetail(id)
}

/**
 * Add inbound (alias for createInbound)
 * @param {Object} data - inbound order data
 */
export const addInbound = (data) => {
  return createInbound(data)
}

/**
 * Add outbound (alias for createOutbound)
 * @param {Object} data - outbound order data
 */
export const addOutbound = (data) => {
  return createOutbound(data)
}

/**
 * Get product list
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.productName - 商品名称
 * @param {string} params.category - 分类
 */
export const getProductList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.productName) requestParams.keyword = params.productName

  return agricultureRequest({
    url: '/agriculture/input/list',
    method: 'get',
    params: requestParams
  })
}

/**
 * Get inventory product list (inventory_product)
 * @param {Object} params - query params
 * @param {number} params.pageNum - page number
 * @param {number} params.pageSize - page size
 * @param {string|number} params.parentId - parent product id (0 for top-level)
 * @param {string} params.status - status
 */
export const getInventoryProductList = (params = {}) => {
  const requestParams = {
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 10000
  }
  if (params.parentId !== undefined && params.parentId !== null) requestParams.parentId = params.parentId
  if (params.status !== undefined && params.status !== null && params.status !== '') requestParams.status = params.status

  return agricultureRequest({
    url: '/inventory/product-manage/list',
    method: 'get',
    params: requestParams
  })
}

export const getInventoryProductCategoryTree = () => {
  return agricultureRequest({
    url: '/inventory/product-manage/category-tree',
    method: 'get'
  })
}

// ==================== 出库管理 API (新) ====================

/**
 * 查询出库单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.warehouseId - 仓库ID
 * @param {string} params.type - 出库类型
 * @param {string} params.status - 状态
 */
export const getOutboundList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.outboundNo) requestParams.outboundNo = params.outboundNo
  if (params.warehouseId) requestParams.warehouseId = params.warehouseId
  if (params.type !== undefined && params.type !== null && params.type !== '') {
    requestParams.type = params.type
  }
  if (params.status !== undefined && params.status !== null && params.status !== '') {
    requestParams.status = params.status
  }

  return agricultureRequest({
    url: '/inventory/outbound/list',
    method: 'get',
    params: requestParams
  }).then(res => {
    if (res.data && res.data.list) {
      res.data.list = res.data.list.map(item => toSnakeCase(item))
    }
    return res
  })
}

/**
 * 查询出库单详情
 * @param {number} id - 出库单ID
 */
export const getOutboundDetail = (id) => {
  return agricultureRequest({
    url: `/inventory/outbound/${id}`,
    method: 'get'
  })
}

/**
 * 创建出库单
 * @param {Object} data - 出库单数据
 */
export const createOutbound = (data) => {
  const requestData = {
    outboundNo: data.outboundNo,
    warehouseCode: data.warehouseCode,
    warehouseName: data.warehouseName,
    type: data.type,
    receiverType: data.receiverType,
    receiver: data.receiver,
    bizNo: data.bizNo,
    operator: data.operator,
    orderDate: data.orderDate,
    remark: data.remark,
    detailList: data.detailList ? data.detailList.map(item => ({
      productId: item.productId,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      productName: item.productName,
      batchNo: item.batchNo,
      supplier: item.supplier,
      qty: item.qty,
      unit: item.unit,
      expireDate: item.expireDate
    })) : []
  }

  return agricultureRequest({
    url: '/inventory/outbound/create',
    method: 'post',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 更新出库单
 * @param {number} id - 出库单ID
 * @param {Object} data - 出库单数据
 */
export const updateOutbound = (id, data) => {
  const requestData = {
    id: id,
    outboundNo: data.outboundNo,
    warehouseCode: data.warehouseCode,
    warehouseName: data.warehouseName,
    type: data.type,
    receiverType: data.receiverType,
    receiver: data.receiver,
    bizNo: data.bizNo,
    operator: data.operator,
    orderDate: data.orderDate,
    remark: data.remark,
    detailList: data.detailList ? data.detailList.map(item => ({
      productId: item.productId,
      mainCategory: item.mainCategory,
      subCategory: item.subCategory,
      productName: item.productName,
      batchNo: item.batchNo,
      supplier: item.supplier,
      qty: item.qty,
      unit: item.unit,
      expireDate: item.expireDate
    })) : []
  }

  return agricultureRequest({
    url: '/inventory/outbound',
    method: 'put',
    data: requestData
  }).then(res => {
    if (res.data) {
      res.data = toSnakeCase(res.data)
    }
    return res
  })
}

/**
 * 删除出库单
 * @param {number} id - 出库单ID
 */
export const deleteOutbound = (id) => {
  return agricultureRequest({
    url: `/inventory/outbound/${id}`,
    method: 'delete'
  })
}

/**
 * 审核出库单
 * @param {number} id - 出库单ID
 * @param {Object} data - 审核数据
 * @param {string} data.auditStatus - 审核状态 (approved/rejected)
 * @param {string} data.auditComment - 审核意见
 */
export const auditOutbound = (id, data) => {
  return agricultureRequest({
    url: '/inventory/outbound/audit',
    method: 'post',
    data: {
      id,
      auditStatus: data.auditStatus,
      status: data.auditStatus,
      auditComment: data.auditComment
    }
  })
}

// ==================== 调拨管理 API ====================

/**
 * 查询调拨单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.transferType - 调拨类型
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {number} params.outWarehouseId - 调出仓库ID
 * @param {number} params.inWarehouseId - 调入仓库ID
 * @param {string} params.status - 状态
 */
export const getTransferList = (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }

  if (params.transferType) requestParams.transferType = params.transferType
  if (params.startDate) requestParams.startDate = params.startDate
  if (params.endDate) requestParams.endDate = params.endDate
  if (params.outWarehouseCode) requestParams.outWarehouseCode = params.outWarehouseCode
  if (params.inWarehouseCode) requestParams.inWarehouseCode = params.inWarehouseCode
  if (params.status) requestParams.status = params.status

  return agricultureRequest({
    url: '/inventory/transfer/list',
    method: 'get',
    params: requestParams
  })
}

/**
 * 查询调拨单详情
 * @param {number} id - 调拨单ID
 */
export const getTransferDetail = (id) => {
  return agricultureRequest({
    url: `/inventory/transfer/${id}`,
    method: 'get'
  }).then(res => {
    if (res.data) {
      res.data = toCamelCase(res.data)
    }
    return res
  })
}

/**
 * 创建调拨单
 * @param {Object} data - 调拨单数据
 */
export const createTransfer = (data) => {
  const requestData = {
    id: data.id,
    transferNo: data.transferNo,
    transferType: data.transferType,
    expectedDate: data.expectedDate,
    applicant: data.applicant,
    department: data.department,
    outWarehouseCode: data.outWarehouseCode,
    outWarehouseName: data.outWarehouseName,
    inWarehouseCode: data.inWarehouseCode,
    inWarehouseName: data.inWarehouseName,
    remark: data.remark,
    detailList: data.detailList ? data.detailList.map(item => ({
      id: item.id || null,
      productId: item.productId || null,
      mainCategory: item.mainCategory || null,
      subCategory: item.subCategory || null,
      productName: item.productName || null,
      batchNo: item.batchNo || null,
      supplier: item.supplier || null,
      qty: item.qty || null,
      unit: item.unit || null,
      expireDate: item.expireDate || null
    })) : []
  }
  return agricultureRequest({
    url: '/inventory/transfer/create',
    method: 'post',
    data: toSnakeCase(requestData)
  })
}

/**
 * 更新调拨单
 * @param {Object} data - 调拨单数据
 */
export const updateTransfer = (data) => {
  const requestData = {
    id: data.id,
    transferNo: data.transferNo,
    transferType: data.transferType,
    expectedDate: data.expectedDate,
    applicant: data.applicant,
    department: data.department,
    outWarehouseCode: data.outWarehouseCode,
    outWarehouseName: data.outWarehouseName,
    inWarehouseCode: data.inWarehouseCode,
    inWarehouseName: data.inWarehouseName,
    remark: data.remark,
    detailList: data.detailList ? data.detailList.map(item => ({
      id: item.id || null,
      productId: item.productId || null,
      mainCategory: item.mainCategory || null,
      subCategory: item.subCategory || null,
      productName: item.productName || null,
      batchNo: item.batchNo || null,
      supplier: item.supplier || null,
      qty: item.qty || null,
      unit: item.unit || null,
      expireDate: item.expireDate || null
    })) : []
  }
  return agricultureRequest({
    url: '/inventory/transfer',
    method: 'put',
    data: toSnakeCase(requestData)
  })
}

/**
 * 删除调拨单
 * @param {number} id - 调拨单ID
 */
export const deleteTransfer = (id) => {
  return agricultureRequest({
    url: `/inventory/transfer/${id}`,
    method: 'delete'
  })
}

/**
 * 提交调拨单
 * @param {Object} data - 包含id的数据对象
 */
export const submitTransfer = (data) => {
  return agricultureRequest({
    url: '/inventory/transfer/submit',
    method: 'post',
    data: { id: data.id }
  })
}

/**
 * 审批调拨单
 * @param {number} id - 调拨单ID
 * @param {boolean} approved - 是否通过
 * @param {string} auditComment - 审批意见
 */
export const auditTransfer = (id, approved, auditComment) => {
  return agricultureRequest({
    url: '/inventory/transfer/audit',
    method: 'post',
    data: { id, approved, auditComment }
  })
}
