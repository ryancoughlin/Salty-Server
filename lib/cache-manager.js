import LRU from 'lru-cache'

const options = {
  max: 10000,
  maxAge: 1000 * 60 * 60
}

const cache = LRU(options)

export function checkCache(key) {
  console.log(key)
  const cachedData = cache.get(key)

  console.log(cache.keys())

  return new Promise(function(resolve, reject) {
    if (cachedData !== undefined) {
      return resolve(cachedData)
    } else {
      reject()
    }
  })
}

export function setCache(key, data) {
  console.log(key)
  cache.set(key, data)
}
