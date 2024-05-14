/**
 * Formats a Date object into "MM/DD/YYYY".
 * @param {Date} date - The Date object to format.
 * @return {string} The formatted date string.
 */
const formatDate = (date) => {
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
};

/**
 * Constructs the API URL for NOAA's tide data service.
 * @param {Object} station - The station object containing stationId and other details.
 * @return {string} The fully constructed API URL.
 */
const getApiUrl = (station) => {
  const today = new Date();
  const weekAway = new Date(today);
  weekAway.setDate(today.getDate() + 6);  // Setting the date to a week from today for a range of data

  return `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${station.stationId}&begin_date=${formatDate(today)}&end_date=${formatDate(weekAway)}&product=predictions&datum=mllw&units=english&time_zone=gmt&application=web_services&format=json`;
};

module.exports = { formatDate, getApiUrl };
