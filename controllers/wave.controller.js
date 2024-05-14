const axios = require('axios');
const { parseWaveData, getWaveDataUrl } = require('../utils/waveUtils');

const getWaveData = async (req, res) => {
  const { stationId } = req.query;

  if (!stationId) {
	return res.status(400).json({ error: 'Missing stationId query parameter' });
  }

  try {
	const waveDataUrl = getWaveDataUrl(stationId);
	const waveDataResponse = await axios.get(waveDataUrl);
	const waveDataText = waveDataResponse.data;
	const timeSeriesData = parseWaveData(waveDataText);

	res.json({
	  station_id: stationId,
	  wave_height_time_series: timeSeriesData,
	});
  } catch (error) {
	console.error(`Error fetching wave data: ${error}`);
	res.status(500).json({ error: 'Failed to retrieve data' });
  }
};

module.exports = { getWaveData };
