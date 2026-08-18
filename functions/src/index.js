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
exports.onReportCreated = require("./triggers/onReportNotify").onReportCreated;
exports.onReportUpdated = require("./triggers/onReportNotify").onReportUpdated;
exports.onTransferRoomCreated =
  require("./triggers/onTransferRoomNotify").onTransferRoomCreated;
