<template>
  <Dialog v-model="dialogVisible" title="退回" width="500">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-form-item label="选择节点" prop="assigneeUserId">
        <el-select v-model="formData.assigneeUserId" clearable style="width: 100%">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as TaskApi from '@/api/bpm/task'
// import * as UserApi from '@/api/system/user'

defineOptions({ name: 'BpmTaskUpdateAssigneeForm' })

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const formData = ref({
  id: '',
  assigneeUserId: undefined
})
const formRules = ref({
  assigneeUserId: [{ required: true, message: '新审批人不能为空', trigger: 'change' }]
})

const formRef = ref() // 表单 Ref
const options = ref<any[]>([]) // 用户列表

/** 打开弹窗 */
const open = async (id: string) => {
  dialogVisible.value = true
  resetForm()
  formData.value.id = id
  // 获得用户列表
  // const data = formData.value as TaskApi.
  const nodes = await TaskApi.getRollbackNodes(formData.value)
  options.value = Object.keys(nodes['RollbackNodesMap']).map((key) => {
    return {
      label: nodes[key],
      value: key
    }
  })
}
defineExpose({ open }) // 提供 openModal 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    await TaskApi.rollback(formData.value)
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: '',
    assigneeUserId: undefined
  }
  formRef.value?.resetFields()
}
</script>

<!-- <template>
  <el-dialog
    ref="formRef"
    destroy-on-close
    title="退回到之前节点"
    v-model:visible="show"
    width="500px"
    v-bind="$attrs"
    v-on="$attrs"
    @close="handleCancel"
    :close-on-click-modal="false"
    @opened="handleOpen"
  >
    <el-form v-loading="loading" ref="formRef" :model="formValue" :rules="rules">
      <el-form-item label="回退节点" prop="rollbackId" required>
        <el-select size="small" v-model="formValue.rollbackId" placeholder="选择要回退到的节点">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item prop="comments">
        <el-input
          type="textarea"
          v-model="formValue.comments"
          placeholder="退回意见"
          maxlength="255"
          rows="4"
          show-word-limit
        />
      </el-form-item>
      <el-form-item>
        <image-upload v-model="formValue.imageList" />
      </el-form-item>
      <el-form-item>
        <file-upload v-model="formValue.fileList" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button size="mini" @click="handleCancel">取 消</el-button>
      <el-button size="mini" type="primary" :loading="loading" @click="handleConfirm"
        >提 交</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
// import { rollback, getRollbackNodes } from '@/api/bpm/task'
// // import ImageUpload from './ImageUpload'
// // import FileUpload from './FileUpload'
// const formRef = ref() // 表单 Ref
// /** 打开弹窗 */
// const open = async (id) => {
//   dialogVisible.value = true
//   resetForm()
//   formData.value.id = id
//   // 获得用户列表
//   userList.value = await UserApi.getSimpleUserList()
// }
// defineExpose({ open }) // 提供 openModal 方法，用于打开弹窗
// export default {
//   name: 'RollbackModal',
//   // components: { ImageUpload, FileUpload },
//   props: {
//     // 是否显示
//     visible: {
//       type: Boolean,
//       default: false
//     },
//     processInfo: {
//       type: Object,
//       default: () => ({})
//     }
//   },
//   data() {
//     return {
//       loading: false,
//       formValue: {
//         rollbackId: '',
//         comments: '',
//         imageList: [],
//         fileList: []
//       },
//       options: [],
//       rules: {
//         rollbackId: [
//           {
//             required: true,
//             message: '请选择要回退到的节点',
//             trigger: 'change'
//           }
//         ]
//       }
//     }
//   },
//   computed: {
//     show: {
//       get() {
//         return this.visible
//       },
//       set(visible) {
//         this.$emit('update:visible', visible)
//       }
//     }
//   },
//   methods: {
//     // 确认操作
//     handleConfirm() {
//       this.$refs.formRef.validate((valid) => {
//         if (!valid) return
//         const { imageList, fileList, ...restParams } = this.formValue
//         const params = {
//           ...this.processInfo,
//           ...restParams,
//           attachments: [...imageList, ...fileList]
//         }
//         this.loading = true
//         rollback(params)
//           .then(() => {
//             this.$message.success('操作成功')
//             this.handleCancel()
//             this.$emit('success')
//           })
//           .finally(() => {
//             this.loading = false
//           })
//       })
//     },
//     // 取消操作
//     handleCancel() {
//       this.$refs.formRef.resetFields()
//       this.formValue = {
//         rollbackId: '',
//         comments: '',
//         imageList: [],
//         fileList: []
//       }
//       this.options = []
//       this.show = false
//     },
//     // 打开弹框操作
//     handleOpen() {
//       const { processInstanceId, taskId } = this.processInfo
//       getRollbackNodes({ processInstanceId, taskId }).then((res) => {
//         const nodes = res.data.result || {}
//         this.options = Object.keys(nodes).map((key) => {
//           return {
//             label: nodes[key],
//             value: key
//           }
//         })
//       })
//     }
//   }
// }
</script> -->
