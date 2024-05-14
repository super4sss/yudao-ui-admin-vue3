<template>
  <ContentWrap>
    <!-- 申请信息 -->
    <el-card v-loading="processInstanceLoading" class="box-card">
      <template #header>
        <span class="el-icon-document">申请信息【{{ processInstance.name }}】</span>
      </template>
      <!-- 情况一：流程表单 -->
      <el-col v-if="processInstance?.processDefinition?.formType === 10" :offset="6" :span="16">
        <form-create
          ref="fApi"
          v-model="detailForm.value"
          :option="detailForm.option"
          :rule="detailForm.rule"
        />
      </el-col>
      <!-- 情况二：业务表单 -->
      <div v-if="processInstance?.processDefinition?.formType === 20">
        <BusinessFormComponent :id="processInstance.businessKey" />
      </div>
    </el-card>
    <!-- 审批信息 -->
    <el-card
      v-for="(item, index) in runningTasks"
      :key="index"
      v-loading="processInstanceLoading"
      class="box-card"
    >
      <template #header>
        <span class="el-icon-picture-outline">审批任务【{{ item.name }}】</span>
      </template>
      <el-col :offset="6" :span="16">
        <!--        <el-form-->
        <!--          :ref="'form' + index"-->
        <!--          :model="auditForms[index]"-->
        <!--          :rules="auditRule"-->
        <!--          label-width="100px"-->
        <!--        >-->
        <el-form :ref="'form' + index" :model="auditForms[index]" label-width="100px">
          <el-form-item v-if="processInstance && processInstance.name" label="流程名">
            {{ processInstance.name }}
          </el-form-item>
          <el-form-item v-if="processInstance && processInstance.startUser" label="流程发起人">
            {{ processInstance.startUser.nickname }}
            <el-tag size="small" type="info">{{ processInstance.startUser.deptName }}</el-tag>
          </el-form-item>
          <!--          <el-form-item label="审批建议" prop="reason">-->
          <!--            <el-input-->
          <!--              v-model="auditForms[index].reason"-->
          <!--              placeholder="请输入审批建议"-->
          <!--              type="textarea"-->
          <!--            />-->
          <!--          </el-form-item>-->
        </el-form>
        <div style="margin-bottom: 20px; margin-left: 10%; font-size: 14px">
          <el-button type="success" @click="handleAudit(item, true)">
            <Icon icon="ep:select" />
            {{ buttonName }}
          </el-button>
          <!--          <el-button type="danger" @click="handleAudit(item, false)">-->
          <!--            <Icon icon="ep:close" />-->
          <!--            不通过-->
          <!--          </el-button>-->
          <!--          <el-button type="primary" @click="openTaskUpdateAssigneeForm(item.id)">-->
          <!--            <Icon icon="ep:edit" />-->
          <!--            转办-->
          <!--          </el-button>-->
          <!--          <el-button type="primary" @click="handleDelegate(item)">-->
          <!--            <Icon icon="ep:position" />-->
          <!--            委派-->
          <!--          </el-button>-->
          <el-button type="warning" @click="handleBack(item.id, detailForm.value)">
            <Icon icon="ep:back" />
            回退
          </el-button>
        </div>
      </el-col>
    </el-card>

    <!-- 审批记录 -->
    <ProcessInstanceTaskList :loading="tasksLoad" :tasks="tasks" />

    <!-- 高亮流程图 -->
    <ProcessInstanceBpmnViewer
      :id="`${id}`"
      :bpmn-xml="bpmnXML"
      :loading="processInstanceLoading"
      :process-instance="processInstance"
      :tasks="tasks"
    />

    <!-- 弹窗：转派审批人 -->
    <TaskUpdateAssigneeForm ref="taskUpdateAssigneeFormRef" @success="getDetail" />
    <!-- 弹窗：退回 -->
    <TaskRollback ref="taskRollbackRef" @success="getDetail" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { useUserStore } from '@/store/modules/user'
