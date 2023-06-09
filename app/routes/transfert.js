const router = require("express").Router();
const transferController = require("../controllers/transfert");

// Route pour récupérer le solde d'un client
router.get("/solde/:numero_compte", transferController.getClientSolde);
router.get("/", transferController.getTransfert);
router.get("/:numero_transfert", transferController.getTransfertById);

// Route pour effectuer un transfert de fonds
router.post("/", transferController.effectuerTransfert);

module.exports = router;
