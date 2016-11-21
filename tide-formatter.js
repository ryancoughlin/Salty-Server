import moment from 'moment';
import _ from 'lodash';

export default class {
  constructor(tides) {
    this.tides = tides
    console.log(this.tides)
  }

  findCurrentTide() {
    const currentTime = moment().format('YYYY-M-D HH:mm')
    const allTides = _.flatten(_.values(this.tides));

    const tide = _.find(allTides, function(tide) {
      const tideTime = moment(tide.time, 'YYYY-M-D HH:mm')
      const nowFromTide = tideTime.diff(currentTime, 'minutes')

      return nowFromTide > 0;
    });

    return tide.tide
  }

  format() {
    var type;

    if(tide.tide == "high") {
      type = "incoming"
    } else {
      type = "outgoing"
    }
  }
}
