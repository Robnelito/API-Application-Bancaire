const transfertModel = require("../models/transfert");

const getClientSolde = async (req, res) => {
  const { numero_compte } = req.params;
  try {
    const solde = await transfertModel.getClientSolde(numero_compte);
    res.json({ solde });
  } catch (error) {
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération du solde du client",
    });
  }
};

const getTransfert = (req, res) => {
  transfertModel.getTransfert(req, res);
};

const getTransfertById = (req, res) => {
  transfertModel.getTransfertById(req, res);
};

const effectuerTransfert = async (req, res) => {
  const { numero_compte_source, numero_compte_destination, montant } = req.body;
  console.log(numero_compte_destination);
  console.log(numero_compte_source);
  console.log(montant);

  try {
    const soldeSource = await transfertModel.getClientSolde(
      numero_compte_source
    );
    const soldeDestination = await transfertModel.getClientSolde(
      numero_compte_destination
    );

    if (soldeSource < montant) {
      return res.status(400).json({ error: "Solde insuffisant" });
    }

    const nouveauSoldeSource = soldeSource - montant;
    const nouveauSoldeDestination = soldeDestination + montant;

    await transfertModel.transfertFonds(
      numero_compte_source,
      nouveauSoldeSource,
      numero_compte_destination,
      nouveauSoldeDestination,
      montant
    );

    res.status(200).json({ message: "Transfert effectué avec succès" });
  } catch (error) {
    res.status(500).json({
      error: "Une erreur est survenue lors du transfert de fonds",
    });
  }
};

module.exports = {
  getClientSolde,
  getTransfert,
  getTransfertById,
  effectuerTransfert,
};
