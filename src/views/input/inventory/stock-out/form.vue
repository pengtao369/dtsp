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
                  <el-form-item :label="$t('input.inventory.stockOut.form.type')" prop="outbound_type">
                    <el-select
                      v-model="formData.outbound_type"
                      :placeholder="$t('input.inventory.stockOut.placeholder.type')"
                      style="width: 100%">
                      <el-option :label="$t('input.inventory.stockOut.type.sale')" :value="1" />
                      <el-option :label="$t('input.inventory.stockOut.type.transfer')" :value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockOut.form.warehouseId')" prop="warehouse_id">
                    <el-select
                      v-model="formData.warehouse_id"
                      :placeholder="$t('input.inventory.stockOut.placeholder.warehouseId')"
                      filterable
                      clearable
                      style="width: 100%"
                      :loading="warehouseLoading"
                      @change="handleWarehouseChange">
                      <el-option
                        v-for="warehouse in warehouseList"
                        :key="warehouse.warehouse_id"
                        :label="`${warehouse.warehouse_name} (${warehouse.warehouse_code || warehouse.warehouse_id})`"
                        :value="warehouse.warehouse_id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockOut.form.relatedOrderNo')" prop="related_order_no">
                    <el-select
                      v-model="formData.related_order_no"
                      :placeholder="$t('input.inventory.stockOut.placeholder.relatedOrderNo')"
                      filterable
                      clearable
                      style="width: 100%"
                      :loading="distributionLoading"
                      @focus="handleDistributionFocus"
                      @change="handleDistributionChange">
                      <el-option
                        v-for="distribution in distributionList"
                        :key="distribution.id"
                        :label="distribution.releaseName"
                        :value="distribution.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockOut.form.outboundUser')" prop="outbound_user">
                    <el-input
                      v-model="formData.outbound_user"
                      :placeholder="$t('input.inventory.stockOut.placeholder.outboundUser')"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockOut.form.outboundDept')" prop="outbound_dept">
                    <el-input
                      v-model="formData.outbound_dept"
                      :placeholder="$t('input.inventory.stockOut.placeholder.outboundDept')"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('input.inventory.stockOut.form.operator')" prop="operator">
                    <el-input
                      v-model="formData.operator"
                      :placeholder="$t('input.inventory.stockOut.placeholder.operator')"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :xs="24">
                  <el-form-item :label="$t('input.inventory.stockOut.form.remark')" prop="remark">
                    <el-input
                      v-model="formData.remark"
                      :placeholder="$t('input.inventory.stockOut.placeholder.remark')"
                      type="textarea"
                      :rows="2"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 出库明细 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-archive-line"></i>
                <span>{{ $t('input.inventory.stockOut.form.details') }}</span>
              </div>
            </div>
            <div class="card-body">

          <div class="items-list">
            <div v-for="(item, index) in formData.details" :key="index" class="item-row">
              <div class="item-fields">


                <el-form-item
                  :label="$t('input.inventory.stockIn.form.inputType')"
                  :prop="`details.${index}.inputType`"
                  :rules="detailRules.inputType"
                >
                  <el-select
                    v-model="item.inputType"
                    :placeholder="$t('input.inventory.stockIn.placeholder.inputType')"
                    class="full-width"
                    @change="handleItemTypeChange(item, index)"
                    v-loading="dictLoading"
                  >
                    <el-option
                      v-for="typeItem in options.input_type"
                      :key="typeItem.value"
                      :label="typeItem.label"
                      :value="typeItem.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item
                  :label="$t('input.inventory.stockOut.form.inputCategory')"
                  :prop="`details.${index}.agriculturalInputType`"
                >
                  <el-select
                    v-model="item.agriculturalInputType"
                    :placeholder="$t('input.inventory.stockOut.placeholder.inputCategory')"
                    class="full-width"
                    @change="handleItemCategoryChange(item, index)"
                    v-loading="dictLoading"
                  >
                    <el-option
                      v-for="categoryItem in getFilteredCategories(item.inputType)"
                      :key="categoryItem.value"
                      :label="categoryItem.label"
                      :value="categoryItem.value"
                    />
                  </el-select>
                </el-form-item>


                <el-form-item
                    :label="$t('input.inventory.stockOut.form.inputId')"
                    :prop="`details.${index}.inputId`"
                    :rules="detailRules.inputId"
                >
                  <el-select
                      v-model="item.inputId"
                      :placeholder="$t('input.inventory.stockOut.placeholder.inputId')"
                      filterable
                      clearable
                      class="full-width"
                      :loading="inputLoading"
                      @change="handleMaterialChange(index)"
                  >
                    <el-option
                        v-for="input in getFilteredInputs(item)"
                        :key="input.inputId"
                        :label="input.inputName"
                        :value="input.inputId"
                    />
                  </el-select>
                </el-form-item>

