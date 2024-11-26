const fetch = require('node-fetch');

async function fetchNewEnglandWaveWindData() {
    const date = '20240930'; // You might want to make this dynamic
    const baseUrl = `https://nomads.ncep.noaa.gov/dods/gfs_0p25/gfs${date}/gfs_0p25_00z.ascii?`;
    const timeRange = '[0:3]';
    const latRange = '[524:540]';
    const lonRange = '[1145:1161]';

    const variables = [
        { name: 'hgtprs', range: `${timeRange}[1]${latRange}${lonRange}` },
        { name: 'tmpprs', range: `${timeRange}[1]${latRange}${lonRange}` },
        { name: 'ugrd10m', range: `${timeRange}${latRange}${lonRange}` },
        { name: 'vgrd10m', range: `${timeRange}${latRange}${lonRange}` }
    ];

    try {
        console.log('Fetching data from NOAA GFS...');
        
        const results = await Promise.all(variables.map(async (variable) => {
            const url = `${baseUrl}${variable.name}${variable.range}`;
            console.log(`Fetching from URL: ${url}`);
            const response = await fetch(url);
            const text = await response.text();
            return { name: variable.name, data: parseAsciiData(text) };
        }));

        console.log('Data received. Processing...');
        processData(results);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function parseAsciiData(asciiData) {
    const lines = asciiData.split('\n');
    const dataStart = lines.findIndex(line => line.trim() === 'Data:') + 1;
    const dataLines = lines.slice(dataStart).filter(line => line.trim() !== '');
    
    return dataLines.map(line => {
        const [indexStr, valueStr] = line.split(',');
        return {
            index: indexStr.trim(),
            value: parseFloat(valueStr)
        };
    });
}

function processData(results) {
    results.forEach(result => {
        console.log(`\nData for ${result.name}:`);
        console.log('Sample data point:', result.data[0]);
        console.log('Number of data points:', result.data.length);
        
        const values = result.data.map(item => item.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        console.log('Min value:', min);
        console.log('Max value:', max);
        console.log('Average value:', avg);
    });

    // You can add more specific processing here based on your needs
}

fetchNewEnglandWaveWindData().catch(console.error);