let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

const { pool } = require("./pollpg");

const getUtilisateurs = () => {};

const getUtilisateur = () => {};

const createUtilisateur = (req, res) => {
  const { nom, email, password } = req.body;
  let hashedPassword = bcrypt.hashSync(password, 8);

  pool.query(
    "INSERT INTO utilisateur (nom, email, password) VALUES ($1, $2, $3) RETURNING *",
    [nom, email, hashedPassword],
    (error, results) => {
      if (error) {
        throw error;
      }
      res
        .status(201)
        .send(`User added with ID: ${results.rows[0].numero_utilisateur}`);
    }
  );
};

const loginUtilisateur = (req, res) => {
  let { email, password } = req.body;
  pool.query(
    "SELECT * FROM utilisateur WHERE email = $1",
    [email],
    (error, results) => {
      if (error) {
        throw error;
      }
      bcrypt.compare(password, results.rows[0].password, (err, isMatch) => {
        if (err) {
          res.json({
            message: err,
          });
        } else if (!isMatch) {
          res.json({
            message: "mot de passe incorrecte",
          });
        } else {
          let email = results.rows[0].email;
          const token = jwt.sign(
            { numero_utilisateur: results.rows[0].numero_utilisateur, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          res.json({
            message: "connecter",
            token: token,
          });
        }
      });

      // res.status(200).json(results.rows)
    }
  );
};

module.exports = {
  getUtilisateurs,
  getUtilisateur,
  createUtilisateur,
  loginUtilisateur,
};
