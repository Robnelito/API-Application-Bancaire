const {pool} = require('./pollpg')

const createVersement = (req,res)=> {
    //test be manadala
    const { numero_compte, montant_versement, date} = req.body
    //console.log(date_retrait)
    pool.query('INSERT INTO versement (numero_compte, montant_versement, date) VALUES ($1,$2,$3) RETURNING *', 
                [numero_compte,montant_versement,date], (error, results) => {
        if (error) {
            throw error
        }
        //res.status(201).send(`Versement ajouté avec ID : ${results.rows[0].id}`)
        res.status(201).send(`Versement ajouté avec l'ID: ${results.insertId}`) 
    })
}

module.exports = {
    createVersement
}
