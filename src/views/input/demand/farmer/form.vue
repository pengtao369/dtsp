<template>
  <div class="page-container">
    <div class="page-wrapper">
      <div class="page-header">
        <div class="header-left">
          <el-button class="back-btn" @click="handleCancel">
            <i class="ri-arrow-left-line"></i>
          </el-button>
          <div class="header-content">
            <h1 class="page-title">{{ isEdit ? $t('farmerDemand.edit') : $t('farmerDemand.add') }}</h1>
            <p class="page-subtitle">{{ $t('farmerDemand.subtitle') }}</p>
          </div>
        </div>
      </div>

      <div class="content-wrapper">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            :label-width="labelWidth"
        >
          <InfoCard
            :title="$t('farmerDemand.form.farmerInfo')"
            icon="ri-user-line"
          >
            <div class="card-body">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item
                    v-if="showFarmerIdentityFields"
                    :label="$t('farmerDemand.form.farmerName')"
                    prop="farmerName"
                  >
                    <el-select
                        v-model="selectedFarmer"
                        :placeholder="$t('farmerDemand.placeholder.farmerName')"
                        filterable
                        remote
                        :remote-method="handleSearchFarmer"
                        :loading="farmerLoading"
                        @change="handleSelectFarmer"
                        style="width: 100%"
                        value-key="farmerId"
                        clearable
                    >
                      <el-option
                          v-for="farmer in farmerList"
                          :key="farmer.farmerId"
                          :label="farmer.farmerName"
                          :value="farmer"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('farmerDemand.form.year')" prop="year">
                    <el-date-picker
                        v-model="formData.year"
                        type="year"
                        format="YYYY"
                        value-format="YYYY"
                        :placeholder="$t('farmerDemand.placeholder.year')"
                        :disabled="isCurrentYearDisabled"
                        style="width: 100%"
                    ></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" v-if="showFarmerIdentityFields">
                  <el-form-item :label="$t('farmerDemand.form.farmerIdNumber')" prop="farmerIdNumber">
                    <el-input v-model="formData.farmerIdNumber" :placeholder="$t('farmerDemand.placeholder.farmerIdNumber')" disabled></el-input>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" v-if="showFarmerIdentityFields">
                  <el-form-item :label="$t('farmerDemand.form.landArea')" prop="landArea">
                    <el-input-number v-model="formData.landArea" :min="0" :precision="2" style="width: 100%" disabled></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('farmerDemand.form.zone')" prop="zoneName">
                    <el-input v-if="showFarmerIdentityFields" v-model="formData.zoneName" :placeholder="$t('farmerDemand.placeholder.zone')" disabled></el-input>
                    <el-select
                      v-else
                      v-model="formData.zone"
                      :placeholder="$t('farmerDemand.placeholder.zone')"
                      filterable
                      clearable
                      style="width: 100%"
                      @change="handleZoneChange"
                      :loading="zoneLoading">
                      <el-option
                        v-for="item in zoneOptions"
                        :key="item.code"
                        :label="item.name"
                        :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('farmerDemand.form.woreda')" prop="woredaName">
                    <el-input v-if="showFarmerIdentityFields" v-model="formData.woredaName" :placeholder="$t('farmerDemand.placeholder.woreda')" disabled></el-input>
                    <el-select
                      v-else
                      v-model="formData.woreda"
                      :placeholder="$t('farmerDemand.placeholder.woreda')"
                      filterable
                      clearable
                      style="width: 100%"
                      @change="handleWoredaChange"
                      :loading="woredaLoading"
                      :disabled="!formData.zone">
                      <el-option
                        v-for="item in woredaOptions"
                        :key="item.code"
                        :label="item.name"
                        :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('farmerDemand.form.kebele')" prop="kebeleName">
                    <el-input v-if="showFarmerIdentityFields" v-model="formData.kebeleName" :placeholder="$t('farmerDemand.placeholder.kebele')" disabled></el-input>
                    <el-select
                      v-else
                      v-model="formData.kebele"
                      :placeholder="$t('farmerDemand.placeholder.kebele')"
                      filterable
                      clearable
                      style="width: 100%"
                      :loading="kebeleLoading"
                      :disabled="!formData.woreda"
                      @change="handleKebeleChange">
                      <el-option
                        v-for="item in kebeleOptions"
                        :key="item.code"
                        :label="item.name"
                        :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </InfoCard>

          <InfoCard
            :title="$t('farmerDemand.form.itemsInfo')"
            icon="ri-list-check"
          >
            <template #actions>
              <el-button type="primary" size="small" @click="handleAddItem">
                <i class="ri-add-line"></i>
                {{ $t('farmerDemand.form.addItem') }}
              </el-button>
            </template>

            <div class="card-body">
              <div v-if="showFarmerIdentityFields && formData.inputItems.length > 0 && formData.landArea" class="crop-land-summary-wrapper">
                <div class="summary-header">
                  <span class="summary-label">{{ $t('farmerDemand.realtime.totalLandArea') }}:</span>
                  <span class="summary-value">{{ formData.landArea }} {{ $t('farmerDemand.realtime.hectares') }}</span>
                </div>

                <div v-if="Object.keys(mixedSummaries).length > 0" class="season-summaries-list">
                  <div v-for="(data, key) in mixedSummaries" :key="key"
                       class="season-summary-item"
                       :class="{ 'exceeded': data.sum > formData.landArea }">
                    <span class="season-name">{{ getSeasonName(data.season) }} - {{ data.displayName }}</span>
                    <span class="season-sum">{{ data.sum.toFixed(2) }} {{ $t('farmerDemand.realtime.hectares') }}</span>
                    <i v-if="data.sum > formData.landArea" class="ri-error-warning-line warning-icon"></i>
                  </div>
                </div>

                <div v-if="isSeasonCropLandExceeded" class="error-message">
                  <i class="ri-error-warning-line"></i>
                  <span>{{ getSeasonName(isSeasonCropLandExceeded.season) }} - {{ isSeasonCropLandExceeded.displayName }}: {{ $t('farmerDemand.messages.cropLandExceedsLandArea', { totalCropLand: isSeasonCropLandExceeded.sum.toFixed(2), landArea: formData.landArea }) }}</span>
                </div>
              </div>

              <div v-if="formData.inputItems.length === 0" class="no-items">
                <el-empty :description="$t('farmerDemand.form.noItems')"></el-empty>
              </div>
              <div v-else class="items-list">
                <div v-for="(item, index) in formData.inputItems" :key="index" class="item-card">
                  <div class="item-header">
                    <span class="item-index">{{ index + 1 }}</span>
                    <el-button link type="danger" @click="handleRemoveItem(index)">
                      <i class="ri-delete-bin-line"></i>
                      {{ $t('farmerDemand.form.removeItem') }}
                    </el-button>
                  </div>
                  <el-row :gutter="20" style="margin-bottom: 16px;">
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.inputType')"
                          :prop="`inputItems.${index}.inputType`"
                          :rules="rules.inputType"
                      >
                        <div v-loading="categoryLoading">
                          <el-select
                              v-model="item.inputType"
                              :placeholder="$t('farmerDemand.placeholder.inputType')"
                              style="width: 100%"
                              clearable
                              @change="(val) => handleMainCategoryChange(val, index)"
                          >
                            <el-option
                                v-for="category in mainCategoryOptions"
                                :key="category.value"
                                :label="category.label"
                                :value="category.value"
                            ></el-option>
                          </el-select>
                        </div>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.inputCategory')"
                          :prop="`inputItems.${index}.inputCategory`"
                          :rules="rules.inputCategory"
                      >
                        <div v-loading="categoryLoading">
                          <el-select
                              v-model="item.inputCategory"
                              :placeholder="$t('farmerDemand.placeholder.inputCategory')"
                              style="width: 100%"
                              clearable
                              :disabled="!item.inputType"
                              @change="(val) => handleSubCategoryChange(val, index)"
                          >
                            <el-option
                                v-for="category in getSubCategoryOptions(item.inputType)"
                                :key="category.value"
                                :label="category.label"
                                :value="category.value"
                            ></el-option>
                          </el-select>
                        </div>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20" style="margin-bottom: 16px;">
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.variety')"
                          :prop="`inputItems.${index}.variety`"
                          :rules="rules.variety"
                      >
                        <div v-loading="item.varietyLoading">
                          <el-select
                              v-model="item.varietyId"
                              :placeholder="$t('farmerDemand.placeholder.variety')"
                              style="width: 100%"
                              clearable
                              filterable
                              :disabled="!item.inputType || !item.inputCategory"
                              @change="(val) => handleVarietyChange(val, index)"
                          >
                            <el-option
                                v-for="variety in item.varietyOptions || []"
                                :key="variety.value"
                                :label="variety.label"
                                :value="variety.value"
                            ></el-option>
                          </el-select>
                        </div>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20" style="margin-bottom: 16px;">
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.season')"
                          :prop="`inputItems.${index}.season`"
                          :rules="rules.season"
                      >
                        <el-select v-model="item.season" :placeholder="$t('farmerDemand.placeholder.season')" style="width: 100%">
                          <el-option
                              v-for="seasonItem in options.agri_season"
                              :key="seasonItem.value"
                              :label="seasonItem.label"
                              :value="seasonItem.value"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.cropLand')"
                          :prop="`inputItems.${index}.cropLand`"
                          :rules="rules.cropLand"
                      >
                        <el-input-number
                            v-model="item.cropLand"
                            :min="0"
                            :precision="2"
                            style="width: 100%"
                            :placeholder="$t('farmerDemand.placeholder.cropLand')"
                        ></el-input-number>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.unit')"
                          :prop="`inputItems.${index}.unit`"
                          :rules="rules.unit"
                      >
                        <el-select v-model="item.unit" :placeholder="$t('farmerDemand.placeholder.unit')" style="width: 100%">
                          <el-option
                              v-for="unitItem in options.agri_unit"
                              :key="unitItem.value"
                              :label="unitItem.label"
                              :value="unitItem.value"
                          ></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                      <el-form-item
                          :label="$t('farmerDemand.form.quantity')"
                          :prop="`inputItems.${index}.quantity`"
                          :rules="rules.quantity"
                      >
                        <el-input-number v-model="item.quantity" :min="0" :precision="2" style="width: 100%"></el-input-number>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </InfoCard>

          <div class="form-actions">
            <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              {{ $t('common.submit') }}
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
import { addFarmerDemand, updateFarmerDemand, getFarmerDemandDetail } from '@/api/farmerDemand'
import { getFarmerList, getFarmerDetail } from '@/api/newFarm'
import { getDicts } from '@/api/system/dict'
import { listProductManage } from '@/api/productManage'
import { listSubRegionByCode } from '@/api/application'
import { useDict, clearDictCache } from '@/hooks/useDict'
import { parseI18nValue } from '@/utils/i18nHelper'
import { InfoCard } from '@/components/common'
import { withDemandRegionAliases } from '@/utils/demandHierarchy'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const labelWidth = computed(() => {
  const isMobile = window.innerWidth <= 768
  return isMobile ? '120px' : '180px'
})

