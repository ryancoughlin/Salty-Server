// Function to generate the URL for wave data
const getWaveDataUrl = (stationId) => `https://www.ndbc.noaa.gov/data/realtime2/${stationId}.txt`;

// Function to parse wave data from the text response
const parseWaveData = (data) => {
  const lines = data.split('\n');
  const parseLine = (line) => {
    if (line.startsWith('#') || line.trim() === '') return null; // Skip header and empty lines
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9 || parts[8] === 'MM') return null; // Ensure we have enough parts and valid wave height

    // Extract date and time
    const date = `${parts[0]}-${parts[1]}-${parts[2]} ${parts[3]}:${parts[4]}`;
    const waveHeightMeters = parseFloat(parts[8]);
    const waveHeightFeet = waveHeightMeters * 3.28084; // Convert meters to feet

    // Extract other relevant data
    const windDirection = parts[5] !== 'MM' ? parseFloat(parts[5]) : null;
    const windSpeed = parts[6] !== 'MM' ? parseFloat(parts[6]) : null;
    const gustSpeed = parts[7] !== 'MM' ? parseFloat(parts[7]) : null;
    const waterTempCelsius = parts[14] !== 'MM' ? parseFloat(parts[14]) : null;
    const waterTempFahrenheit = waterTempCelsius !== null ? (waterTempCelsius * 9/5) + 32 : null;

    return { date, waveHeightMeters, waveHeightFeet, windDirection, windSpeed, gustSpeed, waterTempCelsius, waterTempFahrenheit };
  };

  return lines
    .map(parseLine)
    .filter(dataPoint => dataPoint !== null);
};

module.exports = { getWaveDataUrl, parseWaveData };
