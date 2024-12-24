# Salty API - Marine Weather and Tide Data

Real-time marine conditions and forecasts from NDBC buoys and NOAA models.

## Features

- Real-time buoy observations (waves, wind, atmospheric conditions)
- 7-day marine forecasts
- Tide predictions
- Trend analysis and condition summaries
- Wave quality assessment

## API Endpoints

### Buoys

```
GET /api/buoys/:buoyId
```

Returns:

- Current buoy observations
- 4-hour trend analysis
- 7-day forecast
- Human-readable condition summaries

### Tides

```
GET /api/tides/stations            # List all tide stations
GET /api/tides/stations/closest    # Find nearest station to lat/lon
GET /api/tides/stations/:id/predictions  # Get tide predictions
```

## Data Sources

- NDBC (National Data Buoy Center) - Real-time observations
- NOAA WaveWatch III - Wave and wind forecasts
- NOAA CO-OPS - Tide predictions

## Installation

```bash
npm install
cp .env.example .env  # Configure environment variables
npm run dev          # Start development server
```

## Environment Variables

```
PORT=3000
NODE_ENV=development
CACHE_TTL=1800      # Cache duration in seconds
```

## Development

```bash
npm run dev     # Start development server
npm run lint    # Run ESLint
npm test        # Run tests
```

## Response Format

```javascript
{
  "status": "success",
  "data": {
    "buoy": {
      "id": "44098",
      "name": "Jeffrey's Ledge",
      "location": { "type": "Point", "coordinates": [-70.168, 42.798] }
    },
    "observations": {
      "time": "2024-01-24T20:00:00Z",
      "wind": { "direction": 220, "speed": 15.5, "gust": 18.2 },
      "waves": { "height": 4.5, "dominantPeriod": 8, "direction": 200 },
      "conditions": { "pressure": 1015.2, "airTemp": 45.2, "waterTemp": 42.1 }
    },
    "forecast": {
      "days": [...],
      "summaries": { "current": "...", "week": "...", "bestDay": "..." }
    }
  }
}
```

## Error Handling

```javascript
{
  "status": "fail",
  "message": "Error description"
}
```

## License

ISC