const formRef = ref(null)
const submitting = ref(false)
const isEdit = computed(() => !!route.params.id)
const DEMAND_ENTRY_TYPE_WHOLE = 'WHOLE_DEMAND'
const DEMAND_ENTRY_TYPE_BY_FARMERS = 'BY_FARMERS'
const isAddByFarmersRoute = computed(() => route.name === 'FarmerDemandAddByFarmers')
const isByFarmersMode = ref(false)
const showFarmerIdentityFields = computed(() => !isByFarmersMode.value)
const isCurrentYearDisabled = computed(() => !isEdit.value)

const farmerList = ref([])
const farmerLoading = ref(false)
const selectedFarmer = ref(null)
const userId = ref('')

const zoneOptions = ref([])
const woredaOptions = ref([])
const kebeleOptions = ref([])
const zoneLoading = ref(false)
const woredaLoading = ref(false)
const kebeleLoading = ref(false)
const ORomiaRegionCode = '000000000000'

const currentYear = new Date().getFullYear()

const {
  options: dictOptions,
  options,
  loading: dictLoading,
  refresh: refreshDict
} = useDict([
  'agri_unit',
  'agri_season'
], {
  immediate: true,
  cache: true
})

const categoryLoading = ref(false)
const mainCategoryOptions = ref([])
const subCategoryOptions = ref([])

