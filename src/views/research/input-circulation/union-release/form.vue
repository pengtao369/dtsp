<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 椤甸潰澶撮儴锛堝甫杩斿洖鎸夐挳锛?-->
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

      <!-- 琛ㄥ崟鍖哄煙 -->
      <div class="content-wrapper">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" v-loading="loading">
          <!-- 鍩烘湰淇℃伅鍗＄墖 -->
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
                  <el-form-item :label="$t('inputCirculation.releaseName')" prop="releaseName">
                    <el-input v-model="formData.releaseName" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.worId')" prop="zoneId">
                    <el-select v-model="formData.zoneId" :placeholder="$t('common.pleaseSelect')" @change="handleZoneChange" style="width: 100%">
                      <el-option v-for="item in worList" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.targetCooperative')" prop="targetId">
                    <el-select v-model="formData.targetId" :placeholder="$t('common.pleaseSelect')" @change="getCoorInfo" style="width: 100%">
                      <el-option v-for="item in coorList" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.cooperativeAddress')">
                    <el-input v-model="formData.targetAddress" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.cooperativeContact')">
                    <el-input v-model="formData.targetContact" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseYear')">
                    <el-date-picker v-model="formData.releaseYear" type="year" value-format="YYYY" @change="handleYearChange" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseDate')" prop="releaseDate">
                    <el-date-picker v-model="formData.releaseDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 闇€姹傞€夋嫨鍗＄墖 -->
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

          <!-- 鍒嗗彂鏄庣粏鍗＄墖 -->
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
              <el-table
                :data="formData.details"
                border
                :header-cell-style="{ textAlign: 'center' }"
                :cell-style="{ textAlign: 'center' }">
                <el-table-column :label="$t('inputCirculation.releaseDetailId')" type="index" width="80" />
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputType')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.inputType"
                               :placeholder="$t('common.pleaseSelect')"
                               @change="handleInputTypeChange(scope.$index)"
                               style="width: 100%">
                      <el-option v-for="item in inputTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputCategory')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.inputCategory"
                               :placeholder="$t('common.pleaseSelect')"
                               :disabled="!scope.row.inputType"
                               @change="handleInputCategoryChange(scope.$index)"
                               style="width: 100%">
                      <el-option v-for="item in getFilteredCategories(scope.row.inputType)" :key="item.value" :label="item.label" :value="item.value" />
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
                    <span>{{ getDemandQuantity(scope.row.inputType, scope.row.inputCategory, scope.row.season) }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.currentStock')" min-width="140">
                  <template #default="scope">
                    <span>{{ scope.row.currentStock }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.quantity')" min-width="180">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.quantity"
                      :min="0"
                      :precision="2"
                      style="width: 100%" />
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
                    <el-input-number v-model="scope.row.unitPrice" :min="0" :precision="2" style="width: 100%" />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.outWarehouse')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.outWarehouseCode" :placeholder="$t('common.pleaseSelect')" style="width: 100%"
                      @change="(val) => handleDetailOutWarehouseChange(scope.row, val)">
                      <el-option v-for="item in inWarehouseOptions" :key="item.warehouseCode" :label="item.warehouseName" :value="item.warehouseCode" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.inWarehouse')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.inWarehouseCode" :placeholder="$t('common.pleaseSelect')" style="width: 100%"
                      @change="(val) => handleDetailInWarehouseChange(scope.row, val)">
                      <el-option v-for="item in warehouseOptions" :key="item.warehouseCode" :label="item.warehouseName" :value="item.warehouseCode" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('common.actions')" min-width="100" fixed="right">
                  <template #default="scope">
                    <el-button type="danger" link @click="removeDetail(scope.$index)">{{ $t('common.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 鎿嶄綔鎸夐挳鍖哄煙锛堝浐瀹氬湪搴曢儴锛?-->
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
import { getUnionReleaseDetail, addUnionRelease, editUnionRelease, getAvailableStock, getDeptCategoryStock } from '@/api/inputCirculation'
import { getInventoryWarehouseList } from '@/api/inventory'
import { listProductManage } from '@/api/productManage'
import { getCurrentUserInfo } from '@/api/user'
import { getOrgansRegionByCode, listSubRegionByCode } from '@/api/application'
import { getTownAggregationDetail } from '@/api/villageAggregation'
import { getDicts } from '@/api/system/dict'
import { parseI18nValue } from '@/utils/i18nHelper'
import { useUserStore } from '@/store/user'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref(null)
const isEdit = computed(() => !!route.params.id)

// 鏍规嵁璺敱璺緞鍜屽弬鏁板垽鏂〉闈㈡ā寮?
const pageMode = computed(() => {
  // 浼樺厛浣跨敤 query 鍙傛暟
  if (route.query.mode) {
    return route.query.mode
  }
  // 鏍规嵁璺敱璺緞鍒ゆ柇
  if (route.path.includes('/audit/')) {
    return 'audit'
  }
  if (route.path.includes('/detail/')) {
    return 'view'
  }
  // 榛樿閫昏緫
  return isEdit.value ? 'edit' : 'add'
})

// 椤甸潰鏍囬
const pageTitle = computed(() => {
  switch (pageMode.value) {
    case 'edit':
      return t('inputCirculation.editRelease')
    default:
      return t('inputCirculation.addRelease')
  }
})

const inputTypeOptions = computed(() => mainCategoryOptions.value)

const formData = reactive({
  id: '',
  releaseName: '',
  zoneId: '',
  targetId: '',
  targetAddress: '',
  targetContact: '',
  targetPhone: '',
  releaseYear: new Date().getFullYear().toString(),
  releaseDate: new Date().toISOString().split('T')[0],
  releaseBy: '',
  auditDate: '',
  auditBy: '',
  releaseOrg: '',
  releaseType: 'UNION_TO_WOREDA',
  details: []
})

const worList = ref([])
const coorList = ref([])
const demandList = ref([])
const demandLoading = ref(false)
const warehouseOptions = ref([])
const inWarehouseOptions = ref([])
const mainCategoryOptions = ref([])
const subCategoryOptions = ref([])
const unitOptions = ref([])

const rules = {
  releaseName: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  zoneId: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  targetId: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  releaseDate: [{ required: true, message: t('common.required'), trigger: 'change' }],
}

const getUserInfo = async () => {
  loading.value = true
  try {
    const response = await getCurrentUserInfo()
    if (response.code === 200 && response.data) {
      formData.releaseBy = response.data.user.name
      formData.releaseOrg = response.data.user.organName
      let userParentCode = 102010000
      await getSubRegionByCode(userParentCode)
    }
  } catch (error) {
    ElMessage.error(t('common.queryUserInfoFailed'))
  } finally {
    loading.value = false
  }
}

const getSubRegionByCode = async (code) => {
  if (!code || code.length === 0) return
  loading.value = true
  try {
    const response = await listSubRegionByCode({regionCode: code})
    if (response.code === 200 && response.data) {
      worList.value = response.data
    }
  } catch (error) {
    ElMessage.error(t('common.querySubRegionFailed'))
  } finally {
    loading.value = false
  }
}

const normalizeId = (value) => {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

const normalizeName = (value) => normalizeId(value).toLowerCase()

const getCurrentUserOrgId = () => {
  const userInfo = userStore.userInfo || {}
  const user = userInfo.user || {}
  return normalizeId(
    userInfo.org_id ??
    userInfo.orgId ??
    user.org_id ??
    user.orgId ??
    userInfo.deptId ??
    user.deptId ??
    userInfo.dept?.deptId ??
    user.dept?.deptId
  )
}

const getWarehouseOrgId = (warehouse) => {
  return normalizeId(
    warehouse?.org_id ??
    warehouse?.orgId ??
    warehouse?.deptId ??
    warehouse?.organCode ??
    warehouse?.orgCode
  )
}

const getWarehouseOrgName = (warehouse) => {
  return normalizeName(
    warehouse?.orgName ??
    warehouse?.org_name ??
    warehouse?.organName ??
    warehouse?.organ_name
  )
}

const clearInWarehouseSelection = () => {
  inWarehouseOptions.value = []
  formData.details.forEach(detail => {
    detail.inWarehouseCode = ''
    detail.inWarehouseName = ''
  })
}

const loadWarehouses = async () => {
  try {
    const currentUserOrgId = getCurrentUserOrgId()
    if (!currentUserOrgId) {
      warehouseOptions.value = []
      formData.details.forEach(detail => {
        detail.outWarehouseCode = ''
        detail.outWarehouseName = ''
      })
      return
    }

    const res = await getInventoryWarehouseList({
      pageNum: 1,
      pageSize: 10000,
      orgId: currentUserOrgId,
      org_id: currentUserOrgId
    })
    const warehouseList = res.rows || []
    const hasWarehouseOrgId = warehouseList.some(item => !!getWarehouseOrgId(item))
    warehouseOptions.value = hasWarehouseOrgId
      ? warehouseList.filter(item => getWarehouseOrgId(item) === currentUserOrgId)
      : warehouseList

    formData.details.forEach(detail => {
      const exists = warehouseOptions.value.some(item => item.warehouseCode === detail.outWarehouseCode)
      if (!exists) {
        detail.outWarehouseCode = ''
        detail.outWarehouseName = ''
      }
    })
  } catch (error) {
    console.error('Failed to load warehouse list:', error)
    warehouseOptions.value = []
  }
}

const loadInWarehousesByCooperative = async (cooperativeId = formData.targetId) => {
  const cooperativeValue = normalizeId(cooperativeId)
  if (!cooperativeValue) {
    clearInWarehouseSelection()
    return
  }

  const matchedCooperative = coorList.value.find(item =>
    String(item.code) === String(cooperativeId) || String(item.name) === String(cooperativeId)
  )
  const cooperativeOrgId = normalizeId(matchedCooperative?.code)
  const cooperativeNameRaw = normalizeId(matchedCooperative?.name ?? cooperativeValue)
  if (!cooperativeOrgId && !cooperativeNameRaw) {
    clearInWarehouseSelection()
    return
  }
  const cooperativeName = normalizeName(cooperativeNameRaw)

  try {
    const res = await getInventoryWarehouseList({
      pageNum: 1,
      pageSize: 10000,
      status: '0',
      orgId: cooperativeOrgId || undefined,
      org_id: cooperativeOrgId || undefined,
      orgName: cooperativeNameRaw || undefined,
      org_name: cooperativeNameRaw || undefined
    })

    const warehouseList = res.rows || []
    const hasWarehouseOrgName = cooperativeName && warehouseList.some(item => !!getWarehouseOrgName(item))
    inWarehouseOptions.value = hasWarehouseOrgName
      ? warehouseList.filter(item => getWarehouseOrgName(item) === cooperativeName)
      : warehouseList

    formData.details.forEach(detail => {
      const exists = inWarehouseOptions.value.some(item => item.warehouseCode === detail.inWarehouseCode)
      if (!exists) {
        detail.inWarehouseCode = ''
        detail.inWarehouseName = ''
      }
    })
  } catch (error) {
    console.error('Failed to load inbound warehouse list by cooperative:', error)
    clearInWarehouseSelection()
  }
}

const loadCategoryOptions = async () => {
  try {
    const [mainRes, subRes, unitRes] = await Promise.all([
      getDicts('inventory_main_category'),
      getDicts('inventory_sub_category'),
      getDicts('inventory_unit_new')
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

const resolveDictValue = (options, value) => {
  if (!value) return ''
  const match = options.find(item => String(item.value) === String(value) || String(item.label) === String(value))
  return match ? match.value : value
}

const getMainCategoryLabel = (value) => {
  if (!value) return ''
  const match = mainCategoryOptions.value.find(item => String(item.value) === String(value) || item.label === value)
  return match?.label || value
}

const getSubCategoryLabel = (value) => {
  if (!value) return ''
  const match = subCategoryOptions.value.find(item => String(item.value) === String(value) || item.label === value)
  return match?.label || value
}

const SEASON_LABEL_MAP = {
  '1': 'Summer',
  '2': 'Spring',
  '3': 'Irrigation'
}

const seasonOptions = [
  { label: 'Summer', value: '1' },
  { label: 'Spring', value: '2' },
  { label: 'Irrigation', value: '3' }
]

const formatSeason = (season) => {
  const normalizedSeason = String(season || '').trim()
  return SEASON_LABEL_MAP[normalizedSeason] || '-'
}

const createVarietyState = () => ({
  varietyId: '',
  varietyOptions: [],
  varietyLoading: false
})

// Zone鍙樺寲澶勭悊
const handleZoneChange = async (value, options = {}) => {
  const { preserveTarget = false } = options
  if (!preserveTarget) {
    formData.targetId = ''
    formData.targetAddress = ''
    formData.targetContact = ''
    formData.targetPhone = ''
    clearInWarehouseSelection()
  }
  await getAllCoopList(value)
  if (preserveTarget && formData.targetId) {
    await loadInWarehousesByCooperative(formData.targetId)
  }
  await loadDemandList(value)
}

// This method is now consolidated into getAllCoopList below
const loadDemandList = async (code) => {
  demandLoading.value = true
  try {
    const response = await getTownAggregationDetail({
      sourceCode: code,
      year: formData.releaseYear || new Date().getFullYear().toString()
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

// 澶勭悊骞村害鍙樺寲 - 閲嶆柊鍔犺浇闇€姹傚垪琛?
const handleYearChange = () => {
  if (formData.zoneId) {
    loadDemandList(formData.zoneId)
  }
}

const getCoorInfo = async (value) => {
  if (!value || value.length === 0) {
    formData.targetAddress = ''
    formData.targetContact = ''
    formData.targetPhone = ''
    clearInWarehouseSelection()
    return
  }
  loading.value = true
  try {
    formData.targetAddress = ''
    formData.targetContact = ''
    formData.targetPhone = ''
    clearInWarehouseSelection()
  } catch (error) {
    formData.targetAddress = ''
    formData.targetContact = ''
    formData.targetPhone = ''
  } finally {
    loading.value = false
  }
}

// 鎶曞叆鍝佺被鍨嬪彉鍖栧鐞?
const handleInputTypeChange = (index) => {
  const detail = formData.details[index]
  detail.inputCategory = ''
  Object.assign(detail, createVarietyState())
  detail.season = ''
  detail.quantity = 0
  detail.currentStock = 0
}

// 鎶曞叆鍝佺被鍒彉鍖栧鐞?
const handleInputCategoryChange = (index) => {
  const detail = formData.details[index]
  const inputTypeLabel = getMainCategoryLabel(detail.inputType)
  const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)
  const matchedDemand = demandList.value.find(d => d.inputType === inputTypeLabel && d.inputCategory === inputCategoryLabel)
  Object.assign(detail, createVarietyState())
  detail.season = matchedDemand?.season || matchedDemand?.seasonCode || matchedDemand?.season_code || ''
  const demandQty = getDemandQuantity(detail.inputType, detail.inputCategory, detail.season)
  detail.quantity = 0
  detail.maxQuantity = demandQty
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
      status: '0'
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

// 鑾峰彇搴撳瓨
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

    const res = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety)
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

// 鏍规嵁鎶曞叆鍝佺被鍨嬭繃婊ゆ姇鍏ュ搧绫诲埆
const getFilteredCategories = (inputType) => {
  if (!inputType) return []
  return subCategoryOptions.value.filter(item => String(item.parentValue) === String(inputType))
}

// 鑾峰彇闇€姹傛暟閲?
const getDemandQuantity = (inputType, inputCategory, season = '') => {
  if (!inputType || !inputCategory) return 0
  const inputTypeLabel = getMainCategoryLabel(inputType)
  const inputCategoryLabel = getSubCategoryLabel(inputCategory)
  const demand = demandList.value.find(d => {
    const matchType = d.inputType === inputTypeLabel
    const matchCategory = d.inputCategory === inputCategoryLabel
    const matchSeason = !season || !d.season || d.season === season
    return matchType && matchCategory && matchSeason
  })
  return demand ? demand.totalQuantity : 0
}

const handleSeasonChange = (index) => {
  const detail = formData.details[index]
  if (!detail) return
  detail.quantity = 0
  detail.maxQuantity = getDemandQuantity(detail.inputType, detail.inputCategory, detail.season)
  if (isStockLookupReady(detail)) {
    fetchStock(index)
  }
}

// 鏍￠獙鏁伴噺 - 鍚屾椂妫€鏌ラ渶姹傞噺鍜屽簱瀛?
const validateQuantity = async (index) => {
  const detail = formData.details[index]
  if (!detail.inputType) return

  // 鏍￠獙闇€姹傞噺
  const maxQty = getDemandQuantity(detail.inputType, detail.inputCategory)
  if (detail.quantity > maxQty) {
    detail.quantity = maxQty
    ElMessage.warning(t('inputCirculation.quantityExceedsDemand'))
    return
  }

  // 鏍￠獙搴撳瓨 - 璁＄畻琛ㄥ崟涓悓绫诲瀷鐨勬€绘暟閲?
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

    const stockRes = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety)
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
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await getUnionReleaseDetail(route.params.id)
    if (response.code === 200 && response.data) {
      Object.assign(formData, response.data.main)
      formData.details = (response.data.details || []).map(detail => ({
        ...createVarietyState(),
        ...detail,
        season: detail.season || detail.seasonCode || detail.season_code || '',
        variety: detail.variety || '',
        varietyId: detail.varietyId || detail.variety_id || '',
        unit: resolveDictValue(unitOptions.value, detail.unit),
        currentStock: detail.currentStock ?? detail.current_stock ?? 0
      }))
      if (formData.zoneId) {
        await handleZoneChange(formData.zoneId, { preserveTarget: true })
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
  // 妫€鏌ユ槸鍚︽湁闇€姹傛暟鎹?
  if (!demandList.value || demandList.value.length === 0) {
    ElMessage.warning(t('inputCirculation.noDemandCannotAdd'))
    return
  }
  // 榛樿閫夋嫨绗竴涓崟浣?
  const defaultUnit = unitOptions.value[0]?.value || ''
  formData.details.push({
    ...createVarietyState(),
    inputType: '',
    inputCategory: '',
    variety: '',
    season: '',
    quantity: 0,
    unit: defaultUnit,
    unitPrice: 0,
    maxQuantity: 0,
    currentStock: 0,
    outWarehouseCode: '',
    outWarehouseName: '',
    inWarehouseCode: '',
    inWarehouseName: ''
  })
}

const removeDetail = (index) => {
  formData.details.splice(index, 1)
}

const handleDetailOutWarehouseChange = (row, code) => {
  const warehouse = warehouseOptions.value.find(item => item.warehouseCode === code)
  row.outWarehouseName = warehouse ? warehouse.warehouseName : ''
}

const handleDetailInWarehouseChange = (row, code) => {
  const warehouse = inWarehouseOptions.value.find(item => item.warehouseCode === code)
  row.inWarehouseName = warehouse ? warehouse.warehouseName : ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    // 楠岃瘉鍒嗗彂鏁伴噺涓嶈兘涓?
    const zeroQuantityDetail = formData.details.find(d => !d.quantity || d.quantity <= 0)
    if (zeroQuantityDetail) {
      ElMessage.warning(t('inputCirculation.quantityCannotBeZero'))
      return
    }

    loading.value = true
    try {
      const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
      if (!deptId) {
        ElMessage.error(t('inputCirculation.organCodeMissing') || '鏃犳硶鑾峰彇鏈烘瀯缂栫爜')
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
        const stockRes = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, item.variety)
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

      const apiFunc = isEdit.value ? editUnionRelease : addUnionRelease
      const submitData = { ...formData, flag: 0  }
      submitData.details = formData.details.map(({ varietyOptions, varietyLoading, ...detail }) => ({ ...detail }))
      const response = await apiFunc(submitData)
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

const regionCode = ref('')

const getAllCoopList = async (value) => {
  loading.value = true
  regionCode.value = value
  try {
    const response = await getOrgansRegionByCode({ regionCode: value })
    if (response.code === 200) {
      const list = response.data || []
      coorList.value = list.map(item => ({
        code: item.code || item.id,
        name: item.orgName || item.name
      }))
    }
  } catch (error) {
    ElMessage.error(t('inputCirculation.queryCooperativeListFailed'))
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

// 鏍规嵁椤甸潰妯″紡杩斿洖涓嶅悓鐨勬寜閽?
const getActionButtons = () => {
  const mode = pageMode.value

  // 鏂板缓/缂栬緫妯″紡
  if (mode === 'add' || mode === 'edit') {
    return [
      { type: '', label: 'cancel', action: 'cancel' },
      { type: 'primary', label: 'save', action: 'save' }
    ]
  }

  // 榛樿鎸夐挳
  return [
    { type: '', label: 'cancel', action: 'cancel' },
    { type: 'primary', label: 'save', action: 'save' }
  ]
}

// 缁熶竴鐨勫姩浣滃鐞嗘柟娉?
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

onMounted(async () => {
  await getUserInfo()
  await loadCategoryOptions()
  await loadWarehouses()
  if (isEdit.value) {
    await fetchDetail()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
</style>
