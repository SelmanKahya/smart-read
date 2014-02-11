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

                    if(!user)
                        alert('Cannot tracking reading activity. Please log-in from main page to use this application.');

                    else {
                        chrome.storage.local.get('server', function (result) {
                            if(!result.server.url)
                                alert('Error while getting server options, please restart the application and go to main page.');
                            else {

                                data.user_id = user.user_id;

                                $.ajax({
                                    type: method,
                                    url: result.server.url + path,
                                    data: data
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
                // Handles AJAX response (google dictionary API request)
                var handleResponse = function(){
                    if(ajax.readyState==4 && ajax.status==200){
                        var massaged = ajax.responseText.replace(/^[^(]+\(|[^}]+$/g, ''), res;
                        try {
                            res = JSON.parse( massaged );
                        } catch( e ) {
                            res = new Function( 'return ' + massaged )();
                        }

                        var result = process(res);
                        callback(result);
                    }
                }

                // process the json response, creates result object
                var process = function(json_obj){

                    // this is the word that user has just double clicked
                    // we are not using it, since the actual word might be different
                    // for example: after double clicking on "reached", dictionary will
                    // show the meaning of "reach", and
                    // "reach" is the thing that we care about here
                    var double_clicked_word = json_obj.query;

                    var result = {
                        word : null,
                        type : null,
                        sound : null,
                        pronunciation : null,
                        primary_means : null
                    };

                    for (var prop in json_obj){
                        if(prop=="primaries"){
                            var stuff = json_obj["primaries"][0];

                            // get pronunciation and sound
                            var isa = "";
                            var sound = '';
                            var wordType = '';
                            var pro = stuff["terms"];
                            for(var i=0;i<pro.length;i++){
                                if(pro[i]["type"]=="phonetic"){
                                    isa+=pro[i]["text"];
                                    isa+=" ";
                                }
                                else if(pro[i]["type"]=="sound"){
                                    sound = pro[i]["text"];
                                }
                                else if(pro[i]["type"]=="text"){
                                    var actual_word = pro[i]["text"];

                                    // here we have to remove all the · symbols in the word
                                    // by default, google dictionary api separates syllables in the word with "·" character
                                    actual_word = actual_word.replace(/·/g,'');
                                    result.word = actual_word;

                                    if(pro[i]["labels"]){
                                        wordType += pro[i]["labels"][0]['text'];
                                        wordType += " ";
                                    }
                                }
                            }

                            result.sound = sound;
                            result.type = wordType;
                            result.pronunciation = isa;

                            // get meaning array
                            var primary_mean = stuff["entries"];
                            var primary_mean_list = [];
                            var k=0;
                            for(var i=0;i<primary_mean.length;i++){
                                if(primary_mean[i]["type"]=="meaning"){
                                    primary_mean_list[k]=primary_mean[i]["terms"][0]["text"];
                                    k++;
                                }
                            }
                            result.primary_means = primary_mean_list;
                        }
                    }

                    return result;
                }


                // if selected string is empty, do nothing
                if(word == "" || word == " ")    return;

                // now, make a call to google dictionary api, and get the meaning
                var ajax = new XMLHttpRequest();
                ajax.onreadystatechange	= handleResponse;
                ajax.open("GET","http://www.google.com/dictionary/json?callback=process&sl=en&tl=en&restrict=pr,de&client=te&q=" + word,true);
                ajax.send();
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
