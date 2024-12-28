# 🌊 Salty API

> Real-time tide predictions and marine data from NOAA stations.

## 📖 Overview

Salty API provides real-time access to tide predictions and marine data from NOAA stations. Built with Node.js and Express, it offers a simple and reliable way to access marine data.

## ⚡️ Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

## 🛠 API Reference

### Stations

All station-related endpoints for accessing tide data and predictions.

#### Get All Stations

```http
GET /api/stations
```

Returns a list of all available tide stations.

**Response**

```json
{
  "status": "success",
  "data": {
    "stations": [
      {
        "id": "8443970",
        "name": "Boston",
        "location": {
          "type": "Point",
          "coordinates": [-71.0503, 42.3584]
        }
      }
    ]
  }
}
```

#### Find Nearest Station

```http
GET /api/stations/nearest?lat={latitude}&lon={longitude}
```

Finds the closest tide station to provided coordinates.

**Parameters**
| Name | Type | Description |
|------|------|-------------|
| lat | float | Latitude |
| lon | float | Longitude |

#### Get Station Predictions

```http
GET /api/stations/{stationId}?startDate={date}&endDate={date}
```

Returns tide predictions for a specific station.

**Parameters**
| Name | Type | Description |
|-----------|--------|--------------------------------|
| stationId | string | Station identifier |
| startDate | string | Start date (ISO 8601, optional)|
| endDate | string | End date (ISO 8601, optional) |

## 🔧 Configuration

### Environment Variables

```env
PORT=3000              # Server port
NODE_ENV=development   # Environment (development/production)
CACHE_TTL=1800        # Cache duration in seconds
```

## 🚀 Development

```bash
# Start development server with hot reload
npm run dev

# Run linter
npm run lint

# Run tests
npm test
```

## 📦 Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "fail",
  "message": "Error description"
}
```

## 🔒 Error Handling

The API uses a centralized error handling system:

- Validation errors (400)
- Not found errors (404)
- Server errors (500)

Each error returns a consistent format with appropriate HTTP status codes.

## 📝 Data Sources

- **NOAA CO-OPS**: Tide predictions and water level data
- **NOAA Stations**: Station metadata and reference data

## 📄 License

ISC © [Your Name]

---

<div align="center">
Made with ❤️ for the marine community
</div>
