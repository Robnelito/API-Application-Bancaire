const retraitModel = require("./../models/retrait");

const getRetrait = (req, res) => {
  retraitModel.getRetrait(req, res);
};

const getClientSolde = (req, res) => {
  retraitModel.getClientSolde(req, res);
};

const retrait = (req, res) => {
  retraitModel.retrait(req, res);
};

const updateRetrait = (req, res) => {
  retraitModel.updateRetrait(req, res);
};

const deleteRetrait = (req, res) => {
  retraitModel.deleteRetrait(req, res);
};

const searchRetrait = (req, res) => {
  retraitModel.searchRetrait(req, res);
};

module.exports = {
  getRetrait,
  getClientSolde,
  retrait,
  updateRetrait,
  deleteRetrait,
  searchRetrait,
};
