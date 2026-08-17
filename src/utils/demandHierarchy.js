import { getUserInfo } from '@/utils/auth'

const normalizeCode = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

const pickFirstCode = (...values) => {
  for (const value of values) {
    const normalized = normalizeCode(value)
    if (normalized) return normalized
  }
  return ''
}

const parseStoredUserInfo = () => {
  try {
    return getUserInfo() || {}
  } catch (error) {
    return {}
  }
}

export const getCurrentDeptCode = () => {
  const userInfo = parseStoredUserInfo()
  const user = userInfo.user || userInfo.userInfo?.user || {}
  const dept = userInfo.dept || user.dept || {}

  return pickFirstCode(
    userInfo.deptId,
    user.deptId,
    dept.deptId,
    userInfo.divisionId,
    user.divisionId,
    userInfo.deptCode,
    user.deptCode,
    dept.deptCode,
    userInfo.regionCode,
    user.regionCode
  )
}

export const getCurrentUserIdentity = () => {
  const userInfo = parseStoredUserInfo()
  const user = userInfo.user || userInfo.userInfo?.user || {}

  return {
    currentUserId: pickFirstCode(userInfo.userId, userInfo.id, user.userId, user.id),
    currentUserName: userInfo.nickName || userInfo.userName || user.nickName || user.userName || ''
  }
}

export const getDemandKebeleCode = (row = {}) => {
  return pickFirstCode(
    row.kebele,
    row.kebeleCode,
    row.kebeleId,
    row.kebeleDeptId,
    row.village,
    row.villageCode,
    row.sourceCode,
    row.deptId
  )
}

export const withDemandRegionAliases = (data = {}) => {
  const zoneCode = pickFirstCode(data.zone, data.zoneCode)
  const woredaCode = pickFirstCode(data.woreda, data.woredaCode)
  const kebeleCode = getDemandKebeleCode(data)

  return {
    ...data,
    zone: zoneCode,
    zoneCode,
    woreda: woredaCode,
    woredaCode,
    kebele: kebeleCode,
    kebeleCode,
    village: pickFirstCode(data.village, kebeleCode)
  }
}