const createVarietyState = () => ({
  varietyId: '',
  variety: '',
  varietyOptions: [],
  varietyLoading: false
})

const formData = reactive({
  farmerId: '',
  farmerName: '',
  farmerIdNumber: '',
  region: '',
  zone: '',
  woreda: '',
  kebele: '',
  zoneName: '',
  woredaName: '',
  kebeleName: '',
  village: '',
  daUserId: '',
  daUserName: '',
  landArea: null,
  demandEntryType: DEMAND_ENTRY_TYPE_WHOLE,
  year: currentYear.toString(),
  inputItems: []
})

const applyDemandEntryMode = (entryType) => {
  const normalizedType = entryType === DEMAND_ENTRY_TYPE_BY_FARMERS
    ? DEMAND_ENTRY_TYPE_BY_FARMERS
    : DEMAND_ENTRY_TYPE_WHOLE

  formData.demandEntryType = normalizedType
  isByFarmersMode.value = normalizedType === DEMAND_ENTRY_TYPE_BY_FARMERS
}

const mixedSummaries = computed(() => {
  const result = {}
  formData.inputItems.forEach(item => {
    if (item.season && item.inputType) {
      let key, displayName

      if (item.inputType === 'IN01') {
        // 绉嶅瓙锛氭寜瀛ｈ妭+澶х被鍒嗙粍
        key = `${item.season}_${item.inputType}`
        displayName = getInputTypeName(item.inputType)
      } else {
        // 鍖栬偉鍙婂叾浠栵細鎸夊鑺?灏忕被鍒嗙粍
        if (!item.inputCategory) return
        key = `${item.season}_${item.inputCategory}`
        displayName = getInputCategoryName(item.inputCategory)
      }

      if (!result[key]) {
        result[key] = {
          season: item.season,
          inputType: item.inputType,
          inputCategory: item.inputCategory,
          displayName: displayName,
          sum: 0
        }
      }
      result[key].sum += (item.cropLand || 0)
    }
  })
  return result
})

