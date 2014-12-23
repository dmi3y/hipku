'use strict';

var
    yaml = require('js-yaml'),

    through = require('through2'),
    fs = require('fs'),
    glob = require('glob'),
    File = require('vinyl');

function addDictionary(adds) {

  var stream = through.obj(function(file, enc, cb) {
  	var
  		stream = this,
        contents = file.contents;

	glob(adds, function(err, files) {
	    var
	        flen,
	        cbc;

	    function writeStream(path) {

	    	return function (err, add) {
	    		var
	    			json,
	    			vname = path.split('/').pop().split('.').shift();

	        	if ( !err ) {
	        		json = yaml.load(add);
	        		json = new Buffer('var ' + vname + ' = ' + JSON.stringify(json) + ';\r\n');
	        		file.contents = Buffer.concat([file.contents, json]);
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
			     		stream.push(file);
	        			cb();
	        		}
	        	};
	        }());

	        for (; flen--;) {

	            fs.readFile(files[flen], writeStream(files[flen]));
	        }
	    }
	});
  });

  return stream;
}

module.exports = addDictionary;



