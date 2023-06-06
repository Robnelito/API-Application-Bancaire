const retraitModel = require('./../models/retrait')

const getClientSolde = (req, res) => {
    retraitModel.getClientSolde(req, res)
}

const retrait = (req, res) => {
    retraitModel.retrait(req, res)
}

module.exports = {
    getClientSolde,
    retrait
}