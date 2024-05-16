// noaa-service.js
import axios from 'axios'

export default async function (params) {
  try {
    const response = await axios.get(process.env.NOAA_URL, { params })
    const errorKey = response.data.error
    if (errorKey === undefined) {
      return response.data
    } else {
      return {}
    }
  } catch (error) {
    console.error(error)
  }
}

function fetchWaterTemperature(stationId) {
  const params =
    '?station=' +
    stationId +
    '&start_date=today&range=3&product=water_temperature&interval=h&datum=mllw&units=english&time_zone=lst_ldt&application=web_services&format=json'

  const url = new URL(
    'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter' + params
  )

  return request(url)
    .then((json) => {
      return this.formatWaterTemperature(json.data)
    })
    .catch((error) => {
      console.error('Error requesting high/low tides', error.message)
    })
}
