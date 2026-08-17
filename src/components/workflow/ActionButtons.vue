<template>
  <div class="workflow-action-buttons" :class="{ 'is-table-mode': mode === 'list' }">
    <el-button
        v-for="button in visibleButtons"
        :key="button.action"
        :type="button.type"
        :size="mode === 'list' ? 'small' : 'default'"
        :loading="loading && currentAction === button.action"
        :disabled="disabled || (loading && currentAction !== button.action)"
        @click="handleAction(button)">
      <i :class="button.icon"></i>
      <span class="btn-text">{{ getButtonLabel(button) }}</span>
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  /**
   * Current workflow status (S0, S1, S2, S3, S9, S10)
   */
  workflowStatus: {
    type: String,
    required: true
  },

  /**
   * Current page mode: 'add', 'edit', 'audit', 'view'
   */
  mode: {
    type: String,
    default: 'view'
  },

  /**
   * Whether in approval page (voided tab)
   */
  isVoidedTab: {
    type: Boolean,
    default: false
  },

  /**
   * Whether to show audit button (for pages that have separate audit page)
   */
  showAudit: {
    type: Boolean,
    default: true
  },

  /**
   * Whether to show confirm button (for stock-in approved status)
   */
  showConfirm: {
    type: Boolean,
    default: false
  },

  /**
   * Disable all buttons
   */
  disabled: {
    type: Boolean,
    default: false
  },

  /**
   * Loading state
   */
  loading: {
    type: Boolean,
    default: false
  },

  /**
   * Custom button configuration to override defaults
   * Useful for specific workflows
   */
  customButtons: {
    type: Array,
    default: null
  },

  /**
   * Actions to exclude by default
   */
  excludeActions: {
    type: Array,
    default: () => []
  },

  /**
   * Whether to force show view button
   */
  forceView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['action'])

const { t } = useI18n()

const getButtonLabel = (button) => {
  if (button.rawLabel) return button.rawLabel
  if (button.label && button.label.includes('.')) return t(button.label)
  return t(`common.${button.label}`)
}

const currentAction = ref('')

/**
 * Default button configurations based on workflow state
 */
const getDefaultButtons = () => {
  const { workflowStatus, mode, isVoidedTab } = props

  // If on voided tab, only show view button
  if (isVoidedTab) {
    return [
      { type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' }
    ]
  }

  // Add/Edit mode
  if (mode === 'add' || mode === 'edit') {
    return [
      { type: '', action: 'cancel', label: 'cancel', icon: 'ri-close-line' },
      { type: 'primary', action: 'save', label: 'save', icon: 'ri-save-line' }
    ]
  }

  // Audit mode
  if (mode === 'audit') {
    return [
      { type: '', action: 'cancel', label: 'cancel', icon: 'ri-close-line' },
      { type: 'success', action: 'approve', label: 'approve', icon: 'ri-check-line' },
      { type: 'danger', action: 'reject', label: 'reject', icon: 'ri-close-circle-line' }
    ]
  }

  // View mode with specific actions based on workflow status
  if (mode === 'view') {
    const buttons = []

    // Common buttons for certain states
    if (['S2', 'S9'].includes(workflowStatus)) {
      buttons.push({ type: '', action: 'cancel', label: 'cancel', icon: 'ri-close-line' })
      buttons.push({ type: 'primary', action: 'archive', label: 'archive', icon: 'ri-archive-line' })
      buttons.push({ type: 'danger', action: 'cancelBatch', label: 'delete', icon: 'ri-delete-bin-line' })
    }

    return buttons
  }

  // Workflow status-based buttons (for list/table view)
  const buttons = []

  switch (workflowStatus) {
    case 'S0': // Draft
      buttons.push({ type: 'primary', action: 'edit', label: 'edit', icon: 'ri-edit-line' })
      buttons.push({ type: 'success', action: 'submit', label: 'submit', icon: 'ri-send-plane-line' })
      // 管理页面显示作废按钮，审核页面不显示
      if (!props.showAudit) {
        buttons.push({ type: 'danger', action: 'cancelBatch', label: 'delete', icon: 'ri-delete-bin-line' })
      }
      break

    case 'S1': // Pending Approval
      buttons.push({ type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' })
      if (props.showAudit) {
        // 审核页面：显示查看按钮 + 审核按钮
        buttons.push({ type: 'primary', action: 'audit', label: 'audit', icon: 'ri-check-line' })
      }
      break

    case 'S2': // Approved
      if (props.showConfirm) {
        // 显示确认入库按钮（用于入库管理的已审核状态）
        buttons.push({ type: 'success', action: 'confirm', label: 'confirmInbound', icon: 'ri-checkbox-circle-line' })
      }
      buttons.push({ type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' })
      break

    case 'S3': // Rejected
      buttons.push({ type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' })
      if (props.showAudit) {
        // 审核页面：显示查看和编辑按钮
        buttons.push({ type: 'primary', action: 'edit', label: 'edit', icon: 'ri-edit-line' })
      } else {
        // 管理页面：显示编辑、提交、作废按钮
        buttons.push({ type: 'primary', action: 'edit', label: 'edit', icon: 'ri-edit-line' })
        buttons.push({ type: 'success', action: 'submit', label: 'submit', icon: 'ri-send-plane-line' })
        buttons.push({ type: 'danger', action: 'cancelBatch', label: 'delete', icon: 'ri-delete-bin-line' })
      }
      break

    case 'S9': // Archived
    case 'S10': // Voided
      buttons.push({ type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' })
      break
  }

  return buttons
}

// Compute visible buttons
const visibleButtons = computed(() => {
  let buttons = props.customButtons || getDefaultButtons()

  // Force View if enabled and not present
  if (props.forceView && !buttons.find(b => b.action === 'view')) {
    buttons = [
      { type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' },
      ...buttons
    ]
  }

  if (props.excludeActions && props.excludeActions.length) {
    return buttons.filter(b => !props.excludeActions.includes(b.action))
  }
  return buttons
})

const handleAction = (button) => {
  currentAction.value = button.action
  emit('action', button.action)

  // Reset current action after a delay (for loading state)
  setTimeout(() => {
    currentAction.value = ''
  }, 3000)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/workflow-common.scss';
</style>
