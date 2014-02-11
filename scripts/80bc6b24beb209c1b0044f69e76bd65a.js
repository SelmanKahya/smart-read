// This is the namespace and initialization code that is used by
// by the library view of the chrome extension

window.Readium = {
	Models: {},
	Collections: {},
	Views: {},
	Routers: {},
	Utils: {},
	Init: function() {

		window.options = Readium.Models.ReadiumOptions.getInstance();
		window.optionsView = new Readium.Views.ReadiumOptionsView({model: window.options});
			
		window._library = new Readium.Collections.LibraryItems();
		window._lib_view = new Readium.Views.LibraryItemsView({collection: window._library});
		window._fp_view = new Readium.Views.FilePickerView({collection: window._library});
		window.router = new Readium.Routers.LibraryRouter({picker: window._fp_view});
		Backbone.history.start({pushState: false, root: "views/library.html"});

		// load the library data from localstorage and 
		// use it trigger a reset event on the library
		_lawnchair = new Lawnchair(function() {
			this.all(function(all) {

				// Exclude entries in the store that are for epubView properties. These should not be 
				// rendered in the list of epubs in the library
				var ePUBList = _.reject(all, function(element) { 
					return element.key.split("_")[1] === "epubViewProperties";
				});
				window._library.reset(ePUBList);							
			});
		});

		// TODO: this is not how we should do this, we should use a proper backbone view.

		var hc = $('#library-items-container').hasClass("row-view");
		$("#block-view-btn").attr('aria-pressed', hc ? 'false' : 'true');
		$("#row-view-btn").attr('aria-pressed', hc ? 'true' : 'false');

		document.body.addEventListener('drop', function(e) {
		    e.stopPropagation();
		    e.preventDefault();
		    // todo stop this!
		    window._fp_view.handleFileSelect({target: e.dataTransfer});
		  }, false);

		$("#block-view-btn").click(function(e) {
			$("#block-view-btn").attr('aria-pressed', 'true');
			$("#row-view-btn").attr('aria-pressed', 'false');
			$('#library-items-container').addClass("block-view").removeClass("row-view");
			Readium.Utils.setCookie("lib_view", "block", 1000);
		});

		$("#row-view-btn").click(function(e) {
			$("#block-view-btn").attr('aria-pressed', 'false');
			$("#row-view-btn").attr('aria-pressed', 'true');
			$('#library-items-container').addClass("row-view").removeClass("block-view");
			Readium.Utils.setCookie("lib_view", "row", 1000);
		});
	}
};

$(function() {
	// call the initialization code when the dom is loaded
	window.Readium.Init();
});
/**
*
*  MD5 (Message-Digest Algorithm)
*  http://www.webtoolkit.info/
*
**/
Readium.Utils.MD5 = function (string) {
 
	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}
 
	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}
 
 	function F(x,y,z) { return (x & y) | ((~x) & z); }
 	function G(x,y,z) { return (x & z) | (y & (~z)); }
 	function H(x,y,z) { return (x ^ y ^ z); }
	function I(x,y,z) { return (y ^ (x | (~z))); }
 
	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};
 
	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};
 
	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};
 
	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	};
 
	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;
 
	string = Utf8Encode(string);
 
	x = ConvertToWordArray(string);
 
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
 
	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}
 
	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);
 
	return temp.toLowerCase();
}
Readium.FileSystemApi = function(initCallback) {
	
	var _fs;
	var FILE_SYSTEM_SIZE = 1024 * 1024 * 80; // ~ 80 megaBytes
	
	// Initialize the persistent storage file system ONLY after
	// the user has already granted permission
	var openFileSystem = function( callback ) {
			window.webkitRequestFileSystem(window.PERSITENT, FILE_SYSTEM_SIZE, function(filesystem) {
			_fs = filesystem;
			if ( callback ) {
				callback(api);
			}
		}, fileSystemErrorHandler);
	};
	
	// Ask the user to grant permission to persistent storage
	// only ever need to run this one time for the life of the application
	var requestFileSystemAccess = function( callback ) {
		window.webkitStorageInfo.requestQuota(PERSISTENT, FILE_SYSTEM_SIZE, function(grantedBytes) {
			FILE_SYSTEM_SIZE = grantedBytes;
			callback(api);
		}, function(e) {
			// TODO add an error callback function to handle things
			// a little more gracefully
			console.log('Error', e);
			console.log('Exectution will not continue');
		});
	};

	var fileSystemErrorHandler = function(e) {
	  var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  console.log('Error: ' + msg);
	};
	
	var createDirsRecursively = function(rootDirEntry, folders) {
		// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
		if (folders[0] == '.' || folders[0] == '') {
			folders = folders.slice(1);
		}
		rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
			// Recursively add the new subfolder (if we still have another to create).
			if (folders.length) {
				createDirsRecursively(dirEntry, folders.slice(1));
			}
		}, fileSystemErrorHandler);
	};

	var writeExclusively = function(path, content, rootDir, successCallback, failureCallback)  {
		// there is no way to truncate a file before writing to it with the html5 fs api,
		// so we need to manually try to get it, and then delete it if we are successful
		rootDir.getFile(path, { create: false }, function(fileEntry) {
			fileEntry.remove(function() {
				writeFile(path, content, rootDir, successCallback, failureCallback);		
			});
		}, function() {
			writeFile(path, content, rootDir, successCallback, failureCallback);
		});
		
	};
	
	var writeFile = function (path, content, rootDir, successCallback, failureCallback)  {

		rootDir.getFile(path, { create: true, exclusive: false }, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				var blob;

				fileWriter.onwriteend = function(e) {
					successCallback(e);
				};

				fileWriter.onerror = function(e) {
					failureCallback(e);
				};

				if (content instanceof Blob) {
					fileWriter.write(content);
				}
				else if (content.webkitRelativePath || content.relativePath) {
					// hacky way to detect if it is a file object
					var reader = new FileReader();
					reader.onload = function(e) {
						blob = new Blob([e.target.result]);
						fileWriter.write(blob);
					}
  					reader.readAsArrayBuffer(content);
				}
				else {
					// Create a new Blob and write it
					if (typeof content === "string") {
						blob = new Blob([content], {type: 'text/plain'});
						fileWriter.write(blob);
					}
					else {
						var byteArr = new Uint8Array(content);
						blob = new Blob([byteArr.buffer]);
						fileWriter.write(blob);
					}
				}

			}, failureCallback);

		}, failureCallback);
	};
	
	var writeFileRecursively = function(folders, content, rootDir, successCallback, failureCallback) {
		
		if (folders[0] === '.' || folders[0] === '') {
			folders = folders.slice(1);
		}
		
		if(folders.length === 1) {
			writeExclusively(folders[0], content, rootDir, successCallback, failureCallback);
		}
		else {
			rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
				folders = folders.slice(1);
				writeFileRecursively(folders, content, dirEntry, successCallback, failureCallback);
			}, failureCallback);
		}	
	};
	
	var api = {
		
		writeFile: function(path, content, successCallback, failureCallback) {
			var folders = path.split('/');
			var rootDir = _fs.root;
			writeFileRecursively(folders, content, rootDir, successCallback, failureCallback);
		},
		
		getFileSystem: function() {
			return _fs;
		},

		readEntry: function(entry, readCallback, errorCallback) {
			entry.file(function(file) {
				var reader = new FileReader();
				reader.onloadend = function() {
					if (this.result) {
						readCallback( this.result, entry );
					} 
					else if ( errorCallback ) {
						errorCallback();
					}
				};
				reader.readAsText(file);

			}, errorCallback || fileSystemErrorHandler );
		},
		
		readTextFile: function(path, readCallback, errorCallback) {
			var that = this;
			_fs.root.getFile(path, {}, function(fileEntry) {

				that.readEntry(fileEntry, readCallback, errorCallback);

			}, errorCallback || fileSystemErrorHandler);
		},
 		
		rmdir: function( path ) {
			_fs.root.getDirectory(path, {}, function(dirEntry) {
			    dirEntry.removeRecursively(function() {
			      console.log('Directory removed.');
			    }, fileSystemErrorHandler);
			}, fileSystemErrorHandler);
		},

		getFsUri: function(path, win, fail) {
			_fs.root.getFile(path, { create: true, exclusive: false }, function(fileEntry) {
				win(fileEntry.toURL());
			}, fail || fileSystemErrorHandler);
		},
		
		// recursively create dirs from an array of dir names
		mkdir: createDirsRecursively,
		
		// TODO should be able to hide this function
		genericFsErrorHandler: fileSystemErrorHandler
	};


	return function ( callback ) {
		
		if(_fs) {
			// fs is already initialized, nothing to do
			// execute the callback and stop initialization
			callback(api);
			return api;
		}
		
		// query how much file system space we have already been granted
		webkitStorageInfo.queryUsageAndQuota(webkitStorageInfo.PERSITENT, function(used, remaining) {			
			if( remaining > 0 ) {
				openFileSystem(callback);
			}
			else {
				// never asked before, need to ask for some space
				requestFileSystemAccess(function() {
					openFileSystem(callback);
				});
			}
		});		
	};
	
}();
/*
 * A sync for backbone based on html5 fs api
 */

BBFileSystemSync = function(method, model, options) {

	if(!model.file_path) {
		throw "Cannot sync the model to the fs without a path";
	}

	// this is a read only sync, no saving for now
	switch (method) {
        case "read":
            Readium.FileSystemApi(function(api) {
            	api.readTextFile(model.file_path, function(a,b) {
            		options.success(a);
            	}, function(e) {
            		options.error(e);
            	});
            });
            break;
        case "create":
            throw "Not yet implemented";
            break;
        case "update":
            throw "Not yet implemented";
            break;
        case "delete":
            throw "Not yet implemented";
            break;
    }

    return null;
	
}

// based on http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
Readium.Utils.Guid = function() {
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});
};

// roughly based on http://documentcloud.github.com/backbone/docs/backbone-localstorage.html
Readium.Utils.LocalStorageAdaptor = function(storeName) {

	var _data;

	var save = function() {
		localStorage.setItem(storeName, JSON.stringify(_data));
	};

	var create = function(model) {
		if (!model.id) model.id = model.attributes.id = guid();
		_data[model.id] = model;
		save();
		return model;
	};

	var update = function(model) {
		_data[model.id] = model;
		save();
		return model;
	};

	var find = function(model) {
		return _data[model.id];
	};

	var findAll = function() {
		return _.values(_data);
	};


	var destroy = function(model) {
		delete _data[model.id];
		save();
		return model;
	};

	return function(method, model, options) {

		var resp;
		var strData = localStorage.getItem(storeName);
		_data = ( strData && JSON.parse(strData)) || {};

		switch (method) {
			case "read":    resp = model.id ? find(model) : findAll(); break;
			case "create":  resp = create(model);                            break;
			case "update":  resp = update(model);                            break;
			case "delete":  resp = destroy(model);                           break;
		}

		if (resp) {
			if(options.success) {
				options.success(resp);
			}
		} else {
			if(options.error) {
				options.error("Record not found");	
			}
		}
	};

};
Readium.Utils.setCookie = function(c_name,value,exdays) {
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}


Readium.Utils.getCookie = function(c_name) {
	var i, x, y, ARRcookies=document.cookie.split(";");
	for (i = 0; i < ARRcookies.length; i++) {
		x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x = x.replace(/^\s+|\s+$/g,"");
		if ( x == c_name ) {
			return unescape(y);
		}
	}
}

Readium.Utils.trimString = function(str) {
	return str.replace(/^\s+|\s+$/g, '');
}
if (window.chrome != null && window.chrome.i18n != null) {
	Handlebars.registerHelper('orUnknown', function(str) {
	  	return str ? str : chrome.i18n.getMessage("i18n_unknown");
	});

	Handlebars.registerHelper('fetchInzMessage', function(key) {
		return new Handlebars.SafeString(chrome.i18n.getMessage(key));
	});	
} else {
	Handlebars.registerHelper('orUnknown', function(str) {
	  	return str ? str : "Unknown";
	});

	Handlebars.registerHelper('fetchInzMessage', function(key) {
		return key.substring(key.indexOf('_') + 1);
	});	
}

Readium.Models.ManifestItem = Backbone.Model.extend({
	
	parseMetaTags: function() {
		 var pageSize;
		// only need to go through this one time, so only parse it
		// if it is not already known
		if(typeof this.get("meta_width") !== "undefined") {
			return;
		}

		if(this.isSvg()) {
			pageSize = this.parseViewboxTag();
		}
		else if(!this.isImage()) {
			pageSize = this.parseViewportTag();
		}

		if(pageSize) {
			this.set({"meta_width": pageSize.width, "meta_height": pageSize.height});
		}
	},

	getContentDom: function() {
		var content = this.get('content');
		if(content) {
			var parser = new window.DOMParser();
			return parser.parseFromString(content, 'text/xml');
		}
	},

	// for fixed layout xhtml we need to parse the meta viewport
	// tag to determine the size of the pages. more info in the 
	// [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
	parseViewportTag: function() {
		var dom = this.getContentDom();
		if(!dom) {
			return;
		}
		var viewportTag = dom.getElementsByName("viewport")[0];
		if(!viewportTag) {
			return null;
		}
		// this is going to be ugly
		var str = viewportTag.getAttribute('content');
		str = str.replace(/\s/g, '');
		var valuePairs = str.split(',');
		var values = {};
		var pair;
		for(var i = 0; i < valuePairs.length; i++) {
			pair = valuePairs[i].split('=');
			if(pair.length === 2) {
				values[ pair[0] ] = pair[1];
			}
		}
		values['width'] = parseFloat(values['width'], 10);
		values['height'] = parseFloat(values['height'], 10);
		return values;
	},

	// for fixed layout svg we need to parse the viewbox on the svg
	// root tag to determine the size of the pages. more info in the 
	// [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
	parseViewboxTag: function() {

		// The value of the ‘viewBox’ attribute is a list of four numbers 
		// `<min-x>`, `<min-y>`, `<width>` and `<height>`, separated by 
		// whitespace and/or a comma
		var dom = this.getContentDom();
		if(!dom) {
			return;
		}
		var viewboxString = dom.documentElement.getAttribute("viewBox");
		// split on whitespace and/or comma
		var valuesArray = viewboxString.split(/,?\s+|,/);
		var values = {};
		values['width'] = parseFloat(valuesArray[2], 10);
		values['height'] = parseFloat(valuesArray[3], 10);
		return values;

	},

	resolvePath: function(path) {
		return this.collection.packageDocument.resolvePath(path)
	},

	resolveUri: function(path) {
		return this.collection.packageDocument.resolveUri(path)	
	},

	isSvg: function() {
		return this.get("media_type") === "image/svg+xml";
	},

	isImage: function() {
		var media_type = this.get("media_type");

		if(media_type && media_type.indexOf("image/") > -1) {
			// we want to treat svg as a special case, so they
			// are not images
			return media_type !== "image/svg+xml";
		}
		return false;
	},

	// Load this content from the filesystem
	loadContent: function() {
		var that = this;
		var path = this.resolvePath(this.get("href"));
		
		Readium.FileSystemApi(function(api) {
			api.readTextFile(path, function(result) {
				that.set( {content: result} );
			}, function() {
				console.log("Failed to load file: " + path);
			})
		});
	}
	
});

Readium.Models.SpineItem = Readium.Models.ManifestItem.extend({

	initialize: function() {
		if(this.isFixedLayout()) {
			this.on("change:content", this.parseMetaTags, this);
			this.loadContent();
		}
		
	},

	// this method creates the JSON representation of a manifest item
	// that is used to render out a page view.
	buildSectionJSON: function(manifest_item, spine_index) {
		if(!manifest_item) {
			return null;
		}
		var section = Object.create(null);
		section.width = this.get("meta_width") || 0;
		section.height = this.get("meta_height") || 0;
		section.uri = this.packageDocument.resolveUri(manifest_item.get('href'));
		section.page_class = this.getPageSpreadClass(manifest_item, spine_index);
		return section;
	},

	toJSON: function() {
		if(this.isFixedLayout()) {
			this.parseMetaTags();
		}
		var json = {};
		json.width = this.get("meta_width") || 0;
		json.height = this.get("meta_height") || 0;
		json.uri = this.resolveUri(this.get('href'));
		json.page_class = this.getPageSpreadClass();
		return json;
	},

	// when rendering fixed layout pages we need to determine whether the page
	// should be on the left or the right in two up mode, options are:
	// 	left_page: 		render on the left side
	//	right_page: 	render on the right side
	//	center_page: 	always center the page horizontally
	// REFACTORING CANDIDATE: This method is too long. 
	getPageSpreadClass: function() {
		var book = this.collection.packageDocument.get("book");
		var spine_index = this.get("spine_index");
		var pageSpreadProperty;
		var spineItems = this.collection;
		var numPagesBetween;
		var lastSpecifiedPageSpread;

		if(book.get("apple_fixed")) {
			// the logic for apple fixed layout is a little different:
			/*
			if(!book.get("open_to_spread")) {
				// page spread is disabled for this book
				return	"center_page"
			}
			else if(spine_index === 0) {
				*/
			if(spine_index === 0) {
				// for ibooks, odd pages go on the right. This means
				// the first page (0th index) will always be on the right
				// without a left counterpart, so center it
				return "center_page";
			}
			else if (spine_index % 2 === 1 && 
				spine_index === this.collection.length) {

				// if the last spine item in the book would be on the left, then
				// it would have no left counterpart, so center it
				return "center_page";
			}
			else {
				// otherwise first page goes on the right, and then alternate
				// left - right - left - right etc
				return (spine_index % 2 === 0 ? "right_page" : "left_page");
			}
		}
		else {

			// If the page spread property has been set for this spine item, return 
			// the name of the appropriate spread class. 
			// Note: As there are only three valid values (left, right, center) for the page
			// spread property in ePub 3.0, if the property is set and 
			// it is not "left" or "right, "center" will always be assumed. 
			if (this.get("page_spread")) {

				pageSpreadProperty = this.get("page_spread");
				if (pageSpreadProperty === "left") {

					return "left_page";
				}
				else if (pageSpreadProperty === "right") {

					return "right_page";
				}
				else {
					return "center_page";
				}
			}
			// If the page spread property is not set, we must iterate back through the EPUB's spine items to find 
			//   the last spine item with a page-spread value set. We can use that value, whether there are an even or odd
			//   number of pages between this spine item and the "last" one, and the page progression direction of the EPUB
			//   to determine the appropriate page spread value for this spine item. 
			// REFACTORING CANDIDATE: WAY too much nesting here. This should be moved to it's own method, at the least.
			else {

				// If this is the first spine item, assign left or right based on page progression direction
				if (spine_index === 0) {

					return book.get("page_prog_dir") === "rtl" ? "right_page" : "left_page";
				}
				else {

					// Find last spine item with page-spread value and use it to determine the appropriate value for 
					//   this spine item.
					for (var currSpineIndex = spine_index - 1; currSpineIndex >= 0; currSpineIndex--) {

						// REFACTORING CANDIDATE: This would be clearer if the currSpineIndex === 0 case was 
						//   handled seperately. 
						if (currSpineIndex === 0 || spineItems.at(currSpineIndex).get("page_spread")) {

							// Handles the case where currSpineIndex === 0 and a page-spread value has not been specified
							lastSpecifiedPageSpread = 
								spineItems.at(currSpineIndex).get("page_spread") ? spineItems.at(currSpineIndex).get("page_spread") : 
								book.get("page_prog_dir") === "rtl" ? "right" : "left";

							numPagesBetween = spine_index - currSpineIndex;

							if (numPagesBetween % 2 === 0) {

								return lastSpecifiedPageSpread === "left" ? "left_page" : 
									lastSpecifiedPageSpread === "right" ? "right_page" :
									book.get("page_prog_dir") === "rtl" ? "left_page" : "right_page";
							}
							// Odd number of pages between current and last spine item with a specified page-spread value
							else {

								return lastSpecifiedPageSpread === "left" ? "right_page" :
									lastSpecifiedPageSpread === "right" ? "left_page" :
									book.get("page_prog_dir") === "rtl" ? "right_page" : "left_page";
							}
						}
					}
				}
			}
		}
	},

	isFixedLayout: function() {

		// if it an svg or image then it is fixed layout
		if(this.isSvg() || this.isImage()) {
			return true;
		}

		// if there is a fixed_flow property, then it takes precedence
		if(typeof this.get("fixed_flow") !== 'undefined') {
			return this.get('fixed_flow');
		}

		// nothing special about this spine item, fall back to the books settings
		return this.collection.isBookFixedLayout();
	},

	// Description: Determines if the first page of the content document should be offset in a synthetic layout
	firstPageOffset : function () {

		// Get book properties
		var notFixedLayout = !this.isFixedLayout();
		var pageProgDirIsRTL = this.get("page_prog_dir") === "rtl" ? true : false;
		var pageSpreadLeft = this.get("page_spread") === "left" ? true : false;
		var pageSpreadRight = this.get("page_spread") === "right" ? true : false;

		// Default to no page spread specified if they are both set on the spine item
		if (pageSpreadRight && pageSpreadLeft) {
			pageSpreadRight = false;
			pageSpreadLeft = false;
		}

		if (notFixedLayout) {

			if (pageProgDirIsRTL) {

				if (pageSpreadLeft) {
					return true;
				}
			}
			else {

				if (pageSpreadRight) {
					return true;
				}
			}
		}

		return false;
	},

	// REFACTORING CANDIDATE: caching the the fixed layout views. I do not remember the reason that
	// we are doing this. Possible that it is not necessary...
	getPageView: function() {
		if(!this.view) {
			if(this.isImage()) {
				this.view = new Readium.Views.ImagePageView({model: this});
			}
			else {
				this.view = new Readium.Views.FixedPageView({model: this});	
			}
			
		}
		return this.view;
	},
    
    hasMediaOverlay: function() {
        return !!this.get("media_overlay") && !!this.getMediaOverlay();
    },
    
    getMediaOverlay: function() {
		return this.collection.getMediaOverlay(this.get("media_overlay"));
    }
});



Readium.Collections.ManifestItems = Backbone.Collection.extend({
	model: Readium.Models.ManifestItem,

	initialize: function(models, options) {
		this.packageDocument = options.packageDocument;   
    }
});

Readium.Collections.Spine = Backbone.Collection.extend({
	model: Readium.Models.SpineItem,

	initialize: function(models, options) {
		this.packageDocument = options.packageDocument;
	},

	isBookFixedLayout: function() {
		return this.packageDocument.get("book").isFixedLayout();
	},

	getMediaOverlay: function(id) {
        return this.packageDocument.getMediaOverlayItem(id);
    }
});
// `PackageDocumentParser` are used to parse the xml of an epub package
// document and build a javascript object. The constructor accepts an
// instance of `URI` that is used to resolve paths durring the process
Readium.Models.PackageDocumentParser = function(uri_object) {
	this.uri_obj = uri_object;
};

