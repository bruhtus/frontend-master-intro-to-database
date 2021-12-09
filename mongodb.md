# MongoDB

The command to run `MongoDB` inside of docker:
```sh
# `--name` is the name for the docker container
# `-dit` is detach, interactive, and tty
# `-p` is gonna be the port you're gonna be opening from your docker container running on your computer to your local computer.
# it would be like this: `<outside-docker>:<inside-docker>`
# `<outside-docker>` means the port on you local machine that run docker container.
# `--rm` means, when we're done, just remove automatically afterwards
# `mongo:4.4.1` is the name of the container that we'll be pulling off of Docker Hub is `mongo` and the `:4.4.1` means the version 4.4.1
docker run --name test-mongo -dit -p 27017:27017 --rm mongo:4.4.1

# if the mongodb.service is active, probably the port already in use
# so use different port like 27018:27017

# to execute the `test-mongo` container running `mongo` command
docker exec -it test-mongo mongo
```

If we use `show dbs` inside of `mongo` console (after running the command above),
we'll see the output of three databases which created by `MongoDB` by default:
```sh
admin   0.000GB
config  0.000GB
local   0.000GB
```

`MongoDB` has two key concepts:
- A database
- A collection

## The concepts

### Database

A database is a group of collections.

> Let's say had an app that was running a pet adoption, we're gonna be using a database called adoption
> because we're gonna have multiple different collections inside of this database. So it's a group of collections.
>
> You'll find frequently your application will only ever use one database. If you have a bigger application that has,
> let's say a bunch of users, and this is movies, and this is TV shows, and you need to separate those out,
> you can have multiple databases which would then have multiple collections.
>
> It's all about organizing your data in a useful way.

We can create an `adoption` database using this command:
```sh
# even tho the adoption database doesn't exist before, but because MongoDB is
# dynamic in nature, so it just rolls with it like "you want something called
# `adoption`? here you go. i don't actually have something like that,
# but you can have it now"
use adoption
```

### Document

A document is gonna be like, if you're thinking about a spreadsheet, it's gonna be a row.

**So one individual entry into your database is going to be a document and the table of those rows is going to be your collection.**

### Collection

A collection is just a grab bag of documents, you can think of it as basically javascript objects.

> Literally, the query language for `MongoDB` is just javascript.
> So if you know javascript, you already know how to do querying in `MongoDB`.

## Make MongoDB database

Let's say we want to make a database of pets, and let's insert a document into that. We can do something like this:
```sh
# `db` here represents a `adoption` database we created earlier with command
# `use adoption`
# `pets` is the name of collection that we're about to create
# `insertOne()` is a function that you give a javascript object and it's gonna
# turn that into a document in our database
db.pets.insertOne({ name: "luna", type: "dog", breed: "havanese", age: 8 })
```

The output would be something like this:
```sh
the output would be something like this:
{
      "acknowledged" : true,
      "insertedId" : ObjectId("61aaf8d050ccc256e5617909")
}
```
`acknowledged` means the query was successful and `insertedId` means it inserted a new ID.

**Every document that you insert into MongoDB,
MongoDB will automatically gives the document an ID.
MongoDB has its own internal ID system. Whereas with other database, you have
to create your own ID.**

### Take a Look at The Document in MonogDB

Let's say we want to take a look at how many documents we have in `pets` collection, we can do something like this:
```sh
db.pets.count()
```

And if we use `show dbs`, we'll have new database `adoption` like this:
```sh
admin     0.000GB
adoption  0.000GB
config    0.000GB
local     0.000GB
```
because `MongoDB` created those database when we inserted that first document.

> This is the command that created our first document before:
> ```sh
> db.pets.insertOne({ name: "luna", type: "dog", breed: "havanese", age: 8 })
> ```

## Access The Help List

Let's say we want to see all the available command for `pets` collection,
we can do something like this:
```sh
db.pets.help()
```

We can also do the same with the available database command:
```sh
db.help()
```

