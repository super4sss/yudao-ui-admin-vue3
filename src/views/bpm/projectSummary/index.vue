<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="82px"
    >
      <el-form-item label="项目编号" prop="projectNumber">
        <el-input
          v-model="queryParams.projectNumber"
          placeholder="请输入项目编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="立项时间" prop="projectApprovalTime">
        <el-date-picker
          v-model="queryParams.projectApprovalTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="报告撰写人" prop="reportWriter">
        <el-input
          v-model="queryParams.reportWriter"
          placeholder="请输入报告撰写人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="审批节点" prop="approvalNode">
        <!--        <el-input-->
        <!--          v-model="queryParams.approvalNode"-->
        <!--          placeholder="请输入审批节点"-->
        <!--          clearable-->
        <!--          @keyup.enter="handleQuery"-->
        <!--          class="!w-240px"-->
        <!--        />-->
        <el-select
          v-model="queryParams.approvalNode"
          placeholder="请输入审批节点"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        >
          <el-option
            v-for="(value, key) of approvalNodeList"
            :label="value"
            :value="key"
            :key="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['bpm:project-summary:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['bpm:project-summary:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="项目编号" align="center" prop="projectNumber" />
      <el-table-column label="项目名称" align="center" prop="projectName" width="400px" />
      <el-table-column
        label="立项时间"
        align="center"
        prop="projectApprovalTime"
        :formatter="dateFormatter"
        width="300px"
      />
      <el-table-column label="报告撰写人" align="center" prop="reportWriter" />
      <el-table-column label="审批节点" align="center" prop="approvalNode" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleAudit(scope.row)">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ProjectSummaryForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as ProjectSummaryApi from '@/api/bpm/projectSummary'
import ProjectSummaryForm from './ProjectSummaryForm.vue'

defineOptions({ name: 'ProjectSummary' })

const { push } = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  projectNumber: null,
  projectName: null,
  projectApprovalTime: [],
  reportWriter: null,
  approvalNode: null
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const approvalNodeList = ref({
  填写立项信息: '填写立项信息',
  一审项目撰写: '一审项目撰写',
  一审审批: '一审审批',
  二审项目撰写: '二审项目撰写',
  二审审批: '二审审批',
  三审项目撰写: '三审项目撰写',
  三审审批: '三审审批',
  填写报告信息: '填写报告信息',
  填写打印用印申请信息: '填写打印用印申请信息',
  打印用印审批: '打印用印审批',
  归档: '归档',
  填写开票申请信息: '填写开票申请信息',
  开票: '开票',
  收款: '收款'
}) // 用户列表

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProjectSummaryApi.getProjectSummaryPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ProjectSummaryApi.deleteProjectSummary(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ProjectSummaryApi.exportProjectSummary(queryParams)
    download.excel(data, '项目管理.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
/** 处理审批按钮 */
const handleAudit = (row) => {
  console.log(row)
  push({
    name: 'BpmProcessInstanceDetail',
    query: {
      id: row.instanceId1
    }
  })
}
/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
