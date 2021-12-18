# Redis

The command to run `Redis` inside of docker:
```sh
# `-dit` is `detach`, `interactive`, and `tty`.

# `--rm` to remove the log after done with docker container.

# `-p 6379:6379` is the port that we're going to use
# <in local machine>:<in docker>

docker run -dit --rm --name=my-redis -p 6379:6379 redis:6.0.8

# the command below will run the execute redis-cli in docker
# container.

docker exec -it my-redis redis-cli
```

Let's try a simple use case, set the `name` as `bruhtus`:
```sql
-- yup, that's it.

-- we don't need to capitalize `SET` if we don't want to.

SET name "bruhtus"
```

If there's no error, the result should be like this:
```sh
# this is literally the only feedback that we get.

OK
```

Now, let's get the `name` that we just created like this:
```sql
-- yup, that's it.

GET name
```

And if there's no error, the result would be something like this:
```sh
# yup, that's it.

"bruhtus"
```

Here's the primary use case for `Redis`, let's say we queried our
`Neo4j` cluster and we got a count of all the various different facets
of people, and that was a very expensive query to run.

So, what we should do is take that query result and put it in `Redis`.

> We might run the query every day to make sure the result is fresh,
> but we can just come to `Redis` and say `GET neo4j-result` and
> `Redis` would give us back the result so we don't have to re-run the
> query again in the same day.

## Namespaces

**Redis doesn't have the concept of databases or collections or tables or
anything like that. Redis just a big grab bag of keys.**

The thing we should worry is that, how do we make sure that we don't have
naming collision? how do we sure that we don't use the same name later?

