const router = require('express').Router()
const retraitController = require('./../controllers/retrait')

router.get('/:numero_compte', retraitController.getClientSolde)
router.post('/:numero_compte', retraitController.retrait)
router.put('/:numero_compte', retraitController.updateRetrait)

// router.get('/', (req, res) => {
//     res.json({
//         "message": "Retrait"
//     })
// })

module.exports = router