const router = require('express').Router()
const versement_Controller = require('./../controllers/versement')
const auth = require("./../middleware/auth");

router.get('/', (req, res) => {
    res.json({
        "success": "true",
        "message": "versement"
    })
})
router.post('/', versement_Controller.createVersement)

module.exports = router