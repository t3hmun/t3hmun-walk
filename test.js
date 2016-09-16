'use strict';
// Creates some files and folders then runs walk an spams to console.
// Test must be manually evaluated at console.
// Also clean-up is manual.
// It isn't brilliant, not TDD quality, but it doesn't need to be.

const fs = require('fs');
const path = require('path');
const walk = require('./walk');

// Make some folders and ignore any errors.
console.log('\nTest-setup:\n');
[
    ['./test'],
    ['./test/folderA', 'a1.keep', 'a2', 'a3.ignore'],
    ['./test/folderB', 'b1.ignore', 'b2.keep', 'b3'],
    ['./test/folderB/folderBB', 'bb1.ignore', 'bb2.keep', 'bb2'],
    ['./test/folderA/folderAA', 'aa1.ignore', 'aa2.keep', 'aa3'],
    ['./test/folderA/folderAA/folderAAA', 'aaa1.keep', 'aaa2', 'aaa3.ignore']
].forEach(function (entry) {
    var dir;
    entry.forEach(function (file, index) {
        if (index == 0) {
            try {
                fs.mkdirSync(file);
            } catch (err) {
            }
            dir = file;
        }
        else {
            console.log('making ' + dir + '+' + "file");
            try {
                fs.closeSync(fs.openSync(path.join(dir, file), 'w'));
            } catch (err) {
            }
        }
    });
});

new Promise(function (resolve, reject) {
    // Walk and then spam the console with results.
    console.log('\n\nAll:\n');
    walk.all('./test', function (err, list) {
        if (err) {
            reject(err);
            return;
        }
        console.log('list len: ' + list.length);
        list.forEach(function (item) {
            console.log("RES: " + item);

        });
        resolve();
    });
}).then(function () {
    console.log('\n\nFiltered with only .keep files and skipping folderAA:\n');
    return new Promise(function (resolve, reject) {
        walk.where('./test/../test', dir=> !dir.endsWith('folderAA'), file=> file.endsWith('.keep'), function (err, list) {
            if (err) {
                reject(err);
                return;
            }
            console.log('list len: ' + list.length);
            list.forEach(function (item) {
                console.log("RES: " + item);

            });
            resolve();
        });
    });
}, function (err) {
    throw err;
}).then(function () {
    console.log('\n\nFiltered with keep all files except .ignore and skipping folderAA with resolved path:\n');
    return new Promise(function (resolve, reject) {
        console.log('promise started.');
        let dirPath = path.resolve('./test');
        console.log(dirPath);
        walk.where(dirPath, dir=> !dir.endsWith('folderAA'), file=> !file.endsWith('.ignore'), function (err, list) {
            if (err) {
                reject(err);
                return;
            }
            console.log('list len: ' + list.length);
            list.forEach(function (item) {
                console.log("RES: " + item);

            });
            resolve();
        });
    });
}, function (err) {
    throw err;
}).then(function () {
    console.log('Completed successfully.')
}, function (err) {
    throw err;
});
