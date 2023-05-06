const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const ndbcStationsURL = "https://www.ndbc.noaa.gov/activestations.xml";

axios
  .get(ndbcStationsURL)
  .then((response) => {
    const $ = cheerio.load(response.data, {
      xmlMode: true,
    });
    const buoyData = [];

    $("station").each((index, element) => {
      const stationID = $(element).attr("id");
      const stationName = $(element).attr("name");
      const lat = parseFloat($(element).attr("lat"));
      const lon = parseFloat($(element).attr("lon"));

      buoyData.push({
        id: stationID,
        name: stationName,
        lat: lat,
        lon: lon,
      });
    });

    const jsonData = JSON.stringify(buoyData, null, 2);

    fs.writeFile("buoyData.json", jsonData, (err) => {
      if (err) {
        console.error(`Error writing JSON data to file: ${err}`);
      } else {
        console.log("JSON data successfully written to buoyData.json");
      }
    });
  })
  .catch((error) => {
    console.error(`Error fetching data: ${error}`);
  });
