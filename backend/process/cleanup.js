const cron = require("node-cron")
const log = require('simple-node-logger').createSimpleLogger({ timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS' });

var system = require("../utils/system")
const constants = require("../utils/constants")

cron.schedule(constants.CLEANUP_FILE_CRON, () => {
    log.info("Starting cleanup job for old files")
    system.deleteFilesOlderThan(constants.LOGFILES_DIR, constants.CLEANUP_FILE_OLDER_THAN_MS)
});