// We use [Jath](https://github.com/dnewcome/jath) for converting xml into
// JSON in a declaritive manner. This is the template that performs that
// conversion
Readium.Models.PackageDocumentParser.JathTemplate = {

	metadata:  { 
		id: "//def:metadata/dc:identifier",
		epub_version: "//def:package/@version",
		title: "//def:metadata/dc:title",
		author: "//def:metadata/dc:creator",
		publisher: "//def:metadata/dc:publisher",
		description: "//def:metadata/dc:description",
		rights: "//def:metadata/dc:rights",
		language: "//def:metadata/dc:language",
		pubdate: "//def:metadata/dc:date",
		modified_date: "//def:metadata/def:meta[@property='dcterms:modified']",
		layout: "//def:metadata/def:meta[@property='rendition:layout']",
		spread: "//def:metadata/def:meta[@property='rendition:spread']",
		orientation: "//def:metadata/def:meta[@property='rendition:orientation']",
		ncx: "//def:spine/@toc",
		page_prog_dir: "//def:spine/@page-progression-direction",
		active_class: "//def:metadata/def:meta[@property='media:active-class']"
	 },

	manifest: [ "//def:item", { 
		id: "@id",
		href: "@href",
		media_type: "@media-type",
		properties: "@properties",
        media_overlay: "@media-overlay"
	} ],
						 
	spine: [ "//def:itemref", { idref: "@idref", properties: "@properties", linear: "@linear" } ],

	bindings: ["//def:bindings/def:mediaType", { 
		handler: "@handler",
		media_type: "@media-type"
	} ]
	
};

// Parse an XML package document into a javascript object
Readium.Models.PackageDocumentParser.prototype.parse = function(xml_content) {

	var json, manifest, cover, xmlDom;
	if(typeof(xml_content) === "string" ) {
		var parser = new window.DOMParser;
  		xmlDom = parser.parseFromString(xml_content, 'text/xml');
	}
	else {
		xmlDom = xml_content;
	}

	Jath.resolver = function( prefix ) {
		var mappings = { 
    		def: "http://www.idpf.org/2007/opf",
			dc: "http://purl.org/dc/elements/1.1/"
		};
		return mappings[ prefix ];
	}

	json = Jath.parse( Readium.Models.PackageDocumentParser.JathTemplate, xmlDom);

	// parse the page-progression-direction if it is present
	json.paginate_backwards = this.paginateBackwards(xmlDom);

	// try to find a cover image
	cover = this.getCoverHref(xmlDom);
	if(cover) {
		json.metadata.cover_href = this.resolveUri(cover);
	}		
	if(json.metadata.layout === "pre-paginated") {
		json.metadata.fixed_layout = true;
	}
    
    // parse the manifest into a proper collection
	json.manifest = new Readium.Collections.ManifestItems(json.manifest, {packageDocument: this});

	// create a map of all the media overlay objects
	json.mo_map = this.resolveMediaOverlays(json.manifest);

	// parse the spine into a proper collection
	json.spine = this.parseSpineProperties(json.spine);

	// return the parse result
	return json;

};

	

Readium.Models.PackageDocumentParser.prototype.getCoverHref = function(dom) {
	var manifest; var $imageNode;
	manifest = dom.getElementsByTagName('manifest')[0];

	// epub3 spec for a cover image is like this:
	/*<item properties="cover-image" id="ci" href="cover.svg" media-type="image/svg+xml" />*/
	$imageNode = $('item[properties~="cover-image"]', manifest);
	if($imageNode.length === 1 && $imageNode.attr("href") ) {
		return $imageNode.attr("href");
	}

	// some epub2's cover image is like this:
	/*<meta name="cover" content="cover-image-item-id" />*/
	var metaNode = $('meta[name="cover"]', dom);
	var contentAttr = metaNode.attr("content");
	if(metaNode.length === 1 && contentAttr) {
		$imageNode = $('item[id="'+contentAttr+'"]', manifest);
		if($imageNode.length === 1 && $imageNode.attr("href")) {
			return $imageNode.attr("href");
		}
	}

	// that didn't seem to work so, it think epub2 just uses item with id=cover
	$imageNode = $('#cover', manifest);
	if($imageNode.length === 1 && $imageNode.attr("href")) {
		return $imageNode.attr("href");
	}

	// seems like there isn't one, thats ok...
	return null;
};

Readium.Models.PackageDocumentParser.prototype.parseSpineProperties = function(spine) {
	
	var parseProperiesString = function(str) {
		var properties = {};
		var allPropStrs = str.split(" "); // split it on white space
		for(var i = 0; i < allPropStrs.length; i++) {
			// brute force!!!
			//rendition:orientation landscape | portrait | auto
			//rendition:spread none | landscape | portrait | both | auto

			//rendition:page-spread-center 
			//page-spread | left | right
			//rendition:layout reflowable | pre-paginated
			if(allPropStrs[i] === "rendition:page-spread-center") properties.page_spread = "center";
			if(allPropStrs[i] === "page-spread-left") properties.page_spread = "left";
			if(allPropStrs[i] === "page-spread-right") properties.page_spread = "right";
			if(allPropStrs[i] === "page-spread-right") properties.page_spread = "right";
			if(allPropStrs[i] === "rendition:layout-reflowable") properties.fixed_flow = false;
			if(allPropStrs[i] === "rendition:layout-pre-paginated") properties.fixed_flow = true;
		}
		return properties;
		
	}

	for(var i = 0; i < spine.length; i++) {
		var props = parseProperiesString(spine[i].properties);
		// add all the properties to the spine item
		_.extend(spine[i], props);
	}
	return spine;
};

// resolve the url of smils on any manifest items that have a MO
// attribute
Readium.Models.PackageDocumentParser.prototype.resolveMediaOverlays = function(manifest) {
	var that = this;
    var momap = {};
    
    // create a bunch of media overlay objects
    manifest.forEach( function(item) {
		if(item.get("media_type") === "application/smil+xml") {
            var url = that.resolveUri(item.get("href"));
            var moObject = new Readium.Models.MediaOverlay();
            moObject.setUrl(url);
            moObject.fetch(); 
            momap[item.id] = moObject;
        }
	});
	return momap;
};

// parse the EPUB3 `page-progression-direction` attribute
Readium.Models.PackageDocumentParser.prototype.paginateBackwards = function(xmlDom) {
	return $('spine', xmlDom).attr('page-progression-direction') === "ltr";
};


// combine the spine item data with the corresponding manifest
// data to build useful set of backbone objects
Readium.Models.PackageDocumentParser.prototype.crunchSpine = function(spine, manifest) {
	//var bbSpine = new Readium.Collections.Spine(spine, {packageDocument: this});
	var that = this;
	var index = -1; // to keep track of the index of each spine item
	
	var bbSpine = _.map(spine, function(spineItem) {
		index += 1;
		
		var manItem = manifest.find(function(x) {
			if(x.get("id") === spineItem["idref"]) return x;
		});

		// crunch spine attrs and manifest attrs together into one obj
		var book = that.get("book");
		return _.extend({}, spineItem, manItem.attributes, {"spine_index": index}, {"page_prog_dir": book.get("page_prog_dir")});
	});

	return new Readium.Collections.Spine(bbSpine, {packageDocument: this});
};