## Check Database Status

We can check the current database status with:
```sh
db.stats()
```

## Search The Document in Collection

Let's say we want to find a document in `pets` collection,
we can do something like this:
```sh
db.pets.findOne()
```

because at the moment we only have one document inside of `pets` collection,
if we just gave it empty query, it will find the only document
so that's why it ended up working. The output would be something like this:
```sh
{
        "_id" : ObjectId("61aaf8d050ccc256e5617909"),
        "name" : "luna",
        "type" : "dog",
        "breed" : "havanese",
        "age" : 8
}
```

You can also provide a query object, let's say we want to find a document that
contains `type: "dog"`, we can do something like this:
```sh
db.pets.findOne({ type: "dog" })
```
and that will find the first item in the database that matched `type: "dog"`.

The output would be the same as before:
```sh
{
        "_id" : ObjectId("61aaf8d050ccc256e5617909"),
        "name" : "luna",
        "type" : "dog",
        "breed" : "havanese",
        "age" : 8
}
```

Let's say, instead of `type: "dog"`, we want to find a document that contains
`type: "cat"`. When we do something like this:
```sh
db.pets.findOne({ type: "cat" })
```
that will give an output `null` because there's no document that contains
`type: "cat"`.

> Please keep in mind that there's only one document in `pets` collection at
> the moment.

### FindOne

`findOne()` is gonna try and find the first thing that match the particular
query, and then it will return that.

Even if you have a 6969 things in there, `findOne()` will ignore them and only
return the first match from a particular query.

### Find

To find all of the match from a particular query, we can use `find()`
instead of `findOne()` like this:
```sh
db.pets.find({ type: "dog" })
```
and this is going to give you an iterator (there's an explanation after this,
keep moving!).

The output would be something like this:
```sh
{ "_id" : ObjectId("61aaf8d050ccc256e5617909"), "name" : "luna", "type" : "dog", "breed" : "havanese", "age" : 8 }
```

> Notice that there's a `_id` in the output? That's the ID the MongoDB created.
> That is guaranteed unique as well.

> Does it always find the same one? Or it just find a random one?
> No, it's ambiguous and you never want to rely on ambiguous behavior.

## Example

Let's say we have this long `javascript` command:
```javascript
db.pets.insertMany(
  Array.from({ length: 10000 }).map((_, index) => ({
    name: [
      "Luna",
      "Fido",
      "Fluffy",
      "Carina",
      "Spot",
      "Beethoven",
      "Baxter",
      "Dug",
      "Zero",
      "Santa's Little Helper",
      "Snoopy",
    ][index % 9],
    type: ["dog", "cat", "bird", "reptile"][index % 4],
    age: (index % 18) + 1,
    breed: [
      "Havanese",
      "Bichon Frise",
      "Beagle",
      "Cockatoo",
      "African Gray",
      "Tabby",
      "Iguana",
    ][index % 7],
    index: index,
  }))
);
```

What that `javascript` command do, is generate 10.000 documents in our database.
Now, if we use `db.pets.count()`, it will print out `10001`
(10.000 newly created documents, and 1 previously created document).
We now have 10.001 documents in our `pets` collection.

### Another `findOne` Example

Let's say we want to search `index: 6969` from `pets` collection, we can do something like this:
```sh
db.pets.findOne({ index: 6969 })
```

The output would be something like this:
```sh
{
        "_id" : ObjectId("61ab204750ccc256e5619443"),
        "name" : "Carina",
        "type" : "cat",
        "age" : 4,
        "breed" : "African Gray",
        "index" : 6969
}
```

`index: 6969` in `db.pets.findOne({ index: 6969 })` is your query object, you can use this to kind of filter various different ways.
You can also put multiple things in your query object like this:
```sh
db.pets.findOne({ type: "dog", age: 9 })
```

### Count The Query Results

Let's say we want to know how many results for `type: "dog"` with `age: 9` in `pets` collection, we can do something like this:
```sh
db.pets.count({ type: "dog", age: 9 })
```

