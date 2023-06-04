const router = require('express').Router()
const utilisateurController = require('./../controllers/user')

router.get('/', utilisateurController.getUtilisateurs)
router.get('/:numero_utilisateur', utilisateurController.getUtilisateurs)
router.post('/', utilisateurController.createUtilisateur)
router.post('/login', utilisateurController.loginUtilisateur)

module.exports = router