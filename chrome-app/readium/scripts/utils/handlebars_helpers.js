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