// convert a relative uri to a fully resolved one
Readium.Models.PackageDocumentParser.prototype.resolveUri = function(rel_uri) {
	uri = new URI(rel_uri);
	return uri.resolve(this.uri_obj).toString();
};
// This class is used to navigate an EPub's package document
Readium.Models.PackageDocument = Backbone.Model.extend({

	initialize: function(attributes, options) {
		var that = this;
		
		if(!attributes.file_path) {
			// Sanity Check: we need to know where to fetch the data from
			throw "This class cannot be synced without a file path";
		}
		else {
			// set it as a property of `this` so that `BackboneFileSystemSync`
			// knows how to find it
			this.file_path = attributes.file_path;

			// use the `FileSystemApi` to generate a fully resolved
			// `filesytem:url`
			Readium.FileSystemApi(function(api) {
				api.getFsUri(that.file_path, function(uri) {
					that.uri_obj = new URI(uri);
				})
			});
		}
		this.on('change:spine_position', this.onSpinePosChanged);
		
    },

    onSpinePosChanged: function() {
    	if( this.get("spine_position") >= this.previous("spine_position") ) {
    		this.trigger("increased:spine_position");
    	}
    	else {
    		this.trigger("decreased:spine_position");
    	}
    },

	// just want to make sure that we do not slip into an
	// invalid state
	validate: function(attrs) {
		
		if( !( attrs.manifest || this.get("manifest") ) ) {
			return "ERROR: All ePUBs must have a manifest";
		}

		//validate the spine exists and the position is valids
		var spine = attrs.spine || this.get("spine") ;
		if( !spine ) {
			return "ERROR: All ePUBs must have a spine";
		}
		if(attrs.spine_position < 0 || attrs.spine_position >= spine.length)	{
			return "ERROR: invalid spine position";
		}
	},

	sync: BBFileSystemSync,

	defaults: {
		spine_position: 0
	},
	
	getManifestItemById: function(id) {
		return this.get("manifest").find(function(x) { 
					if(x.get("id") === id) return x;
				});
	},

	getSpineItem: function(index) {
		return this.get("res_spine").at(index);
	},

	spineLength: function() {
		return this.get("res_spine").length;
	},

	// gets the next position in the spine for which the
	// spineItem does not have `linear='false'`. The start
	// param is the non-inclusive position to begin the search
	// from. If start is not supplied, the search will begin at
	// postion 0. If no linear position can be found, this 
	// funciton returns -1
	getNextLinearSpinePostition: function(start) {
		var spine = this.get("res_spine");
		if(start === undefined || start < -1) {
			start = -1;
		}

		while(start < spine.length - 1) {
			start += 1;
			if(spine.at(start).get("linear") !== "no") {
				return start;
			}
		}

		return -1;
	},

	// gets the previous position in the spine for which the
	// spineItem does not have `linear='false'`. The start
	// param is the non-inclusive position to begin the search
	// from. If start is not supplied, the search will begin at
	// the end of the spine. If no linear position can be found, 
	// this function returns -1
	getPrevLinearSpinePostition: function(start) {
		var spine = this.get("res_spine");
		if(start === undefined || start > spine.length) {
			start = spine.length;
		}

		while(start > 0) {
			start -= 1;
			if(spine.at(start).get("linear") !== "no") {
				return start;
			}
		}

		return -1;
	},

	goToNextSection: function() {
		var cp = this.get("spine_position");
		this.set({spine_position: (cp + 1) });
	},

	goToPrevSection: function() {
		var cp = this.get("spine_position");
		this.set({spine_position: (cp - 1) });	
	},

	spineIndexFromHref: function(href) {
		var spine = this.get("res_spine");
		href = this.resolveUri(href).replace(/#.*$/, "");
		for(var i = 0; i < spine.length; i++) {
			var path = spine.at(i).get("href");
			path = this.resolveUri(path).replace(/#.*$/, "");
			if(path === href) {
				return i;
			}
		}
		return -1;
	},

	goToHref: function(href) {
		var spine = this.get("spine");
		var manifest = this.get("manifest");
		var that = this;
		href = that.resolveUri(href).replace(/#.*$/, "");
		var node = manifest.find(function(x) {
			var path = that.resolveUri(x.get("href")).replace(/#.*$/, "");
			if (href == path) return x;
		});
								 
		// didn't find the spine node, href invalid
		if(!node) {
			return null;
		}

		var id = node.get("id");
		
		for(var i = 0; i < spine.length; ++i ) {
			if(spine[i].idref === id) {
				// always aproach link spine items in fwd dir
				this.set({spine_position: i}, {silent: true});
				this._previousAttributes.spine_position = 0
				this.trigger("change:spine_position")
				break;
			}
		}
	},

	getTocItem: function() {
		var manifest = this.get("manifest");
		var spine_id = this.get("metadata").ncx;
		var item = manifest.find(function(item){ 
			if (item.get("properties").indexOf("nav") !== -1) {
				return true;
			}
			else {
				return false;
			}
		});

		if( item ) {
			return item;
		}

		if( spine_id && spine_id.length > 0 ) {
			return manifest.find(function(item) {
				return item.get("id") === spine_id;
			});
		}

		return null;
	},

	getMediaOverlayItem: function(idref) {
		// just look up the object in the mo_map
		var map = this.get("mo_map");
		return map && map[idref];
	},

	// combine the spine item data with the corresponding manifest
	// data to build useful set of backbone objects
	crunchSpine: function(spine, manifest) {
		//var bbSpine = new Readium.Collections.Spine(spine, {packageDocument: this});
		var that = this;
		var index = -1; // to keep track of the index of each spine item
		
		var bbSpine = _.map(spine, function(spineItem) {
			index += 1;
			
			var manItem = manifest.find(function(x) {
				if(x.get("id") === spineItem["idref"]) return x;
			});

			// crunch spine attrs and manifest attrs together into one obj
			var book = that.get("book");
			return _.extend({}, spineItem, manItem.attributes, {"spine_index": index}, {"page_prog_dir": book.get("page_prog_dir")});
		});

		// Add the index of the spine item to the manifest item's id to prevent the backbone collection
		//   from finding duplicate manifest items when different itemref elements in the spine reference
		//   the same manifest item through the "idref" attribute.
		$.each(bbSpine, function () {
			this.id = this.id + this.spine_index;
		});

		return new Readium.Collections.Spine(bbSpine, {packageDocument: this});
	},

	parse: function(xmlDom) {
		var parser = new Readium.Models.PackageDocumentParser(this.uri_obj);
		var json = parser.parse(xmlDom);
		json.res_spine = this.crunchSpine(json.spine, json.manifest);
		return json;
	},

	resolveUri: function(rel_uri) {
		uri = new URI(rel_uri);
		return uri.resolve(this.uri_obj).toString();
	},

	// reslove a relative file path to relative to this the
	// the path of this pack docs file path
	resolvePath: function(path) {
		var suffix;
		var pack_doc_path = this.file_path;
		if(path.indexOf("../") === 0) {
			suffix = path.substr(3);
		}
		else {
			suffix = path;
		}
		var ind = pack_doc_path.lastIndexOf("/")
		return pack_doc_path.substr(0, ind) + "/" + suffix;
	}


});
// seems like this is now fixed in chromium so soon it will no longer be necessary, YAY!
// get rid of webkit prefix
window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

window.g_uid_hashed = null;

function PathResolver(rootPath) {
	this.baseUrl = new URI(rootPath);
};

function encode_utf8( s )
{
  return unescape( encodeURIComponent( s ) );
}

// we probably don't want both of these - not sure about x-browser compat of ArrayBuffer WHM

function string2Bin(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i)&0xff);
  }
  return result;
}

function string2ArrayBuffer(str){
    var ba=new ArrayBuffer(str.length);
    var bytes = new Uint8Array(ba);
    for(var i=0;i<str.length; i++){
        bytes[i] = str.charCodeAt(i);
    }
    return ba;
}

function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

PathResolver.prototype.resolve = function(relativePath) {
	var url = new URI(relativePath);
	return url.resolve(this.baseUrl);
};

var domToString = function(dom) {

	var x = new XMLSerializer();
	return x.serializeToString(dom);
};

var fixCssLinks = function(content, resolver) {

	// fix import statements to  (unconditionally) have url(...) wrapper
    content = content.replace(/@import\s+(?:url\()*(.+?)(?:\))*\s*;/g, "@import url\($1\);");

	var beginning = /url\s*\(\s*['"]*\s*/
	var end = /['"]*\s*\)/
	return content.replace(/url\s*\(\s*.+?\s*\)/g, function(frag) { 
		frag = frag.replace(beginning, '');
		frag = frag.replace(end, '');
		return "url('" + resolver.resolve(frag) + "')";
	});
};

var fixXhtmlLinks = function(content, resolver) {

	var $obj; var path; 
	var parser = new window.DOMParser();
	var dom = parser.parseFromString(content, 'text/xml');

	var correctionHelper = function(attrName) {
		var selector = '[' + attrName + ']';
		$(selector, dom).each(function() {
			$obj = $(this);
			path = $obj.attr( attrName );
			path = resolver.resolve( path );
			$obj.attr(attrName, path);
		});
	}

	correctionHelper('src');
	correctionHelper('href');
	$('image', dom).each(function() {
		$obj = $(this);
		path = $obj.attr( 'xlink:href' );
		path = resolver.resolve( path );
		$obj.attr('xlink:href', path);
	});
	//correctionHelper('xlink:href');
	var head = dom.getElementsByTagName("head")[0];
	if(head) {
		var head_content = head.innerHTML;
		head_content = "<script type='text/javascript' src='" + 
						window.location.origin + 
						"/scripts/epub_reading_system.js' ></script>" + 
						head_content;
		head.innerHTML = head_content;
	}

	return domToString(dom);
};

var fixFonts = function(content, resolver) {

    if ((content.indexOf("OTTO") == 0) || (content.indexOf("wOFF") == 0)) {
		return content;
    }
    else {
    	var prefix = content.slice(0, 1040);
    	var bytes = string2Bin(prefix);
    	var masklen = g_uid_hashed.length;
    	for (var i = 0; i < 1040; i++)
    	{
    		bytes[i] = bytes[i] ^ (g_uid_hashed[i % masklen]);
    	}

	    var results = bin2String(bytes);
	    return results + content.slice(1040);
    }
}

var getBinaryFileFixingStrategy = function(fileEntryUrl, uid) {
	
	// a hack - tecnically should process top-down from encryption.xml but we'll just sniff for now WHM
	// does negative substr work in IE? WHM
	if ((fileEntryUrl.substr(-4) === ".otf") || (fileEntryUrl.substr(-5) === ".woff")
	    || (fileEntryUrl.substr(-4) === ".OTF") || (fileEntryUrl.substr(-5) === ".WOFF")) {
		if (window.g_uid_hashed == null) {
			var utf8_str = encode_utf8(uid.trim());
                        var digestBytes = window.Crypto.SHA1(utf8_str, { asBytes: true });
			window.g_uid_hashed = digestBytes; // which is it??
		}	
		return fixFonts;
	}
	return null;
}

var getLinkFixingStrategy = function(fileEntryUrl) {

	if (fileEntryUrl.substr(-4) === ".css" ) {
		return fixCssLinks;
	}
	
	if (fileEntryUrl.substr(-5) === ".html" || fileEntryUrl.substr(-6) === ".xhtml" ) {
		return fixXhtmlLinks;
	}

	if (fileEntryUrl.substr(-4) === ".xml" ) {
		// for now, I think i may need a different strategy for this
		return fixXhtmlLinks;
	}

	return null;
};


// this is the brains of the operation here
var monkeyPatchUrls = function(fileEntryUrl, win, fail, uid) {

	var entry;
	var binFixingStrategy;
	var resolver = new PathResolver(fileEntryUrl);

	var fixBinaryFile = function(content) {
		content = binFixingStrategy(content, resolver);
		writeBinEntry(entry, content, win, fail);		
	};
	
        binFixingStrategy = getBinaryFileFixingStrategy(fileEntryUrl, uid);	
	if (binFixingStrategy != null) {
		window.resolveLocalFileSystemURL(fileEntryUrl, function(fileEntry) {
		// capture the file entry in scope
		entry = fileEntry;
		readBinEntry(entry, fixBinaryFile, fail);
	});
		win();
		return;
	}
	
	var linkFixingStrategy = getLinkFixingStrategy(fileEntryUrl);

	// no strategy => nothing to do === win :)
	if(linkFixingStrategy === null) {
		win();
		return;
	}

	var fixLinks = function(content) {
		content = linkFixingStrategy(content, resolver);
		writeEntry(entry, content, win, fail);		
	};

	window.resolveLocalFileSystemURL(fileEntryUrl, function(fileEntry) {
		// capture the file entry in scope
		entry = fileEntry;
		readEntry(entry, fixLinks, fail);
	});
};


// these are filesystem helpers really...
var readEntry = function(fileEntry, win, fail) {

    fileEntry.file(function(file) {

       var reader = new FileReader();
       reader.onloadend = function(e) {
         win(this.result);
       };
       
       reader.readAsText(file);

    }, fail);

};

var writeEntry = function(fileEntry, content, win, fail) {

	Readium.FileSystemApi(function(fs) {
		fs.writeFile(fileEntry.fullPath, content, win, fail);
	});
};

var readBinEntry = function(fileEntry, win, fail) {

    fileEntry.file(function(file) {

       var reader = new FileReader();
       reader.onloadend = function(e) {
         win(this.result);
       };
       reader.readAsBinaryString(file);
    }, fail);
};

var writeBinEntry = function(fileEntry, content, win, fail) {
	
	fileEntry.createWriter(function(fileWriter) {

		fileWriter.onwriteend = function(e) {
			win();
		};

		fileWriter.onerror = function(e) {
			fail(e);
		};
        
        var i = content.length;
		var ba = string2ArrayBuffer(content);
		var k = ba.length;
        var blob = new Blob([ba], {type: 'image/jpeg'});
		fileWriter.write( blob );

	}, fail);
};



Readium.Models.ReadiumOptions = Backbone.Model.extend({

	initialize: function() {
		this.set("id", "singleton");
	},

	defaults: {
		hijack_epub_urls: false,
		verbose_unpacking: true,
		paginate_everything: true
	},

	sync: Readium.Utils.LocalStorageAdaptor("READIUM_OPTIONS")
}, {
	getInstance: function() {
		var instance = new Readium.Models.ReadiumOptions();
		instance.fetch({
			error: function() {
				localStorage.setItem("READIUM_OPTIONS", "");
				instance.save();
			}
		});
		return instance;
	}
});
Readium.FileSystemApi = function(initCallback) {
	
	var _fs;
	var FILE_SYSTEM_SIZE = 1024 * 1024 * 80; // ~ 80 megaBytes
	
	// Initialize the persistent storage file system ONLY after
	// the user has already granted permission
	var openFileSystem = function( callback ) {
			window.webkitRequestFileSystem(window.PERSITENT, FILE_SYSTEM_SIZE, function(filesystem) {
			_fs = filesystem;
			if ( callback ) {
				callback(api);
			}
		}, fileSystemErrorHandler);
	};
	
	// Ask the user to grant permission to persistent storage
	// only ever need to run this one time for the life of the application
	var requestFileSystemAccess = function( callback ) {
		window.webkitStorageInfo.requestQuota(PERSISTENT, FILE_SYSTEM_SIZE, function(grantedBytes) {
			FILE_SYSTEM_SIZE = grantedBytes;
			callback(api);
		}, function(e) {
			// TODO add an error callback function to handle things
			// a little more gracefully
			console.log('Error', e);
			console.log('Exectution will not continue');
		});
	};

	var fileSystemErrorHandler = function(e) {
	  var msg = '';

	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };

	  console.log('Error: ' + msg);
	};
	
	var createDirsRecursively = function(rootDirEntry, folders) {
		// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
		if (folders[0] == '.' || folders[0] == '') {
			folders = folders.slice(1);
		}
		rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
			// Recursively add the new subfolder (if we still have another to create).
			if (folders.length) {
				createDirsRecursively(dirEntry, folders.slice(1));
			}
		}, fileSystemErrorHandler);
	};

	var writeExclusively = function(path, content, rootDir, successCallback, failureCallback)  {
		// there is no way to truncate a file before writing to it with the html5 fs api,
		// so we need to manually try to get it, and then delete it if we are successful
		rootDir.getFile(path, { create: false }, function(fileEntry) {
			fileEntry.remove(function() {
				writeFile(path, content, rootDir, successCallback, failureCallback);		
			});
		}, function() {
			writeFile(path, content, rootDir, successCallback, failureCallback);
		});
		
	};
	
	var writeFile = function (path, content, rootDir, successCallback, failureCallback)  {

		rootDir.getFile(path, { create: true, exclusive: false }, function(fileEntry) {
			fileEntry.createWriter(function(fileWriter) {
				var blob;

				fileWriter.onwriteend = function(e) {
					successCallback(e);
				};

				fileWriter.onerror = function(e) {
					failureCallback(e);
				};

				if (content instanceof Blob) {
					fileWriter.write(content);
				}
				else if (content.webkitRelativePath || content.relativePath) {
					// hacky way to detect if it is a file object
					var reader = new FileReader();
					reader.onload = function(e) {
						blob = new Blob([e.target.result]);
						fileWriter.write(blob);
					}
  					reader.readAsArrayBuffer(content);
				}
				else {
					// Create a new Blob and write it
					if (typeof content === "string") {
						blob = new Blob([content], {type: 'text/plain'});
						fileWriter.write(blob);
					}
					else {
						var byteArr = new Uint8Array(content);
						blob = new Blob([byteArr.buffer]);
						fileWriter.write(blob);
					}
				}

			}, failureCallback);

		}, failureCallback);
	};
	
	var writeFileRecursively = function(folders, content, rootDir, successCallback, failureCallback) {
		
		if (folders[0] === '.' || folders[0] === '') {
			folders = folders.slice(1);
		}
		
		if(folders.length === 1) {
			writeExclusively(folders[0], content, rootDir, successCallback, failureCallback);
		}
		else {
			rootDir.getDirectory(folders[0], {create: true}, function(dirEntry) {
				folders = folders.slice(1);
				writeFileRecursively(folders, content, dirEntry, successCallback, failureCallback);
			}, failureCallback);
		}	
	};
	
	var api = {
		
		writeFile: function(path, content, successCallback, failureCallback) {
			var folders = path.split('/');
			var rootDir = _fs.root;
			writeFileRecursively(folders, content, rootDir, successCallback, failureCallback);
		},
		
		getFileSystem: function() {
			return _fs;
		},

		readEntry: function(entry, readCallback, errorCallback) {
			entry.file(function(file) {
				var reader = new FileReader();
				reader.onloadend = function() {
					if (this.result) {
						readCallback( this.result, entry );
					} 
					else if ( errorCallback ) {
						errorCallback();
					}
				};
				reader.readAsText(file);

			}, errorCallback || fileSystemErrorHandler );
		},
		
		readTextFile: function(path, readCallback, errorCallback) {
			var that = this;
			_fs.root.getFile(path, {}, function(fileEntry) {

				that.readEntry(fileEntry, readCallback, errorCallback);

			}, errorCallback || fileSystemErrorHandler);
		},
 		
		rmdir: function( path ) {
			_fs.root.getDirectory(path, {}, function(dirEntry) {
			    dirEntry.removeRecursively(function() {
			      console.log('Directory removed.');
			    }, fileSystemErrorHandler);
			}, fileSystemErrorHandler);
		},

		getFsUri: function(path, win, fail) {
			_fs.root.getFile(path, { create: true, exclusive: false }, function(fileEntry) {
				win(fileEntry.toURL());
			}, fail || fileSystemErrorHandler);
		},
		
		// recursively create dirs from an array of dir names
		mkdir: createDirsRecursively,
		
		// TODO should be able to hide this function
		genericFsErrorHandler: fileSystemErrorHandler
	};


	return function ( callback ) {
		
		if(_fs) {
			// fs is already initialized, nothing to do
			// execute the callback and stop initialization
			callback(api);
			return api;
		}
		
		// query how much file system space we have already been granted
		webkitStorageInfo.queryUsageAndQuota(webkitStorageInfo.PERSITENT, function(used, remaining) {			
			if( remaining > 0 ) {
				openFileSystem(callback);
			}
			else {
				// never asked before, need to ask for some space
				requestFileSystemAccess(function() {
					openFileSystem(callback);
				});
			}
		});		
	};
	
}();
// Used to validate a freshly unzipped package doc. Once we have 
// validated it one time, we don't care if it is valid any more, we
// just want to do our best to display it without failing
Readium.Models.ValidatedPackageMetaData = Backbone.Model.extend({

	initialize: function(attributes) {
		this.file_path = attributes.file_path;		
		this.uri_obj = new URI(attributes.root_url);
		this.set("package_doc_path", this.file_path);
    },

	validate: function(attrs) {

	},

	// for ease of use call parse before we set the attrs
	reset: function(data) {
		var attrs = this.parse(data);
		this.set(attrs);
	},

	defaults: {
		fixed_layout: false, // default to fixed layout or reflowable format
		apple_fixed: false, // is this file Apple's spec
		open_to_spread: false, // specific to Apple, should two up be allowed?
		cover_href: '/images/library/missing-cover-image.png', // default to no cover image
		created_at: new Date(), // right now
		updated_at: new Date(), // right now
		paginate_backwards: false
	},

	// Apple created its own fixed layout spec for ibooks.
	// this function parses the metadata used by this spec
	parseIbooksDisplayOptions: function(content) {
		var parser, result;
		parser = new Readium.Models.IbooksOptionsParser();
		result = parser.parse(content);
		this.set(result);
	},

	parse: function(xmlDom) {
		// parse the xml
		var parser = new Readium.Models.PackageDocumentParser(this.uri_obj);
		var json = parser.parse(xmlDom);
		// capture the manifest separately
		this.manifest = json.manifest;
		return json.metadata;
	},

	save: function(attrs, options) {
		// TODO: this should be done properly with a backbone sync
		var that = this;
		this.set("updated_at", new Date());
		Lawnchair(function() {
			this.save(that.toJSON(), options.success);
		});
	},

	// TODO: confirm this needs to be here
	resolveUri: function(rel_uri) {
		uri = new URI(rel_uri);
		return uri.resolve(this.uri_obj).toString();
	},

	// TODO: confirm this needs to be here
	// reslove a relative file path to relative to this the
	// the path of this pack docs file path
	resolvePath: function(path) {
		var suffix;
		var pack_doc_path = this.file_path;
		if(path.indexOf("../") === 0) {
			suffix = path.substr(3);
		}
		else {
			suffix = path;
		}
		var ind = pack_doc_path.lastIndexOf("/")
		return pack_doc_path.substr(0, ind) + "/" + suffix;
	}
});
// an object for parsing apples proprietary `com.apple.ibooks.display-options.xml`
Readium.Models.IbooksOptionsParser = function() {
	// constructor doesn't actually do anything
};

// convert a string boolean into an actual bool type
Readium.Models.IbooksOptionsParser.prototype.parseBool = function(str) {
	return str.toLowerCase().trim() === 'true';
};

// parse the xml content and return a json object
Readium.Models.IbooksOptionsParser.prototype.parse = function(content) {
	
	var parser, xmlDoc, fixedLayout, openToSpread, res;

	// parse the xml content
	parser = new window.DOMParser();
	xmlDoc = parser.parseFromString(content, "text/xml");

	// grab the attributes that we actually use
	fixedLayout = xmlDoc.getElementsByName("fixed-layout")[0];
	openToSpread = xmlDoc.getElementsByName("open-to-spread")[0];

	res = {};
	res.open_to_spread = !!openToSpread && this.parseBool(openToSpread.textContent);
	// we set both these properties based on the same thing:
	// (an `apple_fixed` IS A `fixedLayout`)
	res.fixedLayout = !!fixedLayout && this.parseBool(fixedLayout.textContent);
	res.apple_fixed = !!fixedLayout && this.parseBool(fixedLayout.textContent);
	return res;
};
Readium.Models.BookExtractorBase = Backbone.Model.extend({
	// Constants
	MIMETYPE: "mimetype",
	CONTAINER: "META-INF/container.xml",
	EPUB3_MIMETYPE: "application/epub+zip",
	DISPLAY_OPTIONS:"META-INF/com.apple.ibooks.display-options.xml",

	defaults: {
		task_size: 100,
		progress: 1,
		extracting: false,
		log_message: "Fetching epub file"
	},

	 // delete any changes to file system in the event of error, etc.
	clean: function() {
		this.removeHandlers();
		if(this.fsApi) {
			this.fsApi.rmdir(this.base_dir_name);
		}
	},

	parseContainerRoot: function(content) {
		var rootFile = this.get("root_file_path");
		this.packageDoc = new Readium.Models.ValidatedPackageMetaData({
				key: this.base_dir_name,
				src_url: this.get("src"),
				file_path: this.base_dir_name + "/" + rootFile,
				root_url: this.get("root_url") + "/" + rootFile
			}); 
		this.packageDoc.reset(content);
		this.trigger("parsed:root_file")		
	},

	writeFile: function(rel_path, content, cb) {
		var that = this;
		var abs_path = this.base_dir_name + "/" + rel_path;

		this.fsApi.writeFile(abs_path, content, cb , function() {
			that.set("error", "ERROR: while writing to filesystem");
		});
	},

	parseMetaInfo: function(content) {	
		var parser = new window.DOMParser();
		var xmlDoc = parser.parseFromString(content, "text/xml");
		var rootFiles = xmlDoc.getElementsByTagName("rootfile");

		if(rootFiles.length < 1) {
			// all epubs must have a rootfile
			this.set("error", "This epub is not valid. The rootfile could not be located.");
		}
		else {
			// According to the spec more than one rootfile can be specified 
			// but we are required to parse the first one only for now...
			if (rootFiles[0].hasAttribute("full-path")) {
				this.set("root_file_path", rootFiles[0].attributes["full-path"].value);
			}
			else {
				this.set("error", "Error: could not find package rootfile");
			}				
		}
	},

	validateMimetype: function(content) {
		if($.trim(content) === this.EPUB3_MIMETYPE) {
			this.trigger("validated:mime");
		} else {
			this.set("error", "Invalid mimetype discovered. Progress cancelled.");
		}
	},

	// remove all the callback handlers attached to
	// events that might be registered on this
	removeHandlers: function() {
		this.off();
	},

	extraction_complete: function() {
		this.set("extracting", false);
	},

	finish_extraction: function() {
		var that = this;
		this.set("log_message", "Unpacking process completed successfully!");
		// HUZZAH We did it, now save the meta data
		this.packageDoc.save({}, {
			success: function() {
				that.trigger("extraction_success");
			},
			failure: function() {
				that.set("failure", "ERROR: unknown problem during unpacking process");
			}
		});
	},

	// sadly we need to manually go through and reslove all urls in the
	// in the epub, because webkit filesystem urls are completely supported
	// yet, see: http://code.google.com/p/chromium/issues/detail?id=114484
	correctURIs: function() {
	
		var root = this.get("root_url");
		var i = this.get("patch_position");
		var manifest = this.get("manifest");
		var uid = this.packageDoc.get("id");
		var that = this;
		
		if( i >= manifest.length) {
			this.off("change:patch_position");
			this.finish_extraction();
		} 
		else {			
			this.set("log_message", "monkey patching: " + manifest[i]);
			monkeyPatchUrls(root + "/" + manifest[i], function() {
					that.incPatchPos();
				}, function() {
					that.set("failure", "ERROR: unknown problem during unpacking process");
				}, uid);
		}
	

	},

	incPatchPos: function() {
		var pos = this.get("patch_position") || 0;
		pos += 1;
		this.set("patch_position", pos);
	}

});

// This method takes a url for an epub, unzips it and then
// writes its contents out to disk.
Readium.Models.ZipBookExtractor = Readium.Models.BookExtractorBase.extend({

	initialize: function() {
		zip.workerScriptsPath = "../lib/"
		var file_name = this.get("src_filename");
		if(!this.get("file")) {
			throw "A zip file must be specified";
		}
		else {
			this.base_dir_name = Readium.Utils.MD5(file_name + (new Date()).toString());
			this.set("src", file_name);
		}	
	},
	
	extractEntryByName: function(name, callback) {
		var writer, entry;

		entry = _.find(this.entries, function(entry) {
			return entry.filename === name;
		});
		if(entry) {
			writer = new zip.TextWriter();
			entry.getData(writer, callback);
		}
		else {
			throw ("asked to extract non-existent zip-entry: " + name);
		}
	},
	
	extractContainerRoot: function() {
		var that = this;
		var path = this.get("root_file_path");
		try {
			this.extractEntryByName(path, function(content) {
				that.parseContainerRoot(content);
			});				
		} catch(e) {
			this.set("error", e);
		}	
	},
	
	extractMetaInfo: function() {
		var that = this;
		try {
			this.extractEntryByName(this.CONTAINER, function(content) {
				that.parseMetaInfo(content);
			});
		} catch (e) {
			this.set("error", e);
		}
	},
		
	extractMimetype: function() {
		var that = this;
		this.set("log_message", "Verifying mimetype");
		try {
			this.extractEntryByName(this.MIMETYPE, function(content) {
				that.validateMimetype(content);
			});			
		} catch (e) {
			this.set("error", e);
		}

	},
	
	validateZip: function() {
		// set the task
		// weak test, just make sure MIMETYPE and CONTAINER files are where expected	
		var that = this;
		this.set("log_message", "Validating zip file");
		var has_mime = _.any(this.entries, function(x){
			return x.filename === that.MIMETYPE
		});
		var has_container = _.any(this.entries, function(x){
			return x.filename === that.CONTAINER
		});
		if(has_mime && has_container) {
			this.trigger("validated:zip");
		}
		else {
			this.set("error", "File does not appear to be a valid EPUB. Progress cancelled."); 
		}
		
	},

	extractEntry: function(entry) {
		var that = this;
		var writer = new zip.BlobWriter();
		entry.getData(writer, function(content) {
			that.writeFile(entry.filename, content, function() {
				that.available_workers += 1;
				that.set("zip_position", that.get("zip_position") + 1);
			});
		});
	},
	
	extractBook: function() {

		// genericly extract a file and then write it to disk
		var entry;

		if(this.get("zip_position") === 0) {
			this.available_workers = 5;
			this.entry_position = 0;
			this.on("change:zip_position", this.checkCompletion, this);
		}

		while(this.available_workers > 0 && this.entry_position < this.entries.length) {
			entry = this.entries[this.entry_position];	
			if( entry.filename.substr(-1) === "/" ) {
				// skip over directories
				this.entry_position += 1;
				this.set("zip_position", this.get("zip_position") + 1);
			}
			else {
				this.available_workers -= 1;
				this.entry_position += 1;
				this.extractEntry(entry);
			}

		}
		
		for(var i = 0; i < this.entries.length; i++) {
			
		}
	},

	parseIbooksDisplayOptions: function() {
		var that = this;
		try {
			this.extractEntryByName(this.DISPLAY_OPTIONS, function(content) {
				that.packageDoc.parseIbooksDisplayOptions(content);
				that.trigger("parsed:ibooks_options");
			});
		} catch(e) {
			// there was no ibook_options file, thats fine....
			this.trigger("parsed:ibooks_options");	
		}
	},

	checkCompletion: function() {
		var pos = this.get("zip_position");
		if(pos === this.entries.length) {
			this.set("log_message", "All files unzipped successfully!");
			this.set("patch_position", 0);
		}
		else {
			// this isn't exactly accurate but it will signal the user
			// that we are still doing work
			this.set("log_message", chrome.i18n.getMessage("i18n_extracting") + this.entries[pos].filename);
		}
	},

	beginUnpacking: function() {		
		var manifest = [];
		var entry;
		for(var i = 0; i < this.entries.length; i++) {
			entry = this.entries[i];
			if( entry.filename.substr(-1) !== "/" ) {
				manifest.push(entry.name);
			}
		}
		this.set("manifest", manifest);
		// just set the first position
		this.set("zip_position", 0);
	},
	
	extract: function() {

		// set up all the callbacks
		this.on("initialized:zip", this.validateZip, this);
		this.on("validated:zip", this.extractMimetype, this);
		this.on("validated:mime", this.extractMetaInfo, this);
		this.on("change:root_file_path", this.extractContainerRoot, this);
		this.on("parsed:root_file", this.parseIbooksDisplayOptions, this);
		this.on("parsed:ibooks_options", this.beginUnpacking, this);
		this.on("change:zip_position", this.extractBook, this);
		this.on("change:patch_position", this.correctURIs, this);
		this.on("change:failure", this.clean, this);
		this.on("change:failure", this.removeHandlers, this);

		// set up callbacks for reporting progess
		this.on("change:task_size", this.update_progress, this);
		this.on("change:zip_position", this.update_progress, this);
		this.on("change:patch_position", this.update_progress, this);
		this.on("extraction_success", this.extraction_complete, this);

		// fire the event that says started
		this.set("extracting", true);

		// initialize the FS and begin process
		var that = this;
		Readium.FileSystemApi(function(fs){
			that.fsApi = fs;
			that.initializeZip();
		});

	},

	update_progress: function() {
		var zip = this.get("zip_position") || 0;
		var patch = this.get("patch_position") || 0;
		var x = Math.floor( (zip + patch + 3) * 100 / this.get("task_size") );
		this.set("progress", x );
	},

	initializeZip: function() {
		var that = this;
		
		this.fsApi.getFileSystem().root.getDirectory(this.base_dir_name, {create: true}, function(dir) {
			that.set("root_url", dir.toURL());
			zip.createReader(new zip.BlobReader(that.get("file")), function(zipReader) {
				zipReader.getEntries(function(entries) {
					that.entries = entries;
					that.set("task_size", entries.length * 2 + 3);
					that.trigger("initialized:zip");
				});
			}, function() {
				that.set("error", "File does not appear to be a valid EPUB. Progress cancelled."); 
			});

		}, function() {
			console.log("In beginUnpacking error handler. Does the root dir already exist?");
		});
	}
	
});

// This method takes a url for an epub, unzips it and then
// writes its contents out to disk.
Readium.Models.UnpackedBookExtractor = Readium.Models.BookExtractorBase.extend({

	initialize: function() {
		
		var dirPicker = this.get("dir_picker");
		var pathList = [];
		var path;
		this.fNameStartInd = dirPicker.files[0].webkitRelativePath.indexOf("/") + 1;

		// Just hashing the date for now
		this.base_dir_name = Readium.Utils.MD5("Banana" + (new Date()).toString());	
		this.fileList = dirPicker.files;
		for (var i = 0, file; file = this.fileList[i]; ++i) {
			path = file.webkitRelativePath;
			if(path.substr(-2) !== "/.") {
				pathList.push( this.getShortName(path) );
			}
		}
		this.set("src", "Local Directory: " + this.fileList[0].webkitRelativePath.substring(0, this.fNameStartInd));
		this.set("task_size", pathList.length * 2 + 3);
		this.set("manifest", pathList);
	},

	getShortName: function(longName) {
		return longName.substr(this.fNameStartInd);
	},

	update_progress: function() {
		var write_position = this.get("write_position") || 0;
		var patch_position = this.get("patch_position") || 0;
		var x = 3 + write_position + patch_position;
		this.set("progress", x );
	},

	extract: function() {
		// set up all the callbacks
		this.on("validated:dir", this.readMime, this);
		this.on("validated:mime", this.readMetaInfo, this);
		this.on("change:root_file_path", this.readContainerRoot, this);
		this.on("parsed:root_file", this.parseIbooksDisplayOptions, this);
		this.on("parsed:ibooks_options", this.beginWriting, this);
		this.on("change:write_position", this.writeEntry, this);
		this.on("change:patch_position", this.correctURIs, this);
		this.on("change:failure", this.clean, this);
		this.on("change:failure", this.removeHandlers, this);

		// set up callbacks for reporting progess
		this.on("change:task_size", this.update_progress, this);
		this.on("change:write_position", this.update_progress, this);
		this.on("change:patch_position", this.update_progress, this);
		this.on("extraction_success", this.extraction_complete, this);

		// fire the event that says started
		this.set("extracting", true);

		// initialize the FS and begin process
		var that = this;
		Readium.FileSystemApi(function(fs){
			that.fsApi = fs;
			fs.getFileSystem().root.getDirectory(that.base_dir_name, {create: true}, function(dir) {
				that.set("root_url", dir.toURL());
				that.validateDir();
			});
		});

	},

	parseIbooksDisplayOptions: function() {
		this.trigger("parsed:ibooks_options");
		var that = this;
		try {
			this.readEntryByShortName(this.DISPLAY_OPTIONS, function(content) {
				that.packageDoc.parseIbooksDisplayOptions(content);
				that.trigger("parsed:ibooks_options");
			});
		} catch(e) {
			// there was no ibook_options file, thats fine....
			this.trigger("parsed:ibooks_options");	
		}
	},

	validateDir: function() {
		var entries = this.get("manifest")
		if(entries.indexOf(this.MIMETYPE) >= 0 && entries.indexOf(this.CONTAINER) >= 0) {
			this.trigger("validated:dir");
		} else {
			this.set("error", "the directory you selected was not valid");
		}
	},

	readMime: function() {
		var that = this;
		this.set("log_message", "Verifying mimetype");
		try {
			this.readEntryByShortName(this.MIMETYPE, function(content) {
				that.validateMimetype(content);
			});			
		} catch (e) {
			this.set("error", e);
		}
	},

	readMetaInfo: function() {
		var that = this;
		try {
			this.readEntryByShortName(this.CONTAINER, function(content) {
				that.parseMetaInfo(content);
			});
		} catch (e) {
			this.set("error", e);
		}
	},

	readContainerRoot: function() {
		var that = this;
		var path = this.get("root_file_path");
		try {
			this.readEntryByShortName(path, function(content) {
				that.parseContainerRoot(content);
			});				
		} catch(e) {
			this.set("error", e);
		}	
	},

	beginWriting: function() {		
		// just set the first position
		this.set("write_position", 0);
	},

	writeEntry: function() {
		var that = this;
		var i = this.get("write_position");
		if(i === this.fileList.length) {
			this.set("patch_position", 0);
			return;
		}

		var file = this.fileList[i];
		var relpath = this.getShortName(file.webkitRelativePath);
		this.set("log_message", "writing: " + relpath);
		if(relpath.substr(-2) === "/.") {
			this.set("write_position", i+1);
			return;
		}
		this.writeFile(relpath, file, function() {
			that.set("write_position", i+1);
		});
	},

	// should only be used for text files
	readEntryByShortName: function(name, callback) {
		var found = false;
		var files = this.get("dir_picker").files;
		for (var i=0; i < files.length; i++) {
			if(this.getShortName(files[i].webkitRelativePath) === name) {
				found = true;
				var reader = new FileReader();
      			reader.onload = function(e) {
      				callback(e.target.result);
      			};
      			reader.readAsText(files[i]);
				break;
			}
		}
		if(!found) {
			throw ("asked to read non-existent file: " + name);
		}
	}

});
Readium.Routers.LibraryRouter = Backbone.Router.extend({

	initialize: function(options) {
		this.picker = options.picker;
	},

	routes: {
		"options": 		"showOptions", 
		"/unpack/*url": 	"beginExtraction"
	},

	showOptions: function() {
		$('#readium-options-modal').modal('show');
	},

	beginExtraction: function(url) {
		var extractor = new Readium.Models.ZipBookExtractor({url: url, src_filename: url});
		this.picker.beginExtraction(extractor);
	}

});
Timer = function() {};
Timer.prototype.start = function() {this.start = new Date()};
Timer.prototype.stop = function() {this.stop = new Date()};
Timer.prototype.report = function() {
	console.log("===================Timer Report======================");
	console.log(this.stop - this.start);
	console.log("===================Timer Report======================");
};

Readium.Models.LibraryItem = Backbone.Model.extend({

	idAttribute: "key",
	
	getViewBookUrl: function(book) {
		return "/views/viewer.html?book=" + this.get('key');
	},

	openInReader: function() {
		window.location = this.getViewBookUrl();
	},

	destroy: function() {
		var key = this.get('key');
		Lawnchair(function() {
			var that = this; // <=== capture Lawnchair scope
			this.get(key, function(book) {
				if(book) {
					Readium.FileSystemApi(function(fs) {
						fs.rmdir(book.key);
						that.remove(key);
					});
				}
			});

			// Remove the viewer preferences as well
			propertiesKey = key + "_epubViewProperties";
			this.get(propertiesKey, function(epubViewProperties) {
				if(epubViewProperties) {
					Readium.FileSystemApi(function(fs) {
						fs.rmdir(epubViewProperties.key);
						that.remove(propertiesKey);
					});
				}
			});
		});
	}
});

Readium.Collections.LibraryItems = Backbone.Collection.extend({

	model: Readium.Models.LibraryItem
	
});

Readium.Views.LibraryItemView = Backbone.View.extend({

	tagName: 'div',

	className: "book-item",

	initialize: function() {
		this.template = Handlebars.templates.library_item_template;
	},

	render: function() {
		var renderedContent = this.template({data: this.model.toJSON()});
		$(this.el).html(renderedContent);
		return this;
	},

	events: {
		"click .delete": function(e) {
			e.preventDefault();
			var confMessage;
			var selector = "#details-modal-" + this.model.get('key');
			confMessage  = chrome.i18n.getMessage("i18n_are_you_sure");
			confMessage += "'";			
			confMessage += this.model.get('title');
			confMessage += "'";	
			confMessage += "?";


			if(confirm(confMessage)) {
				$(selector).modal('hide');
				this.model.destroy();
				this.remove();
			}
		},

		"click .read": function(e) {
			this.model.openInReader();
		}
		
	}
});

Readium.Views.LibraryItemsView = Backbone.View.extend({
	tagName: 'div',

	id: "library-items-container",

	className: 'row-view',

	initialize: function() {
		this.template = Handlebars.templates.library_items_template;
		this.collection.bind('reset', this.render, this);
		this.collection.bind('add',   this.addOne, this);
	},

	render: function() {
		var collection = this.collection;
		var content = this.template({});
		var $el = this.$el;
		$el.html(content);
		
		this.$('#empty-message').toggle(collection.isEmpty());

		collection.each(function(item) {
			var view = new Readium.Views.LibraryItemView({
				model: item,
				collection: collection,
				id: item.get('id')
			});
			$el.append( view.render().el );

		});
		this.restoreViewType();
		// i dunno if this should go here
		$('#library-books-list').html(this.el);
		return this;
	},

	restoreViewType: function() {
		// restore the setting
		if(Readium.Utils.getCookie("lib_view") === "block") {
			this.$el.addClass("block-view").removeClass("row-view");
		}
	},

	addOne: function(book) {
		var view = new Readium.Views.LibraryItemView({
			model: book,
			collection: this.collection,
			id: book.get('id')
		});
		// we are adding so this should always be hidden!
		this.$('#empty-message').toggle(false);
		$(this.el).append( view.render().el );
	},

	events: {
		
	}
});


Readium.Views.ExtractItemView = Backbone.View.extend({
	
	el: '#progress-container',

	initialize: function() {	
		this.template = Handlebars.templates.extracting_item_template;
		this.model.bind('change', this.render, this);
		this.model.bind("change:error", this.extractionFailed, this);
	},

	render: function() {
		var $el = $(this.el);
		if( this.model.get('extracting') ) {
			$el.html(this.template(this.model.toJSON()));
			$el.show("slow");
		}
		else {
			$el.hide("slow");
		}
		return this;
	},

	extractionFailed: function(msg) {
		alert(this.model.get("error"));
		this.model.set("extracting", false);
	}

});

Readium.Views.ReadiumOptionsView = Backbone.View.extend({
	el: "#readium-options-modal",

	initialize: function() {
		this.model.on("change", this.render, this);
		this.render();
		$(this.el).on('shown', function(){
			$('#options-heading').focus();
			setTimeout( function() {
				$('#options-btn').attr('aria-pressed', 'true');
			}, 1);
		}).on('hidden', function(){
			setTimeout( function(){
				$('#options-btn').attr('aria-pressed', 'false').focus();
			}, 1);
		});
	},

	render: function() {
		var m = this.model;
		this.$('#paginate_everything').prop('checked', m.get("paginate_everything"));
		this.$('#verbose_unpacking').prop('checked', m.get("verbose_unpacking"));
		this.$('#hijack_epub_urls').prop('checked', m.get("hijack_epub_urls"));
	},

	events: {
		"change #verbose_unpacking": "updateSettings",
		"change #hijack_epub_urls": "updateSettings",
		"change #paginate_everything": "updateSettings",
		"click #save-settings-btn": "save"
		},

		updateSettings: function() {
			var hijack = this.$('#hijack_epub_urls').prop('checked')
			var unpack = this.$('#verbose_unpacking').prop('checked')
			var paginate = this.$('#paginate_everything').prop('checked')
			
		this.model.set({"verbose_unpacking": unpack,
						"hijack_epub_urls": hijack,
						"paginate_everything": paginate});
		},

		save: function() {
			this.model.save();
			this.$el.modal("hide");
		}

});

Readium.Views.FilePickerView = Backbone.View.extend({
	el:"#add-book-modal",

	initialize: function() {
		$(this.el).on('shown', function(){
			$('#add-book-heading').focus();
			setTimeout( function() {
				$('#add-book-btn').attr('aria-pressed', 'true');
			}, 1);
		}).on('hidden', function(){
			setTimeout( function(){
				$('#add-book-btn').attr('aria-pressed', 'false').focus();
			}, 1);
		});
	},

	events: {
		"change #files": "handleFileSelect",
		"change #dir_input": "handleDirSelect",
		"click #url-button": "handleUrl"
	},

	show: function() {
		this.$el.modal('show');
	},

	hide: function() {
		this.$el.modal('hide');
	},

	resetForm: function() {
		this.$('input').val("");
	},

	handleUrl: function(evt) {
		var input = document.getElementById('book-url');
		if(input.value === null || input.value.length < 1) {
			alert("invalid url, cannot process");
		}
		else {
			var url = input.value;
			// TODO check src filename
			var extractor = new Readium.Models.ZipBookExtractor({url: url, src_filename: url});
			this.beginExtraction(extractor);
		}
	},

	handleFileSelect: function(evt) {
		var files = evt.target.files; // FileList object
		var extractor = new Readium.Models.ZipBookExtractor({file: files[0], src_filename: files[0].name});
		this.beginExtraction(extractor);
	},

	handleDirSelect: function(evt) {
		var dirpicker = evt.target; // FileList object		
		var extractor = new Readium.Models.UnpackedBookExtractor({dir_picker: dirpicker});
		this.beginExtraction(extractor);
		
	},

	beginExtraction: function(extractor) {
		var that = this;
		var timer = new Timer();
		timer.start();
		window._extract_view = new Readium.Views.ExtractItemView({model: extractor});
		extractor.on("extraction_success", function() {
			var book = extractor.packageDoc.toJSON();
			timer.stop();
			timer.report();
			that.collection.add(new Readium.Models.LibraryItem(book));
			that.resetForm();
			setTimeout(function() {
				chrome.tabs.create({url: "/views/viewer.html?book=" + book.key });
			}, 800);
		});
		extractor.on("change:failure", this.resetForm, this);
		
		extractor.extract();
		this.hide();
	}

});
Readium.Models.AudioClipPlayer = function() {
    
    // clip info
    var src = null;
    var clipBegin = null;
    var clipEnd = null;
    
    // force the clip to reset its start time
    var forceReset = false;
    
    // the html audio element created to hold whatever the current file is
    var elm = new Audio();
    
    // callback function
    var notifyClipDone = null;
    
    // send debug statements to the console
    var consoleTrace = false;
    
    // ID of the setInterval timer
    var intervalId = null;
    
    // current rate; default is normal speed
    var rate = 1.0;
    
    this.setNotifyClipDone = function(notifyClipDoneFn) {
        notifyClipDone = notifyClipDoneFn;
    };
    this.setConsoleTrace =  function(isOn) {
        consoleTrace = isOn;
    };
    
    // clipBeginTime and clipEndTime are in seconds
    // filesrc is an absolute path, local or remote
    this.play = function(filesrc, clipBeginTime, clipEndTime, shouldForceReset) {
        src = filesrc;
        clipBegin = clipBeginTime;
        clipEnd = clipEndTime;
        forceReset = shouldForceReset;
        
        debugPrint("playing " + src + " from " + clipBegin + " to " + clipEnd);
        
        // make sure we haven't already created an element for this audio file
        if (elm == null || elm.getAttribute("src") != src) {
            loadData();
        }
        // the element is already loaded; just need to continue playing at the right point
        else {
            elm.playbackRate = rate;
            continueRender();
        }
    };
    
    this.isPlaying = function() {
        if (elm == null) {
            return false;
        }
        return !elm.paused;
    };
    
    this.resume = function() {
        if (elm != null) {
            elm.play();
        }
    };
    
    this.pause = function() {
        if (elm != null) {
            elm.pause();
        }
    };
    
    this.setNotifyOnPause = function(notifyOnPause) {
        elm.addEventListener("pause", function() {
            notifyOnPause();
        });
    };
    
    this.setNotifyOnPlay = function(notifyOnPlay) {
        elm.addEventListener("play", function() {
            notifyOnPlay();
        });
    };
    
    this.getCurrentTime = function() {
        if (elm != null) {
            return elm.currentTime;
        }
        return 0;
    };
    this.getCurrentSrc = function() {
        return src;
    };
    // volume ranges from 0 to 1.0
    this.setVolume = function(value) {
        if (value < 0) {
            elm.volume = 0;
        }
        else if (value > 1) {
            elm.volume = 1;
        }
        else {
            elm.volume = value;
        }
    };
    // reasonable rate values are from 0.5 (slow) to 2.5 (fast),
    // though no restrictions are hardcoded here
    this.setRate = function(value) {
        if (this.isPlaying()) {
            elm.playbackRate = value;
        }
        rate = value;  
    };
    this.getVolume = function() {
        return elm.volume;  
    };
    this.getRate = function() {
        return rate;
    };
    this.reset = function() {
        elm.setAttribute("src", "");
    };
    function loadData(){
        debugPrint("Loading file " + src);
        elm.setAttribute("src", src);
        
        // wait for 'canplay' before continuing
        elm.addEventListener("canplay", setThisTime);
        function setThisTime() {
            elm.removeEventListener("canplay", setThisTime);
            // TODO put something in here for remote files to make sure the file is buffered
        
            //if clipEnd is -1, it means the value was not specified
            // we handle unspecified clipBegin by setting it to 0 at parsetime
            if (clipEnd == -1 || clipEnd > elm.duration) {
                debugPrint("File is shorter than specified clipEnd time");
                clipEnd = elm.duration;
            }
            debugPrint("Audio data loaded");
            elm.playbackRate = rate;
            continueRender();        
        }
        
        elm.addEventListener("ended", ended);
        function ended() {
            elm.removeEventListener("ended", ended);
            debugPrint("Audio file ended.");
            // cancel the timer, if any
            if (intervalId != null) {
                clearInterval(intervalId);
            }
            if (notifyClipDone != null) {
                notifyClipDone();
            }
        }
    }
    
    function continueRender() {
        
        // if the current time is already somewhere within the clip that we want to play, then just let it keep playing
        if (forceReset == false && elm.currentTime > clipBegin && elm.currentTime < clipEnd) {
            startClipTimer();
            elm.play();    
        }
        else {
            elm.addEventListener("seeked", seeked);
            debugPrint("setting currentTime from " + elm.currentTime + " to " + clipBegin);
            elm.currentTime = clipBegin;
            function seeked() {
                elm.removeEventListener("seeked", seeked);
                startClipTimer();
                elm.play();
            }
        }
    }
    
    function startClipTimer() {
        
        // cancel the old timer, if any
        if (intervalId != null) {
            clearInterval(intervalId);
        }
        
        // we're using setInterval instead of monitoring the timeupdate event because timeupdate fires, at best, every 200ms, which messes up playback of short phrases.
        // 11ms seems to be chrome's finest allowed granularity for setInterval (and this is for when the tab is active; otherwise it fires about every second)
        intervalId = setInterval(function() {
            if (elm.currentTime >= clipEnd && clipEnd != -1) {
                debugPrint(elm.currentTime + " >= " + clipEnd);
                clearInterval(intervalId);
                debugPrint("clip done");
                if (notifyClipDone != null) {
                    notifyClipDone();
                }
            }
        }, 11);   
    }
    
    function debugPrint(str) {
        if (consoleTrace) {
            console.log("AudioClipPlayer: " + str);
        }
    }
};
// SmilModel both creates and plays the model
// Right now, the model extends the SMIL XML DOM; 
// if this becomes too heavy, we could use a custom lightweight tree instead
Readium.Models.SmilModel = function() {
    
    // these are playback logic functions for SMIL nodes
    // the context of each function is the node itself, as these functions will be attached to the nodes as members
    // e.g. 
    // parNode.render = parRender
    // seqNode.render = seqRender
    // etc
    NodeLogic = {
        
        parRender: function() {
            $.each(this.childNodes, function(index, value) {
                if (value.hasOwnProperty("render")) {
                    value.render();
                }
            });
        },
    
        // render starting at the given node; if null, start at the beginning
        seqRender: function(node) {
            if (node == null) {
                this.firstElementChild.render();
            }
            else {
                node.render();
            }
        },
    
        // called when the clip has completed playback
        audioNotifyChildDone: function() {
            this.parentNode.notifyChildDone(this);
        },
    
        // receive notice that a child node has finished playing
        parNotifyChildDone: function(node) {
            // we're only expecting one audio node child that we have to wait for
            // in the case of a more complex SMIL document (i.e. not media overlays), 
            // we might have to wait for more children to finish playing
            if (node.tagName == "audio") {
                this.parentNode.notifyChildDone(this);
            }
        },
    
        // receive notice that a child node has finished playing
        seqNotifyChildDone: function(node) {
            if (node.nextElementSibling == null) {
                if (this == root) {
                    notifySmilDone();
                }
                else {
                    this.parentNode.notifyChildDone(this);
                }
            }
            else {
                // prepare to play the next child node
                this.render(node.nextElementSibling);
            }
        }
    };
    
    
    // default renderers for time container playback
    // treat <body> like <seq>
    var renderers = {"seq": NodeLogic.seqRender, 
                    "par": NodeLogic.parRender, 
                    "body": NodeLogic.seqRender};
                    
    // each node type has a notification function associated with it
    // the notifiers get called when a child of the node has finished playback
    var notifiers = {"seq": NodeLogic.seqNotifyChildDone, 
                    "par": NodeLogic.parNotifyChildDone, 
                    "body": NodeLogic.seqNotifyChildDone,
                    "audio": NodeLogic.audioNotifyChildDone,
                    "text": function() {}}
    var url = null;
    var urlObj = null;
    var notifySmilDone = null;
    var root = null;
    
    // call this first with the media node renderers to add them to the master list
    this.addRenderers = function(rendererList) {
        renderers = $.extend(renderers, rendererList);
    };
    
    // set this so the model can resolve src attributes
    this.setUrl = function(fileUrl) {
        url = fileUrl;
        urlObj = new URI(url);
    };
    
    // set the callback for when the tree is done
    this.setNotifySmilDone = function(fn) {
        notifySmilDone = fn;
    };
    
    // build the model
    // node is the root of the SMIL tree, for example the body node of the DOM
    this.build = function(node) {
        root = node;
        processTree(node);
    };
    
    // prepare the tree to start rendering from a node
    this.render = function(node) {
        if (node == null || node == undefined || node == root) {
            root.render(null);
        }
        else {
            // if we're jumping to a point in the middle of the tree, then mark the first audio clip as a jump target
            // because it affects audio playback
            var audioNode = this.peekNextAudio(node);
            audioNode.isJumpTarget = true;
            node.parentNode.render(node);
        }
    };
    
    // find the first node with the given attribute value
    // e.g.
    // findNodeByAttrValue("*", "id", "num1")
    // findNodeByAttrValue("text", "", "")
    // findNodeByAttrValue("*", "id", "")
    // but NOT findNodeByAttrValue("text", "", "num1")
    this.findNodeByAttrValue = function(nodename, attr, val) {
        if (root == null) return null;
        var res = null;
        var attr_ = attr;
        
        if (attr_.indexOf(":") != -1) {
            // normalize for jquery
            attr_ = attr_.replace(":", "\\:");
        }
        
        var selector = nodename;
        if (attr_ != "") {
            selector += "[" + attr_;
            if (val != "") {
                selector += "='" + val + "'";
            }
            selector += "]";
        }
        res = $(root).find(selector);
        res = res.length == 0 ? null : res[0]; // grab first result
          
        return res;
    };
    
    // see what the next audio node is going to be
    // TODO take skippability into consideration
    this.peekNextAudio = function(currentNode) {
        
        // these first 2 cases are arguably just here for convenience: if we're near an audio node, then return it
        // TODO this does not consider that audio elements are actually optional children of <par>
        if (currentNode.tagName == "par") {
            return $(currentNode).find("audio")[0];
        }
        // TODO same as above
        if (currentNode.tagName == "text") {
            return $(currentNode.parentNode).find("audio")[0];
        }
        
        // if we aren't near an audio node, then keep looking
        var node = currentNode.parentNode;
        // go up the tree until we find a relative
        while(node.nextElementSibling == null) {
            node = node.parentNode;
            if (node == root) {
                return null;
            }
        }
        // find the first audio node
        return $(node.nextElementSibling).find("audio")[0];
    };
    
    // recursively process a SMIL XML DOM
    function processTree(node) {
        processNode(node);
        if (node.childNodes.length > 0) {
            $.each(node.childNodes, function(idx, val) {
                processTree(val);
            });
        }
    }       
    
    // process a single node and attach render and notify functions to it
    function processNode(node) {
        // add a toString method for debugging
        node.toString = function() {
            var string = "<" + this.nodeName;
            for (var i = 0; i < this.attributes.length; i++) {
                string += " " + this.attributes.item(i).nodeName + "=" + this.attributes.item(i).nodeValue;
            }
            string += ">";
            return string;
        };
        
        // connect the appropriate renderer
        if (renderers.hasOwnProperty(node.tagName)) {
            node.render = renderers[node.tagName];
        }
        
        // connect the appropriate notifier
        if (notifiers.hasOwnProperty(node.tagName)) {
            node.notifyChildDone = notifiers[node.tagName];
        }
        
        scrubAttributes(node);
    }
    
    // make sure the attributes are to our liking
    function scrubAttributes(node) {
        // process audio nodes' clock values
        if (node.tagName == "audio") {
            if ($(node).attr("src") != undefined) {
                $(node).attr("src", resolveUrl($(node).attr("src")));
            }    
            if ($(node).attr("clipBegin") != undefined) {
                $(node).attr("clipBegin", resolveClockValue($(node).attr("clipBegin")));
            }
            else {
                $(node).attr("clipBegin", 0);
            }
            if ($(node).attr("clipEnd") != undefined) {
                $(node).attr("clipEnd", resolveClockValue($(node).attr("clipEnd")));
            }
            else {
                $(node).attr("clipEnd", -1);
            }
        }
        else if (node.tagName == "text") {
            if ($(node).attr("src") != undefined) {
                $(node).attr("src", resolveUrl($(node).attr("src")));
            }
            if ($(node).attr("epub:textref") != undefined) {
                $(node).attr("epub:textref", resolveUrl($(node).attr("epub:textref")));
            }
        }
    }
    
    // TODO in the future, this will act as a skippability filter
    function canPlayNode(node) {
        return true;
    }
    
    // resolve url against SmilModel's urlObj
    function resolveUrl(url) {
        var url_ = new URI(url);
        return url_.resolve(urlObj).toString();
    }
    
    // parse the timestamp and return the value in seconds
    // supports this syntax: http://idpf.org/epub/30/spec/epub30-mediaoverlays.html#app-clock-examples
    function resolveClockValue(value) {        
        var hours = 0;
        var mins = 0;
        var secs = 0;
        
        if (value.indexOf("min") != -1) {
            mins = parseFloat(value.substr(0, value.indexOf("min")));
        }
        else if (value.indexOf("ms") != -1) {
            var ms = parseFloat(value.substr(0, value.indexOf("ms")));
            secs = ms/1000;
        }
        else if (value.indexOf("s") != -1) {
            secs = parseFloat(value.substr(0, value.indexOf("s")));                
        }
        else if (value.indexOf("h") != -1) {
            hours = parseFloat(value.substr(0, value.indexOf("h")));                
        }
        else {
            // parse as hh:mm:ss.fraction
            // this also works for seconds-only, e.g. 12.345
            arr = value.split(":");
            secs = parseFloat(arr.pop());
            if (arr.length > 0) {
                mins = parseFloat(arr.pop());
                if (arr.length > 0) {
                    hours = parseFloat(arr.pop());
                }
            }
        }
        var total = hours * 3600 + mins * 60 + secs;
        return total;
    }
};
// loads and plays a single SMIL document
Readium.Models.MediaOverlay = Backbone.Model.extend({
    audioplayer: null,
    smilModel: null,
    consoleTrace: false,
    url: null,
    urlObj: null,
    
    // observable properties
    defaults: {
        current_text_src: null,    
        has_started_playback: false,
        is_document_done: false,
        is_playing: false,
        is_ready: false
    },
    
    initialize: function() {
        var self = this;
        this.audioplayer = new Readium.Models.AudioClipPlayer();

        // always know whether we're playing or paused
        this.audioplayer.setNotifyOnPause(function() {
            self.set({is_playing: self.audioplayer.isPlaying()});
        });
        this.audioplayer.setNotifyOnPlay(function(){
           self.set({is_playing: self.audioplayer.isPlaying()});
        });    
    },
    
    // set the URL before calling fetch()
    setUrl: function(smilUrl) {
        this.url = smilUrl;
        this.urlObj = new URI(this.url);
    },
    
    // start retrieving the data
    fetch: function(options) {
        this.set({is_ready: false});
        options = options || {};
        options.dataType="xml";
        Backbone.Model.prototype.fetch.call(this, options);
    },
    
    // backbone fetch() callback; passes in an xml data object
    parse: function(xml) {
        var self = this;
        this.smilModel = new Readium.Models.SmilModel();
        this.smilModel.setUrl(this.url);
        this.smilModel.setNotifySmilDone(function() {
            self.debugPrint("document done");
            self.set({is_document_done: true});
        });
        
        // very important piece of code: attach render functions to the model
        // at runtime, 'this' is the node in question
        this.smilModel.addRenderers({            
            "audio": function() {
                // have the audio player inform the node directly when it's done playing
                var thisNode = this;
                self.audioplayer.setNotifyClipDone(function() {
                    thisNode.notifyChildDone();
                });
                var isJumpTarget = false;
                if (this.hasOwnProperty("isJumpTarget")) {
                    isJumpTarget = this.isJumpTarget;
                    // reset the node's property
                    this.isJumpTarget = false;
                }

                // play the node
                self.audioplayer.play($(this).attr("src"), parseFloat($(this).attr("clipBegin")), parseFloat($(this).attr("clipEnd")), isJumpTarget);
            }, 
            "text": function(){
                var src = $(this).attr("src");
                self.debugPrint("Text: " + src);
                self.set("current_text_src", src);
            }
        });
        
        // start the playback tree at <body>
        var smiltree = $(xml).find("body")[0]; 
        this.smilModel.build(smiltree);
        this.set({is_ready: true});
    },
    // start playback
    // node is a SMIL node that indicates the starting point
    // if node is null, playback starts at the beginning
    startPlayback: function(node) {
        if (this.get("is_ready") === false) {
            this.debugPrint("document not ready");
            return;
        }
        this.set({is_document_done: false});
        this.set({has_started_playback: true});
        this.smilModel.render(node);        
    },
    pause: function() {
        if (this.get("is_ready") == false) {
            this.debugPrint("document not ready");
            return;
        }
        if (this.get("has_started_playback") == false) {
            this.debugPrint("can't pause: playback not yet started");
            return;
        }
        this.audioplayer.pause();
    },
    resume: function() {
        if (this.get("is_ready") == false) {
            this.debugPrint("document not ready");
            return;
        }
        if (this.get("has_started_playback") == false) {
            this.debugPrint("can't resume: playback not yet started");
            return;
        }
        this.audioplayer.resume();        
    },
    findNodeByTextSrc: function(src) {
        if (this.get("is_ready") == false) {
            this.debugPrint("document not ready");
            return null;
        }
        
        if (src == null || src == undefined || src == "") {
            return null;
        }
        
        var elm = this.smilModel.findNodeByAttrValue("text", "src", src);
        if (elm == null){
            elm = this.smilModel.findNodeByAttrValue("seq", "epub:textref", src);
        }    
        return elm;
    },
    setVolume: function(value) {
        this.audioplayer.setVolume(value);
    },
    setRate: function(value) {
        this.audioplayer.setRate(value);
    },
    getVolume: function() {
        return this.audioplayer.getVolume();
    },
    getRate: function() {
        return this.audioplayer.getRate();
    },
    reset: function() {
        this.set("current_text_src", null);
        this.set("has_started_playback", false);
        this.audioplayer.reset();
    },
    setConsoleTrace: function(onOff) {
        this.consoleTrace = onOff;
        this.audioplayer.setConsoleTrace(onOff);
    },
    debugPrint: function(str) {
        if (this.consoleTrace) {
            console.log("MediaOverlay: " + str);
        }
    }
});
// Description: This model is responsible for the read-only attributes and content of an epub. 
// Rationale: This is designed as a model to represent the state of an epub as it is maintained by the Readium application.
//   As Readium does not have any authoring capabilities (a saved epub is not modified), this model essentially represents the 
//   epub in a read-only fashion (although this is not enforced).

Readium.Models.EPUB = Backbone.Model.extend({

	defaults: {
    	"can_two_up": true
  	},

  	// ------------------------------------------------------------------------------------ //
  	//  "PUBLIC" METHODS (THE API)                                                          //
  	// ------------------------------------------------------------------------------------ //

	initialize: function() {

		// capture context for use in callback functions
		var that = this;

		// intantiate a [`PackageDocument`](/docs/packageDocument.html)
		this.packageDocument = new Readium.Models.PackageDocument({ 
			book : this, 
			file_path : this.get("package_doc_path") 
			});
	},

	getPackageDocument: function () {

		return this.packageDocument;
	},

  	toJSON: function() {

  		// only save attrs that should be persisted:
  		return {
			"apple_fixed": this.get("apple_fixed"),
			"author": this.get("author"),
			"cover_href": this.get("cover_href"),
			"created_at": this.get("created_at"),
			"description": this.get("description"),
			"epub_version": this.get("epub_version"),
			"fixed_layout": this.get("fixed_layout"),
			"id": this.get("id"),
			"key": this.get("key"),
			"language": this.get("language"),
			"layout": this.get("layout"),
			"modified_date": this.get("modified_date"),
			"ncx": this.get("ncx"),
			"open_to_spread": this.get("open_to_spread"),
			"orientation": this.get("orientation"),
			"package_doc_path": this.get("package_doc_path"),
			"page_prog_dir": this.get("page_prog_dir"),
			"paginate_backwards": this.get("paginate_backwards"),
			"pubdate": this.get("pubdate"),
			"publisher": this.get("publisher"),
			"rights": this.get("rights"),
			"spread": this.get("spread"),
			"src_url": this.get("src_url"),
			"title": this.get("title")
		};
	},

	resolvePath: function(path) {
		return this.packageDocument.resolvePath(path);
	},

	// is this book set to fixed layout at the meta-data level
	isFixedLayout: function() {
		return this.get("fixed_layout") || this.get("apple_fixed");
	}
});
// Description: This model is responsible determining page numbers to display for both reflowable and fixed layout pubs.
// Rationale: This model exists to abstract and encapsulate the logic for determining which pages numbers should be
//   dispalyed in the viewer. The logic for this is reasonably complex, as there a number of different factors that must be
//   taken into account in various cases. These include: The type of the pub (reflowable or fixed layout), the page progression direction, 
//   the reading order of pages, the number of pages displayed on the screen and author preferences 
//   for the location of pages (left/right/centre). 

Readium.Models.PageNumberDisplayLogic = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {},

    // Description: This method determines the page numbers to display, given a single page number to "go to"
    // Arguments (
    //   gotoPageNumber (integer): The page number to "go to"
    //   twoUp (boolean): Are two pages currently displayed in the reader?
    //   isFixedLayout (boolean): Are the current set of pages fixed layout pages? 
    //   pageProgDirection ("rtl" or "ltr): The page progression direction
    //	)
	// REFACTORING CANDIDATE: This might be better named as getPageNumsToDisplay; the "goto" is confusing; also some
	//   deep nesting here that could be refactored for clarity.
	getGotoPageNumsToDisplay: function(gotoPageNumber, twoUp, isFixedLayout, pageProgDirection, firstPageOffset) {

		if (twoUp) {
			
			// Fixed layout page
			if (isFixedLayout) {

				if (pageProgDirection === "rtl") {

					if (this.displayedPageIsLeft(gotoPageNumber)) {

						if (this.displayedPageIsRight(gotoPageNumber - 1)) {
							return [gotoPageNumber - 1, gotoPageNumber];
						}
						else {
							return [gotoPageNumber];
						}
					}
					else if (this.displayedPageIsRight(gotoPageNumber)) {

						if (this.displayedPageIsLeft(gotoPageNumber + 1)) {
							return [gotoPageNumber, gotoPageNumber + 1];	
						}
						else {
							return [gotoPageNumber];
						}
					}
					// A center page
					else {
						return [gotoPageNumber];
					}
				}
				// Left-to-right page progression
				else {

					if (this.displayedPageIsLeft(gotoPageNumber)) {

						if (this.displayedPageIsRight(gotoPageNumber + 1)) {
							return [gotoPageNumber, gotoPageNumber + 1];
						}
						else {
							return [gotoPageNumber];
						}
					}
					else if (this.displayedPageIsRight(gotoPageNumber)) {

						if (this.displayedPageIsLeft(gotoPageNumber - 1)) {
							return [gotoPageNumber - 1, gotoPageNumber];
						}
						else {
							return [gotoPageNumber];
						}
					}
					// A center page
					else {
						return [gotoPageNumber];
					}
				}
			}
			// This is a reflowable page
			else {

				if (firstPageOffset) {

					if (gotoPageNumber % 2 === 1) {
						return [gotoPageNumber - 1, gotoPageNumber];
					}
					else {
						return [gotoPageNumber, gotoPageNumber + 1];
					}
				}
				else {
					// in reflowable format, we want this config always:
					// ODD_PAGE |spine| EVEN_PAGE
					if (gotoPageNumber % 2 === 1) {
						return [gotoPageNumber, gotoPageNumber + 1];	
					} 
					else {
						return [gotoPageNumber - 1, gotoPageNumber];
					}
				}	
			}
		}
		else {	
			return [gotoPageNumber];
		}
	},

    // Description: Get the pages numbers to display when moving in reverse reading order
    // Arguments (
    //   prevPageNumberToDisplay (integer): The page to move to; this page must be one of the displayed pages
    //   isFixedLayout (boolean): Are the current set of pages fixed layout pages? 
    //   pageProgDirection ("rtl" or "ltr): The page progression direction    	
    //	)
	getPrevPageNumsToDisplay: function (prevPageNumberToDisplay, isFixedLayout, pageProgDirection) {

		// If fixed layout
		if (isFixedLayout) {

			if (pageProgDirection === "rtl") {

				// If the first page is a left page in rtl progression, only one page 
				// can be displayed, even in two-up mode
				if (this.displayedPageIsLeft(prevPageNumberToDisplay) && 
					this.displayedPageIsRight(prevPageNumberToDisplay - 1)) {

					return [prevPageNumberToDisplay - 1, prevPageNumberToDisplay];
				}
				else {

					return [prevPageNumberToDisplay];
				}
			}
			// Left-to-right progresion
			else {

				if (this.displayedPageIsRight(prevPageNumberToDisplay) &&
					this.displayedPageIsLeft(prevPageNumberToDisplay - 1)) {

					return [prevPageNumberToDisplay - 1, prevPageNumberToDisplay];
				}
				else {

					return [prevPageNumberToDisplay];
				}
			}
		}
		// A reflowable text
		else {

			return [prevPageNumberToDisplay - 1, prevPageNumberToDisplay];
		}
	},

	// Description: Get the pages to display when moving in reading order
    // Arguments (
    //   nextPageNumberToDisplay (integer): The page to move to; this page must be one of the displayed pages
    //   isFixedLayout (boolean): Are the current set of pages fixed layout pages? 
    //   pageProgDirection ("rtl" or "ltr): The page progression direction    	
    //	)
	getNextPageNumsToDisplay: function (nextPageNumberToDisplay, isFixedLayout, pageProgDirection) {

		// If fixed layout
		if (isFixedLayout) {

			if (pageProgDirection === "rtl") {

				// If the first page is a left page in rtl progression, only one page 
				// can be displayed, even in two-up mode
				if (this.displayedPageIsRight(nextPageNumberToDisplay) &&
					this.displayedPageIsLeft(nextPageNumberToDisplay + 1)) {

					return [nextPageNumberToDisplay, nextPageNumberToDisplay + 1];
				}
				else {

					return [nextPageNumberToDisplay];
				}
			}
			else {

				if (this.displayedPageIsLeft(nextPageNumberToDisplay) && 
					this.displayedPageIsRight(nextPageNumberToDisplay + 1)) {

					return [nextPageNumberToDisplay, nextPageNumberToDisplay + 1];
				}
				else {

					return [nextPageNumberToDisplay];
				}
			}
		}
		// Reflowable section
		else {

			return [nextPageNumberToDisplay, nextPageNumberToDisplay + 1];
		}
	},

	// Description: This method determines which page numbers to display when switching
	//   between a single page and side-by-side page views and vice versa.
	// Arguments (
	//   twoUp (boolean): Are two pages currently displayed in the reader?
	//   displayedPageNumbers (array of integers): An array of page numbers that are currently displayed	
	//   isFixedLayout (boolean): Are the current set of pages fixed layout pages? 
	//   pageProgDirection ("rtl" or "ltr): The page progression direction
	//	)
	// Notes: Authors can specify a fixed layout page as a "center" page, which prevents more than one page
	//   being displayed. This case is not handled yet.
	getPageNumbersForTwoUp: function(twoUp, displayedPageNumbers, pageProgDirection, isFixedLayout, firstPageOffset) {

		var displayed = displayedPageNumbers;
		var twoPagesDisplayed = displayed.length === 2 ? true : false;
		var newPages = [];

		// Two pages are currently displayed; find the single page number to display
		if (twoPagesDisplayed) {

			// Rationale: I think this check is a bit of a hack, for the case in which a set of pages is [0, 1]. Pages are
			//   1-indexed, so the "0" in the 0 index position of the array is not valid.
			if (displayed[0] === 0) {
				
				newPages[0] = 1;
			} 
			else {
				
				newPages[0] = displayed[0];
			}
		}
		// A single reflowable page is currently displayed; find two pages to display
		else if (!isFixedLayout) {

			if (firstPageOffset) {

				if (displayed[0] % 2 === 1) {
					
					newPages[0] = displayed[0] - 1;
					newPages[1] = displayed[0];
				}
				else {
					
					newPages[0] = displayed[0];
					newPages[1] = displayed[0] + 1;
				}				
			}
			else {

				if (displayed[0] % 2 === 1) {
					
					newPages[0] = displayed[0];
					newPages[1] = displayed[0] + 1;
				}
				else {
					
					newPages[0] = displayed[0] - 1;
					newPages[1] = displayed[0];
				}
			}
		}
		// A single fixed layout page is displayed
		else {

			// page progression is right-to-left
			if (pageProgDirection === "rtl") {

				// and the previous one is right, then display both, otherwise, just display one
				if (this.displayedPageIsLeft(displayed[0])) {
					
					if (this.displayedPageIsRight(displayed[0] - 1)) {

						newPages[0] = displayed[0] - 1;
						newPages[1] = displayed[0];
					}
					else {

						newPages[0] = displayed[0];
					}
				}
				// if the next page is left, display both, otherwise, just display one
				else if (this.displayedPageIsRight(displayed[0])) {
					
					if (this.displayedPageIsLeft(displayed[0] + 1)) {
						
						newPages[0] = displayed[0];
						newPages[1] = displayed[0] + 1;
					}
					else {

						newPages[0] = displayed[0];
					}
				}
				// It is a center page
				else {

					newPages[0] = displayed[0];
				}
			}
			// page progression is left-to-right
			else {

				// If next page is a right page, display both, otherwise just display this one
				if (this.displayedPageIsLeft(displayed[0])) {
					
					if (this.displayedPageIsRight(displayed[0] + 1)) {
						
						newPages[0] = displayed[0];
						newPages[1] = displayed[0] + 1;
					}
					else {

						newPages[0] = displayed[0];
					}
				}
				else if (this.displayedPageIsRight(displayed[0])) {
					
					if (this.displayedPageIsLeft(displayed[0] - 1)) {
						
						newPages[0] = displayed[0] - 1;
						newPages[1] = displayed[0];
					}
					else {

						newPages[0] = displayed[0];
					}
				}
				// It is a center page
				else {

					newPages[0] = displayed[0];
				}
			}
		}

		return newPages;
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: The `displayedPageIs...` methods determine if a fixed layout page is right, left or center.
	//
	// Rationale: This is not an ideal approach, as we're pulling properties directly out of the dom, rather than
	//   out of our models. The rationale is that as of Readium 0.4.1, the page-spread-* value
	//   is not maintained in the model hierarchy accessible from an ebook object. An alternative
	//   would be to infer the left/right/center value from model attributes on ebook, or other objects in
	//   ebook's object hierarchy. However, this would duplicate the logic that exists elsewhere for determining right/left/center
	//   for a page, which is probably worse than pulling out of the dom. This approach also avoids having to convert
	//   from the page number (based on what is rendered on the screen) to spine index. 
	displayedPageIsRight: function (displayedPageNum) {

		return $("#page-" + displayedPageNum).hasClass("right_page") ? true : false;
	},

	displayedPageIsLeft: function (displayedPageNum) {

		return $("#page-" + displayedPageNum).hasClass("left_page") ? true : false;
	},

	displayedPageIsCenter: function (displayedPageNum) {

		return $("#page-" + displayedPageNum).hasClass("center_page") ? true : false;
	}
});

