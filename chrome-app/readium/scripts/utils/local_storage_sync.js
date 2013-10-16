
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
