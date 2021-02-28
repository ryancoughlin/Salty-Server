require("dotenv").config();
const mongoose = require("mongoose");
const async = require("async");
const fetch = require('node-fetch')
const fs = require("fs");
const Surfline = require("../../lib/models/surfline");
const _ = require('lodash')

const url =
  'https://services.surfline.com/taxonomy?type=taxonomy&id=58f7ed51dadb30820bb3879c&maxDepth=3'


const MEYorkCount = "58f7edf4dadb30820bb43c52"
const MANorthSouthShore = "58f7ed51dadb30820bb38782"

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, err => {
  if (err) throw err;
  
  fetch(url).then(res => {
    if (res.ok) {
      return res.json().then(json => {
        return json.contains
          .filter(geoname => {
            if (geoname.type == "spot") {
              return true
            }
          })
      })
    }
  }).then(spots => {
    async.each(spots, (s, callback) => {
      const spot = new Surfline({
        name: s.name,
        spotId: s.spot,
        location: {
          coordinates: s.location.coordinates,
          type: s.location.type
        }
      });
    
      spot.save(function(error) {
        if (error) {
          console.log(error);
        }
    
        console.log("Spot saved");
    
        callback();
      });
    }), err => {
      if (error) {
        console.log("Asyn error: ", error);
      }
    };
  })
});
