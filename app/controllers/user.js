const utilisateurModel = require('./../models/user')

const getUtilisateurs = (req, res) => {
    res.json({
        "message": "User"
    })
}

const getUtilisateur = (req, res) => {
    res.json({
        "message": "User"
    })
}

const createUtilisateur = (req, res) => {
    utilisateurModel.createUtilisateur(req, res)
}

const loginUtilisateur = (req, res) => {
    utilisateurModel.loginUtilisateur(req, res)
}

module.exports = {
    getUtilisateurs,
    getUtilisateur,
    createUtilisateur,
    loginUtilisateur

}