const isSeasonCropLandExceeded = computed(() => {
  if (!formData.landArea) return null

  for (const [key, data] of Object.entries(mixedSummaries.value)) {
    if (data.sum > formData.landArea) {
      return {
        season: data.season,
        displayName: data.displayName,
        sum: data.sum
      }
    }
  }
  return null
})

const getSeasonName = (seasonValue) => {
  if (!seasonValue) return ''
  const agriSeason = options.agri_season || dictOptions.value.agri_season || []
  const season = agriSeason.find(item => item.value === seasonValue)
  return season ? season.label : seasonValue
}

const getInputTypeName = (typeValue) => {
  if (!typeValue) return ''
  const match = mainCategoryOptions.value.find(item => String(item.value) === String(typeValue))
  return match ? match.label : typeValue
}

const getInputCategoryName = (categoryValue) => {
  if (!categoryValue) return ''
  const match = subCategoryOptions.value.find(item => String(item.value) === String(categoryValue))
  if (match) return match.label
  return categoryValue
}

const getSubCategoryOptions = (mainCategoryValue) => {
  if (!mainCategoryValue) return []
  return subCategoryOptions.value.filter(item => String(item.parentValue) === String(mainCategoryValue))
}

const rules = reactive({
  farmerName: [
    { required: true, message: t('farmerDemand.rules.farmerNameRequired'), trigger: 'change' },
    { max: 100, message: t('farmerDemand.rules.farmerNameLength'), trigger: 'change' }
  ],
  farmerIdNumber: [
    { max: 50, message: t('farmerDemand.rules.farmerIdNumberLength'), trigger: 'blur' }
  ],
  inputType: [{
    required: true,
    message: t('farmerDemand.rules.inputTypeRequired'),
    trigger: 'change'
  }],
  inputCategory: [{
    required: true,
    message: t('farmerDemand.rules.inputCategoryRequired'),
    trigger: 'change'
  }],
  variety: [{
    required: true,
    message: t('farmerDemand.rules.varietyRequired'),
    trigger: 'change'
  }],
  season: [{
    required: true,
    message: t('farmerDemand.rules.seasonRequired'),
    trigger: 'change'
  }],
  // cropLand: [{
  //   required: true,
  //   message: t('farmerDemand.rules.cropLandRequired'),
  //   trigger: 'blur'
  // }],
  unit: [{
    required: true,
    message: t('farmerDemand.rules.unitRequired'),
    trigger: 'blur'
  }],
  quantity: [{
    required: true,
    message: t('farmerDemand.rules.quantityRequired'),
    trigger: 'blur'
  }]
})

