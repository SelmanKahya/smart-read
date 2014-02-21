'use strict';

var outsider = angular.module('service.outsider', []);

outsider.factory('lookupService', function($http) {
    return {
        wordLookup : function(word, callback){

            // if selected string is empty, do nothing
            if(word == "" || word == " ")    return;

            // now, make a call to google dictionary api, and get the meaning
            $http({method: 'GET', url: 'http://www.google.com/dictionary/json?callback=process&sl=en&tl=en&restrict=pr,de&client=te&q=' + word}).
                success(function(response, status, headers, config) {

                    var massaged = response.replace(/^[^(]+\(|[^}]+$/g, ''), res;
                    try {
                        res = JSON.parse( massaged );
                    } catch( e ) {
                        res = new Function( 'return ' + massaged )();
                    }

                    var result = process(res);
                    callback(result);

                });

            // process the json response, creates result object
            var process = function(json_obj){
                var result = {
                    word : json_obj.query,
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
                                wordType += pro[i]["labels"][0]['text'];
                                wordType += " ";
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
                    else
                        continue;
                }

                return result;
            }
        }
    };
});

google.load('search', '1');
outsider.factory('imageSearchService', function($http) {
    return {
        search : function(keyword, callback){
            var imageSearch;

            // this is called after we get the response back from google search api
            function searchComplete() {
                callback(imageSearch.results);
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
});