### Limit The Query Results

Let's say we want to query for `type: "dog"` and we only want to get the first 5 documents in the `pets` collection, we can do something like this:
```sh
db.pets.find({ type: "dog" }).limit(5)
```

### Get All The Results at Once

Let's say we want to query for `type: "dog"` and we want to get the first 40 documents at once (not typing `it` for more). We can do something like this:
```sh
db.pets.find({ type: "dog" }).limit(40).toArray()
```

Or if we want to get all the documents at once (not typing `it` for more). We can do something like this:
```sh
db.pets.find({ type: "dog" }).toArray()
```

> This can be expensive query if you're sending to every single user 500 documents in your collection.

**The tips/tricks in this course is based on keeping the database healthy and cheap, it's because databases are always the most expensive part of your application.**

### Query Using Greater Value

Let's say we want to query the `type: "cat"` older than 12, we can do something like this:
```sh
# gt means greater than
db.pets.count({ type: "cat", age: { $gt: 12 }})
```

If we want to query the `type: "cat"` older and equal to 12, we can do something like this:
```sh
# gte means greater than equal
db.pets.count({ type: "cat", age: { $gte: 12 }})
```

### Query Using Not Equal

Let's say we want to query the `type: "cat"` that not `age: 12`, we can do something like this:
```sh
# ne means not equal
db.pets.count({ type: "cat", age: { $ne: 12 }})
```

Let's say we want to query the `name: "Fido"` but not a `type: "dog"`, we can do something like this:
```sh
db.pets.count({ name: "Fido", type: { $ne: "dog" }})
```

> These thing is called **Query Operators**.

### Combine Two Logical Operators

Let's say we want to combine two logical operators and we want to find the pets between the age of four and eight,
the way to do that is with a logical operator like this:
```sh
# $and to get multiple different conditions evaluating the true
# $and is an array of things that have to be true
db.pets.count({type: "bird", $and: [{age: {$gte: 4}}, {age: {$lte: 8}}]})
```

> As we can see, using javascript objects, it's a little awkward and some of
> the ways you have to do it, but you can end up with some pretty expressive
> queries.
>
> It just ends up with a lot of nesting objects.

### Sort

Let's say we want to find the oldest dog in `pets` collection, we can do
something like this:
```sh
# in sort, 1 is for ascending and -1 is for descending
db.pets.find({ type: "dog" }).sort({ age: -1 })
```

We can also sort by two things at once, like this:
```sh
# in sort, 1 is for ascending and -1 is for descending
db.pets.find({ type: "dog" }).sort({ age: -1, breed: 1 })
```

**The sorting not only works with number, but also with alphabet.**

## Projections

Let's say we want to find all the dogs but we only want to see their names,
we don't want to see anything else about them. We just want to return their
names.

We use something called projection to do that, like this:
```sh
# the query you want to search, which in this case is `type: "dog"`
# and the component you want to include, in this case is `name`
# if the component doesn't exist, it will only print the `_id`
db.pets.find({ type: "dog" }, { name: 1 })

# we can also ommitted the `_id` with something like this
# we can use `1` and `0`, or `true` and `false`
db.pets.find({ type: "dog" }, { name: 1, _id: 0 })

# we can also exclude the things that we don't want
# include everything except `_id`
db.pets.find({ type: "dog" }, { _id: 0 })
```

**Tips when you're writing your particular database queries:
use the projections, only include the things that you need for your query.**

## Updating Document in MongoDB

There are two commands we can use, `updateOne()` and `updateMany()`.

### Example of `updateOne()`

> `updateOne()` is basically only update the first one that it encounters (similar to `findOne()`).

```sh
# the first thing that you're going to give is query object
# this is the exact same object that you provide to `find()` or `findOne()` or `find()`
# the second thing that you're going to give is how do you want to update the object
# `$set` basically merge the object into the existing object
db.pets.updateOne(
  { type: "dog", name: "Luna", breed: "Havanese" },
  { $set: { owner: "Bruhtus" }}
)
```

