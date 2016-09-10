# t3hmun-walk 

## Why

The existing packages looked either wrong or odd, also this seems like nice learning exercise (learning js, Node.js, ES6).

## Usage

```js
const walk = require('walk');

walk('./aFolder', function(err, files){
    // err will be an Error from fs.readdir() or fs.stat().
	if(err) throw err;
	
	// Will output a list of files, paths joined to the original dir specified.
	console.log(files);
})
```