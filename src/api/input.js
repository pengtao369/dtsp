import request from '../utils/agricultureRequest'
import { useUserStore } from '@/store'
import { createPinia } from 'pinia'

// 解决Pinia非组件环境获取Token（核心：携带鉴权Token）
const pinia = createPinia()
const userStore = useUserStore(pinia)

// 通用请求头：携带Token（适配后端鉴权）
const getAuthHeaders = () => {
  const token = userStore.token
  return token ? {
    'Authorization': `Bearer ${token}`, // 后端鉴权常用格式，若后端直接要token字段则改为 'token': token
    'Content-Type': 'application/json;charset=utf-8'
  } : {
    'Content-Type': 'application/json;charset=utf-8'
  }
}

// ==================== 投入品目录管理 API（完全适配后端Controller） ====================

/**
 * 获取投入品列表（分页）
 * 后端：GET /agriculture/input/list
 * @param {Object} params - 查询参数（与后端@RequestParam完全匹配）
 */
export const getInputList = (params = {}) => {
  const requestParams = {
    inputName: params.inputName || '',
    type: params.type || '',
    agriculturalInputType: params.agriculturalInputType || '',
    registerCode: params.registerCode || '',
    inputSku: params.inputSku || '',
    status: params.status || '',
    keyword: params.keyword || '',
    page: params.page || 1,
    pageSize: params.pageSize || 10
  }
  return request({
    url: '/agriculture/input/list',
    method: 'get',
    params: requestParams, // 后端用@RequestParam接收，故用params传参
    headers: getAuthHeaders()
  })
}

/**
 * 获取全部投入品列表（不分页）
 * 后端：GET /agriculture/input/getAllInputList
 */
export const getAllInputList = (flag) => {
  return request({
    url: '/agriculture/input/getAllInputList',
    method: 'get',
    params: flag === undefined ? undefined : { flag },
    headers: getAuthHeaders()
  })
}

/**
 * 获取投入品详情（核心适配：路径参数id）
 * 后端：GET /agriculture/input/{id}
 * @param {number} id - 投入品ID（后端Long类型，前端传数字）
 */
export const getInputDetail = (id) => {
  // 校验ID合法性（避免无效请求）
  if (!id || isNaN(id) || id <= 0) {
    return Promise.reject(new Error('无效的投入品ID'))
  }
  return request({
    url: `/agriculture/input/${id}`, // 后端路径参数{id}，故URL拼接
    method: 'get',
    headers: getAuthHeaders()
  })
}

/**
 * 新增投入品
 * 后端：POST /agriculture/input
 * @param {Object} data - 投入品数据（与后端AgriInput实体字段匹配）
 */
export const addInput = (data) => {
  // 前端兜底（匹配后端非空校验）
  const submitData = {
    ...data,
    status: data.status || 'active',
    delFlag: data.delFlag || '0'
  }
  return request({
    url: '/agriculture/input',
    method: 'post',
    data: submitData, // 后端@RequestBody接收，故用data传参
    headers: getAuthHeaders()
  })
}

/**
 * 修改投入品（核心适配：路径参数id + RequestBody）
 * 后端：PUT /agriculture/input/{id}
 * @param {number} id - 投入品ID
 * @param {Object} data - 投入品数据
 */
export const updateInput = (id, data) => {
  if (!id || isNaN(id) || id <= 0) {
    return Promise.reject(new Error('无效的投入品ID'))
  }
  // 后端要求inputId=id，前端兜底
  const submitData = {
    ...data,
    inputId: id
  }
  return request({
    url: `/agriculture/input/${id}`, // 路径参数{id}
    method: 'put', // 严格匹配后端PUT方法
    data: submitData, // @RequestBody接收
    headers: getAuthHeaders()
  })
}

/**
 * 删除投入品（单条）
 * 后端：DELETE /agriculture/input/{id}
 * @param {number} id - 投入品ID
 */
export const deleteInput = (id) => {
  if (!id || isNaN(id) || id <= 0) {
    return Promise.reject(new Error('无效的投入品ID'))
  }
  return request({
    url: `/agriculture/input/${id}`, // 路径参数{id}
    method: 'delete', // 严格匹配后端DELETE方法
    headers: getAuthHeaders()
  })
}

/**
 * 批量删除投入品
 * 后端：DELETE /agriculture/input/batch
 * @param {Array} ids - 投入品ID数组（后端Long[]）
 */
export const batchDeleteInputs = (ids) => {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return Promise.reject(new Error('请选择要删除的投入品'))
  }
  // 确保ID为数字（匹配后端Long类型）
  const validIds = ids.filter(id => !isNaN(id) && id > 0)
  if (validIds.length === 0) {
    return Promise.reject(new Error('无效的投入品ID列表'))
  }
  return request({
    url: '/agriculture/input/batch',
    method: 'delete', // 严格匹配后端DELETE方法
    data: validIds, // 后端@RequestBody接收Long[]，故用data传参
    headers: getAuthHeaders()
  })
}

