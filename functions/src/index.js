require("./config/admin");

//------------ADD CUSTODIAN-------------------------
exports.addCustodian = require("./https/addCustodian").addCustodian;

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
