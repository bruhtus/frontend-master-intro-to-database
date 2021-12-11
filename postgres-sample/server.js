// ref: https://btholt.github.io/complete-intro-to-databases/nodejs-app-with-postgresql

const express = require('express')
// pool of connection hence the name `Pool`.
const { Pool } = require('pg')

// `postgres` is the default username. if you changed the username, use that instead.
// `mysecretpassword` is the password we created when using docker before.
// `message_boards` is the current database, you can check this using `\c`
const pool = new Pool({
  connectionString: 'postgresql://postgres:mysecretpassword@localhost:5432/message_boards'
})

const init = async () => {
  const app = express()

  // if there's previous connection, postgres will immediately give the
  // previous connection back, if it's not exist, it will make a new
  // connection.

  app.get('/get', async (req, res) => {
    const client = await pool.connect()

    // if someone goes to the board 69, we want to know that it's called
    // the `approach` board and we want to know the description of the `approach`
    // board, we also want to know all the comments on the `approach` board.
    // so we'll be doing 2 queries: the data of the board and the data of the comments

    // `Promise.all()` takes multiple promises and won't finish until everything is
    // finished.

    // `NATURAL JOIN` automatically find the match without we explicitly give the parameter.

    // `[req.query.search]` is like saying, "where ever there's a `$1` is, replace that
    // with `[req.query.search]`". This is called `Parameterised Queries`.

    // the reason why we doing the `Parameterised Queries` is, if we put the
    // `[req.query.search]` directly in the query, we're gonna have a huge problem with
    // what's called SQL injection.

    const [commentRes, boardRes] = await Promise.all([
      // use `DISTINCT` to remove the duplicate in the results.
      client.query(
        'SELECT DISTINCT user_id, comments.comment_id, LEFT(comment, 20) AS comment FROM comments LEFT JOIN rich_content ON comments.comment_id = rich_content.comment_id WHERE board_id=$1', [req.query.search]
      ),
      client.query(
        'SELECT * FROM boards WHERE board_id=$1',
        [req.query.search]
      ),
    ])

    res.status(200).json({
      status: 'nice',
      board: boardRes.rows[0] || {},
      posts: commentRes.rows
    }).end()
  })

  const PORT = 3000
  app.use(express.static('./static'))
  app.listen(PORT)

  console.log(`running on http://localhost:${PORT}`)
}

init()
