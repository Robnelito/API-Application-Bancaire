const bodyParser = require("body-parser");
const express = require('express')

const app = express()

const clientRouter = require('./routes/client')
const versementRouter = require('./routes/versement')
const retraitRouter = require('./routes/retrait')
// const utilisateurRouter = require('./routes/user')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/api', (req, res) => {
    res.json({
        "message": "Root"
    })
})

app.use('/api/client', clientRouter)
app.use('/api/versement', versementRouter)
app.use('/api/retrait', retraitRouter)
// app.use('/api/utilisateur', utilisateurRouter)


module.exports = app