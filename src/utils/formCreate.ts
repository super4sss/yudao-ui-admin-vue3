/**
 * 针对 https://github.com/xaboy/form-create-designer 封装的工具类
 */
import formCreate from '@form-create/element-ui'
// 编码表单 Conf
export const encodeConf = (designerRef: object) => {
  // @ts-ignore
  return JSON.stringify(designerRef.value.getOption())
}

// 编码表单 Fields
export const encodeFields = (designerRef: object) => {
  // @ts-ignore
  const rule = designerRef.value.getRule()
  // const fields: string[] = []
  // rule.forEach((item) => {
  //   fields.push(JSON.stringify(item))
  // })
  // return fields
  return formCreate.toJson(rule)
}

// 解码表单 Fields
export const decodeFields = (fields: string[]) => {
  const rule: object[] = []
  fields.forEach((item) => {
    rule.push(JSON.parse(item))
  })
  return rule
}

// 设置表单的 Conf 和 Fields
export const setConfAndFields = (designerRef: object, conf: string, fields: string) => {
  // @ts-ignore
  designerRef.value.setOption(JSON.parse(conf))
  // @ts-ignore
  // designerRef.value.setRule(decodeFields(fields))
  designerRef.value.setRule(formCreate.parseJson(fields))
}

// 设置表单的 Conf 和 Fields
export const setConfAndFields2 = (
  detailPreview: object,
  conf: string,
  fields: string,
  value?: object
) => {
  // @ts-ignore
  detailPreview.value.option = JSON.parse(conf)
  // @ts-ignore
  // detailPreview.value.rule = decodeFields([
  //   '{"type":"upload","field":"uni1","title":" 自定义上传","info":"","effect":{"fetch":""},"props":{"action":"http://localhost:48080/admin-api/bpm/process-instance/upload","list-type":"text","headers":{"Authorization":"Bearer 7dec8a30a6564c9e88e027da04c0fc06"},"fileList":[],"name":"file","multiple":true,"limit":2},"_fc_drag_tag":"upload","hidden":false,"display":true}',
  //   '{"type":"input","field":"Faqt60uafd5kj","title":"输入框","info":"","$required":false,"_fc_drag_tag":"input","hidden":false,"display":true}'
  // ])
  detailPreview.value.rule = formCreate.parseJson(fields)
  if (value) {
    // @ts-ignore
    detailPreview.value.value = value
  }
}