const handleMainCategoryChange = (value, index) => {
  const currentItem = formData.inputItems[index]
  if (!currentItem) return
  currentItem.inputType = value || ''
  currentItem.inputCategory = ''
  currentItem.varietyId = ''
  currentItem.variety = ''
  currentItem.varietyOptions = []
  currentItem.varietyLoading = false
}

const handleSubCategoryChange = async (value, index, preserveSelection = false) => {
  const currentItem = formData.inputItems[index]
  if (!currentItem) return

  const existingVarietyId = currentItem.varietyId
  const existingVarietyName = currentItem.variety

  currentItem.inputCategory = value || ''
  currentItem.varietyId = preserveSelection ? (existingVarietyId || '') : ''
  currentItem.variety = preserveSelection ? (existingVarietyName || '') : ''
  currentItem.varietyOptions = []

  if (!currentItem.inputType || !currentItem.inputCategory) {
    currentItem.varietyLoading = false
    return
  }

  currentItem.varietyLoading = true
  try {
    const mainCategoryLabel = getInputTypeName(currentItem.inputType)
    const subCategoryLabel = getInputCategoryName(currentItem.inputCategory)

    const res = await listProductManage({
      pageNum: 1,
      pageSize: 1000,
      mainCategory: mainCategoryLabel,
      subCategory: subCategoryLabel,
      status: '0'
    })

    const list = res.data?.list || []
    currentItem.varietyOptions = list
      .map(product => ({
        id: product.id || product.product_id || '',
        label: product.product_name || product.product_code || '-',
        value: product.id || product.product_id || '',
        productName: product.product_name || product.product_code || ''
      }))
      .filter(option => option.value)

    if (currentItem.varietyId) {
      const matchedById = currentItem.varietyOptions.find(option => String(option.value) === String(currentItem.varietyId))
      if (matchedById) {
        currentItem.variety = matchedById.productName
      }
    } else if (currentItem.variety) {
      const matchedOption = currentItem.varietyOptions.find(option => option.productName === currentItem.variety)
      if (matchedOption) {
        currentItem.varietyId = matchedOption.value
      }
    }
  } catch (error) {
    currentItem.varietyOptions = []
    ElMessage.error(t('common.loadFailed'))
  } finally {
    currentItem.varietyLoading = false
  }
}

const handleVarietyChange = (value, index) => {
  const currentItem = formData.inputItems[index]
  if (!currentItem) return
  currentItem.varietyId = value || ''
  const matchedOption = (currentItem.varietyOptions || []).find(option => String(option.value) === String(value))
  currentItem.variety = matchedOption?.productName || ''
}

const handleSearchFarmer = async (query) => {
  farmerLoading.value = true
  try {
    const requestParams = {
      farmerName: query.trim() || '',
      pageNum: 1,
      pageSize: 9999999
    }

    const res = await getFarmerList(requestParams)
    farmerList.value = res.data?.records || res.data?.rows || []

    if (farmerList.value.length === 0) {
      ElMessage.info(t('farmerDemand.tips.noFarmerFound', { query: query }))
    }
  } catch (e) {
    ElMessage.error(t('common.loadFailed'))
    farmerList.value = []
  } finally {
    farmerLoading.value = false
  }
}

