const { pool } = require("./pollpg");

const getClientSolde = (numero_compte) => {
  return new Promise((resolve, reject) => {
    pool.query(
      "SELECT solde FROM client WHERE numero_compte = $1",
      [numero_compte],
      (error, results) => {
        if (error) {
          reject(
            new Error(
              "Une erreur est survenue lors de la récupération du solde du client"
            )
          );
        } else {
          if (results.rows.length === 0) {
            reject(new Error("Aucun solde trouvé pour ce numéro de compte"));
          } else {
            // Renvoyer uniquement la valeur du solde
            const solde = results.rows[0].solde;
            resolve(solde);
          }
        }
      }
    );
  });
};

const getTransfert = (req, res) => {
  pool.query(
    "SELECT * FROM historique_transfert ORDER BY date_transfert ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};
const getTransfertById = (req, res) => {
  const numero_transfert = parseInt(req.params.numero_transfert);

  pool.query(
    "SELECT * FROM historique_transfert WHERE id = $1",
    [numero_transfert],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};

const transfertFonds = (
  numero_compte_source,
  nouveauSoldeSource,
  numero_compte_destination,
  nouveauSoldeDestination,
  montant
) => {
  return new Promise((resolve, reject) => {
    const queryMiseAJourSoldes = `
      UPDATE client
      SET solde = CASE
        WHEN numero_compte = $1 THEN $2::integer
        WHEN numero_compte = $3 THEN $4::integer
      END
      WHERE numero_compte IN ($1, $3)
    `;

    const queryInsertionHistorique = `
      INSERT INTO historique_transfert (numero_compte_source, numero_compte_destination, montant, date_transfert)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `;

    pool.query(
      queryMiseAJourSoldes,
      [
        numero_compte_source,
        nouveauSoldeSource,
        numero_compte_destination,
        nouveauSoldeDestination,
      ],

      (error, results) => {
        if (error) {
          reject(
            new Error("Une erreur est survenue lors du transfert de fonds")
          );
        } else {
          // Effectuer la requête d'insertion dans la table historique_transferts
          pool.query(
            queryInsertionHistorique,
            [numero_compte_source, numero_compte_destination, montant],
            (error, results) => {
              if (error) {
                console.log(error);
                reject(
                  new Error(
                    "Une erreur est survenue lors de l'insertion dans la table historique_transferts"
                  )
                );
              } else {
                resolve();
              }
            }
          );
        }
      }
    );
  });
};

module.exports = {
  getClientSolde,
  getTransfert,
  getTransfertById,
  transfertFonds,
};