If we use `db.pets.find({ owner: "Bruhtus" })`, it will only return one.

> Notice that no other pet documents in our collection has an `owner` schema,
> we just made that up on the fly.
>
> That's the benefit of MongoDB, if you want to change the schema of your collection, you can do it on the fly.
>
> It's also one of its downfalls, because it's really easy to mess things up.

### Example of `updateMany()`

Let's say today is the birthday of every dogs, we can do something like this:
```sh
# we're going to increment all of dogs age by one
# `$inc` for increment
# `1` is the total number we want to increment, if we use `2` instead of `1`
# it will increase by two, not one
db.pets.updateMany(
  { type: "dog" },
  { $inc: { age: 1 }}
)
```

> There's also something called `replaceOne` and `replaceMany`,
> so instead of providing `$set` object, you provide the whole object and it will replace everything.

## Upsert

**The idea of upsert is, if you find something, update it. If it's not there, insert it.**

> It's kind of atomic query that allows you to change something if it's exist, if not, then go a head and update it.

Let's say we want to put the dog named `Sudo`, we can do something like this:
```sh
# you'll notice that we don't have a dog named `Sudo`
# because this is an upsert, we want to provide the whole object, because if
# nothing match that dog, then it's going to take that set object and make
# that the new object.
# so we have to provide everything, otherwise it will be lacking.
# `upsert: true` basically says, if you don't find it, insert it.
db.pets.updateOne(
  { type: "dog", name: "Sudo", breed: "Wheaten" },
  { $set: { type: "dog", name: "Sudo", breed: "Wheaten", age: 5, index: 10000, owner: "Sarah Drasner" }},
  { upsert: true }
)
```

The result would be something like this:
```sh
{
        "acknowledged" : true,
        "matchedCount" : 0,
        "modifiedCount" : 0,
        "upsertedId" : ObjectId("61aecd8477519e8d43fbef2e")
}
```
`upsertedId` means that the object actually get inserted into our collection.

## Deleting Document in MongoDB

### Example of `deleteMany()`

Let's say we want to delete all reptiles of `breed: "Havanese"` because there's no
such a thing as havanese reptiles, we can do something like this:
```sh
# we delete many documents, so we need to be careful about this
# because we can delete documents that we don't want to.
db.pets.deleteMany({ type: "reptile", breed: "Havanese" })
```

The output would be something like this:
```sh
{ "acknowledged" : true, "deletedCount" : 357 }
```

> `deleteMany()` is dangerous because  it doesn't ask questions like
> "you want to delete all those things?".

### Example of `findOneAndDelete()`

Let's say we want to find a reptile named Fido and delete the information
related to the pet. We can do that with something like this:
```sh
db.pets.findOneAndDelete({ name: "Fido", type: "reptile" })
```

The output would be something like this:
```sh
{
        "_id" : ObjectId("61b1588b4e0e126b0edac241"),
        "name" : "Fido",
        "type" : "reptile",
        "age" : 2,
        "breed" : "Tabby",
        "index" : 19
}
```

> With `deleteMany()` there's no information which documents got deleted
> but with `findOneAndDelete()`, it's going to find it and return the document,
> and then delete those document.

## Bulk Write

Let's say someone going to update their profile, add a pet, and remove another
pet at the same time.

You could write that as three separate queries to MongoDB and that would be fine. But, it would be easier and more efficient is you can do bulk write,
which basically says like, "i'm going to queue up three different changes, and
then i'm going to do those all at the same time".

So you queue up three different queries and then you flush that bulk, and all
goes over the same connection to the MongoDB rather than opening three different
connections to MongoDB.

## Indexes

