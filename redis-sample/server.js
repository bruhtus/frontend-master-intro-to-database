// this will turn any node style callback into a promise based API.
const { promisify } = require("util");
const express = require("express");
const redis = require("redis");
const client = redis.createClient();

const redisIncr = promisify(client.incr).bind(client);

// combine redis with postgres.
// the scenario is that, let's say we have a postgres query that takes a very long time
// to complete and we want to do a caching strategy on top of that.
const redisGet = promisify(client.get).bind(client);
// this allow us to do a `set` with an expiry.
const redisSetex = promisify(client.setex).bind(client);

// this function is gonna take some sort of long running function and it's gonna create
// a cached version of it.
// `ttl` is time to live, basically how long we want this to survive.
// `slowFn` is the slow function that we want to cache.
const cache = (key, ttl, slowFn) => {
  // it's a function that returns a function, wow.
  return cachedFn = async (...props) => {
    const cachedResponse = await redisGet(key);
    // do we have a cached response already in redis? if yes, return it.
    if (cachedResponse) {
      console.log('yeah, it was cached')
      return cachedResponse;
    }

    const result = await slowFn(...props);
    await redisSetex(key, ttl, result);
    return result;
  };
};

const slowPostgreSQLQuery = async () => {
  console.log('oh no, it is so slow!')

  // 10000 milliseconds
  const promise = new Promise(resolve => {
    setTimeout(() => {
      resolve(new Date().toUTCString())
    }, 5000);
  });

  return promise;
};

// this `cacheFn` will cache the response and every 10 seconds will get us the fresh
// copy of that.
const cacheFn = cache(
  'expensive_call',
  10,
  slowPostgreSQLQuery
);

const init = async () => {
  const app = express();

  app.get("/pageview", async (req, res) => {
    // `pageviews` is the actual name of the key that's going out to redis.
    // `views` is the incremented number that's going to come back to us.
    const views = await redisIncr("pageviews");

    res.json({
      status: 'nice',
      views,
    });
  });

  app.get('/get', async (req, res) => {
    const data = await cachedFn();

    res.json({
      data,
      status: 'nice'
    }).end();
  });

  const PORT = 3000;
  app.use(express.static("./static"));
  app.listen(PORT);

  console.log(`running on http://localhost:${PORT}`);
};

init();
