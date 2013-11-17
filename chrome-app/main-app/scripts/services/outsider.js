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





// similartiy check
// console.log(similar_text('major', 'majors', 1));
function similar_text (first, second, percent) {
    // http://kevin.vanzonneveld.net
    // +   original by: Rafał Kukawski (http://blog.kukawski.pl)
    // +   bugfixed by: Chris McMacken
    // +   added percent parameter by: Markus Padourek (taken from http://www.kevinhq.com/2012/06/php-similartext-function-in-javascript_16.html)
    // *     example 1: similar_text('Hello World!', 'Hello phpjs!');
    // *     returns 1: 7
    // *     example 2: similar_text('Hello World!', null);
    // *     returns 2: 0
    // *     example 3: similar_text('Hello World!', null, 1);
    // *     returns 3: 58.33
    // *   bugfixed by: Jarkko Rantavuori based on findings in stackoverflow (http://stackoverflow.com/questions/14136349/how-does-similar-text-work)
    if (first === null || second === null || typeof first === 'undefined' || typeof second === 'undefined') {
        return 0;
    }

    first += '';
    second += '';

    var pos1 = 0,
        pos2 = 0,
        max = 0,
        firstLength = first.length,
        secondLength = second.length,
        p, q, l, sum;

    max = 0;

    for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
            for (l = 0;
                 (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++);
            if (l > max) {
                max = l;
                pos1 = p;
                pos2 = q;
            }
        }
    }

    sum = max;

    if (sum) {
        if (pos1 && pos2) {
            sum += this.similar_text(first.substr(0, pos1), second.substr(0, pos2));
        }

        if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
            sum += this.similar_text(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max, secondLength - pos2 - max));
        }
    }

    if (!percent) {
        return sum;
    } else {
        return (sum * 200) / (firstLength + secondLength);
    }
}