import { setConfAndFields2 } from '@/utils/formCreate'
import type { ApiAttrs } from '@form-create/element-ui/types/config'
import * as DefinitionApi from '@/api/bpm/definition'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import * as TaskApi from '@/api/bpm/task'
import TaskUpdateAssigneeForm from './TaskUpdateAssigneeForm.vue'
import TaskRollback from './TaskRollback.vue'
import ProcessInstanceBpmnViewer from './ProcessInstanceBpmnViewer.vue'
import ProcessInstanceTaskList from './ProcessInstanceTaskList.vue'
import { registerComponent } from '@/utils/routerHelper'
import { getAccessToken } from '@/utils/auth'
import { nextTick } from 'vue'
import { getTaskFormPermHidden } from '@/api/bpm/task'

defineOptions({ name: 'BpmProcessInstanceDetail' })

const { query } = useRoute() // 查询参数
const message = useMessage() // 消息弹窗
const { proxy } = getCurrentInstance() as any

const userId = useUserStore().getUser.id // 当前登录的编号
const id = query.id as unknown as number // 流程实例的编号
const processInstanceLoading = ref(false) // 流程实例的加载中
const processInstance = ref<any>({}) // 流程实例
const buttonName = ref('')
const bpmnXML = ref('') // BPMN XML
const tasksLoad = ref(true) // 任务的加载中
const tasks = ref<any[]>([]) // 任务列表
// ========== 审批信息 ==========
const runningTasks = ref<any[]>([]) // 运行中的任务
const auditForms = ref<any[]>([]) // 审批任务的表单
// const auditRule = reactive({
//   reason: [{ required: true, message: '审批建议不能为空', trigger: 'blur' }]
// })
// ========== 申请信息 ==========
const fApi = ref<ApiAttrs>() //
const uploadUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/bpm/process-instance/detail'
const detailForm = ref({
  // 流程表单详情
  rule: [],
  option: {},
  value: {}
  // onSuccess:function (res, file) {
  //   file.url = res.data.filePath;
  // }
})
const validate = ref()
/** 处理审批通过和不通过的操作 */
const handleAudit = async (task, pass) => {
  // 1.1 获得对应表单
  const index = runningTasks.value.indexOf(task)
  const auditFormRef = proxy.$refs['form' + index][0]
  // 1.2 校验表单
  const elForm = unref(auditFormRef)
  // console.log(elForm)
  // await Promise.all([
  //   fApi.value?.fapi?.updateValidates('Fgm21odhinbglh', [{ required: false }], true),
  //   fApi.value?.fapi?.refreshValidate(),
  //   fApi.value?.fapi?.validate((valid, fail) => {
  //     if (valid === true) {
  //       console.log(valid)
  //       validate.value = true
  //     } else {
  //       validate.value = false
  //       console.log(valid)
  //     }
  //   })
  // ])
  await Promise.all([
    fApi.value?.fapi?.validate((valid, fail) => {
      // auditFormRef.validate((valid, fail) => {
      if (valid === true) {
        console.log(valid)
        validate.value = true
      } else {
        validate.value = false
        console.log(valid)
      }
    })
  ])
  if (!validate.value) return
  if (!elForm) return
  const valid = await elForm.validate()
  console.log(valid)
  if (!valid) return
  // 2.1 提交审批
  const data = {
    id: task.id,
    reason: auditForms.value[index].reason,
    formVariables: detailForm.value.value,
    assigneeUserId: ''
  }
  //设置自选审批人
  if (
    task.name == '填写立项信息' ||
    task.name == '一审项目撰写' ||
    task.name == '二审项目撰写' ||
    task.name == '三审项目撰写'
  ) {
    if (
      !isEmptyObj(fApi.value?.fapi?.getRule('Fvwp1o3zt3v0i1')?.value) &&
      task.name == '填写立项信息'
    ) {
      // data.assigneeUserId = fApi.value?.fapi?.getRule('Fvwp1o3zt3v0i1').value
    } else if (
      !isEmptyObj(fApi.value?.fapi?.getRule('Fgjd1o3ztfaaam')?.value) &&
      task.name == '一审项目撰写'
    ) {
      data.assigneeUserId = fApi.value?.fapi?.getRule('Fgjd1o3ztfaaam')?.value
    } else if (
      !isEmptyObj(fApi.value?.fapi?.getRule('Frin1o3ztfljpa')?.value) &&
      task.name == '二审项目撰写'
    ) {
      data.assigneeUserId = fApi.value?.fapi?.getRule('Frin1o3ztfljpa')?.value
    } else if (
      !isEmptyObj(fApi.value?.fapi?.getRule('Fr7q1o3ztfidi3')?.value) &&
      task.name == '三审项目撰写'
    ) {
      data.assigneeUserId = fApi.value?.fapi?.getRule('Fr7q1o3ztfidi3')?.value
    }
  }
  if (pass) {
    // await TaskApi.updateFormValue(data)
    await TaskApi.approveTask(data)
    message.success('审批通过成功')
  } else {
    await TaskApi.rejectTask(data)
    message.success('审批不通过成功')
  }
  // 2.2 加载最新数据
  getDetail()
}

