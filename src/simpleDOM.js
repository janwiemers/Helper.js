(function(){
    $ = Helper = function(selector, context) {
        if (!(this instanceof Helper))  return new Helper(selector, context);
        this.readyList     = [];
        this.isReady       = false;
        this.eventbindings = [];
        this.elem          = false;
        if ( typeof ( selector ) == 'function' ) { this.ready(selector); }
        else if ( typeof selector == 'object' )  { this.elem = selector; }
        else {
            var c = context || document,
                e = [],
                i,
                elms,
                initial;
            if      ( selector === window || selector === document )  { this.elem = selector; }
            else if ( selector === 'body' )                           { this.elem = c.body; }
            else {
                initial = selector.substr(0,1);
                if ( initial === '#' )    { this.elem = c.getElementById(selector.slice(1)); }
                else if ( initial === '.' ) {
                    elms = (!!c.getElementsByClassName) ? c.getElementsByClassName(selector.slice(1)) : c.querySelectorAll(selector);
                    for(i=0; i<elms.length; i++) {
                        e.push(elms[i]);
                    }
                    this.elem = e;
                }
                else {
                    elms = c.getElementsByTagName(selector);
                    for(i=0; i<elms.length; i++) {
                        e.push(elms[i]);
                    }
                    this.elem = e;
                }
            }
            return (this.elem === null) ? false : this;
        }
    };
    Helper.prototype = {
        checkDocumentReady: function () {
            if(!this.isReady) {
                if ( document.addEventListener ) {
                DOMContentLoaded = function(c) {
                    return function(){
                        document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                        c.setReady();
                }}(this);
                }
                else if ( document.attachEvent ) {
                    DOMContentLoaded = function(c) {
                        return function() {
                            if ( document.readyState === "complete" ) {
                                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                                c.setReady();
                            }
                    }}(this);
                }
                if ( document.readyState === "complete" ) {
                    this.setReady();
                }
                if ( document.addEventListener ) {
                    document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                    window.addEventListener( "load", this.setReady, false );
                 } else if ( document.attachEvent ) {
                        document.attachEvent("onreadystatechange", DOMContentLoaded);
                        window.attachEvent( "onload", this.setReady );
                }
            }
        },
        executeReadyFunction: function() {
            for (var i = 0; i < this.readyList.length; i++) {
                (new this.readyList[i]());
            }
        },
        setReady: function() {
            this.isReady = true;
        },
        ready: function ( fn ) {
            if(typeof fn !== 'function') return;
            if(this.isReady) {
                return fn();
            }
            this.readyList.push(fn);
            if(!this.documentReadyCheckRunnig) {
                this.documentReadyCheckRunnig = true;
                this.readyInterval = window.setInterval(function(c) { return function(){
                    c.checkDocumentReady();
                    if(c.isReady) {
                        clearInterval(c.readyInterval);
                        c.executeReadyFunction();
                    }
                }}(this), 9);
            }
        },
        on: function(event,cb) {
            if (typeof cb != 'function' || this.elem === null) return;
            var elem = this.elem;
            if ( this.elem.addEventListener ) {
                this.elem.addEventListener(event, function(event) {
                    event               = event || window.event;
                    event.target = event.target || event.currentTarget || event.srcElement || elem;
                    cb.call( elem, event );
                },false);
            } else if ( this.elem.attachEvent ) {
                this.elem.attachEvent('on' + event, function(event) {
                    event               = event || window.event;
                    event.target = event.target || event.currentTarget || event.srcElement || elem;
                    cb.call( elem, event );
                });
            }
        },
        stopPropagation: function (e) {
           return (e.stopPropagation) ? e.stopPropagation() : e.cancelBubble = true;
        },
        css:function(property,value) {
            if ( property && value ){
                this.elem.style[property] = value;
            }
            else if ( property ) {
                return this.elem.style[property];
            }
        },
        fade: function ( d ) {
            if (!d || !this.elem) return;
            var c = (this.elem.length) ? this.elem : [this.elem];
            window.setTimeout(function(c){ return function(){
                for ( i in c ) {
                    c[i].className += ' tr tra';
                }
            }}(c), 100);
            if(d == 'out') {
                window.setTimeout(function(c){ return function(){
                    for ( i in c ) {
                        c[i].className = c[i].className.replace('tra', '');
                    }
                }}(c), 100);
            }
            return this;
        },
        attr: function (a) {
            if(this.elem && a) return this.elem.getAttribute(a) || false;
        },
        remove: function() {
            return (this.elem.parentNode.removeChild(this.elem));
        },
        addElement: function( t, v, o ) {
            var nn = document.createElement(t);
            if(v) { 'innerText' in nn ? (nn.innerText = v) : (nn.innerHTML = v); }
            if(o) { for(i in o) { nn[o[i][0]] = o[i][1]; }}
            return (this.elem.parentNode.insertBefore(nn, this.elem));
        },
        hasClass: function (c) {
            if(!this.elem.className) return false;
            return !!this.elem.className.match(new RegExp('(^|\\s)'+c+'(\\s|$)', 'g'));
        },
        removeClass: function( c ) {
            return this.elem.className = this.elem.className.replace(new RegExp('(^|\\s)'+c+'(\\s|$)', 'g'), ' ');
        },
        addClass: function( c ) {
            return this.elem.className += ' '+c;
        },
        toggleClass: function( c ) {
            return ( $(this.elem).hasClass( c ) ) ? $(this.elem).removeClass( c ) : $(this.elem).addClass( c );
        }
    };
    $.ajax = function(u, c, s) {
        var async = (s && s === false) ? false : true;
        var xhr=window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
        xhr.open('GET', u, async);
        if (c && typeof c === 'function') xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) c(xhr);
        };
        xhr.send(null);
        return xhr;
    };
    $.track = function(c, t, params) {
        var url  = 'stats?section=search'+c+'.'+t,
            keys = [],
            i;
        if(params && typeof params === "object" ) {
            keys = Object.keys(params);
            for (i=0; i<keys.length; i++) {
                url += '&'+keys[i]+'='+params[keys[i]];
            }
        }
        url += '&mts='+(new Date()*1);
        this.ajax(url, '', false);
    };
})();