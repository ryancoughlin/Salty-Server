import moment from "moment";
import _ from "lodash";

export default class {
  constructor(tides) {
    this.tides = tides;
  }

  todaysTides() {
    const now = moment();
    const todaysKey = now.format("MM/DD/YYYY");
    return this.tides[todaysKey];
  }
}