Readium.Models.ReadiumPagination = Backbone.Model.extend({ 

	defaults: {
		"num_pages" : 0
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

		this.epubController = this.get("model");

		// REFACTORING CANDIDATE: This is not ideal as it muddies the difference between the spine index position and 
		//   the page numbers that result from pagination. 
		this.set("current_page", [this.epubController.get("spine_position") + 1]);

		// Instantiate an object responsible for deciding which pages to display
		this.pageNumberDisplayLogic = new Readium.Models.PageNumberDisplayLogic();
		
		// if content reflows and the number of pages in the section changes
		// we need to adjust the the current page
		// Probably a memory leak here, should add a destructor
		this.on("change:num_pages", this.adjustCurrentPage, this);

	},

	// Description: This method determines which page numbers to display when switching
	//   between a single page and side-by-side page views and vice versa.
	toggleTwoUp: function() {

		if (this.epubController.epub.get("can_two_up")) {

			var newPages = this.pageNumberDisplayLogic.getPageNumbersForTwoUp (
				this.epubController.get("two_up"), 
				this.get("current_page"),
				this.epubController.epub.get("page_prog_dir"),
				this.epubController.getCurrentSection().isFixedLayout(),
				this.epubController.getCurrentSection().firstPageOffset()
				);

			this.set({current_page: newPages});
		}	
	},

	// REFACTORING CANDIDATE: This needs to be investigated, but I bet if the prevPage and nextPage methods were 
	//   called directly (goRight and goLeft were removed), the new page number display logic would account for the 
	//   page progression direction and that all this logic could be simplified in both this model and the 
	//   PageNumberDisplayLogic model
	// 
	// Description: turn pages in the rightward direction
	//   ie progression direction is dependent on 
	//   page progression dir
	goRight: function() {
		if (this.epubController.epub.get("page_prog_dir") === "rtl") {
			this.prevPage();
		}
		else {
			this.nextPage();	
		}
	},

	// Description: Turn pages in the leftward direction
	//   ie progression direction is dependent on 
	//   page progression dir
	goLeft: function() {
		if (this.epubController.epub.get("page_prog_dir") === "rtl") {
			this.nextPage();
		}
		else {
			this.prevPage();	
		}
	},

	goToPage: function(gotoPageNumber) {

		var pagesToGoto = this.pageNumberDisplayLogic.getGotoPageNumsToDisplay(
							gotoPageNumber,
							this.epubController.get("two_up"),
							this.epubController.getCurrentSection().isFixedLayout(),
							this.epubController.epub.get("page_prog_dir"),
							this.epubController.getCurrentSection().firstPageOffset()
							);
		this.set("current_page", pagesToGoto);
	},

	// Description: Return true if the pageNum argument is a currently visible 
	//   page. Return false if it is not; which will occur if it cannot be found in 
	//   the array.
	isPageVisible: function(pageNum) {
		return this.get("current_page").indexOf(pageNum) !== -1;
	},

	// REFACTORING CANDIDATE: prevPage and nextPage are public but not sure it should be; it's called from the navwidget and viewer.js.
	//   Additionally the logic in this method, as well as that in nextPage(), could be refactored to more clearly represent that 
	//   multiple different cases involved in switching pages.
	prevPage: function() {

		var curr_pg = this.get("current_page");
		var lastPage = curr_pg[0] - 1;

		// Clear the hash fragment if the user has decided to navigate away from it
		this.epubController.set("hash_fragment", undefined);

		if (curr_pg[0] <= 1) {

			this.epubController.goToPrevSection();
		}
		// REFACTORING CANDIDATE: The pagination/spine position relationship is still muddied. As a result, 
		//   the assumption that a single content document (spine element) is rendered in every scrolling view must be
		//   enforced here with this scrolling view specific check condition. 
		else if (this.epubController.paginator.shouldScroll() &&
			     !this.epubController.getCurrentSection().isFixedLayout()) {

			this.epubController.goToPrevSection();
		}
		// Single page navigation
		else if (!this.epubController.get("two_up")){

			this.set("current_page", [lastPage]);

			// Reset spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {
				var pos = this.epubController.get("rendered_spine_items")[lastPage - 1];
				this.epubController.set("spine_position", pos);
			}
		}
		// Move to previous page with two side-by-side pages
		else {

			var pagesToDisplay = this.pageNumberDisplayLogic.getPrevPageNumsToDisplay(
								lastPage,
								this.epubController.getCurrentSection().isFixedLayout(),
								this.epubController.epub.get("page_prog_dir")
								);
			this.set("current_page", pagesToDisplay);

			// Reset spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {
				var ind = (lastPage > 1 ? lastPage - 2 : 0);
				var pos = this.epubController.get("rendered_spine_items")[ind];
				this.epubController.set("spine_position", pos);
			}
		}
        
        // when we change the page, we have to tell MO about it
        this.epubController.get("media_overlay_controller").userChangedPage();
	},

	nextPage: function() {

		var curr_pg = this.get("current_page");
		var firstPage = curr_pg[curr_pg.length - 1] + 1;

		// Clear the hash fragment if the user has decided to navigate away from it
		this.epubController.set("hash_fragment", undefined);

		if (curr_pg[curr_pg.length - 1] >= this.get("num_pages")) {

			this.epubController.goToNextSection();
		}
		else if (!this.epubController.get("two_up")) {

			this.set("current_page", [firstPage]);

			// Reset the spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {

				var pos = this.epubController.get("rendered_spine_items")[firstPage - 1];
				this.epubController.set("spine_position", pos);
			}
		}
		// Two pages are being displayed
		else {

			var pagesToDisplay = this.pageNumberDisplayLogic.getNextPageNumsToDisplay(
								firstPage,
								this.epubController.getCurrentSection().isFixedLayout(),
								this.epubController.epub.get("page_prog_dir")
								);
			this.set("current_page", pagesToDisplay);

			// Reset the spine position
			if (this.epubController.get("rendered_spine_items").length > 1) {

				var pos = this.epubController.get("rendered_spine_items")[firstPage - 1];
				this.epubController.set("spine_position", pos);
			}
		}
        // when we change the page, we have to tell MO about it
        this.epubController.get("media_overlay_controller").userChangedPage();
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	adjustCurrentPage: function() {
		var cp = this.get("current_page");
		var num = this.get("num_pages");

		if (cp[cp.length - 1] > num) {
			this.goToLastPage();
		}

Acc.page = '#' + cp;

	},	

	// REFACTORING CANDIDATE: this is strange in that it does not seem to account for 
	//   possibly crossing over a section boundary
	goToLastPage: function() {
		var page = this.get("num_pages");
		this.goToPage(page);
	}
});
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['binding_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  


  return "<iframe scrolling=\"no\" \n		frameborder=\"0\" \n		marginwidth=\"0\" \n		marginheight=\"0\" \n		width=\"100%\" \n		height=\"100%\" \n		class='binding-sandbox'>\n</iframe>";});