/** 转派审批人 */
const taskUpdateAssigneeFormRef = ref()
const openTaskUpdateAssigneeForm = (id: string) => {
  // console.log(id)
  taskUpdateAssigneeFormRef.value.open(id)
}

/** 处理审批退回的操作 */
const handleDelegate = async (task) => {
  message.error('暂不支持【委派】功能，可以使用【转派】替代！')
  console.log(task)
}

/** 处理审批退回的操作 */
// const handleBack = async (task) => {
//   message.error('暂不支持【退回】功能！')
//   console.log(task)
// }
/** 处理审批退回的操作 */
const taskRollbackRef = ref()
const handleBack = (id: string, formVariables: object) => {
  console.log(id)
  console.log(formVariables)
  taskRollbackRef.value.open(id, formVariables)
}

/** 获得详情 */
const getDetail = () => {
  // 1. 获得流程实例相关
  getProcessInstance()
  // 2. 获得流程任务列表（审批记录）
  getTaskList()
}

/** 加载流程实例 */
const BusinessFormComponent = ref(null) // 异步组件
const getProcessInstance = async () => {
  try {
    processInstanceLoading.value = true
    const data = await ProcessInstanceApi.getProcessInstance(id)
    console.log(runningTasks)
    // console.log(runningTasks.value[0].definitionKey)

    // console.log(hidden)

    if (!data) {
      message.error('查询不到流程信息！')
      return
    }
    processInstance.value = data

    // 设置表单信息
    const processDefinition = data.processDefinition
    if (processDefinition.formType === 10) {
      // console.log(detailForm.value.rule.replaceAll('\\', ''))
      setConfAndFields2(
        detailForm,
        processDefinition.formConf,
        processDefinition.formFields,
        data.formVariables
      )
      nextTick().then(() => {
        fApi.value?.fapi?.fields().forEach((item) => {
          // console.log(item)
          fApi.value?.fapi?.mergeRule(item, {
            props: { headers: { Authorization: 'Bearer ' + getAccessToken() } },
            effect: { fetch: { headers: { Authorization: 'Bearer ' + getAccessToken() } } }
            // effect: { fetch: { headers: { Authorization: 'Bearer ' } } }
          })
        })
        fApi.value?.fapi?.fields().forEach((item) => {
          // console.log(fApi.value?.fapi?.getRule(item))
          fApi.value?.fapi?.updateRule(item, {
            // props: { fApi.value?.fapi?.getRule(item).props } },
            effect: fApi.value?.fapi?.getRule(item).effect,
            options: fApi.value?.fapi?.getRule(item).options
          })
        })

        // console.log(fApi.value?.fapi?.getRule('Ftly60xqisgsx'))
        // console.log(fApi.value)
        // fApi.value?.fapi?.disabled(true, 'Feougqnxo43eo9')
        fApi.value?.fapi?.reload()
        fApi.value?.refresh()
        // fApi.value?.fapi?.sync('Ftly60xqisgsx')
        // fApi.value?.fapi?.updateRule('')

        //
        fApi.value?.fapi?.btn.show(false)
        fApi.value?.fapi?.resetBtn.show(false)
        // fApi.value?.fapi?.disabled(true)
        fApi.value?.fapi?.disabled(false)
        // fApi.value?.fapi?.disabled(true, ['Feougqnxo43eo9', 'Fwwdgqnyejk5fz'])
      })
    } else {
      BusinessFormComponent.value = registerComponent(data.processDefinition.formCustomViewPath)
    }

    // 加载流程图
    bpmnXML.value = await DefinitionApi.getProcessDefinitionBpmnXML(processDefinition.id as number)
  } finally {
    processInstanceLoading.value = false
  }
}

