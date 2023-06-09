const versement_model = require('./../models/versement')

const getVersements = (req, res) => {
    versement_model.getVersements(req, res)
}

const getClientSolde = (req, res) => {
    versement_model.getClientSolde(req, res)
}

const versement = (req, res) => [
    versement_model.versement(req, res)
]

const supprimerversement = (req, res) => [
    versement_model.supprimerversement(req, res)
]

const modifierversement = (req, res) => [
    versement_model.modifierversement(req, res)
]

const rechercheParDate = (req, res) => [
    versement_model.rechercheParDate(req, res)
]
module.exports = {
    versement,
    getClientSolde,
    supprimerversement,
    modifierversement,
    rechercheParDate,
    getVersements
}