We can do that with something called `namespaces` (that's unofficial term btw).
It's a way that we're gonna name our keys to make sure that we're not overriding
those keys later.

Let's say we're storing cities for users, we can do something like this:
```sql
-- the `:` is just to separate all different things.

-- as we can see, we kind of use the formatted namespace `user:username:city`
-- to make sure that we don't have naming collision.

-- you can also use `,` or `/` instead of `:` to separate the naming too,
-- there's no one-true-way to do that.

SET user:bruhtus:city Surabaya
SET user:btholt:city Seattle
SET user:1marc:city Minneapolis
```

And if we try to get one of them, we can do something like this:
```sql
GET user:bruhtus:city
```

If there's no error, the result would be something like this:
```sh
"Seattle"
```

## Redis Mathematical Commands

One of the cool things that Redis can do is, Redis can do some math
for you.

Let's say we're tracking all the visits to our website, we can do that
with something like this:
```sql
-- we set to 0 because no one visit our website yet.

SET visits 0
```

To increment, we can do something like this:
```sql
INCR visits
```
we can also do decrement with something like this:
```sql
DECR visits
```

Another example, let's say we make an American football tracker. We set
the first score to be `0` like usual (don't cheat!):
```sql
SET score:seahawks 0
```

Let's say later in the game we want to increment by 6, we can do something
like this:
```sql
INCRBY score:seahawks 6

-- `INCRBY` is not only allow us to add something, we can also specify
-- how much we want to add.

INCRBY score:seahawks 1
```

There's also `DECRBY` like this:
```sql
INCRBY score:seahawks 7
```

We can also do multiple `SET` and multile `GET` like this:
```sql
-- below is how to do multiple `SET`.

MSET score:seahawks 69 score:broncos 6

-- below is how to do multiple `GET`.

MGET score:seahawks score:broncos
```

We can check if the namespace exist or not by using this:
```sql
EXISTS score:seahawks
```
if it exist, it will return `1` or something like this:
```sh
(integer) 1
```
if it doesn't exist, it will return `0` or something like this:
```sh
(integer) 0
```

We can also delete the namespace with something like this:
```sql
DEL score:seahawks
```
if it exist, it will get deleted and return `1` or something like this:
```sh
(integer) 1
```
if it doesn't exist, it will return `0` or something like this:
```sh
(integer) 0
```

## Redis Command Options

It's basically a condition like only `SET` something if it already exist or
only `SET` if it doesn't exist.

Let's do an example here:
```sql
-- we don't have `color` yet.

-- `XX` basically means, if `color` doesn't exist, don't set it.

SET color black XX
```
if we do `EXISTS color` it's return `0`.

The flip side of that is something like this:
```sql
-- this will set the `color` if the `color` doesn't exist.
-- the opposite of `XX`.

SET color black NX
```

Another useful thing is `TTL` stands for *Time To Live* and basically it
says that "at some point, i want this to expire".

An example of `TTL` is, let's say we're querying our telemetry data, but want
to do it every single day. We can save the cache for a day and after that just
go ahead and delete it.

Another example is that, let's say we want to make a fitness app, and we want
to store our progress in redit. We can do that with something like this:
```sql
-- we can think `EX` as expire.

-- `EX` is in seconds, keep that in mind.

SET fitness:total:bruhtus 69kj EX 69
```
there's also `PX` which use milliseconds instead of seconds.

### Thundering Herd

**Thundering herd is this idea that our cache expires and before we can refresh
the cache, all these user come in and start hitting your database and everything
just falls apart**.

Here's an example of thundering herd:<br>
A common way of doing caching is, if we can find this thing in the cache, serve
it from the cache. If we can't find it from the cache, go get it from the
database and then set it in the cache and serve it to the user (usually do
this with `TTL` that this cache is good for a certain amount of time).

So here's the problem with that particular setup, if we set it up like that,
during that very short window of when the cache expired and it hasn't been
set in the cache again, there's a time where if you have a two thousand users
all hit that one endpoint, they're going to hit the database and they're not
gonna hit the cache. And that will your app server down.

#### Avoid Thundering Herd

Here's how to avoid thundering herd with `TTL`:

Don't use `TTL` with cache in that particular scenario. The much better way
of doing that is leaving that cache there and then having like a cron job or
some periodically running job in the background that will go and set the cache
so that the cache is always there and then there's some background job that's
just resetting the cache every so often. And, you're not relying on the app
server to do it because you're going to hit the thundering herd.

## Redis Data Types

Everything we've done so far is a string. Here's an example:
```sql
SET num 5
TYPE num
```
the result would be something like this:
```sh
string
```

Other than string, there's also a few more:
- Lists.
- Hashes.
- Sets and Sorted sets.
- HyperLogLog.
- Streams.

### Lists

Let's say we're creating an app that does to do reminders for us, we can
do that with something like this:
```sql
-- `RPUSH` means push the item on the right of list, because the list doesn't
-- exist, it'll automatically created for us.

RPUSH notifications:bruhtus "Frontend master database" "Test with jest" "Sleep"
```

If there no error, the result should be something like this:
```sh
(integer) 3
```

If we want to check all the `notifications:bruhtus` we can do something like
this:
```sql
-- `LRANGE` is how we do range in Redis.

-- `0` is the start.

-- `-1` is the end of the list.

-- `LRANGE` is basically `GET` for the lists.

LRANGE notifications:bruhtus 0 -1
```

If there's no error, the output should be something like this:
```sh
1) "Frontend master database"
2) "Test with jest"
3) "Sleep"
```

We can also use `-2` instead of `-1` like this:
```sql
LRANGE notifications:bruhtus 0 -2
```

If there's no error, the output should be something like this:
```sh
1) "Frontend master database"
2) "Test with jest"
```
basically `-2` is before the last item.

We can do something like this:
```sql
LRANGE notifications:bruhtus 0 3
```
that basically means to the third index (in this case all of them).

Now, let's say that bruhtus doing the last task in his to do list. We can do
something like this:
```sql
-- remove from the end of the list.

RPOP notifications:bruhtus
```

If there's no error, the output would be something like this:
```sh
"Sleep"
```

Now, if we do `LRANGE` again like this:
```sql
LRANGE notifications:bruhtus 0 -1
```
and if there's no error, the output would be something like this:
```sh
1) "Frontend master database"
2) "Test with jest"
```

> We can basically pop things in and out of our database.

Let's say that bruhtus doing the first task in his to do list. We can do something
like this:
```sql
LPOP notifications:bruhtus
```

If there's no error, the output would be something like this:
```sh
"Frontend master database"
```
let's see what we have left with:
```sql
LRANGE notifications:bruhtus 0 -1
```
and if there's no error, the output would be something like this:
```sh
1) "Test with jest"
```

Now, let's say we want to move multiple item at once. We can use `LTRIM`
instead of `LPOP`.

### Hashes

Hashes is objects. Hashes have something called `HMSET`. With `HMSET`
we do key-value pair like this:
```sql
HMSET btholt:profile title "Principal Program Manager" company "Microsoft" city "Seattle" state "WA" country "USA"
```

We get the information from the hash using something like this:
```sql
HGET btholt:profile city
```

If there's no error, the result would be something like this:
```sh
"Seattle"
```

If we want to get all the information from the hash, we can do something like
this:
```sql
HGETALL btholt:profile
```

If there's no error, the output would be something like this:
```sh
 1) "title"
 2) "Principal Program Manager"
 3) "company"
 4) "Microsoft"
 5) "city"
 6) "Seattle"
 7) "state"
 8) "WA"
 9) "country"
10) "USA"
```

> Basically put `H` for all the basic command of Redis, like `HGET`, `HSET`,
> `HINKER`. For more info check [Redis webside](https://redis.io/commands#hash).

### Sets and Sorted Sets

Sets is just a group of things. Let's say we have a thing called `colors`
we can do something like this:
```sql
SADD colors red blue yellow green black pink brown
```

If there's no error, the result would be something like this:
```sh
(integer) 7
```

We can check the member of `colors` using something like this:
```sql
SISMEMBER colors green
```
if `green` exist in `colors` set, it'll return `1` or something like this:
```sh
(integer) 1
```
if `green` doesn't exist in `colors` set, it'll return `0` or something like
this:
```sh
(integer) 0
```

To see every members of `colors` set, we can do something like this:
```sh
SMEMBERS colors
```

Instead of using `S` member, we can use `Z` member like this:
```sql
-- we'll make `Z` a sorted set.

-- sorted set use Priority Queue, so it'll return the result based on the
-- priority order.

ZADD ordinals 3 third
ZADD ordinals 1 first
ZADD ordinals 2 second
ZADD ordinals 10 tenth
```

Now, if we want to print out the `Z` member, we can do something like this:
```sql
ZRANGE ordinals 0 -1
```

If there's no error, the output would be something like this:
```sql
1) "first"
2) "second"
3) "third"
4) "tenth"
```
notice that even though we give didn't input them in the correct order, but
it'll print out the output in correct order. That's because of the number
before the member name.

### HyperLogLog

HyperLogLog often abbreviated as HLL. HyperLogLog has the similar idea as Bloom
filters, basically they're very fast for lookups but they have a margin of
error. This is great for extremely large datasets where you have a tolerance
for false positive.

An example of when we might use HyperLogLog:<br>
When `medium.com` recommend a new article to the user. Whenever a user has read
an article, they don't want to recommend the same article to their user. So what
they do is they add that article to HyperLogLog. Sometimes HyperLogLog going to
tell them that the user has read this article when in fact that user hasn't read
that article. The consequence of that false positive is that the user won't
be recommended an article that they haven't read before, which is fine because
it'll just recommended another article that the user definitely hasn't read
before.

> The trade off there is, with having some tolerance for that false positive,
> we'll be able to go faster and have much less memory footprint.

### Streams

At the time of typing this note, Streams is newer so the instructor haven't
used it personally. But, it's basically something like pub-sub
(publish-subscribe) with Redis.

We can subscribe to a key where something can be publishing new things to that
key and then using Streams, we can just be continually reading things out of
Redis.

The example of that is logging, so if we're logging something from our app
service, we can log it to Redis and we can subscribing to that continual
logging to that Stream.

## More Redis Concepts

Redis have a specific ability to evaluate `Lua`. So, if we need to do something
complicated with Redis, we can do that with lua.

> The general advice from the instructor is, if we're coming at a problem
> and we need Redis to evaluate `Lua`. We might need to reconsider what we're
> doing. That might not necessary a good idea.

Let's write some `Lua`:
```lua
-- `0,9,1` means from 0 to 9, increment by one.
EVAL "for i = 0,9,1 do redis.call('SET', 'lua_key_' .. i, i * 5) end" 0
```
if we do something like this:
```sql
GET lua_key_5
```
that will return `"25"` because `5 * 5`. Let's try this again:
```sql
GET lua_key_6
```
that will return `"30"`.

> For more info, you can check the
> [course website](https://btholt.github.io/complete-intro-to-databases/more-redis-concepts).

### Least Recently Used (LRU)

Let's say we have memcache (memory cache) around 100 megabytes of memory,
what would happen once that memcache hit 100 megabytes? Memcache has to
evict something from the cache, something has to go away so memcache can
fit more stuff in there. And memcache does that with strategy called
Least Recently Used (LRU).

So what memcache gonna do is look inside of itself and say "what key in here
is the least recently read or written to" and then it'll that key and evicted
out of there so that it's gone.

We can set Redis to act in this exact same way as well, and it's a little bit
a step up from memcache because everything is getting written to disk so that
if your server accidentally goes down, you can just restart Redis and it'll
reload its cache because everything was getting written to disk.

> For more info you can check
> [Redis website](https://redis.io/topics/lru-cache).

## Q&A

- When would you use Redis as opposed to just keeping something in memory
on your app server?

> In general, when the instructor writing Node servers, PHP servers, and Ruby
> servers, he want his endpoints to be stateless.
>
> Why? So that in between the first call and the second call, he didn't
> maintaining any state. The reason why that's really helpful is because
> when he scale up his app server to be ten app servers, you don't know which
> one they're gonna hit next. So, if he have to maintain state for a user across
> API calls, then he can just set it in Redis and they're all gonna be reading
> from the same Redis even if it's different app servers.
>
> If we only have one app server running your entire app, go ahead and keep it
> in memory unless we have a lot of stuff that need to store because we don't
> want to take up all of our memory. But, when we have two app servers, that
> becomes a big problem.
