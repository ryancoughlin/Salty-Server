const fetch = require('node-fetch');
const moment = require('moment');
const _ = require('lodash');

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
}

const request = (base, path) => {
  const params = {
    headers: {
      ...DEFAULT_HEADERS
    }
  }

  const response = fetch(`${base}${path}`, params)

  response.catch(error => {
    return error
  })

  return response
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response.json()
    })
    .then(function(response) {
      return response
    })
    .catch(function(error) {
      return error
    })
}
