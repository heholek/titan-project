const cron = require("node-cron")
const log = require('pino')();

var system = require("../utils/system")
const constants = require("../utils/constants")
const logger = require("../utils/logger").logger

cron.schedule(constants.CLEANUP_FILE_CRON, () => {
    log.info({
        "action": "start_cleanup"
    }, "Starting cleanup job for old files")
    system.deleteFilesOlderThan(constants.LOGFILES_DIR, constants.CLEANUP_FILE_OLDER_THAN_MS)
});