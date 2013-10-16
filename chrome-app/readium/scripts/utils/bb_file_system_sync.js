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