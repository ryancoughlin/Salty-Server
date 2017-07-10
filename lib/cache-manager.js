import LRU from 'lru-cache'

const options = {
  max: 10000,
  maxAge: 1000 * 60 * 60
}

const cache = LRU(options)

export default function checkCache(json, key) {
  const cachedData = cache.get(key)

  console.log(cache.keys())

  return new Promise(function(resolve, reject) {
    if (cachedData !== undefined) {
      console.log('CACHED!!!!!!!!!!!')
      return resolve(cachedData)
    } else {
      cache.set(key, json)
      return resolve(json)
    }
  })
}
