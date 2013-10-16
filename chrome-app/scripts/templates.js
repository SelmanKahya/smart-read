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