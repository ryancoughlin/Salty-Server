const fetch = require("node-fetch");
const _ = require("lodash");
const fs = require("fs");
const async = require("async");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: "AIzaSyCBY9toXRkO_jKWz45JKIeZq22p2fykFyQ",
  formatter: null
};

const geocoder = NodeGeocoder(options);
const data = JSON.parse(fs.readFileSync("./msw-ne-spots.json"));

var spots = [];
var counter = 0;

async.forEachOf(data, (item, i, callback) => {
  geocoder
    .geocode(item.name)
    .then(function(res) {
      if (res[0]) {
        console.log("No longitude");
        const spot = {
          name: item.name,
          spotId: item.spot_id,
          location: {
            type: "Point",
            coordinates: [res[0].longitude, res[0].latitude]
          }
        };

        spots.push(spot);
        counter++;
        if (counter === 34) {
          fs.writeFile("./msw-spots.json", JSON.stringify(spots), function(
            err
          ) {});
        }
      }
      callback();
      console.log(counter, data.length);
    })
    .catch(function(err) {
      console.log(err);
    });
});
// fetch(
//   `http://magicseaweed.com/api/443d9221c0e27b63d74e473d7eb5271b/forecast/?spot_id=`
// )
//   .then(response => response.json())
//   .then(json => {
//     if (json.metadata) {
//       const metadata = json.metadata;
//       const station = {
//         name: metadata.name,
//         stationId: metadata.id,
//         location: {
//           type: "Point",
//           coordinates: [metadata.lon, metadata.lat]
//         }
//       };
//
//       stationInfo.push(station);
//       counter++;
//
//       if (counter == stationInfo.length) {
//         fs.writeFile(
//           "./enhancedStation.json",
//           JSON.stringify(stationInfo),
//           function(err) {}
//         );
//       }
//     } else {
//       console.log("Invalid station ID, skipping...", station);
//     }
//   })
//   .catch(error => {
//     console.log(error);
//   });