Let's say we're doing a pets adoption website and people want to see all the
dogs. If we have a million of pets in you pets adoption database, that can be
quite slow because it's gonna go read all of the documents in database and it's
going to filter for all the ones that have type dog on it. It'd be better if
we had that indexed so that the database can basically take a shortcut instead
of having to look at every single document in the database (maybe say like
"build us a tree that allows us to search just the dogs in our database").

### `explain("executionStats")`

Let's say want to find any pets that has the name Fido, we can add
`explain("executionStats")` to our find query like this:
```sh
db.pets.find({ name: "Fido" }).explain("executionStats")
```
in that case, `explain("executionStats")` is basically how MongoDB going to find
the query.

The output would be something like this:
```sh
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "adoption.pets",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "name" : {
                                "$eq" : "Fido"
                        }
                },
                "winningPlan" : {
                        "stage" : "COLLSCAN",
                        "filter" : {
                                "name" : {
                                        "$eq" : "Fido"
                                }
                        },
                        "direction" : "forward"
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1070,
                "executionTimeMillis" : 5,
                "totalKeysExamined" : 0,
                "totalDocsExamined" : 9644,
                "executionStages" : {
                        "stage" : "COLLSCAN",
                        "filter" : {
                                "name" : {
                                        "$eq" : "Fido"
                                }
                        },
                        "nReturned" : 1070,
                        "executionTimeMillisEstimate" : 0,
                        "works" : 9646,
                        "advanced" : 1070,
                        "needTime" : 8575,
                        "needYield" : 0,
                        "saveState" : 9,
                        "restoreState" : 9,
                        "isEOF" : 1,
                        "direction" : "forward",
                        "docsExamined" : 9644
                }
        },
        "serverInfo" : {
                "host" : "1b4b97245e0f",
                "port" : 27017,
                "version" : "4.4.1",
                "gitVersion" : "ad91a93a5a31e175f5cbf8c69561e788bbc55ce1"
        },
        "ok" : 1
}
```

Sometimes a database will try multiple different strategies to try and figure
out the best strategy to search the query. The information for such strategies
is in `winningPlan`.

If we take a look at the `winningPlan` from the output above, like this:
```sh
                "winningPlan" : {
                        "stage" : "COLLSCAN",
                        "filter" : {
                                "name" : {
                                        "$eq" : "Fido"
                                }
                        },
                        "direction" : "forward"
                },
```
In the output above, there's only one way to find it. It's called `COLLSCAN`.
`COLLSCAN` is basically looking for every documents in `pets` collection to find
all of your pet's name to find out.

If that is a query that you run a lot, you need to index this that you don't see
`COLLSCAN`. If you run this, let's say once a day, that's fine. But if you run
this 10 times a second, you need to index this yesterday.

If we take a look at `executionStats` from the output above, like this:
```sh
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1070,
                "executionTimeMillis" : 5,
                "totalKeysExamined" : 0,
                "totalDocsExamined" : 9644,
                "executionStages" : {
                        "stage" : "COLLSCAN",
                        "filter" : {
                                "name" : {
                                        "$eq" : "Fido"
                                }
                        },
                        "nReturned" : 1070,
                        "executionTimeMillisEstimate" : 0,
                        "works" : 9646,
                        "advanced" : 1070,
                        "needTime" : 8575,
                        "needYield" : 0,
                        "saveState" : 9,
                        "restoreState" : 9,
                        "isEOF" : 1,
                        "direction" : "forward",
                        "docsExamined" : 9644
                }
        },
```
And we can see `docsExamined` at the bottom, we have 9644 documents in `pets`
collection examined. This is not what we wanna see.

So, how can we fix that? We're gonna fix that by creating an index.

The first thing we're gonna do is:
```sh
db.pets.createIndex({ name: 1 })
```
what that snippet do is creating a simple index on name, and the output would
be something like this:
```sh
{
        "createdCollectionAutomatically" : false,
        "numIndexesBefore" : 1,
        "numIndexesAfter" : 2,
        "ok" : 1
}
```

