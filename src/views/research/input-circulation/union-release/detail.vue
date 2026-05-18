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
            <h1 class="page-title">{{ $t('inputCirculation.releaseDetail') }}</h1>
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper" v-loading="loading">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <div class="card-title">
              <i class="ri-information-line"></i>
              <span>{{ $t('inputCirculation.basicInfo') }}</span>
            </div>
          </div>
          <div class="card-body">
            <el-descriptions :column="2" border>
              <el-descriptions-item :label="$t('inputCirculation.releaseId')">
                {{ detailData.main?.releaseId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.releaseName')">
                {{ detailData.main?.releaseName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.targetCooperative')">
                {{ detailData.main?.targetId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.cooperativeContact')">
                {{ detailData.main?.targetContact || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.releaseDate')">
                {{ detailData.main?.releaseDate || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.auditBy')">
                {{ detailData.main?.auditBy || '-' }}
              </el-descriptions-item>
            </el-descriptions>
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
          </div>
          <div class="card-body">
            <el-table :data="detailData.details" border>
              <el-table-column type="index" width="80" />
              <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputType')" min-width="180">
                <template #default="{ row }">
                  {{ getMainCategoryLabel(row.inputType) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputCategory')" min-width="180">
                <template #default="{ row }">
                  {{ getSubCategoryLabel(row.inputCategory) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('farmerDemand.form.variety')" prop="variety" min-width="160">
                <template #default="{ row }">
                  {{ row.variety || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="season" :label="$t('farmerDemand.form.season')" min-width="160">
                <template #default="{ row }">
                  {{ formatSeason(row.season) }}
                </template>
              </el-table-column>
              <el-table-column prop="demandQuantity" :label="$t('inputCirculation.demandQuantity')" min-width="140" />
              <el-table-column prop="currentStock" :label="$t('inputCirculation.currentStock')" min-width="140" />
              <el-table-column prop="quantity" :label="$t('inputCirculation.quantity')" min-width="180" />
              <el-table-column :label="$t('inputCirculation.unit')" min-width="140">
                <template #default="{ row }">
                  {{ getUnitLabel(row.unit) }}
                </template>
              </el-table-column>
              <el-table-column prop="unitPrice" :label="$t('inputCirculation.unitPrice')" min-width="150" />
              <el-table-column prop="outWarehouseCode" :label="$t('inputCirculation.outWarehouse')" min-width="180" />
              <el-table-column prop="inWarehouseCode" :label="$t('inputCirculation.inWarehouse')" min-width="180" />
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getUnionReleaseDetail, getDeptCategoryStock } from '@/api/inputCirculation'
import { getTownAggregationDetail } from '@/api/villageAggregation'
import { getDicts } from '@/api/system/dict'
import { parseI18nValue } from '@/utils/i18nHelper'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const detailData = ref({ main: {}, details: [] })
const demandList = ref([])
const demandLoading = ref(false)
const mainCategoryOptions = ref([])
const subCategoryOptions = ref([])
const unitOptions = ref([])

const getMainCategoryLabel = (value) => {
  if (!value) return '-'
  const match = mainCategoryOptions.value.find(item => String(item.value) === String(value) || item.label === value)
  return match?.label || value
}

const getSubCategoryLabel = (value) => {
  if (!value) return '-'
  const match = subCategoryOptions.value.find(item => String(item.value) === String(value) || item.label === value)
  return match?.label || value
}

const SEASON_LABEL_MAP = {
  '1': 'Summer',
  '2': 'Spring',
  '3': 'Irrigation'
}

const formatSeason = (season) => {
  const normalizedSeason = String(season || '').trim()
  return SEASON_LABEL_MAP[normalizedSeason] || '-'
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

const getUnitLabel = (value) => {
  if (!value) return '-'
  const match = unitOptions.value.find(item => String(item.value) === String(value) || String(item.label) === String(value))
  return match?.label || value
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await getUnionReleaseDetail(route.params.id)
    if (response.code === 200) {
      const data = response.data || {}
      const rawDetails = data.details || data.detailList || []
      detailData.value = {
        ...data,
        details: normalizeDetails(rawDetails)
      }
      // 加载需求列表
      const regionCode = detailData.value.main?.zoneId || detailData.value.main?.zone_id
      if (regionCode) {
        await loadDemandList(regionCode)
      }
      // 从需求列表获取 demandQuantity
      updateDemandQuantity()
      // 获取当前库存
      await fetchCurrentStock()
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
}

const updateDemandQuantity = () => {
  detailData.value.details = detailData.value.details.map(detail => {
    const inputTypeLabel = getMainCategoryLabel(detail.inputType)
    const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)
    const matchedDemand = demandList.value.find(d => {
      const matchType = getMainCategoryLabel(d.inputType) === inputTypeLabel
      const matchCategory = getSubCategoryLabel(d.inputCategory) === inputCategoryLabel
      return matchType && matchCategory
    })
    return {
      ...detail,
      demandQuantity: matchedDemand?.totalQuantity || detail.demandQuantity || 0,
      season: detail.season || matchedDemand?.season || matchedDemand?.seasonCode || matchedDemand?.season_code || ''
    }
  })
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

const fetchCurrentStock = async () => {
  const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
  if (!deptId) return

  const detailsWithStock = await Promise.all(detailData.value.details.map(async (detail) => {
    if (!detail.inputType || !detail.inputCategory || !detail.variety) {
      return { ...detail, currentStock: 0 }
    }
    try {
      const inputTypeLabel = getMainCategoryLabel(detail.inputType)
      const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)
      const res = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety)
      if (res.code === 200 && Array.isArray(res.data)) {
        const matched = findMatchedStockItem(res.data, inputTypeLabel, inputCategoryLabel, detail.variety)
        return { ...detail, currentStock: matched?.availableQty ?? 0 }
      }
    } catch (error) {
      console.error('Failed to fetch stock:', error)
    }
    return { ...detail, currentStock: 0 }
  }))

  detailData.value.details = detailsWithStock
}

// 加载需求列表
const loadDemandList = async (regionCode) => {
  demandLoading.value = true
  try {
    const year = detailData.value.main?.releaseYear || detailData.value.main?.release_year || new Date().getFullYear().toString()
    const response = await getTownAggregationDetail({ sourceCode: regionCode, year })
    if (response.code === 200) {
      demandList.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load demand list:', error)
  } finally {
    demandLoading.value = false
  }
}

const normalizeDetails = (list) => {
  if (!Array.isArray(list)) return []
  return list.map(item => ({
    ...item,
    inputType: item.inputType ?? item.input_type,
    inputCategory: item.inputCategory ?? item.input_category,
    season: item.season || item.seasonCode || item.season_code || '',
    variety: item.variety || '',
    demandQuantity: item.demandQuantity ?? item.demand_quantity,
    unitPrice: item.unitPrice ?? item.unit_price,
    currentStock: item.currentStock ?? item.current_stock,
    maxQuantity: item.maxQuantity ?? item.max_quantity,
    outWarehouseCode: item.outWarehouseCode ?? item.out_warehouse_code,
    outWarehouseName: item.outWarehouseName ?? item.out_warehouse_name,
    inWarehouseCode: item.inWarehouseCode ?? item.in_warehouse_code,
    inWarehouseName: item.inWarehouseName ?? item.in_warehouse_name
  }))
}

const handleBack = () => router.back()
onMounted(async () => {
  await loadCategoryOptions()
  await fetchDetail()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
</style>
