require("./config/admin");

exports.addCustodian = require("./https/addCustodian").addCustodian;

exports.onTransferRequestCompleted =
  require("./triggers/onTransferRequestCompleted").onTransferRequestCompleted;

exports.onTransferRequestCreated =
  require("./triggers/onTransferRequestNotify").onTransferRequestCreated;
exports.onTransferRequestUpdated =
  require("./triggers/onTransferRequestNotify").onTransferRequestUpdated;
exports.onReportCreated = require("./triggers/onReportNotify").onReportCreated;
exports.onReportUpdated = require("./triggers/onReportNotify").onReportUpdated;
exports.onTransferRoomCreated =
  require("./triggers/onTransferRoomNotify").onTransferRoomCreated;
