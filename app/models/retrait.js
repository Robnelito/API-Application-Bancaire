const { pool } = require('./pollpg');

const getClientSolde = (req, res) => {
    const numero_compte = parseInt(req.params.numero_compte);

    pool.query('SELECT solde FROM client WHERE numero_compte = $1', [numero_compte], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

const retrait = (req, res) => {
    const numero_compte = parseInt(req.params.numero_compte);
    const montant_retrait = parseFloat(req.body.montant);
    const numero_cheque = req.body.numero_cheque;

    // Récupérer le solde actuel du client
    pool.query('SELECT solde FROM client WHERE numero_compte = $1', [numero_compte], (error, results) => {
        if (error) {
            throw error;
        }

        const solde = parseFloat(results.rows[0].solde);

        if (solde < montant_retrait) {
            res.status(400).send('Solde insuffisant pour effectuer le retrait.'); // Renvoyer un message d'erreur si le solde est insuffisant
        } else {
            const nouveauSolde = solde - montant_retrait;

            // Mettre à jour le solde du client après le retrait
            pool.query('UPDATE client SET solde = $1 WHERE numero_compte = $2', [nouveauSolde, numero_compte], (error) => {
                if (error) {
                    throw error;
                }

                // Insérer les données de retrait dans la table "retrait"
                const dateRetrait = new Date(); // Obtenez votre date de retrait
                const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                const dateFormatee = dateRetrait.toLocaleString(undefined, options); // Obtenir la date et l'heure actuelles
                
                const values = [numero_compte, numero_cheque, montant_retrait, dateFormatee];
                console.log(dateFormatee);
                pool.query('INSERT INTO retrait (numero_compte, numero_cheque, montant_retrait, date_retrait) VALUES ($1, $2, $3, $4)', values, (error) => {
                    if (error) {
                        throw error;
                    }
                    res.status(200).send(`Retrait de ${montant_retrait} effectué avec succès. Nouveau solde : ${nouveauSolde}`);
                });
            });
        }
    });
};

const updateRetrait = (req, res) => {
    const numero_compte = parseInt(req.params.numero_compte);
    const montant_retrait = parseFloat(req.body.montant);
  
    pool.connect((error, client, release) => {
      if (error) {
        return res.status(500).send('Erreur de connexion à la base de données');
      }
  
      let transactionError = false; // Variable pour suivre les erreurs de la transaction
  
      client.query('BEGIN', (error) => {
        if (error) {
          release();
          return res.status(500).send('Erreur de transaction');
        }
        client.query(
          'SELECT montant_retrait FROM retrait WHERE numero_compte = $1 FOR UPDATE',
          [numero_compte],
          (error, result) => {
            if (error) {
              transactionError = true; // Marquer une erreur de transaction
              client.query('ROLLBACK', () => {
                release();
                return res.status(500).send('Erreur de requête');
              });
            }
  
            if (!transactionError) { // Vérifier s'il y a eu une erreur de transaction avant de continuer
              const ancienMontant = parseFloat(result.rows[0].montant_retrait);
              const differenceMontant = montant_retrait - ancienMontant;
  
              client.query(
                'UPDATE retrait SET montant_retrait = $1 WHERE numero_compte = $2',
                [montant_retrait, numero_compte],
                (error, result) => {
                  if (error || result.rowCount === 0) {
                    transactionError = true; // Marquer une erreur de transaction
                    client.query('ROLLBACK', () => {
                      release();
                      return res.status(500).send('Erreur de mise à jour du retrait');
                    });
                  }
  
                  if (!transactionError) { // Vérifier s'il y a eu une erreur de transaction avant de continuer
                    client.query(
                      'UPDATE client SET solde = solde - $1 WHERE numero_compte = $2',
                      [differenceMontant, numero_compte],
                      (error, result) => {
                        if (error || result.rowCount === 0) {
                          transactionError = true; // Marquer une erreur de transaction
                          client.query('ROLLBACK', () => {
                            release();
                            return res.status(500).send('Erreur de mise à jour du solde');
                          });
                        }
  
                        if (!transactionError) { // Vérifier s'il y a eu une erreur de transaction avant de continuer
                          client.query('COMMIT', (error) => {
                            if (error) {
                              client.query('ROLLBACK', () => {
                                release();
                                return res.status(500).send('Erreur de validation de la transaction');
                              });
                            }
  
                            release();
                            res.status(200).send(`Retrait modifié pour le compte: ${numero_compte}`);
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
  
  
  

module.exports = {
    getClientSolde,
    retrait,
    updateRetrait
};