templates['extracting_item_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<h5>";
  foundHelper = helpers.log_message;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.log_message; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</h5>\n<div class=\"progress progress-striped progress-success active \">	\n		<div role=\"status\" aria-live=\"assertive\" aria-relevant=\"all\" class=\"bar\" style=\"width: ";
  foundHelper = helpers.progress;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.progress; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "%;\"></div>\n</div>";
  return buffer;});
templates['fixed_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"fixed-page-margin\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"";
  foundHelper = helpers.width;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.width; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "px\" \n			height=\"";
  foundHelper = helpers.height;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.height; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "px\" \n			src=\"";
  foundHelper = helpers.uri;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uri; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n			title=\"";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"\n			class='content-sandbox'>\n	</iframe>\n</div>";
  return buffer;});
templates['image_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"fixed-page-margin\">\n	<img src=\"";
  foundHelper = helpers.uri;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uri; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\" alt=\"\" />\n</div>";
  return buffer;});
templates['library_item_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;


  buffer += "<div class='info-wrap'>\n	<div class='caption book-info'>\n		<h2 class='green info-item title'>";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</h2>\n		<div class='info-item author'>";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.author;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='info-item epub-version'>ePUB ";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.epub_version;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>		\n	</div>\n	\n	<img class='cover-image read' src='";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.cover_href;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "' width='150' height='220' alt='Open ePUB ";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "'>\n	\n	<a href=\"#details-modal-";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.key;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" class=\"info-icon\" aria-pressed=\"true\" data-toggle=\"modal\" role=\"button\">\n		<img class='info-icon pull-right' src='/images/library/info-icon.png' height=\"39px\" width=\"39px\" alt='";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + " information'>\n	</a>\n</div>\n\n<div class=\"caption buttons\">\n	<a href=\"#todo\" class=\"btn read\" data-book='";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.key;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "' role='button'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_read", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_read", {hash:{}});
  buffer += escapeExpression(stack1) + "</a>\n	<a href=\"#details-modal-";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.key;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\" aria-pressed=\"true\" class=\"btn details\" data-toggle=\"modal\" role=\"button\">\n		";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_details", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_details", {hash:{}});
  buffer += escapeExpression(stack1) + "\n	</a>\n</div>\n\n<div id='details-modal-";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.key;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "' class='modal fade details-modal'>\n<div class=\"offscreenText\"> Details Start </div>\n	<div class=\"pull-left modal-cover-wrap\">\n		<img class='details-cover-image' src='";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.cover_href;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "' width='150' height='220' alt='ePUB cover'>\n		<div class=\"caption modal-buttons\">\n			<a href=\"#\" class=\"btn read\" data-book='<%= data.key %>' role='button'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_read", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_read", {hash:{}});
  buffer += escapeExpression(stack1) + "</a>\n			<a class=\"btn btn-danger delete pull-right\" role='button'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_delete", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_delete", {hash:{}});
  buffer += escapeExpression(stack1) + "</a>\n		</div>\n	</div>\n	<div class='caption modal-book-info'>\n		<h3 class='green modal-title'>";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "</h3>\n		<div class='modal-detail gap'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_author", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_author", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.author;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_publisher", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_publisher", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.publisher;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_pub_date", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_pub_date", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.pubdate;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_modified_date", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_modified_date", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.modified_date;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail gap'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_id", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_id", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.id;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail green'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_epub_version", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_epub_version", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.epub_version;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n		<div class='modal-detail'>";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_created_at", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_created_at", {hash:{}});
  buffer += escapeExpression(stack1);
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.created_at;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "</div>\n	</div>\n	<div class='modal-detail source'>\n	<span class='green' style=\"padding-right: 10px\">";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_source", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_source", {hash:{}});
  buffer += escapeExpression(stack1) + "</span>\n		";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.src_url;
  foundHelper = helpers.orUnknown;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:{}}) : helperMissing.call(depth0, "orUnknown", stack1, {hash:{}});
  buffer += escapeExpression(stack1) + "\n	</div>\n<div class=\"offscreenText\"> Details End </div>\n</div>			";
  return buffer;});
