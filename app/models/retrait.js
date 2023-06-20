const { pool } = require("./pollpg");

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

const getRetrait = (req, res) => {
  pool.query(
    "SELECT * From retrait ORDER BY date_retrait ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};

const retrait = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);
  const montant_retrait = parseFloat(req.body.montant_retrait);
  const numero_cheque = req.body.numero_cheque;

  // Récupérer le solde actuel du client
  pool.query(
    "SELECT solde FROM client WHERE numero_compte = $1",
    [numero_compte],
    (error, results) => {
      if (error) {
        throw error;
      }

      const solde = parseFloat(results.rows[0].solde);

      if (solde < montant_retrait) {
        res.status(400).send("Solde insuffisant pour effectuer le retrait."); // Renvoyer un message d'erreur si le solde est insuffisant
      } else {
        const nouveauSolde = solde - montant_retrait;

        // Mettre à jour le solde du client après le retrait
        pool.query(
          "UPDATE client SET solde = $1 WHERE numero_compte = $2",
          [nouveauSolde, numero_compte],
          (error) => {
            if (error) {
              throw error;
            }

            // Insérer les données de retrait dans la table "retrait"
            const dateRetrait = new Date().toISOString(); // Obtenez la date de retrait au format ISO 8601 (avec heure et fuseau horaire)

            const values = [
              numero_compte,
              numero_cheque,
              montant_retrait,
              dateRetrait,
            ];

            pool.query(
              "INSERT INTO retrait (numero_compte, numero_cheque, montant_retrait, date_retrait) VALUES ($1, $2, $3, $4)",
              values,
              (error) => {
                if (error) {
                  throw error;
                }
                res
                  .status(200)
                  .send(
                    `Retrait de ${montant_retrait} effectué avec succès. Nouveau solde : ${nouveauSolde}`
                  );
              }
            );
          }
        );
      }
    }
  );
};

const updateRetrait = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);
  const numero_cheque = req.body.numero_cheque.toString();
  const montant_retrait = parseFloat(req.body.montant_retrait);

  pool.connect((error, client, release) => {
    if (error) {
      return res.status(500).send("Erreur de connexion à la base de données");
    }

    let transactionError = false; // Variable pour suivre les erreurs de la transaction

    client.query("BEGIN", (error) => {
      if (error) {
        release();
        return res.status(500).send("Erreur de transaction");
      }
      client.query(
        "SELECT montant_retrait FROM retrait WHERE numero_compte = $1 FOR UPDATE",
        [numero_compte],
        (error, result) => {
          if (error) {
            transactionError = true; // Marquer une erreur de transaction
            client.query("ROLLBACK", () => {
              release();
              return res.status(500).send("Erreur de requête");
            });
          }

          if (!transactionError) {
            // Vérifier s'il y a eu une erreur de transaction avant de continuer
            const ancienMontant = parseFloat(result.rows[0].montant_retrait);
            const differenceMontant = montant_retrait - ancienMontant;

            client.query(
              "UPDATE retrait SET numero_cheque = $1, montant_retrait = $2 WHERE numero_compte = $3",
              [numero_cheque, montant_retrait, numero_compte],
              (error, result) => {
                if (error || result.rowCount === 0) {
                  transactionError = true; // Marquer une erreur de transaction
                  client.query("ROLLBACK", () => {
                    release();
                    return res
                      .status(500)
                      .send("Erreur de mise à jour du retrait");
                  });
                }

                if (!transactionError) {
                  // Vérifier s'il y a eu une erreur de transaction avant de continuer
                  client.query(
                    "UPDATE client SET solde = solde - $1 WHERE numero_compte = $2",
                    [differenceMontant, numero_compte],
                    (error, result) => {
                      if (error || result.rowCount === 0) {
                        transactionError = true; // Marquer une erreur de transaction
                        client.query("ROLLBACK", () => {
                          release();
                          return res
                            .status(500)
                            .send("Erreur de mise à jour du solde");
                        });
                      }

                      if (!transactionError) {
                        // Vérifier s'il y a eu une erreur de transaction avant de continuer
                        client.query("COMMIT", (error) => {
                          if (error) {
                            client.query("ROLLBACK", () => {
                              release();
                              return res
                                .status(500)
                                .send("Erreur de validation de la transaction");
                            });
                          }

                          release();
                          res
                            .status(200)
                            .send(
                              `Retrait modifié pour le compte: ${numero_compte}`
                            );
                        });
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    });
  });
};

const deleteRetrait = (request, response) => {
  const numero_retrait = parseInt(request.params.numero_retrait);

  // Récupérer les informations du retrait avant de le supprimer
  pool.query(
    "SELECT numero_compte, montant_retrait FROM retrait WHERE numero_retrait = $1",
    [numero_retrait],
    (error, result) => {
      if (error) {
        throw error;
      }

      if (result.rowCount === 0) {
        return response
          .status(404)
          .send(
            `Aucun retrait trouvé avec le numéro de retrait : ${numero_retrait}`
          );
      }

      const numero_compte = result.rows[0].numero_compte;
      const montant_retrait = result.rows[0].montant_retrait;

      // Supprimer le retrait de la table "retrait"
      pool.query(
        "DELETE FROM retrait WHERE numero_retrait = $1",
        [numero_retrait],
        (error, deleteResult) => {
          if (error) {
            throw error;
          }

          if (deleteResult.rowCount === 0) {
            return response
              .status(404)
              .send(
                `Aucun retrait trouvé avec le numéro de retrait : ${numero_retrait}`
              );
          }

          // Mettre à jour le solde du client dans la table "client"
          pool.query(
            "UPDATE client SET solde = solde + $1 WHERE numero_compte = $2",
            [montant_retrait, numero_compte],
            (error, updateResult) => {
              if (error) {
                throw error;
              }

              response
                .status(200)
                .send(
                  `Retrait supprimé avec succès. Montant ajouté au solde du client.`
                );
            }
          );
        }
      );
    }
  );
};

const searchRetrait = (req, res) => {
  const { date_retrait, numero_cheque } = req.body;
  let query = "SELECT * FROM retrait WHERE ";
  let values = [];

  if (date_retrait && numero_cheque) {
    query +=
      "date_trunc('day', date_retrait) = $1::DATE AND numero_cheque = $2::TEXT";
    values.push(date_retrait, numero_cheque);
  } else if (date_retrait) {
    query += "date_trunc('day', date_retrait) = $1::DATE";
    values.push(date_retrait);
  } else if (numero_cheque) {
    query += "numero_cheque = $1::TEXT";
    values.push(numero_cheque);
  } else if (req.query.month) {
    const month = parseInt(req.query.month);
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json([]);
    }
    query += "EXTRACT(MONTH FROM date_retrait) = $1";
    values.push(month);
  } else if (req.query.year) {
    const year = parseInt(req.query.year);
    if (isNaN(year) || year < 1) {
      return res.status(400).json([]);
    }
    query += "EXTRACT(YEAR FROM date_retrait) = $1";
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
  getRetrait,
  getClientSolde,
  retrait,
  updateRetrait,
  deleteRetrait,
  searchRetrait,
};
