/*
 * Readium i18n functions
 *
 */

var elems = document.getElementsByTagName("span");
for (var i = 0; i<elems.length; i++) {
        if (elems[i].id == null) {
                continue;
        }
        if (elems[i].id.indexOf("i18n_html_", 0) == 0) {
                var msg = chrome.i18n.getMessage(elems[i].id);
                if (msg != "") {
                        elems[i].innerHTML = msg;
                }
        } else if (elems[i].id.indexOf("i18n_", 0) == 0) {
                var msg = chrome.i18n.getMessage(elems[i].id);
                if (msg != "") {
                        elems[i].innerText = msg;
                }
        }
}

var titles = document.getElementsByTagName("title");
for (var i = 0; i<titles.length; i++) {
        if (titles[i].id == null) {
                continue;
        }
        if (titles[i].id.indexOf("i18n_html_", 0) == 0) {
                var msg = chrome.i18n.getMessage(titles[i].id);
                if (msg != "") {
                        titles[i].innerHTML = msg;
                }
        } else if (titles[i].id.indexOf("i18n_", 0) == 0) {
                var msg = chrome.i18n.getMessage(titles[i].id);
                if (msg != "") {
                        titles[i].innerText = msg;
                }
        }
}
