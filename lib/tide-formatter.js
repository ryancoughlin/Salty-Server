import moment from "moment";
import _ from "lodash";

export default class {
  constructor(tides) {
    this.tides = tides;
  }

  todaysTides() {
    const now = moment();
    const todaysKey = now.format("MM/DD/YYYY");
    const todaysTides = this.tides[todaysKey];

    return _.map(todaysTides, tide => {
      if (moment(tide.time).diff(now, "minutes") < 0) {
        return {
          ...tide,
          pastTide: true
        };
      } else {
        return {
          ...tide,
          pastTide: false
        };
      }
    });
  }
}
