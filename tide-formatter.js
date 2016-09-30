import moment from 'moment';
import _ from 'lodash';

export default class {
  constructor(tides) {
    this.tides = tides
  }

  findCurrentTide() {
    console.log(this.tides)
    const currentTide = _.find(this.tides, function(tide) {
      console.log(tide)
      const tideDate = moment(tide.time, "YYYY-M-D HH:mm")

      return tide
    });
  }
}
