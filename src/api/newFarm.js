/**
 * 农田管理模块 API
 * @module api/newFarm
 */
import request from '../utils/agricultureRequest'

// ==================== DA管理 API ====================

/**
 * 获取DA分页列表
 * @param {Object} params - 查询参数
 */
export const getDaList = async (params = {}) => {
  const res = await request({
    url: '/farmland/da/page',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      daName: params.daName || '',
      daId: params.daId || '',
      phone: params.phone || '',
      woredaCode: params.woredaCode || '',
      kebeleCode: params.kebeleCode || '',
      accountStatus: params.accountStatus || '',
      searchValue: params.searchValue || ''
    }
  })
  return {
    ...res,
    data: {
      ...res,
      records: res.rows
    }
  }
}

/**
 * 获取DA详情
 * @param {string} daId - DA编码
 */
export const getDaDetail = (daId) => {
  return request({
    url: `/farmland/da/${daId}`,
    method: 'get'
  })
}

/**
 * 新增DA
 * @param {Object} data - DA数据
 */
export const addDa = (data) => {
  return request({
    url: '/farmland/da',
    method: 'post',
    data
  })
}

/**
 * 修改DA
 * @param {string} daId - DA编码
 * @param {Object} data - DA数据
 */
export const updateDa = (daId, data) => {
  return request({
    url: `/farmland/da/${daId}`,
    method: 'post',
    data
  })
}

/**
 * 删除DA
 * @param {string} daId - DA编码
 */
export const deleteDa = (daId) => {
  return request({
    url: `/farmland/da/${daId}/delete`,
    method: 'post'
  })
}

/**
 * 启用/禁用DA账号
 * @param {string} daId - DA编码
 * @param {string} accountStatus - 账号状态 1-启用 0-禁用
 */
export const updateDaStatus = (daId, accountStatus) => {
  return request({
    url: `/farmland/da/${daId}/status`,
    method: 'post',
    data: { accountStatus }
  })
}

/**
 * 重置DA密码
 * @param {string} daId - DA编码
 * @param {string} newPassword - 新密码
 */
export const resetDaPassword = (daId, newPassword) => {
  return request({
    url: `/farmland/da/${daId}/password/reset`,
    method: 'post',
    data: { newPassword }
  })
}

/**
 * 获取DA下拉选项
 * @param {string} kebeleCode - 村代码
 */
export const getDaOptions = (kebeleCode = '') => {
  return request({
    url: '/farmland/da/options',
    method: 'get',
    params: { kebeleCode }
  })
}

/**
 * 检查DA账号是否可用
 * @param {string} account - 账号
 * @param {string} excludeDaId - 排除的DA编码（编辑时使用）
 * @returns {Promise} - true-可用，false-已存在
 */
export const checkDaAccountUnique = (account, excludeDaId = '') => {
  return request({
    url: '/farmland/da/checkAccount',
    method: 'get',
    params: { account, excludeDaId }
  })
}

// ==================== 农民管理 API ====================

/**
 * 获取农民分页列表
 * @param {Object} params - 查询参数
 */
export const getFarmerList = async (params = {}) => {
  const res = await request({
    url: '/farmland/farmer/page',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      farmerName: params.farmerName || '',
      farmerId: params.farmerId || '',
      idCard: params.idCard || '',
      gender: params.gender || '',
      phone: params.phone || '',
      kebeleCode: params.kebeleCode || '',
      daId: params.daId || '',
      searchValue: params.searchValue || '',
      kebeleName: params.kebeleName || '',
      ...(params.flag === undefined ? {} : { flag: params.flag })
    }
  })
  return {
    ...res,
    data: {
      ...res,
      records: res.rows
    }
  }
}

/**
 * 获取农民详情
 * @param {string} farmerId - 农民编码
 */
export const getFarmerDetail = (farmerId) => {
  return request({
    url: `/farmland/farmer/${farmerId}`,
    method: 'get'
  })
}

/**
 * 新增农民
 * @param {Object} data - 农民数据
 */
export const addFarmer = (data) => {
  return request({
    url: '/farmland/farmer',
    method: 'post',
    data
  })
}

/**
 * 修改农民
 * @param {string} farmerId - 农民编码
 * @param {Object} data - 农民数据
 */
export const updateFarmer = (farmerId, data) => {
  return request({
    url: `/farmland/farmer/${farmerId}`,
    method: 'post',
    data
  })
}

/**
 * 删除农民
 * @param {string} farmerId - 农民编码
 */
export const deleteFarmer = (farmerId) => {
  return request({
    url: `/farmland/farmer/${farmerId}/delete`,
    method: 'post'
  })
}

