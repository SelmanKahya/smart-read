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
