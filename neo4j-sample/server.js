// this app gonna take two people and it's gonna tell us the shortes path
// between those two people and how they're connected in movies.

const express = require('express')
const neo4j = require('neo4j-driver')

// bolt is the protocol that neo4j use instead of http.
// 7687 is the port that we use when we made the docker container:
// docker run -dit --rm --name=my-neo4j -p 7474:7474 -p 7687:7687 --env=NEO4J_AUTH=none neo4j:4.1.3

const connectionString = 'bolt://localhost:7687'

const driver = neo4j.driver(connectionString)

const init = async () => {
  const app = express()

  app.get('/get', async (req, res) => {
    // driver.session() is how we acquire a new session with the driver.

    const session = driver.session()

    // session.run() is where the query that we want to send.

    // cypher injection is a real thing too, be careful

    const results = await session.run(`
      MATCH path = shortestPath(
        (first:Person {name: $person1})-[*]-(second:Person {name: $person2})
      )
      UNWIND nodes(path) as node
      RETURN coalesce(node.name, node.title) AS text;
    `, {
      person1: req.query.person1,
      person2: req.query.person2
    })

  res.json({
    status: 'nice',
    path: results.records.map(record => record.get('text'))
  }).end()

  await session.close()

  })

  const PORT = 3000
  app.use(express.static('./static'))
  app.listen(PORT)
  console.log(`listening on http://localhost:${PORT}`)
}

init()
