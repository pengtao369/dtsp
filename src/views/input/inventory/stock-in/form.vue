<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部（带返回按钮） -->
      <div class="page-header">
        <div class="header-left">
          <el-button class="back-btn" @click="goBack">
            <i class="ri-arrow-left-line"></i>
          </el-button>
          <div class="header-content">
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="content-wrapper">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" v-loading="loading">
          <!-- 基本信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-information-line"></i>
                <span>{{ $t('input.catalog.form.basicInfo') }}</span>
              </div>
            </div>
            <div class="card-body">
              <!-- 两列布局 -->
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockIn.form.type')" prop="inboundType">
                    <el-select v-model="formData.inboundType" :placeholder="$t('input.inventory.stockIn.placeholder.type')" style="width: 100%">
                      <el-option :label="$t('input.inventory.stockIn.type.production')" :value="0" />
                      <el-option :label="$t('input.inventory.stockIn.type.purchase')" :value="1" />
                      <el-option :label="$t('input.inventory.stockIn.type.transfer')" :value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockIn.form.warehouseName')" prop="warehouseId">
                    <el-select
                      v-model="formData.warehouseId"
                      :placeholder="$t('input.inventory.stockIn.placeholder.warehouseName')"
                      filterable
                      clearable
                      style="width: 100%"
                      :loading="warehouseLoading"
                    >
                      <el-option
                        v-for="warehouse in warehouseList"
                        :key="warehouse.warehouse_id"
                        :label="`${warehouse.warehouse_name} (${warehouse.warehouse_code})`"
                        :value="warehouse.warehouse_id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockIn.form.relatedOrderNo')" prop="relatedOrderNo">
                    <el-select
                      v-model="formData.relatedOrderNo"
                      :placeholder="$t('input.inventory.stockIn.placeholder.relatedOrderNo')"
                      filterable
                      clearable
                      style="width: 100%"
                      :loading="distributionLoading"
                      @change="handleDistributionChange"
                    >
                      <el-option
                        v-for="distribution in distributionList"
                        :key="distribution.id"
                        :label="distribution.releaseName"
                        :value="distribution.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" class="hidden-field">
                  <el-form-item :label="$t('input.inventory.stockIn.form.supplierName')" prop="supplierName">
                    <el-input v-model="formData.supplierName" :placeholder="$t('input.inventory.stockIn.placeholder.supplierName')" clearable />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" class="hidden-field">
                  <el-form-item :label="$t('input.inventory.stockIn.form.supplierContact')" prop="supplierContact">
                    <el-input v-model="formData.supplierContact" :placeholder="$t('input.inventory.stockIn.placeholder.supplierContact')" clearable />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" class="hidden-field">
                  <el-form-item :label="$t('input.inventory.stockIn.form.supplierPhone')" prop="supplierPhone">
                    <el-input v-model="formData.supplierPhone" :placeholder="$t('input.inventory.stockIn.placeholder.supplierPhone')" clearable />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockIn.form.operator')" prop="operator">
                    <el-input v-model="formData.operator" :placeholder="$t('input.inventory.stockIn.placeholder.operator')" clearable />
                  </el-form-item>
                </el-col>
                <el-col :xs="24">
                  <el-form-item :label="$t('input.inventory.stockIn.form.remark')" prop="remark">
                    <el-input v-model="formData.remark" :placeholder="$t('input.inventory.stockIn.placeholder.remark')" type="textarea" :rows="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 入库投入品明细 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-archive-line"></i>
                <span>{{ $t('input.inventory.stockIn.inputDetails') }}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="items-list">
                <div v-for="(item, index) in formData.details" :key="index" class="item-row">
                  <div class="item-fields">
                    <el-form-item :label="$t('input.inventory.stockIn.form.inputName')" :prop="`details.${index}.inputId`" :rules="detailRules.inputId">
                      <el-select
                        v-model="item.inputId"
                        :placeholder="$t('input.inventory.stockIn.placeholder.inputName')"
                        filterable
                        clearable
                        style="width: 100%"
                        :loading="inputLoading"
                        @change="handleInputChange(item, index)">
                        <el-option
                          v-for="input in getFilteredInputs(item)"
                          :key="input.inputId"
                          :label="input.inputName"
                          :value="input.inputId"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.inputId')" :prop="`details.${index}.inputCode`">
                      <el-input v-model="item.inputCode" disabled :placeholder="$t('input.inventory.stockIn.placeholder.inputId')" />
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.inboundBatch')" :prop="`details.${index}.batchNo`">
                      <el-input v-model="item.batchNo" disabled :placeholder="$t('input.inventory.stockIn.placeholder.inboundBatch')" />
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.productionBatch')" :prop="`details.${index}.productionBatchNo`">
                      <el-input v-model="item.productionBatchNo" :placeholder="$t('input.inventory.stockIn.placeholder.productionBatch')" clearable />
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.inputType')" :prop="`details.${index}.inputType`">
                      <el-select
                        v-model="item.inputType"
                        :placeholder="$t('input.inventory.stockIn.placeholder.inputType')"
                        style="width: 100%"
                        @change="handleItemTypeChange(item, index)"
                        v-loading="dictLoading">
                        <el-option
                          v-for="typeItem in options.input_type"
                          :key="typeItem.value"
                          :label="typeItem.label"
                          :value="typeItem.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.agriculturalInputType')" :prop="`details.${index}.agriculturalInputType`">
                      <el-select
                        v-model="item.agriculturalInputType"
                        :placeholder="$t('input.inventory.stockIn.placeholder.agriculturalInputType')"
                        style="width: 100%"
                        @change="handleItemCategoryChange(item, index)"
                        v-loading="dictLoading">
                        <el-option
                          v-for="categoryItem in getFilteredCategories(item.inputType)"
                          :key="categoryItem.value"
                          :label="categoryItem.label"
                          :value="categoryItem.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.specification')" :prop="`details.${index}.specification`">
                      <el-input v-model="item.specification" :placeholder="$t('input.inventory.stockIn.placeholder.specification')" clearable />
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.quantity')" :prop="`details.${index}.quantity`" :rules="detailRules.quantity">
                      <el-input-number v-model="item.quantity" :min="0.01" :step="1" :precision="2" :placeholder="$t('input.inventory.stockIn.placeholder.quantity')" style="width: 100%" />
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.unit')" :prop="`details.${index}.unit`" :rules="detailRules.unit">
                      <el-select
                        v-model="item.unit"
                        :placeholder="$t('input.inventory.stockIn.placeholder.unit')"
                        style="width: 100%"
                        clearable
                        v-loading="dictLoading">
                        <el-option
                          v-for="unitItem in options.input_material_unit"
                          :key="unitItem.value"
                          :label="unitItem.label"
                          :value="unitItem.value"
                        />
                      </el-select>
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.expiryDate')" :prop="`details.${index}.expiryDate`" :rules="detailRules.expiryDate">
                      <el-date-picker v-model="item.expiryDate" type="date" :placeholder="$t('input.inventory.stockIn.placeholder.expiryDate')" style="width: 100%" value-format="YYYY-MM-DD" />
                    </el-form-item>
                    <el-form-item :label="$t('input.inventory.stockIn.form.qrCode')" :prop="`details.${index}.qrCode`" class="hidden-field">
                      <el-input v-model="item.qrCode" disabled :placeholder="$t('input.inventory.stockIn.placeholder.qrCode')" />
                    </el-form-item>
                  </div>
                  <div class="item-actions">
                    <el-button type="danger" link @click="removeDetail(index)" :disabled="formData.details.length === 1">
                      <i class="ri-delete-bin-line"></i>
                      <span class="btn-text">{{ $t('common.delete') }}</span>
                    </el-button>
                  </div>
                </div>
              </div>

              <el-button type="primary" plain @click="addDetail" class="add-item-btn">
                <i class="ri-add-line"></i>
                {{ $t('input.inventory.stockIn.addInput') }}
              </el-button>
            </div>
          </div>

          <!-- 操作按钮区域（固定在底部） -->
          <div class="form-actions">
            <el-button v-for="button in getActionButtons()" :key="button.action"
              :type="button.type" @click="handleAction(button.action)"
              :loading="submitLoading && button.action === 'save'">
              {{ $t(`common.${button.label}`) }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { createInboundOrder, getInboundOrderDetail } from '@/api/inbound'
import { getWarehouseList } from '@/api/inventory'
import { getInputList } from '@/api/input'
import { getDistributionList, getDistributionDetail } from '@/api/distribution'
import { useDict, clearDictCache } from '@/hooks/useDict'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const loading = ref(false)
const isEdit = computed(() => !!route.params.id)

// 根据路由路径和参数判断页面模式
const pageMode = computed(() => {
  // 优先使用 query 参数
  if (route.query.mode) {
    return route.query.mode
  }
  // 根据路由路径判断
  if (route.path.includes('/audit/')) {
    return 'audit'
  }
  if (route.path.includes('/detail/')) {
    return 'view'
  }
  // 默认逻辑
  return isEdit.value ? 'edit' : 'add'
})

// 页面标题
const pageTitle = computed(() => {
  switch (pageMode.value) {
    case 'audit':
      return t('input.inventory.stockIn.audit.title')
    case 'view':
      return t('input.inventory.stockIn.detail')
    case 'edit':
      return t('input.inventory.stockIn.edit')
    default:
      return t('input.inventory.stockIn.create')
  }
})

// 根据页面模式返回不同的按钮
const getActionButtons = () => {
  const mode = pageMode.value

  // 新建/编辑模式
  if (mode === 'add' || mode === 'edit') {
    return [
      { type: '', label: 'cancel', action: 'cancel' },
      { type: 'primary', label: 'save', action: 'save' }
    ]
  }

  // 审批模式
  if (mode === 'audit') {
    return [
      { type: '', label: 'cancel', action: 'cancel' },
      { type: 'success', label: 'approve', action: 'approve' },
      { type: 'danger', label: 'reject', action: 'reject' }
    ]
  }

  // 查看模式
  if (mode === 'view') {
    return [
      { type: '', label: 'cancel', action: 'cancel' },
      { type: 'primary', label: 'archive', action: 'archive' },
      { type: 'danger', label: 'delete', action: 'cancelBatch' }
    ]
  }

  return [
    { type: '', label: 'cancel', action: 'cancel' },
    { type: 'primary', label: 'save', action: 'save' }
  ]
}

// 统一的动作处理方法
const handleAction = (action) => {
  switch (action) {
    case 'cancel':
      goBack()
      break
    case 'save':
      handleSubmit()
      break
    case 'approve':
      // 审批通过逻辑
      break
    case 'reject':
      // 审批驳回逻辑
      break
    case 'archive':
      // 归档逻辑
      break
    case 'cancelBatch':
      // 作废逻辑
      break
  }
}

// 格式化日期时间，将ISO格式(2025-12-14T01:40:59)改为标准格式(2025-12-04 01:40:59)
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '-'

  // 处理带时区信息的日期格式，如: 2025-12-14 11:00:27.000+08:00
  if (dateTimeStr.includes('+') && dateTimeStr.includes('.')) {
    // 提取日期部分和时间部分，去掉毫秒和时区信息
    const datePart = dateTimeStr.split(' ')[0]
    const timePart = dateTimeStr.split(' ')[1].split('.')[0]
    return `${datePart} ${timePart}`
  }

  // 处理ISO格式日期，如: 2025-12-14T11:00:27
  if (dateTimeStr.includes('T')) {
    return dateTimeStr.replace('T', ' ')
  }

  return dateTimeStr
}

