<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部（带返回按钮） -->
      <div class="page-header">
        <div class="header-left">
          <el-button class="back-btn" @click="handleBack">
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
                <span>{{ $t('inputCirculation.basicInfo') }}</span>
              </div>
            </div>
            <div class="card-body">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.farmerName')" prop="farmerId">
                    <el-select v-model="formData.farmerId" :placeholder="$t('common.pleaseSelect')" filterable
                      @change="handleFarmerChange" style="width: 100%">
                      <el-option v-for="farmer in farmerList" :key="farmer.farmerId" :label="farmer.farmerName"
                        :value="farmer.farmerId" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.farmerPhone')">
                    <el-input v-model="formData.farmerPhone" :placeholder="$t('common.pleaseInput')" readonly />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.farmerAddress')">
                    <el-input v-model="formData.farmerAddress" :placeholder="$t('common.pleaseInput')" readonly />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseYear')">
                    <el-date-picker v-model="formData.releaseYear" type="year" value-format="YYYY" style="width: 100%" @change="handleYearChange" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseDate')" prop="releaseDate">
                    <el-date-picker v-model="formData.releaseDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseBy')">
                    <el-input v-model="formData.releaseBy" :placeholder="$t('common.pleaseInput')" readonly />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseOrg')">
                    <el-input v-model="formData.releaseOrg" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 需求选择卡片 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-list-check-line"></i>
                <span>{{ $t('inputCirculation.demandSelectionTitle') }}</span>
              </div>
            </div>
            <div class="card-body">
              <el-table :data="demandList" border v-loading="demandLoading">
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputType')" min-width="150">
                  <template #default="{ row }">
                    {{ getMainCategoryLabel(row.inputType) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputCategory')" min-width="150">
                  <template #default="{ row }">
                    {{ getSubCategoryLabel(row.inputCategory) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.variety')" prop="variety" min-width="150">
                  <template #default="{ row }">
                    {{ row.variety || '-' }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.season')" prop="season" min-width="140">
                  <template #default="{ row }">
                    {{ formatSeason(row.season) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.totalQuantity')" prop="totalQuantity" min-width="120" />
              </el-table>
            </div>
          </div>

          <!-- 分发明细卡片 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-file-list-line"></i>
                <span>{{ $t('inputCirculation.detailInfo') }}</span>
              </div>
              <div class="card-actions">
                <el-button type="primary" @click="addDetail">
                  <i class="ri-add-line"></i>
                  {{ $t('inputCirculation.addDetail') }}
                </el-button>
              </div>
            </div>
            <div class="card-body">
              <el-table :data="formData.details" border>
                <el-table-column type="index" width="80" />
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputType')" min-width="180">
                  <template #default="scope">
                      <el-select v-model="scope.row.inputType" :placeholder="$t('common.pleaseSelect')"
                        @change="handleInputTypeChange(scope.$index)" style="width: 100%">
                      <el-option v-for="item in inputTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                      </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputCategory')" min-width="180">
                  <template #default="scope">
                      <el-select v-model="scope.row.inputCategory" :placeholder="$t('common.pleaseSelect')"
                        @change="handleInputCategoryChange(scope.$index)" style="width: 100%">
                      <el-option v-for="item in getFilteredCategories(scope.row.inputType)" :key="item.value"
                        :label="item.label" :value="item.value" />
                      </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.variety')" min-width="160">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.varietyId"
                      :placeholder="$t('common.pleaseSelect')"
                      :loading="scope.row.varietyLoading"
                      :disabled="!scope.row.inputType || !scope.row.inputCategory"
                      clearable
                      filterable
                      style="width: 100%"
                      @change="(value) => handleVarietyChange(scope.$index, value)">
                      <el-option
                        v-for="item in scope.row.varietyOptions || []"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.season')" min-width="160">
                  <template #default="scope">
                    <el-select v-model="scope.row.season"
                               :placeholder="$t('common.pleaseSelect')"
                               style="width: 100%"
                               @change="handleSeasonChange(scope.$index)">
                      <el-option v-for="item in seasonOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.demandQuantity')" min-width="140">
                  <template #default="scope">
                    {{ getDemandQuantity(scope.row.inputType, scope.row.inputCategory, scope.row.season) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.currentStock')" min-width="140">
                  <template #default="scope">
                    <span>{{ scope.row.currentStock }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.quantity')" min-width="180">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.quantity" :min="0"
                      :precision="2" style="width: 100%" />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.unit')" min-width="140">
                  <template #default="scope">
                    <el-select v-model="scope.row.unit" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
                      <el-option v-for="item in unitOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.unitPrice')" min-width="150">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.unitPrice" :min="0" :precision="2"
                      @change="calculateTotalPrice(scope.$index)" style="width: 100%" />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.totalPrice')" min-width="140">
                  <template #default="scope">
                    <el-input-number v-model="scope.row.totalPrice" :min="0" :precision="2" readonly style="width: 100%" />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('common.actions')" width="100" fixed="right">
                  <template #default="scope">
                    <el-button type="danger" link @click="removeDetail(scope.$index)">{{ $t('common.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 操作按钮区域（固定在底部） -->
          <div class="form-actions">
            <el-button v-for="button in getActionButtons()" :key="button.action"
              :type="button.type" @click="handleAction(button.action)"
              :loading="loading && button.action === 'save'">
              {{ $t(`common.${button.label}`) }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getFarmerReleaseDetail, addFarmerRelease, editFarmerRelease, getAvailableStock, getDeptCategoryStock } from '@/api/inputCirculation'
import { getInventoryWarehouseList } from '@/api/inventory'
import { listProductManage } from '@/api/productManage'
import { getFarmerList } from '@/api/newFarm'
import { useUserStore } from '@/store/user'
import { getFarmerDemandByFarmerId } from '@/api/farmerDemand'
import { getDicts } from '@/api/system/dict'
import { parseI18nValue } from '@/utils/i18nHelper'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const useKebeleFlag = computed(() => route.query.source === 'kebele-farmer')
const requestFlag = computed(() => (useKebeleFlag.value ? 1 : undefined))

const loading = ref(false)
const formRef = ref(null)
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
    case 'edit':
      return t('inputCirculation.editRelease')
    default:
      return t('inputCirculation.addRelease')
  }
})

// 农民列表
const farmerList = ref([])
// 需求列表
const demandList = ref([])
const demandLoading = ref(false)
const mainCategoryOptions = ref([])
const subCategoryOptions = ref([])
const unitOptions = ref([])
const inputTypeOptions = computed(() => mainCategoryOptions.value)

const formData = reactive({
  id: '',
  farmerId: '',
  farmerName: '',
  farmerPhone: '',
  farmerAddress: '',
  releaseYear: new Date().getFullYear().toString(),
  releaseDate: new Date().toISOString().split('T')[0],
  releaseBy: '',
  releaseOrg: '',
  receiveStatus: 'completed',
  details: []
})

const rules = {
  farmerId: [{ required: true, message: t('common.required'), trigger: 'change' }],
  releaseDate: [{ required: true, message: t('common.required'), trigger: 'change' }]
}

// 获取农民列表
const fetchFarmerList = async () => {
  try {
    const response = await getFarmerList({ pageNum: 1, pageSize: 10000, ...(useKebeleFlag.value ? { flag: 1 } : {}) })
    if (response.code === 200 && response.data && response.data.records) {
      farmerList.value = response.data.records
    }
  } catch (error) {
    console.error('Failed to fetch farmer list:', error)
  }
}

// 加载需求列表 - 根据farmerId获取农民需求
const loadDemandList = async (farmerId) => {
  if (!farmerId) return
  demandLoading.value = true
  try {
    const response = await getFarmerDemandByFarmerId(farmerId, {
      year: formData.releaseYear || new Date().getFullYear().toString(),
      ...(useKebeleFlag.value ? { flag: 1 } : {})
    })
    if (response.code === 200) {
      demandList.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load demand list:', error)
  } finally {
    demandLoading.value = false
  }
}

// 处理年度变化 - 重新加载需求列表
const handleYearChange = () => {
  if (formData.farmerId) {
    loadDemandList(formData.farmerId)
  }
}

// 农民选择变化处理
const handleFarmerChange = (farmerId) => {
  const selectedFarmer = farmerList.value.find(f => f.farmerId === farmerId)
  if (selectedFarmer) {
    formData.farmerName = selectedFarmer.farmerName
    formData.farmerPhone = selectedFarmer.phone || ''
    formData.farmerAddress = selectedFarmer.address || ''
    // 加载该农民的需求列表
    loadDemandList(farmerId)
  }
}

// 根据类型获取过滤后的类别
const getFilteredCategories = (inputType) => {
  if (!inputType) return []
  return subCategoryOptions.value.filter(item => String(item.parentValue) === String(inputType))
}

const createVarietyState = () => ({
  varietyId: '',
  varietyOptions: [],
  varietyLoading: false
})

// 投入品类型变化
const handleInputTypeChange = (index) => {
  const detail = formData.details[index]
  detail.inputCategory = ''
  Object.assign(detail, createVarietyState())
  detail.season = ''
  detail.maxQuantity = null
  detail.currentStock = 0
}

const getNormalizedDemandValue = (value) => String(value || '').trim()

const matchesDemandValue = (demandValue, targetValue, targetLabel) => {
  const normalizedDemand = getNormalizedDemandValue(demandValue)
  const normalizedTarget = getNormalizedDemandValue(targetValue)
  const normalizedLabel = getNormalizedDemandValue(targetLabel)
  return normalizedDemand === normalizedTarget || normalizedDemand === normalizedLabel
}

const findMatchedDemand = (inputType, inputCategory, variety = '', season = '') => {
  if (!inputType || !inputCategory) return null

  const inputTypeLabel = getMainCategoryLabel(inputType)
  const inputCategoryLabel = getSubCategoryLabel(inputCategory)
  const normalizedVariety = (variety || '').trim()

  return demandList.value.find(d => {
    const demandVariety = (d.variety || '').trim()
    return matchesDemandValue(d.inputType, inputType, inputTypeLabel) &&
      matchesDemandValue(d.inputCategory, inputCategory, inputCategoryLabel) &&
      (!normalizedVariety || !demandVariety || demandVariety === normalizedVariety)
  }) || null
}

// 投入品类别变化
const handleInputCategoryChange = (index) => {
  const detail = formData.details[index]
  const matchedDemand = findMatchedDemand(detail.inputType, detail.inputCategory)
  Object.assign(detail, createVarietyState())
  detail.season = matchedDemand?.season || matchedDemand?.seasonCode || matchedDemand?.season_code || ''
  const maxQty = getDemandQuantity(detail.inputType, detail.inputCategory, detail.season)
  detail.maxQuantity = maxQty || 999999
  loadVarietyOptions(detail)
}

const loadVarietyOptions = async (detail, preserveSelection = false) => {
  if (!detail) return

  const existingVarietyId = detail.varietyId
  const existingVariety = detail.variety

  detail.varietyId = preserveSelection ? (existingVarietyId || '') : ''
  detail.variety = preserveSelection ? (existingVariety || '') : ''
  detail.varietyOptions = []

  if (!detail.inputType || !detail.inputCategory) {
    detail.varietyLoading = false
    return
  }

  detail.varietyLoading = true
  try {
    const response = await listProductManage({
      pageNum: 1,
      pageSize: 1000,
      mainCategory: getMainCategoryLabel(detail.inputType),
      subCategory: getSubCategoryLabel(detail.inputCategory),
      status: '0',
      ...(useKebeleFlag.value ? { flag: 1 } : {})
    })

    const list = response.data?.list || []
    detail.varietyOptions = list
      .map(product => {
        const optionValue = product.id || product.product_id || product.product_code || ''
        const productName = product.product_name || product.productName || product.product_code || ''
        return {
          label: productName || '-',
          value: optionValue,
          productName
        }
      })
      .filter(option => option.value)

    if (detail.varietyId) {
      const matchedById = detail.varietyOptions.find(option => String(option.value) === String(detail.varietyId))
      if (matchedById) {
        detail.variety = matchedById.productName
      }
    } else if (detail.variety) {
      const matchedByName = detail.varietyOptions.find(option => option.productName === detail.variety)
      if (matchedByName) {
        detail.varietyId = matchedByName.value
        detail.variety = matchedByName.productName
      }
    }
  } catch (error) {
    detail.varietyOptions = []
    ElMessage.error(t('common.loadFailed'))
  } finally {
    detail.varietyLoading = false
  }
}

const handleVarietyChange = (index, value) => {
  const detail = formData.details[index]
  if (!detail) return

  detail.varietyId = value || ''
  const matchedOption = (detail.varietyOptions || []).find(option => String(option.value) === String(value))
  detail.variety = matchedOption?.productName || ''
  if (!isStockLookupReady(detail)) {
    detail.currentStock = 0
    return
  }
  fetchStock(index)
}

const normalizeStockItem = (item) => {
  if (!item) return null
  return {
    mainCategory: item.mainCategory ?? item.main_category ?? '',
    subCategory: item.subCategory ?? item.sub_category ?? '',
    productName: item.productName ?? item.product_name ?? '',
    availableQty: item.availableQty ?? item.available_qty ?? item.availableQuantity ?? 0
  }
}

const findMatchedStockItem = (items, inputTypeLabel, inputCategoryLabel, variety) => {
  const normalizedVariety = (variety || '').trim()
  return (items || [])
    .map(normalizeStockItem)
    .find(item => item &&
      item.mainCategory === inputTypeLabel &&
      item.subCategory === inputCategoryLabel &&
      (!normalizedVariety || !item.productName.trim() || item.productName.trim() === normalizedVariety))
}

const isStockLookupReady = (detail) => Boolean(
  detail?.inputType && detail?.inputCategory && String(detail?.variety || '').trim()
)

const initializeDetailStocks = async () => {
  await Promise.all(formData.details.map((detail, index) => {
    detail.currentStock = detail.currentStock ?? detail.current_stock ?? 0
    if (isStockLookupReady(detail)) {
      return fetchStock(index)
    }
    return Promise.resolve()
  }))
}

// 获取库存
const fetchStock = async (index) => {
  const detail = formData.details[index]
  if (!isStockLookupReady(detail)) {
    detail.currentStock = 0
    return
  }

  try {
    const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
    if (!deptId) {
      console.warn('deptId is not available in userInfo')
      detail.currentStock = 0
      return
    }

    const inputTypeLabel = getMainCategoryLabel(detail.inputType)
    const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)

    const res = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety, requestFlag.value)
    if (res.code === 200 && Array.isArray(res.data)) {
      const matched = findMatchedStockItem(res.data, inputTypeLabel, inputCategoryLabel, detail.variety)
      detail.currentStock = matched?.availableQty ?? 0
    } else {
      detail.currentStock = 0
    }
  } catch (error) {
    console.error('Failed to fetch stock:', error)
    detail.currentStock = 0
  }
}

const getMainCategoryLabel = (value) => {
  const match = mainCategoryOptions.value.find(item => String(item.value) === String(value) || item.label === value)
  return match ? match.label : value || '-'
}

const getSubCategoryLabel = (value) => {
  const match = subCategoryOptions.value.find(item => String(item.value) === String(value) || item.label === value)
  return match ? match.label : value || '-'
}

const resolveDictValue = (options, value) => {
  if (!value) return ''
  const match = options.find(item => String(item.value) === String(value) || String(item.label) === String(value))
  return match ? match.value : value
}

// 验证数量 - 同时检查需求量和库存
const validateQuantity = async (index) => {
  const detail = formData.details[index]
  if (!detail.inputType) return

  // 校验需求量
  const maxQty = getDemandQuantity(detail.inputType, detail.inputCategory)
  if (typeof maxQty === 'number' && detail.quantity > maxQty) {
    ElMessage.warning(t('inputCirculation.quantityExceedsDemand'))
    detail.quantity = maxQty
  }

  // 校验库存 - 计算表单中同类型的总数量
  const totalFormQuantity = formData.details
    .filter(d => d.inputType === detail.inputType &&
                (d.inputCategory === detail.inputCategory || (!d.inputCategory && !detail.inputCategory)) &&
                (d.variety === detail.variety || (!d.variety && !detail.variety)))
    .reduce((sum, d) => sum + (d.quantity || 0), 0)

  try {
    const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
    if (!deptId) {
      console.warn('deptId is not available for stock validation')
      return
    }

    const inputTypeLabel = getMainCategoryLabel(detail.inputType)
    const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)

    const stockRes = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety, requestFlag.value)
    if (stockRes.code === 200 && Array.isArray(stockRes.data)) {
      const matched = findMatchedStockItem(stockRes.data, inputTypeLabel, inputCategoryLabel, detail.variety)
      const available = matched?.availableQty ?? 0
      if (totalFormQuantity > available) {
        const excessQty = totalFormQuantity - available
        const adjustedQty = Math.max(0, (detail.quantity || 0) - excessQty)
        detail.quantity = adjustedQty
        ElMessage.error(t('inputCirculation.stockInsufficient', { available, requested: totalFormQuantity }))
      }
    }
  } catch (error) {
    console.error('Failed to validate stock:', error)
  }

  calculateTotalPrice(index)
}

// 计算总价
const calculateTotalPrice = (index) => {
  const detail = formData.details[index]
  if (detail.quantity && detail.unitPrice) {
    detail.totalPrice = parseFloat((detail.quantity * detail.unitPrice).toFixed(2))
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await getFarmerReleaseDetail(route.params.id, requestFlag.value)
    if (response.code === 200 && response.data) {
      Object.assign(formData, response.data.main)
      if (formData.releaseYear) {
        formData.releaseYear = String(formData.releaseYear)
      }
      formData.details = (response.data.details || []).map(detail => ({
        ...createVarietyState(),
        ...detail,
        season: detail.season || detail.seasonCode || detail.season_code || '',
        variety: detail.variety || '',
        varietyId: detail.varietyId || detail.variety_id || '',
        unit: resolveDictValue(unitOptions.value, detail.unit),
        currentStock: detail.currentStock ?? detail.current_stock ?? 0
      }))

      // 从农民列表填充手机号和地址
      if (formData.farmerId) {
        const farmer = farmerList.value.find(f => f.farmerId === formData.farmerId)
        if (farmer) {
          formData.farmerPhone = farmer.phone || formData.farmerPhone || ''
          formData.farmerAddress = farmer.address || formData.farmerAddress || ''
        }
        // 加载需求列表
        await loadDemandList(formData.farmerId)
      }
      await initializeDetailRows()
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
}

const initializeDetailRows = async () => {
  await Promise.all(formData.details.map((detail, index) => {
    if (detail.inputType && detail.inputCategory) {
      return handleInputCategoryChange(index)
    }
    return Promise.resolve()
  }))
}

const addDetail = () => {
  formData.details.push({
    ...createVarietyState(),
    inputType: '',
    inputCategory: '',
    variety: '',
    season: '',
    quantity: 0,
    unit: unitOptions.value[0]?.value || '',
    unitPrice: 0,
    totalPrice: 0,
    maxQuantity: null,
    currentStock: 0,
    releaseTime: formatDateTime(new Date()),
    outWarehouseCode: '',
    outWarehouseName: '',
    inWarehouseCode: '',
    inWarehouseName: ''
  })
}

const removeDetail = (index) => {
  formData.details.splice(index, 1)
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return null
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateStr)) {
    return dateStr
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 库存校验
    loading.value = true
    try {
      const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
      if (!deptId) {
        ElMessage.error(t('inputCirculation.organCodeMissing'))
        loading.value = false
        return
      }

      const quantityByType = {}
      for (const detail of formData.details) {
        const key = `${detail.inputType}_${detail.inputCategory || ''}_${detail.variety || ''}`
        if (!quantityByType[key]) {
          quantityByType[key] = {
            inputType: detail.inputType,
            inputCategory: detail.inputCategory,
            variety: detail.variety || '',
            quantity: 0
          }
        }
        quantityByType[key].quantity += (detail.quantity || 0)
      }

      for (const key of Object.keys(quantityByType)) {
        const item = quantityByType[key]
        if (!isStockLookupReady(item)) continue

        const inputTypeLabel = getMainCategoryLabel(item.inputType)
        const inputCategoryLabel = getSubCategoryLabel(item.inputCategory)
        const stockRes = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, item.variety, requestFlag.value)
        if (stockRes.code === 200 && Array.isArray(stockRes.data)) {
          const matched = findMatchedStockItem(stockRes.data, inputTypeLabel, inputCategoryLabel, item.variety)
          const available = matched?.availableQty ?? 0
          if (item.quantity > available) {
            ElMessage.error(t('inputCirculation.stockInsufficient', { available, requested: item.quantity }))
            loading.value = false
            return
          }
        }
      }

      const submitData = {
        ...formData,
        releaseYear: formData.releaseYear ? parseInt(formData.releaseYear, 10) : null,
        releaseDate: formData.releaseDate,
        details: formData.details.map(({ varietyOptions, varietyLoading, ...detail }) => ({
          ...detail,
          releaseTime: formatDateTime(detail.releaseTime)
        }))
      }

      const apiFunc = isEdit.value ? editFarmerRelease : addFarmerRelease
      const response = await apiFunc(submitData, requestFlag.value)
      if (response.code === 200) {
        ElMessage.success(t('common.saveSuccess'))
        router.back()
      } else {
        ElMessage.error(response.msg || t('common.saveFailed'))
      }
    } catch (error) {
      ElMessage.error(t('common.saveFailed'))
    } finally {
      loading.value = false
    }
  })
}

const SEASON_LABEL_MAP = {
  '1': 'inputCirculation.seasonSummer',
  '2': 'inputCirculation.seasonSpring',
  '3': 'inputCirculation.seasonIrrigation'
}

const seasonOptions = [
  { label: t('inputCirculation.seasonSummer'), value: '1' },
  { label: t('inputCirculation.seasonSpring'), value: '2' },
  { label: t('inputCirculation.seasonIrrigation'), value: '3' }
]

const formatSeason = (season) => {
  const normalizedSeason = String(season || '').trim()
  const seasonKey = SEASON_LABEL_MAP[normalizedSeason]
  return seasonKey ? t(seasonKey) : '-'
}

// 获取需求数量
const getDemandQuantity = (inputType, inputCategory, season = '') => {
  const inputTypeLabel = getMainCategoryLabel(inputType)
  const inputCategoryLabel = getSubCategoryLabel(inputCategory)
  const normalizedSeason = season ? String(season).trim() : ''
  const item = demandList.value.find(d => {
    const matchType = matchesDemandValue(d.inputType, inputType, inputTypeLabel)
    const matchCategory = matchesDemandValue(d.inputCategory, inputCategory, inputCategoryLabel)
    const demandSeason = d.season ? String(d.season).trim() : ''
    const matchSeason = !normalizedSeason || !demandSeason || demandSeason === normalizedSeason
    return matchType && matchCategory && matchSeason
  })
  return item ? item.totalQuantity : 0
}

const handleSeasonChange = (index) => {
  const detail = formData.details[index]
  if (!detail) return
  detail.quantity = 0
  detail.maxQuantity = getDemandQuantity(detail.inputType, detail.inputCategory, detail.season) || 999999
  if (isStockLookupReady(detail)) {
    fetchStock(index)
  }
}

const handleBack = () => {
  router.back()
}

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

  // 默认按钮
  return [
    { type: '', label: 'cancel', action: 'cancel' },
    { type: 'primary', label: 'save', action: 'save' }
  ]
}

// 统一的动作处理方法
const handleAction = (action) => {
  switch (action) {
    case 'cancel':
      handleBack()
      break
    case 'save':
      handleSubmit()
      break
  }
}

const loadCategoryOptions = async () => {
  try {
    const [mainRes, subRes, unitRes] = await Promise.all([
      getDicts('inventory_main_category', requestFlag.value),
      getDicts('inventory_sub_category', requestFlag.value),
      getDicts('inventory_unit_new', requestFlag.value)
    ])

    mainCategoryOptions.value = (mainRes.data || []).map(item => ({
      label: parseI18nValue(item.dictLabel, locale.value, item.dictLabel),
      value: item.dictValue
    }))

    subCategoryOptions.value = (subRes.data || []).map(item => ({
      label: parseI18nValue(item.dictLabel, locale.value, item.dictLabel),
      value: item.dictValue,
      parentValue: item.remark
    }))

    unitOptions.value = (unitRes.data || []).map(item => ({
      label: parseI18nValue(item.dictLabel, locale.value, item.dictLabel),
      value: item.dictValue
    }))
  } catch (error) {
    console.error('Failed to load category options:', error)
  }
}

onMounted(async () => {
  await fetchFarmerList()
  await loadCategoryOptions()
  if (!isEdit.value) {
    const userInfo = userStore.userInfo
    formData.releaseBy = userInfo.userName || userInfo.nickName || userInfo.name ||
      userInfo.user?.userName || userInfo.user?.nickName ||
      userInfo.user?.name || ''
    formData.releaseOrg = userInfo.user.ORGANNAME || userInfo.organCode || ''
  }

  if (isEdit.value) {
    await fetchDetail()
  }
})

</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
</style>
