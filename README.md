# t3hmun-walk 

## What

Some functions that asynchronously list all the files in a directory and all of it sub-directories recursively. 
Makes use of features of ES6; intended for use with Node.js v6+. 

## Why

The existing packages looked either wrong or odd, also this seems like nice learning exercise (learning JS, Node.js, ES6).

## Usage

### All Files and Sub-Directories

```js
const walk = require('walk');

walk.all('./aFolder', function(err, files){
    // err will be an Error from fs.readdir() or fs.stat().
	if(err) throw err;
	
	// Will output a list of files, paths joined to the original dir specified.
	console.log(files);
})
```

### Filtered

```js
const walk = require('walk');
const path = require('path');

// Function that only returns true for .md files.
function onlyMdFiles(filePath){
	return filePath.endsWith('.md');
}

// Functions that returns true for everything except .git directory.
function excludeGit(dirPath){
	// dirPath may be the entire path or a relative path to the directory.
	// Use path to extract the dir name only.
	let dirname = path.basename(dirName);
	return dirname != '.git';
}

walk.where('./', onlyMdFiles, excludeGit, function(err, list){
	if(err) throw err;
	console.log(files);
});
```