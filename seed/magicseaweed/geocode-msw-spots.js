const fetch = require("node-fetch");
const _ = require("lodash");
const fs = require("fs");
const async = require("async");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: "AIzaSyAbBeLZGD7AJTEtEsdtemYq7fX-tzsTFII",
  formatter: null,
};

const geocoder = NodeGeocoder(options);
const data = JSON.parse(
  fs.readFileSync("./seed/magicseaweed/json/msw-ne-spots.json")
);

var spots = [];
var counter = 0;
var length = data.length;
console.log("Number of spots: ", length);
async.forEachOf(data, (item, i, callback) => {
  geocoder
    .geocode(item.name)
    .then(function (res) {
      if (res[0]) {
        const spot = {
          name: item.name,
          spotId: item.spot_id,
          location: {
            type: "Point",
            coordinates: [res[0].longitude, res[0].latitude],
          },
        };

        console.log("Spot: ", spot.name);

        spots.push(spot);
        counter++;
        if (counter === length) {
          fs.writeFile(
            "./msw-ne-spots.json",
            JSON.stringify(spots),
            function (err) {}
          );
        }
      }
      callback();
      console.log(counter, data.length);
    })
    .catch(function (err) {
      console.log("Error geocoding: ", err);
    });
});
