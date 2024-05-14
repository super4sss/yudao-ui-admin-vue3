import request from '@/config/axios'

export type TaskVO = {
  id: number
}
export type RollbackNodesVO = {
  RollbackNodesMap: Map<String, Object>
}
export const getTodoTaskPage = async (params) => {
  return await request.get({ url: '/bpm/task/todo-page', params })
}

export const getDoneTaskPage = async (params) => {
  return await request.get({ url: '/bpm/task/done-page', params })
}

export const completeTask = async (data) => {
  return await request.put({ url: '/bpm/task/complete', data })
}

export const approveTask = async (data) => {
  return await request.put({ url: '/bpm/task/approve', data })
}

export const rejectTask = async (data) => {
  return await request.put({ url: '/bpm/task/reject', data })
}
export const rollback = async (data) => {
  return await request.put({ url: '/bpm/task/rollback', data })
}
export const updateFormValue = async (data) => {
  return await request.put({ url: '/bpm/task/updateFormValue', data })
}
// export const getRollbackNodes = async (data) => {
//   return await request.put({ url: '/bpm/task/rollbackNodes', data })
// }
// export const getRollbackNodes = async (data): Promise<RollbackNodesVO['RollbackNodesMap']> => {
// export const getRollbackNodes = async (data) => {
//   // console.log(data)
//   return await request.get({ url: '/bpm/task/rollbackNodes', data })
// }
export const getRollbackNodes = async (data) => {
  console.log(data)
  return await request.post({
    url: '/bpm/task/rollbackNodes',
    data
  })
}
export const updateTaskAssignee = async (data) => {
  console.log(data)
  return await request.put({ url: '/bpm/task/update-assignee', data })
}

export const getTaskListByProcessInstanceId = async (processInstanceId) => {
  return await request.get({
    url: '/bpm/task/list-by-process-instance-id?processInstanceId=' + processInstanceId
  })
}

export const getTaskFormPermHidden = async (taskDefinitionKey) => {
  return await request.get({
    url: '/bpm/task-form-perm/get-hidden?taskDefinitionKey=' + taskDefinitionKey
  })
}
export const getTaskFormPermDisabled = async (taskDefinitionKey) => {
  return await request.get({
    url: '/bpm/task-form-perm/get-disabled?taskDefinitionKey=' + taskDefinitionKey
  })
}
export const getTaskFormPerm = async (taskDefinitionKey) => {
  return await request.get({
    url: '/bpm/task-form-perm/get?taskDefinitionKey=' + taskDefinitionKey
  })
}

// 导出任务
export const exportTask = async (params) => {
  return await request.download({ url: '/bpm/task/export', params })
}
