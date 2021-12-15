# PostgreSQL

The command to run `Postgres` inside of docker:
```sh
# we need to give postgres a login password or it will not start for us
# `-p` is the port we want to use, the structure would be like this:
# <outside-docker>:<inside-docker>. outside docker means, in our local machine
# port.
# `-d` for detach, `--rm` means remove the log when we're done.

docker run --name my-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d --rm postgres:13.0

# this command attach docker container running psql (which is the name of postgres command line client).

docker exec -it -u postgres my-postgres psql
```

> By default, we'll connect to the generic database called `postgres`.

Now, let's say we want to create a new database called `message_boards`.
We can do something like this:
```sql
-- don't forget to put the semicolon (;), postgres won't know that you're done
-- until you put the semicolon.
--
-- the uppercase command is optional, you can use `create database` too.
-- this is just to make it easier to distinguish the SQL command and the input.

CREATE DATABASE message_boards;
```

We'll know if the database successfully created if there's a message like this:
```sql
CREATE DATABASE
```

Now, if we want to use `message_boards` database we can do something like this:
```sql
-- the `c` is abbreviation of `connect`.
-- we can also use `\connect`.

\c message_boards
```
and if there's no error, the feedback would be something like this:
```sh
You are now connected to database "message_boards" as user "postgres".
```

**The way you do admin command in postgres is to use backslash (\)**.

Example of admin command:
- If we use `\l` we can see the list of available databases.
- If we use `\d` we can see all the tables in current database.
- If we want to see all the available command, we can use `\?`.
- If we want to see all the queries we can do, we can use `\h`.

We can use `--` to add comment in SQL, everything after the `--` is a
comment until the end of the line.

Let's say we want to create table `users`, we can do something like this:
```sql
-- we can use `INT` or `INTEGER`.

-- `PRIMARY KEY` means, this is the thing that the database is primarily going
-- to indexes on. this is kind of equivalent with MongoDB `_id`.

-- `GENERATED ALWAYS AS IDENTITY` means that this is going to be an auto
-- incrementing id.
-- so the first record that we're going to insert into this table, is
-- gonna have id1, and the next will have id2, then id3, and so on.
-- it will keep track of that for us.

-- `VARCHAR` means a variable amount of character, or a string.

-- `( 25 )` is a maximum length for the `username`.

-- `UNIQUE` means, no two people have the same `username`.

-- `NOT NULL` means, if we're going to insert this into a database,
-- you must include username, or postgres won't accept this query.

-- `( 50 )` is a maximum length for the `email`.

-- `( 100 )` is a maximum length for `full name`.

-- `TIMESTAMP` in `last_login` is to log every time the user logged in and
-- put it in `last_login`.
-- this can be useful for, let's say there's a user that haven't logged in
-- in six months, we can just clear out all user that haven't been logged in in
-- six months.
-- why we didn't put `NOT NULL` in it? because if the user just created an
-- account, they haven't logged in before.

-- do not put `,` in the end of table component, in this case is `created_on`
-- component.

CREATE TABLE users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  username VARCHAR ( 25 ) UNIQUE NOT NULL,
  email VARCHAR ( 50 ) UNIQUE NOT NULL,
  full_name VARCHAR ( 100 ) NOT NULL,
  last_login TIMESTAMP,
  created_on TIMESTAMP NOT NULL
);
```

If we run the command above and there's no error, the feedback would be something like this:
```sql
CREATE TABLE
```

And if we use command `\d` the output would be something like this:
```sh
                List of relations
 Schema |       Name        |   Type   |  Owner
--------+-------------------+----------+----------
 public | users             | table    | postgres
 public | users_user_id_seq | sequence | postgres
(2 rows)
```
the first one is `users` table that we just created, and the second one is a sequence type that used
to keep track of where we are in that auto incrementing id.

So all those auto incrementing id will have their own little sequence in this
list of relations thing.

> Something that we can do instead of using `VARCHAR`, we can use something
> called `TEXT` which is a different kind of data type.
> That basically says that we're not putting an upper limit on it, it can be
> like 65.000 character.
>
> With `VARCHAR`, we can just limit the character. We don't want people to have
> 65.000 character emails.

The current table is empty, so let's insert a record into that table like
this:
```sql
-- `users` is the name of our table.

-- we need to put the field (or columns) that we're going to fill in
-- like `(username, email, full_name, and created_on)`.

-- `VALUES` is to insert the value into the field (gonna go in the same
-- order).

-- YOU MUST USE SINGLE QUOTES, DO NOT USE DOUBLE QUOTES IN SQL

-- `NOW()` is a function built into postgres that gonna give us the current
-- timestamps.

INSERT INTO users (username, email, full_name, created_on) VALUES ('bruhtus', 'yalord@save.me', 'Robertus Chris', NOW());
```

If there's no error, then the feedback should be something like this:
```sh
# `0` represent `OID` which is not covered in this course, sad.
INSERT 0 1
```

Now, let's say we want to read from the database. The most basic way is
something like this:
```sql
-- `*` means everything.
SELECT * FROM users;
```

If there's no error, the output should be something like this:
```sh
 user_id | username |      email      |   full_name    | last_login |         created_on
---------+----------+-----------------+----------------+------------+----------------------------
       1 | bruhtus  | yalord@save.me | Robertus Chris |            | 2021-12-11 06:23:30.845929
(1 row)
```

`SELECT` basically saying "get this stuff out of the database", `*` is like
saying "we don't want to do any projection" (this is where we do the projection
stuff). `FROM` is to choose the table.

## Querying PostgreSQL