templates['library_items_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  buffer += "<div id='empty-message'>\n	<p id='empty-message-text' class='green'>\n		";
  foundHelper = helpers.fetchInzMessage;
  stack1 = foundHelper ? foundHelper.call(depth0, "i18n_add_items", {hash:{}}) : helperMissing.call(depth0, "fetchInzMessage", "i18n_add_items", {hash:{}});
  buffer += escapeExpression(stack1) + "\n	</p>\n	<img id='empty-arrow' src='/images/library/empty_library_arrow.png' alt='Try adding an ePUB' />\n</div>";
  return buffer;});
templates['ncx_nav_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<li class=\"nav-elem\">\n	<a href=\"";
  foundHelper = helpers.href;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.href; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.text;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.text; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "</a>\n</li>";
  return buffer;});
templates['reflowing_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"flowing-wrapper\">\n	<iframe scrolling=\"no\" \n			frameborder=\"0\" \n			marginwidth=\"0\" \n			marginheight=\"0\" \n			width=\"50%\" \n			height=\"100%\" \n			title=\"";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"\n			src=\"";
  foundHelper = helpers.uri;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uri; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n			id=\"readium-flowing-content\">\n	</iframe>\n</div>";
  return buffer;});
templates['scrolling_page_template'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var buffer = "", stack1, foundHelper, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div id=\"scrolling-content\" class=\"scrolling-page-wrap\">\n	<div class=\"scrolling-page-margin\">\n\n		<iframe scrolling=\"yes\" \n				frameborder=\"0\" \n				marginwidth=\"0\" \n				marginheight=\"0\" \n				width=\"100%\" \n				height=\"100%\" \n				title=\"";
  stack1 = depth0.data;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.title;
  stack1 = typeof stack1 === functionType ? stack1() : stack1;
  buffer += escapeExpression(stack1) + "\"\n				src=\"";
  foundHelper = helpers.uri;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{}}); }
  else { stack1 = depth0.uri; stack1 = typeof stack1 === functionType ? stack1() : stack1; }
  buffer += escapeExpression(stack1) + "\"\n				class='content-sandbox'>\n		</iframe>\n	</div>\n</div>";
  return buffer;});
})();
// Description: This model is the primary integration layer between media overlays and the rest of Readium
// It tracks which MO is playing, and controls what happens to playback when a page turns or an href gets loaded

