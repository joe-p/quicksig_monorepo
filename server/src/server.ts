import express from 'express'
import path from 'path'
import crypto from 'crypto'
import * as redis from 'redis'
import { engine } from 'express-handlebars'

const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
})

const app = express()

redisClient.connect()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.join(__dirname, '../../client/dist')))
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, '../views'))

app.get('/:hash', async function (req, res) {
  const data = await redisClient.get(req.params.hash)
  res.render('quicksig', { metadata: JSON.parse(data).metadata, dataString: data })
})

app.post('/generate', function (req, res) {
  const data = req.body
  const hash = crypto.createHash('sha256').update(JSON.stringify(data.metadata)).digest('hex')

  if (data.hash === hash) {
    redisClient.set(hash, JSON.stringify(data))
    redisClient.expire(hash, 3600)

    res.status(200).send(hash)
  } else {
    res.sendStatus(500)
  }
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000')
})