<!--                <el-form-item
                  :label="$t('input.inventory.stockOut.form.variety')"
                  :prop="`details.${index}.variety`"
                >
                  <el-input
                    v-model="item.variety"
                    :placeholder="$t('input.inventory.stockOut.placeholder.variety')"
                    readonly
                  />
                </el-form-item>-->

                <el-form-item
                  :label="$t('input.inventory.stockOut.form.batchNo')"
                  :prop="`details.${index}.materialBatchId`"
                >
                  <el-select
                    v-model="item.materialBatchId"
                    :placeholder="$t('input.inventory.stockOut.placeholder.batchNo')"
                    filterable
                    clearable
                    class="full-width"
                    @change="handleBatchChange(item, index)"
                  >
                    <el-option
                      v-for="batch in item.batchList || []"
                      :key="batch.materialBatchId"
                      :label="`${batch.materialBatchId} (Available: ${batch.capacityKg || 0} KG, ${batch.volumeL || 0} L)`"
                      :value="batch.materialBatchId"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item
                  :label="$t('input.inventory.stockOut.form.quantity')"
                  :prop="`details.${index}.quantity`"
                  :rules="detailRules.quantity"
                >
                  <el-input-number
                    v-model="item.quantity"
                    :placeholder="$t('input.inventory.stockOut.placeholder.quantity')"
                    :min="0.01"
                    :step="1"
                    :precision="2"
                    class="full-width"
                    @change="handleQuantityChange(item, index)"
                  />
                  <span v-if="item.available_quantity !== undefined" class="available-hint">
                    {{ $t('input.inventory.stockOut.form.availableQuantity') }}: {{ item.available_quantity || 0 }}
                  </span>
                </el-form-item>

                <el-form-item
                  :label="$t('input.inventory.stockOut.form.unitOfMeasure')"
                  :prop="`details.${index}.unitOfMeasure`"
                  :rules="detailRules.unitOfMeasure"
                >
                  <el-select
                    v-model="item.unitOfMeasure"
                    :placeholder="$t('input.inventory.stockOut.placeholder.unitOfMeasure')"
                    class="full-width"
                    v-loading="dictLoading"
                    @change="handleUnitChange(item, index)"
                  >
                    <el-option
                      v-for="unitItem in getFilteredUnits(item)"
                      :key="unitItem.value"
                      :label="unitItem.label"
                      :value="unitItem.value"
                    />
                  </el-select>
                  <span v-if="item.capacityWarning" class="capacity-warning">
                    {{ item.capacityWarning }}
                  </span>
                </el-form-item>

                <el-form-item
                    :label="$t('input.inventory.stockOut.form.specModel')"
                    :prop="`details.${index}.specModel`"
                >
                  <el-input
                      v-model="item.specModel"
                      :placeholder="$t('input.inventory.stockOut.placeholder.specModel')"
                      clearable
                  />
                </el-form-item>
              </div>
              <div class="item-actions">
                <el-button type="danger" link @click="removeDetail(index)">
                  <i class="ri-delete-bin-line"></i>
                  <span class="btn-text">{{ $t('input.inventory.stockOut.actions.removeItem') }}</span>
                </el-button>
              </div>
            </div>
          </div>

          <el-button type="primary" plain @click="addDetail" class="add-item-btn">
            <i class="ri-add-line"></i>
            {{ $t('input.inventory.stockOut.actions.addItem') }}
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { createOutboundOrder, validateStock } from '@/api/outbound'
import { getWarehouseList } from '@/api/inventory'
import { getStockList } from '@/api/stock'
import { getInputList } from '@/api/input'
import { getDistributionList, getDistributionDetail } from '@/api/distribution'
import { useDict, clearDictCache } from '@/hooks/useDict'

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'

  // 处理带时区和毫秒的日期格式 (如: "2025-12-14 11:00:27.000+08:00")
/*  if (dateStr.includes('+') && dateStr.includes('.')) {
    const datePart = dateStr.split(' ')[0]
    const timePart = dateStr.split(' ')[1].split('.')[0]
    return `${datePart} ${timePart}`
  }*/

  // 处理标准ISO格式 (如: "2025-12-14T01:40:59")
  return dateStr.replace('T', ' ')
}

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
      return t('input.inventory.stockOut.audit.title')
    case 'view':
      return t('input.inventory.stockOut.detail')
    case 'edit':
      return t('input.inventory.stockOut.edit')
    default:
      return t('input.inventory.stockOut.add')
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
const warehouseLoading = ref(false)

// 投入品列表 (该仓库中有库存的投入品)
const materialList = ref([])
const materialLoading = ref(false)

// 所有投入品列表
const inputList = ref([])
const inputLoading = ref(false)

// 分发单列表
const distributionList = ref([])
const distributionLoading = ref(false)

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
      warehouseList.value = res.data.items || res.data.list || []
    }
  } catch (error) {
    console.error('Failed to load warehouse list:', error)
  } finally {
    warehouseLoading.value = false
  }
}

// 根据仓库加载有库存的投入品列表
const loadMaterialListByWarehouse = async (warehouseId) => {
  if (!warehouseId) {
    materialList.value = []
    return
  }
  materialLoading.value = true
  try {
    // 通过库存API获取该仓库中有库存的投入品
    const res = await getStockList({
      warehouseId: warehouseId,
      page: 1,
      pageSize: 1000
    })

    if (res.code === 200 && res.data && res.data.items) {
      // 去重,提取唯一的投入品及其库存信息（包含批次号、农资类型、品种）
      const materialMap = new Map()
      res.data.items.forEach(item => {
        if (item.quantity > 0) {
          // 使用material_id作为键，因为API返回的是material_id而不是inputId
          const materialId = item.material_id;
          const existingMaterial = materialMap.get(materialId)
          if (existingMaterial) {
            // 累加同一投入品的库存
            existingMaterial.available_quantity += item.quantity
            // 如果有批次号，优先使用第一个批次号
            if (!existingMaterial.materialBatchId && item.material_batch_id) {
              existingMaterial.materialBatchId = item.material_batch_id
            }
            // 如果有农资类型和品种，优先使用第一个
            if (!existingMaterial.agriculturalInputType && item.agricultural_input_type) {
              existingMaterial.agriculturalInputType = getAgriculturalInputTypeText(item.agricultural_input_type)
            }
            if (!existingMaterial.variety && item.variety) {
              existingMaterial.variety = item.variety
            }
          } else {
            materialMap.set(materialId, {
              inputId: materialId, // 使用material_id作为inputId
              inputName: item.material_name, // 使用material_name作为inputName
              inputType: item.material_type || '', // 使用material_type作为inputType
              materialBatchId: item.material_batch_id || '', // 使用material_batch_id
              // 使用getAgriculturalInputTypeText函数处理农资类型
              agriculturalInputType: getAgriculturalInputTypeText(item.agricultural_input_type || ''),
              variety: item.variety || '',
              available_quantity: item.quantity
            })
          }
        }
      })
      materialList.value = Array.from(materialMap.values())

      if (materialList.value.length === 0) {
        ElMessage.warning(t('input.inventory.stockOut.messages.noStockInWarehouse'))
      }
    }
  } catch (error) {
    console.error('Failed to load material list by warehouse:', error)
    ElMessage.error(t('common.failed'))
  } finally {
    materialLoading.value = false
  }
}

