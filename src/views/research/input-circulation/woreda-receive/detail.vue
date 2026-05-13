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
            <h1 class="page-title">{{ $t('inputCirculation.confirmReceive') }}</h1>
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
                {{ mainData.releaseId || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.releaseName')">
                {{ mainData.releaseName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.releaseBy')">
                {{ mainData.releaseBy || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.releaseOrg')">
                {{ mainData.releaseOrg || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.releaseDate')">
                {{ mainData.releaseDate || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.status')">
                {{ mainData.receiveStatus || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.confirmBy')">
                {{ mainData.confirmBy || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.confirmOrg')">
                {{ mainData.confirmOrg || '-' }}
              </el-descriptions-item>
              <el-descriptions-item :label="$t('inputCirculation.confirmTime')">
                {{ mainData.confirmTime || '-' }}
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
            <el-table :data="detailData" border>
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
              <el-table-column :label="$t('inputCirculation.quantity')" prop="quantity" min-width="120" />
              <el-table-column :label="$t('inputCirculation.unit')" min-width="100">
                <template #default="{ row }">
                  {{ getLabelByValue('agri_unit', row.unit) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('inputCirculation.unitPrice')" prop="unitPrice" min-width="120" />
            </el-table>
          </div>
        </div>

        <!-- 操作按钮区域（固定在底部） -->
        <div class="form-actions">
          <el-button @click="handleBack">{{ $t('common.cancel') }}</el-button>
          <!-- <el-button type="primary" @click="handleConfirm" :loading="submitLoading">
            {{ $t('inputCirculation.confirmReceive') }}
          </el-button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWoredaReceiveDetail, getUnionReleaseDetailByReleaseId, confirmWoredaReceive } from '@/api/inputCirculation'
import { getTownAggregationDetail } from '@/api/villageAggregation'
import { getDicts } from '@/api/system/dict'
import { useDict } from '@/hooks/useDict'
import { parseI18nValue } from '@/utils/i18nHelper'

const { getLabelByValue } = useDict(['agri_unit'])

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const mainData = ref({})
const detailData = ref([])
const demandList = ref([])
const demandLoading = ref(false)
const mainCategoryOptions = ref([])
const subCategoryOptions = ref([])

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

const loadCategoryOptions = async () => {
  try {
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
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await getWoredaReceiveDetail(route.params.id)
    if (response.code === 200) {
      // 后端返回的数据结构：{ main: {...}, details: [...] }
      mainData.value = response.data?.main || {}
      detailData.value = response.data?.details || []

      // 加载需求列表 - 通过分发单获取 zoneId
      if (mainData.value.releaseId) {
        await loadDemandListByReleaseId(mainData.value.releaseId)
      }
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
}

// 通过分发单ID加载需求列表
const loadDemandListByReleaseId = async (releaseId) => {
  demandLoading.value = true
  try {
    // 先获取分发单详情来获取 zoneId
    const releaseResponse = await getUnionReleaseDetailByReleaseId(releaseId, 1)
    const releaseMain = releaseResponse.data?.main || {}
    const regionCode = releaseMain.zoneId || releaseMain.zone_id
    const year = releaseMain.releaseYear || releaseMain.release_year || new Date().getFullYear().toString()

    if (releaseResponse.code === 200 && regionCode) {
      const response = await getTownAggregationDetail({ sourceCode: regionCode, year })
      if (response.code === 200) {
        demandList.value = response.data || []
      }
    }
  } catch (error) {
    console.error('Failed to load demand list:', error)
  } finally {
    demandLoading.value = false
  }
}

const handleBack = () => router.back()

const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure you want to confirm receipt of this distribution?',
      'Confirm Receipt',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }
    )

    submitLoading.value = true
    // Get current user info
    const userInfoStr = localStorage.getItem('userInfo')
    let confirmBy = ''
    let confirmOrg = ''

    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      const user = userInfo.user || userInfo
      confirmBy = user.REALNAME || user.USERNAME || user.realName || user.username || ''
      confirmOrg = user.ORGANNAME || user.organName || ''
    }

    const response = await confirmWoredaReceive(route.params.id, confirmBy, confirmOrg)

    if (response.code === 200) {
      ElMessage.success('Receipt confirmed successfully')
      router.back()
    } else {
      ElMessage.error(response.msg || 'Failed to confirm receipt')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to confirm receipt:', error)
      ElMessage.error('Failed to confirm receipt')
    }
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  await loadCategoryOptions()
  await fetchDetail()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
</style>
