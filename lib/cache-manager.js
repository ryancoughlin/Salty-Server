import LRU from 'lru-cache'

const options = {
  max: 1000,
  maxAge: 4000 * 60 * 60
}

const cache = LRU(options)

export function checkCache(key) {
  const cachedData = cache.get(key)

  return new Promise(function(resolve, reject) {
    if (cachedData !== undefined) {
      return resolve(cachedData)
    } else {
      reject()
    }
  })
}

export function setCache(key, data) {
  cache.set(key, data)
}