// 清除字典缓存并初始化
clearDictCache('input_type')
clearDictCache('input_category')

const {
  options,
  loading: dictLoading,
  refresh: refreshDict
} = useDict([
  'input_type',
  'input_category',
  'input_material_unit'
], {
  immediate: true,
  cache: true
})

const formRef = ref(null)
const submitLoading = ref(false)
const warehouseLoading = ref(false)
const inputLoading = ref(false)
const distributionLoading = ref(false)

const inboundOrderId = route.params.id

// 当前用户部门ID
const currentUserOrganCode = ref('')

// 获取当前用户部门ID
const getCurrentUserOrganCode = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    const user = userInfo.user || userInfo
    return user.ORGANCODE || ''
  }
  return ''
}

// 仓库列表
const warehouseList = ref([])
// 投入品列表
const inputList = ref([])
// 分发单列表
const distributionList = ref([])

// 加载仓库列表
const loadWarehouseList = async () => {
  warehouseLoading.value = true
  try {
    const res = await getWarehouseList({
      page: 1,
      pageSize: 1000,
      status: '1', // 只获取启用的仓库
      organCode: currentUserOrganCode.value // 按部门过滤
    })
    if (res.code === 200) {
      warehouseList.value = res.data.list || []
    }
  } catch (error) {
    console.error('Failed to load warehouse list:', error)
  } finally {
    warehouseLoading.value = false
  }
}

