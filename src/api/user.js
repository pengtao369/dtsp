import request from '../utils/request'
import agricultureRequest from '../utils/agricultureRequest'
import { rsaEncrypt } from '../utils/rsaEncrypt'


// 获取当前用户信息（OAuth2）
export const getCurrentUserInfo = (flag) => {
  return request({
    url: '/oauth2/getCurrentUserInfo',
    method: 'get',
    params: {
      appId: 'INSPUR-ICD',
      ...(flag === undefined ? {} : { flag })
    }
  })
}

export const postUserUpdate = (params) => {
  return request({
    url: '/user/update',
    method: 'post',
    data: params
  })
}

// 修改密码（调用后端 /system/user/profile/updatePwd，需要 RSA 加密）
export const postResetPassword = (params) => {
  // 使用 RSA 加密密码
  const encryptedOldPassword = rsaEncrypt(params.oldPassword)
  const encryptedNewPassword = rsaEncrypt(params.newPassword)
  
  return agricultureRequest({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    params: {
      oldPassword: encryptedOldPassword,
      newPassword: encryptedNewPassword
    }
  })
}

export const getLogout = () => {
  return agricultureRequest({
    url: '/logout',
    method: 'post'
  })
}

export const getSsoLogout = () => {
  return agricultureRequest({
    url: '/ucif/oauth/logout',
    method: 'post',
    params: { useGrantType: 'bsp' }
  })
}


// OAuth2授权码登录
export const oauth2LoginWithCode = (code, redirectUri, grantType) => {
  const data = {
    code,
    redirectUri,
    grantType
  }
  return agricultureRequest({
    url: '/ucif/oauth/codeLogin',
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
} 
