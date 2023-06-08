const router = require('express').Router()
const clientController = require('./../controllers/client')
// const auth = require("./../middleware/auth");

router.get('/', clientController.getClients)
router.get('/:numero_compte', clientController.getClient)
router.post('/', clientController.createClient)
router.put('/:numero_compte', clientController.updateClient)
router.delete('/:numero_compte', clientController.deleteClient)
router.post('/chercher', clientController.searchClient)

module.exports = router