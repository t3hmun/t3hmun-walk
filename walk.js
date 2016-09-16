/** 
 * Asynchronous directory tree walking module for node.js v6
 * Results order should be considered random (async so no guarantees).
 *
 * Implementation:
 * - Uses ES6 Promise to synchronise results from multiple callback chain branches.
 * - Uses fs.readdir() and fs.stat() async io functions.
 *
 */

const fs = require('fs');
const path = require('path');

exports.all = walkAll;
exports.where = walkWhere;

/**
 * Asynchronously lists all files in specified dir and all sub-dirs.
 * 
 * @param {string} dir - Directory to start recursively listing files from.
 * @param {function(Error, string[])} callback - Either delivers an Error or a list of files, paths joined with the original dir given (maintaining the relative or absolute nature of dir).
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
        function addFileOrRecurse(filePath) {
            return new Promise(function(resolve, reject) {
                fs.stat(filePath, function(err, stat) {
                    if (err) {
                        failed = true;
                        reject(err);
                        return;
                    }
                    if (stat.isFile()) {
                        flatFiles.push(filePath);
                        resolve();
                        return;
                    }
                    if (stat.isDirectory()) {
                        // Recurse, resolving in callback, which is after the 
                        //  recursed walk() has resolved all its promises.
                        walkAll(filePath, function(err, list) {
                            if (err) {
                                failed = true;
                                reject(err);
                                return;
                            }
                            flatFiles.push(...list);
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
        });
    });
}

/**
 * Recursively list file paths in the specified dir and all sub-directories that return true on predicates.
 * If dirPredicates returns false on a dir path that folder and all sub-folders are skipped.
 * The paths of files are simply path.join()ed onto the specified dir so relative dirs will remain relative.
 * For example, if dir is './../../x/../x, a file path may be './../../x/sub-dir/file.txt', relative path is simplified.
 * If absolute paths are required a the dir parameter should be given as an absolute path.
 * @param {string} dir - The directory to start listing files recursively including sub-folders.
 * @param {function(string) : boolean} dirPredicate - Returns true on directory paths (path not just directory) that should be included. The path may be relative or absolute depending on the dir parameter.
 * @param {function(string) : boolean} filePredicate - Returns true for fileNames that should be included.
 * @param {function(Error, string[])} callback - Either err or the list of files found, paths are joined onto dir.
 */
function walkWhere(dir, dirPredicate, filePredicate, callback) {
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
        function addFileOrRecurse(filePath) {
            // Promises are a part of ES6.
            return new Promise(function(resolve, reject) {
                fs.stat(filePath, function(err, stat) {
                    if (err) {
                        failed = true;
                        reject(err);
                        return;
                    }
                    if (stat.isFile() ) {
                        if(filePredicate(filePath)) flatFiles.push(filePath);
                        resolve();
                        return;
                    }
                    if (stat.isDirectory()) {
                        if(!dirPredicate(filePath)){
                            resolve();
                            return;
                        }
                        // Recurse, resolve() in callback, after the inner walk() has resolved all its promises.
                        walkWhere(filePath, dirPredicate, filePredicate, function(err, list) {
                            if (err) {
                                failed = true;
                                reject(err);
                                return;
                            }
                            flatFiles.push(...list); //ES6 spread operator.
                            resolve();
                        });
                    }
                });
            });
        }

        // Promise.all: When everything has succeeded or any one has failed.
        Promise.all(promises).then(() => {
            callback(null, flatFiles);
        }, () => {
            callback(err, null);
        });
    });
}
