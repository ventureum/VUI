import React, { Component } from 'react'
import moment from 'moment'
import pad from 'left-pad'
import { currentTimestamp } from '../../../../utils/utils'

import './styles.css'

class Countdown extends Component {
  constructor (props) {
    super()

    const endDate = props.endDate
    this.state = {
      endDate: endDate || currentTimestamp(),
      countdown: '',
      isExpired: false,

      // expired if no endDate set on init
      onExpireCalled: !endDate || endDate <= currentTimestamp()
    }

    if (props.onExpire) {
      this.onExpire = props.onExpire.bind(this)
    }

    this.tick()

    this.interval = setInterval(() => {
      this.tick()
    }, 1e3)
  }

  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false

    window.clearInterval(this.interval)
  }

  componentWillReceiveProps (props) {
    const endDate = props.endDate

    if (endDate) {
      const now = currentTimestamp()
      const isExpired = (endDate <= now)

      if (this._isMounted) {
        this.setState({
          endDate: endDate,
          isExpired,

          // don't call expired callback if immediately already expired
          onExpireCalled: isExpired
        })
      }
    }
  }

  render () {
    const {countdown, isExpired} = this.state

    return (
      <span className={`CountdownText ${isExpired ? 'expired' : ''}`}>
        {countdown}
      </span>
    )
  }

  calculateCountdownStr (endDate) {
    const now = currentTimestamp()
    const diff = endDate - now

    if (diff <= 0) {
      if (this._isMounted) {
        this.setState({
          countdown: '',
          isExpired: true
        })
      }

      if (!this.state.onExpireCalled) {
        if (this._isMounted) {
          this.setState({onExpireCalled: true})
        }

        this.onExpire()
      }
      return false
    }

    const dur = moment.duration(diff, 'seconds')
    const seconds = dur.seconds()
    const minutes = dur.minutes()
    const hours = dur.hours()
    const days = dur.days()
    var countdown = (pad(minutes, 2, 0) + ' minutes ') + (pad(seconds, 2, 0) + ' seconds')
    if (days) {
      countdown = (days ? days + ' days ' : '') + (pad(hours, 2, 0) + ' hours ') + countdown
    } else if (hours) {
      countdown = (pad(hours, 2, 0) + ' hours ') + countdown
    }
    return countdown
  }

  tick () {
    const {endDate} = this.state
    var countdown = this.calculateCountdownStr(endDate)
    if (!endDate) {
      if (this._isMounted) {
        this.setState({
          countdown: '',
          isExpired: true
        })
      }

      return false
    }

    if (this._isMounted) {
      this.setState({
        countdown,
        isExpired: false
      })
    }
  }

  onExpire () {
    // default
  }
}

export default Countdown
