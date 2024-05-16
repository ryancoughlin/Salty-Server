# 🐟 Salty Server

## Overview

Salty Server is a Node.js API designed to deliver real-time tide information. Utilizing data from NOAA (National Oceanic and Atmospheric Administration), the server provides tide predictions, high and low tide schedules, and related maritime data. This API is particularly useful for mariners, fishermen, and coastal residents or businesses that rely on tide information for operational planning.

## Features

- Fetch tide predictions for a specified date range and location.
- Retrieve highest and lowest tides for upcoming days.
- Serve tide data in a JSON format for easy integration with client applications.

## Technologies

- **Node.js**: JavaScript runtime for the server environment.
- **Express**: Web application framework for routing and middleware functionality.
- **MongoDB**: NoSQL database for storing tide station data.

## Getting Started

### Prerequisites

Before setting up the project, ensure you have the following installed:

- Node.js (at least v12.x)
- npm (comes with Node.js)
- MongoDB (local or remote instance)

### Installation

1. Clone the repository:

```bash
git clone git@github.com:ryancoughlin/Salty-Server.git
cd salty-server
```

2. Install dependencies:

```
npm install
```

3. Create a .env file in the root directory of the project and add the following environment variables:

```
MONGO_URL=mongodb+srv://yourMongoDBUrlHere
PORT=3000  # or any port you prefer
```

4. Run the server:

```
npm start
```

## Usage

### Get closest tide station

TBD

### Get closest wave buoy

|                       |                                                                 |
| --------------------- | --------------------------------------------------------------- |
| **Endpoint**          | `/api/buoys/closest`                                            |
| **Method**            | `GET`                                                           |
| **Description**       | Retrieves the closest buoy to the given latitude and longitude. |
| **Query Parameters:** | `latitude` (required): Latitude of the location.                |
| **null**              | `longitude` (required): Longitude of the location.              |

- GET `/api/tides`: Returns tide predictions for the closest station based on query parameters.
- GET `/api/buoy`: Retrieves buoy data near the requested location.
- GET `/api/swells`: Provides swell information for a given area.

### Example Queries

#### Fetch tide predictions

Tide predictions by station, grouped by day and defined by high/low

Request

```
http://localhost:3000/api/tides?latitude=36.8508&longitude=-75.9779
```

Sample Response

```json
{
  "name": "Station Name",
  "id": "123456",
  "latitude": 40.7128,
  "longitude": -74.006,
  "tides": [
    {
      "date": "2024-05-16",
      "time": "2024-05-16T06:00:00Z",
      "height": 1.23,
      "type": "high"
    },
    {
      "date": "2024-05-16",
      "time": "2024-05-16T12:00:00Z",
      "height": -0.45,
      "type": "low"
    }
  ]
}
```

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.
