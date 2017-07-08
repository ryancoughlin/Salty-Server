import moment from "moment";
import _ from "lodash";
import mongoose from "mongoose";
import request from "./request";

const MSWSpot = require("./models/msw-spot");

const MIN_DISTANCE = 0;
const MAX_DISTANCE = 50000;

export default class SwellHeight {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  fetchSwellHeights() {
    return this.findSpot(this.longitude, this.latitude)
      .then(spotId => this.fetchForecast(spotId))
      .then(forecast => this.formatSwellData(forecast))
      .catch(error => {
        console.log(error);
      });
  }

  fetchForecast(spotId) {
    return new Promise(function(resolve, reject) {
      const params = `${process.env
        .MSW_KEY}/forecast?spot_id=${spotId}&fields=timestamp,swell.*,wind.*`;

      return request(`${process.env.MSW_URL}`, params)
        .then(json => {
          console.log("Response: ", json[0].swell.components);
          resolve(json);
        })
        .catch(error => {
          console.log("Error from response: ", error);
        });
    });
  }

  findSpot(longitude, latitude) {
    return new Promise(function(resolve, reject) {
      MSWSpot.findOne(
        {
          location: {
            $nearSphere: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude]
              },
              $maxDistance: MAX_DISTANCE
            }
          }
        },
        function(error, spot) {
          if (error) {
            reject(error);
          }

          if (spot) {
            resolve(spot.spotId);
          } else {
            reject("No spot found within set radius");
          }
        }
      );
    });
  }

  formatSwellData(forecast) {
    return new Promise((resolve, reject) => {
      resolve(
        _.map(forecast, hour => {
          return {
            time: moment.unix(hour.timestamp),
            height: Math.round(hour.swell.components.primary.height),
            direction: hour.swell.components.primary.compassDirection,
            period: hour.swell.components.primary.period,
            type: this.formatSwellType(hour.wind.speed)
          };
        })
      );
    });
  }

  formatSwellType(windSpeed) {
    if (windSpeed < 5.75) {
      return "Smooth Calm";
    } else if (windSpeed >= 5.75 && windSpeed <= 11.51) {
      return "Light Chop";
    } else if (windSpeed >= 11.52 && windSpeed <= 17.26) {
      return "Moderate Chop";
    } else if (windSpeed >= 17.27 && windSpeed <= 23.016) {
      return "Choppy";
    } else if (windSpeed >= 23.017 && windSpeed <= 28.769) {
      return "Rough";
    } else {
      return "Very Rough";
    }
  }
}
