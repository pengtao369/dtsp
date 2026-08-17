// 育种许可数据录入国际化文件
export default {
  title: 'Breeding License Data Entry',
  subtitle: 'Enter breeding license information and variety traits data',
  list: 'License List',
  add: 'Add License',
  edit: 'Edit License',
  detail: 'License Detail',
  viewDetail: 'View Detail',
  editTitle: 'Edit Breeding License',
  addTitle: 'Add Breeding License',
  editSubtitle: 'Edit breeding license information',
  addSubtitle: 'Add breeding license information',

  // Search and Filter
  searchPlaceholder: 'Search license number, batch name',
  filterByStatus: 'Filter by License Status',
  filterByApprovalDate: 'Filter by Approval Date',
  allStatus: 'All Status',

  // License Status
  status: {
    valid: 'Valid',
    expired: 'Expired',
    revoked: 'Revoked',
  },

  // Table Columns
  columns: {
    licenseNo: 'License No.',
    batchName: 'Batch Name',
    cropType: 'Crop Type',
    varietyName: 'Variety Name',
    approvalOrg: 'Approval Organization',
    approvalDate: 'Approval Date',
    validStartDate: 'Valid Start Date',
    validEndDate: 'Valid End Date',
    licenseStatus: 'License Status',
    createTime: 'Created Time',
    actions: 'Actions',
  },

  // Detail Page Section Titles
  sections: {
    basicInfo: 'Basic Information',
    licenseInfo: 'License Information',
    varietyTraits: 'Variety Traits',
    yieldInfo: 'Yield Potential',
    resistanceInfo: 'Resistance Information',
    otherInfo: 'Other Information',
    statistics: 'Data Statistics',
  },

  // Form Fields
  form: {
    title: 'License Information',
    // Basic Information
    basicInfo: 'Basic Information',
    batchId: 'Breeding Batch',
    batchName: 'Batch Name',
    datasetId: 'Dataset',
    datasetCode: 'Dataset Code',
    cropType: 'Crop Type',
    varietyName: 'Variety Name',

    // License Information
    licenseInfo: 'License Information',
    licenseNo: 'License Number',
    approvalOrg: 'Approval Organization',
    approvalDate: 'Approval Date',
    validStartDate: 'Valid Start Date',
    validEndDate: 'Valid End Date',
    certificateFile: 'Certificate File',
    licenseStatus: 'License Status',
    remark: 'Remark',

    // Variety Traits
    varietyTraits: 'Variety Traits',
    minYieldPotential: 'Min Yield Potential (t/ha)',
    maxYieldPotential: 'Max Yield Potential (t/ha)',
    diseaseResistance: 'Disease Resistance ',
    stressTolerance: 'Stress Tolerance ',
    maturityDays: 'Maturity Days',
    plantHeight: 'Plant Height (cm)',
    grainQualityTraits: 'Grain Quality Traits',
    otherTraits: 'Other Traits ',

    // Operation Information
    operationInfo: 'Operation Information',
    createTime: 'Created Time',
    createBy: 'Created By',
    updateTime: 'Updated Time',
    updateBy: 'Updated By',
    datePlaceholder: 'Please select date',
    fileTip: 'Supports PDF, JPG, PNG format, size not exceeding 5MB',
  },

  // Form Placeholders
  placeholder: {
    batchId: 'Please select breeding batch',
    datasetId: 'Please select dataset (optional)',
    cropType: 'Please enter crop type',
    varietyName: 'Please enter variety name',
    licenseNo: 'Please enter license number',
    approvalOrg: 'Please enter approval organization',
    approvalDate: 'Please select approval date',
    validStartDate: 'Please select valid start date',
    validEndDate: 'Please select valid end date',
    certificateFile: 'Please upload certificate file',
    licenseStatus: 'Please select license status',
    remark: 'Please enter remark (optional)',
    minYieldPotential: 'Please enter minimum yield potential',
    maxYieldPotential: 'Please enter maximum yield potential',
    diseaseResistance: 'e.g.: {"rust":"high","blight":"medium"}',
    stressTolerance: 'e.g.: {"drought":"high","heat":"medium"}',
    maturityDays: 'Please enter maturity days',
    plantHeight: 'Please enter plant height',
    grainQualityTraits: 'Please enter grain quality traits',
    otherTraits: 'e.g.: {"lodging_resistance":"good"}',
  },

  // Form Validation Rules
  rules: {
    batchIdRequired: 'Please select breeding batch',
    cropTypeRequired: 'Please enter crop type',
    varietyNameRequired: 'Please enter variety name',
    licenseNoRequired: 'Please enter license number',
    approvalOrgRequired: 'Please enter approval organization',
    approvalDateRequired: 'Please select approval date',
    validStartDateRequired: 'Please select valid start date',
    validEndDateRequired: 'Please select valid end date',
    licenseStatusRequired: 'Please select license status',
    minYieldPotentialMin: 'Minimum yield potential must be greater than 0',
    maxYieldPotentialMin: 'Maximum yield potential must be greater than 0',
    maturityDaysMin: 'Maturity days must be greater than 0',
    plantHeightMin: 'Plant height must be greater than 0',
    jsonFormat: 'Please enter valid JSON format',
    batchRequired: 'Please select breeding batch',
    materialRequired: 'Please enter material name',
    numberRequired: 'Please enter license number',
    applyDateRequired: 'Please select apply date',
    expiryDateRequired: 'Please select expiry date',
    statusRequired: 'Please select status',
    agencyRequired: 'Please enter agency',
    holderRequired: 'Please enter holder',
  },

  // Action Buttons：
  actions: {
    add: 'Add License',
    edit: 'Edit',
    delete: 'Delete',
    detail: 'View Detail',
    backToList: 'Back to List',
    submit: 'Submit',
    cancel: 'Cancel',
    search: 'Search',
    reset: 'Reset',
    upload: 'Upload File',
  },

  // Messages：
  message: {
    addSuccess: 'License added successfully',
    updateSuccess: 'License updated successfully',
    deleteSuccess: 'License voided successfully',
    submitSuccess: 'Submitted successfully',
    confirmDelete: 'Are you sure you want to void the selected license(s)?',
    selectAtLeastOne: 'Please select at least one record',
    batchAlreadyHasLicense: 'This batch already has a license',
    datasetNotApproved: 'Dataset has not been approved yet',
    licenseNoExists: 'License number already exists',
    loading: 'Loading...',
    noData: 'No data',
  },

  // Statistics
  statistics: {
    totalLicenses: 'Total Licenses',
    validLicenses: 'Valid Licenses',
    expiredLicenses: 'Expired Licenses',
    revokedLicenses: 'Revoked Licenses',
  },
}
