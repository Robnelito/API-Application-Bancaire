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
    const montant = parseFloat(req.body.montant);

    // Récupérer le solde actuel du client
    pool.query('SELECT solde FROM client WHERE numero_compte = $1', [numero_compte], (error, results) => {
        if (error) {
            throw error;
        }

        const solde = parseFloat(results.rows[0].solde);

        if (solde < montant) {
            res.status(400).send('Solde insuffisant pour effectuer le retrait.'); // Renvoyer un message d'erreur si le solde est insuffisant
        } else {
            const nouveauSolde = solde - montant;

            // Mettre à jour le solde du client après le retrait
            pool.query('UPDATE client SET solde = $1 WHERE numero_compte = $2', [nouveauSolde, numero_compte], (error) => {
                if (error) {
                    throw error;
                }

                // Insérer les données de retrait dans la table "retrait"
                const dateRetrait = new Date(); // Obtenir la date et l'heure actuelles
                const values = [numero_compte, montant, dateRetrait];
                console.log(dateRetrait);
                pool.query('INSERT INTO retrait (numero_compte, montant, date_retrait) VALUES ($1, $2, $3)', values, (error) => {
                    if (error) {
                        throw error;
                    }

                    res.status(200).send(`Retrait de ${montant} effectué avec succès. Nouveau solde : ${nouveauSolde}`);
                });
            });
        }
    });
};

module.exports = {
    getClientSolde,
    retrait
};
