const { pool } = require("./pollpg");

const getVersements = (req, res) => {
  pool.query("SELECT * FROM versement", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};
const getClientSolde = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);

  pool.query(
    "SELECT solde FROM client WHERE numero_compte = $1",
    [numero_compte],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};

const versement = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);
  const montant_versement = parseInt(req.body.montant_versement);
  const numero_cheque = req.body.numero_cheque;

  // Récupérer le solde actuel du client
  pool.query(
    "SELECT solde FROM client WHERE numero_compte = $1",
    [numero_compte],
    (error, results) => {
      if (error) {
        throw error;
      }

      const solde = parseInt(results.rows[0].solde);
      console.log(solde);
      const nouveauSolde = solde + montant_versement;
      console.log(nouveauSolde);

      // Mettre à jour le solde du client après le retrait
      pool.query(
        "UPDATE client SET solde = $1 WHERE numero_compte = $2",
        [nouveauSolde, numero_compte],
        (error) => {
          if (error) {
            throw error;
          }

          // Insérer les données de retrait dans la table "retrait"
          const date_versement = new Date(); // Obtenir la date et l'heure actuelles
          const values = [
            numero_compte,
            numero_cheque,
            montant_versement,
            date_versement,
          ];
          console.log(date_versement);
          pool.query(
            "INSERT INTO versement (numero_compte, numero_cheque, montant_versement, date) VALUES ($1, $2, $3, $4)",
            values,
            (error) => {
              if (error) {
                throw error;
              }

              res
                .status(200)
                .send(
                  `Versement de ${montant_versement} Ariary effectué avec succès. Nouveau solde : ${nouveauSolde} Ariary`
                );
            }
          );
        }
      );
    }
  );
};

const supprimerversement = (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);

  //Récupérer le numéro de compte et le versement à retirer
  pool.query(
    "SELECT numero_compte, montant_versement FROM versement WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      const numero_compte = parseInt(results.rows[0].numero_compte);
      console.log(numero_compte);
      const soldeSup = parseInt(results.rows[0].montant_versement);
      console.log(soldeSup);

      //Soustraire le solde dans la table client par le versement à retirer
      pool.query(
        "UPDATE client SET solde = solde - $1 WHERE numero_compte = $2",
        [soldeSup, numero_compte],
        (error) => {
          if (error) {
            throw error;
          }

          //Supprimer le versement correspondant
          pool.query(
            "DELETE FROM versement WHERE id = $1",
            [id],
            (error, results) => {
              if (error) {
                throw error;
              }
              res.status(200).send(`Versement supprimé ayant l'ID: ${id}`);
            }
          );
        }
      );
    }
  );
};

const modifierversement = (req, res) => {
  const id = parseInt(req.params.id);
  console.log(id);
  const soldeModif = parseInt(req.body.montant_versement);
  const numero_cheque = req.body.numero_cheque;

  console.log(soldeModif);

  //Récupérer le numéro de compte et le versement
  pool.query(
    "SELECT numero_compte, montant_versement FROM versement WHERE id = $1",
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }

      const numero_compte = parseInt(results.rows[0].numero_compte);
      console.log(numero_compte);
      const ancien_versement = parseInt(results.rows[0].montant_versement);
      console.log(ancien_versement);

      if (soldeModif < 0) {
        res.status(400).send("Erreur ! Ce versement ne sera pas possible.");
      } else {
        //Enlever l'ancien versement dans le solde du client
        pool.query(
          "UPDATE client SET solde = solde - $1 WHERE numero_compte = $2",
          [ancien_versement, numero_compte],
          (error) => {
            if (error) {
              throw error;
            }

            //Ajouter le nouveau versement modifié dans le solde du client
            pool.query(
              "UPDATE client SET solde = solde + $1 WHERE numero_compte = $2",
              [soldeModif, numero_compte],
              (error) => {
                if (error) {
                  throw error;
                }
                //Obtenir la date de modification
                const date_modif = new Date();
                console.log(date_modif);

                //Modifier le versement correspondant
                pool.query(
                  "UPDATE versement SET numero_cheque = $1, montant_versement = $2, date_modification = $3 WHERE id = $4",
                  [numero_cheque, soldeModif, date_modif, id],
                  (error, results) => {
                    if (error) {
                      throw error;
                    }
                    res.status(200).send(`Versement modifié ayant l'ID: ${id}`);
                  }
                );
              }
            );
          }
        );
      }
    }
  );
};

//Recherche par date et par numéro de chèque
const rechercheParDate = (req, res) => {
  const { date, numero_cheque } = req.body;
  let query = "SELECT * FROM versement WHERE ";
  let values = [];

  if (date && numero_cheque) {
    query += "date_trunc('day', date) = $1::DATE AND numero_cheque = $2::TEXT";
    values.push(date, numero_cheque);
  } else if (date) {
    query += "date_trunc('day', date) = $1::DATE";
    values.push(date);
  } else if (numero_cheque) {
    query += "numero_cheque = $1::TEXT";
    values.push(numero_cheque);
  } else if (req.query.month) {
    const month = parseInt(req.query.month);
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json([]);
    }
    query += "EXTRACT(MONTH FROM date) = $1";
    values.push(month);
  } else if (req.query.year) {
    const year = parseInt(req.query.year);
    if (isNaN(year) || year < 1) {
      return res.status(400).json([]);
    }
    query += "EXTRACT(YEAR FROM date) = $1";
    values.push(year);
  } else {
    // Si aucun champ n'est spécifié, renvoyer une réponse vide
    return res.status(400).json([]);
  }

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
};

module.exports = {
  versement,
  getClientSolde,
  supprimerversement,
  modifierversement,
  rechercheParDate,
  getVersements,
};
