export default {
  // 审核状态 (Workflow Status)
  workflowStatus: {
    S0: '草稿',
    S1: '待审批',
    S2: '已审批',
    S3: '已退回',
    S4: '已作废',
    S9: '已归档',
    S10: '作废'
  },

  // 业务状态 (Business Status)
  status: {
    '01': '进行中',
    '02': '已完成'
  },

  // 操作按钮
  action: {
    add: '新增',
    edit: '编辑',
    view: '查看',
    submit: '提交',
    cancel: '作废',
    void: '删除',
    archive: '归档',
    audit: '审核',
    delete: '删除',
    save: '保存',
    return: '返回',
    confirm: '确定',
    close: '取消',
    approve: '通过',
    reject: '退回',
    search: '查询',
    reset: '重置',
    export: '导出',
    submitConfirm: '确定要提交审核吗?',
    submitSuccess: '提交审核成功',
    cancelReason: '作废原因',
    cancelConfirm: '确定要作废该试验吗?',
    cancelSuccess: '作废成功',
    archiveConfirm: '确定要归档该试验吗?',
    archiveSuccess: '归档成功',
    voidConfirm: '确定要作废该审核记录吗?',
    voidSuccess: '作废成功',
    voidFailed: '作废失败',
    voidReasonPlaceholder: '请输入作废原因',
    voidReasonRequired: '请输入作废原因'
  },

  // 列表页
  list: {
    title: '试验基础信息管理',
    trialId: '试验ID',
    trialName: '试验名称',
    batchName: '育种批次',
    cropType: '作物类型',
    varietyName: '品种名称',
    locationId: '研究中心',
    season: '季节',
    year: '年份',
    status: '状态',
    createdBy: '创建人',
    createdTime: '创建时间',
    modifiedBy: '修改人',
    modifiedTime: '修改时间',
    approvedBy: '审批人',
    approvedTime: '审批时间',
    submittedBy: '提交人',
    submittedTime: '提交时间',
    operation: '操作',
    searchPlaceholder: '请输入试验名称'
  },

  // 表单页
  form: {
    basicInfo: '基本信息',
    trialInfo: '试验信息',
    save: '保存',
    saveAndSubmit: '保存并提交',
    submitAudit: '提交审核',
    cancelTrial: '作废',
    archiveTrial: '归档',
    cancelReason: '作废原因',
    cancelReasonPlaceholder: '请输入作废原因',
    auditOpinion: '审核意见',
    auditOpinionPlaceholder: '请输入审核意见',
    rejectReason: '退回原因',
    rejectReasonPlaceholder: '请输入退回原因'
  },

  // 审核页
  audit: {
    title: '试验基础信息管理审核',
    subtitle1: '对已提交试验数据进行审核',
    tabs: {
      pending: '待审核',
      audited: '已审核',
      voided: '已作废'
    },
    list: {
      trialName: '试验名称',
      batchName: '育种批次',
      submitter: '提交人',
      submitTime: '提交时间',
      auditor: '审核人',
      auditTime: '审核时间',
      status: '审核状态',
      voidReason: '作废原因',
      operation: '操作'
    },
    detail: {
      title: '审核详情',
      trialInfo: '试验信息',
      submitInfo: '提交信息',
      auditInfo: '审核信息',
      auditAction: '审核操作',
      approve: '通过',
      reject: '退回'
    }
  },

  // 提示信息
  message: {
    selectRecord: '请选择要操作的记录',
    confirmSubmit: '确定要提交审核吗?',
    confirmCancel: '确定要作废该试验吗?',
    confirmArchive: '确定要归档该试验吗?',
    confirmApprove: '确定要通过该审核吗?',
    confirmReject: '确定要退回该审核吗?',
    submitSuccess: '提交成功',
    cancelSuccess: '作废成功',
    archiveSuccess: '归档成功',
    auditSuccess: '审核成功',
    saveSuccess: '保存成功',
    deleteSuccess: '删除成功',
    cancelReasonRequired: '请输入作废原因',
    rejectReasonRequired: '请输入退回原因',
    inputCancelReason: '请输入作废原因',
    inputRejectReason: '请输入退回原因'
  },

  // 验证提示
  validation: {
    trialNameRequired: '请输入试验名称',
    batchIdRequired: '请选择育种批次',
    cropTypeRequired: '请选择作物类型',
    varietyNameRequired: '请输入品种名称',
    locationIdRequired: '请选择研究中心',
    seasonRequired: '请选择季节',
    yearRequired: '请选择年份'
  }
}