const formData = reactive({
  outbound_type: 1,
  warehouse_id: '',
  related_order_no: '',
  outbound_user: '',
  outbound_dept: '',
  operator: '',
  remark: '',
  details: [
    {
      inputId: '',
      inputName: '',
      inputType: '',
      agriculturalInputType: '',
      variety: '',
      materialBatchId: '',
      batchList: [], // 批次号列表
      quantity: null,
      specModel: '',
      unitOfMeasure: '',
      available_quantity: 0,
      available_capacity_kg: 0, // 可用容量(KG)
      available_volume_l: 0, // 可用容积(L)
      capacityWarning: '' // 容量校验警告信息
    }
  ]
})

const rules = computed(() => ({
  outbound_type: [
    { required: true, message: t('input.inventory.stockOut.rules.typeRequired'), trigger: 'change' }
  ],
  warehouse_id: [
    { required: true, message: t('input.inventory.stockOut.rules.warehouseIdRequired'), trigger: 'change' }
  ],
  operator: [
    { required: true, message: t('input.inventory.stockOut.rules.operatorRequired'), trigger: 'blur' }
  ]
}))

const detailRules = computed(() => ({
  inputId: [
    { required: true, message: t('input.inventory.stockOut.rules.materialIdRequired'), trigger: 'change' }
  ],
  inputType: [
    { required: true, message: t('input.inventory.stockOut.rules.materialTypeRequired'), trigger: 'blur' }
  ],
  unitOfMeasure: [
    { required: true, message: t('input.inventory.stockOut.rules.unitOfMeasureRequired'), trigger: 'change' }
  ],
  quantity: [
    { required: true, message: t('input.inventory.stockOut.rules.quantityRequired'), trigger: 'blur' },
    { type: 'number', min: 0.01, message: t('input.inventory.stockOut.rules.quantityPositive'), trigger: 'blur' }
  ]
}))

