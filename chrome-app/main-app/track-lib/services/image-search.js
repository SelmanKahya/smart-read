// need to lood this first
google.load('search', '1');

function ImageService(){};

ImageService.prototype.getImage = function(keyword, callback){
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
};