/**
 * Wave Model Configuration
 * Contains all configuration for NOAA wave models including grid specifications,
 * variable definitions, and operational parameters.
 */

const CONFIG = {
    baseUrl: 'https://nomads.ncep.noaa.gov/dods/wave/gfswave',
    models: {
        pacific: {
            name: 'wcoast.0p16',
            grid: {
                lat: { 
                    size: 151,
                    start: 25.00000000000,
                    end: 50.00005000000,
                    resolution: 0.166667
                },
                lon: { 
                    size: 241,
                    start: 210.00000000000,
                    end: 250.00008000000,
                    resolution: 0.166667
                }
            },
            bounds: { min: -150, max: -110 }  // West Coast (converted from 210-250°E)
        },
        atlantic: {
            name: 'atlocn.0p16',
            grid: {
                lat: { 
                    size: 331,
                    start: 0.00000000000,
                    end: 55.00011000000,
                    resolution: 0.166667
                },
                lon: { 
                    size: 301,
                    start: 260.00000000000,
                    end: 310.00010000000,
                    resolution: 0.166667
                }
            },
            bounds: { min: -100, max: -50 }  // Atlantic Ocean
        },
        gulf: {
            name: 'gulfmex.0p16',
            grid: {
                lat: { 
                    size: 151,
                    start: 15.00000000000,
                    end: 40.00011000000,
                    resolution: 0.166667
                },
                lon: { 
                    size: 181,
                    start: 260.00000000000,
                    end: 290.00010000000,
                    resolution: 0.166667
                }
            },
            bounds: { min: -100, max: -70 }  // Gulf of Mexico
        }
    },
    variables: {
        waveHeight: { 
            key: 'htsgwsfc', 
            unit: 'ft', 
            convert: v => (v * 3.28084).toFixed(1) 
        },
        wavePeriod: { 
            key: 'perpwsfc', 
            unit: 'seconds', 
            convert: v => parseFloat(v.toFixed(1)) 
        },
        waveDirection: { 
            key: 'dirpwsfc', 
            unit: 'degrees', 
            convert: v => Math.round(v) 
        },
        windSpeed: { 
            key: 'windsfc', 
            unit: 'mph', 
            convert: v => (v * 2.237).toFixed(1) 
        },
        windDirection: { 
            key: 'wdirsfc', 
            unit: 'degrees', 
            convert: v => Math.round(v) 
        }
    },
    modelRuns: {
        hours: ['00', '06', '12', '18'],
        availableAfter: {
            '00': 5,  // Available ~05:12 UTC
            '06': 5,  // Available ~11:09 UTC
            '12': 5,  // Available ~17:00 UTC
            '18': 5   // Available ~23:00 UTC
        }
    },
    forecast: {
        days: 7,
        periodsPerDay: 8,
        periodHours: 3
    },
    cache: {
        hours: 6  // Maximum cache duration
    },
    request: {
        timeout: 60000,
        maxRetries: 3,
        retryDelay: 2000
    }
};

module.exports = CONFIG; 