// 加载投入品列表
const loadInputList = async () => {
  inputLoading.value = true
  try {
    const res = await getInputList({
      page: 1,
      pageSize: 1000,
      status: 'active' // 只获取启用的投入品
    })
    if (res.code === 200) {
      inputList.value = res.data.list || []
    }
  } catch (error) {
    console.error('Failed to load input list:', error)
  } finally {
    inputLoading.value = false
  }
}

// 加载分发单列表
const loadDistributionList = async () => {
  distributionLoading.value = true
  try {
    const res = await getDistributionList()
    if (res.code === 200) {
      distributionList.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load distribution list:', error)
  } finally {
    distributionLoading.value = false
  }
}

// 分发单选择变化时自动加载明细
const handleDistributionChange = async (distributionId) => {
  if (!distributionId) {
    // 清空时不做处理
    return
  }

  try {
    const res = await getDistributionDetail(distributionId)
    if (res.code === 200 && res.data) {
      const distributionData = res.data
      const details = distributionData.details || []

      if (details.length === 0) {
        ElMessage.warning(t('input.inventory.stockIn.noDistributionDetails'))
        return
      }

      // 清空现有明细
      formData.details = []

      // 根据分发单明细创建入库明细
      for (const detail of details) {
        // 查找匹配的库存项（基于投入品类型和投入品品类）
        // 注意：这里我们不再使用inputId进行匹配，而是使用投入品类型和品类
        // 从后端返回的字段名为input_type和input_category
        const inputType = detail.input_type || detail.inputType
        const inputCategory = detail.input_category || detail.inputCategory

        // 从投入品列表中查找第一个匹配投入品类型和品类的投入品作为默认值
        let matchedInput = null
        if (inputType && inputCategory) {
          matchedInput = inputList.value.find(i =>
            i.type === inputType && i.agriculturalInputType === inputCategory
          )
        }

        // 获取数量字段（可能是required或quantity）
        const quantity = detail.required || detail.quantity ||  0

        formData.details.push({
          inputId: matchedInput ? matchedInput.inputId : '',
          inputCode: matchedInput ? matchedInput.inputSku : '',
          batchNo: '', // 入库批次后端自动生成
          productionBatchNo: '', // 生产批次需手动填写
          inputType: inputType || '', // 直接使用代码值（如 'IN01'）
          agriculturalInputType: inputCategory || '', // 直接使用代码值（如 'IN01001'）
          variety: detail.variety || detail.detail_variety || '',
          specification: '',
          unit: detail.unit || '',
          quantity: quantity,
          expiryDate: '',
          qrCode: matchedInput ? matchedInput.qrCode : ''
        })
      }

      // ElMessage.success(t('input.inventory.stockIn.distributionLoaded'))
    }
  } catch (error) {
    console.error('Failed to load distribution detail:', error)
    ElMessage.error(t('input.inventory.stockIn.loadDistributionFailed'))
  }
}

// 投入品选择变化时自动填充信息
const handleInputChange = async (item, index) => {
  if (!item.inputId) {
    item.inputCode = ''
    // 不再清空类型和品类，保持用户选择
    item.variety = ''
    item.expiryDate = ''
    item.qrCode = ''
    return
  }

  const selectedInput = inputList.value.find(input => input.inputId === item.inputId)
  if (selectedInput) {
    item.inputCode = selectedInput.inputSku || ''
    // 如果用户没有手动选择类型和品类，则自动填充
    if (!item.inputType) {
      item.inputType = selectedInput.type || ''
    }
    if (!item.agriculturalInputType) {
      item.agriculturalInputType = selectedInput.agriculturalInputType || ''
    }
    item.variety = selectedInput.variety || ''
    item.qrCode = selectedInput.qrCode || ''
  }
}

// 获取投入品类型文本
const getInputTypeText = (type) => {
  // 如果是旧类型，先转换为新编码
  if (type === 'seed') type = 'IN01'
  if (type === 'fertilizer') type = 'IN02'
  if (type === 'other') type = 'IN09'
  if (type === 'pesticide') type = ''

  // 从字典中获取标签
  if (!type || !options.value.input_type) return '-'
  const typeItem = options.value.input_type.find(item => item.value === type)
  return typeItem ? typeItem.label : '-'
}

// 获取农业输入类型文本
const getAgriculturalInputTypeText = (type) => {
  // 从字典中获取标签
  if (!type || !options.value.input_category) return '-'
  const categoryItem = options.value.input_category.find(item => item.value === type)
  return categoryItem ? categoryItem.label : '-'
}

// 根据类型筛选品类选项
const getFilteredCategories = (inputType) => {
  const categoryList = options.value.input_category || []
  if (!inputType) return []

  if (inputType === 'IN01') {
    return categoryList.filter(item => item.value.startsWith('IN01'))
  } else if (inputType === 'IN02') {
    return categoryList.filter(item => item.value.startsWith('IN02'))
  }

  return []
}

// 根据类型和品类筛选投入品列表
const getFilteredInputs = (item) => {
  let filteredList = inputList.value

  // 如果选择了投入品类型，则筛选类型
  if (item.inputType) {
    filteredList = filteredList.filter(input => input.type === item.inputType)
  }

  // 如果选择了投入品品类，则进一步筛选品类
  if (item.agriculturalInputType) {
    filteredList = filteredList.filter(input => input.agriculturalInputType === item.agriculturalInputType)
  }

  return filteredList
}

// 处理投入品类型变化
const handleItemTypeChange = (item, index) => {
  // 清空品类和投入品名称
  item.agriculturalInputType = ''
  item.inputId = ''
  item.inputCode = ''
  item.variety = ''
  item.expiryDate = ''
  item.qrCode = ''
}

// 处理投入品品类变化
const handleItemCategoryChange = (item, index) => {
  // 清空投入品名称
  item.inputId = ''
  item.inputCode = ''
  item.variety = ''
  item.expiryDate = ''
  item.qrCode = ''
}

const formData = reactive({
  inboundType: 0,
  warehouseId: '',
  relatedOrderNo: '',
  supplierName: '',
  supplierType: '', // 添加供应商类型字段
  supplierId: '', // 添加供应商ID字段
  supplierContact: '',
  supplierPhone: '',
  inboundUser: '', // 添加入库用户字段
  operator: '',
  applyTime: '', // 添加申请时间字段
  remark: '',
  fremark: '', // 添加备用备注字段
  details: [
    {
      inputId: '',
      inputCode: '',
      batchNo: '', // 入库批次（自动生成，readonly）
      productionBatchNo: '', // 生产批次（手动填写）
      inputType: '',
      agriculturalInputType: '',
      variety: '',
      specification: '',
      unit: '',
      quantity: null,
      expiryDate: '',
      qrCode: ''
    }
  ]
})

const rules = computed(() => ({
  inboundType: [{ required: true, message: t('input.inventory.stockIn.rules.typeRequired'), trigger: 'change' }],
  warehouseId: [{ required: true, message: t('input.inventory.stockIn.rules.warehouseRequired'), trigger: 'change' }],
  operator: [{ required: true, message: t('input.inventory.stockIn.rules.operatorRequired'), trigger: 'blur' }]
}))

const detailRules = computed(() => ({
  inputId: [{ required: true, message: t('input.inventory.stockIn.rules.inputIdRequired'), trigger: 'change' }],
  unit: [{ required: true, message: t('input.inventory.stockIn.rules.unitRequired'), trigger: 'blur' }],
  quantity: [
    { required: true, message: t('input.inventory.stockIn.rules.quantityRequired'), trigger: 'blur' },
    { type: 'number', min: 0.01, message: t('input.inventory.stockIn.rules.quantityPositive'), trigger: 'blur' }
  ],
  expiryDate: [{ required: true, message: t('input.inventory.stockIn.rules.expiryDateRequired'), trigger: 'change' }]
}))

// 返回
const goBack = () => {
  router.back()
}

// 添加投入品明细
const addDetail = () => {
  formData.details.push({
    inputId: '',
    inputCode: '',
    batchNo: '', // 入库批次（自动生成）
    productionBatchNo: '', // 生产批次（手动填写）
    inputType: '',
    agriculturalInputType: '',
    variety: '',
    specification: '',
    unit: '',
    quantity: null,
    expiryDate: '',
    qrCode: ''
  })
}

// 移除投入品明细
const removeDetail = (index) => {
  if (formData.details.length > 1) {
    formData.details.splice(index, 1)
  } else {
    ElMessage.warning(t('input.inventory.stockIn.rules.detailsRequired'))
  }
}

// 加载详情数据
const loadData = async () => {
  if (!isEdit.value) return

  try {
    const res = await getInboundOrderDetail(inboundOrderId)
    if (res.code === 200) {
      const data = res.data
      formData.inboundType = data.inboundType || data.inbound_type
      formData.warehouseId = data.warehouseId || data.warehouse_id
      formData.relatedOrderNo = data.relatedOrderNo || data.related_order_no || ''
      formData.supplierName = data.supplierName || data.supplier_name || ''
      formData.supplierType = data.supplierType || data.supplier_type || ''
      formData.supplierId = data.supplierId || data.supplier_id || ''
      formData.supplierContact = data.supplierContact || data.supplier_contact || ''
      formData.supplierPhone = data.supplierPhone || data.supplier_phone || ''
      formData.inboundUser = data.inboundUser || data.inbound_user || ''
      formData.operator = data.operator || ''
      formData.applyTime = data.applyTime || data.apply_time || ''
      formData.remark = data.remark || ''
      formData.fremark = data.fremark || ''

      if (data.details && data.details.length > 0) {
        formData.details = data.details.map(item => {
          // 从投入品列表中查找对应的投入品信息
          const input = inputList.value.find(i => i.inputId === (item.inputId || item.input_id))

          return {
            inputId: item.inputId || item.input_id,
            inputCode: item.inputCode || item.input_code || '',
            batchNo: item.batchNo || item.batch_no || '',
            productionBatchNo: item.productionBatchNo || item.production_batch_no || '',
            inputType: input ? input.type : (item.inputType || item.input_type || ''), // 使用代码值
            agriculturalInputType: item.agriculturalInputType || item.agricultural_input_type || '', // 使用代码值
            variety: item.variety || '',
            specification: item.specification || '',
            unit: item.unit,
            quantity: item.quantity,
            expiryDate: item.expiryDate || item.expiry_date || '',
            qrCode: item.qrCode || item.qr_code || ''
          }
        })
      }
    }
  } catch (error) {
    console.error('Failed to load inbound order detail:', error)
    ElMessage.error(t('common.loadFailed'))
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (formData.details.length === 0) {
      ElMessage.warning(t('input.inventory.stockIn.rules.detailsRequired'))
      return
    }

    // 验证所有明细
    const hasEmptyDetail = formData.details.some(item =>
      !item.inputId || !item.unit || !item.quantity || !item.expiryDate
    )
    if (hasEmptyDetail) {
      ElMessage.warning(t('input.inventory.stockIn.rules.detailsComplete'))
      return
    }

    submitLoading.value = true

    const data = {
      inboundType: formData.inboundType,
      warehouseId: formData.warehouseId,
      relatedOrderNo: formData.relatedOrderNo,
      supplierName: formData.supplierName,
      supplierType: formData.supplierType, // 添加供应商类型
      supplierId: formData.supplierId, // 添加供应商ID
      supplierContact: formData.supplierContact,
      supplierPhone: formData.supplierPhone,
      inboundUser: formData.inboundUser || formData.operator, // 添加入库用户，如果没有则使用操作员
      operator: formData.operator,
      applyTime: formData.applyTime || new Date().toISOString().slice(0, 19).replace('T', ' '), // 添加申请时间，如果没有则使用当前时间
      remark: formData.remark,
      fremark: formData.fremark, // 添加备用备注
      details: formData.details.map(item => {
        const selectedInput = inputList.value.find(input => input.inputId === item.inputId)
        return {
          materialId: item.inputId,
          materialName: selectedInput ? selectedInput.inputName : '',
          materialType: selectedInput ? selectedInput.type : '', // 使用原始类型编码
          batchNo: item.batchNo,
          productionBatchNo: item.productionBatchNo, // 生产批次
          agriculturalInputType: selectedInput ? selectedInput.agriculturalInputType : '', // 使用原始农业输入类型编码
          variety: item.variety,
          specModel: item.specification,
          unitOfMeasure: item.unit,
          quantity: item.quantity,
          expiryDate: item.expiryDate,
          qrCode: item.qrCode
        }
      })
    }

    const res = await createInboundOrder(data)
    if (res.code === 200) {
      ElMessage.success(t('input.inventory.stockIn.createSuccess'))
      setTimeout(() => router.back(), 1000)
    }
  } catch (error) {
    console.error('Form validation or submission error:', error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  currentUserOrganCode.value = getCurrentUserOrganCode()

  // 先刷新字典，确保字典数据加载完成
  await refreshDict()

  await loadWarehouseList()
  await loadInputList()
  await loadDistributionList()
  await loadData()

  // 只在新增模式下自动填充操作员和入库用户
  if (!isEdit.value) {
    // 获取用户信息并自动填充操作员和入库用户
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      const user = userInfo.user || userInfo
      console.log(user)
      formData.operator = user.USERNAME || user.REALNAME || user.username || user.realName || ''
      formData.inboundUser = formData.operator // 同时填充入库用户
    }
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';

/* 隐藏字段样式 */
.hidden-field {
  display: none !important;
}

/* 投入品明细 */
.items-list {
  margin-bottom: 16px;
}

.item-row {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}

.item-fields {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 12px;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.add-item-btn {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #f0f2f5;
  margin-top: 24px;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .item-fields {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .page-header {
    margin: -16px -16px 16px -16px;
  }

  .header-content {
    padding: 0 16px;
    grid-template-columns: auto 1fr;
    gap: 16px;
  }

  .header-center {
    text-align: left;
  }

  .page-title {
    font-size: 18px;
  }

  .form-wrapper {
    padding: 16px;
  }

  .item-fields {
    grid-template-columns: repeat(2, 1fr);
  }

  .item-row {
    padding: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .btn-text {
    display: none;
  }
}

@media screen and (max-width: 480px) {
  .page-header {
    margin: -12px -12px 12px -12px;
  }

  .header-content {
    padding: 0 12px;
  }

  .page-title {
    font-size: 16px;
  }

  .form-wrapper {
    padding: 12px;
  }

  .item-fields {
    grid-template-columns: 1fr;
  }

  .item-row {
    padding: 12px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .btn-text {
    display: none;
  }
}
</style>
