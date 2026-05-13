import request, { toSnakeCase } from '../utils/agricultureRequest'
import agricultureRequest from "../utils/agricultureRequest";

// 根据环境判断使用的 API 基础 URL
const API_BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_APP_LOCAL_TEST_API_URL : ''

/**
 * 提交Union注册申请
 * @param {Object} data - Union注册申请数据
 * @returns {Promise}
 */
export const submitUnionRegistration = (data) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/submit`,
    method: 'post',
    data
  })
}

/**
 * 保存Union注册草稿
 * @param {Object} data - Union注册申请数据
 * @returns {Promise}
 */
export const saveUnionRegistrationDraft = (data) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/save`,
    method: 'post',
    data
  })
}

/**
 * 查询Union注册列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getUnionList = (params) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/list`,
    method: 'get',
    params
  })
}

/**
 * 根据企业ID查询Union详情
 * @param {String} enterpriseId - 企业ID
 * @returns {Promise}
 */
export const getUnionDetail = (enterpriseId) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/${enterpriseId}`,
    method: 'get'
  })
}

/**
 * 根据当前用户查询Union注册信息
 * @returns {Promise}
 */
export const getUnionRegistrationByUser = () => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/info`,
    method: 'get'
  })
}

// 删除Union注册信息
export const deleteUnionRegistration = (enterpriseId) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/${enterpriseId}`,
    method: 'delete'
  })
}

// 批量删除Union注册信息
export const batchDeleteUnionRegistration = (enterpriseIds) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/batch`,
    method: 'delete',
    data: enterpriseIds
  })
}

/**
 * 删除Union注册信息
 * @param {Array} enterpriseIds - 企业ID数组
 * @returns {Promise}
 */
export const deleteUnion = (enterpriseIds) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/${enterpriseIds.join(',')}`,
    method: 'delete'
  })
}

/**
 * 更新认证状态
 * @param {Object} data - 状态更新数据
 * @returns {Promise}
 */
export const updateUnionStatus = (data) => {
  return request({
    url: `${API_BASE_URL}/seed/union/registration/updateStatus`,
    method: 'post',
    params: data
  })
}

/**
 * 单文件上传
 * @param {FormData} formData - 包含文件的 FormData
 * @returns {Promise}
 */
export const uploadFile = (formData) => {
  return request({
    url: `${API_BASE_URL}/common/upload`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取union详情
 * @param {number} id - unionID
 */
export const getUnionDetailByUnionId = (id, flag) => {
  return request({
    url: `${API_BASE_URL}/input/org-registration/detail`,
    method: 'get',
    params: {
      id: id,
      ...(flag === undefined ? {} : { flag })
    }
  }).then(res => {
    // 转换返回数据：驼峰转下划线
    // if (res.data) {
    //   res.data = toSnakeCase(res.data)
    // }
    return res
  })
}