const handleSelectFarmer = (farmer) => {
  if (!farmer) {
    formData.farmerId = ''
    formData.farmerName = ''
    formData.farmerIdNumber = ''
    formData.zone = ''
    formData.woreda = ''
    formData.kebele = ''
    formData.zoneName = ''
    formData.woredaName = ''
    formData.kebeleName = ''
    formData.landArea = null
    return
  }

  const landArea = farmer.totalLandArea || farmer.landArea || 0
  if (!landArea || landArea <= 0) {
    ElMessage.warning(t('farmerDemand.messages.farmerNoLand'))
    selectedFarmer.value = null
    return
  }

  formData.farmerId = farmer.farmerId || ''
  formData.farmerName = farmer.farmerName || ''
  formData.farmerIdNumber = farmer.idCard || ''
  formData.zone = farmer.zoneCode || ''
  formData.woreda = farmer.woredaCode || ''
  formData.kebele = farmer.kebeleCode || ''
  formData.zoneName = farmer.zoneName || ''
  formData.woredaName = farmer.woredaName || ''
  formData.kebeleName = farmer.kebeleName || ''
  formData.landArea = landArea
}

const handleAddItem = () => {
  const unitOptions = options.agri_unit || dictOptions.value.agri_unit || []
  const defaultUnit = unitOptions.length > 0 ? unitOptions[0].value : ''

  formData.inputItems.push({
    inputType: '',
    inputCategory: '',
    ...createVarietyState(),
    season: '',
    cropLand: null,
    unit: defaultUnit,
    quantity: null
  })
}

const handleRemoveItem = (index) => {
  formData.inputItems.splice(index, 1)
}

