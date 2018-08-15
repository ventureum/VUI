import React, { Component } from 'react'
import { List, Divider } from 'semantic-ui-react'

import './styles.css'

class ProjectPreview extends Component {
  getRefSchema (target) {
    let name = target.slice(target.lastIndexOf('/') + 1)
    let subSchema = this.props.schema.definitions[name]
    return subSchema
  }

  generateElem (subSchema, val, index) {
    if (Object.keys(val).length === 0 || val.length === 0) return
    let type = subSchema.type
    if (type === 'array') {
      let objs = []
      if (subSchema.items['$ref']) {
        subSchema.items = this.getRefSchema(subSchema.items['$ref'])
      }
      let subType = subSchema.items.type
      let _this = this
      if (!val.forEach) return
      val.forEach(function (elem, index) {
        if (subType !== 'array' && subType !== 'object') {
          objs.push(<List.Item as='li' key={subSchema.title + index}>{elem}</List.Item>)
        } else {
          elem = _this.generateElem(subSchema.items, elem, index)
          if (elem) {
            objs.push(elem)
          }
        }
      })

      if (objs.length > 0) {
        return (
          <div key={subSchema.title}>
            <strong key={subSchema.title + 'title'}>{subSchema.title}</strong>
            <List.List as='ul' key={subSchema.title + 'list'}>
              {objs}
            </List.List>
          </div>)
      }
    }

    if (type === 'object') {
      let objs = []
      let _this = this
      Object.keys(val).forEach(function (key, index) {
        if (val[key]) {
          let data = subSchema.properties[key]
          let type = data.type
          if (type !== 'array' && type !== 'object') {
            objs.push(<p key={data.title + index}><strong>{data.title + ': '}</strong>{val[key]}</p>)
          } else {
            let elem = _this.generateElem(subSchema.properties[key], val[key])
            if (elem) {
              objs.push(elem)
            }
          }
        }
      })
      if (objs.length > 0) {
        return (
          <div key={subSchema.title + index}>
            <strong key={subSchema.title + 'title'}>{subSchema.title}</strong>
            <List.List as='ul' key={subSchema.title + 'list'}>
              {objs}
            </List.List>
          </div>)
      }
    }
  }

  render () {
    const { schema, formData } = this.props

    var previewContent = []
    var _this = this
    if (formData) {
      Object.keys(formData).forEach(function (key, index) {
        if (formData[key]) {
          let data = schema.properties[key]
          let type = data.type
          if (type !== 'array' && type !== 'object') {
            previewContent.push(<div key={index}><strong>{data.title + ': '}</strong>{formData[key]}</div>)
            previewContent.push(<Divider key={index + 'divider'} />)
          } else {
            let elem = _this.generateElem(schema.properties[key], formData[key])
            if (elem) {
              previewContent.push(elem)
              previewContent.push(<Divider key={index + 'divider'} />)
            }
          }
        }
      })
    }

    return (
      <div className='project-preview'>
        {previewContent}
      </div>
    )
  }
}

export default ProjectPreview
