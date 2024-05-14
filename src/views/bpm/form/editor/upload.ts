import { UploadProps } from 'element-plus'
import * as FormApi from '@/api/bpm/form'
import formCreate from '@form-create/element-ui'
// import formCreate from '@form-create/element-ui'
import { getAccessToken } from '@/utils/auth'
const uploadUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/bpm/process-instance/upload'
const HEADERS = { Authorization: 'Bearer ' + getAccessToken() } // 设置上传的请求头部
const fileList = ref<String>([])
const handleFileUpload: UploadProps['httpRequest'] = async (res: any) => {
  console.log(uploadUrl)
  this.props().headers = HEADERS
  const data = await FormApi.upload(res.file)
}

const label = ' 自定义上传'
const name = 'upload1'
let i = 1

const uniqueId = () => `uni${i++}`
const upload = {
  //拖拽组件的图标
  icon: 'icon-upload',
  //拖拽组件的名称
  label,
  //拖拽组件的 key
  name,
  //拖拽组件的生成规则
  rule() {
    //如果在 props 方法中需要修改 rule 的属性,需要提前在 rule 上定义对应的属性
    return {
      //生成组件的名称
      type: name,
      //field 自定不能重复,所以这里每次都会生成一个新的
      field: uniqueId(),
      title: label,
      value: fileList,
      info: '',
      effect: {
        fetch: ''
      },
      //这里设置组件的默认props配置项, 在下面的 props 方法里面设置无效
      props: {
        httpRequest: handleFileUpload,
        // action: 'http://localhost:48080/admin-api/bpm/process-instance/upload',
        action: uploadUrl,
        'list-type': 'text',
        // http:uploadrequest,
        headers: HEADERS,
        fileList: fileList,
        name: 'file',
        multiple: true,
        value: fileList,
        // accept:"image\/*",
        limit: 9,
        onSuccess: function (res, file, filelist) {
          console.log('res: ', res)
          console.log('file: ', file)
          console.log('fileList: ', filelist)
          console.log(this.headers)
          this.fileList.value = []
          file.url = res.data
          this.fileList.push(file)
          console.log(file)
          // console.log(formCreate.toJson(designer.value.getRule()))
        },
        onPreview: function (file) {
          const link = document.createElement('a')
          link.download = file.name
          link.href = file.url
          link.click()
          // window.URL.revokeObjectURL(link.href)
        }
        // beforeUpload: function (file) {
        //   this.headers = { Authorization: 'Bearer ' + getAccessToken() }
        // }
        // withCredentials: false,
        // headers: {
        //   'x-requested-with': null
        // }
      },
      options: [
        // { value: '1', label: '选项1' },
        // { value: '2', label: '选项2' },
        // { value: '3', label: 'test3' }
      ]
    }
  },
  //拖拽组件配置项(props)的生成规则
  props() {
    return [
      //生成`checkbox`组件的`options`配置规则
      // FcDesigner.makeOptionsRule('options'),
      // {
      //   type: 'switch',
      //   field: 'type',
      //   title: '按钮类型',
      //   props: { activeValue: 'button', inactiveValue: 'default' }
      // },
      // { type: 'switch', field: 'disabled', title: '是否禁用' },
      // {
      //   type: 'inputNumber',
      //   field: 'min',
      //   title: '可被勾选的 checkbox 的最小数量'
      // },
      // { type: 'inputNumber', field: 'max', title: '可被勾选的 checkbox 的最大数量' },
      // {
      //   type: 'input',
      //   field: 'textColor',
      //   title: '按钮形式的 Checkbox 激活时的文本颜色'
      // },
      // { type: 'input', field: 'fill', title: '按钮形式的 Checkbox 激活时的填充色和边框色' }
    ]
  }
}
export default upload