// 加载所有投入品列表
const loadInputList = async () => {
  inputLoading.value = true
  try {
    const res = await getInputList({
      page: 1,
      pageSize: 1000,
      status: 'active' // 只获取启用的投入品
    })
    if (res.code === 200) {
      // 确保每个投入品都有agriculturalInputType字段
      inputList.value = (res.data.list || []).map(item => ({
        ...item,
        // 确保agriculturalInputType字段存在，如果不存在则使用空字符串
        agriculturalInputType: item.agriculturalInputType || item.agricultural_input_type || ''
      }))
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
      // 合并OSE→Union和Union→Woreda的分发单
      distributionList.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load distribution list:', error)
    ElMessage.error('Failed to load distribution list')
  } finally {
    distributionLoading.value = false
  }
}

// 分发单下拉框获取焦点时，检查是否选择了仓库
const handleDistributionFocus = () => {
  if (!formData.warehouse_id) {
    ElMessage.warning('Please select the outbound warehouse first')
    return
  }
}

// 选择分发单后，自动带入明细
const handleDistributionChange = async (distributionId) => {
  if (!distributionId) {
    return
  }
  if (!formData.warehouse_id) {
   /* 请先选择出库仓库*/
    ElMessage.warning('Please select the outbound warehouse first')
    formData.related_order_no = ''
    return
  }

  try {
    // 获取分发单详情
    const res = await getDistributionDetail(distributionId)
    if (res.code === 200 && res.data) {
      // 获取分发单中的明细列表，如果没有则设为空数组
      const details = res.data.details || []

      // 检查分发单是否有明细信息
      if (details.length === 0) {
        // 如果没有明细信息，显示警告提示并退出函数
        /*该分发单没有明细信息 请手动录入*/
        ElMessage.warning('This distribution form does not contain detailed information. Please enter it manually')
        return
      }

      // 初始化两个数组：一个用于存储库存不足的投入品，一个用于存储可以出库的投入品明细
      const insufficientItems = [] // 存储库存不足的投入品信息
      const newDetails = [] // 存储可以正常出库的投入品明细

      // 遍历分发单中的每个投入品明细
      for (const detail of details) {
        const detailInputType = detail.inputType || detail.input_type_from_input || '';
        const detailAgriculturalInputType = detail.inputCategory || detail.agricultural_input_type_from_input || '';

        // 通过投入品类型和品类查询库存
        try {
          const stockRes = await getStockList({
            warehouseId: formData.warehouse_id,
            materialType: detailInputType,
            agriculturalInputType: detailAgriculturalInputType,
            page: 1,
            pageSize: 1000
          })

          let totalAvailable = 0
          let totalCapacityKg = 0
          let totalVolumeL = 0
          let batchList = []
          let firstBatchId = ''
          let firstStockItem = null // 保存第一个有库存的库存项，用于提取投入品信息
          if (stockRes.code === 200 && stockRes.data && stockRes.data.items) {
            // 过滤有库存的项
            const availableItems = stockRes.data.items.filter(item => item.quantity > 0)

            // 计算总可用库存，并收集批次信息
            const batches = availableItems
              .map(item => ({
                materialBatchId: item.material_batch_id,
                quantity: item.quantity,
                capacityKg: item.capacity || 0,
                volumeL: item.warehouse_area || 0,
                expiryDate: item.expiry_date,
                createdAt: item.created_at,
                stockItem: item // 保存完整的库存项信息
              }))
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0)
                const dateB = new Date(b.createdAt || 0)
                return dateA - dateB
              })

            batchList = batches
            totalAvailable = batches.reduce((sum, batch) => sum + batch.quantity, 0)
            totalCapacityKg = batches.reduce((sum, batch) => sum + batch.capacityKg, 0)
            totalVolumeL = batches.reduce((sum, batch) => sum + batch.volumeL, 0)
            if (batches.length > 0) {
              firstBatchId = batches[0].materialBatchId
              firstStockItem = batches[0].stockItem // 获取第一个批次对应的库存项
            }
          }

          // 检查库存是否充足（数量、容量、容积）
          const requiredQuantity = detail.required || detail.quantity || 0
          const requiredCapacityKg = detail.requiredCapacityKg || 0
          const requiredVolumeL = detail.requiredVolumeL || 0

          let isInsufficient = false
          let insufficientReason = ''

          if (totalAvailable <= 0 || totalAvailable < requiredQuantity) {
            isInsufficient = true
            insufficientReason = `Quantity insufficient (Required: ${requiredQuantity}, Available: ${totalAvailable})`
          } else if (requiredCapacityKg > 0 && totalCapacityKg < requiredCapacityKg) {
            isInsufficient = true
            insufficientReason = `Capacity insufficient (Required: ${requiredCapacityKg} KG, Available: ${totalCapacityKg} KG)`
          } else if (requiredVolumeL > 0 && totalVolumeL < requiredVolumeL) {
            isInsufficient = true
            insufficientReason = `Volume insufficient (Required: ${requiredVolumeL} L, Available: ${totalVolumeL} L)`
          }

          if (isInsufficient) {
            // 库存不足
            insufficientItems.push({
              name: detail.variety || detail.cropType || detailInputType + '-' + detailAgriculturalInputType,
              required: requiredQuantity,
              reason: insufficientReason,
              availableCapacityKg: totalCapacityKg,
              availableVolumeL: totalVolumeL
            })
          } else {
            // 库存充足，创建出库明细
            // 从第一个库存项中获取投入品信息
            const stockMaterialId = firstStockItem?.material_id || detail.input_id || ''
            const stockMaterialName = firstStockItem?.material_name || detail.variety || detail.cropType || ''
            const stockSpecModel = firstStockItem?.spec_model || ''
            const stockUnitOfMeasure = firstStockItem?.unit_of_measure || detail.unit || ''

            // 尝试从投入品列表中匹配，获取更完整的信息
            let matchedInput = null
            if (stockMaterialId) {
              matchedInput = inputList.value.find(input => input.inputId === stockMaterialId)

              // 如果在inputList中找不到匹配的投入品，则创建一个新的投入品对象
              if (!matchedInput) {
                matchedInput = {
                  inputId: stockMaterialId,
                  inputName: stockMaterialName,
                  type: detailInputType,
                  agriculturalInputType: detailAgriculturalInputType,
                  variety: detail.variety || '',
                  specModel: stockSpecModel,
                  unitOfMeasure: stockUnitOfMeasure
                }
                // 将新投入品添加到inputList中，确保下拉框能找到它
                inputList.value.push(matchedInput)
              }
            }

            newDetails.push({
              inputId: stockMaterialId,
              inputName: matchedInput?.inputName || stockMaterialName,
              inputType: detailInputType,
              agriculturalInputType: detailAgriculturalInputType,
              variety: matchedInput?.variety || detail.variety || '',
              materialBatchId: firstBatchId,
              batchList: batchList.map(b => ({
                materialBatchId: b.materialBatchId,
                quantity: b.quantity,
                capacityKg: b.capacityKg,
                volumeL: b.volumeL,
                expiryDate: b.expiryDate,
                createdAt: b.createdAt
              })),
              quantity: requiredQuantity,
              specModel: matchedInput?.specModel || stockSpecModel,
              unitOfMeasure: matchedInput?.unitOfMeasure || stockUnitOfMeasure,
              available_quantity: batchList.length > 0 ? batchList[0].quantity : 0,
              available_capacity_kg: batchList.length > 0 ? batchList[0].capacityKg : 0,
              available_volume_l: batchList.length > 0 ? batchList[0].volumeL : 0,
              capacityWarning: ''
            })
          }
        } catch (error) {
          console.error('Failed to query stock for detail:', error)
          // 查询失败，视为库存不足
          insufficientItems.push({
            name: detail.variety || detail.cropType || detailInputType + '-' + detailAgriculturalInputType,
            required: detail.required || detail.quantity || 0,
            reason: 'Failed to query stock'
          })
        }
      }

      // 检查是否有库存不足的投入品
      if (insufficientItems.length > 0) {
        // 将库存不足的投入品名称、需求量和原因组合成字符串
        const itemNames = insufficientItems.map(item => {
          let info = `${item.name} (Required: ${item.required})`
          if (item.reason) {
            info += ` - ${item.reason}`
          }
          if (item.availableCapacityKg !== undefined) {
            info += ` [Available: ${item.availableCapacityKg} KG, ${item.availableVolumeL} L]`
          }
          return info
        }).join('<br/>')

        // 显示确认对话框，询问用户是否继续处理有库存不足的出库单
        ElMessageBox.confirm(
            `<div>The following inputs are currently in insufficient stock in the warehouse:<br/>${itemNames}<br/><br/>Whether to continue?</div>`,
            'Insufficient stock prompt',
            {
              confirmButtonText: 'Continue',
              cancelButtonText: 'Cancel',
              type: 'warning',
              dangerouslyUseHTMLString: true
            }
        ).then(() => {
          // 用户选择继续处理
          if (newDetails.length > 0) {
            // 如果有可以出库的投入品，更新表单明细
            formData.details = newDetails
            ElMessage.success(`Automatically brought in ${newDetails.length} item details`)

            // 对每个明细进行容量校验
            newDetails.forEach((detail, index) => {
              if (detail.unitOfMeasure && detail.quantity) {
                handleUnitChange(detail, index)
              }
            })
          } else {
            // 如果没有任何投入品可以出库，显示警告消息
            ElMessage.warning('There is no inventory of any of the inputs listed in this distribution order in the current warehouse')
          }
        }).catch(() => {
          // 用户取消操作，清空关联单号选择
          formData.related_order_no = ''
        })
      } else {
        // 所有投入品库存都充足，直接替换表单明细
        formData.details = newDetails
        ElMessage.success(`Automatically brought in ${newDetails.length} item details`)

        // 对每个明细进行容量校验
        newDetails.forEach((detail, index) => {
          if (detail.unitOfMeasure && detail.quantity) {
            handleUnitChange(detail, index)
          }
        })
      }
    }
  } catch (error) {
    // 捕获并处理获取分发单详情时的错误
    console.error('Failed to load distribution detail:', error)
    ElMessage.error('Failed to load the distribution sheet details') // 显示错误消息
    formData.related_order_no = '' // 清空关联单号选择
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 仓库变更时,清空所有明细的库存信息,并重新加载已选择投入品的库存
const handleWarehouseChange = (warehouseId) => {
  // 清空所有明细的库存信息
  formData.details.forEach(detail => {
    detail.materialBatchId = ''
    detail.available_quantity = 0

    // 如果已选择投入品，则重新加载其库存信息
    if (detail.inputId) {
      loadStockForMaterial(detail)
    }
  })

  // 加载该仓库中有库存的投入品列表
  loadMaterialListByWarehouse(warehouseId)
}

// 投入品变更时,自动填充投入品名称、类型、农资类型、品种
const handleMaterialChange = (index) => {
  const detail = formData.details[index]

  if (!detail.inputId) {
    detail.inputName = ''
    // 不再清空类型和品类，保持用户选择
    detail.variety = ''
    detail.materialBatchId = ''
    detail.batchList = []
    detail.available_quantity = 0
    return
  }

  const selectedInput = inputList.value.find(i => i.inputId === detail.inputId)

  if (selectedInput) {
    detail.inputName = selectedInput.inputName
    // 如果用户没有手动选择类型和品类，则自动填充
    if (!detail.inputType) {
      detail.inputType = selectedInput.type || ''
    }
    if (!detail.agriculturalInputType) {
      detail.agriculturalInputType = selectedInput.agriculturalInputType || selectedInput.agricultural_input_type || ''
    }
    detail.variety = selectedInput.variety || ''
  }

  // 如果已选择仓库，则加载批次号列表
  if (formData.warehouse_id && (detail.inputId || (detail.inputType && detail.agriculturalInputType))) {
    loadBatchList(detail)
  } else {
    detail.materialBatchId = ''
    detail.batchList = []
    detail.available_quantity = 0
  }
}

// 加载批次号列表
const loadBatchList = async (detail) => {
  if (!formData.warehouse_id || (!detail.inputId && (!detail.inputType || !detail.agriculturalInputType))) {
    detail.batchList = []
    detail.materialBatchId = ''
    detail.available_quantity = 0
    return
  }

  try {
    // 构造查询参数
    const queryParams = {
      warehouseId: formData.warehouse_id,
      page: 1,
      pageSize: 1000
    }

    // 优先使用投入品ID查询，否则使用类型和品类
    if (detail.inputId) {
      queryParams.materialId = detail.inputId
    } else {
      queryParams.materialType = detail.inputType
      queryParams.agriculturalInputType = detail.agriculturalInputType
    }

    const res = await getStockList(queryParams)

    if (res.code === 200 && res.data && res.data.items) {
      // 过滤有库存的批次，并按创建时间正序排序
      const batches = res.data.items
        .filter(item => item.quantity > 0)
        .map(item => ({
          materialBatchId: item.material_batch_id,
          quantity: item.quantity,
          capacityKg: item.capacity || 0, // 总容量(KG)
          volumeL: item.warehouse_area || 0, // 总容积(L)
          unitOfMeasure: item.unit_of_measure || '', // 计量单位
          expiryDate: item.expiry_date,
          createdAt: item.created_at
        }))
        .sort((a, b) => {
          // 按创建时间正序排序（早的在前）
          const dateA = new Date(a.createdAt || 0)
          const dateB = new Date(b.createdAt || 0)
          return dateA - dateB
        })

      detail.batchList = batches

      // 默认选择第一个批次号
      if (batches.length > 0) {
        detail.materialBatchId = batches[0].materialBatchId
        detail.available_quantity = batches[0].quantity
        detail.available_capacity_kg = batches[0].capacityKg
        detail.available_volume_l = batches[0].volumeL
        // 自动带出该批次的计量单位
        if (batches[0].unitOfMeasure) {
          detail.unitOfMeasure = batches[0].unitOfMeasure
        }
      } else {
        detail.materialBatchId = ''
        detail.available_quantity = 0
        detail.available_capacity_kg = 0
        detail.available_volume_l = 0
      }
    } else {
      detail.batchList = []
      detail.materialBatchId = ''
      detail.available_quantity = 0
      detail.available_capacity_kg = 0
      detail.available_volume_l = 0
    }
  } catch (error) {
    console.error('Failed to load batch list:', error)
    detail.batchList = []
    detail.materialBatchId = ''
    detail.available_quantity = 0
    detail.available_capacity_kg = 0
    detail.available_volume_l = 0
  }
}

// 处理批次号变化
const handleBatchChange = (item, index) => {
  if (!item.materialBatchId) {
    item.available_quantity = 0
    item.available_capacity_kg = 0
    item.available_volume_l = 0
    item.unitOfMeasure = '' // 清空计量单位
    return
  }

  // 从批次列表中找到对应的批次，更新可用库存
  const selectedBatch = item.batchList.find(batch => batch.materialBatchId === item.materialBatchId)
  if (selectedBatch) {
    item.available_quantity = selectedBatch.quantity
    item.available_capacity_kg = selectedBatch.capacityKg || 0
    item.available_volume_l = selectedBatch.volumeL || 0
    // 强制更新计量单位为该批次的计量单位
    item.unitOfMeasure = selectedBatch.unitOfMeasure || ''
  } else {
    item.available_quantity = 0
    item.available_capacity_kg = 0
    item.available_volume_l = 0
    item.unitOfMeasure = '' // 清空计量单位
  }
}

// 加载特定投入品的库存信息
const loadStockForMaterial = async (detail) => {
  if (!formData.warehouse_id || (!detail.inputId && (!detail.inputType || !detail.agriculturalInputType))) {
    detail.materialBatchId = ''
    detail.available_quantity = 0
    return
  }

  try {
    // 构造查询参数
    const queryParams = {
      warehouseId: formData.warehouse_id,
      page: 1,
      pageSize: 1000
    };

    // 如果有inputId，优先使用inputId查询
    if (detail.inputId) {
      queryParams.materialId = detail.inputId;
    } else {
      // 否则使用投入品类型和农资类型查询
      queryParams.materialType = detail.inputType;
      queryParams.agriculturalInputType = detail.agriculturalInputType;
    }

    const res = await getStockList(queryParams)

    if (res.code === 200 && res.data && res.data.items) {
      // 计算总库存
      let totalQuantity = 0
      let materialBatchId = ''
      let agriculturalInputType = '' // 用于存储农资类型

      res.data.items.forEach(item => {
        if (item.quantity > 0) {
          totalQuantity += item.quantity
          // 使用第一个有库存的批次号，注意API返回的是material_batch_id
          if (!materialBatchId && item.material_batch_id) {
            materialBatchId = item.material_batch_id
          }
          // 如果还没有农资类型，则使用第一个有库存的农资类型
          if (!agriculturalInputType && item.agricultural_input_type) {
            agriculturalInputType = item.agricultural_input_type
          }
        }
      })

      detail.materialBatchId = materialBatchId
      detail.available_quantity = totalQuantity
      // 使用getAgriculturalInputTypeText函数处理农资类型
      if (agriculturalInputType && !detail.agriculturalInputType) {
        detail.agriculturalInputType = getAgriculturalInputTypeText(agriculturalInputType)
      }
    } else {
      // 如果没有返回数据或数据为空，设置可用库存为0
      detail.materialBatchId = ''
      detail.available_quantity = 0
    }
  } catch (error) {
    console.error('Failed to load stock for material:', error)
    detail.materialBatchId = ''
    detail.available_quantity = 0
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

// 根据已选批次号筛选计量单位列表
// 如果已选择批次号，则只显示该批次对应的计量单位
const getFilteredUnits = (item) => {
  const allUnits = options.value.input_material_unit || []

  // 如果没有选择批次号，返回所有计量单位
  if (!item.materialBatchId || !item.batchList || item.batchList.length === 0) {
    return allUnits
  }

  // 找到已选批次的计量单位
  const selectedBatch = item.batchList.find(batch => batch.materialBatchId === item.materialBatchId)
  if (!selectedBatch || !selectedBatch.unitOfMeasure) {
    return allUnits
  }

  // 只返回该批次对应的计量单位
  return allUnits.filter(unit => unit.value === selectedBatch.unitOfMeasure)
}

// 处理投入品类型变化
const handleItemTypeChange = (item, index) => {
  // 清空品类和投入品名称
  item.agriculturalInputType = ''
  item.inputId = ''
  item.inputName = ''
  item.variety = ''
  item.materialBatchId = ''
  item.batchList = []
  item.available_quantity = 0
}

// 处理投入品品类变化
const handleItemCategoryChange = (item, index) => {
  // 清空投入品名称和批次信息
  item.inputId = ''
  item.inputName = ''
  item.variety = ''
  item.materialBatchId = ''
  item.batchList = []
  item.available_quantity = 0
  item.capacityWarning = ''

  // 不在此处加载批次号，应该等用户选择投入品后再加载
  // 因为同一类型+品类可能对应多个不同的投入品，批次应该属于具体的投入品
}

/**
 * 解析计量单位字符串，提取数值和单位
 * 支持格式：KG, g, ml, L, Package/10kg, Bottle/500ml 等
 * @param {string} unitLabel 计量单位标签（如 Package/50kg）
 * @returns {object} { value: 数值, unit: 单位, unitType: 'weight'|'volume', convertedValue: 转换后的值(KG或L) }
 */
const parseUnitString = (unitLabel) => {
  if (!unitLabel) {
    return { success: false, message: '计量单位为空' }
  }

  const trimmedString = unitLabel.trim().toLowerCase()

  // 处理纯单位的情况
  if (trimmedString === 'kg') {
    return { success: true, value: 1, unit: 'kg', unitType: 'weight', convertedValue: 1 }
  } else if (trimmedString === 'g') {
    return { success: true, value: 1, unit: 'g', unitType: 'weight', convertedValue: 0.001 }
  } else if (trimmedString === 'ml') {
    return { success: true, value: 1, unit: 'ml', unitType: 'volume', convertedValue: 0.001 }
  } else if (trimmedString === 'l') {
    return { success: true, value: 1, unit: 'l', unitType: 'volume', convertedValue: 1 }
  }

  // 正则匹配带数值的格式：Package/10kg, Bottle/500ml 等
  const pattern = /(?:.*[/\s])?(\d+(?:\.\d+)?)(kg|g|l|ml)/i
  const match = unitLabel.match(pattern)

  if (!match) {
    return { success: false, message: '无法解析计量单位格式' }
  }

  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()

  let unitType, convertedValue

  switch (unit) {
    case 'kg':
      unitType = 'weight'
      convertedValue = value
      break
    case 'g':
      unitType = 'weight'
      convertedValue = value / 1000
      break
    case 'l':
      unitType = 'volume'
      convertedValue = value
      break
    case 'ml':
      unitType = 'volume'
      convertedValue = value / 1000
      break
    default:
      return { success: false, message: '不支持的计量单位' }
  }

  return { success: true, value, unit, unitType, convertedValue }
}

/**
 * 根据字典值获取计量单位标签
 * @param {string} dictValue 字典值（如 U101）
 * @returns {string} 字典标签（如 Package/10kg）
 */
const getUnitLabel = (dictValue) => {
  if (!dictValue || !options.value.input_material_unit) return ''
  const unitItem = options.value.input_material_unit.find(item => item.value === dictValue)
  return unitItem ? unitItem.label : ''
}

/**
 * 计算出库所需的总容量
 * @param {string} unitOfMeasure 计量单位字典值
 * @param {number} quantity 出库数量
 * @returns {object} { success, unitType, requiredAmount, message }
 */
const calculateRequiredCapacity = (unitOfMeasure, quantity) => {
  if (!unitOfMeasure || !quantity || quantity <= 0) {
    return { success: false, message: '计量单位或数量无效' }
  }

  const unitLabel = getUnitLabel(unitOfMeasure)
  if (!unitLabel) {
    return { success: false, message: '未找到计量单位' }
  }

  const parseResult = parseUnitString(unitLabel)
  if (!parseResult.success) {
    return { success: false, message: parseResult.message }
  }

  const requiredAmount = parseResult.convertedValue * quantity

  return {
    success: true,
    unitType: parseResult.unitType,
    requiredAmount,
    unitLabel,
    perUnitValue: parseResult.convertedValue,
    unit: parseResult.unitType === 'weight' ? 'KG' : 'L'
  }
}

/**
 * 处理计量单位变化，校验库存容量是否满足
 */
const handleUnitChange = async (item, index) => {
  // 清空之前的警告
  item.capacityWarning = ''
  if (!item.unitOfMeasure || !item.quantity || item.quantity <= 0) {
    return
  }

  // 必须有批次号才能校验
  if (!item.materialBatchId) {
    return
  }

  // 计算所需容量
  const calcResult = calculateRequiredCapacity(item.unitOfMeasure, item.quantity)
  if (!calcResult.success) {
    item.capacityWarning = calcResult.message
    return
  }

  // 校验库存容量 - 通过批次号查询
  try {
    const validateRes = await validateStock({
      warehouseId: formData.warehouse_id,
      details: [{
        materialBatchId: item.materialBatchId,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure
      }]
    })
    if (validateRes.data && !validateRes.data.valid) {
      const insufficientItems = validateRes.data.insufficient_items || []
      if (insufficientItems.length > 0) {
        const insufficientItem = insufficientItems[0]
        const maxAvailable = insufficientItem.max_available_by_unit || 0
        let warningMessage = ''
        if (insufficientItem.unit_type === 'weight') {
          warningMessage = `Insufficient inventory capacity! Required: ${calcResult.requiredAmount.toFixed(2)} KG, Available: ${insufficientItem.available_capacity_kg || 0} KG (Max quantity available: ${maxAvailable})`
        } else if (insufficientItem.unit_type === 'volume') {
          warningMessage = `Insufficient inventory volume! Required: ${calcResult.requiredAmount.toFixed(2)} L, Available: ${insufficientItem.available_volume_l || 0} L (Max quantity available: ${maxAvailable})`
        } else {
          warningMessage = `Insufficient inventory! Max quantity available: ${maxAvailable}`
        }

        // Clear the quantity and show warning
        item.quantity = null
        item.capacityWarning = warningMessage
        ElMessage.warning(warningMessage)
      }
    } else {
      // Stock is sufficient, clear warning
      item.capacityWarning = ''
    }
  } catch (error) {
    console.error('Failed to validate stock capacity:', error)
  }
}

/**
 * 处理数量变化，重新校验库存容量
 */
const handleQuantityChange = (item, index) => {
  if (item.unitOfMeasure) {
    handleUnitChange(item, index)
  }
}

// 添加明细
const addDetail = () => {
  formData.details.push({
    inputId: '',
    inputName: '',
    inputType: '',
    agriculturalInputType: '',
    variety: '',
    materialBatchId: '',
    batchList: [], // 批次号列表
    quantity: null,
    specModel: '',
    unitOfMeasure: '',
    available_quantity: 0,
    available_capacity_kg: 0, // 可用容量(KG)
    available_volume_l: 0, // 可用容积(L)
    capacityWarning: '' // 容量校验警告信息
  })
}

// 移除明细
const removeDetail = (index) => {
  if (formData.details.length > 1) {
    formData.details.splice(index, 1)
  } else {
    ElMessage.warning(t('input.inventory.stockOut.rules.detailsRequired'))
  }
}

// 提交表单
// 校验批次号数量是否超出库存
const validateBatchQuantity = () => {
  // 按批次号分组统计出库数量
  const batchMap = new Map()

  formData.details.forEach((detail, index) => {
    if (!detail.materialBatchId) {
      return // 跳过没有批次号的明细
    }

    const batchId = detail.materialBatchId
    const quantity = Number(detail.quantity || 0)
    const availableQuantity = Number(detail.available_quantity || 0)

    if (!batchMap.has(batchId)) {
      batchMap.set(batchId, {
        totalQuantity: 0,
        availableQuantity: availableQuantity,
        inputName: detail.inputName || `${detail.inputType}-${detail.agriculturalInputType}`,
        details: []
      })
    }

    const batchInfo = batchMap.get(batchId)
    batchInfo.totalQuantity += quantity
    batchInfo.details.push({ index: index + 1, quantity })
  })

  // 检查每个批次号的总数量是否超出可用库存
  for (const [batchId, info] of batchMap.entries()) {
    if (info.totalQuantity > info.availableQuantity) {
      const detailIndexes = info.details.map(d => `Line ${d.index} (Qty: ${d.quantity})`).join(', ')
      return `Batch "${batchId}" (${info.inputName}): Total outbound quantity ${info.totalQuantity} exceeds available stock ${info.availableQuantity}. Details: ${detailIndexes}. Please adjust the quantity or select another batch.`
    }
  }

  return null // 校验通过
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()

    if (formData.details.length === 0) {
      ElMessage.warning(t('input.inventory.stockOut.rules.detailsRequired'))
      return
    }

    // 检查所有明细是否完整
    const hasIncompleteDetail = formData.details.some(
      detail => (!detail.inputId && (!detail.inputType || !detail.agriculturalInputType)) || !detail.quantity
    )
    if (hasIncompleteDetail) {
      ElMessage.warning(t('input.inventory.stockOut.rules.detailsRequired'))
      return
    }

    // 检查所有明细是否填写了计量单位
    const hasEmptyUnit = formData.details.some(detail => !detail.unitOfMeasure)
    if (hasEmptyUnit) {
      ElMessage.warning(t('input.inventory.stockOut.rules.unitOfMeasureRequired'))
      return
    }

    submitLoading.value = true

    // 提交前校验库存是否充足（基于批次号和计量单位计算容量）
    try {
      const validateRes = await validateStock({
        warehouseId: formData.warehouse_id,
        details: formData.details.map(detail => ({
          materialBatchId: detail.materialBatchId || '',
          quantity: detail.quantity,
          unitOfMeasure: detail.unitOfMeasure
        }))
      })

      // 如果库存不足，提示用户
      if (!validateRes.data.valid) {
        const insufficientItems = validateRes.data.insufficient_items || []
        if (insufficientItems.length > 0) {
          // 根据单位类型显示不同的提示信息
          const itemList = insufficientItems.map(item => {
            if (item.unit_type === 'weight') {
              return `${item.material_name || item.material_batch_id}(Required：${item.required_capacity_kg} KG，Available：${item.available_capacity_kg} KG，Max available: ${item.max_available_by_unit})`
            } else if (item.unit_type === 'volume') {
              return `${item.material_name || item.material_batch_id}(Required：${item.required_volume_l} L，Available：${item.available_volume_l} L，Max available: ${item.max_available_by_unit})`
            } else {
              return `${item.material_name || item.material_batch_id}(Demand：${item.required_quantity}，Available：${item.available_quantity}，Max available: ${item.max_available_by_unit || 0})`
            }
          }).join('<br/>')

          await ElMessageBox.confirm(
            `<div>The inventory of the following inputs is insufficient：<br/>${itemList}<br/><br/>Is it still necessary to submit the outbound order？</div>`,
            'Insufficient inventory warning',
            {
              confirmButtonText: 'Still need to be submitted',
              cancelButtonText: 'Return to modify',
              type: 'warning',
              dangerouslyUseHTMLString: true
            }
          )
        } else {
          ElMessage.error(validateRes.data.message || 'Inventory verification failed')
          submitLoading.value = false
          return
        }
      }
    } catch (validateError) {
      // 如果用户点击了取消，或者校验失败，中止提交
      if (validateError === 'cancel') {
        submitLoading.value = false
        return
      }
      console.error('Stock validation error:', validateError)
      // 校验失败不中断提交流程，继续提交
    }

    // 转换为驼峰形式
    const data = {
      outboundType: formData.outbound_type,
      warehouseId: formData.warehouse_id,
      relatedOrderNo: formData.related_order_no || undefined,
      outboundObjectId: formData.outbound_type === 1 ? '' : formData.warehouse_id,
      outboundObjectName: formData.outbound_type === 1 ? 'Default account' : warehouseList.value.find(w => w.warehouse_id === formData.warehouse_id)?.warehouse_name || '',
      outboundUser: formData.outbound_user || undefined,
      outboundDept: formData.outbound_dept || undefined,
      operator: formData.operator,
      remark: formData.remark || undefined,
      details: formData.details.map(detail => ({
        materialId: detail.inputId || undefined, // 可能为空
        materialName: detail.inputName,
        materialType: detail.inputType,
        agriculturalInputType: detail.agriculturalInputType || undefined,
        variety: detail.variety || undefined,
        materialBatchId: detail.materialBatchId || undefined,
        quantity: detail.quantity,
        specModel: detail.specModel || undefined,
        unitOfMeasure: detail.unitOfMeasure || undefined
      }))
    }

    const res = await createOutboundOrder(data)
    if (res.code === 200) {
      ElMessage.success(t('input.inventory.stockOut.addSuccess'))
      setTimeout(() => router.back(), 1000)
    }
  } catch (error) {
    console.error('Form validation or submission error:', error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  currentUserOrganCode.value = getCurrentUserOrganCode()
  loadWarehouseList()
  loadInputList() // 加载所有投入品列表
  loadDistributionList()

  // 获取用户信息并自动填充出库员和出库部门
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    const userInfo = JSON.parse(userInfoStr)
    const user = userInfo.user || userInfo
    console.log(user)

    // 自动填充出库员（优先使用USERNAME，其次使用REALNAME）
    formData.outbound_user = user.USERNAME || user.REALNAME || user.username || user.realName || ''

    // 自动填充出库部门
    formData.outbound_dept = user.ORGANNAME || ''
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';

/* 明细列表 */
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
  grid-template-columns: repeat(2, 1fr);
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

.available-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.capacity-warning {
  display: block;
  font-size: 12px;
  color: #E6A23C;
  margin-top: 4px;
  line-height: 1.4;
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
  .form-grid,
  .item-fields {
    grid-template-columns: 1fr;
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
}
</style>