**Don't just log on to your server an create an index if you don't already have
one. This is actually a fairly heavy procedure to do. So don't just do this in
production. This can cause downtime.**

Now, if we try to find the pets with the name Fido with `executionStats` like
this:
```sh
db.pets.find({ name: "Fido" }).explain("executionStats")
```
the output would be something like this:
```sh
{
        "queryPlanner" : {
                "plannerVersion" : 1,
                "namespace" : "adoption.pets",
                "indexFilterSet" : false,
                "parsedQuery" : {
                        "name" : {
                                "$eq" : "Fido"
                        }
                },
                "winningPlan" : {
                        "stage" : "FETCH",
                        "inputStage" : {
                                "stage" : "IXSCAN",
                                "keyPattern" : {
                                        "name" : 1
                                },
                                "indexName" : "name_1",
                                "isMultiKey" : false,
                                "multiKeyPaths" : {
                                        "name" : [ ]
                                },
                                "isUnique" : false,
                                "isSparse" : false,
                                "isPartial" : false,
                                "indexVersion" : 2,
                                "direction" : "forward",
                                "indexBounds" : {
                                        "name" : [
                                                "[\"Fido\", \"Fido\"]"
                                        ]
                                }
                        }
                },
                "rejectedPlans" : [ ]
        },
        "executionStats" : {
                "executionSuccess" : true,
                "nReturned" : 1070,
                "executionTimeMillis" : 5,
                "totalKeysExamined" : 1070,
                "totalDocsExamined" : 1070,
                "executionStages" : {
                        "stage" : "FETCH",
                        "nReturned" : 1070,
                        "executionTimeMillisEstimate" : 1,
                        "works" : 1071,
                        "advanced" : 1070,
                        "needTime" : 0,
                        "needYield" : 0,
                        "saveState" : 1,
                        "restoreState" : 1,
                        "isEOF" : 1,
                        "docsExamined" : 1070,
                        "alreadyHasObj" : 0,
                        "inputStage" : {
                                "stage" : "IXSCAN",
                                "nReturned" : 1070,
                                "executionTimeMillisEstimate" : 1,
                                "works" : 1071,
                                "advanced" : 1070,
                                "needTime" : 0,
                                "needYield" : 0,
                                "saveState" : 1,
                                "restoreState" : 1,
                                "isEOF" : 1,
                                "keyPattern" : {
                                        "name" : 1
                                },
                                "indexName" : "name_1",
                                "isMultiKey" : false,
                                "multiKeyPaths" : {
                                        "name" : [ ]
                                },
                                "isUnique" : false,
                                "isSparse" : false,
                                "isPartial" : false,
                                "indexVersion" : 2,
                                "direction" : "forward",
                                "indexBounds" : {
                                        "name" : [
                                                "[\"Fido\", \"Fido\"]"
                                        ]
                                },
                                "keysExamined" : 1070,
                                "seeks" : 1,
                                "dupsTested" : 0,
                                "dupsDropped" : 0
                        }
                }
        },
        "serverInfo" : {
                "host" : "1b4b97245e0f",
                "port" : 27017,
                "version" : "4.4.1",
                "gitVersion" : "ad91a93a5a31e175f5cbf8c69561e788bbc55ce1"
        },
        "ok" : 1
}
```

in the `winningPlan` field there's a `stage` field with value `FETCH` like this:
```sh
                "winningPlan" : {
                        "stage" : "FETCH",
                        ...
                },
```
that is basically said like "i found an index that i can use to find whatever you're looking for".

If we take a look at `totalDocsExamined` in `executionStats` field, we'll see a count of 1070 like this:
```sh
        "executionStats" : {
                ...
                "totalDocsExamined" : 1070,
                ...
```
and if we take a look at the result of
```sh
db.pets.count({ name: "Fido" })
```
we'll see the result of 1070. That's basically saying that 1070 is the bare
minimum to query the pets with the name Fido.

### `getIndexes()`

