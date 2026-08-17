export default {
  // Workflow Status
  workflowStatus: {
    S0: 'Draft',
    S1: 'Pending Approval',
    S2: 'Approved',
    S3: 'Rejected',
    S4: 'Voided',
    S9: 'Archived',
    S10: 'Cancelled'
  },

  // Business Status
  status: {
    '01': 'Ongoing',
    '02': 'Finished'
  },

  // Actions
  action: {
    add: 'Add',
    edit: 'Edit',
    view: 'View',
    submit: 'Submit',
    cancel: 'Cancel',
    void: 'Delete',
    archive: 'Archive',
    audit: 'Audit',
    delete: 'Delete',
    save: 'Save',
    return: 'Return',
    confirm: 'Confirm',
    close: 'Close',
    approve: 'Approve',
    reject: 'Reject',
    search: 'Search',
    reset: 'Reset',
    export: 'Export',
    submitConfirm: 'Are you sure to submit for audit?',
    submitSuccess: 'Submitted for audit successfully',
    cancelReason: 'Cancellation Reason',
    cancelConfirm: 'Are you sure to cancel this trial?',
    cancelSuccess: 'Cancelled successfully',
    archiveConfirm: 'Are you sure to archive this trial?',
    archiveSuccess: 'Archived successfully',
    voidConfirm: 'Are you sure to void this audit record?',
    voidSuccess: 'Voided successfully',
    voidFailed: 'Failed to void',
    voidReasonPlaceholder: 'Please enter void reason',
    voidReasonRequired: 'Void reason is required'
  },

  // List Page
  list: {
    title: 'Trial Information Management',
    trialId: 'Trial ID',
    trialName: 'Trial Name',
    batchName: 'Breeding Batch',
    cropType: 'Crop Type',
    varietyName: 'Variety Name',
    locationId: 'Research Center',
    season: 'Season',
    year: 'Year',
    status: 'Status',
    createdBy: 'Created By',
    createdTime: 'Created Time',
    modifiedBy: 'Modified By',
    modifiedTime: 'Modified Time',
    approvedBy: 'Approved By',
    approvedTime: 'Approved Time',
    submittedBy: 'Submitted By',
    submittedTime: 'Submitted Time',
    operation: 'Operation',
    searchPlaceholder: 'Enter trial name'
  },

  // Form Page
  form: {
    basicInfo: 'Basic Information',
    trialInfo: 'Trial Information',
    save: 'Save',
    saveAndSubmit: 'Save and Submit',
    submitAudit: 'Submit for Audit',
    cancelTrial: 'Cancel',
    archiveTrial: 'Archive',
    cancelReason: 'Cancellation Reason',
    cancelReasonPlaceholder: 'Enter cancellation reason',
    auditOpinion: 'Audit Opinion',
    auditOpinionPlaceholder: 'Enter audit opinion',
    rejectReason: 'Rejection Reason',
    rejectReasonPlaceholder: 'Enter rejection reason'
  },

  // Audit Page
  audit: {
    title: 'Trial Basic Information Audit',
    subtitle1: 'Review the submitted test data',
    tabs: {
      pending: 'Pending Audit',
      audited: 'Audited',
      voided: 'Voided'
    },
    list: {
      trialName: 'Trial Name',
      batchName: 'Breeding Batch',
      submitter: 'Submitter',
      submitTime: 'Submit Time',
      auditor: 'Auditor',
      auditTime: 'Audit Time',
      status: 'Status',
      workflowStatus: 'Workflow Status',
      voidReason: 'Void Reason',
      operation: 'Operation'
    },
    detail: {
      title: 'Audit Detail',
      trialInfo: 'Trial Information',
      submitInfo: 'Submit Information',
      auditInfo: 'Audit Information',
      auditAction: 'Audit Action',
      approve: 'Approve',
      reject: 'Reject'
    }
  },

  // Messages
  message: {
    selectRecord: 'Please select a record',
    confirmSubmit: 'Are you sure to submit for audit?',
    confirmCancel: 'Are you sure to cancel this trial?',
    confirmArchive: 'Are you sure to archive this trial?',
    confirmApprove: 'Are you sure to approve this audit?',
    confirmReject: 'Are you sure to reject this audit?',
    submitSuccess: 'Submitted successfully',
    cancelSuccess: 'Cancelled successfully',
    archiveSuccess: 'Archived successfully',
    auditSuccess: 'Audit completed successfully',
    saveSuccess: 'Saved successfully',
    deleteSuccess: 'Deleted successfully',
    cancelReasonRequired: 'Please enter cancellation reason',
    rejectReasonRequired: 'Please enter rejection reason',
    inputCancelReason: 'Please enter cancellation reason',
    inputRejectReason: 'Please enter rejection reason'
  },

  // Validation
  validation: {
    trialNameRequired: 'Please enter trial name',
    batchIdRequired: 'Please select breeding batch',
    cropTypeRequired: 'Please select crop type',
    varietyNameRequired: 'Please enter variety name',
    locationIdRequired: 'Please select research center',
    seasonRequired: 'Please select season',
    yearRequired: 'Please select year'
  }
}
