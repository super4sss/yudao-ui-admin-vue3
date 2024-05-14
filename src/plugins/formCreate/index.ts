import type { App } from 'vue'

import { service } from '@/config/axios/service' // 对应你项目中的拦截器配置文件
// 👇使用 form-create 需额外全局引入 element plus 组件
import {
  ElAside,
  ElPopconfirm,
  ElHeader,
  ElMain,
  ElContainer,
  ElDivider,
  ElTransfer,
  ElAlert,
  ElTabs,
  ElTable,
  ElTableColumn,
  ElTabPane
} from 'element-plus'

import formCreate from '@form-create/element-ui'
import install from '@form-create/element-ui/auto-import'

const components = [
  ElAside,
  ElPopconfirm,
  ElHeader,
  ElMain,
  ElContainer,
  ElDivider,
  ElTransfer,
  ElAlert,
  ElTabs,
  ElTable,
  ElTableColumn,
  ElTabPane
]

// 参考 http://www.form-create.com/v3/element-ui/auto-import.html 文档
export const setupFormCreate = (app: App<Element>) => {
  components.forEach((component) => {
    app.component(component.name, component)
  })

  interface Option {
    action: string
    method?: AxiosMethod
    data?: object
    dataType?: object
    headers?: object
    withCredentials?: boolean
    onSuccess: (body: any) => void
    onError?: (e: Error | ProgressEvent) => void
    _parse?: string
  }

  // 第一个是原fetch用到的option，第二个没找到源码中引用的地方不知道有什么用
  const overrideFetch = (option: Option, effectArgs) => {
    // console.log('--fetch option--', option)

    service({
      url: option.action,
      method: option.method,
      data: option.data,
      headers: option.headers,
      withCredentials: option.withCredentials
    })
      .then((res) => {
        console.log(option.data)
        try {
          if (option._parse) {
            // 使用内置 api 处理解析函数字符串转化为 函数类型
            const parseFn = formCreate.parseFn(option._parse)
            res.data = parseFn(res)
          }
        } catch (e) {
          console.log('--parseFn error--', e)
        }
        option.onSuccess?.(res)
      })
      .catch((e) => {
        option.onError?.(e)
      })

    return option
  }

  // 重写 fetch 请求方法，select 等动态获取数据请求通过拦截器
  // @ts-ignore
  formCreate.fetch = overrideFetch
  formCreate.use(install)
  app.use(formCreate)
}
