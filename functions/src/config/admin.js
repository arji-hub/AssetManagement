const { setGlobalOptions } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");

initializeApp();
setGlobalOptions({ maxInstances: 10 });
