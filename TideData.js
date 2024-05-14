// TideData.js
const axios = require('axios');
const { formatDate, getApiUrl } = require('./utils'); // Utility functions need to be implemented

const createTideFetcher = (station) => ({
  fetchData: async () => {
    try {
      const apiUrl = getApiUrl(station);
      const response = await axios.get(apiUrl);
      if (!response.data.predictions) {
        console.error('Unexpected API response:', response.data);
        return [];
      }
      return processData(response.data.predictions, station);
    } catch (error) {
      console.error(`Error fetching tide data: ${error}`);
      return [];
    }
  }
});

const processData = (predictions, station) => {
  // Implement the processData function similarly to how you had it, focusing on functional transformations
  const dailyTides = predictions.reduce((acc, prediction) => {
    const dateTime = new Date(prediction.t);
    const isoDateTime = dateTime.toISOString();
    const date = isoDateTime.split('T')[0];
    const value = parseFloat(prediction.v);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ height: value, time: isoDateTime });
    return acc;
  }, {});

  return formatData(dailyTides, station);
};

const formatData = (dailyTides, station) => {
  let formattedData = {};

  for (const [date, tides] of Object.entries(dailyTides)) {
    tides.sort((a, b) => new Date(a.time) - new Date(b.time));

    const highLowTides = tides.reduce((acc, tide) => {
      if (acc.lowest.length < 2 || tide.height < acc.lowest[0].height) {
        acc.lowest.push(tide);
        acc.lowest.sort((a, b) => a.height - b.height);
        if (acc.lowest.length > 2) acc.lowest.shift();
      }
      if (acc.highest.length < 2 || tide.height > acc.highest[0].height) {
        acc.highest.push(tide);
        acc.highest.sort((a, b) => b.height - a.height);
        if (acc.highest.length > 2) acc.highest.pop();
      }
      return acc;
    }, { highest: [], lowest: [] });

    formattedData[date] = [...highLowTides.lowest.map(tide => ({
      date,
      time: tide.time,
      height: tide.height,
      type: 'low'
    })), ...highLowTides.highest.map(tide => ({
      date,
      time: tide.time,
      height: tide.height,
      type: 'high'
    }))];
  }

  // Return structured data with additional station info
  return {
    name: station.name,
    id: station.stationId,
    latitude: station.location.coordinates[1],
    longitude: station.location.coordinates[0],
    tides: Object.values(formattedData).flat()
  };
};


module.exports = createTideFetcher;
