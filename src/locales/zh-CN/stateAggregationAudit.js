export default {
  title: '州级需求汇聚审核',
  subtitle: '审核区级提交的需求汇聚数据',
  listTitle: '区级汇聚记录列表',

  actions: {
    viewDetail: '查看明细',
    approve: '审批通过',
    reject: '驳回',
  },

  columns: {
    sourceCode: '来源区划代码',
    sourceName: '来源区划名称',
    targetCode: '目标区划代码',
    targetName: '目标区划名称',
    status: '状态',
    actions: '操作',
  },

  status: {
    draft: '草稿',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
  },

  approveDialog: {
    confirmMessage: '确定要汇聚这条记录吗？',
  },

  rejectDialog: {
    confirmMessage: '确定要驳回这条记录吗？',
  },

  detailDialog: {
    title: '汇聚明细',
    noData: '暂无明细数据',
  },

  adjustment: {
    title: 'REGION LEVEL - 调整来自 Zone 的需求',
    index: '#',
    emptyTitle: '请选择一条明细',
    emptyTip: '点击调整或查看历史后，可在此处管理单条需求明细。',
    zoneName: 'Zone 名称',
    inputType: '投入品类型',
    category: '类别',
    variety: '品种',
    season: '季节',
    receivedDemand: 'Zone 上报需求',
    adjustedDemand: 'Region 调整后需求',
    currentAdjustedDemand: '当前 Region 调整后需求',
    newAdjustedDemand: '新的 Region 调整后需求',
    adjustmentRemark: '调整备注',
    status: '状态',
    adjust: '调整',
    adjustPanelTitle: '调整需求',
    submitToZone: '提交',
    alreadySubmitted: '已提交',
    viewHistory: '查看历史',
    historyTitle: '调整历史',
    saveAdjustment: '保存调整',
    cancel: '取消',
    originalQuantity: '原始数量',
    beforeQuantity: '调整前',
    afterQuantity: '调整后',
    operator: '操作人',
    operationType: '操作类型',
    operationTime: '操作时间',
    remark: '备注',
    noHistory: '暂无调整历史',
    saveSuccess: '调整保存成功',
    saveFailed: '调整保存失败',
    historyLoadFailed: '调整历史加载失败',
    submitConfirm: '确认提交此明细吗？',
    submitSuccess: '提交成功',
    submitFailed: '提交失败',
    requiredAdjustedQuantity: '请输入调整后数量',
    requiredAdjustmentRemark: '请输入调整备注',
  },

  adjustmentStatus: {
    pending: '待处理',
    adjusted: '已调整',
    submitted: '已提交',
    approved: '已通过',
    rejected: '已驳回',
  },

  messages: {
    noData: '暂无数据',
    loadFailed: '加载数据失败',
    detailLoadFailed: '加载明细数据失败',
    approveSuccess: '汇聚成功',
    approveFailed: '汇聚失败',
    rejectSuccess: '驳回成功',
    rejectFailed: '驳回失败',
  },
}
