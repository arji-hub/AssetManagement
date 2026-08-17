require("./config/admin");

exports.addCustodian = require("./https/addCustodian").addCustodian;
exports.onUpdateAssetCustodian =
  require("./triggers/onUpdateAssetCustodian").onUpdateAssetCustodian;
exports.onUpdateAssetLocalMR =
  require("./triggers/onUpdateAssetLocalMR").onUpdateAssetLocalMR;
