const { pool } = require("./pollpg");

const getClients = (req, res) => {
  pool.query(
    "SELECT * FROM client ORDER BY numero_compte ASC",
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};

const getClient = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);

  pool.query(
    "SELECT * FROM client WHERE numero_compte = $1",
    [numero_compte],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).json(results.rows);
    }
  );
};

const createClient = (req, res) => {
  const { nom, solde } = req.body;

  pool.query(
    "INSERT INTO client (nom, solde) VALUES ($1, $2) RETURNING *",
    [nom, solde],
    (error, results) => {
      if (error) {
        throw error;
      }
      res
        .status(201)
        .send(`User added with ID: ${results.rows[0].numero_compte}`);
    }
  );
};

const updateClient = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);
  const { nom, solde } = req.body;

  pool.query(
    "UPDATE client SET nom = $1, solde = $2 WHERE numero_compte = $3",
    [nom, solde, numero_compte],
    (error) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`User modified with ID: ${numero_compte}`);
    }
  );
};

const deleteClient = (req, res) => {
  const numero_compte = parseInt(req.params.numero_compte);

  pool.query(
    "DELETE FROM client WHERE numero_compte = $1",
    [numero_compte],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`User deleted with ID: ${numero_compte}`);
    }
  );
};

const searchClient = (req, res) => {
  const q = "%" + req.body.q + "%";

  pool.query(
    "SELECT * FROM client WHERE lower(nom) LIKE lower($1)",
    [q],
    (error, results) => {
      if (error) throw error;
      res.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClient,
};
