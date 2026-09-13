require("./config/admin");

exports.addCustodian = require("./https/addCustodian").addCustodian;

//------------GENERATE QR------------
exports.onAssetCreatedGenerateQR =
  require("./src/triggers/onAssetCreatedGenerateQR").onAssetCreatedGenerateQR;

//------------UPDATE CUSTODIAN / LOCAL MR------------
exports.onTransferRequestCompleted =
  require("./triggers/onTransferRequestCompleted").onTransferRequestCompleted;

//------------UPDATE ROOM------------
exports.onRoomUpdated = require("./triggers/onRoomUpdated").onRoomUpdated;

//------------EMAIL NOTIFICATION------------
exports.onTransferRequestCreated =
  require("./triggers/onTransferRequestNotify").onTransferRequestCreated;
exports.onTransferRequestUpdated =
  require("./triggers/onTransferRequestNotify").onTransferRequestUpdated;
exports.onReportCreated = require("./triggers/onReportNotify").onReportCreated;
exports.onReportUpdated = require("./triggers/onReportNotify").onReportUpdated;
exports.onTransferRoomCreated =
  require("./triggers/onTransferRoomNotify").onTransferRoomCreated;

//------------SCRIPTS------------
exports.migrateRoomIdsStep1_CreateNewRooms =
  require("./script/migrate").migrateRoomIdsStep1_CreateNewRooms;
exports.migrateRoomIdsStep2_RepointAssetsAndCleanup =
  require("./script/migrate").migrateRoomIdsStep2_RepointAssetsAndCleanup;
