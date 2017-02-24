import moment from 'moment';
import _ from 'lodash';

const DATE_FORMAT = 'YYYY-M-D HH:mm'

export default class {
  constructor(tides) {
    this.tides = _.flatten(_.values(tides))
                  .map(function(tide) {
                    return {
                      ...tide,
                      time: moment(tide.time, DATE_FORMAT)
                    }
                  })
  }

  currentTideDirection() {
    const now = moment()
    const currentTide = _.find(this.tides, tide => tide.time.diff(now, 'minutes' > 0))
    var type;

    if(currentTide.tide == 'low') {
      return type = 'Incoming'
    } else {
      return type = 'Outgoing'
    }
  }

  findNextTide() {
    const now = moment()
    const nextTideIndex = _.findIndex(this.tides, (tide) => {
      const tideTime = moment(tide.time).format(DATE_FORMAT)

      return now.diff(tideTime) <= 0
    })

    const nextTide = this.tides[nextTideIndex]

    return {
      ...nextTide,
      time: moment(nextTide.time).format(DATE_FORMAT)
    }
  }

  findNextTides() {
    const now = moment()
    const [high, low] = _.partition(this.tides, tide => tide.tide === 'high')

    const nextHighTide = _.find(high, tide => {
      if (tide.time.diff(now, 'minutes') > 0) {
        return tide
      }
    })

    const nextLowTide = _.find(low, tide => {
      if (tide.time.diff(now, 'minutes') > 0) {
        return tide
      }
    })

    return {
      high: { ...nextHighTide, time: nextHighTide.time.format(DATE_FORMAT) },
      low: { ...nextLowTide, time: nextLowTide.time.format(DATE_FORMAT) },
    }
  }
}
