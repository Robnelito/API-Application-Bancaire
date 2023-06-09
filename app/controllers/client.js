const clientModel = require("./../models/client");
const getClients = (req, res) => {
  clientModel.getClients(req, res);
};

const getClient = (req, res) => {
  clientModel.getClient(req, res);
};

const createClient = (req, res) => {
  // console.log(req)
  clientModel.createClient(req, res);
};

const updateClient = (req, res) => {
  clientModel.updateClient(req, res);
};

const deleteClient = (req, res) => {
  clientModel.deleteClient(req, res);
};

const searchClient = (req, res) => {
  clientModel.searchClient(req, res);
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  searchClient,
};
