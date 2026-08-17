import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/store'
import { useLoadingStore } from '@/store/loading'
import { getToken, getTokenFromUrl, getLoginMode } from '../utils/auth'
import { ElMessage } from 'element-plus'
import farmLayoutConfig from '@/config/farm-layout.json'
import inputLayoutConfig from '@/config/input-layout.json'
import researchLayoutConfig from '@/config/research-layout.json'
import newFarmLayoutConfig from '@/config/new-farm-layout.json'
import systemLayoutConfig from '@/config/system-layout.json'
import inventoryLayoutConfig from '@/config/inventory-layout.json'

// 路由白名单
const routeWhitelist = [
  // 首页相关
  '/home',
  '/user',
  '/dataList',
  '/print/seed/breeding-certification',
  '/print/seed/c1-breeding-certificate',
  '/notice',
  // '/research',
  '/research/breeding-data/batch/audit',
  '/research/breeding-data/trial-audit',
  '/research/breeding-data/plot-audit',
  '/research/breeding-data/farming',
  '/breeding/batch/add',
  '/research/breeding/batch/add',
  '/research/breeding-data/trait-audit',
  '/research/data-collection/environment-new-data/audit',
  '/research/breeding-data/field-inspection',
  '/research/breeding-data/dataset-audit',
  '/research/breeding/ose-receive-confirm',
  '/research/breeding/batch/edit',
  '/research/institution/approval/audit',
  '/research/c1-propagation-audit/detail',
  '/research/c1-propagation-audit/audit',
  '/research/variety',
  '/input/demand/audit',
  '/input/demand/audit-district',
  '/input/demand/audit-state',
  '/input/demand/audit-town',
  '/inventory/stock-check-review',
  '/inventory/stock-check-review/review',
  '/research/detection-audit'
]