/**
 * 导出投入品数据
 * 后端：GET /agriculture/input/export
 * @param {Object} params - 查询参数
 */
export const exportInputs = (params = {}) => {
  const requestParams = {
    inputName: params.inputName || '',
    type: params.type || '',
    keyword: params.keyword || ''
  }
  return request({
    url: '/agriculture/input/export',
    method: 'get',
    params: requestParams, // @RequestParam接收
    headers: getAuthHeaders(),
    responseType: 'blob' // 导出文件需指定响应类型
  })
}

/**
 * 获取投入品统计信息
 * 后端：GET /agriculture/input/statistics
 */
export const getInputStatistics = () => {
  return request({
    url: '/agriculture/input/statistics',
    method: 'get',
    headers: getAuthHeaders()
  })
}

/**
 * 上传投入品图片（完全适配后端上传接口）
 * 后端：POST /agriculture/input/uploadImage
 * @param {FormData} formData - 包含file的表单数据（key必须为"file"）
 */
export const uploadInputImage = (formData) => {
  // 校验FormData是否包含file
  if (!formData || !formData.get('file')) {
    return Promise.reject(new Error('请选择要上传的图片文件'))
  }
  return request({
    url: '/agriculture/input/uploadImage',
    method: 'post',
    data: formData, // 后端@RequestParam("file")接收，FormData传参
    headers: {
      // 覆盖默认Content-Type，让浏览器自动生成multipart/form-data边界
      ...getAuthHeaders(),
      'Content-Type': undefined
    },
    timeout: 60000
  })
}
 /* 转换投入品数据：前端格式 -> 后端格式
 * 下划线命名 -> 驼峰命名
 */
function transformInputData(data) {
  const transformed = {
    inputName: data.input_name,
    type: data.type,
    agriculturalInputType: data.agricultural_input_type,
    variety: data.variety,
    inputSku: data.input_sku,
    trademark: data.trademark,
    registerCode: data.register_code,
    productionLicense: data.production_license,
    productionStandard: data.production_standard,
    producerName: data.producer_name,
    producerAddress: data.producer_address,
    status: data.status
  }

  // 根据类型添加对应的特性数据
  if (data.type === 'pesticide' && data.pesticide_properties) {
    transformed.pesticideProperties = {
      totalIngredientContent: data.pesticide_properties.total_ingredient_content,
      toxicityLevel: data.pesticide_properties.toxicity_level,
      targetCrops: data.pesticide_properties.target_crops,
      controlTargets: data.pesticide_properties.control_targets,
      applicationMethod: data.pesticide_properties.application_method,
      dosage: data.pesticide_properties.dosage,
      dilutionRatio: data.pesticide_properties.dilution_ratio,
      safetyInterval: data.pesticide_properties.safety_interval,
      precautions: data.pesticide_properties.precautions,
      firstAid: data.pesticide_properties.first_aid,
      storageRequirements: data.pesticide_properties.storage_requirements
    }
  } else if (data.type === 'fertilizer' && data.fertilizer_properties) {
    transformed.fertilizerProperties = {
      fertilizerType: data.fertilizer_properties.fertilizer_type,
      totalNutrientContent: data.fertilizer_properties.total_nutrient_content,
      nitrogenContent: data.fertilizer_properties.nitrogen_content,
      phosphorusContent: data.fertilizer_properties.phosphorus_content,
      potassiumContent: data.fertilizer_properties.potassium_content,
      organicMatterContent: data.fertilizer_properties.organic_matter_content,
      mediumTraceElements: data.fertilizer_properties.medium_trace_elements,
      phValue: data.fertilizer_properties.ph_value,
      suitableCrops: data.fertilizer_properties.suitable_crops,
      applicationPeriod: data.fertilizer_properties.application_period,
      applicationMethod: data.fertilizer_properties.application_method,
      recommendedDosage: data.fertilizer_properties.recommended_dosage
    }
  } else if (data.type === 'seed' && data.seed_properties) {
    transformed.seedProperties = {
      cropType: data.seed_properties.crop_type,
      varietyName: data.seed_properties.variety_name,
      varietyApprovalCode: data.seed_properties.variety_approval_code,
      varietySource: data.seed_properties.variety_source,
      purity: data.seed_properties.purity,
      cleanliness: data.seed_properties.cleanliness,
      germinationRate: data.seed_properties.germination_rate,
      moistureContent: data.seed_properties.moisture_content
    }
  }

  return transformed
}
