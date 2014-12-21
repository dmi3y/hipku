"use strict";
var
    through = require('through2'),
    fs = require('fs'),
    glob = require('glob'),
    File = require('vinyl');

function build(adds) {

  var stream = through.obj(function(file, enc, cb) {
  	var
  		stream = this,
        contents = file.contents;

	glob(adds, function(err, files) {
	    var
	        flen,
	        path,
	        cbc;

	    function writeStream(path) {

	    	return function (err, add) {
	    		var
	    			nfile,
	    			ncontents;

	        	if ( !err ) {
	        		ncontents = Buffer.concat([contents, add]);
	        		nfile = new File({
	        			cwd: file.cwd,
	        			base: file.base,
	        			path: path,
	        			contents: ncontents
	        		});
		     		stream.push(nfile);
		     		cbc();
	        	}
        	};
        }

	    if (!err) {

	        flen = files.length;

	        cbc = (function() {
	        	var
	        		i = flen;

	        	return function() {

	        		i -= 1;
	        		if ( i === 0 ) {
	        			cb();
	        		}
	        	};
	        }());

	        for (; flen--;) {

	            path = file.path.split(/\\|\//g);
	            path = path.slice(0, -2);
	            path.push(files[flen].replace('build', 'hipku').replace('./src', 'build'));
	            path = path.join('/');

	            fs.readFile(files[flen], writeStream(path));
	        }
	    }
	});
  });

  return stream;
}

module.exports = build;
