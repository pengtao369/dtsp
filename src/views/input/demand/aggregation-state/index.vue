<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-database-2-line"
        :title="$t('stateAggregation.title')"
        :subtitle="$t('stateAggregation.subtitle')"
      >
      </PageHeader>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <InfoCard 
          :title="viewMode === 'main' ? $t('Aggregation List') : (currentDrillDown3Row?.sourceName || currentDrillDown2Row?.sourceName || currentDrillDownRow?.targetName || $t('stateAggregation.list'))" 
          icon="ri-file-list-3-line"
          :no-padding="true"
        >
          <!-- 主列表视图 -->
          <template v-if="viewMode === 'main'">
            <div class="filter-bar" style="display:flex; width:100%; justify-content:flex-end; align-items:center; margin-bottom:16px;">
              <el-select
                v-model="exportFilters.season"
                :placeholder="$t('farmerDemand.form.season')"
                clearable
                style="width: 220px"
              >
                <el-option
                  v-for="item in options.agri_season || []"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
            <!-- PC端表格 -->
            <div class="table-wrapper pc-only">
              <el-table
                v-loading="loading"
                :data="tableData"
                stripe
                empty-text=""
                :default-sort="{ prop: 'year', order: 'descending' }"
              >
                <el-table-column
                  prop="year"
                  :label="$t('stateAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('RegionName')"
                  min-width="140"
                >
                  <template #default="{ row }">
                    <el-button link type="primary" @click="handleDrillDown(row)">
                      {{ row.sourceName }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="subQuantity"
                  :label="$t('stateAggregation.columns.subQuantity')"
                  min-width="140"
                />
                <el-table-column
                  prop="unsubmitQuantity"
                  :label="$t('Unsubmit Quantity')"
                  min-width="140"
                />
                <el-table-column
                  prop="submitQuantity"
                  :label="$t('Submit Quantity')"
                  min-width="140"
                />
                <el-table-column
                  prop="createTime"
                  :label="$t('stateAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('stateAggregation.columns.actions')"
                  fixed="right"
                  width="340"
                >
                  <template #default="{ row }">
                    <ActionButtons
                      :workflow-status="mapWorkflowStatus(row.status)"
                      mode="list"
                      :show-audit="true"
                      :custom-buttons="getMainTableButtons(row)"
                      @action="(action) => handleAction(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <!-- PC pagination -->
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :total="pagination.total"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>

            <!-- 移动端卡片 -->
            <div class="mobile-card-list mobile-only">
              <div v-for="item in tableData" :key="item.id" class="mobile-card">
                <div class="mobile-card-header">
                  <div class="year-badge">
                    <i class="ri-calendar-line"></i>
                    <span>{{ item.year }}</span>
                  </div>
                </div>
                <div class="mobile-card-body">
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('RegionName') }}:</span>
                    <span class="value">{{ item.sourceName }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('stateAggregation.columns.subQuantity') }}:</span>
                    <span class="value">{{ item.subQuantity }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('stateAggregation.columns.createTime') }}:</span>
                    <span class="value">{{ item.createTime }}</span>
                  </div>
                </div>
                <div class="mobile-card-footer">
                   <ActionButtons
                      :workflow-status="mapWorkflowStatus(item.status)"
                      mode="list"
                      :show-audit="true"
                      :custom-buttons="getMainTableButtons(item)"
                      @action="(action) => handleAction(item, action)"
                    />
                </div>
              </div>

              <!-- Mobile pagination -->
              <div class="pagination-wrapper mobile-pagination">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="[10, 20, 50]"
                  :total="pagination.total"
                  layout="total, prev, pager, next"
                  small
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>

            <el-empty
              v-if="tableData.length === 0 && !loading"
              :description="$t('stateAggregation.messages.noData')"
            />
          </template>

          <!-- 第一层下钻列表视图 (Zone级别) -->
          <template v-else-if="viewMode === 'drillDown'">
            <!-- 返回按钮和面包屑 -->
            <div class="drill-down-header">
              <el-button type="primary" plain @click="handleBackToMain">
                <i class="ri-arrow-left-line"></i>
                {{ $t('common.back') }}
              </el-button>
              <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item>{{ $t('stateAggregation.title') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDownRow?.targetName }} ({{ currentDrillDownRow?.year }})</el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <!-- 下钻表格 -->
            <div class="table-wrapper">
              <el-table
                v-loading="drillDownLoading"
                :data="drillDownData"
                stripe
                empty-text=""
                :default-sort="{ prop: 'year', order: 'descending' }"
              >
                <el-table-column
                  prop="year"
                  :label="$t('stateAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('ZoneName')"
                  min-width="140"
                >
                  <template #default="{ row }">
                    <el-button link type="primary" @click="handleDrillDown2(row)">
                      {{ row.sourceName }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="subQuantity"
                    :label="$t('townAggregation.columns.subQuantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :label="$t('stateAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('stateAggregation.columns.actions')"
                  fixed="right"
                  width="120"
                >
                  <template #default="{ row }">
                    <ActionButtons
                      :workflow-status="mapWorkflowStatus(row.status)"
                      mode="list"
                      :show-audit="false"
                      :custom-buttons="getDrillDownButtons(row)"
                      @action="(action) => handleDrillDownAction(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 下钻分页 -->
            <div v-if="drillDownPagination.total > 0" class="pagination-wrapper">
              <el-pagination
                :current-page="drillDownPagination.currentPage"
                :page-size="drillDownPagination.pageSize"
                :page-sizes="[10, 20, 50]"
                :total="drillDownPagination.total"
                layout="total, sizes, prev, pager, next"
                background
                small
                @size-change="handleDrillDownSizeChange"
                @current-change="handleDrillDownCurrentChange"
                @update:current-page="drillDownPagination.currentPage = $event"
                @update:page-size="drillDownPagination.pageSize = $event"
              />
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="drillDownData.length === 0 && !drillDownLoading"
              :description="$t('stateAggregation.messages.noData')"
            />
          </template>

          <!-- 第二层下钻列表视图 (Woreda级别) -->
          <template v-else-if="viewMode === 'drillDown2'">
            <!-- 返回按钮和面包屑 -->
            <div class="drill-down-header">
              <el-button type="primary" plain @click="handleBackToDrillDown">
                <i class="ri-arrow-left-line"></i>
                {{ $t('common.back') }}
              </el-button>
              <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item>{{ $t('stateAggregation.title') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDownRow?.targetName }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDown2Row?.sourceName }} ({{ currentDrillDown2Row?.year }})</el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <!-- 第二层下钻表格 -->
            <div class="table-wrapper">
              <el-table
                v-loading="drillDown2Loading"
                :data="drillDown2Data"
                stripe
                empty-text=""
                :default-sort="{ prop: 'year', order: 'descending' }"
              >
                <el-table-column
                  prop="year"
                  :label="$t('stateAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('WoredaName')"
                  min-width="140"
                >
                  <template #default="{ row }">
                    <el-button link type="primary" @click="handleDrillDown3(row)">
                      {{ row.sourceName }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column
                    prop="subQuantity"
                    :label="$t('townAggregation.columns.subQuantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :label="$t('stateAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('stateAggregation.columns.actions')"
                  fixed="right"
                  width="120"
                >
                  <template #default="{ row }">
                    <ActionButtons
                      :workflow-status="mapWorkflowStatus(row.status)"
                      mode="list"
                      :show-audit="false"
                      :custom-buttons="getDrillDown2Buttons(row)"
                      @action="(action) => handleDrillDown2Action(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 第二层下钻分页 -->
            <div v-if="drillDown2Pagination.total > 0" class="pagination-wrapper">
              <el-pagination
                :current-page="drillDown2Pagination.currentPage"
                :page-size="drillDown2Pagination.pageSize"
                :page-sizes="[10, 20, 50]"
                :total="drillDown2Pagination.total"
                layout="total, sizes, prev, pager, next"
                background
                small
                @size-change="handleDrillDown2SizeChange"
                @current-change="handleDrillDown2CurrentChange"
                @update:current-page="drillDown2Pagination.currentPage = $event"
                @update:page-size="drillDown2Pagination.pageSize = $event"
              />
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="drillDown2Data.length === 0 && !drillDown2Loading"
              :description="$t('stateAggregation.messages.noData')"
            />
          </template>

          <!-- 第三层下钻列表视图 (Kebele级别) -->
          <template v-else-if="viewMode === 'drillDown3'">
            <!-- 返回按钮和面包屑 -->
            <div class="drill-down-header">
              <el-button type="primary" plain @click="handleBackToDrillDown2">
                <i class="ri-arrow-left-line"></i>
                {{ $t('common.back') }}
              </el-button>
              <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item>{{ $t('stateAggregation.title') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDownRow?.targetName }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDown2Row?.sourceName }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDown3Row?.sourceName }} ({{ currentDrillDown3Row?.year }})</el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <!-- 第三层下钻表格 -->
            <div class="table-wrapper">
              <el-table
                v-loading="drillDown3Loading"
                :data="drillDown3Data"
                stripe
                empty-text=""
                :default-sort="{ prop: 'year', order: 'descending' }"
              >
                <el-table-column
                  prop="year"
                  :label="$t('stateAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('KebeleName')"
                  min-width="140"
                />
                <el-table-column
                    prop="subQuantity"
                    :label="$t('townAggregation.columns.subQuantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :label="$t('stateAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('stateAggregation.columns.actions')"
                  fixed="right"
                  width="120"
                >
                  <template #default="{ row }">
                    <ActionButtons
                      :workflow-status="mapWorkflowStatus(row.status)"
                      mode="list"
                      :show-audit="false"
                      :custom-buttons="getDrillDown3Buttons(row)"
                      @action="(action) => handleDrillDown3Action(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 第三层下钻分页 -->
            <div v-if="drillDown3Pagination.total > 0" class="pagination-wrapper">
              <el-pagination
                :current-page="drillDown3Pagination.currentPage"
                :page-size="drillDown3Pagination.pageSize"
                :page-sizes="[10, 20, 50]"
                :total="drillDown3Pagination.total"
                layout="total, sizes, prev, pager, next"
                background
                small
                @size-change="handleDrillDown3SizeChange"
                @current-change="handleDrillDown3CurrentChange"
                @update:current-page="drillDown3Pagination.currentPage = $event"
                @update:page-size="drillDown3Pagination.pageSize = $event"
              />
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="drillDown3Data.length === 0 && !drillDown3Loading"
              :description="$t('stateAggregation.messages.noData')"
            />
          </template>
        </InfoCard>
      </div>
    </div>

    <!-- 汇聚明细对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('stateAggregation.detailDialog.title')"
      width="80%"
      top="5vh"
    >
      <el-table
        v-loading="detailLoading"
        :data="detailData"
        stripe
        max-height="500px"
      >
        <el-table-column
          prop="inputCategory"
          :label="$t('stateAggregation.detailDialog.columns.inputCategory')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ getLabelByValue('input_category', row.inputCategory) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="inputType"
          :label="$t('stateAggregation.detailDialog.columns.inputType')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ getLabelByValue('input_type', row.inputType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="season"
          :label="$t('farmerDemand.form.season')"
          min-width="120"
        >
          <template #default="{ row }">
            {{ getSeasonLabel(row.season || row.seasonCode || row.season_code) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="variety"
          :label="$t('farmerDemand.form.variety')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.variety || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalQuantity"
          :label="$t('stateAggregation.detailDialog.columns.totalQuantity')"
          min-width="120"
        >
          <template #default="{ row }">
            {{ getEffectiveQuantity(row) }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="detailData.length === 0 && !detailLoading"
        :description="$t('stateAggregation.detailDialog.noData')"
      />
      <template #footer>
        <el-button @click="detailDialogVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 第一层下钻记录详情对话框 -->
    <el-dialog
      v-model="drillDownRecordDetailVisible"
      :title="$t('stateAggregation.detailDialog.title')"
      width="70%"
      top="5vh"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('stateAggregation.columns.year')">
          {{ drillDownRecordDetail.year }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Zone Name')">
          {{ drillDownRecordDetail.sourceName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Zone Code')">
          {{ drillDownRecordDetail.sourceCode }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('stateAggregation.columns.createTime')">
          {{ drillDownRecordDetail.createTime }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 汇聚结果列表 -->
      <div class="aggregation-result-section">
        <h4 class="section-title">{{ $t('stateAggregation.detailDialog.title') }}</h4>
        <el-table
          v-loading="drillDownAggregationLoading"
          :data="drillDownAggregationData"
          stripe
          max-height="300px"
        >
          <el-table-column
            prop="inputCategory"
            :label="$t('stateAggregation.detailDialog.columns.inputCategory')"
            min-width="150"
          >
            <template #default="{ row }">
              {{ getLabelByValue('input_category', row.inputCategory) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="inputType"
            :label="$t('stateAggregation.detailDialog.columns.inputType')"
            min-width="150"
          >
            <template #default="{ row }">
              {{ getLabelByValue('input_type', row.inputType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="season"
            :label="$t('farmerDemand.form.season')"
            min-width="120"
          >
            <template #default="{ row }">
              {{ getSeasonLabel(row.season || row.seasonCode || row.season_code) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="variety"
            :label="$t('farmerDemand.form.variety')"
            min-width="150"
          >
            <template #default="{ row }">
              {{ row.variety || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="totalQuantity"
            :label="$t('stateAggregation.detailDialog.columns.totalQuantity')"
            min-width="120"
          >
            <template #default="{ row }">
              {{ getEffectiveQuantity(row) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="drillDownAggregationData.length === 0 && !drillDownAggregationLoading"
          :description="$t('stateAggregation.detailDialog.noData')"
        />
      </div>

      <template #footer>
        <el-button @click="drillDownRecordDetailVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 第二层下钻记录详情对话框 -->
    <el-dialog
      v-model="drillDown2RecordDetailVisible"
      :title="$t('stateAggregation.detailDialog.title')"
      width="70%"
      top="5vh"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('stateAggregation.columns.year')">
          {{ drillDown2RecordDetail.year }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Woreda Name')">
          {{ drillDown2RecordDetail.sourceName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Woreda Code')">
          {{ drillDown2RecordDetail.sourceCode }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('stateAggregation.columns.createTime')">
          {{ drillDown2RecordDetail.createTime }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 汇聚结果列表 -->
      <div class="aggregation-result-section">
        <h4 class="section-title">{{ $t('stateAggregation.detailDialog.title') }}</h4>
        <el-table
          v-loading="drillDown2AggregationLoading"
          :data="drillDown2AggregationData"
          stripe
          max-height="300px"
        >
          <el-table-column
            prop="inputCategory"
            :label="$t('stateAggregation.detailDialog.columns.inputCategory')"
            min-width="150"
          >
            <template #default="{ row }">
              {{ getLabelByValue('input_category', row.inputCategory) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="inputType"
            :label="$t('stateAggregation.detailDialog.columns.inputType')"
            min-width="150"
          >
            <template #default="{ row }">
              {{ getLabelByValue('input_type', row.inputType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="season"
            :label="$t('farmerDemand.form.season')"
            min-width="120"
          >
            <template #default="{ row }">
              {{ getSeasonLabel(row.season || row.seasonCode || row.season_code) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="variety"
            :label="$t('farmerDemand.form.variety')"
            min-width="150"
          >
            <template #default="{ row }">
              {{ row.variety || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            prop="totalQuantity"
            :label="$t('stateAggregation.detailDialog.columns.totalQuantity')"
            min-width="120"
          >
            <template #default="{ row }">
              {{ getEffectiveQuantity(row) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty
          v-if="drillDown2AggregationData.length === 0 && !drillDown2AggregationLoading"
          :description="$t('stateAggregation.detailDialog.noData')"
        />
      </div>

      <template #footer>
        <el-button @click="drillDown2RecordDetailVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 第三层下钻记录详情对话框 -->
    <el-dialog
      v-model="drillDown3RecordDetailVisible"
      :title="$t('stateAggregation.detailDialog.title')"
      width="80%"
      top="5vh"
    >
      <el-descriptions :column="2" border style="margin-bottom: 20px;">
        <el-descriptions-item :label="$t('stateAggregation.columns.year')">
          {{ drillDown3RecordDetail.year }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Kebele Name')">
          {{ drillDown3RecordDetail.sourceName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Kebele Code')">
          {{ drillDown3RecordDetail.sourceCode }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('stateAggregation.columns.createTime')">
          {{ drillDown3RecordDetail.createTime }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 标签页 -->
      <el-tabs v-model="activeDetailTab" @tab-change="handleDetailTabChange">
        <!-- 汇聚结果标签页 -->
        <el-tab-pane :label="$t('common.aggregationResults')" name="aggregation">
          <el-table
            v-loading="drillDown3AggregationLoading"
            :data="drillDown3AggregationData"
            stripe
            max-height="400px"
          >
            <el-table-column
              prop="inputCategory"
              :label="$t('stateAggregation.detailDialog.columns.inputCategory')"
              min-width="150"
            >
              <template #default="{ row }">
                {{ getLabelByValue('input_category', row.inputCategory) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="inputType"
              :label="$t('stateAggregation.detailDialog.columns.inputType')"
              min-width="150"
            >
              <template #default="{ row }">
                {{ getLabelByValue('input_type', row.inputType) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="season"
              :label="$t('farmerDemand.form.season')"
              min-width="120"
            >
              <template #default="{ row }">
                {{ getSeasonLabel(row.season || row.seasonCode || row.season_code) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="variety"
              :label="$t('farmerDemand.form.variety')"
              min-width="150"
            >
              <template #default="{ row }">
                {{ row.variety || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="totalQuantity"
              :label="$t('stateAggregation.detailDialog.columns.totalQuantity')"
              min-width="120"
            >
              <template #default="{ row }">
                {{ getEffectiveQuantity(row) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="drillDown3AggregationData.length === 0 && !drillDown3AggregationLoading"
            :description="$t('stateAggregation.detailDialog.noData')"
          />
        </el-tab-pane>

        <!-- 农民需求标签页 -->
        <el-tab-pane :label="$t('common.farmerDemands')" name="farmers">
          <!-- 搜索区域 -->
          <div class="search-section" style="margin-bottom: 16px;">
            <el-input
              v-model="farmerSearchForm.farmerName"
              :placeholder="$t('demandAudit.columns.farmerName')"
              clearable
              style="width: 200px; margin-right: 8px;"
            />
            <el-input
              v-model="farmerSearchForm.farmerIdNumber"
              :placeholder="$t('demandAudit.columns.farmerIdNumber')"
              clearable
              style="width: 200px; margin-right: 8px;"
            />
            <el-select
              v-model="farmerSearchForm.status"
              :placeholder="$t('demandAudit.columns.status')"
              clearable
              style="width: 150px; margin-right: 8px;"
            >
              <el-option :label="$t('demandAudit.status.draft')" value="0" />
              <el-option :label="$t('demandAudit.status.submitted')" value="1" />
              <el-option :label="$t('demandAudit.status.approved')" value="2" />
              <el-option :label="$t('demandAudit.status.rejected')" value="3" />
            </el-select>
            <el-button type="primary" @click="handleFarmerSearch">
              <i class="ri-search-line"></i>
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleFarmerSearchReset">
              <i class="ri-refresh-line"></i>
              {{ $t('common.reset') }}
            </el-button>
          </div>

          <!-- 农民需求表格 -->
          <el-table
            v-loading="farmerDemandLoading"
            :data="farmerDemandData"
            stripe
            max-height="400px"
          >
            <el-table-column
              prop="batchNo"
              :label="$t('demandAudit.columns.batchNo')"
              min-width="150"
            />
            <el-table-column
              prop="farmerName"
              :label="$t('demandAudit.columns.farmerName')"
              min-width="120"
            />
            <el-table-column
              prop="farmerIdNumber"
              :label="$t('demandAudit.columns.farmerIdNumber')"
              min-width="150"
            />
            <el-table-column
              prop="landArea"
              :label="$t('demandAudit.columns.landArea')"
              min-width="120"
            >
              <template #default="{ row }">
                {{ row.landArea || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              :label="$t('demandAudit.columns.status')"
              min-width="120"
            >
              <template #default="{ row }">
                <el-tag :type="getFarmerStatusType(row.status)" size="small">
                  {{ getFarmerStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('common.actions')"
              fixed="right"
              width="100"
            >
              <template #default="{ row }">
                <ActionButtons
                  :workflow-status="mapWorkflowStatus(row.status)"
                  mode="list"
                  :show-audit="false"
                  :custom-buttons="getFarmerDemandButtons(row)"
                  @action="(action) => handleFarmerDemandAction(row, action)"
                />
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="farmerDemandPagination.total > 0" class="pagination-wrapper" style="margin-top: 16px;">
            <el-pagination
              v-model:current-page="farmerDemandPagination.currentPage"
              v-model:page-size="farmerDemandPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="farmerDemandPagination.total"
              layout="total, sizes, prev, pager, next"
              background
              small
              @size-change="handleFarmerPageChange"
              @current-change="handleFarmerPageChange"
            />
          </div>

          <el-empty
            v-if="farmerDemandData.length === 0 && !farmerDemandLoading"
            :description="$t('stateAggregation.detailDialog.noData')"
          />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="drillDown3RecordDetailVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  getVillageDemandSummaryMainList,
  getVillageDemandSummaryMainListSub,
  getTownAggregationDetail,
  getVillageAggregationDetail
} from '@/api/villageAggregation'
import { getFarmerDemandPage } from '@/api/farmerDemand'
import { useDict } from '@/hooks/useDict'
import { PageHeader, InfoCard } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const { getLabelByValue, options } = useDict(['input_type', 'input_category', 'agri_season'])
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const tableData = ref([])

// 视图模式: 'main' 主列表, 'drillDown' 第一层下钻, 'drillDown2' 第二层下钻, 'drillDown3' 第三层下钻
const viewMode = ref('main')

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 汇聚明细对话框
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref([])
const currentDetailRow = ref(null)

// 第一层下钻列表
const drillDownLoading = ref(false)
const drillDownData = ref([])
const currentDrillDownRow = ref(null)

const drillDownPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 第一层下钻记录详情
const drillDownRecordDetailVisible = ref(false)
const drillDownRecordDetail = ref({})
const drillDownAggregationLoading = ref(false)
const drillDownAggregationData = ref([])

// 第二层下钻列表
const drillDown2Loading = ref(false)
const drillDown2Data = ref([])
const currentDrillDown2Row = ref(null)

const drillDown2Pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 第二层下钻记录详情
const drillDown2RecordDetailVisible = ref(false)
const drillDown2RecordDetail = ref({})
const drillDown2AggregationLoading = ref(false)
const drillDown2AggregationData = ref([])

// 第三层下钻列表
const drillDown3Loading = ref(false)
const drillDown3Data = ref([])
const currentDrillDown3Row = ref(null)

const drillDown3Pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 第三层下钻记录详情
const drillDown3RecordDetailVisible = ref(false)
const drillDown3RecordDetail = ref({})
const drillDown3AggregationLoading = ref(false)
const drillDown3AggregationData = ref([])

// 详情对话框标签页
const activeDetailTab = ref('aggregation')

// 农民需求数据
const farmerDemandLoading = ref(false)
const farmerDemandData = ref([])
const farmerDemandPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const farmerSearchForm = reactive({
  farmerName: '',
  farmerIdNumber: '',
  status: ''
})

const exportFilters = reactive({
  season: ''
})

const getSeasonLabel = (value) => {
  const seasonMap = {
    '1': 'Summer',
    '2': 'Spring',
    '3': 'Irrigation'
  }
  const rawValue = value ?? ''
  return seasonMap[String(rawValue)] || getLabelByValue('agri_season', rawValue) || rawValue || '-'
}

const getEffectiveQuantity = (row) => {
  if (row?.hasAdjustment && row.adjustedQuantity !== null && row.adjustedQuantity !== undefined) {
    return row.adjustedQuantity
  }
  return row?.receivedQuantity ?? row?.totalQuantity ?? '-'
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      sourceCode: JSON.parse(localStorage.getItem('userInfo')).deptId,
      level: '3',
      orderByColumn: 'year',
      isAsc: 'desc'
    }
    const res = await getVillageDemandSummaryMainList(params)

    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error(t('stateAggregation.messages.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 审核 - 跳转到审核页面
const handleApprove = (row) => {
  router.push({
    name: 'StateDemandAuditView',
    query: { year: row.year }
  })
}

// 查看汇聚明细
const handleDetail = async (row) => {
  currentDetailRow.value = row
  detailDialogVisible.value = true
  detailLoading.value = true

  try {
    const res = await getTownAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })

    if (res.code === 200) {
      detailData.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load detail data:', error)
    ElMessage.error(t('stateAggregation.detailDialog.loadFailed'))
  } finally {
    detailLoading.value = false
  }
}

// ========== 第一层下钻 - Region -> Zone ==========
const handleDrillDown = async (row) => {
  currentDrillDownRow.value = row
  viewMode.value = 'drillDown'
  drillDownPagination.currentPage = 1
  await loadDrillDownData()
}

const handleBackToMain = () => {
  viewMode.value = 'main'
  currentDrillDownRow.value = null
  drillDownData.value = []
  currentDrillDown2Row.value = null
  drillDown2Data.value = []
  currentDrillDown3Row.value = null
  drillDown3Data.value = []
}

const loadDrillDownData = async () => {
  if (!currentDrillDownRow.value) return

  drillDownLoading.value = true
  try {
    const params = {
      page: drillDownPagination.currentPage,
      pageSize: drillDownPagination.pageSize,
      targetCode: currentDrillDownRow.value.sourceCode,
      year: currentDrillDownRow.value.year,
      level: '3',
      orderByColumn: 'year',
      isAsc: 'desc'
    }
    const res = await getVillageDemandSummaryMainListSub(params)

    if (res.code === 200) {
      drillDownData.value = res.data?.list || []
      drillDownPagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('Failed to load drill down data:', error)
    ElMessage.error(t('stateAggregation.messages.loadFailed'))
  } finally {
    drillDownLoading.value = false
  }
}

const handleDrillDownSizeChange = () => {
  drillDownPagination.currentPage = 1
  loadDrillDownData()
}

const handleDrillDownCurrentChange = () => {
  loadDrillDownData()
}

const handleDrillDownDetail = async (row) => {
  drillDownRecordDetail.value = row
  drillDownRecordDetailVisible.value = true
  drillDownAggregationData.value = []

  drillDownAggregationLoading.value = true
  try {
    const res = await getTownAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })
    if (res.code === 200) {
      drillDownAggregationData.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load aggregation data:', error)
    ElMessage.error(t('stateAggregation.detailDialog.loadFailed'))
  } finally {
    drillDownAggregationLoading.value = false
  }
}

// ========== 第二层下钻 - Zone -> Woreda ==========
const handleDrillDown2 = async (row) => {
  currentDrillDown2Row.value = row
  viewMode.value = 'drillDown2'
  drillDown2Pagination.currentPage = 1
  await loadDrillDown2Data()
}

const handleBackToDrillDown = () => {
  viewMode.value = 'drillDown'
  currentDrillDown2Row.value = null
  drillDown2Data.value = []
  currentDrillDown3Row.value = null
  drillDown3Data.value = []
}

const loadDrillDown2Data = async () => {
  if (!currentDrillDown2Row.value) return

  drillDown2Loading.value = true
  try {
    const params = {
      page: drillDown2Pagination.currentPage,
      pageSize: drillDown2Pagination.pageSize,
      targetCode: currentDrillDown2Row.value.sourceCode,
      year: currentDrillDown2Row.value.year,
      level: '2',
      orderByColumn: 'year',
      isAsc: 'desc'
    }
    const res = await getVillageDemandSummaryMainListSub(params)

    if (res.code === 200) {
      drillDown2Data.value = res.data?.list || []
      drillDown2Pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('Failed to load drill down 2 data:', error)
    ElMessage.error(t('stateAggregation.messages.loadFailed'))
  } finally {
    drillDown2Loading.value = false
  }
}

const handleDrillDown2SizeChange = () => {
  drillDown2Pagination.currentPage = 1
  loadDrillDown2Data()
}

const handleDrillDown2CurrentChange = () => {
  loadDrillDown2Data()
}

const handleDrillDown2Detail = async (row) => {
  drillDown2RecordDetail.value = row
  drillDown2RecordDetailVisible.value = true
  drillDown2AggregationData.value = []

  drillDown2AggregationLoading.value = true
  try {
    const res = await getTownAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })
    if (res.code === 200) {
      drillDown2AggregationData.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load aggregation data:', error)
    ElMessage.error(t('stateAggregation.detailDialog.loadFailed'))
  } finally {
    drillDown2AggregationLoading.value = false
  }
}

// ========== 第三层下钻 - Woreda -> Kebele ==========
const handleDrillDown3 = async (row) => {
  currentDrillDown3Row.value = row
  viewMode.value = 'drillDown3'
  drillDown3Pagination.currentPage = 1
  await loadDrillDown3Data()
}

const handleBackToDrillDown2 = () => {
  viewMode.value = 'drillDown2'
  currentDrillDown3Row.value = null
  drillDown3Data.value = []
}

const loadDrillDown3Data = async () => {
  if (!currentDrillDown3Row.value) return

  drillDown3Loading.value = true
  try {
    const params = {
      page: drillDown3Pagination.currentPage,
      pageSize: drillDown3Pagination.pageSize,
      targetCode: currentDrillDown3Row.value.sourceCode,
      year: currentDrillDown3Row.value.year,
      level: '0',
      orderByColumn: 'year',
      isAsc: 'desc'
    }
    const res = await getVillageDemandSummaryMainListSub(params)

    if (res.code === 200) {
      drillDown3Data.value = res.data?.list || []
      drillDown3Pagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('Failed to load drill down 3 data:', error)
    ElMessage.error(t('stateAggregation.messages.loadFailed'))
  } finally {
    drillDown3Loading.value = false
  }
}

const handleDrillDown3SizeChange = () => {
  drillDown3Pagination.currentPage = 1
  loadDrillDown3Data()
}

const handleDrillDown3CurrentChange = () => {
  loadDrillDown3Data()
}

const handleDrillDown3Detail = async (row) => {
  drillDown3RecordDetail.value = row
  drillDown3RecordDetailVisible.value = true
  activeDetailTab.value = 'aggregation'
  drillDown3AggregationData.value = []
  farmerDemandData.value = []

  // 重置搜索表单
  farmerSearchForm.farmerName = ''
  farmerSearchForm.farmerIdNumber = ''
  farmerSearchForm.status = ''
  farmerDemandPagination.currentPage = 1

  drillDown3AggregationLoading.value = true
  try {
    const res = await getVillageAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })
    if (res.code === 200) {
      drillDown3AggregationData.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load aggregation data:', error)
    ElMessage.error(t('stateAggregation.detailDialog.loadFailed'))
  } finally {
    drillDown3AggregationLoading.value = false
  }
}

// 标签页切换
const handleDetailTabChange = (tabName) => {
  if (tabName === 'farmers' && farmerDemandData.value.length === 0) {
    loadFarmerDemandData()
  }
}

// 加载农民需求数据
const loadFarmerDemandData = async () => {
  if (!drillDown3RecordDetail.value.sourceCode) return

  farmerDemandLoading.value = true
  try {
    const params = {
      page: farmerDemandPagination.currentPage, // 修正为 page
      pageSize: farmerDemandPagination.pageSize,
      kebele: drillDown3RecordDetail.value.sourceCode,
      year: drillDown3RecordDetail.value.year,
      farmerName: farmerSearchForm.farmerName || undefined,
      farmerIdNumber: farmerSearchForm.farmerIdNumber || undefined,
      status: farmerSearchForm.status || undefined,
      orderByColumn: 'createdTime',
      isAsc: 'desc'
    }

    const res = await getFarmerDemandPage(params)
    if (res.code === 200) {
      farmerDemandData.value = res.data?.records || []
      farmerDemandPagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('Failed to load farmer demand data:', error)
    ElMessage.error(t('stateAggregation.messages.loadFailed'))
  } finally {
    farmerDemandLoading.value = false
  }
}

// 农民需求搜索
const handleFarmerSearch = () => {
  farmerDemandPagination.currentPage = 1
  loadFarmerDemandData()
}

// 重置搜索
const handleFarmerSearchReset = () => {
  farmerSearchForm.farmerName = ''
  farmerSearchForm.farmerIdNumber = ''
  farmerSearchForm.status = ''
  farmerDemandPagination.currentPage = 1
  loadFarmerDemandData()
}

// 农民需求分页变化
const handleFarmerPageChange = () => {
  loadFarmerDemandData()
}

// 查看农民需求详情
const handleViewFarmerDemand = (row) => {
  // 保存当前下钻状态到 sessionStorage
  const navigationState = {
    viewMode: viewMode.value,
    kebeleCode: drillDown3RecordDetail.value.sourceCode,
    year: drillDown3RecordDetail.value.year,
    kebeleName: drillDown3RecordDetail.value.sourceName,
    woredaCode: currentDrillDown2Row.value?.sourceCode,
    woredaName: currentDrillDown2Row.value?.sourceName,
    zoneCode: currentDrillDownRow.value?.sourceCode,
    zoneName: currentDrillDownRow.value?.sourceName
  }
  sessionStorage.setItem('aggregation_nav_state', JSON.stringify(navigationState))

  router.push({
    name: 'DemandAuditDetail',
    params: { id: row.id },
    query: {
      returnPath: router.currentRoute.value.path
    }
  })
}

// 获取农民需求状态标签
const getFarmerStatusLabel = (status) => {
  const statusMap = {
    0: t('demandAudit.status.draft'),
    1: t('demandAudit.status.submitted'),
    2: t('demandAudit.status.approved'),
    3: t('demandAudit.status.rejected')
  }
  return statusMap[status] || '-'
}

// 获取农民需求状态类型
const getFarmerStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 分页变化
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 初始化
onMounted(() => {
  loadData()

  // 检查是否需要恢复下钻状态
  const savedState = sessionStorage.getItem('aggregation_nav_state')
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      sessionStorage.removeItem('aggregation_nav_state')

      if (state.viewMode === 'drillDown3' && state.kebeleCode) {
        // 设置下钻状态
        currentDrillDownRow.value = {
          sourceCode: state.zoneCode,
          sourceName: state.zoneName
        }
        currentDrillDown2Row.value = {
          sourceCode: state.woredaCode,
          sourceName: state.woredaName
        }
        drillDown3RecordDetail.value = {
          sourceCode: state.kebeleCode,
          year: state.year,
          sourceName: state.kebeleName
        }
        viewMode.value = 'drillDown3'

        // 加载数据并打开对话框
        loadDrillDown3Data().then(() => {
          setTimeout(() => {
            handleDrillDown3Detail(drillDown3RecordDetail.value)
            setTimeout(() => {
              activeDetailTab.value = 'farmers'
              loadFarmerDemandData()
            }, 100)
          }, 100)
        })
      }
    } catch (e) {
      console.error('Failed to restore navigation state:', e)
      sessionStorage.removeItem('aggregation_nav_state')
    }
  }
})

// Unified Action Button Handlers
const mapWorkflowStatus = (status) => {
  const map = {
    '0': 'S0', // Draft
    '1': 'S1', // Pending
    '2': 'S2', // Approved
    '3': 'S3'  // Rejected
  }
  return map[status] || 'S0'
}

const getMainTableButtons = (row) => {
  const buttons = [
    { type: 'primary', action: 'audit', label: 'stateAggregation.actions.approve', icon: 'ri-file-list-3-line' }
  ]

  buttons.push({ type: 'primary', action: 'view', rawLabel: t('Aggregation detail'), icon: 'ri-list-check' })
  buttons.push({ type: 'success', action: 'export', rawLabel: t('common.export'), icon: 'ri-download-line' })

  return buttons
}

const handleAction = (row, action) => {
  switch (action) {
    case 'audit':
      handleApprove(row)
      break
    case 'view':
      handleDetail(row)
      break
    case 'export':
      handleExport(row)
      break
  }
}

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const downloadCsv = (content, filename) => {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const normalizeSeasonValue = (value) => String(value ?? '').trim().toLowerCase()

const getSeasonFilterCandidates = (selectedSeason) => {
  const selected = options.value.agri_season?.find((item) => String(item.value) === String(selectedSeason))
  return new Set([
    selectedSeason,
    selected?.actualValue,
    selected?.label
  ].filter(Boolean).map(normalizeSeasonValue))
}

const matchesSelectedSeason = (item, selectedSeason) => {
  if (!selectedSeason) return true
  const filterCandidates = getSeasonFilterCandidates(selectedSeason)
  const recordSeason = item.season ?? item.seasonCode ?? item.season_code
  const recordCandidates = new Set([
    recordSeason,
    getSeasonLabel(recordSeason)
  ].filter(Boolean).map(normalizeSeasonValue))
  return [...recordCandidates].some((candidate) => filterCandidates.has(candidate))
}

const handleExport = async (row) => {
  try {
    const res = await getTownAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })

    if (res.code !== 200) {
      ElMessage.error(res.msg || t('stateAggregation.detailDialog.loadFailed'))
      return
    }

    const selectedSeason = exportFilters.season
    const records = (res.data || []).filter((item) => matchesSelectedSeason(item, selectedSeason))
    if (!records.length) {
      ElMessage.warning(t('stateAggregation.detailDialog.noData'))
      return
    }

    const csvContent = [
      ['Region Name', t('stateAggregation.detailDialog.columns.inputCategory'), t('stateAggregation.detailDialog.columns.inputType'), t('farmerDemand.form.season'), t('farmerDemand.form.variety'), t('stateAggregation.detailDialog.columns.totalQuantity')],
      ...records.map((item) => [
        row.sourceName || '-',
        getLabelByValue('input_category', item.inputCategory) || item.inputCategory || '-',
        getLabelByValue('input_type', item.inputType) || item.inputType || '-',
        getSeasonLabel(item.season || item.seasonCode || item.season_code),
        item.variety || '-',
        getEffectiveQuantity(item)
      ])
    ].map((csvRow) => csvRow.map(escapeCsvCell).join(',')).join('\n')

    const safeName = (row.sourceName || 'region-aggregation').replace(/[\\/:*?"<>|]/g, '_')
    const seasonLabel = selectedSeason ? (getLabelByValue('agri_season', selectedSeason) || selectedSeason) : 'all-seasons'
    const safeSeasonLabel = seasonLabel.replace(/[\\/:*?"<>|\s]/g, '_')
    downloadCsv(csvContent, `${safeName}-${row.year}-${safeSeasonLabel}-aggregation-results.csv`)
    ElMessage.success(t('common.success'))
  } catch (error) {
    console.error('Failed to export aggregation results:', error)
    ElMessage.error(t('stateAggregation.detailDialog.loadFailed'))
  }
}

const getDrillDownButtons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' }
  ]
}

const handleDrillDownAction = (row, action) => {
  if (action === 'view') {
    handleDrillDownDetail(row)
  }
}

const getDrillDown2Buttons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' }
  ]
}

const handleDrillDown2Action = (row, action) => {
  if (action === 'view') {
    handleDrillDown2Detail(row)
  }
}

const getDrillDown3Buttons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' }
  ]
}

const handleDrillDown3Action = (row, action) => {
  if (action === 'view') {
    handleDrillDown3Detail(row)
  }
}

const getFarmerDemandButtons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' }
  ]
}

const handleFarmerDemandAction = (row, action) => {
  if (action === 'view') {
    handleViewFarmerDemand(row)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';

.drill-down-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eba4a4;
}

.aggregation-result-section {
  margin-top: 24px;
}

.aggregation-result-section .section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #009A44;
}

.filter-bar {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}
</style>