If we want to list the indexes we have, we can use something like this:
```sh
db.pets.getIndexes()
```
and the output would be something like this:
```sh
[
        {
                "v" : 2,
                "key" : {
                        "_id" : 1
                },
                "name" : "_id_"
        },
        {
                "v" : 2,
                "key" : {
                        "name" : 1
                },
                "name" : "name_1"
        }
]
```

By default, MongoDB will always create index for the `_id` and the other index is the index that we created earlier.

### Compound Indexes

Let's say we're frequently querying by both age and type at the same time, you
can actually make a compound index that uses both of those things.

**Tips: Normally the instructor wait a little bit to figure out what indexes
that he want to do and kind of see how he's using the database and how the
code is written. And then, he'll go and make indexes to kind of index those
kind of hot code paths.**

> Because if you have an index that's not doing anything, then that's just
> taking up space and memory. Don't have useless indexes.

### Unique Indexes

Imagine you're doing a user collection you want the username to be unique, so
you put a unique constraint on that particular field.

Let's say we want to make `index` field for every documents in `pets` collection
unique, we can do something like this:
```sh
# `index` here referring to `index` field, it's nothing special about that
db.pets.createIndex({ index: 1 }, { unique: true })
```

With that, the query will go much faster because it's not gonna scan all of them, it actually goes directly to that particular thing.

Another thing, if we try to insert the same index, it will throw an error. It's
because it's not letting us insert duplicate keys here.

That's what `unique` constraint allows us to do.

> It's kind of a necessary byproduct of doing a unique constraint, we have to
> index the field we want to constraint.

## Text Search Indexes

Let's say we had a search box in our pets adoption app where a user can go in
and type dog, they can type Havanese, they can type Luna, they can type any one
of those kind of things in there.

We don't have one queryable field where we can say, "hey MongoDB, give me
anything that contains Luna in it" and it will look across the name, the
description, the location, all those different things.

Full text search is when you're searching text across multiple different
columns, or multiple different fields, or whatever you wanna call them

This has the ability to do text search index.

Below is an example of how to use text search index:
```sh
db.pets.createIndex({ type: "text", breed: "text", name: "text" })
```
what that's gonna do is create a new index containing all of these things, so
now we can just say "hey, search for Luna" and it's gonna give us anything that
contains Luna across type, breed, or name.

Now, we can type:
```sh
# $text is a special operator searching against the full text index
db.pets.find({ $text: { $search: "dog Havanese Luna" }})
```

> We can imagine this is something that a user would enter when they're
> looking for a pet.

By default MongoDB doesn't sort the result for us, it does actually create
what's called a text score. So we actually have to go back and say "give me
this and also sort by the one that matches most closely to my search terms".

We can do that by using this:
```sh
# score can be called whatever you want, but you have to give it $meta
db.pets.find({ $text: { $search: "dog Havanese Luna" }}).sort({ score: { $meta: "textScore" }})
```

We can also see the score using the projection like this:
```sh
db.pets.find({ $text: { $search: "dog Havanese Luna" }}, { score: { $meta: "textScore" }}).sort({ score: { $meta: "textScore" }})
```

> Another nice things about this full text search, it actually is a language aware
> so it will drop things like "the", "and", and "it", those kind of stop words. It's
> not just in English, it also has that ability for Dutch, German, Japanese, and
> Chinese. Or we can just have it do neutral, where it won't do any stop words
> whatsoever. All we have to do is to pass an extra flag to that full text search, like "here's the language that i want you to do the full text search for".
> We can even do it for multiple languages at a time.

> Is the search case sensitive?<br>
> No, it's case insensitive.

> What happens if we insert another document? Do we have to re-index it?<br>
> No, it will continually index new things that you put into the database.
> When you updated it, it'll re-index itself. It'll automatically keep the
> indexes up to date.

**Collections can only support one text index. So we can't have multiple
different types of text index per collection.**

## Aggregation

In this course, we'll be using aggregation pipeline, there's also an old way
called MapReduce (it's still available, it's just lower level and harder to
understand).