const loadData = async () => {
  if (!isEdit.value) return
  try {
    const res = await getFarmerDemandDetail(route.params.id)
    if (res.code === 200 && res.data) {
      Object.assign(formData, res.data)
      applyDemandEntryMode(formData.demandEntryType)
      if (!formData.year) {
        formData.year = currentYear.toString()
      }

      if (isByFarmersMode.value && formData.zone) {
        await loadZoneOptions()
        
        if (formData.woreda) {
          woredaLoading.value = true
          try {
            const woredaRes = await listSubRegionByCode({ regionCode: formData.zone })
            if (woredaRes.code === 200) {
              woredaOptions.value = woredaRes.data || []
            }
          } catch (error) {
            ElMessage.error(t('common.loadFailed'))
          } finally {
            woredaLoading.value = false
          }
        }
        
        if (formData.kebele) {
          kebeleLoading.value = true
          try {
            const kebeleRes = await listSubRegionByCode({ regionCode: formData.woreda })
            if (kebeleRes.code === 200) {
              kebeleOptions.value = kebeleRes.data || []
            }
          } catch (error) {
            ElMessage.error(t('common.loadFailed'))
          } finally {
            kebeleLoading.value = false
          }
        }
      }

      if (formData.inputItems && formData.inputItems.length > 0) {
        formData.inputItems = formData.inputItems.map(item => ({
          ...createVarietyState(),
          ...item
        }))

        await Promise.all(formData.inputItems.map((item, index) => {
          if (item.inputType && item.inputCategory) {
            return handleSubCategoryChange(item.inputCategory, index, true)
          }
          return Promise.resolve()
        }))
      } else {
        formData.inputItems = []
      }

      if (formData.farmerId) {
        farmerLoading.value = true
        try {
          const farmerRes = await getFarmerDetail(formData.farmerId)
          if (farmerRes.code === 200) {
            selectedFarmer.value = farmerRes.data
            formData.zone = farmerRes.data.zoneCode
            formData.woreda = farmerRes.data.woredaCode
            formData.kebele = farmerRes.data.kebeleCode
            formData.zoneName = farmerRes.data.zoneName
            formData.woredaName = farmerRes.data.woredaName
            formData.kebeleName = farmerRes.data.kebeleName
            formData.landArea = farmerRes.data.totalLandArea || farmerRes.data.landArea || formData.landArea
          } else {
            const listRes = await getFarmerList({ farmerId: formData.farmerId, pageSize: 1 })
            if (listRes.data?.records?.length) {
              selectedFarmer.value = listRes.data.records[0]
            }
          }
        } catch (e) {
          ElMessage.error(t('common.loadFailed'))
        } finally {
          farmerLoading.value = false
        }
      }
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    if (!isEdit.value) {
      applyDemandEntryMode(
        isAddByFarmersRoute.value ? DEMAND_ENTRY_TYPE_BY_FARMERS : DEMAND_ENTRY_TYPE_WHOLE
      )
      formData.year = currentYear.toString()
    }

    if (showFarmerIdentityFields.value) {
      if (!formData.farmerId) {
        ElMessage.warning(t('farmerDemand.rules.farmerNameRequired'))
        return
      }

      if (!formData.landArea || formData.landArea <= 0) {
        ElMessage.warning(t('farmerDemand.messages.farmerNoLand'))
        return
      }
    }

    await formRef.value.validate()

    if (formData.inputItems.length === 0) {
      ElMessage.warning(t('farmerDemand.rules.itemsRequired'))
      return
    }

    if (showFarmerIdentityFields.value) {
      const exceeded = isSeasonCropLandExceeded.value
      if (exceeded) {
        const seasonName = getSeasonName(exceeded.season)
        ElMessage.error(`${seasonName} - ${exceeded.displayName}: ${t('farmerDemand.messages.cropLandExceedsLandArea', {
          totalCropLand: exceeded.sum.toFixed(2),
          landArea: formData.landArea
        })}`)
        return
      }
    }

    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        formData.daUserId = userInfo.userId || userInfo.id || ''
        formData.daUserName = userInfo.nickName || userInfo.userName || ''
      } catch (e) {
        console.error('瑙ｆ瀽鐢ㄦ埛淇℃伅澶辫触:', e)
        ElMessage.error(t('common.tips.parseUserInfoFailed'))
        return
      }
    } else {
      ElMessage.warning(t('common.tips.noUserInfo'))
      return
    }
    const submitData = withDemandRegionAliases({
      ...formData,
      inputItems: formData.inputItems.map(item => ({
        inputType: getInputTypeName(item.inputType),
        inputCategory: getInputCategoryName(item.inputCategory),
        productId: item.varietyId,
        variety: item.variety,
        season: item.season,
        cropLand: item.cropLand,
        unit: item.unit,
        quantity: item.quantity
      }))
    })

    submitting.value = true
    const apiFunc = isEdit.value ? updateFarmerDemand : addFarmerDemand
    const params = { ...submitData }

    if (isEdit.value) {
      params.id = route.params.id
    }

    const res = await apiFunc(params)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? t('farmerDemand.editSuccess') : t('farmerDemand.addSuccess'))
      router.push({ name: 'FarmerDemand' })
    } else {
      if (res.msg && res.msg.includes('Farmer demand already exists')) {
        ElMessage.warning(t('farmerDemand.messages.farmerDemandExists'))
      } else {
        ElMessage.error(res.msg || t('farmerDemand.messages.saveFailed'))
      }
    }
  } catch (error) {
    const errorMsg = error?.response?.data?.msg || error?.message || ''
    if (errorMsg.includes('Farmer demand already exists')) {
      ElMessage.warning(t('farmerDemand.messages.farmerDemandExists'))
    } else {
      ElMessage.error(t('farmerDemand.messages.saveFailed'))
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const loadZoneOptions = async () => {
  zoneLoading.value = true
  try {
    const res = await listSubRegionByCode({ regionCode: ORomiaRegionCode })
    if (res.code === 200) {
      zoneOptions.value = res.data || []
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  } finally {
    zoneLoading.value = false
  }
}

const handleZoneChange = async (zoneCode) => {
  formData.woreda = ''
  formData.kebele = ''
  formData.woredaName = ''
  formData.kebeleName = ''
  woredaOptions.value = []
  kebeleOptions.value = []

  if (!zoneCode) return

  const selectedZone = zoneOptions.value.find(item => item.code === zoneCode)
  if (selectedZone) {
    formData.zoneName = selectedZone.name
  }

  woredaLoading.value = true
  try {
    const res = await listSubRegionByCode({ regionCode: zoneCode })
    if (res.code === 200) {
      woredaOptions.value = res.data || []
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  } finally {
    woredaLoading.value = false
  }
}

const handleWoredaChange = async (woredaCode) => {
  formData.kebele = ''
  formData.kebeleName = ''
  kebeleOptions.value = []

  if (!woredaCode) return

  const selectedWoreda = woredaOptions.value.find(item => item.code === woredaCode)
  if (selectedWoreda) {
    formData.woredaName = selectedWoreda.name
  }

  kebeleLoading.value = true
  try {
    const res = await listSubRegionByCode({ regionCode: woredaCode })
    if (res.code === 200) {
      kebeleOptions.value = res.data || []
    }
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
  } finally {
    kebeleLoading.value = false
  }
}

const handleKebeleChange = (kebeleCode) => {
  if (!kebeleCode) {
    formData.kebeleName = ''
    return
  }

  const selectedKebele = kebeleOptions.value.find(item => item.code === kebeleCode)
  if (selectedKebele) {
    formData.kebeleName = selectedKebele.name
  }
}

const loadCategoryOptions = async () => {
  try {
    categoryLoading.value = true
    const [mainRes, subRes] = await Promise.all([
      getDicts('inventory_main_category'),
      getDicts('inventory_sub_category')
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
  } catch (error) {
    console.error('Failed to load category options:', error)
  } finally {
    categoryLoading.value = false
  }
}

onMounted(async () => {
  window.addEventListener('resize', () => {
    labelWidth.value
  })

  try {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      // 浠?userInfo.userInfo.user.id 鑾峰彇鐢ㄦ埛ID
      userId.value = userInfo?.userInfo?.user?.id || userInfo?.user?.id || ''
    } else {
      ElMessage.warning(t('common.tips.noUserInfo'))
    }
  } catch (e) {
    ElMessage.error(t('common.tips.parseUserInfoFailed'))
  }

  applyDemandEntryMode(
    isAddByFarmersRoute.value ? DEMAND_ENTRY_TYPE_BY_FARMERS : DEMAND_ENTRY_TYPE_WHOLE
  )

  await refreshDict()
  await loadCategoryOptions()
  
  await loadZoneOptions()
  
  loadData()

  if (showFarmerIdentityFields.value || isEdit.value) {
    handleSearchFarmer('')
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';

:deep(.el-select .el-input__inner) {
  padding: 0 15px;
}

.crop-land-summary-wrapper {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-color-page);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.summary-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, #00b350 30%, #FEDD00 100%);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-header .summary-label {
  color: white;
  font-weight: 600;
}

.summary-header .summary-value {
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.season-summaries-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.season-summary-item {
  padding: 12px 16px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s;
}

.season-summary-item:hover {
  border-color: var(--el-color-primary);
  box-shadow: var(--el-box-shadow-light);
}

.season-summary-item.exceeded {
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger);
  border-width: 1px;
}

.season-name {
  font-weight: 600;
  color: var(--text-color-primary);
  flex-shrink: 0;
}

.season-sum {
  font-weight: 600;
  color: var(--el-color-primary);
  margin-left: auto;
}

.warning-icon {
  color: var(--el-color-danger);
  font-size: 18px;
  flex-shrink: 0;
}

.error-message {
  padding: 12px 16px;
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 6px;
  color: var(--el-color-danger);
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.error-message i {
  font-size: 16px;
}

.item-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  background: var(--bg-color-overlay);
  margin-bottom: 16px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.item-index {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
}

@media screen and (max-width: 768px) {
  .crop-land-summary-wrapper {
    padding: 12px;
    margin-bottom: 16px;
  }
}
</style>
