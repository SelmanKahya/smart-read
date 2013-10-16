(function(window){

window.Acc = {
detailed: [],
title: '',
page: '',
RadioGroup: function(radioGroupObjId, defaultRadioValSelector, callback) {
var rgo = $('#' + radioGroupObjId).get(0),
track = {}, that = this,
select = function(index, force) {
$('#' + rgo.id + ' > *').attr( {
tabindex : '-1',
'aria-selected' : 'false',
'aria-checked' : 'false'
});
$(that.childNodes[index]).attr( {
tabindex : '0',
'aria-selected' : 'true',
'aria-checked' : 'true'
});
if (force) $(that.childNodes[index]).focus();
that.selected = that.childNodes[index];
that.index = index;
if (callback && typeof callback === 'function') callback(that.childNodes[index], that.childNodes);
};
that.childNodes = $('#' + rgo.id + ' > *').each(function(i, o) {
track[o.id] = i;
track.max = i + 1;
$(o).attr( {
tabindex : '-1',
'aria-selected' : 'false',
'aria-checked' : 'false',
'aria-posinset' : track.max
});
}).get();
$('#' + rgo.id + ' > *').attr('aria-setsize', track.max)
.bind( {
click: function(ev) {
if (this != that.selected) select(track[this.id]);
},
keydown : function(ev) {
var k = ev.which || ev.keyCode;
if (k == 37 || k == 38) {
if (that.index > 0)
select(that.index - 1, true);
else
select(track.max - 1, true);
}
else if (k == 39 || k == 40) {
if (that.index < (track.max - 1))
select(that.index + 1, true);
else
select(0, true);
ev.stopPropagation();
}
}
});
that.set = function(id) {
select(track[id]);
};
select(track[$('#' + radioGroupObjId + defaultRadioValSelector).get(0).id]);
}
};

})(window);