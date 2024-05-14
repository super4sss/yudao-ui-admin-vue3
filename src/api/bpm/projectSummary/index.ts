import request from '@/config/axios'
export interface ProjectSummaryVO {
  address: string
}

// 查询项目管理列表
export const getProjectSummaryPage = async (params) => {
  return await request.get({ url: `/bpm/project-summary/page`, params })
}

// 查询项目管理详情
export const getProjectSummary = async (id: number) => {
  return await request.get({ url: `/bpm/project-summary/get?id=` + id })
}

// 新增项目管理
export const createProjectSummary = async (data: ProjectSummaryVO) => {
  return await request.post({ url: `/bpm/project-summary/create`, data })
}

// 修改项目管理
export const updateProjectSummary = async (data: ProjectSummaryVO) => {
  return await request.put({ url: `/bpm/project-summary/update`, data })
}

// 删除项目管理
export const deleteProjectSummary = async (id: number) => {
  return await request.delete({ url: `/bpm/project-summary/delete?id=` + id })
}

// 导出项目管理 Excel
export const exportProjectSummary = async (params) => {
  return await request.download({ url: `/bpm/project-summary/export-excel`, params })
}
