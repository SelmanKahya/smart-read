// need to lood this first, image search api
google.load('search', '1');

SMARTREAD = {};

SMARTREAD = new function() {

    // BOOK model
    this.book = {
        id: '',
        key: '',
        name: '',
        numPages: '',
        status : {
            currentPage: '',
            previousPage: ''
        }
    }

    // init SMARTREAD object, assign required variables
    this.init = function () {

        var checkReadiumTimer = setInterval(function(){checkReadium()}, 1);

        var checkReadium = function(){



            // if it is loaded, then bind events to elements inside iframe
            if(window._epubController &&
                window._epubController.paginator &&
                window._epubController.paginator.v &&
                window._epubController.paginator.v.pages &&
                window._epub){

                clearInterval(checkReadiumTimer);

                var current_page = window._epubController.paginator.v.pages.get("current_page");

                // console.log(window._epub);

                // INIT book configuration
                SMARTREAD.book = {
                    id: window._epub.attributes.id,
                    key: window._epub.attributes.key,
                    name: window._epub.attributes.title,
                    numPages: window._epubController.paginator.v.pages.attributes.num_pages,
                    status : {
                        currentPage: current_page,
                        previousPage: null
                    }
                }

                var pageChanged = function(){
                    var previousPage = null;
                    var currentPage = window._epubController.paginator.v.pages.get("current_page");

                    SMARTREAD.book.status.previousPage = previousPage;
                    SMARTREAD.book.status.currentPage = currentPage;

                    // activity_type_id = 3  --->  page_changed
                    SMARTREAD.services.ActivityService.newActivity({
                        activity_type_id: '3',
                        activity_content: "{old: '" + previousPage + "', new: '" + currentPage + "'}"
                    }, function(){})
                }

                // attach a function to page change event
                $( "#next-page-button" ).click(function() {
                    pageChanged();
                });

                $( "#prev-page-button" ).click(function() {
                    pageChanged();
                });

                // this is called when chapter has been changed
                window._epubController.on("change:spine_position", function(){}, this);

                // TELL SERVER that user started reading a book
                SMARTREAD.services.ActivityService.newActivity({
                    activity_type_id: '1',
                    activity_content: ''
                }, function(){})

            }
        }
    }

    this.services = {

        // makes calls to the server
        CallService : new function() {
            this.makeRequest = function (method, path, data, callback) {
                chrome.storage.local.get('user', function (result) {

                    var user = result.user;

                    if(!user) {
                        alert('You should login to use this application. Redirecting you to sign-in page..');
                        window.location = "/main-app/index.html#/login";
                    }

                    else {
                        chrome.storage.local.get('server', function (result) {
                            if(!result.server.url)
                                alert('Error while getting server options, please restart the application and go to main page.');
                            else {

                                if(data)
                                    data.user_id = user.user_id;

                                $.ajax({
                                    type: method,
                                    url: result.server.url + path,
                                    data: data,
                                    xhrFields: {
                                        withCredentials: true
                                    }
                                }).done(function(result) {
                                        callback(result);
                                    });
                            }
                        });
                    }
                });
            }
        },

        // activity operations
        ActivityService : new function() {
            this.newActivity = function (activity, callback) {
                var data = {
                    activity_type_id: activity.activity_type_id,
                    activity_content: activity.activity_content,
                    book_name : SMARTREAD.book.name,
                    user_id : activity.user_id
                };

                SMARTREAD.services.CallService.makeRequest('POST', '/activity/', data, function(result){
                    callback(result);
                });
            }
        },

        // word lookup requests
        LookupService : new function() {
            this.wordLookup = function (word, callback) {

                // if selected string is empty, do nothing
                if(word == "" || word == " ")    return;

                SMARTREAD.services.CallService.makeRequest('GET', "/dictionary/" + word, null, function(result){
                    if(result.status)
                        callback(result.result);

                    else
                        callback(null);
                });
            }
        },

        // image search api
        ImageService : new function() {
            this.getImage = function (keyword, callback) {
                var imageSearch;

                // this is called after we get the response back from google search api
                function searchComplete() {
                    callback(imageSearch.results );
                }

                // makes the call, returns the response
                function imageCall(keyword) {
                    imageSearch = new google.search.ImageSearch();
                    imageSearch.setSearchCompleteCallback(this, searchComplete, null);
                    imageSearch.execute(keyword);
                }

                // make an ajax call to google img api
                imageCall(keyword);
            }
        }
    }
};

$(document).ready(function(){
    SMARTREAD.init();
});