What the aggregation pipeline allows us to do is basically allows us to take
our data and slice it up into various different buckets. And then we can kind
of do averages, additions, basically allow us to derive insight from our data,
allow us to combine them and unwind them in interesting ways to kind of figure
out anything we want to know about our data.

Let's say we want to find out how many puppies are in our database, how many
adult dogs are in my database, and how many senior and super senior animals are
in our database. We can do something like this:
```sh
# aggregation do something in stage, so we can give a multiple different stages
# of like, do this first, then this, and then do this.
# so we are going to give it one stage first of bucketing.
# the `$bucket` allows us to break our `pets` collection down into buckets of `by age`.

# let's say anything between zero and two, we're going to consider a puppy.
# everything from three to eight, we're going to consider an adult.
# and everything above that, we're going to consider a senior animal.

# boundaries value include the bottom value but exclude the top value.
# if there's boundaries like this: [0, 3, 9, 15]
# that means the first bucket is from 0 to 2,
# the second bucket is from 3 to 8,
# and the third bucket is from 9 to 14.

# default means, put anything outside of boundaries in the same bucket.
# you can also called it the last bucket.

# output means, what kind of output you want to put in there, it's kind of like
# the projection that you want out of your animal.

# `$sum: 1` means, for every animal that you find in this bucket, increase the
# count by one.

db.pets.aggregate([
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 }
      }
    }
  }
])
```

The output would be something like this:
```sh
# the `_id` correspond to the boundaries (bottom value)
{ "_id" : 0, "count" : 1112 }
{ "_id" : 3, "count" : 3337 }
{ "_id" : 9, "count" : 3332 }
{ "_id" : "very senior", "count" : 2220 }
```

What we just did was bucketed *all animals* in the `pets` collection,
not just dogs. So we need to add another stage to this.

We put the stage to match only dogs before the bucket stage like this:
```sh
db.pets.aggregate([
  {
    $match: {
      type: "dog",
    }
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 }
      }
    }
  }
])
```

The output would be something like this:
```sh
{ "_id" : 0, "count" : 278 }
{ "_id" : 3, "count" : 835 }
{ "_id" : 9, "count" : 833 }
{ "_id" : "very senior", "count" : 555 }
```
which is a lot smaller because we only looking at dogs and not the rest of
documents in `pets` collection.

Now, let's say we want to sort the result by the most count to the less count,
we can add sort stage at the end after the bucket stage like this:
```sh
db.pets.aggregate([
  {
    $match: {
      type: "dog"
    }
  },
  {
    $bucket: {
      groupBy: "$age",
      boundaries: [0, 3, 9, 15],
      default: "very senior",
      output: {
        count: { $sum: 1 }
      }
    }
  },
  {
    $sort: {
      count: -1
    }
  }
])
```

The output would be something like this:
```sh
{ "_id" : 3, "count" : 835 }
{ "_id" : 9, "count" : 833 }
{ "_id" : "very senior", "count" : 555 }
{ "_id" : 0, "count" : 278 }
```

### Aggregation Q&A

- How do we query buckets once we're gone through the aggregation pipeline?

> What we get back is an array of objects and we can treat those as we would
> documents in our collection. There's nothing special you need to treat them.
> It's all just objects to MongoDB.

- Are the buckets saved or indexed or anything like that?

> Not by default. By default, it's just gonna print out what you ask it to print
> out. Buckets does have the ability to actually write to another collection.
>
> Let's say we're doing, like daily stats on how many people visited your website.
> We were keeping all of your sessions in a database. And then at the end of the
> day, we want to aggregate that into like, how many firefox users visited, how many chrome users visited, and all that kind of stuff.
>
> And then we could have that right to another, like daily stats collection and then we could read from that collection everyday.
>
> So, by default buckets doesn't save anywhere, but we could write that to another collection.

> Term `driver` is a word that you use to describe the library that's made to interact with the database.
