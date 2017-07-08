import fetch from 'node-fetch'
import moment from 'moment'
import _ from 'lodash'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

export default function(base, path) {
  const params = {
    headers: {
      ...DEFAULT_HEADERS
    }
  }

  const response = fetch(`${base}${path}`, params)

  response.catch(error => {
    console.log('Error from response:', error)
  })

  return response.then(res => {
    if (res.ok) {
      return res.json()
    } else {
      return res.json().then(json => Promise.reject(json))
    }
  })
}
