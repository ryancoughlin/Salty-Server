# 🐟 Salty Server

## Overview

Salty Server is a Node.js API that delivers comprehensive marine weather data, including real-time buoy data, wave forecasts, and tide information. The server aggregates data from multiple NOAA (National Oceanic and Atmospheric Administration) sources to provide accurate maritime conditions and forecasts.

## Data Sources

### NDBC Buoy Data

- **Source**: NOAA National Data Buoy Center (NDBC)
- **Update Frequency**: Typically hourly
- **Data Format**: Real-time observations including:
  - Wave height (feet)
  - Wave period (seconds)
  - Wave direction (degrees)
  - Wind speed (mph)
  - Wind direction (degrees)
  - Water temperature (°C)

### Wave Model Data

- **Source**: NOAA WaveWatch III (WW3) Model
- **Update Frequency**: Four times daily (00z, 06z, 12z, 18z)
- **Forecast Range**: 7 days
- **Resolution**: 0.16° grid
- **Parameters**:
  - Significant wave height (feet)
  - Peak wave period (seconds)
  - Wave direction (degrees)
  - Wind speed (mph)
  - Wind direction (degrees)

### Tide Data

- **Source**: NOAA CO-OPS API
- **Update Frequency**: Daily predictions
- **Data**: High and low tide times and heights

## API Endpoints

### Buoy Data

#### Get Buoy Details

```http
GET /api/buoys/{buoyId}
```

Returns current conditions and 7-day forecast for a specific buoy.

**Response Format**:

```json
{
  "status": "success",
  "data": {
    "buoy": {
      "id": "44098",
      "name": "Jeffrey's Ledge, NH",
      "location": {
        "type": "Point",
        "coordinates": [-70.171, 42.8]
      }
    },
    "currentConditions": {
      "time": "2024-11-27T16:26:00.000Z",
      "waveHeight": 3.6,
      "dominantWavePeriod": 5,
      "meanWaveDirection": 251,
      "windSpeed": 15.2,
      "windDirection": 270,
      "waterTemp": 10.2
    },
    "forecast": {
      "days": [
        {
          "date": "2024-11-27",
          "summary": {
            "waveHeight": {
              "min": 2.5,
              "max": 4.2,
              "avg": 3.4
            },
            "wavePeriod": {
              "min": 4.0,
              "max": 6.5,
              "avg": 5.2
            },
            "windSpeed": {
              "min": 10.5,
              "max": 18.2,
              "avg": 14.8
            }
          },
          "periods": [
            /* 3-hour intervals */
          ]
        }
      ]
    },
    "summaries": {
      "current": "moderate 3.6ft waves, fresh 15.2mph NW winds",
      "week": "Building to 4.2ft waves and 18.2mph winds by Thursday",
      "bestDay": "Best on Friday: 3.2ft waves, 12.5mph SW winds"
    },
    "units": {
      "waveHeight": "ft",
      "wavePeriod": "seconds",
      "waveDirection": "degrees",
      "windSpeed": "mph",
      "windDirection": "degrees"
    }
  }
}
```

#### Find Closest Buoy

```http
GET /api/buoys/closest?lat={latitude}&lon={longitude}
```

Returns the nearest buoy to provided coordinates with current conditions and forecast.

### Wave Forecast

#### Get Wave Forecast

```http
GET /api/waves/forecast?lat={latitude}&lon={longitude}
```

Returns 7-day wave and wind forecast for any location using WW3 model data.

### Tide Data

#### Get Tide Predictions

```http
GET /api/tides/stations/{stationId}/predictions
```

Returns tide predictions for a specific station.

#### Find Closest Tide Station

```http
GET /api/tides/stations/closest?lat={latitude}&lon={longitude}
```

Returns the nearest tide station to provided coordinates.

## Features

- Real-time buoy data integration
- 7-day wave model forecasts
- Daily summaries and condition descriptions
- Best day recommendations for water activities
- Intelligent caching system
- Rate limiting and CORS protection
- Comprehensive error handling

## Technical Details

- **Caching**: 30-minute cache for buoy data, 6-hour cache for forecasts
- **Rate Limits**: 100 requests per 15 minutes per IP
- **CORS**: Configurable origin restrictions
- **Error Handling**: Detailed error responses with appropriate HTTP status codes

## Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- npm

### Installation

1. Clone the repository:

```bash
git clone git@github.com:ryancoughlin/Salty-Server.git
cd salty-server
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file:

```env
PORT=5010
NODE_ENV=development
```

4. Start the server:

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

ISC
