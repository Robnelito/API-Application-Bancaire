const router = require('express').Router()
const transferController = require('../controllers/transfert');

// Route pour récupérer le solde d'un client
router.get('/solde/:numero_compte', transferController.getClientSolde);

// Route pour effectuer un transfert de fonds
router.post('/', transferController.effectuerTransfert);

module.exports = router;
