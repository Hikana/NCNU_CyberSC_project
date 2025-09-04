const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const gameRoutes = require('./routes/gameRoutes')
const buildingRoutes = require('./routes/buildingRoutes')

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/api', gameRoutes)
app.use('/api', buildingRoutes)

const PORT = 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
