export default {
  title: 'Seed Multiplication Information',
  subtitle: 'Manage Seed Multiplication Information',

  add: 'Add',
  edit: 'Edit Seed Multiplication Information',
  delete: 'Delete',
  view: 'View Details',
  list: 'Seed Multiplication Information List',

  searchPlaceholder: 'Search by batch ID, variety name...',
  filterByCrop: 'Filter by Crop',
  filterByStatus: 'Filter by Status',
  allCrops: 'All Crops',
  allStatus: 'All Status',

  form: {
    basicInfo: 'Basic Information',
    breedingInfo: 'Breeding Information',
    orgInfo: 'Organization Information',
    batchId: 'Batch ID',
    linkedBatchNo: 'Linked Batch No.',
    propagationId: 'Related Application ID',
    cropType: 'Crop Type',
    varietyName: 'Variety Name',
    varietyCode: 'Variety Code',
    breedingLevel: 'Breeding Level',
    breedingMethod: 'Breeding Method',
    parentSeedSource: 'Parent Seed Source',
    startDate: 'Start Date',
    endDate: 'End Date',
    expectedYield: 'Expected Yield (kg)',
    actualYield: 'Actual Yield (kg)',
    plantingArea: 'Planting Area (ha)',
    quantityToMultiply: 'Quantity to Multiply (kg)',
    multiplicationLevel: 'Multiplication Level',
    batchStatus: 'Batch Status',
    orgId: 'Organization ID',
    orgName: 'Organization Name',
    orgType: 'Organization Type',
    location: 'Propagation Location',
    remark: 'Remarks'
  },

  placeholder: {
    linkedBatchNo: 'Please select an approved propagation application',
    cropType: 'Please select crop type',
    varietyName: 'Please enter variety name',
    varietyCode: 'Please enter variety code',
    breedingLevel: 'Please select breeding level',
    breedingMethod: 'Please select breeding method',
    parentSeedSource: 'Please enter parent seed source',
    startDate: 'Please select start date',
    endDate: 'Please select end date',
    expectedYield: 'Please enter expected yield',
    actualYield: 'Please enter actual yield',
    plantingArea: 'Please enter planting area',
    orgId: 'Organization ID',
    orgName: 'Organization Name',
    location: 'Please enter propagation location',
    remark: 'Please enter remarks'
  },

  columns: {
    batchId: 'Batch ID',
    cropType: 'Crop Type',
    varietyName: 'Variety Name',
    breedingLevel: 'Breeding Level',
    startDate: 'Start Date',
    status: 'Status',
    trackingCount: 'Tracking Records',
    testCount: 'Test Records',
    actions: 'Actions'
  },

  breedingLevel: {
    parentPrep: 'Parent Preparation',
    original: 'Pre-basic/Breeder Seed',
    foundation: 'Basic/Foundation Seed',
    certified: 'Certified Seed'
  },

  status: {
    ongoing: 'Ongoing',
    completed: 'Completed',
    terminated: 'Terminated',
    voided: 'Voided'
  },

  auditApproved: 'Approved',

  detail: {
    title: 'Details',
    tabs: {
      basicInfo: 'Basic Info',
      trackingRecords: 'Tracking Records',
      testRecords: 'Test Records'
    },
    basicInfo: 'Basic Information',
    timeline: 'Timeline',
    yieldData: 'Yield Data',
    relatedRecords: 'Related Records',
    orgInfo: 'Organization Information',
    trackingCount: 'Tracking Records Count',
    testCount: 'Test Records Count'
  },

  rules: {
    cropTypeRequired: 'Please select crop type',
    varietyNameRequired: 'Please enter variety name',
    breedingLevelRequired: 'Please select breeding level',
    startDateRequired: 'Please select start date'
  },

  messages: {
    addSuccess: 'Batch added successfully',
    updateSuccess: 'Batch updated successfully',
    deleteSuccess: 'Batch voided successfully',
    deleteConfirm: 'Are you sure to void this batch?',
    loadError: 'Failed to load data',
    deleteInvalid: 'Void'
  },

  tracking: {
    add: 'Add Tracking',
    edit: 'Edit Tracking',
    detail: 'Tracking Details',
    deleteConfirm: 'Are you sure to void this tracking record?',
    trackingId: 'Tracking ID',
    location: 'Location',
    result: 'Tracking Result',
    startDate: 'Start Date',
    endDate: 'End Date',
    operator: 'Operator',
    description: 'Description',
    trackingDesc: 'Tracking Description',
    resultNormal: 'Normal',
    resultAbnormal: 'Abnormal',
    resultObserving: 'Observing',
    seedClass: 'Seed Class',
    lotId: 'Lot ID',
    stage: 'Inspection Stage',
    score: 'Score',
    inspectionValue: 'Inspection Value',
    remarks: 'Remarks'
  },

  test: {
    add: 'Add Test',
    edit: 'Edit Test',
    detail: 'Test Details',
    deleteConfirm: 'Are you sure to void this test record?',
    testId: 'Test ID',
    testItem: 'Test Item',
    testDate: 'Test Date',
    testValue: 'Test Value',
    testResult: 'Test Result',
    tester: 'Tester',
    testOrg: 'Test Organization',
    testLocation: 'Test Location',
    description: 'Description',
    testDesc: 'Test Description',
    resultPass: 'Pass',
    resultFail: 'Fail',
    resultRetest: 'Pending Retest',
    seedClass: 'Seed Class',
    lotId: 'Lot ID',
    testType: 'Test Type',
    unit: 'Unit',
    passStatus: 'Pass Status',
    passed: 'Passed',
    failed: 'Failed',
    passTrue: 'Passed',
    passFalse: 'Failed',
    remarks: 'Remarks'
  }
}
