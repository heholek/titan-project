const fs = require('fs-extra')
const path = require('path')

const constants = require("./constants")

// Check if a filehash is valid or not

function isFilehashValid(hash) {
    return hash.match(/^[a-zA-Z0-9]{128}$/g)
}

// Write a string content to file

function writeStringToFile(id, filepath, data, callback) {
    fs.writeFile(filepath, data, function (err) {
        if (err) {
            if (id != undefined) {
                log.error(id + " - Unable to write data to file '" + filepath + "'");
            } else {
                log.error("Unable to write data to file '" + filepath + "'");
            }
        }
        callback()
    });
}

// Delete a file from disk

function deleteFile(id, filepath, callback) {
    fs.unlink(filepath, function (err) {
        if (err) {
            if (id != undefined) {
                log.error(id + " - Unable to delete file '" + filepath + "'");
            } else {
                log.error("Unable to delete file '" + filepath + "'");
            }
        }
        callback()
    });
}

// Delete files older than X milliseconds

function deleteFilesOlderThan(rootDirectory, duration_ms) {
    fs.readdir(rootDirectory, function(err, files) {
        files.forEach(function(file, index) {
          filepath = path.join(rootDirectory, file)
          fs.stat(filepath, function(err, stat) {
            if (err) {
                log.warn("Failed to get file stats '" + filepath + "' : " + err )
            } else if (!stat.isDirectory()) {
                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + duration_ms;
                if (now > endTime) {
                    fs.unlink(filepath, function (err) {
                        if(err) {
                            log.warn("Failed to delete file '" + filepath + "' : " + err )
                        } else {
                            log.info("Successfully deleted file '" + filepath + "'")
                        }
                    });
                }
            }
            
          });
        });
    });
}

// Build the input user filepath

function buildLocalLogFilepath(hash) {
    return constants.LOGFILES_DIR + hash + ".log";
}

module.exports = {
    isFilehashValid: isFilehashValid,
    writeStringToFile: writeStringToFile,
    deleteFile: deleteFile,
    deleteFilesOlderThan: deleteFilesOlderThan,
    buildLocalLogFilepath: buildLocalLogFilepath
};
