const versement_model = require ('./../models/versement')

const createVersement = (req,res) => {
    versement_model.createVersement(req,res)
}

module.exports = {
    createVersement
}