/**
 * 批量删除农民
 * @param {string[]} farmerIds - 农民编码数组
 */
export const batchDeleteFarmer = (farmerIds) => {
  return request({
    url: '/farmland/farmer/batch/delete',
    method: 'post',
    data: { farmerIds }
  })
}

/**
 * 获取农民下拉选项
 * @param {string} kebeleCode - 村代码
 * @param {string} keyword - 关键词
 */
export const getFarmerOptions = (kebeleCode = '', keyword = '') => {
  return request({
    url: '/farmland/farmer/options',
    method: 'get',
    params: { kebeleCode, keyword }
  })
}

/**
 * 获取农民导入模板下载地址
 * @returns {string} 模板下载URL
 */
export const getFarmerImportTemplateUrl = () => {
  return '/farmland/farmer/importTemplate'
}

/**
 * 下载农民导入模板（带token）
 * @returns {Promise<Blob>} 文件Blob
 */
export const downloadFarmerImportTemplate = () => {
  return request({
    url: '/farmland/farmer/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导入农民数据
 * @param {FormData} formData - 包含文件和参数的FormData
 */
export const importFarmerData = (formData) => {
  return request({
    url: '/farmland/farmer/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取全部农民列表
 * @param
 */
export const getAllFarmerList = () => {
  return request({
    url: `/farmland/farmer/getAllFarmerList`,
    method: 'get'
  }).then(res => {
    // // 转换返回数据：驼峰转下划线
    // if (res.data) {
    //   // res.data = toSnakeCase(res.data)
    // }
    return res
  })
}

// ==================== 土地管理 API ====================

/**
 * 获取土地分页列表
 * @param {Object} params - 查询参数
 */
export const getLandList = async (params = {}) => {
  const res = await request({
    url: '/farmland/land/page',
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      landName: params.landName || '',
      landId: params.landId || '',
      farmerId: params.farmerId || '',
      farmerName: params.farmerName || '',
      farmerPhone: params.farmerPhone || '',
      kebeleCode: params.kebeleCode || '',
      landType: params.landType || '',
      currentStatus: params.currentStatus || '',
      daId: params.daId || '',
      searchValue: params.searchValue || ''
    }
  })
  return {
    ...res,
    data: {
      ...res,
      records: res.rows
    }
  }
}
/**
 * 获取土地详情
 * @param {string} landId - 土地编码
 */
export const getLandDetail = (landId) => {
  return request({
    url: `/farmland/land/${landId}`,
    method: 'get'
  })
}

/**
 * 新增土地
 * @param {Object} data - 土地数据
 */
export const addLand = (data) => {
  return request({
    url: '/farmland/land',
    method: 'post',
    data
  })
}

/**
 * 修改土地
 * @param {string} landId - 土地编码
 * @param {Object} data - 土地数据
 */
export const updateLand = (landId, data) => {
  return request({
    url: `/farmland/land/${landId}`,
    method: 'post',
    data
  })
}

/**
 * 删除土地
 * @param {string} landId - 土地编码
 */
export const deleteLand = (landId) => {
  return request({
    url: `/farmland/land/${landId}/delete`,
    method: 'post'
  })
}

/**
 * 批量删除土地
 * @param {string[]} landIds - 土地编码数组
 */
export const batchDeleteLand = (landIds) => {
  return request({
    url: '/farmland/land/batch/delete',
    method: 'post',
    data: { landIds }
  })
}

/**
 * 关联农民
 * @param {string} landId - 土地编码
 * @param {string} farmerId - 农民编码
 */
export const bindFarmerToLand = (landId, farmerId) => {
  return request({
    url: `/farmland/land/${landId}/bindFarmer`,
    method: 'post',
    data: { farmerId }
  })
}

/**
 * 解除农民关联
 * @param {string} landId - 土地编码
 */
export const unbindFarmerFromLand = (landId) => {
  return request({
    url: `/farmland/land/${landId}/unbindFarmer`,
    method: 'post'
  })
}

/**
 * 获取农民的土地列表
 * @param {string} farmerId - 农民编码
 */
export const getLandsByFarmer = (farmerId) => {
  return request({
    url: `/farmland/land/farmer/${farmerId}`,
    method: 'get'
  })
}

/**
 * 获取土地统计数据
 * @param {Object} params - 查询参数
 */
export const getLandStatistics = (params = {}) => {
  return request({
    url: '/farmland/land/statistics',
    method: 'get',
    params: {
      kebeleCode: params.kebeleCode || '',
      woredaCode: params.woredaCode || '',
      zoneCode: params.zoneCode || ''
    }
  })
}