Readium.Models.MediaOverlayController = Backbone.Model.extend({

	defaults: {
        "state": "unavailable", // "playing", "paused", "not_started", "unavailable"
		"mo_text_id": null, // the current MO text fragment identifier
        "rate": 1.0, // the playback rate
        "volume": 1.0 // the volume
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

        // the current media overlay
        this.mo = null;
        
        // for mute/unmute
        this.savedVolume = 0;
        
        // the node to start playback at
        this.targetNode = null;
        
        // the current spine item
        this.currentSpineItem = null;
        
        // flag that MO is processing a text src
        this.isProcessingTextSrc = false;
        
        // flag that the user changed the page
        this.flagUserPageChange = false;
        
        // flag that the user's position was restored
        this.flagRestoredPosition = false;
        
        // readium epub controller, set as a constructor option
		this.epubController = this.get("epubController");
		
        // readium reflowable pagination view
        this.view = null;
        
        this.on("change:rate", this.rateChanged, this);
        this.on("change:volume", this.volumeChanged, this);  
        
        this.epubController.on("change:spine_position", this.handleSpineChanged, this);   
        
        // print debug statements
        this.consoleTrace = false;   
	},
    
    setView: function(view) {
        this.view = view;
    },
    
    // hooked up to the 'play/pause' button
	playMo: function(forcePosition) {
        if (this.currentSpineItem == null || !this.currentSpineItem.hasMediaOverlay()) {
            this.mo = null;
            this.set("state", "unavailable");
            this.debugPrint("No overlay available for this spine item.");
            return;
        }
        
        this.debugPrint("playMo");
        
        // just verify that we have the correct MO loaded
        // except when forcePosition is false -- then the MO was purposely set 
        // to something different than our current spine item, because the user navigated there,
        // and Readium will listen to MO regarding text display URLs
        if (forcePosition && this.currentSpineItem.getMediaOverlay() != this.mo) {
            this.mo = this.currentSpineItem.getMediaOverlay();
            this.set("state", "not_started");
        }
        if (this.mo == null) {
            return;
        }
        this.mo.setVolume(this.get("volume"));
        this.mo.setRate(this.get("rate"));
        this.mo.off(); // just to be safe
        this.mo.on("change:current_text_src", this.handleMoTextSrcChanged, this);
		this.mo.on("change:is_document_done", this.handleMoDocumentDoneChanged, this);
        
        // if we are processing a new page caused either by the user going to prev/next page
        // or by the restored position that gets loaded initially
        // there's a reason why this type of action is dealt with in 2 places: here and also mid-playback (see
        // updatePlaybackForReflowPageChange() ). By the time the user presses play, enough screen refreshing has
        // taken place that we can be more certain that the visible elements are the correct ones.
        if (!this.currentSpineItem.isFixedLayout() && (this.flagUserPageChange || this.flagRestoredPosition)) {
            this.flagUserPageChange = false;
            this.flagRestoredPosition = false;
            var visibleElms = this.view.findVisiblePageElements();
            this.targetNode= this.findFirstOnPageReflow(visibleElms);
            this.set("state", "not_started");
        }
        
        if (this.get("state") == "paused") {
            this.set("state", "playing");
            this.resumeMo();
        }
        else {
            this.mo.reset();
            this.set("state", "playing");
            var target = this.targetNode;
            this.targetNode = null;
            this.mo.startPlayback(target);            
        }
	},

    // hooked up to the 'play/pause' button
	pauseMo: function() {
        if (this.mo) {
            this.set("state", "paused");
            this.mo.off();
			this.mo.pause();
		}
	},
    
    // hooked up to the 'mute/unmute' button
    mute: function() {
        if (this.mo) {
            // unmute
            if (this.mo.getVolume() == 0) {
                // if the last-used volume was already at 0, restore it to a quiet level
                if (this.savedVolume == 0) {
                    this.savedVolume = .1;
                }
                this.set("volume", this.savedVolume);
                
            }
            // mute
            else {
                this.savedVolume = this.mo.getVolume();
                this.set("volume", 0);
            }
        }
    },
    
    // hooked up to the volume slider
    volumeChanged: function() {
        if (this.mo) {
            this.mo.setVolume(this.get("volume"));
        }
    },
    
    // hooked up to the rate slider
    rateChanged: function() {
        if (this.mo) {
            this.mo.setRate(this.get("rate"));
        }
    },
    
    increaseVolume: function() {
        var curr = this.get("volume");
        if (curr >= 1.0) {
            return;
        }
        if (curr + 0.1 >= 1.0) {
            this.set("volume", 1.0);
        }
        else {
            this.set("volume", curr + 0.1);
        }
    },
    
    decreaseVolume: function() {
        var curr = this.get("volume");
        if (curr <= 0) {
            return;
        }
        if (curr - 0.1 < 0) {
            this.set("volume", 0);
        }
        else {
            this.set("volume", curr - 0.1);
        }
        
    },
    
    increaseRate: function() {
        var curr = this.get("rate");
        if (curr >= 2.5) {
            return;
        }
        if (curr + 0.1 >= 2.5) {
            this.set("rate", 2.5);
        }
        else {
            this.set("rate", curr + 0.1);
        }
    },
    
    decreaseRate: function() {
        var curr = this.get("rate");
        if (curr <= 0.5) {
            return;
        }
        if (curr - 0.1 <= 0.5) {
            this.set("rate", 0.5);
        }
        else {
            this.set("rate", curr - 0.1);
        }
    },
    
    resetRate: function() {
        this.set("rate", 1.0);
    },
    
    // move to a specific point in the book
    // this could be the start of a section or bookmark etc
    goToHref: function(href) {
        // if we are in the middle of processing our own src, ignore it
        if (this.isProcessingTextSrc) {
            return;
        }
        
        this.debugPrint("goToHref");
        var wasPlaying = this.get("state") == "playing";
        if (wasPlaying) {
            this.pauseMo();
        }
            
        var splitUrl = href.match(/([^#]*)(?:#(.*))?/);
        var spinePos = this.epubController.packageDocument.spineIndexFromHref(splitUrl[1]);
        var spineItem = this.epubController.packageDocument.getSpineItem(spinePos);
            
        if (spineItem.hasMediaOverlay()) {
            this.mo = spineItem.getMediaOverlay();
            this.mo.reset();
            this.set("state", "not_started");
            // find the target node for the URI
            this.targetNode = this.findTarget(spineItem, splitUrl[2]);
            // if MO was playing, then stop and restart at this point
            if (wasPlaying) {
                this.playMo(false);
            }
        }
    },
    
    // called by the reflowable page view when the page changes
    // applies only during playback
    updatePlaybackForReflowPageChange: function() {
        // just to be safe: ignore fxl
        if (this.currentSpineItem.isFixedLayout()) {
            return;
        }
        
        // we only care about this if we are in the middle of playback
        // this is safer because readium might call this function several times
        if (this.get("state") == "playing" && 
            (this.flagUserPageChange || this.flagRestoredPosition)) {
            
            var visibleElms = this.view.findVisiblePageElements();
            
            // make sure there are actually elements on the page
            // if not, we can leave the flagged variables as-is, and 
            // this function will get called again by reflowable pagination view
            if (visibleElms.length > 0) {
                this.debugPrint("updatePlaybackForReflowPageChange");
                this.pauseMo();
            
                this.flagUserPageChange = false;
                this.flagRestoredPosition = false;
                this.set("state", "not_started");
                
                // make sure we're on the right spine item
                if (this.currentSpineItem.hasMediaOverlay()) {
                    if (this.mo != this.currentSpineItem.getMediaOverlay()) {
                        this.mo = this.currentSpineItem.getMediaOverlay();
                    }
                    this.mo.reset();
                    this.targetNode = this.findFirstOnPageReflow(visibleElms);  
                    this.set("mo_text_id", null);
                    this.playMo(true);
                }
                else {
                    this.mo = null;
                    this.set("mo_text_id", null);
                    this.set("state", "unavailable");
                }
            }
        }
    },
    
    // called by the page view when the user used "go to (prev/next) page"
    // if this flag is set, MO will respond to page refresh events
    // this function is really only useful for reflowable content
    userChangedPage: function() {
        this.flagUserPageChange = true;   
    },
    
    restoredPosition: function() {
        this.flagRestoredPosition = true;
    },
    
    // ------------------------------------------------------------------------------------ //
	//  "PRIVATE" METHODS                                                                   //
	// ------------------------------------------------------------------------------------ //
    resumeMo: function() {
        this.set("mo_text_id", null); // clear it so that any listeners re-hear the event
        this.handleMoTextSrcChanged();
        this.mo.resume();
    },
    
    handleMoTextSrcChanged: function() {
        this.debugPrint("handleMoTextSrcChanged " + this.mo.get("current_text_src"));
        this.isProcessingTextSrc = true;
        var textSrc = this.mo.get("current_text_src");
        if (textSrc == null) {
            this.set("mo_text_id", null);
            return;
        }
        
        this.epubController.goToHref(textSrc);
        var frag = "";
        if (textSrc.indexOf("#") != -1 && textSrc.indexOf("#") < textSrc.length -1) {
            frag = textSrc.substr(textSrc.indexOf("#")+1);
        }
        this.set("mo_text_id", frag);
        this.isProcessingTextSrc = false;
    },
    
    // caveat: this gets called when is_document_done changes, so we need to check if the document is indeed done
    handleMoDocumentDoneChanged: function() {
        if (this.mo != null && this.mo != undefined) {
            if (this.mo.get("is_document_done") == false) {
                return;
            }
        }
        this.debugPrint("handleMoDocumentDoneChanged");
        this.pauseMo();
        
        // advance the spine position
        if (this.epubController.hasNextSection()) {
            this.epubController.goToNextSection();
            this.playMo(true);
        }
    },
    
    // this acts as page change handler for fxl content
    handleSpineChanged: function() {
        // sometimes the spine changed event fires but the spine didn't actually change
        if (this.epubController.getCurrentSection() == this.currentSpineItem) {
            return;
        }
        this.currentSpineItem = this.epubController.getCurrentSection();
        
        if (!this.currentSpineItem.isFixedLayout()) {
            return;
        }
        
        var wasPlaying = this.get("state") == "playing";    
        if (wasPlaying) {
            this.pauseMo();
        }
          
        // make sure we're on the right spine item
        if (this.currentSpineItem.hasMediaOverlay()) {
            if (this.mo != this.currentSpineItem.getMediaOverlay()) {
                this.mo = this.currentSpineItem.getMediaOverlay();
            }
        }
        else {
            this.mo = null;
            this.set("mo_text_id", null);
            this.set("state", "unavailable");
        }
        
        if (this.mo == null) {
            return;
        }
        this.mo.reset();
        this.targetNode = this.findFirstOnPageFxl();
        this.set("state", "not_started");
        if (wasPlaying) {
            this.playMo(true);
        }
    },
    
    // find the MO starting point closest to targetId
    findTarget: function(spineItem, targetId) {
        
        if (targetId == null || targetId == undefined || targetId == "" ||
            spineItem == null) {
            return null;
        }
        // two issues here:
        // 1. MO might not have a corresponding <text> pointing to #fragId
        // In this case, we have to find the next-closest
        //
        // 2. we have to look at all elements, not just the currently visible ones. the pages get refreshed a few times
        // and the target element might not be displayed until the second time around. however, we need to find what the
        // most reasonable MO target is and can't risk coming up with nothing (because then MO starts at the top)
        
        var mo = spineItem.getMediaOverlay();
        var docHref = this.epubController.packageDocument.resolveUri(spineItem.get("href"));
        var startHref = docHref + "#" + targetId;
        var node = null;
        $.ajax({
            url: docHref,
            async: false,
            success: function(data, status, jqXHR) {
                var allElms = $(data).find("[id]");
                var foundStart = false; 
                for (var i = 0; i<allElms.length; i++) {
                    var id = $(allElms[i]).attr("id");
                    var src = docHref + "#" + id;
                    if (src == startHref) {
                        foundStart = true;
                    }
                    // once we found our starting point in the set, start looking at MO nodes
                    if (foundStart) {
                        node = mo.findNodeByTextSrc(src);
                        if (node) {
                            break;
                        }
                    }
                }
            }
        });
        return node;
    },
    
    // find the MO element for the first visible page element with an MO <text> equivalent
    findFirstOnPageReflow: function(visibleElms) {
        // this is only useful for reflowable content
        if (this.currentSpineItem.isFixedLayout()) {
            return null;
        }
        
        if (visibleElms.length == 0) {
            this.debugPrint("No visible page elements");
            return null;
        }
        
        var docHref = this.currentSpineItem.resolveUri(this.currentSpineItem.get("href"));
        var node = null;
        for (var i = 0; i<visibleElms.length; i++) {
            var id = $(visibleElms[i]).attr("id");
            var src = docHref + "#" + id;
            
            node = this.mo.findNodeByTextSrc(src);
            if (node) {
                break;
            }
        }
        return node;
    },
    
    // find the MO element for the first element in the current spine item with an MO equivalent
    findFirstOnPageFxl: function() {
        var docHref = this.currentSpineItem.resolveUri(this.currentSpineItem.get("href"));
        var mo = this.currentSpineItem.getMediaOverlay();
        
        $.ajax({
            url: docHref,
            async: false,
            success: function(data, status, jqXHR) {
                var allElms = $(data).find("[id]");
                for (var i = 0; i<allElms.length; i++) {
                    var id = $(allElms[i]).attr("id");
                    var src = docHref + "#" + id;
                    node = mo.findNodeByTextSrc(src);
                    if (node) {
                        break;
                    }
                }
            }
        });
        return node;
    },
    
    debugPrint: function(msg) {
        if (this.consoleTrace) {
            console.log("MO: " + msg);
        }
    }
});
// Description: This model provides helper methods related to Media Overlay functionality required by the fixed and reflowable views.
// Rationale: While these helpers could be included on the view objects themselves, this model was created to encapsulate view functionality
//   related to the display of media overlays for three reasons: First, the requirements for media overlays are expected to grow, which
//   would have produced larger and larger view models (by code size). Second, the primary responsibility of the pagination views is to paginate epub content
//   and provide an interface for accessing rendered content; adding MO methods to those objects would have clouded the abstraction. Third, MO
//   is the primary responsiblity of one contributor. Encapsulating MO view functionality in this model makes it easier for contributors to 
//   focus on their areas of responsibility. 

// REFACTORING CANDIDATE: The interfaces for the methods here are not particularly tight. In some cases, entire views are being 
//   passed to the methods. It would be better if the interfaces were built around something consistent; the page body being passed, 
//   etc. 
//   Interaction with the "pagination" could be improved too. It would be ideal to encorporate the concept of the "currently rendered
//   pages" into the methods here; this would use the ReadiumPagination model, which abstracts this concept. Currently, these methods
//   are working through the backbone views, but essentially using the DOM.

Readium.Models.MediaOverlayViewHelper = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {
		this.epubController = this.get("epubController");
	},

    // active class comes from the package document metadata
    // authors can specify the class name they want to have applied to 
    // active MO text fragments
    addActiveClass: function(fragElm) {
        var activeClass = this.getActiveClass();
        fragElm.toggleClass(activeClass, true);
    },

    removeActiveClass: function(body) {
        if (body != null && body != undefined) {   
            var activeClass = this.getActiveClass();
            var lastFrag = $(body).find("." + activeClass);
            lastFrag.toggleClass(activeClass, false);
            return lastFrag;
        }
        return null;
    },
    
    // we're not using themes for fixed layout, so just apply the active class name to the
    // current MO fragment, so that any authored styles will be applied.
    renderFixedLayoutMoFragHighlight: function(currentPages, currentMOFrag, fixedLayoutView) {
        var that = this;

        $.each(currentPages, function(idx) {
           var body = fixedLayoutView.getPageBody(this);
           that.removeActiveClass(body);
        }); 
        
		if(currentMOFrag) {
    		$.each(currentPages, function(idx) {
                var body = fixedLayoutView.getPageBody(this);
                // escape periods for jquery
                var newFrag = $(body).find("#" + currentMOFrag.replace(".", "\\."));
                if (newFrag.length > 0) {
                	that.addActiveClass(newFrag);	
                } 
           });
		}
	},

	renderFixedMoPlaying: function(currentPages, MOIsPlaying, fixedLayoutView) {
        var that = this;
        // if we are using the author's style for highlighting, then just clear it if we are not playing
        if (this.authorActiveClassExists()) {
            if (!MOIsPlaying) {
        		// get rid of the last highlight
                $.each(currentPages, function(idx) {
                   var body = fixedLayoutView.getPageBody(this);
                   that.removeActiveClass(body);
                }); 
            }
        }
	},
    

    // highlight the text
	renderReflowableMoFragHighlight: function(currentTheme, reflowableView, currentMOFrag) {
        if (currentTheme === "default") {
			currentTheme = "default-theme";
		}
        // get rid of the last highlight
		var body = reflowableView.getBody();
        var lastFrag = this.removeActiveClass(body);
        
        // if the author did not define an active class themselves
        if (this.authorActiveClassExists() == false) {
            if (lastFrag) {
                $(lastFrag).css("color", "");
            }
        }
        if (currentMOFrag) {
            // add active class to the new MO fragment
            // escape periods for jquery
            var newFrag = $(body).find("#" + currentMOFrag.replace(".", "\\."));
            if (newFrag.length > 0) {
                this.addActiveClass(newFrag);
                if (this.authorActiveClassExists() == false) {
                    $(newFrag).css("color", reflowableView.themes[currentTheme]["color"]);   
                }
            }
            // If the element corresponding to currentMOFrag wasn't found, it might be because the document hasn't 
            // completely loaded yet. Flag the view for re-highlighting.
            // Example of where this helps: load Moby Dick, start playback in Ch 1, go to Ch 2 from Toc, back to Ch 1, back to Ch 2. 
            // the highlight for the first phrase of the spine item isn't consistent without this rehighlighting function.
            else {
                reflowableView.flagRehighlight();
            }
		}
	},	
    

	// reflowable pagination uses default readium themes, which include a 'fade' effect on the inactive MO text
	renderReflowableMoPlaying: function(currentTheme, MOIsPlaying, reflowableView) {
		
        // if we are using the author's default style for highlighting, then just clear it if we are not playing
        if (this.authorActiveClassExists()) {
            if (!MOIsPlaying) {
        		// get rid of the last highlight
        		var body = reflowableView.getBody();
                var lastFrag = this.removeActiveClass(body);
            }
        }
        else {
    		if (currentTheme === "default") { 
    			currentTheme = "default-theme";
    		}
        
    		var body = reflowableView.getBody();
            if (MOIsPlaying) {
                // change the color of the body text so it looks inactive compared to the MO fragment that is playing
    			$(body).css("color", reflowableView.themes[currentTheme]["mo-color"]);
    		}
    		else {
                // reset the color of the text to the theme default
    			$(body).css("color", reflowableView.themes[currentTheme]["color"]);	

                // remove style info from the last MO fragment
                var lastFrag = this.removeActiveClass(reflowableView.getBody());
                if (lastFrag) {
                    $(lastFrag).css("color", "");
                }
    		}
        }
		
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

    getActiveClass: function() {
        var activeClass = this.epubController.packageDocument.get("metadata").active_class;
        if (activeClass == "") {
            // we need an active class value to use, whether the author specified it or not
            activeClass = "-readium-epub-media-overlay-active";
        }
        return activeClass;
    },
    
    // did the author supply an active-class metdata value
    authorActiveClassExists: function() {
        var activeClass = this.epubController.packageDocument.get("metadata").active_class;
        return activeClass == "" ? false : true;
    }
});
(function(window){

window.Acc = {
detailed: [],
title: '',
page: '',
RadioGroup: function(radioGroupObjId, defaultRadioValSelector, callback) {
var rgo = $('#' + radioGroupObjId).get(0),
track = {}, that = this,
select = function(index, force) {
$('#' + rgo.id + ' > *').attr( {
tabindex : '-1',
'aria-selected' : 'false',
'aria-checked' : 'false'
});
$(that.childNodes[index]).attr( {
tabindex : '0',
'aria-selected' : 'true',
'aria-checked' : 'true'
});
if (force) $(that.childNodes[index]).focus();
that.selected = that.childNodes[index];
that.index = index;
if (callback && typeof callback === 'function') callback(that.childNodes[index], that.childNodes);
};
that.childNodes = $('#' + rgo.id + ' > *').each(function(i, o) {
track[o.id] = i;
track.max = i + 1;
$(o).attr( {
tabindex : '-1',
'aria-selected' : 'false',
'aria-checked' : 'false',
'aria-posinset' : track.max
});
}).get();
$('#' + rgo.id + ' > *').attr('aria-setsize', track.max)
.bind( {
click: function(ev) {
if (this != that.selected) select(track[this.id]);
},
keydown : function(ev) {
var k = ev.which || ev.keyCode;
if (k == 37 || k == 38) {
if (that.index > 0)
select(that.index - 1, true);
else
select(track.max - 1, true);
}
else if (k == 39 || k == 40) {
if (that.index < (track.max - 1))
select(that.index + 1, true);
else
select(0, true);
ev.stopPropagation();
}
}
});
that.set = function(id) {
select(track[id]);
};
select(track[$('#' + radioGroupObjId + defaultRadioValSelector).get(0).id]);
}
};

})(window);
/*
 * Readium i18n functions
 *
 */

var elems = document.getElementsByTagName("span");
for (var i = 0; i<elems.length; i++) {
        if (elems[i].id == null) {
                continue;
        }
        if (elems[i].id.indexOf("i18n_html_", 0) == 0) {
                var msg = chrome.i18n.getMessage(elems[i].id);
                if (msg != "") {
                        elems[i].innerHTML = msg;
                }
        } else if (elems[i].id.indexOf("i18n_", 0) == 0) {
                var msg = chrome.i18n.getMessage(elems[i].id);
                if (msg != "") {
                        elems[i].innerText = msg;
                }
        }
}

var titles = document.getElementsByTagName("title");
for (var i = 0; i<titles.length; i++) {
        if (titles[i].id == null) {
                continue;
        }
        if (titles[i].id.indexOf("i18n_html_", 0) == 0) {
                var msg = chrome.i18n.getMessage(titles[i].id);
                if (msg != "") {
                        titles[i].innerHTML = msg;
                }
        } else if (titles[i].id.indexOf("i18n_", 0) == 0) {
                var msg = chrome.i18n.getMessage(titles[i].id);
                if (msg != "") {
                        titles[i].innerText = msg;
                }
        }
}
(function(global) {
    
    var EPUBcfi = {};

    EPUBcfi.Parser = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "fragment": parse_fragment,
        "path": parse_path,
        "local_path": parse_local_path,
        "indexStep": parse_indexStep,
        "indirectionStep": parse_indirectionStep,
        "terminus": parse_terminus,
        "idAssertion": parse_idAssertion,
        "textLocationAssertion": parse_textLocationAssertion,
        "parameter": parse_parameter,
        "csv": parse_csv,
        "valueNoSpace": parse_valueNoSpace,
        "value": parse_value,
        "escapedSpecialChars": parse_escapedSpecialChars,
        "number": parse_number,
        "integer": parse_integer,
        "space": parse_space,
        "circumflex": parse_circumflex,
        "doubleQuote": parse_doubleQuote,
        "squareBracket": parse_squareBracket,
        "parentheses": parse_parentheses,
        "comma": parse_comma,
        "semicolon": parse_semicolon,
        "equal": parse_equal,
        "character": parse_character
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "fragment";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_fragment() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 8) === "epubcfi(") {
          result0 = "epubcfi(";
          pos += 8;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"epubcfi(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_path();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 41) {
              result2 = ")";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\")\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, pathVal) { 
                
                return { type:"CFIAST", cfiString:pathVal }; 
            })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_path() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_indexStep();
        if (result0 !== null) {
          result1 = parse_local_path();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepVal, localPathVal) { 
        
                return { type:"cfiString", path:stepVal, localPath:localPathVal }; 
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_local_path() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result1 = parse_indexStep();
        if (result1 === null) {
          result1 = parse_indirectionStep();
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_indexStep();
            if (result1 === null) {
              result1 = parse_indirectionStep();
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse_terminus();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, localPathStepVal, termStepVal) { 
        
                return { steps:localPathStepVal, termStep:termStepVal }; 
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_indexStep() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 47) {
          result0 = "/";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"/\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 91) {
              result2 = "[";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"[\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_idAssertion();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepLengthVal, assertVal) { 
        
                return { type:"indexStep", stepLength:stepLengthVal, idAssertion:assertVal[1] };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_indirectionStep() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "!/") {
          result0 = "!/";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"!/\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 91) {
              result2 = "[";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"[\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_idAssertion();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stepLengthVal, assertVal) { 
        
                return { type:"indirectionStep", stepLength:stepLengthVal, idAssertion:assertVal[1] };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_terminus() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_integer();
          if (result1 !== null) {
            pos2 = pos;
            if (input.charCodeAt(pos) === 91) {
              result2 = "[";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"[\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_textLocationAssertion();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 93) {
                  result4 = "]";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"]\"");
                  }
                }
                if (result4 !== null) {
                  result2 = [result2, result3, result4];
                } else {
                  result2 = null;
                  pos = pos2;
                }
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, textOffsetValue, textLocAssertVal) { 
        
                return { type:"textTerminus", offsetValue:textOffsetValue, textAssertion:textLocAssertVal[1] };
            })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_idAssertion() {
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_value();
        if (result0 !== null) {
          result0 = (function(offset, idVal) { 
        
                return idVal; 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_textLocationAssertion() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_csv();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          result1 = parse_parameter();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, csvVal, paramVal) { 
        
                return { type:"textLocationAssertion", csv:csvVal, parameter:paramVal }; 
            })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_parameter() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 59) {
          result0 = ";";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_valueNoSpace();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 61) {
              result2 = "=";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"=\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_valueNoSpace();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, paramLHSVal, paramRHSVal) { 
        
                return { type:"parameter", LHSValue:paramLHSVal, RHSValue:paramRHSVal }; 
            })(pos0, result0[1], result0[3]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_csv() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_value();
        result0 = result0 !== null ? result0 : "";
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 44) {
            result1 = ",";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\",\"");
            }
          }
          if (result1 !== null) {
            result2 = parse_value();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, preAssertionVal, postAssertionVal) { 
        
                return { type:"csv", preAssertion:preAssertionVal, postAssertion:postAssertionVal }; 
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_valueNoSpace() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_escapedSpecialChars();
        if (result1 === null) {
          result1 = parse_character();
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_escapedSpecialChars();
            if (result1 === null) {
              result1 = parse_character();
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, stringVal) { 
        
                return stringVal.join(''); 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_value() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result1 = parse_escapedSpecialChars();
        if (result1 === null) {
          result1 = parse_character();
          if (result1 === null) {
            result1 = parse_space();
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            result1 = parse_escapedSpecialChars();
            if (result1 === null) {
              result1 = parse_character();
              if (result1 === null) {
                result1 = parse_space();
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result0 = (function(offset, stringVal) { 
        
                return stringVal.join(''); 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_escapedSpecialChars() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_circumflex();
        if (result0 !== null) {
          result1 = parse_circumflex();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 === null) {
          pos1 = pos;
          result0 = parse_circumflex();
          if (result0 !== null) {
            result1 = parse_squareBracket();
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 === null) {
            pos1 = pos;
            result0 = parse_circumflex();
            if (result0 !== null) {
              result1 = parse_parentheses();
              if (result1 !== null) {
                result0 = [result0, result1];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 === null) {
              pos1 = pos;
              result0 = parse_circumflex();
              if (result0 !== null) {
                result1 = parse_comma();
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 === null) {
                pos1 = pos;
                result0 = parse_circumflex();
                if (result0 !== null) {
                  result1 = parse_semicolon();
                  if (result1 !== null) {
                    result0 = [result0, result1];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
                if (result0 === null) {
                  pos1 = pos;
                  result0 = parse_circumflex();
                  if (result0 !== null) {
                    result1 = parse_equal();
                    if (result1 !== null) {
                      result0 = [result0, result1];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, escSpecCharVal) { 
                
                return escSpecCharVal[1]; 
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_number() {
        var result0, result1, result2, result3;
        var pos0, pos1, pos2;
        
        pos0 = pos;
        pos1 = pos;
        pos2 = pos;
        if (/^[1-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[1-9]");
          }
        }
        if (result0 !== null) {
          if (/^[0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos2;
          }
        } else {
          result0 = null;
          pos = pos2;
        }
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 46) {
            result1 = ".";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\".\"");
            }
          }
          if (result1 !== null) {
            pos2 = pos;
            result2 = [];
            if (/^[0-9]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            while (result3 !== null) {
              result2.push(result3);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
            if (result2 !== null) {
              if (/^[1-9]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[1-9]");
                }
              }
              if (result3 !== null) {
                result2 = [result2, result3];
              } else {
                result2 = null;
                pos = pos2;
              }
            } else {
              result2 = null;
              pos = pos2;
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, intPartVal, fracPartVal) { 
        
                return intPartVal.join('') + "." + fracPartVal.join(''); 
            })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_integer() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 48) {
          result0 = "0";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"0\"");
          }
        }
        if (result0 === null) {
          pos1 = pos;
          if (/^[1-9]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[1-9]");
            }
          }
          if (result0 !== null) {
            result1 = [];
            if (/^[0-9]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            while (result2 !== null) {
              result1.push(result2);
              if (/^[0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[0-9]");
                }
              }
            }
            if (result1 !== null) {
              result0 = [result0, result1];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, integerVal) { 
        
                if (integerVal === "0") { 
                  return "0";
                } 
                else { 
                  return integerVal[0].concat(integerVal[1].join(''));
                }
            })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_space() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 32) {
          result0 = " ";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return " "; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_circumflex() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 94) {
          result0 = "^";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"^\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "^"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_doubleQuote() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 34) {
          result0 = "\"";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"\\\"\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return '"'; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_squareBracket() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 91) {
          result0 = "[";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"[\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 93) {
            result0 = "]";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"]\"");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, bracketVal) { return bracketVal; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_parentheses() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 41) {
            result0 = ")";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\")\"");
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, paraVal) { return paraVal; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comma() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 44) {
          result0 = ",";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\",\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ","; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_semicolon() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 59) {
          result0 = ";";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\";\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return ";"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_equal() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (input.charCodeAt(pos) === 61) {
          result0 = "=";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"=\"");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "="; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_character() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (/^[a-z]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-z]");
          }
        }
        if (result0 === null) {
          if (/^[A-Z]/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[A-Z]");
            }
          }
          if (result0 === null) {
            if (/^[0-9]/.test(input.charAt(pos))) {
              result0 = input.charAt(pos);
              pos++;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
            if (result0 === null) {
              if (input.charCodeAt(pos) === 45) {
                result0 = "-";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"-\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 95) {
                  result0 = "_";
                  pos++;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"_\"");
                  }
                }
              }
            }
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, charVal) { return charVal; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
 

    // Description: This model contains the implementation for "instructions" included in the EPUB CFI domain specific language (DSL). 
//   Lexing and parsing a CFI produces a set of executable instructions for processing a CFI (represented in the AST). 
//   This object contains a set of functions that implement each of the executable instructions in the AST. 

EPUBcfi.CFIInstructions = {

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	// Description: Follows a step
	// Rationale: The use of children() is important here, as this jQuery method returns a tree of xml nodes, EXCLUDING
	//   CDATA and text nodes. When we index into the set of child elements, we are assuming that text nodes have been 
	//   excluded.
	// REFACTORING CANDIDATE: This should be called "followIndexStep"
	getNextNode : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {

		// Find the jquery index for the current node
		var $targetNode;
		if (CFIStepValue % 2 == 0) {

			$targetNode = this.elementNodeStep(CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist);
		}
		else {

			$targetNode = this.inferTargetTextNode(CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist);
		}

		return $targetNode;
	},

	// Description: This instruction executes an indirection step, where a resource is retrieved using a 
	//   link contained on a attribute of the target element. The attribute that contains the link differs
	//   depending on the target. 
	// Note: Iframe indirection will (should) fail if the iframe is not from the same domain as its containing script due to 
	//   the cross origin security policy
	followIndirectionStep : function (CFIStepValue, $currNode, $packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

		var that = this;
		var $contentDocument; 
		var $blacklistExcluded;
		var $startElement;
		var $targetNode;

		// TODO: This check must be expanded to all the different types of indirection step
		// Only expects iframes, at the moment
		if ($currNode === undefined || !$currNode.is("iframe")) {

			throw EPUBcfi.NodeTypeError($currNode, "expected an iframe element");
		}

		// Check node type; only iframe indirection is handled, at the moment
		if ($currNode.is("iframe")) {

			// Get content
			$contentDocument = $currNode.contents();

			// Go to the first XHTML element, which will be the first child of the top-level document object
			$blacklistExcluded = this.applyBlacklist($contentDocument.children(), classBlacklist, elementBlacklist, idBlacklist);
			$startElement = $($blacklistExcluded[0]);

			// Follow an index step
			$targetNode = this.getNextNode(CFIStepValue, $startElement, classBlacklist, elementBlacklist, idBlacklist);

			// Return that shit!
			return $targetNode; 
		}

		// TODO: Other types of indirection
		// TODO: $targetNode.is("embed")) : src
		// TODO: ($targetNode.is("object")) : data
		// TODO: ($targetNode.is("image") || $targetNode.is("xlink:href")) : xlink:href
	},

	// Description: Injects an element at the specified text node
	// Arguments: a cfi text termination string, a jquery object to the current node
	textTermination : function ($currNode, textOffset, elementToInject) {

		// Get the first node, this should be a text node
		if ($currNode === undefined) {

			throw EPUBcfi.NodeTypeError($currNode, "expected a terminating node, or node list");
		} 
		else if ($currNode.length === 0) {

			throw EPUBcfi.TerminusError("Text", "Text offset:" + textOffset, "no nodes found for termination condition");
		}

		$currNode = this.injectCFIMarkerIntoText($currNode, textOffset, elementToInject);
		return $currNode;
	},

	// Description: Checks that the id assertion for the node target matches that on 
	//   the found node. 
	targetIdMatchesIdAssertion : function ($foundNode, idAssertion) {

		if ($foundNode.attr("id") === idAssertion) {

			return true;
		}
		else {

			return false;
		}
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: Step reference for xml element node. Expected that CFIStepValue is an even integer
	elementNodeStep : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {

		var $targetNode;
		var $blacklistExcluded;
		var numElements;
		var jqueryTargetNodeIndex = (CFIStepValue / 2) - 1;

		$blacklistExcluded = this.applyBlacklist($currNode.children(), classBlacklist, elementBlacklist, idBlacklist);
		numElements = $blacklistExcluded.length;

		if (this.indexOutOfRange(jqueryTargetNodeIndex, numElements)) {

			throw EPUBcfi.OutOfRangeError(jqueryTargetNodeIndex, numElements - 1, "");
		}

	    $targetNode = $($blacklistExcluded[jqueryTargetNodeIndex]);
		return $targetNode;
	},

	retrieveItemRefHref : function ($itemRefElement, $packageDocument) {

		return $("#" + $itemRefElement.attr("idref"), $packageDocument).attr("href");
	},

	indexOutOfRange : function (targetIndex, numChildElements) {

		return (targetIndex > numChildElements - 1) ? true : false;
	},

	// Rationale: In order to inject an element into a specific position, access to the parent object 
	//   is required. This is obtained with the jquery parent() method. An alternative would be to 
	//   pass in the parent with a filtered list containing only children that are part of the target text node.
	injectCFIMarkerIntoText : function ($textNodeList, textOffset, elementToInject) {

		var nodeNum;
		var currNodeLength;
		var currTextPosition = 0;
		var nodeOffset;
		var originalText;
		var $injectedNode;
		var $newTextNode;
		// The iteration counter may be incorrect here (should be $textNodeList.length - 1 ??)
		for (nodeNum = 0; nodeNum <= $textNodeList.length; nodeNum++) {

			if ($textNodeList[nodeNum].nodeType === 3) {

				currNodeMaxIndex = ($textNodeList[nodeNum].nodeValue.length - 1) + currTextPosition;
				nodeOffset = textOffset - currTextPosition;

				if (currNodeMaxIndex >= textOffset) {

					// This node is going to be split and the components re-inserted
					originalText = $textNodeList[nodeNum].nodeValue;	

					// Before part
				 	$textNodeList[nodeNum].nodeValue = originalText.slice(0, nodeOffset);

					// Injected element
					$injectedNode = $(elementToInject).insertAfter($textNodeList.eq(nodeNum));

					// After part
					$newTextNode = $(document.createTextNode(originalText.slice(nodeOffset, originalText.length)));
					$($newTextNode).insertAfter($injectedNode);

					return $textNodeList.parent();
				}
				else {

					currTextPosition = currTextPosition + currNodeMaxIndex;
				}
			}
		}

		throw EPUBcfi.TerminusError("Text", "Text offset:" + textOffset, "The offset exceeded the length of the text");
	},

	// Description: This method finds a target text node and then injects an element into the appropriate node
	// Arguments: A step value that is an odd integer. A current node with a set of child elements.
	// Rationale: The possibility that cfi marker elements have been injected into a text node at some point previous to 
	//   this method being called (and thus splitting the original text node into two separate text nodes) necessitates that
	//   the set of nodes that compromised the original target text node are inferred and returned.
	// Notes: Passed a current node. This node should have a set of elements under it. This will include at least one text node, 
	//   element nodes (maybe), or possibly a mix. 
	// REFACTORING CANDIDATE: This method is pretty long. Worth investigating to see if it can be refactored into something clearer.
	inferTargetTextNode : function (CFIStepValue, $currNode, classBlacklist, elementBlacklist, idBlacklist) {
		
		var $elementsWithoutMarkers;
		var currTextNodePosition;
		var logicalTargetPosition;
		var nodeNum;
		var $targetTextNodeList;

		// Remove any cfi marker elements from the set of elements. 
		// Rationale: A filtering function is used, as simply using a class selector with jquery appears to 
		//   result in behaviour where text nodes are also filtered out, along with the class element being filtered.
		$elementsWithoutMarkers = this.applyBlacklist($currNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

		// Convert CFIStepValue to logical index; assumes odd integer for the step value
		logicalTargetPosition = (parseInt(CFIStepValue) + 1) / 2;

		// Set text node position counter
		currTextNodePosition = 1;
		$targetTextNodeList = $elementsWithoutMarkers.filter(
			function () {

				if (currTextNodePosition === logicalTargetPosition) {

					// If it's a text node
					if (this.nodeType === 3) {
						return true; 
					}
					// Any other type of node, move onto the next text node
					else {
						currTextNodePosition++; 
						return false;
					}
				}
				// In this case, don't return any elements
				else {

					// If its the last child and it's not a text node, there are no text nodes after it
					// and the currTextNodePosition shouldn't be incremented
					if (this.nodeType !== 3 && this !== $elementsWithoutMarkers.lastChild) {
						currTextNodePosition++;
					}

					return false;
				}
			}
		);

		// The filtering above should have counted the number of "logical" text nodes; this can be used to 
		// detect out of range errors
		if ($targetTextNodeList.length === 0) {

			throw EPUBcfi.OutOfRangeError(logicalTargetPosition, currTextNodePosition - 1, "Index out of range");
		}

		// return the text node list
		return $targetTextNodeList;
	},

	applyBlacklist : function ($elements, classBlacklist, elementBlacklist, idBlacklist) {

        var $filteredElements;

        $filteredElements = $elements.filter(
            function () {

                var $currElement = $(this);
                var includeInList = true;

                if (classBlacklist) {

                	// Filter each element with the class type
                	$.each(classBlacklist, function (index, value) {

	                    if ($currElement.hasClass(value)) {
	                    	includeInList = false;

	                    	// Break this loop
	                        return false;
	                    }
                	});
                }

                if (elementBlacklist) {
                	
	                // For each type of element
	                $.each(elementBlacklist, function (index, value) {

	                    if ($currElement.is(value)) {
	                    	includeInList = false;

	                    	// Break this loop
	                        return false;
	                    }
	                });
				}

				if (idBlacklist) {
                	
	                // For each type of element
	                $.each(idBlacklist, function (index, value) {

	                    if ($currElement.attr("id") === value) {
	                    	includeInList = false;

	                    	// Break this loop
	                        return false;
	                    }
	                });
				}

                return includeInList;
            }
        );

        return $filteredElements;
    }
};




    // Description: This is an interpreter that inteprets an Abstract Syntax Tree (AST) for a CFI. The result of executing the interpreter
//   is to inject an element, or set of elements, into an EPUB content document (which is just an XHTML document). These element(s) will
//   represent the position or area in the EPUB referenced by a CFI.
// Rationale: The AST is a clean and readable expression of the step-terminus structure of a CFI. Although building an interpreter adds to the
//   CFI infrastructure, it provides a number of benefits. First, it emphasizes a clear separation of concerns between lexing/parsing a
//   CFI, which involves some complexity related to escaped and special characters, and the execution of the underlying set of steps 
//   represented by the CFI. Second, it will be easier to extend the interpreter to account for new/altered CFI steps (say for references
//   to vector objects or multiple CFIs) than if lexing, parsing and interpretation were all handled in a single step. Finally, Readium's objective is 
//   to demonstrate implementation of the EPUB 3.0 spec. An implementation with a strong separation of concerns that conforms to 
//   well-understood patterns for DSL processing should be easier to communicate, analyze and understand. 
// REFACTORING CANDIDATE: node type errors shouldn't really be possible if the CFI syntax is correct and the parser is error free. 
//   Might want to make the script die in those instances, once the grammar and interpreter are more stable. 
// REFACTORING CANDIDATE: The use of the 'nodeType' property is confusing as this is a DOM node property and the two are unrelated. 
//   Whoops. There shouldn't be any interference, however, I think this should be changed. 

EPUBcfi.Interpreter = {

    // ------------------------------------------------------------------------------------ //
    //  "PUBLIC" METHODS (THE API)                                                          //
    // ------------------------------------------------------------------------------------ //

    // Description: Find the content document referenced by the spine item. This should be the spine item 
    //   referenced by the first indirection step in the CFI.
    // Rationale: This method is a part of the API so that the reading system can "interact" the content document 
    //   pointed to by a CFI. If this is not a separate step, the processing of the CFI must be tightly coupled with 
    //   the reading system, as it stands now. 
    getContentDocHref : function (CFI, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        // Decode for URI/IRI escape characters
        var $packageDocument = $(packageDocument);
        var decodedCFI = decodeURI(CFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);

        // Check node type; throw error if wrong type
        if (CFIAST === undefined || CFIAST.type !== "CFIAST") { 

            throw EPUBcfi.NodeTypeError(CFIAST, "expected CFI AST root node");
        }

        var $packageElement = $($("package", $packageDocument)[0]);

        // Interpet the path node (the package document step)
        var $currElement = this.interpretIndexStepNode(CFIAST.cfiString.path, $packageElement, classBlacklist, elementBlacklist, idBlacklist);

        // Interpret the local_path node, which is a set of steps and and a terminus condition
        var stepNum = 0;
        var nextStepNode;
        for (stepNum = 0 ; stepNum <= CFIAST.cfiString.localPath.steps.length - 1 ; stepNum++) {
        
            nextStepNode = CFIAST.cfiString.localPath.steps[stepNum];
            if (nextStepNode.type === "indexStep") {

                $currElement = this.interpretIndexStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }
            else if (nextStepNode.type === "indirectionStep") {

                $currElement = this.interpretIndirectionStepNode(nextStepNode, $currElement, $packageDocument, classBlacklist, elementBlacklist, idBlacklist);
            }

            // Found the content document href referenced by the spine item 
            if ($currElement.is("itemref")) {

                return EPUBcfi.CFIInstructions.retrieveItemRefHref($currElement, $packageDocument);
            }
        }

        // TODO: If you get to here, an itemref element was never found - a runtime error. The cfi is misspecified or 
        //   the package document is messed up.
    },

    // Description: Inject an arbirtary html element into a position in a content document referenced by a CFI
    injectElement : function (CFI, contentDocument, elementToInject, classBlacklist, elementBlacklist, idBlacklist) {

        var decodedCFI = decodeURI(CFI);
        var CFIAST = EPUBcfi.Parser.parse(decodedCFI);

        // Find the first indirection step in the local path; follow it like a regular step, as the content document it 
        //   references is already loaded and has been passed to this method
        var stepNum = 0;
        var nextStepNode;
        for (stepNum; stepNum <= CFIAST.cfiString.localPath.steps.length - 1 ; stepNum++) {
        
            nextStepNode = CFIAST.cfiString.localPath.steps[stepNum];
            if (nextStepNode.type === "indirectionStep") {

                // This is now assuming that indirection steps and index steps conform to an interface: an object with stepLength, idAssertion
                nextStepNode.type = "indexStep";
                // Getting the html element and creating a jquery object for it; excluding cfiMarkers
                $currElement = this.interpretIndexStepNode(nextStepNode, $("html", contentDocument), classBlacklist, elementBlacklist, idBlacklist);
                stepNum++ // Increment the step num as this will be passed as the starting point for continuing interpretation
                break;
            }
        }

        // Interpret the rest of the steps
        $currElement = this.interpretLocalPath(CFIAST.cfiString, stepNum, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // TODO: detect what kind of terminus; for now, text node termini are the only kind implemented
        $currElement = this.interpretTextTerminusNode(CFIAST.cfiString.localPath.termStep, $currElement, elementToInject);

        // Return the element that was injected into
        return $currElement;
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    interpretLocalPath : function (cfiStringNode, startStepNum, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        var stepNum = startStepNum;
        var nextStepNode;
        for (stepNum; stepNum <= cfiStringNode.localPath.steps.length - 1 ; stepNum++) {
        
            nextStepNode = cfiStringNode.localPath.steps[stepNum];
            if (nextStepNode.type === "indexStep") {

                $currElement = this.interpretIndexStepNode(nextStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist);
            }
            else if (nextStepNode.type === "indirectionStep") {

                $currElement = this.interpretIndirectionStepNode(nextStepNode, $currElement, $packageDocument, classBlacklist, elementBlacklist, idBlacklist);
            }
        }

        return $currElement;
    },

    interpretIndexStepNode : function (indexStepNode, $currElement, classBlacklist, elementBlacklist, idBlacklist) {

        // Check node type; throw error if wrong type
        if (indexStepNode === undefined || indexStepNode.type !== "indexStep") {

            throw EPUBcfi.NodeTypeError(indexStepNode, "expected index step node");
        }

        // Index step
        var $stepTarget = EPUBcfi.CFIInstructions.getNextNode(indexStepNode.stepLength, $currElement, classBlacklist, elementBlacklist, idBlacklist);

        // Check the id assertion, if it exists
        if (indexStepNode.idAssertion) {

            if (!EPUBcfi.CFIInstructions.targetIdMatchesIdAssertion($stepTarget, indexStepNode.idAssertion)) {

                throw EPUBcfi.CFIAssertionError(indexStepNode.idAssertion, $stepTarget.attr('id'), "Id assertion failed");
            }
        }

        return $stepTarget;
    },

    interpretIndirectionStepNode : function (indirectionStepNode, $currElement, $packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        // Check node type; throw error if wrong type
        if (indirectionStepNode === undefined || indirectionStepNode.type !== "indirectionStep") {

            throw EPUBcfi.NodeTypeError(indirectionStepNode, "expected indirection step node");
        }

        // Indirection step
        var $stepTarget = EPUBcfi.CFIInstructions.followIndirectionStep(
            indirectionStepNode.stepLength, 
            $currElement,
            $packageDocument, 
            classBlacklist, 
            elementBlacklist);

        // Check the id assertion, if it exists
        if (indirectionStepNode.idAssertion) {

            if (!EPUBcfi.CFIInstructions.targetIdMatchesIdAssertion($stepTarget, indirectionStepNode.idAssertion)) {

                throw EPUBcfi.CFIAssertionError(indirectionStepNode.idAssertion, $stepTarget.attr('id'), "Id assertion failed");
            }
        }

        return $stepTarget;
    },

    interpretTextTerminusNode : function (terminusNode, $currElement, elementToInject) {

        if (terminusNode === undefined || terminusNode.type !== "textTerminus") {

            throw EPUBcfi.NodeTypeError(terminusNode, "expected text terminus node");
        }

        var $elementInjectedInto = EPUBcfi.CFIInstructions.textTermination(
            $currElement, 
            terminusNode.offsetValue, 
            elementToInject);

        return $elementInjectedInto;
    }
};

    // Description: This is a set of runtime errors that the CFI interpreter can throw. 
// Rationale: These error types extend the basic javascript error object so error things like the stack trace are 
//   included with the runtime errors. 

// REFACTORING CANDIDATE: This type of error may not be required in the long run. The parser should catch any syntax errors, 
//   provided it is error-free, and as such, the AST should never really have any node type errors, which are essentially errors
//   in the structure of the AST. This error should probably be refactored out when the grammar and interpreter are more stable.
EPUBcfi.NodeTypeError = function (node, message) {

    function NodeTypeError () {

        this.node = node;
    }

    NodeTypeError.prototype = new Error(message);
    NodeTypeError.constructor = NodeTypeError;

    return new NodeTypeError();
};

// REFACTORING CANDIDATE: Might make sense to include some more specifics about the out-of-rangeyness.
EPUBcfi.OutOfRangeError = function (targetIndex, maxIndex, message) {

    function OutOfRangeError () {

        this.targetIndex = targetIndex;
        this.maxIndex = maxIndex;
    }

    OutOfRangeError.prototype = new Error(message);
    OutOfRangeError.constructor = OutOfRangeError()

    return new OutOfRangeError();
};

// REFACTORING CANDIDATE: This is a bit too general to be useful. When I have a better understanding of the type of errors
//   that can occur with the various terminus conditions, it'll make more sense to revisit this. 
EPUBcfi.TerminusError = function (terminusType, terminusCondition, message) {

    function TerminusError () {

        this.terminusType = terminusType;
        this.terminusCondition = terminusCondition;
    }

    TerminusError.prototype = new Error(message);
    TerminusError.constructor = TerminusError();

    return new TerminusError();
};

EPUBcfi.CFIAssertionError = function (expectedAssertion, targetElementAssertion, message) {

    function CFIAssertionError () {

        this.expectedAssertion = expectedAssertion;
        this.targetElementAssertion = targetElementAssertion;
    }

    CFIAssertionError.prototype = new Error(message);
    CFIAssertionError.constructor = CFIAssertionError();

    return new CFIAssertionError();
};


    EPUBcfi.Generator = {

    // Description: Generates a character offset CFI 
    // Arguments: The text node that contains the offset referenced by the cfi, the offset value, the name of the 
    //   content document that contains the text node, the package document for this EPUB.
    generateCharacterOffsetCFI : function (startTextNode, characterOffset, contentDocumentName, packageDocument, classBlacklist, elementBlacklist, idBlacklist) {

        // ------------------------------------------------------------------------------------ //
        //  "PUBLIC" METHODS (THE API)                                                          //
        // ------------------------------------------------------------------------------------ //

        var contentDocCFI;
        var $itemRefStartNode;
        var packageDocCFI;

        // Check that the text node to start from IS a text node
        if (!startTextNode) {
            throw new EPUBcfi.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        } else if (startTextNode.nodeType != 3) {
            throw new EPUBcfi.NodeTypeError(startTextNode, "Cannot generate a character offset from a starting point that is not a text node");
        }

        // Check that the character offset is within a valid range for the text node supplied
        if (characterOffset < 0) {
            throw new EPUBcfi.OutOfRangeError(characterOffset, 0, "Character offset cannot be less than 0");
        }
        else if (characterOffset > startTextNode.nodeValue.length) {
            throw new EPUBcfi.OutOfRangeError(characterOffset, startTextNode.nodeValue.length - 1, "character offset cannot be greater than the length of the text node");
        }

        // Check that the idref for the content document has been provided
        if (!contentDocumentName) {
            throw new Error("The idref for the content document, as found in the spine, must be supplied");
        }

        // Check that the package document is non-empty and contains an itemref element for the supplied idref
        if (!packageDocument) {
            throw new Error("A package document must be supplied to generate a CFI");
        }
        else if ($($("itemref[idref='" + contentDocumentName + "']", packageDocument)[0]).length === 0) {
            throw new Error("The idref of the content document could not be found in the spine");
        }

        // Call the recursive method to create all the steps up to the head element of the content document (the "html" element)
        contentDocCFI = this.createCFIElementSteps($(startTextNode), characterOffset, "html", classBlacklist, elementBlacklist, idBlacklist);

        // Get the start node (itemref element) that references the content document
        $itemRefStartNode = $("itemref[idref='" + contentDocumentName + "']", $(packageDocument));

        // Create the steps up to the top element of the package document (the "package" element)
        packageDocCFI = this.createCFIElementSteps($itemRefStartNode, characterOffset, "package", classBlacklist, elementBlacklist, idBlacklist);

        // Return the CFI wrapped with "epubcfi()"
        return "epubcfi(" + packageDocCFI + contentDocCFI + ")";
    },

    // ------------------------------------------------------------------------------------ //
    //  "PRIVATE" HELPERS                                                                   //
    // ------------------------------------------------------------------------------------ //

    // Description: Creates a CFI terminating step, to a text node, with a character offset
    // Arguments:
    // Rationale:
    // Notes:
    // REFACTORING CANDIDATE: Some of the parts of this method could be refactored into their own methods
    createCFITextNodeStep : function ($startTextNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var $parentNode;
        var $contentsExcludingMarkers;
        var CFIIndex;
        var indexOfTextNode;
        var preAssertion;
        var preAssertionStartIndex;
        var textLength;
        var postAssertion;
        var postAssertionEndIndex;

        // Find text node position in the set of child elements, ignoring any blacklisted elements 
        $parentNode = $startTextNode.parent();
        $contentsExcludingMarkers = EPUBcfi.CFIInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node index in the parent list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var indexOfFirstInSequence;
        $.each($contentsExcludingMarkers, 
            function (index) {

                // If this is a text node, check if it matches and return the current index
                if (this.nodeType === 3) {

                    if (this === $startTextNode[0]) {

                        // Set index as the first in the adjacent sequence of text nodes, or as the index of the current node if this 
                        //   node is a standard one sandwiched between two element nodes. 
                        if (prevNodeWasTextNode) {
                            indexOfTextNode = indexOfFirstInSequence;
                        }
                        else {
                            indexOfTextNode = index;
                        }
                        
                        // Break out of .each loop
                        return false; 
                    }

                    // Save this index as the first in sequence of adjacent text nodes, if it is not already set by this point
                    prevNodeWasTextNode = true;
                    if (!indexOfFirstInSequence) {
                        indexOfFirstInSequence = index;
                    }
                }
                // This node is not a text node
                else {
                    prevNodeWasTextNode = false;
                    indexOfFirstInSequence = undefined;
                }
            }
        );

        // Convert the text node index to a CFI odd-integer representation
        CFIIndex = (indexOfTextNode * 2) + 1;

        // TODO: text assertions are not in the grammar yet, I think, or they're just causing problems. This has
        //   been temporarily removed. 

        // Add pre- and post- text assertions
        // preAssertionStartIndex = (characterOffset - 3 >= 0) ? characterOffset - 3 : 0;
        // preAssertion = $startTextNode[0].nodeValue.substring(preAssertionStartIndex, characterOffset);

        // textLength = $startTextNode[0].nodeValue.length;
        // postAssertionEndIndex = (characterOffset + 3 <= textLength) ? characterOffset + 3 : textLength;
        // postAssertion = $startTextNode[0].nodeValue.substring(characterOffset, postAssertionEndIndex);

        // Gotta infer the correct character offset, as well

        // Return the constructed CFI text node step
        return "/" + CFIIndex + ":" + characterOffset;
         // + "[" + preAssertion + "," + postAssertion + "]";
    },

    // Description: A set of adjacent text nodes can be inferred to have been a single text node in the original document. As such, 
    //   if the character offset is specified for one of the adjacent text nodes, the true offset for the original node must be
    //   inferred.
    findOriginalTextNodeCharOffset : function ($startTextNode, specifiedCharacterOffset, classBlacklist, elementBlacklist, idBlacklist) {

        var $parentNode;
        var $contentsExcludingMarkers;
        var textLength;
        
        // Find text node position in the set of child elements, ignoring any cfi markers 
        $parentNode = $startTextNode.parent();
        $contentsExcludingMarkers = EPUBcfi.CFIInstructions.applyBlacklist($parentNode.contents(), classBlacklist, elementBlacklist, idBlacklist);

        // Find the text node number in the list, inferring nodes that were originally a single text node
        var prevNodeWasTextNode;
        var originalCharOffset = -1; // So the character offset is a 0-based index; we'll be adding lengths of text nodes to this number
        $.each($contentsExcludingMarkers, 
            function (index) {

                // If this is a text node, check if it matches and return the current index
                if (this.nodeType === 3) {

                    if (this === $startTextNode[0]) {

                        if (prevNodeWasTextNode) {
                            originalCharOffset = originalCharOffset + specifiedCharacterOffset;
                        }
                        else {
                            originalCharOffset = specifiedCharacterOffset;
                        }

                        return false; // Break out of .each loop
                    }
                    else {

                        originalCharOffset = originalCharOffset + this.length;
                    }

                    // save this index as the first in sequence of adjacent text nodes, if not set
                    prevNodeWasTextNode = true;
                }
                // This node is not a text node
                else {
                    prevNodeWasTextNode = false;
                }
            }
        );

        return originalCharOffset;
    },

    // REFACTORING CANDIDATE: Consider putting the handling of the starting text node into the body of the 
    //   generateCharacterOffsetCfi() method; this way the characterOffset argument could be removed, which 
    //   would clarify the abstraction
    createCFIElementSteps : function ($currNode, characterOffset, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) {

        var textNodeStep;
        var $blacklistExcluded;
        var $parentNode;
        var currNodePosition;
        var CFIPosition;
        var idAssertion;
        var elementStep; 

        if ($currNode[0].nodeType === 3) {

            textNodeStep = this.createCFITextNodeStep($currNode, characterOffset, classBlacklist, elementBlacklist, idBlacklist);
            return this.createCFIElementSteps($currNode.parent(), characterOffset, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) + textNodeStep; 
        }

        // Find position of current node in parent list
        $blacklistExcluded = EPUBcfi.CFIInstructions.applyBlacklist($currNode.parent().children(), classBlacklist, elementBlacklist, idBlacklist);
        $.each($blacklistExcluded, 
            function (index, value) {

                if (this === $currNode[0]) {

                    currNodePosition = index;

                    // Break loop
                    return false;
                }
        });

        // Convert position to the CFI even-integer representation
        CFIPosition = (currNodePosition + 1) * 2;

        // Create CFI step with id assertion, if the element has an id
        if ($currNode.attr("id")) {
            elementStep = "/" + CFIPosition + "[" + $currNode.attr("id") + "]";
        }
        else {
            elementStep = "/" + CFIPosition;
        }

        // If a parent is an html element return the (last) step for this content document, otherwise, continue
        $parentNode = $currNode.parent();
        if ($parentNode.is(topLevelElement)) {
            
            // If the top level node is a type from which an indirection step, add an indirection step character (!)
            // REFACTORING CANDIDATE: It is possible that this should be changed to if (topLevelElement = 'package') do
            //   not return an indirection character. Every other type of top-level element may require an indirection
            //   step to navigate to, thus requiring that ! is always prepended. 
            if (topLevelElement === 'html') {
                return "!" + elementStep;
            }
            else {
                return elementStep;
            }
        }
        else {
            return this.createCFIElementSteps($parentNode, characterOffset, topLevelElement, classBlacklist, elementBlacklist, idBlacklist) + elementStep;
        }
    }
};

    if (global.EPUBcfi) {

        throw new Error('The EPUB cfi library has already been defined');
    }
    else {

        global.EPUBcfi = EPUBcfi;
    }
}) (typeof window === 'undefined' ? this : window);
