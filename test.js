// Creates some files and folders then runs walk an spams to console.
// Test must be manually evaluated at console.
// Also clean-up is manual.
// It isn't brilliant, but it doesn't need to be.

const fs = require('fs');
const path = require('path');
const walk = require('./walk');

// Make some folders and ignore any errors.
[['./foldera', 'a1', 'a2', 'a3'],
['./folderb', 'b1', 'b2', 'b3'],
['./foldera/folderaa', 'aa1', 'aa2'],
	].forEach(function(entry){
    var dir;
	entry.forEach(function(file, index){
		if(index == 0) {
			try{
				fs.mkdirSync(file);
			} catch(err) {}
			dir = file;
		}
		else{
			console.log('making ' + dir + '+' + "file");
			try{
				fs.closeSync(fs.openSync(path.join(dir, file), 'w'));
			} catch(err) {}
		}
	});
});

// Walk and then spam the console with results.
walk('./', function(err, list){
	if(err) throw err;
	console.log('list len: ' + list.length);
	list.forEach(function(item){
		console.log("RES: " + item);

	});
});