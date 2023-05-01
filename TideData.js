const axios = require("axios");

class TideData {
  constructor(stationId) {
    this.apiUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationId}&date=today&range=24&product=predictions&interval=h&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
    console.log(this.apiUrl);
  }

  async fetchData() {
    try {
      console.log(this.apiUrl);
      const response = await axios.get(this.apiUrl);
      return this.processData(response.data.predictions);
    } catch (error) {
      console.error(`Error fetching tide data: ${error}`);
      return [];
    }
  }

  processData(predictions) {
    const dailyTides = {};

    predictions.forEach((prediction) => {
      const date = prediction.t.split(" ")[0];
      const time = prediction.t.split(" ")[1];
      const value = parseFloat(prediction.v);

      if (!dailyTides[date]) {
        dailyTides[date] = {
          highestTide: value,
          lowestTide: value,
          highestTideTime: time,
          lowestTideTime: time,
        };
      } else {
        if (value > dailyTides[date].highestTide) {
          dailyTides[date].highestTide = value;
          dailyTides[date].highestTideTime = time;
        }
        if (value < dailyTides[date].lowestTide) {
          dailyTides[date].lowestTide = value;
          dailyTides[date].lowestTideTime = time;
        }
      }
    });

    return Object.entries(dailyTides).map(([date, tideInfo]) => ({
      date,
      ...tideInfo,
    }));
  }
}

module.exports = TideData;
