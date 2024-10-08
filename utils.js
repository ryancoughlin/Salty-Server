/**
 * Formats a Date object into "MM/DD/YYYY".
 * @param {Date} date - The Date object to format.
 * @return {string} The formatted date string.
 */
const formatDate = (date) => {
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
};

/**
 * Constructs the API URL for NOAA's tide data service.
 * @param {Object} station - The station object containing stationId and other details.
 * @return {string} The fully constructed API URL.
 */
const getApiUrl = (station) => {
  const today = new Date();
  const weekAway = new Date(today);
  const id = station.id;
  weekAway.setDate(today.getDate() + 6); // Setting the date to a week from today for a range of data

  return `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${id}&begin_date=${formatDate(
    today
  )}&end_date=${formatDate(
    weekAway
  )}&product=predictions&datum=mllw&interval=hilo&units=english&time_zone=gmt&application=web_services&format=json`;
};

/**
 * Formats a station object to a simplified structure.
 * @param {Object} station - The station object from the database.
 * @return {Object} The formatted station object.
 */
const formatStation = (station) => ({
  name: station.name,
  type: station.type,
  spotId: station.id,
  state: station.state,
  latitude: station.location.coordinates[1],
  longitude: station.location.coordinates[0],
  station_type: station.station_type,
  referenceId: station.referenceId,
});

/**
 * Handles errors by logging them and sending a response with a status code 500.
 * @param {Error} error - The error object.
 * @param {Object} res - The Express response object.
 * @param {string} [customMessage='Internal server error'] - A custom error message.
 */
const handleError = (error, res, customMessage = "Internal server error") => {
  console.error(customMessage, error);
  res.status(500).json({ error: customMessage });
};

module.exports = { formatDate, getApiUrl, formatStation, handleError };
