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