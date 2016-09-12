/** 
 * Asynchronous directory tree walking module for node.js v6
 * Uses promises to synchronise results from async io.
 * Results order should be considered random.
 * Directly exports the walk function.
 */

const fs = require('fs');
const path = require('path');

exports.all = walkAll;

/**
 * Asynchronously lists all files in specified dir and all subdirs.
 * 
 * @param {string} dir - Directory to start recursively listing files from.
 * @param {function(Error, string[])} callback - Either delivers an Error or a 
 *  list of files, paths joined with the original dir given.
 */
function walkAll(dir, callback) {
    fs.readdir(dir, function(err, files) {
        var flatFiles = [];
        // Prevents more functions being called after a failure, not essential.
        var failed = false;
        if (err) {
            callback(err, null);
            return;
        }
        var promises = [];
        // A promise resolved at the end of the callback chain for each path.
        files.some(function(file) {
            promises.push(addFileOrRecurse(path.join(dir, file)));
            return failed; // if failed == true break;
        });

        // Closes on flatFiles and failed.
        function addFileOrRecurse(filepath) {
            return new Promise(function(resolve, reject) {
                fs.stat(filepath, function(err, stat) {
                    if (err) {
                        failed = true;
                        reject(err);
                        return;
                    }
                    if (stat.isFile()) {
                        flatFiles.push(filepath);
                        resolve();
                        return;
                    }
                    if (stat.isDirectory()) {
                        // Recurse, resolving in callback, which is after the 
                        //  recursed walk() has resolved all its promises.
                        walkAll(filepath, function(err, list) {
                            if (err) {
                                failed = true;
                                reject(err);
                                return;
                            }
                            flatFiles.push(...list);
                            // Final statement of the callback chain is resolve.
                            resolve();
                        });
                    }
                });
            });
        }
        // all: When everything has succeeded or any one has failed.
        Promise.all(promises).then(() => {
            callback(null, flatFiles);
        }, () => {
            callback(err, null);
        }).catch(function(err) {
            throw err;
        });
    });
}
