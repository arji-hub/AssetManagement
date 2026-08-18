require("./config/admin");

exports.addCustodian = require("./https/addCustodian").addCustodian;
exports.onUpdateAssetCustodian =
  require("./triggers/onUpdateAssetCustodian").onUpdateAssetCustodian;
exports.onUpdateAssetLocalMR =
  require("./triggers/onUpdateAssetLocalMR").onUpdateAssetLocalMR;
exports.onTransferRequestCreated =
  require("./triggers/onTransferRequestNotify").onTransferRequestCreated;
exports.onTransferRequestUpdated =
  require("./triggers/onTransferRequestNotify").onTransferRequestUpdated;
