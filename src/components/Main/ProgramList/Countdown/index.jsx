import React, { Component } from 'react'
import moment from 'moment'
import pad from 'left-pad'

import './styles.css'

class Countdown extends Component {
  constructor (props) {
    super()

    const endDate = props.endDate
    this.state = {
      endDate: endDate || moment(),
      countdown: this.calculateCountdownStr(endDate),
      isExpired: false,

      // expired if no endDate set on init
      onExpireCalled: !endDate
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
      const now = moment()
      const diff = endDate.diff(now, 'seconds')
      const isExpired = (diff <= 0)

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
    const now = moment()
    const diff = endDate.diff(now, 'seconds')

    if (diff <= 0) {
      if (this._isMounted) {
        this.setState({
          countdown: '',
          isExpired: true
        })
      }

      if (!this.onExpireCalled) {
        if (this._isMounted) {
          this.setState({onExpireCalled: true})
        }

        this.onExpire()
      }
      return false
    }

    const dur = moment.duration(diff, 'seconds')
    const seconds = dur.seconds()
    const hours = dur.hours()
    const days = dur.days()
    const months = dur.months()
    const years = dur.years()
    const countdown = (years ? years + ' years ' : '') + (months ? months + ' months ' : '') + (days ? days + ' days ' : '') + (hours ? pad(hours, 2, 0) + ' hours ' : '') + (seconds ? pad(seconds, 2, 0) + ' seconds ' : '')
    return countdown
  }

  tick () {
    const {endDate, onExpireCalled} = this.state
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