const router = require("express").Router();
const versement_Controller = require("./../controllers/versement");
const auth = require("./../middleware/auth");

router.get("/", versement_Controller.getVersements);
router.get("/:numero_compte", versement_Controller.getClientSolde);
router.post("/:numero_compte", versement_Controller.versement);
router.delete("/:id", versement_Controller.supprimerversement);
router.put("/:id", versement_Controller.modifierversement);
router.post("/", versement_Controller.rechercheParDate);

module.exports = router;
