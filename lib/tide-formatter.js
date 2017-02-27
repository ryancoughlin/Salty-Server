import moment from 'moment'
import _ from 'lodash'

export default class {
  constructor(tides) {
    this.tides = tides
  }

  currentTideDirection() {
    const now = moment()
    const flatTides = _.flatten(_.values(this.tides))
    const currentTide = _.find(flatTides, tide => moment(tide.time).diff(now, 'minutes' > 0))

    if (currentTide.tide === 'high') {
      return 'Outgoing'
    } else {
      return 'Incoming'
    }
  }

  todaysTides() {
    const now = moment()
    const todaysKey = now.format('MM/DD/YYYY')

    return this.tides[todaysKey]
  }
}