const normalizeMenuPath = (path) => {
  if (!path || /^https?:\/\//.test(path)) return ''
  return (path.startsWith('/') ? path : `/${path}`).replace(/\/\//g, '/')
}

const getMenuPath = (menu) => normalizeMenuPath(menu?.path)

const findMenuByPath = (menus, path) => {
  const normalizedPath = normalizeMenuPath(path)
  for (const menu of menus || []) {
    if (getMenuPath(menu) === normalizedPath) {
      return menu
    }
    const childMatch = findMenuByPath(menu.children, normalizedPath)
    if (childMatch) {
      return childMatch
    }
  }
  return null
}

const getFirstVisibleLeafPath = (menus, options = {}) => {
  const { skipPaths = new Set(), fallbackPath = '' } = options

  for (const menu of menus || []) {
    if (!menu || menu.hidden === true) continue

    const menuPath = getMenuPath(menu)
    if (menu.children?.length) {
      const childPath = getFirstVisibleLeafPath(menu.children, options)
      if (childPath) return childPath
    }

    if (!menuPath || skipPaths.has(menuPath)) {
      continue
    }

    return menuPath
  }

  return fallbackPath
}

const getDefaultInputRoute = (userStore) => {
  const inputRoot = findMenuByPath(userStore.menus, '/input')
  if (!inputRoot?.children?.length) {
    return '/home'
  }

  return getFirstVisibleLeafPath(inputRoot.children, {
    fallbackPath: '/home'
  })
}

const getDefaultEntryRoute = (userStore) => {
  const inputRoute = getDefaultInputRoute(userStore)
  if (inputRoute !== '/home') {
    return inputRoute
  }

  const firstSystemRoute = getFirstVisibleLeafPath(userStore.menus, {
    fallbackPath: '/home'
  })

  return firstSystemRoute || '/home'
}

const routes = [
  // OAuth2回调页面（不需要认证）- SSO模式下使用
  {
    path: '/callback',
    name: 'Callback',
    component: () => import('../views/callback/index.vue'),
    meta: { requiresAuth: false }
  },
  // 打印页面（独立布局，不带侧边栏和导航）
  {
    path: '/print/seed/breeding-certification/:id',
    name: 'BreedingCertificationPrint',
    component: () => import('../views/seed/breeding-certification/print.vue'),
    meta: { title: 'research.menu.seedCertificationIssuance', hideInMenu: true, requiresAuth: true }
  },
  // C1繁殖批次证书打印页面
  {
    path: '/print/seed/c1-breeding-certificate/:id',
    name: 'C1BreedingCertificatePrint',
    component: () => import('../views/seed/c1-breeding-certificate/print.vue'),
    meta: { title: 'research.menu.c1BatchCertificate', hideInMenu: true, requiresAuth: true }
  },
  // 错误页面
  {
    path: '/401',
    name: 'NoPermission',
    component: () => import('../views/error/401.vue'),
    meta: { title: 'common.noPermission', requiresAuth: false }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: { title: 'common.pageNotFound', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../layout/Layout.vue'),
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/Home.vue'),
        meta: { title: 'common.home', icon: 'home', requiresAuth: true }
      },
      {
        path: 'user',
        name: 'user',
        component: () => import('../components/userDetails.vue'),
        meta: { title: 'common.home', icon: 'user', requiresAuth: true }
      },
      // 应用注册申请逻辑按需求下线，以下路由整体注释保留
      // {
      //   path: 'application',
      //   name: 'Application',
      //   redirect: '/application/record',
      //   meta: { title: 'common.identity', icon: 'application', requiresAuth: true }
      // },
      // {
      //   path: 'application/record',
      //   name: 'ApplicationRecord',
      //   component: () => import('../views/application/recordList.vue'),
      //   meta: { title: '应用申请记录', hideInMenu: true, requiresAuth: true }
      // },
      // {
      //   path: 'application/register',
      //   name: 'ApplicationRegister',
      //   component: () => import('../views/application/index.vue'),
      //   meta: { title: '应用注册申请', hideInMenu: true, requiresAuth: true }
      // },
      // 新的用户身份认证入口页与表单页
      {
        path: 'identity',
        name: 'Identity',
        component: () => import('../views/identity/index.vue'),
        meta: { title: 'common.identity', icon: 'user', requiresAuth: true }
      },
      {
        path: 'identity/farmer',
        name: 'IdentityFarmer',
        component: () => import('../views/identity/farmer.vue'),
        meta: { title: 'common.farmerAuth', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'identity/supplier',
        name: 'IdentitySupplier',
        component: () => import('../views/identity/supplier.vue'),
        meta: { title: 'common.supplierAuth', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'identity/buyer',
        name: 'IdentityBuyer',
        component: () => import('../views/identity/buyer.vue'),
        meta: { title: 'common.buyerAuth', hideInMenu: true, requiresAuth: true }
      },
      // 知识中心逻辑按需求下线，以下路由整体注释保留
      // {
      //   path: 'knowledge',
      //   name: 'Knowledge',
      //   component: () => import('../views/knowledge/index.vue'),
      //   meta: { title: '知识中心', icon: 'knowledge', requiresAuth: true }
      // },
      {
        path: 'dataList',
        name: 'DataList',
        component: () => import('../views/home/components/dataList.vue'),
        meta: { title: 'common.announcement', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'notice/:id',
        name: 'NoticeDetail',
        component: () => import('../views/home/components/NoticeDetail.vue'),
        meta: { title: 'common.noticeDetail', hideInMenu: true, requiresAuth: false }
      }
    ]
  },
  // 研究与开发管理系统
  {
    path: '/research',
    name: 'ResearchSystem',
    component: () => import('../layout/SystemLayout.vue'),
    redirect: '/research/breeding-data/batch',
    meta: { requiresAuth: true, layoutConfig: researchLayoutConfig },
    children: [
      // ==================== 育种数据管理 ====================

      // 育种批次管理
      {
        path: 'breeding-data/batch',
        name: 'BreedingBatchList',
        component: () => import('../views/research/breeding-data/batch/index.vue'),
        meta: { title: 'research.menu.breedingBatchManagement', requiresAuth: true }
      },
      {
        path: 'breeding-data/batch/add',
        name: 'BreedingBatchAdd',
        component: () => import('../views/research/breeding-data/batch/form.vue'),
        meta: { title: 'research.menu.breedingBatchAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/batch/edit/:dataId',
        name: 'BreedingBatchEdit',
        component: () => import('../views/research/breeding-data/batch/form.vue'),
        meta: { title: 'research.menu.breedingBatchEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/batch/detail/:dataId',
        name: 'BreedingBatchDetail',
        component: () => import('../views/research/breeding-data/batch/detail.vue'),
        meta: { title: 'research.menu.breedingBatchDetail', hideInMenu: true, requiresAuth: true }
      },

      {
        path: 'breeding-data/batch/audit/:dataId',
        name: 'BreedingBatchAudit',
        component: () => import('../views/research/breeding-data/batch/form.vue'),
        meta: { title: 'research.menu.breedingBatchApprove', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/batch/approve',
        name: 'BreedingBatchApprove',
        component: () => import('../views/research/breeding-data/batch/approve.vue'),
        meta: { title: 'research.menu.breedingBatchApprove', hideInMenu: true, requiresAuth: true }
      },


      // 地块及播种信息管理
      {
        path: 'breeding-data/plot',
        name: 'PlotInfoList',
        component: () => import('../views/research/breeding-data/plot/index.vue'),
        meta: { title: 'research.menu.plotInfoManagement', requiresAuth: true }
      },
      {
        path: 'breeding-data/plot/add',
        name: 'PlotInfoAdd',
        component: () => import('../views/research/breeding-data/plot/form.vue'),
        meta: { title: 'research.menu.plotInfoAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/plot/edit/:plotId',
        name: 'PlotInfoEdit',
        component: () => import('../views/research/breeding-data/plot/form.vue'),
        meta: { title: 'research.menu.plotInfoEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/plot/detail/:plotId',
        name: 'PlotInfoDetail',
        component: () => import('../views/research/breeding-data/plot/detail.vue'),
        meta: { title: 'research.menu.plotInfoDetail', hideInMenu: true, requiresAuth: true }
      },

      // 地块及播种信息管理审核
      {
        path: 'breeding-data/plot-audit',
        name: 'PlotAuditList',
        component: () => import('../views/research/breeding-data/plot-audit/index.vue'),
        meta: { title: 'research.menu.plotInfoAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/plot-audit/review/:plotId',
        name: 'PlotAuditReview',
        component: () => import('../views/research/breeding-data/plot-audit/review.vue'),
        meta: { title: 'research.menu.plotInfoAudit', hideInMenu: true, requiresAuth: true }
      },

      // 试验基础信息管理
      {
        path: 'breeding-data/trial',
        name: 'TrialBasicList',
        component: () => import('../views/research/breeding-data/trial/index.vue'),
        meta: { title: 'research.menu.trialBasicManagement', requiresAuth: true }
      },
      {
        path: 'breeding-data/trial/add',
        name: 'TrialBasicAdd',
        component: () => import('../views/research/breeding-data/trial/form.vue'),
        meta: { title: 'research.menu.trialBasicAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/trial/edit/:trialId',
        name: 'TrialBasicEdit',
        component: () => import('../views/research/breeding-data/trial/form.vue'),
        meta: { title: 'research.menu.trialBasicEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/trial/detail/:trialId',
        name: 'TrialBasicDetail',
        component: () => import('../views/research/breeding-data/trial/detail.vue'),
        meta: { title: 'research.menu.trialBasicDetail', hideInMenu: true, requiresAuth: true }
      },

      // 农艺性状数据采集
      {
        path: 'breeding-data/trait',
        name: 'AgronomicTraitDataList',
        component: () => import('../views/research/breeding-data/trait/index.vue'),
        meta: { title: 'research.menu.agronomicTraitDataCollection', requiresAuth: true }
      },
      // 农艺性状数据采集
      {
        path: 'breeding-data/trait-audit',
        name: 'AgronomicTraitDataAudit',
        component: () => import('../views/research/breeding-data/trait-audit/index.vue'),
        meta: { title: 'research.menu.agronomicTraitDataAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/trait-audit/review/:traitId',
        name: 'AgronomicTraitDataAuditReview',
        component: () => import('../views/research/breeding-data/trait-audit/review.vue'),
        meta: { title: 'research.menu.agronomicTraitDataAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/trait/add',
        name: 'AgronomicTraitDataAdd',
        component: () => import('../views/research/breeding-data/trait/form.vue'),
        meta: { title: 'research.menu.agronomicTraitDataAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/trait/edit/:traitId',
        name: 'AgronomicTraitDataEdit',
        component: () => import('../views/research/breeding-data/trait/form.vue'),
        meta: { title: 'research.menu.agronomicTraitDataEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/trait/detail/:traitId',
        name: 'AgronomicTraitDataDetail',
        component: () => import('../views/research/breeding-data/trait/detail.vue'),
        meta: { title: 'research.menu.agronomicTraitDataDetail', hideInMenu: true, requiresAuth: true }
      },

      // 农事记录数据采集
      {
        path: 'breeding-data/farming',
        name: 'FarmingRecordDataList',
        component: () => import('../views/research/breeding-data/farming/index.vue'),
        meta: { title: 'research.menu.farmingRecordDataCollection', requiresAuth: true }
      },
      {
        path: 'breeding-data/farming/add',
        name: 'FarmingRecordDataAdd',
        component: () => import('../views/research/breeding-data/farming/form.vue'),
        meta: { title: 'research.menu.farmingRecordDataAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/farming/edit/:farmingId',
        name: 'FarmingRecordDataEdit',
        component: () => import('../views/research/breeding-data/farming/form.vue'),
        meta: { title: 'research.menu.farmingRecordDataEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/farming/detail/:farmingId',
        name: 'FarmingRecordDataDetail',
        component: () => import('../views/research/breeding-data/farming/detail.vue'),
        meta: { title: 'research.menu.farmingRecordDataDetail', hideInMenu: true, requiresAuth: true }
      },

      // 农事记录数据采集审核 - 新增的审核路由
      {
        path: 'breeding-data/farming/farming-index',
        name: 'FarmingRecordAuditIndex',
        component: () => import('../views/research/breeding-data/farming/farming-index.vue'),
        meta: { title: 'research.menu.farmingRecordDataAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/farming/farming-detail/:farmingId',
        name: 'FarmingRecordAuditDetail',
        component: () => import('../views/research/breeding-data/farming/farming-detail.vue'),
        meta: { title: 'research.menu.farmingRecordDataAudit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/farming/farming-form/:farmingId',
        name: 'FarmingRecordAuditForm',
        component: () => import('../views/research/breeding-data/farming/farming-form.vue'),
        meta: { title: 'research.menu.farmingRecordDataAudit', hideInMenu: true, requiresAuth: true }
      },

      // 环境属性数据采集
      {
        path: 'breeding-data/environment',
        name: 'EnvironmentDataList',
        component: () => import('../views/research/breeding-data/environment/index.vue'),
        meta: { title: 'research.menu.environmentDataCollection', requiresAuth: true }
      },
      {
        path: 'breeding-data/environment/add',
        name: 'EnvironmentDataAdd',
        component: () => import('../views/research/breeding-data/environment/form.vue'),
        meta: { title: 'research.menu.environmentDataAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/environment/edit/:envId',
        name: 'EnvironmentDataEdit',
        component: () => import('../views/research/breeding-data/environment/form.vue'),
        meta: { title: 'research.menu.environmentDataEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/environment/detail/:envId',
        name: 'EnvironmentDataDetail',
        component: () => import('../views/research/breeding-data/environment/detail.vue'),
        meta: { title: 'research.menu.environmentDataDetail', hideInMenu: true, requiresAuth: true }
      },

      // 田间检验数据采集
      {
        path: 'breeding-data/field-inspection',
        name: 'FieldInspection',
        component: () => import('../views/research/data-collection/yield-data/index.vue'),
        meta: { title: 'research.menu.fieldInspection', requiresAuth: true }
      },
      {
        path: 'breeding-data/field-inspection/add',
        name: 'FieldInspectionAdd',
        component: () => import('../views/research/data-collection/yield-data/form.vue'),
        meta: { title: 'research.menu.fieldInspectionAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/field-inspection/edit/:id',
        name: 'FieldInspectionEdit',
        component: () => import('../views/research/data-collection/yield-data/form.vue'),
        meta: { title: 'research.menu.fieldInspectionEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/field-inspection/detail/:id',
        name: 'FieldInspectionDetail',
        component: () => import('../views/research/data-collection/yield-data/detail.vue'),
        meta: { title: 'research.menu.fieldInspectionDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/field-inspection/audit/:id',
        name: 'FieldInspectionAudit',
        component: () => import('../views/research/data-collection/yield-data/audit.vue'),
        meta: { title: 'research.menu.fieldInspectionAudit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/field-inspection/audit-detail/:id',
        name: 'FieldInspectionAuditDetail',
        component: () => import('../views/research/data-collection/yield-data/audit-detail.vue'),
        meta: { title: 'research.menu.fieldInspectionAudit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/field-inspection-audit',
        name: 'FieldInspectionAuditList',
        component: () => import('../views/research/data-collection/yield-data/audit-list.vue'),
        meta: { title: 'research.menu.fieldInspectionAudit', requiresAuth: true }
      },

      // 实验室测试数据采集
      {
        path: 'breeding-data/laboratory-test',
        name: 'BreedingLabTest',
        component: () => import('../views/research/data-collection/laboratory-test/index.vue'),
        meta: { title: 'research.menu.laboratoryTest', requiresAuth: true }
      },
      {
        path: 'breeding-data/laboratory-test/add',
        name: 'BreedingLabTestAdd',
        component: () => import('../views/research/data-collection/laboratory-test/form.vue'),
        meta: { title: 'research.menu.laboratoryTestAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/laboratory-test/edit/:id',
        name: 'BreedingLabTestEdit',
        component: () => import('../views/research/data-collection/laboratory-test/form.vue'),
        meta: { title: 'research.menu.laboratoryTestEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/laboratory-test/detail/:id',
        name: 'BreedingLabTestDetail',
        component: () => import('../views/research/data-collection/laboratory-test/detail.vue'),
        meta: { title: 'research.menu.laboratoryTestDetail', hideInMenu: true, requiresAuth: true }
      },

      // 实验室测试数据采集审核
      {
        path: 'breeding-data/laboratory-test-audit',
        name: 'BreedingLabTestAudit',
        component: () => import('../views/research/data-collection/laboratory-test-audit/index.vue'),
        meta: { title: 'research.menu.laboratoryTestAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/laboratory-test-audit/detail/:id',
        name: 'BreedingLabTestAuditDetail',
        component: () => import('../views/research/data-collection/laboratory-test-audit/detail.vue'),
        meta: { title: 'research.menu.laboratoryTestAudit', hideInMenu: true, requiresAuth: true }
      },

      // Breeder seed生产数据采集
      // 育种数据管理 - 育种数据集编制
      {
        path: 'breeding-data/dataset-compilation',
        name: 'DatasetCompilation',
        component: () => import('../views/research/breeding-data/dataset-compilation/index.vue'),
        meta: { title: 'research.menu.datasetCompilation', requiresAuth: true }
      },
      {
        path: 'breeding-data/dataset-compilation/add',
        name: 'DatasetCompilationAdd',
        component: () => import('../views/research/breeding-data/dataset-compilation/form.vue'),
        meta: { title: 'research.menu.datasetCompilation', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/dataset-compilation/edit/:id',
        name: 'DatasetCompilationEdit',
        component: () => import('../views/research/breeding-data/dataset-compilation/form.vue'),
        meta: { title: 'research.menu.datasetCompilation', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/dataset-compilation/detail/:id',
        name: 'DatasetCompilationDetail',
        component: () => import('../views/research/breeding-data/dataset-compilation/detail.vue'),
        meta: { title: 'research.menu.datasetCompilation', hideInMenu: true, requiresAuth: true }
      },
      // 育种数据管理 - 育种数据集审核
      {
        path: 'breeding-data/dataset-audit',
        name: 'DatasetAudit',
        component: () => import('../views/research/breeding-data/dataset-audit/index.vue'),
        meta: { title: 'research.menu.datasetAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/dataset-audit/review/:id',
        name: 'DatasetAuditReview',
        component: () => import('../views/research/breeding-data/dataset-audit/review.vue'),
        meta: { title: 'research.menu.datasetAudit', hideInMenu: true, requiresAuth: true }
      },
      // 育种数据管理 - 试验基础信息管理审核
      {
        path: 'breeding-data/trial-audit',
        name: 'TrialBasicAudit',
        component: () => import('../views/research/breeding-data/trial-audit/index.vue'),
        meta: { title: 'research.menu.trialBasicAudit', requiresAuth: true }
      },
      {
        path: 'breeding-data/trial-audit/review/:id',
        name: 'TrialBasicAuditReview',
        component: () => import('../views/research/breeding-data/trial-audit/review.vue'),
        meta: { title: 'research.menu.trialBasicAudit', hideInMenu: true, requiresAuth: true }
      },
      // 育种数据管理 - 育种许可数据录入
      {
        path: 'breeding-data/breeding-license',
        name: 'BreedingLicense',
        component: () => import('../views/research/breeding-data/breeding-license/index.vue'),
        meta: { title: 'research.menu.breedingLicense', requiresAuth: true }
      },
      {
        path: 'breeding-data/breeding-license/add',
        name: 'BreedingLicenseAdd',
        component: () => import('../views/research/breeding-data/breeding-license/form.vue'),
        meta: { title: 'research.menu.breedingLicense', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/breeding-license/edit/:id',
        name: 'BreedingLicenseEdit',
        component: () => import('../views/research/breeding-data/breeding-license/form.vue'),
        meta: { title: 'research.menu.breedingLicense', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding-data/breeding-license/detail/:id',
        name: 'BreedingLicenseDetail',
        component: () => import('../views/research/breeding-data/breeding-license/detail.vue'),
        meta: { title: 'research.menu.breedingLicense', hideInMenu: true, requiresAuth: true }
      },
      // 数据采集 - 试验基础数据采集
      {
        path: 'breeding/seed-production',
        name: 'SeedProduction',
        component: () => import('../views/research/breeding/seed-production/index.vue'),
        meta: { title: 'research.menu.breederSeedProduction', requiresAuth: true }
      },
      {
        path: 'breeding/seed-production-result',
        name: 'SeedProductionResult',
        component: () => import('../views/research/breeding/seed-production-result/index.vue'),
        meta: { title: 'research.menu.breederSeedProductionResult', requiresAuth: true }
      },
      {
        path: 'breeding/seed-production-result/add',
        name: 'SeedProductionResultAdd',
        component: () => import('../views/research/breeding/seed-production-result/form.vue'),
        meta: { title: 'research.menu.breederSeedProductionAdd', requiresAuth: true }
      },
      {
        path: 'breeding/seed-production-result/detail/:id',
        name: 'SeedProductionResultDetail',
        component: () => import('../views/research/breeding/seed-production-result/detail.vue'),
        meta: { title: 'research.menu.breederSeedProductionResult', requiresAuth: true }
      },
      // Breeder seed分发数据
      {
        path: 'breeding/seed-distribution',
        name: 'SeedDistribution',
        component: () => import('../views/research/breeding/seed-distribution/index.vue'),
        meta: { title: 'research.menu.breederSeedDistribution', requiresAuth: true }
      },

      // Pre-basic Seed生产数据采集
      {
        path: 'breeding/prebasic-seed-production',
        name: 'PrebasicSeedProduction',
        component: () => import('../views/research/breeding/prebasic-seed-production/index.vue'),
        meta: { title: 'research.menu.prebasicSeedProduction', requiresAuth: true }
      },
      {
        path: 'breeding/prebasic-seed-production/add',
        name: 'PrebasicSeedProductionForm',
        component: () => import('../views/research/breeding/prebasic-seed-production/form.vue'),
        meta: { title: 'research.menu.prebasicSeedProductionAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/prebasic-seed-production/detail/:id',
        name: 'PrebasicSeedProductionDetail',
        component: () => import('../views/research/breeding/prebasic-seed-production/detail.vue'),
        meta: { title: 'research.menu.prebasicSeedProductionDetail', hideInMenu: true, requiresAuth: true }
      },

      // Pre-basic Seed生产结果数据
      {
        path: 'breeding/prebasic-seed-production-result',
        name: 'PrebasicSeedProductionResult',
        component: () => import('../views/research/breeding/prebasic-seed-production-result/index.vue'),
        meta: { title: 'research.menu.prebasicSeedProductionResult', requiresAuth: true }
      },

      // Basic Seed生产数据采集
      {
        path: 'breeding/basic-seed-production',
        name: 'BasicSeedProduction',
        component: () => import('../views/research/breeding/basic-seed-production/index.vue'),
        meta: { title: 'research.menu.basicSeedProduction', requiresAuth: true }
      },

      // Basic Seed生产结果数据
      {
        path: 'breeding/basic-seed-production-result',
        name: 'BasicSeedProductionResult',
        component: () => import('../views/research/breeding/basic-seed-production-result/index.vue'),
        meta: { title: 'research.menu.basicSeedProductionResult', requiresAuth: true }
      },

      // 物联网传感器维护
      {
        path: 'data-collection/iot-sensor',
        name: 'IotSensorList',
        component: () => import('../views/research/data-collection/iot-sensor/index.vue'),
        meta: { title: 'research.menu.iotSensorMaintenance', requiresAuth: true }
      },
      {
        path: 'data-collection/iot-sensor/add',
        name: 'IotSensorAdd',
        component: () => import('../views/research/data-collection/iot-sensor/form.vue'),
        meta: { title: 'research.menu.iotSensorMaintenanceAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'data-collection/iot-sensor/edit/:id',
        name: 'IotSensorEdit',
        component: () => import('../views/research/data-collection/iot-sensor/form.vue'),
        meta: { title: 'research.menu.iotSensorMaintenanceEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'data-collection/iot-sensor/detail/:id',
        name: 'IotSensorDetail',
        component: () => import('../views/research/data-collection/iot-sensor/detail.vue'),
        meta: { title: 'research.menu.iotSensorMaintenanceDetail', hideInMenu: true, requiresAuth: true }
      },

      // 环境监测新数据
      {
        path: 'data-collection/environment-new-data',
        name: 'EnvironmentNewDataList',
        component: () => import('../views/research/data-collection/environment-new-data/index.vue'),
        meta: { title: 'research.menu.environmentNewData', requiresAuth: true }
      },
      {
        path: 'data-collection/environment-new-data/add',
        name: 'EnvironmentNewDataAdd',
        component: () => import('../views/research/data-collection/environment-new-data/form.vue'),
        meta: { title: 'research.menu.environmentNewDataAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'data-collection/environment-new-data/edit/:envRecordId',
        name: 'EnvironmentNewDataEdit',
        component: () => import('../views/research/data-collection/environment-new-data/form.vue'),
        meta: { title: 'research.menu.environmentNewDataEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'data-collection/environment-new-data/detail/:envRecordId',
        name: 'EnvironmentNewDataDetail',
        component: () => import('../views/research/data-collection/environment-new-data/detail.vue'),
        meta: { title: 'research.menu.environmentNewDataDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'data-collection/environment-new-data/approve',
        name: 'EnvironmentNewDataApprove',
        component: () => import('../views/research/data-collection/environment-new-data/approve.vue'),
        meta: { title: 'research.menu.environmentNewDataApprove', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'data-collection/environment-new-data/audit/:envRecordId',
        name: 'EnvironmentNewDataAudit',
        component: () => import('../views/research/data-collection/environment-new-data/form.vue'),
        meta: { title: 'research.menu.environmentNewDataApprove', hideInMenu: true, requiresAuth: true }
      },
      // ==================== 繁殖数据管理 ====================

      // OSE确认接收育种家种子
      {
        path: 'breeding/ose-receive-confirm',
        name: 'OseReceiveConfirm',
        component: () => import('../views/research/breeding/ose-receive-confirm/index.vue'),
        meta: { title: 'research.menu.oseReceiveConfirm', requiresAuth: true }
      },
      {
        path: 'breeding/ose-receive-confirm/detail/:id',
        name: 'OseReceiveConfirmDetail',
        component: () => import('../views/research/breeding/ose-receive-confirm/detail.vue'),
        meta: { title: 'research.menu.oseReceiveConfirmDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/ose-receive-confirm/confirm/:id',
        name: 'OseReceiveConfirmConfirm',
        component: () => import('../views/research/breeding/ose-receive-confirm/confirm.vue'),
        meta: { title: 'research.menu.oseReceiveConfirmConfirm', hideInMenu: true, requiresAuth: true }
      },

      // OSE繁殖批次信息数据采集
      {
        path: 'breeding/ose-batch-collection',
        name: 'OseBatchCollection',
        component: () => import('../views/research/breeding/ose-information/batch-collection/index.vue'),
        meta: { title: 'research.menu.oseBatchCollection', requiresAuth: true }
      },
      {
        path: 'breeding/ose-batch-collection/add',
        name: 'OseBatchCollectionAdd',
        component: () => import('../views/research/breeding/ose-information/batch-collection/collection-form.vue'),
        meta: { title: 'research.menu.oseBatchCollectionAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/ose-batch-collection/detail/:id',
        name: 'OseBatchCollectionDetail',
        component: () => import('../views/research/breeding/ose-information/batch-collection/collection-detail.vue'),
        meta: { title: 'research.menu.oseBatchCollectionDetail', hideInMenu: true, requiresAuth: true }
      },

      // 种子扩繁批次信息采集
      {
        path: 'breeding',
        name: 'BreedingModule',
        component: () => import('../views/research/breeding/ose-information/index.vue'),
        meta: { title: 'research.menu.propagationBatchCollection', requiresAuth: true }
      },
      {
        path: 'breeding/batch/add',
        name: 'PropagationBatchAdd',
        component: () => import('../views/research/breeding/ose-information/batch-form.vue'),
        meta: { title: 'research.menu.propagationBatchAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/batch/edit/:id',
        name: 'PropagationBatchEdit',
        component: () => import('../views/research/breeding/ose-information/batch-form.vue'),
        meta: { title: 'research.menu.propagationBatchEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/detail/:id',
        name: 'BreedingDetail',
        component: () => import('../views/research/breeding/ose-information/detail.vue'),
        meta: { title: 'research.menu.propagationBatchDetail', hideInMenu: true, requiresAuth: true }
      },

      // 种子扩繁跟踪信息采集
      {
        path: 'breeding/tracking',
        name: 'BreedingTracking',
        component: () => import('../views/research/breeding-tracking/index.vue'),
        meta: { title: 'research.menu.propagationTrackingCollection', requiresAuth: true }
      },

      // 繁殖种子认证申请
      {
        path: 'seed/breeding-certification',
        name: 'BreedingCertificationList',
        component: () => import('../views/seed/breeding-certification/index.vue'),
        meta: { title: 'research.menu.seedCertificationApplication', requiresAuth: true }
      },
      {
        path: 'seed/breeding-certification/add',
        name: 'BreedingCertificationAdd',
        component: () => import('../views/seed/breeding-certification/form.vue'),
        meta: { title: 'research.menu.seedCertificationApplicationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'seed/breeding-certification/edit/:id',
        name: 'BreedingCertificationEdit',
        component: () => import('../views/seed/breeding-certification/form.vue'),
        meta: { title: 'research.menu.seedCertificationApplicationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'seed/breeding-certification/detail/:id',
        name: 'BreedingCertificationDetail',
        component: () => import('../views/seed/breeding-certification/detail.vue'),
        meta: { title: 'research.menu.seedCertificationApplicationDetail', hideInMenu: true, requiresAuth: true }
      },

      // C1种子繁殖申请
      {
        path: 'c1-propagation',
        name: 'C1PropagationList',
        component: () => import('../views/research/c1-propagation/index.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplication', requiresAuth: true }
      },
      {
        path: 'c1-propagation/add',
        name: 'C1PropagationAdd',
        component: () => import('../views/research/c1-propagation/form.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplicationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'c1-propagation/edit/:id',
        name: 'C1PropagationEdit',
        component: () => import('../views/research/c1-propagation/form.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplicationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'c1-propagation/detail/:id',
        name: 'C1PropagationDetail',
        component: () => import('../views/research/c1-propagation/detail.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplicationDetail', hideInMenu: true, requiresAuth: true }
      },

      // C1种子繁殖申请审核
      {
        path: 'c1-propagation-audit',
        name: 'C1PropagationAuditList',
        component: () => import('../views/research/c1-propagation-audit/index.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplicationAudit', requiresAuth: true }
      },
      {
        path: 'c1-propagation-audit/detail/:id',
        name: 'C1PropagationAuditDetail',
        component: () => import('../views/research/c1-propagation-audit/detail.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplicationAuditDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'c1-propagation-audit/audit/:id',
        name: 'C1PropagationAuditForm',
        component: () => import('../views/research/c1-propagation-audit/audit-form.vue'),
        meta: { title: 'research.menu.c1SeedPropagationApplicationAuditForm', hideInMenu: true, requiresAuth: true }
      },

      // C1繁殖批次管理
      {
        path: 'c1-breeding-batch',
        name: 'C1BreedingBatchList',
        component: () => import('../views/research/c1-breeding-batch/index.vue'),
        meta: { title: 'research.menu.c1PropagationBatchCollection', requiresAuth: true }
      },
      {
        path: 'c1-breeding-batch/add',
        name: 'C1BreedingBatchAdd',
        component: () => import('../views/research/c1-breeding-batch/batch-form.vue'),
        meta: { title: 'research.menu.c1PropagationBatchAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'c1-breeding-batch/edit/:id',
        name: 'C1BreedingBatchEdit',
        component: () => import('../views/research/c1-breeding-batch/batch-form.vue'),
        meta: { title: 'research.menu.c1PropagationBatchEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'c1-breeding-batch/detail/:id',
        name: 'C1BreedingBatchDetail',
        component: () => import('../views/research/c1-breeding-batch/detail.vue'),
        meta: { title: 'research.menu.c1PropagationBatchDetail', hideInMenu: true, requiresAuth: true }
      },

      {
        path: 'detection-management',
        name: 'DetectionManagement',
        component: () => import('../views/research/detection/management.vue'),
        meta: { title: 'research.menu.detectionManagement', requiresAuth: true }
      },
      {
        path: 'detection-audit',
        name: 'DetectionAudit',
        component: () => import('../views/research/detection/audit.vue'),
        meta: { title: 'research.menu.detectionAudit', requiresAuth: true }
      },
      {
        path: 'detection-audit/form/:id',
        name: 'DetectionAuditForm',
        component: () => import('../views/research/detection/audit-form.vue'),
        meta: { title: 'research.menu.detectionAudit', hideInMenu: true, requiresAuth: true }
      },

      // 田间检测
      {
        path: 'field-detection',
        name: 'FieldDetection',
        component: () => import('../views/research/detection/field-detection/index.vue'),
        meta: { title: 'research.menu.fieldDetection', requiresAuth: true, hideInMenu: true }
      },
      {
        path: 'field-detection/add',
        name: 'FieldDetectionAdd',
        component: () => import('../views/research/detection/field-detection/add.vue'),
        meta: { title: 'research.menu.fieldDetection', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'field-detection/detail/:id',
        name: 'FieldDetectionDetail',
        component: () => import('../views/research/detection/field-detection/detail.vue'),
        meta: { title: 'research.menu.fieldDetectionDetail', hideInMenu: true, requiresAuth: true }
      },

      // 实验室检测
      {
        path: 'lab-testing',
        name: 'LabTesting',
        component: () => import('../views/research/detection/lab-testing/index.vue'),
        meta: { title: 'research.menu.labTesting', requiresAuth: true, hideInMenu: true }
      },
      {
        path: 'lab-testing/add',
        name: 'LabTestingAdd',
        component: () => import('../views/research/detection/lab-testing/add.vue'),
        meta: { title: 'research.menu.labTesting', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'lab-testing/detail/:id',
        name: 'LabTestingDetail',
        component: () => import('../views/research/detection/lab-testing/detail.vue'),
        meta: { title: 'research.menu.labTestingDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 组织管理 ====================
      {
        path: 'organization',
        name: 'OrganizationList',
        component: () => import('../views/research/organization/index.vue'),
        meta: { title: 'research.organization.title', requiresAuth: true }
      },
      {
        path: 'organization/add',
        name: 'OrganizationAdd',
        component: () => import('../views/research/organization/form.vue'),
        meta: { title: 'research.organization.add', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'organization/edit/:id',
        name: 'OrganizationEdit',
        component: () => import('../views/research/organization/form.vue'),
        meta: { title: 'research.organization.edit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'organization/detail/:id',
        name: 'OrganizationDetail',
        component: () => import('../views/research/organization/detail.vue'),
        meta: { title: 'research.organization.detail', hideInMenu: true, requiresAuth: true }
      },

      // 种子认证审核
      {
        path: 'seed/breeding-audit',
        name: 'BreedingAudit',
        component: () => import('../views/seed/breeding-audit/index.vue'),
        meta: { title: 'research.menu.seedCertificationAudit', requiresAuth: true }
      },

      // 种子认证颁发
      {
        path: 'seed/breeding-certificate',
        name: 'BreedingCertificate',
        component: () => import('../views/seed/breeding-certificate/index.vue'),
        meta: { title: 'research.menu.seedCertificationIssuance', requiresAuth: true }
      },

      // C1繁殖批次审核
      {
        path: 'c1-breeding-batch-audit',
        name: 'C1BreedingBatchAudit',
        component: () => import('../views/seed/c1-breeding-batch-audit/index.vue'),
        meta: { title: 'research.menu.c1BatchAudit', requiresAuth: true }
      },

      // C1繁殖批次证书颁发
      {
        path: 'c1-breeding-certificate',
        name: 'C1BreedingCertificate',
        component: () => import('../views/seed/c1-breeding-certificate/index.vue'),
        meta: { title: 'research.menu.c1BatchCertificate', requiresAuth: true }
      },

      // ==================== Multiplier Report ====================
      {
        path: 'multiplier-report',
        name: 'MultiplierReportList',
        component: () => import('../views/research/multiplier-report/index.vue'),
        meta: { title: 'research.menu.multiplierReport', requiresAuth: true }
      },
      {
        path: 'multiplier-report/add',
        name: 'MultiplierReportAdd',
        component: () => import('../views/research/multiplier-report/form.vue'),
        meta: { title: 'research.menu.multiplierReportAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'multiplier-report/edit/:id',
        name: 'MultiplierReportEdit',
        component: () => import('../views/research/multiplier-report/form.vue'),
        meta: { title: 'research.menu.multiplierReportEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'multiplier-report/detail/:id',
        name: 'MultiplierReportDetail',
        component: () => import('../views/research/multiplier-report/detail.vue'),
        meta: { title: 'research.menu.multiplierReportDetail', hideInMenu: true, requiresAuth: true }
      },

      // 繁殖机构注册
      {
        path: 'institution/registration',
        name: 'InstitutionRegistration',
        component: () => import('../views/research/institution/registration/index.vue'),
        meta: { title: 'research.menu.propagationOrgRegistration', requiresAuth: true }
      },
      {
        path: 'institution/registration/add',
        name: 'RegistrationAdd',
        component: () => import('../views/research/institution/registration/form.vue'),
        meta: { title: 'research.menu.propagationOrgRegistrationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'institution/registration/edit/:id',
        name: 'RegistrationEdit',
        component: () => import('../views/research/institution/registration/form.vue'),
        meta: { title: 'research.menu.propagationOrgRegistrationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'institution/registration/detail/:id',
        name: 'RegistrationDetail',
        component: () => import('../views/research/institution/registration/detail.vue'),
        meta: { title: 'research.menu.propagationOrgRegistrationDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'institution/approval/audit/:id',
        name: 'RegistrationAudit',
        component: () => import('../views/research/institution/registration/audit.vue'),
        meta: { title: 'research.menu.propagationOrgRegistration', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'institution/approval',
        name: 'InstitutionApproval',
        component: () => import('../views/research/institution/registration/approval.vue'),
        meta: { title: 'research.menu.propagationOrgRegistration', requiresAuth: true }
      },
      {
        path: 'union/registration',
        name: 'UnionRegistration',
        component: () => import('../views/research/institution/union/UnionRegistration.vue'),
        meta: { title: 'research.menu.institutionRegistration', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/ose-management',
        name: 'OseManagement',
        component: () => import('../views/research/institution/ose-management/index.vue'),
        meta: { title: 'research.menu.oseManagement', requiresAuth: true }
      },
      {
        path: 'breeding/ose-management/add',
        name: 'OseAdd',
        component: () => import('../views/research/institution/ose-management/form.vue'),
        meta: { title: 'research.menu.oseManagementAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/ose-management/edit/:id',
        name: 'OseEdit',
        component: () => import('../views/research/institution/ose-management/form.vue'),
        meta: { title: 'research.menu.oseManagementEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'breeding/ose-management/detail/:id',
        name: 'OseDetail',
        component: () => import('../views/research/institution/ose-management/detail.vue'),
        meta: { title: 'research.menu.oseManagementDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 研究中心管理 ====================
      {
        path: 'institution/research-center',
        name: 'ResearchCenter',
        component: () => import('../views/research/institution/research-center/index.vue'),
        meta: { title: 'research.menu.researchCenterManagement', requiresAuth: true }
      },
      {
        path: 'institution/research-center/add',
        name: 'ResearchCenterAdd',
        component: () => import('../views/research/institution/research-center/form.vue'),
        meta: { title: 'research.menu.researchCenterAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'institution/research-center/edit/:locationId',
        name: 'ResearchCenterEdit',
        component: () => import('../views/research/institution/research-center/form.vue'),
        meta: { title: 'research.menu.researchCenterEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'institution/research-center/detail/:locationId',
        name: 'ResearchCenterDetail',
        component: () => import('../views/research/institution/research-center/detail.vue'),
        meta: { title: 'research.menu.researchCenterDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 种子信息服务 ====================

      // 种子推广信息管理
      {
        path: 'seed/promotion',
        name: 'SeedPromotion',
        component: () => import('../views/research/seed/SeedPromotion.vue'),
        meta: { title: 'research.menu.seedPromotionManagement', requiresAuth: true }
      },
      // 种子推广详情
      {
        path: 'seed/promotion/detail/:promotionId',
        name: 'SeedPromotionDetail',
        component: () => import('../views/research/seed/SeedPromotionDetail.vue'),
        meta: { title: 'research.menu.seedPromotionManagementDetail', hideInMenu: true, requiresAuth: true }
      },
      // 种子推广新增
      {
        path: 'seed/promotion/form',
        name: 'SeedPromotionForm',
        component: () => import('../views/research/seed/SeedPromotionForm.vue'),
        meta: { title: 'research.menu.seedPromotionManagementAdd', hideInMenu: true, requiresAuth: true }
      },
      // 种子信息公示
      {
        path: 'seed/info',
        name: 'SeedInfo',
        component: () => import('../views/research/variety/VarietyQuery.vue'),
        meta: { title: 'research.menu.seedInfoPublicity', requiresAuth: true }
      },
      // 品种详情页
      {
        path: 'variety/detail/:publishId',
        name: 'VarietyDetailPage',
        component: () => import('../views/research/variety/VarietyDetail.vue'),
        meta: { title: 'research.menu.seedInfoPublicityDetail', hideInMenu: true, requiresAuth: true }
      }
    ]
  },
  // 农业投入品供应管理系统
  {
    path: '/input',
    name: 'InputSystem',
    component: () => import('../layout/SystemLayout.vue'),
    meta: { requiresAuth: true, layoutConfig: inputLayoutConfig },
    children: [
      // 注册管理
      {
        path: 'registration',
        name: 'OrgRegistration',
        component: () => import('../views/input/registration/index.vue'),
        meta: { title: 'input.menu.registration', requiresAuth: true }
      },
      {
        path: 'registration/add',
        name: 'OrgRegistrationAdd',
        component: () => import('../views/input/registration/form.vue'),
        meta: { title: 'input.menu.registrationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'registration/edit/:id',
        name: 'OrgRegistrationEdit',
        component: () => import('../views/input/registration/form.vue'),
        meta: { title: 'input.menu.registrationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'registration/detail/:id',
        name: 'OrgRegistrationDetail',
        component: () => import('../views/input/registration/form.vue'),
        meta: { title: 'input.menu.registrationDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'registration/audit/:id',
        name: 'OrgRegistrationAudit',
        component: () => import('../views/input/registration/audit.vue'),
        meta: { title: 'input.menu.registrationAudit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'registration/approval',
        name: 'OrgRegistrationApproval',
        component: () => import('../views/input/registration/approval-list.vue'),
        meta: { title: 'input.menu.registrationApproval', requiresAuth: true }
      },
      // DA农民需求录入
      {
        path: 'demand/farmer',
        name: 'FarmerDemand',
        component: () => import('../views/input/demand/farmer/index.vue'),
        meta: { title: 'input.menu.farmerDemand', requiresAuth: true }
      },
      {
        path: 'demand/farmer/add',
        name: 'FarmerDemandAdd',
        component: () => import('../views/input/demand/farmer/form.vue'),
        meta: { title: 'input.menu.farmerDemandAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'demand/farmer/add-by-farmers',
        name: 'FarmerDemandAddByFarmers',
        component: () => import('../views/input/demand/farmer/form.vue'),
        meta: { title: 'input.menu.farmerDemandAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'demand/farmer/edit/:id',
        name: 'FarmerDemandEdit',
        component: () => import('../views/input/demand/farmer/form.vue'),
        meta: { title: 'input.menu.farmerDemandEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'demand/farmer/detail/:id',
        name: 'FarmerDemandDetail',
        component: () => import('../views/input/demand/farmer/detail.vue'),
        meta: { title: 'input.menu.farmerDemandDetail', hideInMenu: true, requiresAuth: true }
      },
      // 村级需求汇聚（新页面）
      {
        path: 'demand/aggregation',
        name: 'VillageAggregation',
        component: () => import('../views/input/demand/aggregation/index.vue'),
        meta: { title: 'input.menu.villageAggregation', requiresAuth: true }
      },
      // 村级审核详情（原投入品需求审核页面，现作为详情页隐藏）
      {
        path: 'demand/audit/:year',
        name: 'VillageAuditDetail',
        component: () => import('../views/input/demand/audit/index.vue'),
        meta: { title: 'input.menu.villageAggregation', hideInMenu: true, requiresAuth: true }
      },
      // 镇级需求汇聚（新页面）
      {
        path: 'demand/aggregation-town',
        name: 'TownAggregation',
        component: () => import('../views/input/demand/aggregation-town/index.vue'),
        meta: { title: 'input.menu.townAggregation', requiresAuth: true }
      },
      // 镇级审核详情（隐藏页面，通过年度参数访问）
      {
        path: 'demand/audit-town/:year',
        name: 'TownAuditDetail',
        component: () => import('../views/input/demand/audit-town/index.vue'),
        meta: { title: 'input.menu.townAggregation', hideInMenu: true, requiresAuth: true }
      },
      // 区级需求汇聚（新页面）
      {
        path: 'demand/aggregation-district',
        name: 'DistrictAggregation',
        component: () => import('../views/input/demand/aggregation-district/index.vue'),
        meta: { title: 'input.menu.districtAggregation', requiresAuth: true }
      },
      // 区级审核详情（隐藏页面，通过年度参数访问）
      {
        path: 'demand/audit-district/:year',
        name: 'DistrictAuditDetail',
        component: () => import('../views/input/demand/audit-district/index.vue'),
        meta: { title: 'input.menu.districtAggregation', hideInMenu: true, requiresAuth: true }
      },
      // 州级需求汇聚（新页面）
      {
        path: 'demand/aggregation-state',
        name: 'StateAggregation',
        component: () => import('../views/input/demand/aggregation-state/index.vue'),
        meta: { title: 'input.menu.stateAggregation', requiresAuth: true }
      },
      // 需求查询
      {
        path: 'demand/demand-inquiry',
        name: 'DemandInquiry',
        component: () => import('../views/input/demand/demand-inquiry/index.vue'),
        meta: { title: 'input.menu.demandInquiry', requiresAuth: true }
      },
      // 州农业部查看
      {
        path: 'demand/audit-state',
        name: 'StateDemandAuditView',
        component: () => import('../views/input/demand/audit-state/index.vue'),
        meta: { title: 'input.menu.stateAggregation', requiresAuth: true }
      },
      {
        path: 'demand/audit/detail/:id',
        name: 'DemandAuditDetail',
        component: () => import('../views/input/demand/audit/detail.vue'),
        meta: { title: 'input.menu.demandAudit', hideInMenu: true, requiresAuth: true }
      },
      // 投入品目录管理
      {
        path: 'catalog',
        name: 'InputCatalog',
        component: () => import('../views/input/catalog/index.vue'),
        meta: { title: 'input.menu.inputCatalog', requiresAuth: true }
      },
      {
        path: 'catalog/add',
        name: 'InputCatalogAdd',
        component: () => import('../views/input/catalog/form.vue'),
        meta: { title: 'input.menu.inputCatalogAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'catalog/edit/:id',
        name: 'InputCatalogEdit',
        component: () => import('../views/input/catalog/form.vue'),
        meta: { title: 'input.menu.inputCatalogEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'catalog/detail/:id',
        name: 'InputCatalogDetail',
        component: () => import('../views/input/catalog/detail.vue'),
        meta: { title: 'input.menu.inputCatalogDetail', hideInMenu: true, requiresAuth: true }
      },
      // 供应商投入品信息管理
      {
        path: 'supplier-input',
        name: 'SupplierInput',
        component: () => import('../views/input/supplier-input/index.vue'),
        meta: { title: 'input.menu.supplierInput', requiresAuth: true }
      },
      // 供应商管理
      {
        path: 'supplier/auth',
        name: 'SupplierAuth',
        component: () => import('../views/input/supplier/auth.vue'),
        meta: { title: 'input.menu.supplierAuth', requiresAuth: true }
      },
      {
        path: 'supplier/approval',
        name: 'SupplierApproval',
        component: () => import('../views/input/supplier/approval.vue'),
        meta: { title: 'input.menu.supplierAuthApproval', requiresAuth: true }
      },
      {
        path: 'supplier/info',
        name: 'SupplierInfo',
        component: () => import('../views/input/supplier/info.vue'),
        meta: { title: 'input.menu.supplierInfo', requiresAuth: true }
      },
      {
        path: 'supplier/product',
        name: 'SupplierProduct',
        component: () => import('../views/input/supplier/product/index.vue'),
        meta: { title: 'input.menu.supplierProduct', requiresAuth: true }
      },
      {
        path: 'supplier/product/add',
        name: 'SupplierProductAdd',
        component: () => import('../views/input/supplier/product/form.vue'),
        meta: { title: 'input.menu.supplierProductAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'supplier/product/edit/:id',
        name: 'SupplierProductEdit',
        component: () => import('../views/input/supplier/product/form.vue'),
        meta: { title: 'input.menu.supplierProductEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'supplier/product/detail/:id',
        name: 'SupplierProductDetail',
        component: () => import('../views/input/supplier/product/detail.vue'),
        meta: { title: 'input.menu.supplierProductDetail', hideInMenu: true, requiresAuth: true }
      },
      // 库存管理 - 仓库管理
      {
        path: 'inventory/warehouse',
        name: 'WarehouseList',
        component: () => import('../views/input/inventory/warehouse/index.vue'),
        meta: { title: 'input.menu.warehouse', requiresAuth: true }
      },
      {
        path: 'inventory/warehouse/add',
        name: 'WarehouseAdd',
        component: () => import('../views/input/inventory/warehouse/form.vue'),
        meta: { title: 'input.menu.warehouseAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inventory/warehouse/edit/:id',
        name: 'WarehouseEdit',
        component: () => import('../views/input/inventory/warehouse/form.vue'),
        meta: { title: 'input.menu.warehouseEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inventory/warehouse/detail/:id',
        name: 'WarehouseDetail',
        component: () => import('../views/input/inventory/warehouse/detail.vue'),
        meta: { title: 'input.menu.warehouseDetail', hideInMenu: true, requiresAuth: true }
      },
      // 库存管理 - 入库管理
      {
        path: 'inventory/stock-in',
        name: 'StockInList',
        component: () => import('../views/input/inventory/stock-in/index.vue'),
        meta: { title: 'input.menu.stockIn', requiresAuth: true }
      },
      {
        path: 'inventory/stock-in/form',
        name: 'StockInAdd',
        component: () => import('../views/input/inventory/stock-in/form.vue'),
        meta: { title: 'input.menu.stockInAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inventory/stock-in/edit/:id',
        name: 'StockInEdit',
        component: () => import('../views/input/inventory/stock-in/form.vue'),
        meta: { title: 'input.menu.stockInEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inventory/stock-in/detail/:id',
        name: 'StockInDetail',
        component: () => import('../views/input/inventory/stock-in/detail.vue'),
        meta: { title: 'input.menu.stockInDetail', hideInMenu: true, requiresAuth: true }
      },
      // 库存管理 - 出库管理
      {
        path: 'inventory/stock-out',
        name: 'StockOutList',
        component: () => import('../views/input/inventory/stock-out/index.vue'),
        meta: { title: 'input.menu.stockOut', requiresAuth: true }
      },
      {
        path: 'inventory/stock-out/add',
        name: 'StockOutAdd',
        component: () => import('../views/input/inventory/stock-out/form.vue'),
        meta: { title: 'input.menu.stockOutAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inventory/stock-out/detail/:id',
        name: 'StockOutDetail',
        component: () => import('../views/input/inventory/stock-out/detail.vue'),
        meta: { title: 'input.menu.stockOutDetail', hideInMenu: true, requiresAuth: true }
      },
      // 库存管理 - 库存查询
      {
        path: 'inventory/stock',
        name: 'StockList',
        component: () => import('../views/input/inventory/stock/index.vue'),
        meta: { title: 'input.menu.stockQuery', requiresAuth: true }
      },
      {
        path: 'inventory/stock/detail/:id',
        name: 'StockDetail',
        component: () => import('../views/input/inventory/stock/detail.vue'),
        meta: { title: 'input.menu.stockQueryDetail', hideInMenu: true, requiresAuth: true }
      },
      // 大屏和反馈
      {
        path: 'dashboard',
        name: 'InputDashboard',
        component: () => import('../views/input/dashboard/index.vue'),
        meta: { title: 'input.menu.dashboard', requiresAuth: true }
      },
      {
        path: 'feedback',
        name: 'InputFeedback',
        component: () => import('../views/input/feedback/index.vue'),
        meta: { title: 'input.menu.feedback', requiresAuth: true }
      },
      {
        path: 'feedback/add',
        name: 'InputFeedbackAdd',
        component: () => import('../views/input/feedback/form.vue'),
        meta: { title: 'input.menu.feedbackAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'feedback/edit/:id',
        name: 'InputFeedbackEdit',
        component: () => import('../views/input/feedback/form.vue'),
        meta: { title: 'input.menu.feedbackEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'feedback/detail/:id',
        name: 'InputFeedbackDetail',
        component: () => import('../views/input/feedback/detail.vue'),
        meta: { title: 'input.menu.feedbackDetail', hideInMenu: true, requiresAuth: true }
      },
      // 州级年度配额管理
      {
        path: 'allocate/state-quota',
        name: 'StateAnnualQuota',
        component: () => import('../views/input/allocate/state-quota/index.vue'),
        meta: { title: 'input.menu.stateAnnualQuota', requiresAuth: true }
      },
      {
        path: 'allocate/state-quota/add',
        name: 'StateAnnualQuotaAdd',
        component: () => import('../views/input/allocate/state-quota/form.vue'),
        meta: { title: 'input.menu.stateAnnualQuotaAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocate/state-quota/edit/:quotaId',
        name: 'StateAnnualQuotaEdit',
        component: () => import('../views/input/allocate/state-quota/form.vue'),
        meta: { title: 'input.menu.stateAnnualQuotaEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocate/state-quota/detail/:quotaId',
        name: 'StateAnnualQuotaDetail',
        component: () => import('../views/input/allocate/state-quota/detail.vue'),
        meta: { title: 'input.menu.stateAnnualQuotaDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocate/state-quota/allocate/:quotaId',
        name: 'StateAnnualQuotaAllocate',
        component: () => import('../views/input/allocate/state-quota/allocate.vue'),
        meta: { title: 'input.menu.stateAnnualQuotaAllocate', hideInMenu: true, requiresAuth: true }
      },
      // 配额逐级分配管理
      {
        path: 'allocate/quota-allocation',
        name: 'QuotaAllocation',
        component: () => import('../views/input/allocate/quota-allocation/index.vue'),
        meta: { title: 'input.menu.quotaAllocation', requiresAuth: true }
      },
      {
        path: 'allocate/quota-allocation/add',
        name: 'QuotaAllocationAdd',
        component: () => import('../views/input/allocate/quota-allocation/form.vue'),
        meta: { title: 'input.menu.quotaAllocationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocate/quota-allocation/edit/:allocationId',
        name: 'QuotaAllocationEdit',
        component: () => import('../views/input/allocate/quota-allocation/form.vue'),
        meta: { title: 'input.menu.quotaAllocationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocate/quota-allocation/detail/:allocationId',
        name: 'QuotaAllocationDetail',
        component: () => import('../views/input/allocate/quota-allocation/detail.vue'),
        meta: { title: 'input.menu.quotaAllocationDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 投入品流通管理 ====================

      // 投入品配额查看
      {
        path: 'input-circulation/quota',
        name: 'InputQuotaList',
        component: () => import('../views/research/input-circulation/quota/index.vue'),
        meta: { title: 'research.menu.inputQuotaView', requiresAuth: true }
      },
      {
        path: 'input-circulation/quota/detail/:id',
        name: 'InputQuotaDetail',
        component: () => import('../views/research/input-circulation/quota/detail.vue'),
        meta: { title: 'research.menu.inputQuotaDetail', hideInMenu: true, requiresAuth: true }
      },

      // zone分配额度
      {
        path: 'allocation/zone',
        name: 'ZoneAllocationList',
        component: () => import('../views/input/allocation/zone/index.vue'),
        meta: { title: 'input.menu.zoneAllocation', requiresAuth: true }
      },
      {
        path: 'allocation/zone/add',
        name: 'ZoneAllocationAdd',
        component: () => import('../views/input/allocation/zone/form.vue'),
        meta: { title: 'input.menu.zoneAllocationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/zone/edit/:id',
        name: 'ZoneAllocationEdit',
        component: () => import('../views/input/allocation/zone/form.vue'),
        meta: { title: 'input.menu.zoneAllocationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/zone/detail/:id',
        name: 'ZoneAllocationDetail',
        component: () => import('../views/input/allocation/zone/detail.vue'),
        meta: { title: 'input.menu.zoneAllocationDetail', hideInMenu: true, requiresAuth: true }
      },

      // woreda分配额度
      {
        path: 'allocation/woreda',
        name: 'WoredaAllocationList',
        component: () => import('../views/input/allocation/woreda/index.vue'),
        meta: { title: 'input.menu.woredaAllocation', requiresAuth: true }
      },
      {
        path: 'allocation/woreda/add',
        name: 'WoredaAllocationAdd',
        component: () => import('../views/input/allocation/woreda/form.vue'),
        meta: { title: 'input.menu.woredaAllocationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/woreda/edit/:id',
        name: 'WoredaAllocationEdit',
        component: () => import('../views/input/allocation/woreda/form.vue'),
        meta: { title: 'input.menu.woredaAllocationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/woreda/detail/:id',
        name: 'WoredaAllocationDetail',
        component: () => import('../views/input/allocation/woreda/detail.vue'),
        meta: { title: 'input.menu.woredaAllocationDetail', hideInMenu: true, requiresAuth: true }
      },

      // kebele分配额度
      {
        path: 'allocation/kebele',
        name: 'KebeleAllocationList',
        component: () => import('../views/input/allocation/kebele/index.vue'),
        meta: { title: 'input.menu.kebeleAllocation', requiresAuth: true }
      },
      {
        path: 'allocation/kebele/add',
        name: 'KebeleAllocationAdd',
        component: () => import('../views/input/allocation/kebele/form.vue'),
        meta: { title: 'input.menu.kebeleAllocationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/kebele/edit/:id',
        name: 'KebeleAllocationEdit',
        component: () => import('../views/input/allocation/kebele/form.vue'),
        meta: { title: 'input.menu.kebeleAllocationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/kebele/detail/:id',
        name: 'KebeleAllocationDetail',
        component: () => import('../views/input/allocation/kebele/detail.vue'),
        meta: { title: 'input.menu.kebeleAllocationDetail', hideInMenu: true, requiresAuth: true }
      },

      // 农民分配管理
      {
        path: 'allocation/farmer',
        name: 'FarmerAllocation',
        component: () => import('../views/input/allocation/farmer/index.vue'),
        meta: { title: 'input.menu.farmerAllocation', requiresAuth: true }
      },
      {
        path: 'allocation/farmer/add',
        name: 'FarmerAllocationAdd',
        component: () => import('../views/input/allocation/farmer/form.vue'),
        meta: { title: 'input.menu.farmerAllocationAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/farmer/edit/:id',
        name: 'FarmerAllocationEdit',
        component: () => import('../views/input/allocation/farmer/form.vue'),
        meta: { title: 'input.menu.farmerAllocationEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'allocation/farmer/detail/:id',
        name: 'FarmerAllocationDetail',
        component: () => import('../views/input/allocation/farmer/detail.vue'),
        meta: { title: 'input.menu.farmerAllocationDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/boa-zone',
        name: 'BoaZoneReleaseList',
        component: () => import('../views/research/input-circulation/boa-zone/index.vue'),
        meta: { title: 'research.menu.boaToZone', requiresAuth: true }
      },
      {
        path: 'input-circulation/boa-zone/add',
        name: 'BoaZoneReleaseAdd',
        component: () => import('../views/research/input-circulation/boa-zone/form.vue'),
        meta: { title: 'research.menu.boaToZoneAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/boa-zone/edit/:id',
        name: 'BoaZoneReleaseEdit',
        component: () => import('../views/research/input-circulation/boa-zone/form.vue'),
        meta: { title: 'research.menu.boaToZoneEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/boa-zone/detail/:id',
        name: 'BoaZoneReleaseDetail',
        component: () => import('../views/research/input-circulation/boa-zone/detail.vue'),
        meta: { title: 'research.menu.boaToZoneDetail', hideInMenu: true, requiresAuth: true }
      },
      ////////
      // zone to woreda 新增页面
      {
        path:'input-circulation/zone-woreda',
        name: 'ZoneWoredaReleaseDetail',
        component: () => import('../views/research/input-circulation/zone-woreda/index.vue'),
        meta: {title: 'research.menu.zoneToworeda', hideInMenu: true, requiresAuth: true}
      },
      {
        path: 'input-circulation/zone-woreda/add',
        name: 'ZoneWoredaReleaseAdd',
        component: () => import('../views/research/input-circulation/ose-release/form.vue'),
        meta: { title: 'research.menu.zoneToworedaAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/zone-woreda/edit/:id',
        name: 'ZoneWoredaReleaseEdit',
        component: () => import('../views/research/input-circulation/ose-release/form.vue'),
        meta: { title: 'research.menu.zoneToworedaEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/zone-woreda/detail/:id',
        name: 'ZoneWoredaReleaseView',
        component: () => import('../views/research/input-circulation/ose-release/detail.vue'),
        meta: { title: 'research.menu.zoneToworedaDetail', hideInMenu: true, requiresAuth: true }
      },
      // woreda 接收
      {
        path: 'input-circulation/woreda-new-receive',
        name: 'WoredaReceive',
        component: () => import('../views/research/input-circulation/woreda-new-receive/index.vue'),
        meta: {title: 'research.menu.woredaReceive', hideInMenu: true, requiresAuth: true}
      },
      //woreda to kebele 新增页面
      {
         path:'input-circulation/woreda-kebele',
         name: 'WoredaKebeleReleaseDetail',
         component: () => import('../views/research/input-circulation/woreda-kebele/index.vue'),
         meta: {title: 'research.menu.woredaTokebele', requiresAuth: true}
      },
      {
        path: 'input-circulation/woreda-kebele/add',
        name: 'WoredaKebeleAdd',
        component: () => import('../views/research/input-circulation/woreda-kebele/form.vue'),
        meta: { title: 'research.menu.woredaTokebeleAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/woreda-kebele/edit/:id',
        name: 'WoredaKebeleEdit',
        component: () => import('../views/research/input-circulation/woreda-kebele/form.vue'),
        meta: { title: 'research.menu.woredaTokebeleEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/woreda-kebele/detail/:id',
        name: 'WoredaKebeleDetail',
        component: () => import('../views/research/input-circulation/woreda-kebele/detail.vue'),
        meta: { title: 'research.menu.woredaTokebeleDetail', hideInMenu: true, requiresAuth: true }
      },
      // kebele 接收
      {
        path: 'input-circulation/kebele-receive',
        name: 'KebeleReceive',
        component: () => import('../views/research/input-circulation/kebele-receive/index.vue'),
        meta: {title: 'research.menu.kebeleReceive', hideInMenu: true, requiresAuth: true}
      },
      // kebele to farmer
      {
        path: 'input-circulation/kebele-farmer',
        name: 'KebeleFarmerReleaseDetail',
        component: () => import('../views/research/input-circulation/kebele-farmer/index.vue'),
        meta: { title: 'research.menu.kebeleTofarmer'}
      },
      {
        path: 'input-circulation/kebele-farmer/add',
        name: 'KebeleFarmerReleaseAdd',
        component: () => import('../views/research/input-circulation/kebele-farmer/form.vue'),
        meta: { title: 'research.menu.farmerReleaseAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/kebele-farmer/edit/:id',
        name: 'KebeleFarmerReleaseEdit',
        component: () => import('../views/research/input-circulation/kebele-farmer/form.vue'),
        meta: { title: 'research.menu.farmerReleaseEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/kebele-farmer/detail/:id',
        name: 'KebeleFarmerReleaseView',
        component: () => import('../views/research/input-circulation/kebele-farmer/detail.vue'),
        meta: { title: 'research.menu.farmerReleaseDetail', hideInMenu: true, requiresAuth: true }
      },
      /////////
      // OSE分发种子到Union
      {
        path: 'input-circulation/ose-release',
        name: 'OseReleaseList',
        component: () => import('../views/research/input-circulation/ose-release/index.vue'),
        meta: { title: 'research.menu.oseReleaseToUnion', requiresAuth: true }
      },
      {
        path: 'input-circulation/ose-release/add',
        name: 'OseReleaseAdd',
        component: () => import('../views/research/input-circulation/ose-release/form.vue'),
        meta: { title: 'research.menu.oseReleaseToUnionAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/ose-release/edit/:id',
        name: 'OseReleaseEdit',
        component: () => import('../views/research/input-circulation/ose-release/form.vue'),
        meta: { title: 'research.menu.oseReleaseToUnionEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/ose-release/detail/:id',
        name: 'OseReleaseDetail',
        component: () => import('../views/research/input-circulation/ose-release/detail.vue'),
        meta: { title: 'research.menu.oseReleaseToUnionDetail', hideInMenu: true, requiresAuth: true }
      },

      // Union确认接收OSE分发
      {
        path: 'input-circulation/union-receive',
        name: 'UnionReceiveList',
        component: () => import('../views/research/input-circulation/union-receive/index.vue'),
        meta: { title: 'research.menu.unionReceiveConfirm', requiresAuth: true }
      },
      {
        path: 'input-circulation/union-receive/confirm/:id',
        name: 'UnionReceiveConfirm',
        component: () => import('../views/research/input-circulation/union-receive/confirm.vue'),
        meta: { title: 'research.menu.unionReceiveConfirm', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/union-receive/detail/:id',
        name: 'UnionReceiveDetail',
        component: () => import('../views/research/input-circulation/union-receive/detail.vue'),
        meta: { title: 'research.menu.unionReceiveDetail', hideInMenu: true, requiresAuth: true }
      },

      // Union分发投入品到Woreda
      {
        path: 'input-circulation/union-release',
        name: 'UnionReleaseList',
        component: () => import('../views/research/input-circulation/union-release/index.vue'),
        meta: { title: 'inputCirculation.unionReleaseToCooperative', requiresAuth: true }
      },
      {
        path: 'input-circulation/union-release/add',
        name: 'UnionReleaseAdd',
        component: () => import('../views/research/input-circulation/union-release/form.vue'),
        meta: { title: 'research.menu.oseReleaseToUnionAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/union-release/edit/:id',
        name: 'UnionReleaseEdit',
        component: () => import('../views/research/input-circulation/union-release/form.vue'),
        meta: { title: 'research.menu.oseReleaseToUnionEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/union-release/detail/:id',
        name: 'UnionReleaseDetail',
        component: () => import('../views/research/input-circulation/union-release/detail.vue'),
        meta: { title: 'research.menu.oseReleaseToUnionDetail', hideInMenu: true, requiresAuth: true }
      },

      // Woreda确认接收Union分发
      {
        path: 'input-circulation/woreda-receive',
        name: 'WoredaReceiveList',
        component: () => import('../views/research/input-circulation/woreda-receive/index.vue'),
        meta: { title: 'inputCirculation.woredaReceiveConfirm', requiresAuth: true }
      },
      {
        path: 'input-circulation/woreda-receive/confirm/:id',
        name: 'WoredaReceiveConfirm',
        component: () => import('../views/research/input-circulation/woreda-receive/confirm.vue'),
        meta: { title: 'research.menu.unionReceiveConfirm', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/woreda-receive/detail/:id',
        name: 'WoredaReceiveDetail',
        component: () => import('../views/research/input-circulation/woreda-receive/detail.vue'),
        meta: { title: 'research.menu.unionReceiveDetail', hideInMenu: true, requiresAuth: true }
      },

      // Woreda分发投入品到农民
      {
        path: 'input-circulation/farmer-release',
        name: 'FarmerReleaseList',
        component: () => import('../views/research/input-circulation/farmer-release/index.vue'),
        meta: { title: 'inputCirculation.cooperativeReleaseToFarmer', requiresAuth: true }
      },
      {
        path: 'input-circulation/farmer-release/add',
        name: 'FarmerReleaseAdd',
        component: () => import('../views/research/input-circulation/farmer-release/form.vue'),
        meta: { title: 'research.menu.farmerReleaseAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/farmer-release/edit/:id',
        name: 'FarmerReleaseEdit',
        component: () => import('../views/research/input-circulation/farmer-release/form.vue'),
        meta: { title: 'research.menu.farmerReleaseEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'input-circulation/farmer-release/detail/:id',
        name: 'FarmerReleaseDetail',
        component: () => import('../views/research/input-circulation/farmer-release/detail.vue'),
        meta: { title: 'research.menu.farmerReleaseDetail', hideInMenu: true, requiresAuth: true }
      },

      // 农民领用确认
      {
        path: 'input-circulation/farmer-receive',
        name: 'FarmerReceiveList',
        component: () => import('../views/research/input-circulation/farmer-receive/index.vue'),
        meta: { title: 'inputCirculation.farmerReceive', requiresAuth: true }
      },
      {
        path: 'input-circulation/farmer-receive/detail/:id',
        name: 'FarmerReceiveDetail',
        component: () => import('../views/research/input-circulation/farmer-receive/detail.vue'),
        meta: { title: 'research.menu.farmerReceiveDetail', hideInMenu: true, requiresAuth: true }
      },

      // 农田管理系统
      // ==================== DA管理 ====================
      {
        path: 'da',
        name: 'InputDaList',
        component: () => import('../views/new-farm/da/index.vue'),
        meta: { title: 'newFarm.menu.da', requiresAuth: true }
      },
      {
        path: 'da/add',
        name: 'InputDaAdd',
        component: () => import('../views/new-farm/da/form.vue'),
        meta: { title: 'newFarm.menu.daAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'da/edit/:id',
        name: 'InputDaEdit',
        component: () => import('../views/new-farm/da/form.vue'),
        meta: { title: 'newFarm.menu.daEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'da/detail/:id',
        name: 'InputDaDetail',
        component: () => import('../views/new-farm/da/detail.vue'),
        meta: { title: 'newFarm.menu.daDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 农民管理 ====================
      {
        path: 'farmer',
        name: 'InputFarmerList',
        component: () => import('../views/new-farm/farmer/index.vue'),
        meta: { title: 'newFarm.menu.farmer', requiresAuth: true }
      },
      {
        path: 'farmer/add',
        name: 'InputFarmerAdd',
        component: () => import('../views/new-farm/farmer/form.vue'),
        meta: { title: 'newFarm.menu.farmerAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'farmer/edit/:id',
        name: 'InputFarmerEdit',
        component: () => import('../views/new-farm/farmer/form.vue'),
        meta: { title: 'newFarm.menu.farmerEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'farmer/detail/:id',
        name: 'InputFarmerDetail',
        component: () => import('../views/new-farm/farmer/detail.vue'),
        meta: { title: 'newFarm.menu.farmerDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 土地管理 ====================
      {
        path: 'land',
        name: 'InputLandList',
        component: () => import('../views/new-farm/land/index.vue'),
        meta: { title: 'newFarm.menu.land', requiresAuth: true }
      },
      {
        path: 'land/add',
        name: 'InputLandAdd',
        component: () => import('../views/new-farm/land/form.vue'),
        meta: { title: 'newFarm.menu.landAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'land/edit/:id',
        name: 'InputLandEdit',
        component: () => import('../views/new-farm/land/form.vue'),
        meta: { title: 'newFarm.menu.landEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'land/detail/:id',
        name: 'InputLandDetail',
        component: () => import('../views/new-farm/land/detail.vue'),
        meta: { title: 'newFarm.menu.landDetail', hideInMenu: true, requiresAuth: true }
      }
    ]
  },
  // 农田管理系统
  {
    path: '/farm',
    name: 'FarmSystem',
    component: () => import('../layout/SystemLayout.vue'),
    redirect: '/farm/farmer/auth',
    meta: { requiresAuth: true, layoutConfig: farmLayoutConfig },
    children: [
      // 农民管理
      {
        path: 'farmer/auth',
        name: 'FarmerAuth',
        component: () => import('../views/farm/farmer/auth.vue'),
        meta: { title: 'common.farmerAuth', requiresAuth: true }
      },
      {
        path: 'farmer/approval',
        name: 'FarmerApproval',
        component: () => import('../views/farm/farmer/approval.vue'),
        meta: { title: 'farm.menu.farmerApproval', requiresAuth: true }
      },
      {
        path: 'farmer/info',
        name: 'FarmerInfo',
        component: () => import('../components/userDetails.vue'),
        meta: { title: 'farm.menu.farmerInfo', requiresAuth: true }
      },
      // 土地信息管理
      {
        path: 'land/list',
        name: 'LandList',
        component: () => import('../views/farm/land/list.vue'),
        meta: { title: 'farm.menu.land', requiresAuth: true }
      }
    ]
  },
  // 农田管理系统（新版）
  {
    path: '/new-farm',
    name: 'NewFarmSystem',
    component: () => import('../layout/SystemLayout.vue'),
    redirect: '/new-farm/da',
    meta: { requiresAuth: true, layoutConfig: newFarmLayoutConfig },
    children: [
      // ==================== DA管理 ====================
      {
        path: 'da',
        name: 'NewFarmDaList',
        component: () => import('../views/new-farm/da/index.vue'),
        meta: { title: 'newFarm.menu.da', requiresAuth: true }
      },
      {
        path: 'da/add',
        name: 'NewFarmDaAdd',
        component: () => import('../views/new-farm/da/form.vue'),
        meta: { title: 'newFarm.menu.daAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'da/edit/:id',
        name: 'NewFarmDaEdit',
        component: () => import('../views/new-farm/da/form.vue'),
        meta: { title: 'newFarm.menu.daEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'da/detail/:id',
        name: 'NewFarmDaDetail',
        component: () => import('../views/new-farm/da/detail.vue'),
        meta: { title: 'newFarm.menu.daDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 农民管理 ====================
      {
        path: 'farmer',
        name: 'NewFarmFarmerList',
        component: () => import('../views/new-farm/farmer/index.vue'),
        meta: { title: 'newFarm.menu.farmer', requiresAuth: true }
      },
      {
        path: 'farmer/add',
        name: 'NewFarmFarmerAdd',
        component: () => import('../views/new-farm/farmer/form.vue'),
        meta: { title: 'newFarm.menu.farmerAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'farmer/edit/:id',
        name: 'NewFarmFarmerEdit',
        component: () => import('../views/new-farm/farmer/form.vue'),
        meta: { title: 'newFarm.menu.farmerEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'farmer/detail/:id',
        name: 'NewFarmFarmerDetail',
        component: () => import('../views/new-farm/farmer/detail.vue'),
        meta: { title: 'newFarm.menu.farmerDetail', hideInMenu: true, requiresAuth: true }
      },

      // ==================== 土地管理 ====================
      {
        path: 'land',
        name: 'NewFarmLandList',
        component: () => import('../views/new-farm/land/index.vue'),
        meta: { title: 'newFarm.menu.land', requiresAuth: true }
      },
      {
        path: 'land/add',
        name: 'NewFarmLandAdd',
        component: () => import('../views/new-farm/land/form.vue'),
        meta: { title: 'newFarm.menu.landAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'land/edit/:id',
        name: 'NewFarmLandEdit',
        component: () => import('../views/new-farm/land/form.vue'),
        meta: { title: 'newFarm.menu.landEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'land/detail/:id',
        name: 'NewFarmLandDetail',
        component: () => import('../views/new-farm/land/detail.vue'),
        meta: { title: 'newFarm.menu.landDetail', hideInMenu: true, requiresAuth: true }
      }
    ]
  },
  // Inventory Management System
  {
    path: '/inventory',
    name: 'InventorySystem',
    component: () => import('../layout/SystemLayout.vue'),
    redirect: '/inventory/inbound',
    meta: { requiresAuth: true, layoutConfig: inventoryLayoutConfig },
    children: [
      {
        path: 'inbound',
        name: 'InventoryInbound',
        component: () => import('../views/inventory/inbound/index.vue'),
        meta: { title: 'inventory.inbound.title', requiresAuth: true }
      },
      {
        path: 'inbound/add',
        name: 'InventoryInboundAdd',
        component: () => import('../views/inventory/inbound/form.vue'),
        meta: { title: 'inventory.inbound.add', activeMenu: '/inventory/inbound', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inbound/edit/:id',
        name: 'InventoryInboundEdit',
        component: () => import('../views/inventory/inbound/form.vue'),
        meta: { title: 'inventory.inbound.edit', activeMenu: '/inventory/inbound', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'inbound/detail/:id',
        name: 'InventoryInboundDetail',
        component: () => import('../views/inventory/inbound/detail.vue'),
        meta: { title: 'inventory.inbound.details', activeMenu: '/inventory/inbound', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'outbound',
        name: 'InventoryOutbound',
        component: () => import('../views/inventory/outbound/index.vue'),
        meta: { title: 'inventory.outbound.title', requiresAuth: true }
      },
      {
        path: 'outbound/add',
        name: 'InventoryOutboundAdd',
        component: () => import('../views/inventory/outbound/form.vue'),
        meta: { title: 'inventory.outbound.add', activeMenu: '/inventory/outbound', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'outbound/edit/:id',
        name: 'InventoryOutboundEdit',
        component: () => import('../views/inventory/outbound/form.vue'),
        meta: { title: 'inventory.outbound.edit', activeMenu: '/inventory/outbound', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'outbound/detail/:id',
        name: 'InventoryOutboundDetail',
        component: () => import('../views/inventory/outbound/detail.vue'),
        meta: { title: 'inventory.outbound.details', activeMenu: '/inventory/outbound', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'warehouse-manage',
        name: 'WarehouseManageList',
        component: () => import('../views/input/inventory/warehouse-manage/index.vue'),
        meta: { title: 'input.menu.warehouseManage', requiresAuth: true }
      },
      {
        path: 'stock-check',
        name: 'StockCheckList',
        component: () => import('../views/inventory/stock-check/index.vue'),
        meta: { title: 'stockCheck.title', requiresAuth: true }
      },
      {
        path: 'stock-check/form',
        name: 'StockCheckAdd',
        component: () => import('../views/inventory/stock-check/form.vue'),
        meta: { title: 'stockCheck.addTitle', activeMenu: '/inventory/stock-check', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'stock-check/form/:id',
        name: 'StockCheckEdit',
        component: () => import('../views/inventory/stock-check/form.vue'),
        meta: { title: 'stockCheck.editTitle', activeMenu: '/inventory/stock-check', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'stock-check/detail/:id',
        name: 'StockCheckDetail',
        component: () => import('../views/inventory/stock-check/detail.vue'),
        meta: { title: 'stockCheck.detailTitle', activeMenu: '/inventory/stock-check', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'stock-check-review',
        name: 'StockCheckReviewList',
        component: () => import('../views/inventory/stock-check-review/index.vue'),
        meta: { title: 'stockCheckReview.title', requiresAuth: true }
      },
      {
        path: 'stock-check-review/review/:id',
        name: 'StockCheckReview',
        component: () => import('../views/inventory/stock-check-review/review.vue'),
        meta: { title: 'stockCheckReview.reviewTitle', activeMenu: '/inventory/stock-check-review', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'warehouse-manage/add',
        name: 'WarehouseManageAdd',
        component: () => import('../views/input/inventory/warehouse-manage/form.vue'),
        meta: { title: 'input.menu.warehouseManageAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'warehouse-manage/edit/:id',
        name: 'WarehouseManageEdit',
        component: () => import('../views/input/inventory/warehouse-manage/form.vue'),
        meta: { title: 'input.menu.warehouseManageEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'warehouse-manage/detail/:id',
        name: 'WarehouseManageDetail',
        component: () => import('../views/input/inventory/warehouse-manage/detail.vue'),
        meta: { title: 'input.menu.warehouseManageDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'product-manage',
        name: 'ProductManageList',
        component: () => import('../views/input/inventory/product-manage/index.vue'),
        meta: { title: 'input.menu.productManage', requiresAuth: true }
      },
      {
        path: 'product-manage/add',
        name: 'ProductManageAdd',
        component: () => import('../views/input/inventory/product-manage/form.vue'),
        meta: { title: 'input.menu.productManageAdd', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'product-manage/edit/:id',
        name: 'ProductManageEdit',
        component: () => import('../views/input/inventory/product-manage/form.vue'),
        meta: { title: 'input.menu.productManageEdit', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'product-manage/detail/:id',
        name: 'ProductManageDetail',
        component: () => import('../views/input/inventory/product-manage/detail.vue'),
        meta: { title: 'input.menu.productManageDetail', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'stock-query',
        name: 'StockQueryList',
        component: () => import('../views/inventory/stock-query/index.vue'),
        meta: { title: 'input.menu.stockQuery', requiresAuth: true }
      },
      {
        path: 'stock-query/detail/:id',
        name: 'StockQueryDetail',
        component: () => import('../views/inventory/stock-query/detail.vue'),
        meta: { title: 'input.menu.stockQueryDetail', activeMenu: '/inventory/stock-query', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'transfer',
        name: 'InventoryTransfer',
        component: () => import('../views/inventory/transfer/index.vue'),
        meta: { title: 'inventory.transfer.title', requiresAuth: true }
      },
      {
        path: 'transfer/add',
        name: 'InventoryTransferAdd',
        component: () => import('../views/inventory/transfer/form.vue'),
        meta: { title: 'inventory.transfer.add', activeMenu: '/inventory/transfer', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'transfer/edit/:id',
        name: 'InventoryTransferEdit',
        component: () => import('../views/inventory/transfer/form.vue'),
        meta: { title: 'inventory.transfer.edit', activeMenu: '/inventory/transfer', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'transfer/detail/:id',
        name: 'InventoryTransferDetail',
        component: () => import('../views/inventory/transfer/detail.vue'),
        meta: { title: 'inventory.transfer.details', activeMenu: '/inventory/transfer', hideInMenu: true, requiresAuth: true }
      }
    ]
  },
  // 登录页面（不需要认证）
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  // 系统管理
  {
    path: '/system',
    name: 'SystemManagement',
    component: () => import('../layout/SystemLayout.vue'),
    redirect: '/system/user',
    meta: { requiresAuth: true, layoutConfig: systemLayoutConfig },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('../views/system/user/index.vue'),
        meta: { title: 'system.menu.user', requiresAuth: true }
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('../views/system/role/index.vue'),
        meta: { title: 'system.menu.role', requiresAuth: true }
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        component: () => import('../views/system/menu/index.vue'),
        meta: { title: 'system.menu.menu', requiresAuth: true }
      },
      {
        path: 'dept',
        name: 'SystemDept',
        component: () => import('../views/system/dept/index.vue'),
        meta: { title: 'system.menu.dept', requiresAuth: true }
      },
      {
        path: 'dict',
        name: 'SystemDict',
        component: () => import('../views/system/dict/index.vue'),
        meta: { title: 'system.menu.dict', requiresAuth: true }
      },
      {
        path: 'dict-data/:dictType',
        name: 'SystemDictData',
        component: () => import('../views/system/dict/data.vue'),
        meta: { title: 'system.menu.dict', hideInMenu: true, requiresAuth: true }
      },
      {
        path: 'notice',
        name: 'SystemNotice',
        component: () => import('../views/system/notice/index.vue'),
        meta: { title: 'system.menu.notice', requiresAuth: true }
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('../views/system/config/index.vue'),
        meta: { title: 'system.menu.config', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory('/agriculture/'),
  routes
})


// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要身份验证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (!requiresAuth) {
    return next()
  }

  // 路由切换时显示加载状态
  if (to.path !== from.path) {
    const loadingStore = useLoadingStore()
    loadingStore.setRouteLoading(true)
  }

  const userStore = useUserStore()

  // 1. 先判断 URL 上有没有 token (SSO模式)
  const loginMode = getLoginMode()
  const urlToken = loginMode === 'sso' ? getTokenFromUrl() : null

  // 2. 判断 localStorage 有没有 token
  const storedToken = getToken()

  // 3. 处理不同情况
  if (urlToken && loginMode === 'sso') {
    // SSO模式下，URL中有token
    userStore.setToken(urlToken)
    try {
      await userStore.fetchUserInfo()
      await userStore.getPermissions()
      await userStore.getMenus()

      // 清理URL中的token参数
      if (window.location.hash.includes('token=') || window.location.search.includes('token=')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.hash.split('?')[0])
        return next(getDefaultEntryRoute(userStore))
      }
    } catch (error) {
      console.error('路由守卫: SSO登录后获取用户信息失败:', error)
      userStore.logoutAndRedirect(1000)
      return next(false)
    }
  } else if(!storedToken) {
    // 没有token，跳转登录
    userStore.logoutAndRedirect(1000)
    return next(false)
  } else {
    // 有 token，检查是否有用户信息
    console.log('路由守卫: 已有token，检查用户信息状态 - hasUserInfo:', userStore.hasUserInfo)

    if (!userStore.hasUserInfo) {
      console.log('路由守卫: 用户信息不存在，开始获取')
      try {
        const result = await userStore.fetchUserInfo()
        // 获取权限和菜单
        await userStore.getPermissions()
        await userStore.getMenus()

        console.log('路由守卫: 用户信息获取完成:', result ? '成功' : '失败')
        console.log('路由守卫: 获取后状态 - hasUserInfo:', userStore.hasUserInfo)
      } catch (error) {
        console.error('路由守卫: 获取用户信息失败:', error)
        // 如果获取用户信息失败，可能是 token 已过期，重新登录
        userStore.logoutAndRedirect(1000)
        return next(false)
      }
    } else {
      // 用户信息存在，但如果菜单或权限为空，也尝试获取一次
      if (userStore.menus.length === 0) {
        await userStore.getMenus()
      }
      if (userStore.permissions.length === 0) {
        await userStore.getPermissions()
      }
      console.log('路由守卫: 用户信息已存在，直接放行')
    }

    if (to.path === '/input') {
      return next(getDefaultInputRoute(userStore))
    }

    // 检查路由权限
    // 如果是白名单路由（如首页），直接放行
    if (to.path === '/home' || to.path === '/user' || to.path === '/404' || to.path === '/401') {
      return next()
    }

    // 检查是否有菜单权限
    // 注意：这里假设所有受控路由都在菜单中定义。如果有一些隐藏路由不在菜单中但需要访问，
    // 需要确保它们在 getRouters 返回的列表中（即使 hidden: true）

    // 检查是否在白名单中（前缀匹配）
    const isInWhitelist = (path) => {
      return routeWhitelist.some(prefix => path === prefix || path.startsWith(prefix + '/'))
    }

    // 只有当路由需要认证时才检查权限
    if (requiresAuth) {
      // 首先检查白名单
      if (isInWhitelist(to.path)) {
        console.log('路由守卫: 白名单路径，允许访问:', to.path)
        return next()
      }

      // 如果用户没有任何菜单权限，阻止访问非白名单路由
      if (userStore.menus.length === 0) {
        console.warn('路由守卫: 用户没有任何菜单权限，无法访问:', to.path)
        return next('/401')
      }

      // 检查菜单权限
      const hasPerm = userStore.hasMenuPermission(to.path)
      if (!hasPerm) {
        console.warn('路由守卫: 此路径未在菜单中找到:', to.path)
        // 不在白名单也不是动态路由，拦截
        return next('/401')
      }
    }

    next()
  }
})

// 全局后置守卫 - 路由切换完成后关闭loading
router.afterEach(() => {
  const loadingStore = useLoadingStore()
  // 延迟关闭loading，确保页面已经渲染完成
  setTimeout(() => {
    loadingStore.setRouteLoading(false)
  }, 200)
})

export default router
