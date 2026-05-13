export default {
  title: 'Region Demand Aggregation Audit',
  subtitle: 'Review zone-level submitted demand aggregation data',
  listTitle: 'Zone-level Aggregation Records List',

  actions: {
    viewDetail: 'View Detail',
    approve: 'Approve',
    reject: 'Reject',
  },

  columns: {
    sourceCode: 'Source Code',
    sourceName: 'Source Name',
    targetCode: 'Target Code',
    targetName: 'Target Name',
    status: 'Status',
    actions: 'Actions',
  },

  status: {
    draft: 'Draft',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  },

  approveDialog: {
    confirmMessage: 'Are you sure to aggregate this record?',
  },

  rejectDialog: {
    confirmMessage: 'Are you sure to reject this record?',
  },

  detailDialog: {
    title: 'Aggregation Detail',
    noData: 'No detail data available',
  },

  adjustment: {
    title: 'REGION LEVEL - Adjust Demand Received from Zone',
    index: '#',
    emptyTitle: 'Select a detail row',
    emptyTip: 'Use Adjust or View History to review and manage one demand item.',
    zoneName: 'Zone Name',
    inputType: 'Input Type',
    category: 'Category',
    variety: 'Variety',
    season: 'Season',
    receivedDemand: 'Received Demand from Zone',
    adjustedDemand: 'Adjusted Demand by Region',
    currentAdjustedDemand: 'Current Adjusted Demand by Region',
    newAdjustedDemand: 'New Adjusted Demand by Region',
    adjustmentRemark: 'Adjustment Remark',
    status: 'Status',
    adjust: 'Adjust',
    adjustPanelTitle: 'Adjust Demand',
    submitToZone: 'Submit',
    alreadySubmitted: 'Already Submitted',
    viewHistory: 'View History',
    historyTitle: 'Adjustment History',
    saveAdjustment: 'Save Adjustment',
    cancel: 'Cancel',
    originalQuantity: 'Original Quantity',
    beforeQuantity: 'Before',
    afterQuantity: 'After',
    operator: 'Operator',
    operationType: 'Operation Type',
    operationTime: 'Operation Time',
    remark: 'Remark',
    noHistory: 'No adjustment history',
    saveSuccess: 'Adjustment saved successfully',
    saveFailed: 'Failed to save adjustment',
    historyLoadFailed: 'Failed to load adjustment history',
    submitConfirm: 'Are you sure to submit this detail?',
    submitSuccess: 'Submitted successfully',
    submitFailed: 'Failed to submit',
    requiredAdjustedQuantity: 'Please enter the adjusted quantity',
    requiredAdjustmentRemark: 'Please enter the adjustment remark',
  },

  adjustmentStatus: {
    pending: 'Pending',
    adjusted: 'Adjusted',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
  },

  messages: {
    noData: 'No data available',
    loadFailed: 'Failed to load data',
    detailLoadFailed: 'Failed to load detail data',
    approveSuccess: 'Aggregated successfully',
    approveFailed: 'Aggregation failed',
    rejectSuccess: 'Rejected successfully',
    rejectFailed: 'Failed to reject',
  },
}
