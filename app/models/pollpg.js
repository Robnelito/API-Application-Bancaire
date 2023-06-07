const {prepareValue} = require("pg/lib/utils");
require('dotenv').config()
const Poll = require('pg').Pool

const pool = new Poll({
    user: process.env.PG_USER_NAME,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_USER_PASSWORD,
    port: process.env.PG_PORT,
})

//Vérification que l'API est connecté à la base de données
pool.connect((err, client, done) => {
    if (err) {
      console.error('Erreur lors de la connexion à la base de données :', err);
    } else {
      console.log('Connexion réussie à la base de données PostgreSQL !');
      client.release();
    }
  });

module.exports = {
    pool
}
