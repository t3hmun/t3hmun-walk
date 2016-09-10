# t3hmun-walk 

## Why

The existing packages looked either wrong or odd, also this seems like nice learning exercise.

## Usage

```js
const walk = require('walk');


walk('./aFolder', function(err, files){
    // err will be an Error from fs.readdir() or fs.stat().
	if(err) throw err;
	
	// Will output a list of files, paths joined to the origin dir specified.
	console.log(files);
})
```