/** 加载任务列表 */
const getTaskList = async () => {
  try {
    // 获得未取消的任务
    tasksLoad.value = true
    const data = await TaskApi.getTaskListByProcessInstanceId(id)
    tasks.value = []
    // 1.1 移除已取消的审批
    data.forEach((task) => {
      if (task.result !== 4) {
        tasks.value.push(task)
      }
    })
    // 1.2 排序，将未完成的排在前面，已完成的排在后面；
    tasks.value.sort((a, b) => {
      // 有已完成的情况，按照完成时间倒序
      if (a.endTime && b.endTime) {
        return b.endTime - a.endTime
      } else if (a.endTime) {
        return 1
      } else if (b.endTime) {
        return -1
        // 都是未完成，按照创建时间倒序
      } else {
        return b.createTime - a.createTime
      }
    })
    console.log(tasks.value)
    tasksLoad.value = false
    console.log(tasksLoad.value)

    // 获得需要自己审批的任务
    runningTasks.value = []
    auditForms.value = []
    buttonName.value = ''
    tasks.value.forEach((task) => {
      // 2.1 只有待处理才需要
      if (task.result !== 1) {
        return
      }
      // 2.2 自己不是处理人
      if (!task.assigneeUser || task.assigneeUser.id !== userId) {
        return
      }
      // 2.3 添加到处理任务
      runningTasks.value.push({ ...task })
      auditForms.value.push({
        reason: ''
      })
    })
  } finally {
    if (!isEmptyObj(runningTasks.value[0])) {
      console.log(1)
      const res = await TaskApi.getTaskFormPerm(runningTasks.value[0].definitionKey)
      const hidden = res.formPermHidden
      const disabled = res.formPermDisabled
      buttonName.value = res.buttonName
      // console.log(res.formPermHidden)
      // const disabled = await TaskApi.getTaskFormPermDisabled(runningTasks.value[0].definitionKey)
      if (!isEmptyObj(hidden)) {
        fApi.value?.fapi?.hidden(true, hidden)
      }
      if (!isEmptyObj(disabled)) {
        fApi.value?.fapi?.disabled(true, disabled)
      }
      tasksLoad.value = false
      fApi.value?.fapi?.updateValidates({ Fepagp3yq5dazj: [{ required: false }] })
      fApi.value?.fapi?.refreshValidate()
    } else {
      console.log(0)
      fApi.value?.fapi?.disabled()
    }
  }
}
nextTick(() => {
  console.log(detailForm)
  fApi.value?.fapi?.reload()
})
function isEmptyObj(x) {
  if (
    typeof x == 'undefined' ||
    x == null ||
    x == false || //类似: !x
    x.length == 0 ||
    x == 0 || // 这里是判断 0，不需要刻意去掉
    x == '' ||
    (typeof x === 'number' && window.isNaN(x)) ||
    (!x && typeof x != 'undefined' && x != 0) ||
    // (x.replace(/\s/g, "") == "")
    // ||
    !/[^\s]/.test(x) ||
    /^\s*$/.test(x)
  ) {
    return true
  } else {
    return false
  }
}
/** 初始化 */
onMounted(() => {
  getDetail()
})
</script>