Download a sample set of tables from [here](https://btholt.github.io/complete-intro-to-databases/sample-postgresql.sql).
And then copy the content of the file and paste to the postgres shell.

When there's no error and we use `\d`, the output should be something like this:
```sh
                     List of relations
 Schema |            Name             |   Type   |  Owner
--------+-----------------------------+----------+----------
 public | boards                      | table    | postgres
 public | boards_board_id_seq         | sequence | postgres
 public | comments                    | table    | postgres
 public | comments_comment_id_seq     | sequence | postgres
 public | rich_content                | table    | postgres
 public | rich_content_content_id_seq | sequence | postgres
 public | users                       | table    | postgres
 public | users_user_id_seq           | sequence | postgres
(8 rows)
```

**Please keep in mind that the order is important**.

### Limit

If we do `SELECT * FROM users;` now, we'll get a lot of users. But we can also
limit the results (similar to MongoDB) with something like this:
```sql
-- this will grab the first 10 in our `users` database.
SELECT * FROM users LIMIT 10;
```

### Projections

Let's say we only want to see the username and full name of the user, we can do
something like this:
```sql
SELECT username, full_name FROM users;
```

We can also limit the results, let's say to 10, with something like this:
```sql
SELECT username, full_name FROM users LIMIT 10;
```

### Where

Let's say we want to query the user that has `user_id` 69. We can do that using something
like this:
```sql
SELECT username, email, user_id FROM users WHERE user_id=69;
```

When there's no error, the output should be something like this:
```sh
 username |        email         | user_id
----------+----------------------+---------
 larthy1w | larthy1w@sina.com.cn |      69
(1 row)
```

### Filter

Let's say we want to see the first 10 users that never logged in. We can do something
like this:
```sql
SELECT username, email, user_id FROM users WHERE last_login IS NULL LIMIT 10;
```

If there's no error, the output should be something like this:
```sh
   username   |          email           | user_id
--------------+--------------------------+---------
 dpuckring0   | dpuckring0@wikimedia.org |       1
 gsomerled2   | gsomerled2@auda.org.au   |       3
 sfaiera      | sfaiera@goo.ne.jp        |      11
 gsukbhansd   | gsukbhansd@indiegogo.com |      14
 aaizikovj    | aaizikovj@posterous.com  |      20
 hmaccurtaink | hmaccurtaink@psu.edu     |      21
 gromaynep    | gromaynep@lycos.com      |      26
 fbodicumu    | fbodicumu@prlog.org      |      31
 wcurwoodv    | wcurwoodv@hubpages.com   |      32
 gcloneyy     | gcloneyy@un.org          |      35
(10 rows)
```

Another example, let's say we want to filter multiple different things.

We want to see the first 10 users haven't logged in and their account is more than
six months old. We can do something like this:
```sql
-- `AND` is the clause to use multiple different filter parameters at once.

-- `NOW()` is the current timestamp.

-- postgres is smart enough to identify `6 months` into the timestamp

SELECT username, email, user_id FROM users WHERE last_login IS NULL AND created_on < NOW() - interval '6 months' LIMIT 10;
```

If there's no error, the output should be something like this:
```sh
  username   |         email          | user_id
-------------+------------------------+---------
 ggodboltfl  | ggodboltfl@hc360.com   |     562
 gplankfp    | gplankfp@google.nl     |     566
 gturlefs    | gturlefs@nsw.gov.au    |     569
 aordemannfx | aordemannfx@i2i.jp     |     574
 taldisfz    | taldisfz@ameblo.jp     |     576
 cwayong2    | cwayong2@biglobe.ne.jp |     579
 yraittg3    | yraittg3@msu.edu       |     580
 dbyrthg4    | dbyrthg4@sakura.ne.jp  |     581
 cmorsheadg5 | cmorsheadg5@go.com     |     582
 dkoppensg7  | dkoppensg7@globo.com   |     584
(10 rows)
```

Another scenario, let's say we want to find the 10 oldest user account. We can
do something like this:
```sql
SELECT user_id, username, email, created_on FROM users ORDER BY created_on LIMIT 10;
```

If there's no error, the results should be something like this:
```sh
 user_id |   username   |            email            |         created_on
---------+--------------+-----------------------------+----------------------------
     926 | edepp        | edepp@360.cn                | 2020-12-08 23:56:08.933694
     929 | saspinps     | saspinps@wired.com          | 2020-12-08 23:56:08.933694
     923 | kdohertypm   | kdohertypm@mayoclinic.com   | 2020-12-08 23:56:08.933694
     925 | hderrickpo   | hderrickpo@wsj.com          | 2020-12-08 23:56:08.933694
     927 | jsappypq     | jsappypq@sciencedaily.com   | 2020-12-08 23:56:08.933694
     928 | cmottepr     | cmottepr@bbc.co.uk          | 2020-12-08 23:56:08.933694
     921 | akarlemanpk  | akarlemanpk@blogs.com       | 2020-12-08 23:56:08.933694
     922 | gtivolierpl  | gtivolierpl@istockphoto.com | 2020-12-08 23:56:08.933694
     924 | vwindridgepn | vwindridgepn@umn.edu        | 2020-12-08 23:56:08.933694
     930 | bbrookespt   | bbrookespt@skyrock.com      | 2020-12-08 23:56:08.933694
(10 rows)
```

Now, if we want to find the 10 newest user accounts, we can do something like
this:
```sql
-- `DESC` is means descending or the opposite of whatever the order is.
-- the default for `ORDER BY` is `ASC` which means ascending.

SELECT user_id, username, email, created_on FROM users ORDER BY created_on DESC LIMIT 10;
```

If there no error, the results should be something like this:
```sh
 user_id |  username   |              email              |         created_on
---------+-------------+---------------------------------+----------------------------
       2 | ssiviour1   | ssiviour1@ow.ly                 | 2021-12-08 23:56:08.933694
       3 | gsomerled2  | gsomerled2@auda.org.au          | 2021-12-07 23:56:08.933694
       4 | wedginton3  | wedginton3@google.com           | 2021-12-05 23:56:08.933694
       1 | dpuckring0  | dpuckring0@wikimedia.org        | 2021-12-04 23:56:08.933694
       5 | mshine4     | mshine4@army.mil                | 2021-12-03 23:56:08.933694
       6 | marnli5     | marnli5@google.co.uk            | 2021-12-01 23:56:08.933694
       7 | wjohnston6  | wjohnston6@omniture.com         | 2021-11-29 23:56:08.933694
       8 | shenstone7  | shenstone7@networksolutions.com | 2021-11-27 23:56:08.933694
       9 | chuffey8    | chuffey8@csmonitor.com          | 2021-11-25 23:56:08.933694
      10 | asandiland9 | asandiland9@sun.com             | 2021-11-23 23:56:08.933694
(10 rows)
```

### Count

Let's say we want to know how many users we have, we can do something like this:
```sql
-- the star or (*) is just means we're looking for total rows.

SELECT COUNT(*) FROM users;
```

If there's no error, the result should be something like this:
```sh
 count
-------
  1000
(1 row)
```
which means we have 1000 users.

#### Count and Filter

If you wanna look at how many users that ever logged in, we can do something
like this:
```sql
SELECT COUNT(last_login) FROM users;
```

Since `COUNT` will ignore `null` values, the result should only contain the
total of `non-null` values from `last_login` column.

If there's no error, the result should be something like this:
```sh
 count
-------
   678
(1 row)
```

### Update

Let's say we want to update the last login information for user with id 1,
we can do something like this:
```sql
-- `RETURNING` basically means return the updated row, similar to MongoDB
-- `findOneAndUpdate()`.

UPDATE users SET last_login=now() WHERE user_id=1 RETURNING *;
```

If there's no error, the result should be something like this:
```sh
 user_id |  username  |          email           |   full_name    |        last_login         |         created_on
---------+------------+--------------------------+----------------+---------------------------+----------------------------
       1 | dpuckring0 | dpuckring0@wikimedia.org | Dicky Puckring | 2021-12-12 06:25:18.26477 | 2021-12-04 23:56:08.933694
(1 row)

UPDATE 1
```

Now, let's say we want to update the full name and email of the user with user
id 2. We can do that with something like this:
```sql
UPDATE users SET full_name='Robertus Chris', email='yalord@save.me' WHERE user_id=2 RETURNING *;
```

If there's no error, the result should be something like this:
```sh
 user_id | username  |     email      |   full_name    |         last_login         |         created_on
---------+-----------+----------------+----------------+----------------------------+----------------------------
       2 | ssiviour1 | yalord@save.me | Robertus Chris | 2021-12-09 23:56:08.933694 | 2021-12-08 23:56:08.933694
(1 row)

UPDATE 1
```

### Delete

Let's say we want to delete the user with id 1000
(i don't want to delete the user with user id 69, what a lucky user), we can do
that with something like this:
```sql
DELETE FROM users WHERE user_id=1000 RETURNING *;
```

If there's no error, the result should be something like this:
```sh
 user_id | username |        email        |  full_name  | last_login |         created_on
---------+----------+---------------------+-------------+------------+----------------------------
    1000 | vovellrq | vovellrq@discuz.net | Vicky Ovell |            | 2020-12-08 23:56:08.933694
(1 row)

DELETE 1
```

## Relational Data Case

In this section, we'll be doing some more relational data. So far, we've only
doing data manipulation in `users` table which is only one table. Now, we'll be
adding table about comments from users and then the table about the boards that
those users posting comments to.

> The hierarchy of our data is something like this:<br>
> - We have message boards.<br>
> - On those message boards there'll be comments.<br>
> - Those comments will be posted by users.<br>

The big key and how we establish these relationship between these various
different tables and records in these tables, is through a mechanism called
`foreign keys`.

What `foreign keys` means, is this key refers to something in a foreign table,
a different table.

Let's take a look at `comments` table, because `comments` table contains some
interesting things:
```sql
CREATE TABLE comments (
  comment_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  board_id INT REFERENCES boards(board_id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  time TIMESTAMP
);
```

Comment is always posted by a user (technically a bot is also a user right?).
So if you're thinking about a reddit comment, a reddit user posts a reddit
comment. Those two things are linked. You must have a user that posts a
comment, every comment must have a user.

So, the `user_id` references the `users` table and specifically inside of that
table, it references `user_id`. If we narrow it down, it'll be like this:
```sql
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ...
)

...

CREATE TABLE comments (
  ...
  -- user_id on the left and user_id in users(user_id) doesn't have to be the same,
  -- you can use different name and it would be fine.
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  ...
)
```

Now, let's talk about `ON DELETE CASCADE`. Let's say user called `bruhtus`
posted a comment to a board, and then later a user `bruhtus` delete their
account. What should happen to those comments?

So if we left off `ON DELETE CASCADE`, it would just say "you can't delete this
account until you delete all the comments". It won't let you delete anything if
there has existing keys in another table.

Basically what `ON DELETE CASCADE` is, whenever a user gets deleted, go into the
comments table and delete all of the comments that they've made.

> `ON DELETE CASCADE` makes it easier to clean up, all we have to do is delete a
> user account, and all those comments just magically disappear.

There's also `ON DELETE SET NULL`, what this will do, it'll delete the user but
set the `user_id` on any comments that was made by the user to `null`.

> `ON DELETE SET NULL` can be useful if we want to keep track of the comments
> even if the user delete their account.

## Join

Let's preview the `comment_id`, `user_id`, and the `comment` from the user with
something like this:
```sql
-- `comment` is pretty long, if we display that at once it'll hard for
-- us to read.
-- so `LEFT(comment, 20)` means, give us the first 20 characters of the
-- `comment` and cut off the rest.
-- if we want to take the last character, we can use `RIGHT()`.

-- just kind of clean up the column name, it'll project this as `preview`.
-- it's just to make it easier to read, totally optional.

SELECT comment_id, user_id, LEFT(comment, 20) AS preview FROM comments WHERE board_id=69;
```

If there's no error, the output should be something like this:
```sh
 comment_id | user_id |       preview
------------+---------+----------------------
          6 |     721 | Curabitur gravida ni
         23 |     320 | Quisque id justo sit
         78 |     544 | Aenean lectus. Pelle
        155 |     700 | Quisque porta volutp
        243 |     219 | Phasellus in felis.
        297 |     408 | Cras mi pede, malesu
        400 |     305 | Suspendisse potenti.
        562 |     530 | Cras mi pede, malesu
        784 |     498 | Phasellus in felis.
        820 |     879 | Aenean fermentum. Do
        979 |     893 | In hac habitasse pla
(11 rows)
```

Now, if we going to display that to the our user, usually our user doesn't care
what their user id is. They want to know the username. But where's that username
information? where's that username actually live?

The username information didn't (or more like shouldn't) live in the `comments`
table, it live in the `users` table.

**This kind of bring us back to the foundational truth of databases, we wanna
have one source of truth**.

So for `username`, we wanna have one place where that `username` is stored and
then you want to use that `username` everywhere else. We don't want to duplicate
the data, we want to have a single source of truth.

> Let's say instead of `user_id`, we had `username` and we were doing everything
> by `username`. That's bad because if the user ever updates their `username`,
> we now have to change the `username` everywhere.
>
> Data always falls out sync, you can never keep data in sync.
>
> So instead of that, we have a `users` table that contains the user data and
> we're gonna use the `user_id` as foreign key and refer to that everywhere.
>
> If the user updated their `username`, they updated it in one place and it
> everywhere.

Now, let's make a better query that's going to return us that particular user's
username:
```sql
-- we have to give the clause of how to match things up.

-- `comments.user_id = users.user_id` means if these two match up, go together.

-- we can put `user_id` instead of `user_id` but it's not really a good idea
-- because we can't be ambiguous about it.

-- on the other hand, we can use `comment_id` instead of `comments.comment_id`
-- because `comment_id` only live in the `comments` table (unless we have
-- `comment_id` somewhere else).

SELECT comment_id, comments.user_id, users.username, time, LEFT(comment, 20) AS preview FROM comments INNER JOIN users ON comments.user_id = users.user_id WHERE board_id=69;
```

If there's no error, the results should be something like this:
```sh
 comment_id | user_id |   username    |        time         |       preview
------------+---------+---------------+---------------------+----------------------
        243 |     219 | gde62         | 2019-08-21 07:01:01 | Phasellus in felis.
        400 |     305 | cstebles8g    | 2020-09-02 20:04:31 | Suspendisse potenti.
         23 |     320 | mhamsson8v    | 2020-03-13 00:56:44 | Quisque id justo sit
        297 |     408 | rhenstridgebb | 2019-07-10 10:18:50 | Cras mi pede, malesu
        784 |     498 | hjumeaudt     | 2020-05-01 00:44:03 | Phasellus in felis.
        562 |     530 | sdallynep     | 2019-02-14 09:54:49 | Cras mi pede, malesu
         78 |     544 | bdotterillf3  | 2018-10-20 09:35:49 | Aenean lectus. Pelle
        155 |     700 | jyakebovichjf | 2018-12-10 00:55:18 | Quisque porta volutp
          6 |     721 | tberreyk0     | 2019-05-25 13:46:06 | Curabitur gravida ni
        820 |     879 | fginnaneoe    | 2018-11-16 02:56:52 | Aenean fermentum. Do
        979 |     893 | jpowdrillos   | 2018-08-16 10:00:51 | In hac habitasse pla
(11 rows)
```

> What we do above is one `join`, there's a multiple `join` too which probably
> gonna be covered later.

Now that we know the `username`, we have enough data to go back and actually
correlate it. This is enough data for us to actually make the display of the
message board for board 69.

> The instructor didn't say the criteria for the message board, and i have
> no idea what it is.

That is how you do `join` in SQL. This is kind of like one of the big powerful
things about relational database is that, one user can have multiple comments,
we don't have to store that user's information across many comments. Whereas in
NoSQL database such as MongoDB, that actually might be the correct way to do it.

> In SQL, we can store the users in one spot, and their many comments in another
> place.

Below is the illustration of SQL joins:
![sql-joins-illustration](./images/sql-joins.png)

What you're seeing above is, if we have records in both one of these, that
both matches the `WHERE` but doesn't join, what do you want the SQL to do with
that.

### INNER JOIN

`INNER JOIN` be like, "it must have a match or don't include it". So if we had
a `comment` that didn't have a `user` match up in the `users` table, in a
`INNER JOIN` situation, you would drop that comment.

> If the `user_id` was set to null, we won't include it.

### LEFT JOIN

If we had `comments` that didn't have `user` and we wanted to include those
comments despite the fact that they didn't have `user`, `INNER JOIN` would
eliminate that, but `LEFT JOIN` would include them and include anything in
that querying table that doesn't have a match in the right table.

> Take a look at the course page for more info:
> [JOIN](https://btholt.github.io/complete-intro-to-databases/complex-sql-queries#join).

## Subqueries

Subqueries allow you to do a query within a query.

Let's say we want to query all of the comments left by someone named Maynard.
We don't actually have that available to us and there's no useful way to join
on that. So, what we can do is we can do a query to find Maynord's user id, then
use that user id to query for all the comments.

This is how we do a subqueries:
```sql
-- the parentheses after `user_id =` is the signal for SQL that we want to do
-- a query within a query.

SELECT comment_id, user_id, LEFT(comment, 20) FROM comments WHERE user_id = (SELECT user_id FROM users WHERE full_name = 'Maynord Simonich');
```

How the subqueries above works is that, those will run the `(SELECT user_id FROM users WHERE full_name = 'Maynord Simonich')` command first and find the
`user_id` for `Maynord Simonich` and then it will use the result in the main query to find all the user's comments.

If there's no error, the result should be something like this:
```sh
 comment_id | user_id |         left
------------+---------+----------------------
        208 |      40 | Nullam porttitor lac
        275 |      40 | Sed sagittis. Nam co
        624 |      40 | Integer ac leo. Pell
        917 |      40 | Cras mi pede, malesu
(4 rows)
```

## Group By

Let's say we want to find the top ten most posted boards. So we want to query
the board's table, find all the boards, and then we take a look in the
comments tables and figure out which one has the most amount of comments.

So we're gonna use group by to figure out that kind of aggregate number of
comments per board and then we're gonna do a `GROUP BY` with that.

We can do that with something like this:
```sql
-- the `DESC` is because we want to see the most comments first.

SELECT boards.board_name, COUNT(*) AS comment_count FROM comments INNER JOIN boards ON boards.board_id = comments.board_id GROUP BY boards.board_name ORDER BY comment_count DESC LIMIT 10;
```

If there's no error, the result should be something like this:
```sh
      board_name      | comment_count
----------------------+---------------
 Cloned               |            18
 budgetary management |            18
 open system          |            16
 Universal            |            16
 analyzer             |            15
 puppies              |            15
 Balanced             |            14
 leverage             |            14
 Seamless             |            14
 Innovative           |            13
(10 rows)
```

Now, here's the problem. What happens if a board has zero comment? (there's a
board in there that has zero comment).

Because we're doing `INNER JOIN`, what happen when there's no match?
It get left out of the dataset.

Which `JOIN` should we use? We wan to use `RIGHT JOIN` in this particular case.

> If we use `LEFT JOIN`, it would include all rows of `comments` table.
> But, if we use `RIGHT JOIN`, it would include all rows of `boards` table.

```sql
-- we omitted the `DESC` because we want to see the less comments first.

SELECT boards.board_name, COUNT(*) AS comment_count FROM comments RIGHT JOIN boards ON boards.board_id = comments.board_id GROUP BY boards.board_name ORDER BY comment_count LIMIT 10;
```

Below is the results when there's no zero comment
(still using `INNER JOIN` instead of `RIGHT JOIN`):
```sh
   board_name    | comment_count
-----------------+---------------
 Diverse         |             4
 neutral         |             5
 heuristic       |             6
 De-engineered   |             6
 Polarised       |             6
 cars            |             6
 whiskey         |             6
 Mandatory       |             6
 functionalities |             6
 beer            |             6
(10 rows)
```

And below is the results when after we include every rows in `boards` table
(after using `RIGHT JOIN`):
```sh
   board_name    | comment_count
-----------------+---------------
 fire            |             1
 Diverse         |             4
 neutral         |             5
 heuristic       |             6
 Polarised       |             6
 cars            |             6
 De-engineered   |             6
 whiskey         |             6
 functionalities |             6
 Mandatory       |             6
(10 rows)
```

As we can see, we have `fire` board now and the result say `fire` has
one comment but we know that's not true.

`fire` board doesn't have one comment, it has zero comment. Why is that?
It's because `COUNT(*)`(`COUNT(*)` is called an aggregation function)
counting a board with nothing in it, and it's counting all the lines.
And there's a line being included from that `fire`, which is not the right
thing.

So, what do we actually want to count? We don't want to count any row, we only
want to count rows that actually has a comment in it. In that case, we can just
count the `comment_id` because only the real comment get the `comment_id`. The
query would be something like this:
```sql
SELECT boards.board_name, COUNT(comment_id) AS comment_count FROM comments RIGHT JOIN boards ON boards.board_id = comments.board_id GROUP BY boards.board_name ORDER BY comment_count LIMIT 10;
```

And if there's no error, the results should be like this:
```sh
   board_name    | comment_count
-----------------+---------------
 fire            |             0
 Diverse         |             4
 neutral         |             5
 heuristic       |             6
 Polarised       |             6
 cars            |             6
 De-engineered   |             6
 whiskey         |             6
 functionalities |             6
 Mandatory       |             6
(10 rows)
```
and as we can see, the `fire` board is now zero which means it doesn't have any comments
like how it should be.

## JSON in PostgreSQL

One of the cool features of postgres is that it's kind of ends up being a multi
paradigm database because postgres has the ability to do unstructured data
within SQL.

We can store JSON as data type in postgres, and then postgres know how to query
JSON for you.

So we can have a mixed of schema and schemaless data that lives side by side
in the same thing.

**The cool thing about this JSON data type is that it doesn't have to have
schema. So we can put whatever we want in it**.

If we take a look at the existing table we created with the `sample-postgresql.sql`
previously, we can see that there's a `rich_content` table there:
```sh
                     List of relations
 Schema |            Name             |   Type   |  Owner
--------+-----------------------------+----------+----------
 public | boards                      | table    | postgres
 public | boards_board_id_seq         | sequence | postgres
 public | comments                    | table    | postgres
 public | comments_comment_id_seq     | sequence | postgres
 public | rich_content                | table    | postgres
 public | rich_content_content_id_seq | sequence | postgres
 public | users                       | table    | postgres
 public | users_user_id_seq           | sequence | postgres
(8 rows)
```

And if we take a look at the `rich_content` columns like this:
```sql
CREATE TABLE rich_content (
  content_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  comment_id INT REFERENCES comments(comment_id) ON DELETE CASCADE,
  content JSON NOT NULL
);
```
as we can see, the `content` is a `JSON` data type and it's `NOT NULL`.

> I changed the `JSONB` to `JSON` because there's an error in the letter part
> of the course that need to use `JSON` instead of `JSONB`. With `JSONB` the
> error message didn't appear.

> From [postgres documentation](https://www.postgresql.org/docs/9.4/datatype-json.html):
> There are two JSON data types: json and jsonb. They accept almost identical
> sets of values as input. The major practical difference is one of efficiency.
> The json data type stores an exact copy of the input text, which processing
> functions must reparse on each execution; while jsonb data is stored in a
> decomposed binary format that makes it slightly slower to input due to added
> conversion overhead, but significantly faster to process, since no reparsing
> is needed. jsonb also supports indexing, which can be a significant advantage.

> From [the course website](https://btholt.github.io/complete-intro-to-databases/json-in-postgresql):
> when you're creating your own database you almost always (let's just say always) want
> to choose JSONB because it stores the data in a more queryable format and more
> optimized for querying whereas JSON is a glorified text field.

Imagine we're making making a message board, anyone had the ability to embed
videos, embed polls, and embed images. We want to have this rich content
experience.

We can do that with this `JSON` data type because those things are gonna be
amorphous (without a clearly defined shape or form).

Let's write a query for it:
```sql
-- `content` is one of JSON columns in `rich_content` table.

-- `type` is one of attributes in `content` column.

SELECT content -> 'type' FROM rich_content;
```

If there's no error, the results should be something like this:
```sh
 ?column?
----------
 "poll"
 "video"
 "poll"
 "image"
 "image"
(5 rows)
```

Basically the command we run before, grab the `type` value of every item in
`content` column. The `?column?` is because we didn't give it a name. If we do
something like this:
```sql
SELECT content -> 'type' AS content_type FROM rich_content;
```

And the `?column?` become `content_type` like this:
```sh
 content_type
--------------
 "poll"
 "video"
 "poll"
 "image"
 "image"
(5 rows)
```

> This `JSON` data type will enforce that you putting in the proper `JSON`.
>
> So if you try and put something like string of not well-formed `JSON`, it'll
> rebel and won't insert the content. It must be valid `JSON`.

Now, let's say we're making some sort of drop down selector for our
`rich_content` table and we want to have a drop down of all the various
different types that we can support.

Well, we already did it with:
```sh
 content_type
--------------
 "poll"
 "video"
 "poll"
 "image"
 "image"
(5 rows)
```
but there's a few component twice there (poll and image). It would be nice if
we can select the distinct ones.

There's `DISTINCT` operator that we can use, but there's a problem when using
the `DISTINCT` operator. If we do something like this:
```sql
SELECT DISTINCT content -> 'type' AS content_type FROM rich_content;
```

It'll give an error like this:
```sh
ERROR:  could not identify an equality operator for type json
LINE 1: SELECT DISTINCT content -> 'type' AS content_type FROM rich_...
                        ^
```
the problem is that the `type` that we got back from `content` column is not a
string but a `JSON`, and postgres doesn't know what to do with these.

> The output we got looks like a string, but it's actually not a string. That's
> a trap!

One of the solution is something like this:
```sql
-- `CAST(content -> 'type' AS TEXT)` means to use all the text operation here.

SELECT DISTINCT CAST(content -> 'type' AS TEXT) AS content_type FROM rich_content;
```

And that will ended up working:
```sh
 content_type
--------------
 "image"
 "poll"
 "video"
(3 rows)
```

> That's the error that i was talking about previously. If we use `JSONB`
> instead of `JSON`, it won't give an error for whatever reason. Still
> not sure what is the difference at the moment.

**`SELECT DISTINCT` will remove the duplicate whatever returns to you**.

Another nicer solution that we can use is something like this:
```sql
-- the `->>` basically saying "whatever we select out of this, just cast it
-- as a text immediately.

SELECT DISTINCT content ->> 'type' AS content_type FROM rich_content;
```

If there's no error, the result should be something like this:
```sh
 content_type
--------------
 video
 poll
 image
(3 rows)
```
and as we can see, the result even lack the quote.

> The point of this problem is that postgres didn't know what comes out of a
> `JSON`, we have to tell postgres explicitly what is coming out of the `JSON` or postgres don't know what to do with it.

Now, let's say instead of `type`, we want `dimensions`. We can do something
like this:
```sql
SELECT content -> 'dimensions' AS content_type FROM rich_content;
```

And if there's no error, the result should be something like this:
```sh
           content_type
-----------------------------------

 { "height": 1080, "width": 1920 }

 { "height": 400, "width": 1084 }
 { "height": 237 , "width": 3301 }
(5 rows)
```
and as we can see, there's two blank line there. Let's check all the `rich_content` record again:
```sh
 content_id | comment_id |                                                                           content
------------+------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------
          1 |         63 | { "type": "poll", "question": "What is your favorite color?", "options": ["blue", "red", "green", "yellow"] }
          2 |        358 | { "type": "video", "url": "https://youtu.be/dQw4w9WgXcQ", "dimensions": { "height": 1080, "width": 1920 }}
          3 |        358 | { "type": "poll", "question": "Is this your favorite video?", "options": ["yes", "no", "oh you"] }
          4 |        410 | { "type": "image", "url": "https://btholt.github.io/complete-intro-to-linux-and-the-cli/WORDMARK-Small.png", "dimensions": { "height": 400, "width": 1084 }}
          5 |        485 | { "type": "image", "url": "https://btholt.github.io/complete-intro-to-linux-and-the-cli/HEADER.png", "dimensions": { "height": 237 , "width": 3301 }}
(5 rows)
```
as we can see, the `poll` type doesn't have `dimensions`. So, if we didn't explicitly exclude them, postgres will also return the null value as object.

> It's basically postgres just saying "I will give you whatever you ask for.
> but if you ask me to do comparison, and operations in addition, or stuff
> like this. You gotta tell me upfront that i'm getting a string, a number,
> that kind of stuff".

Now, if we want to exclude everything that doesn't have `dimensions`, we can do
something like this:
```sql
-- we need to tell postgres that we don't want any `null` things back.

SELECT content -> 'dimensions' AS content_type FROM rich_content WHERE content ->> 'dimensions' IS NOT NULL;
```

If there's no error, the result should be something like this:
```sh
           content_type
-----------------------------------
 { "height": 1080, "width": 1920 }
 { "height": 400, "width": 1084 }
 { "height": 237 , "width": 3301 }
(3 rows)
```

Now, let's say what we want to do right now is select all the heights and
widths for things that have height and width. We can do something like this:
```sql
SELECT content -> 'dimensions' ->> 'height' AS height, content -> 'dimensions' ->> 'width' AS width FROM rich_content WHERE content -> 'dimensions' IS NOT NULL;
```

If there's no error, the result should be something like this:
```sh
 height | width
--------+-------
 1080   | 1920
 400    | 1084
 237    | 3301
(3 rows)
```

> That's how we do a multi level depth query with `JSON` data type.

Just like in MongoDB, performance and cost is always a concern. Let's examine
one particular query:
```sql
SELECT comment_id, user_id, time, LEFT(comment, 20) AS comment FROM comments WHERE board_id=69 ORDER BY time DESC LIMIT 40;
```

If there's no error, the result should be like this:
```sh
 comment_id | user_id |        time         |       comment
------------+---------+---------------------+----------------------
        400 |     305 | 2020-09-02 20:04:31 | Suspendisse potenti.
        784 |     498 | 2020-05-01 00:44:03 | Phasellus in felis.
         23 |     320 | 2020-03-13 00:56:44 | Quisque id justo sit
        243 |     219 | 2019-08-21 07:01:01 | Phasellus in felis.
        297 |     408 | 2019-07-10 10:18:50 | Cras mi pede, malesu
          6 |     721 | 2019-05-25 13:46:06 | Curabitur gravida ni
        562 |     530 | 2019-02-14 09:54:49 | Cras mi pede, malesu
        155 |     700 | 2018-12-10 00:55:18 | Quisque porta volutp
        820 |     879 | 2018-11-16 02:56:52 | Aenean fermentum. Do
         78 |     544 | 2018-10-20 09:35:49 | Aenean lectus. Pelle
        979 |     893 | 2018-08-16 10:00:51 | In hac habitasse pla
(11 rows)
```
that's an example of something that we'd might be doing a lot for a message
board. We might be querying a specific message board database for the comments.

Now, let's take a look at the performance profile of that particular query. Like
MongoDB, we also use `explain` like this:
```sql
EXPLAIN SELECT comment_id, user_id, time, LEFT(comment, 20) FROM comments WHERE board_id=69 ORDER BY time DESC LIMIT 40;
```

If there's no error, the result should be something like this:
```sh
                              QUERY PLAN
-----------------------------------------------------------------------
 Limit  (cost=65.72..65.75 rows=11 width=48)
   ->  Sort  (cost=65.72..65.75 rows=11 width=48)
         Sort Key: "time" DESC
         ->  Seq Scan on comments  (cost=0.00..65.53 rows=11 width=48)
               Filter: (board_id = 69)
(5 rows)
```

The instructor didn't say what `cost` is measuring, but 65 is a lot (whatever
that means).

Just like `COLLSCAN` in MongoDB, the thing that we should be afraid in postgres
is `Seq Scan`. What `Seq Scan` basically means looking at every single comment
in database every single time that we run that query.

If that's the query we're gonna be doing a lot, we should index that like this:
```sql
CREATE INDEX ON comments (board_id);
```
what that command means is that, on `comments` table, create index on the
`board_id` because that's something that we're going to query quite a bit.

**Don't just mindlessly create an index in production, that's a very expensive
command that could take down the server**.

Now, if we use `explain` again like this:
```sql
EXPLAIN SELECT comment_id, user_id, time, LEFT(comment, 20) FROM comments WHERE board_id=69 ORDER BY time DESC LIMIT 40;
```

If there's no error, the result should be something like this:
```sh
                                           QUERY PLAN
-------------------------------------------------------------------------------------------------
 Limit  (cost=31.68..31.71 rows=11 width=48)
   ->  Sort  (cost=31.68..31.71 rows=11 width=48)
         Sort Key: "time" DESC
         ->  Bitmap Heap Scan on comments  (cost=4.36..31.49 rows=11 width=48)
               Recheck Cond: (board_id = 69)
               ->  Bitmap Index Scan on comments_board_id_idx  (cost=0.00..4.36 rows=11 width=0)
                     Index Cond: (board_id = 69)
(7 rows)
```
instead of `Seq Scan on comments`, what we're seeing now is
`Bitmap Heap Scan on comments`.

The `comments_board_id_idx` in `Bitmap Index Scan on comments_board_id_idx` is
the name of the index.

And the `cost` turned down quite a bit, from 65 (before the indexing), to 31
(after the indexing).

Another thing we can do is, let's say we want to make sure that all username
have a unique username. We can do that with a unique index like this:
```sql
CREATE UNIQUE INDEX username_idx ON users(username);
```
now, not only we have an index on `username` from the `users` table, we can also
totally assure that all of them are gonna be unique going forward.

**This will fail if there's already a duplicate in there, we need to sort out
the duplicate first before we can create a unique index**.

Let's try inserting the same username (assume that the username already exist)
like this:
```sql
INSERT INTO users (username, email, full_name, created_on) VALUES ('aaizikovj', 'lol@example.com', 'Brian Holt', NOW());
```
that will give an error like this:
```sh
ERROR:  duplicate key value violates unique constraint "users_username_key"
DETAIL:  Key (username)=(aaizikovj) already exists.
```

**JSON in postgres can be useful but querying in it is not as nice as in NoSQL
database such as MongoDB**.

> For more types of index in postgres, you can check [this website](https://www.postgresql.org/docs/13.0/indexes.html).

## Node.js App with PostgreSQL

We use `Pool` object from postgres.

So, how does `Pool` works?
In MongoDB, MongoDB was kind of managing all of our connections for us.
With PostgreSQL, PostgreSQL created a bunch of connections from your server
to PostgreSQL and then reuses them.
So as soon as we say "connect this", it'll actually give us an old connection
so that we can be instantly connected. And that way, in the process of using
them:
1. We don't overwhelm our PostgreSQL server with a bunch of open and close
connections.
2. Our connection will end up being faster because it doesn't actually have to
do the handshake again (because it's actually still connected to PostgreSQL).

## SQL Injection

**Everything that comes from the user, we have to assume as hostile**.

Now, let's go back to take a look at the sample app snippet. The original
snippet would be like this:
```javascript
      client.query(
        'SELECT DISTINCT user_id, comments.comment_id, LEFT(comment, 20) AS comment FROM comments LEFT JOIN rich_content ON comments.comment_id = rich_content.comment_id WHERE board_id=$1', [req.query.search]
      ),
```

Instead of using the snippet above, we do something like this:
```javascript
      client.query(
        `SELECT DISTINCT user_id, comments.comment_id, LEFT(comment, 20) AS comment FROM comments LEFT JOIN rich_content ON comments.comment_id = rich_content.comment_id WHERE board_id=${req.query.search}`
      ),
```
basically putting the search input inside of the query directly.

Why putting the search input inside of the query directly is a bad idea?

Because the user could input something else other than the number, like
the user could input the SQL.

What happens if the user input something like `1; DROP TABLE users; --`?
It's going to drop/delete our `users` table! That's a huge problem.

> If we put `;`, we can start writing more queries. `--` at the end is to
> commented out if we have more queries after that.

So, what is SQL Injection?

**SQL Injection is interpreting user input directly as SQL**.

That's why we didn't use SQL Injection like this:
```javascript
      client.query(
        `SELECT DISTINCT user_id, comments.comment_id, LEFT(comment, 20) AS comment FROM comments LEFT JOIN rich_content ON comments.comment_id = rich_content.comment_id WHERE board_id=${req.query.search}`
```
instead of that, we use **Parameterized Queries** like this:
```javascript
      client.query(
        'SELECT DISTINCT user_id, comments.comment_id, LEFT(comment, 20) AS comment FROM comments LEFT JOIN rich_content ON comments.comment_id = rich_content.comment_id WHERE board_id=$1', [req.query.search]
```

Why we should do Parameterized Queries in this case?

Because, the postgres driver (which is called `pg`), goes and escapes all of
the user input and says "nothing SQL related can exist in the user input".
Basically the driver will protect us from the user.

> That could also potentially lead to data leak if the user can query as they
> pleases.

## Hasura

Hasura is a tool that allows you to treat your database like it was GraphQL
data source.

We'll make a new docker container with the command below:
```sh
docker run -d -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:mysecretpassword@host.docker.internal:5432/message_boards \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true --name=my-hasura --rm \
  hasura/graphql-engine:v1.3.2
```

> You can check the full instruction for hasura in the [course website](https://btholt.github.io/complete-intro-to-databases/hasura).
> For whatever reason, every time i create docker container, the hasura
> container disappear after less than 5 minutes which is weird.

## Q&A

- Is there any default length or do we always have to specify length for each field?

> With `VARCHAR`, we do have to specify how long the string is, or how long the
> string could potentially be. If we use `TEXT`, it's basically saying "OK, we
> gave up, there's no upper bounds on this".

- Is there any way to recover the deleted record?

> No. Once it's deleted, it's gone. So you should be very cautious of what you
> delete.
>
> There's a work around for that, usually called "soft delete" where you put the
> row in one table to "deleted table" and clean up those "deleted table" every
> 30 days or something.
