import React, { Component } from 'react'

import './styles.css'

class StatProgressBar extends Component {
  constructor (props) {
    super()

    this.state = {
      fills: props.fills,
      fill: props.fill,
      showFillLabels: props.showFillLabels,
      showLegend: props.showLegend,
      fillLabels: props.fillLabels
    }
  }

  componentWillReceiveProps (props) {
    this.setState({
      fills: props.fills,
      fill: props.fill,
      showFillLabels: props.showFillLabels,
      showLegend: props.showLegend,
      fillLabels: props.fillLabels
    })
  }

  render () {
    const {
      fills,
      fill,
      showFillLabels,
      showLegend,
      fillLabels
    } = this.state

    return (
      <div className='stat-progress-bar'>
        <div className='stat-bar-container'>
          {fills
            ? [<div
              key={Math.random()}
              style={{width: fills[0] ? `${fills[0]}%` : 'auto'}}
              title={`${fills[0]}%`}
              className='stat-bar-fill-container'>
              {showFillLabels ? `${fills[0]}%` : null}
            </div>,
              <div
                key={Math.random()}
                style={{width: fills[1] ? `${fills[1]}%` : 'auto'}}
                title={`${fills[1]}%`}
                className='stat-bar-fill-container'>
                {showFillLabels ? `${fills[1]}%` : null}
              </div>]
          : <div
            style={{width: `${fill}%`}}
            className='stat-bar-fill-container round'>
            {showFillLabels ? `${fill}%` : null}
          </div>
          }
        </div>
        {showLegend
          ? <div className='stat-bar-legend'>
            <label className='fill-label'>
              {fillLabels[0]}
            </label>
            <label className='fill-label'>
              {fillLabels[1]}
            </label>
          </div>
          : null}
      </div>
    )
  }
}

export default StatProgressBar
