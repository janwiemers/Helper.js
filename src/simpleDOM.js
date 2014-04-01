(function(){
    $ = Helper = function(selector, context) {

        /* Provide a Singelton Class */
        if (!(this instanceof Helper))  return new Helper(selector, context);

        /* Some global Variables */
        this.readyCallback = [];
        this.DOMReady      = false;
        this.eventbindings = [];
        this.collection    = [];
        this.context       = context || document;


        /* Different behavior for different types of the argument */

        /* add functions to the readyCallback */
        if ( typeof ( selector ) === 'function' ) {
            this.ready( selector );
        }

        /* If the provided selector is an Object and is a valid HTML Element */
        else if ( ( typeof selector === 'object' && selector.hasOwnProperty('nodeType') ) || selector === window || selector === document )  {
            this.collection = selector;
        }

        /* The default way to select elements */
        else {
            var _collection = this.context.querySelectorAll( selector ),
                _collectionLength = _collection.length,
                i = 0;

            /* if no matching elements are found Terminate the current Action */
            if( _collectionLength === 0 ) {
                this.log('error', 'No matches found for your Query');
                return false;
            }

            /* Push the Elements form the HTMLCollection Array into a nativ Array for better handling in further functions */
            for( ; i<_collectionLength; i++) {
                this.collection.push( _collection[i] );
            }
        }

        return this;
    };



    Helper.prototype = {

        /**
         * Function which checks for the DOMContentLoaded Event with a Fallback for older Browser
         * TODO: check if the Fallback is nessasary
         * @return {[type]} [description]
         */
        _checkDOMReady: function () {
            /* check if the internal DOMReady is false */
            if( !this.DOMReady ) {

                /* Eventhandler for all the Browser */
                if ( document.addEventListener ) {
                    DOMContentLoaded = function( context ) {
                        return function(){
                            document.removeEventListener( 'DOMContentLoaded', DOMContentLoaded, false );
                            context._setDOMReady();
                        };
                    }( this );

                    document.addEventListener( 'DOMContentLoaded', DOMContentLoaded, false );
                    window.addEventListener( 'load', this._setDOMReady, false );
                }

                /* And the old Internet Explorer */
                else if ( document.attachEvent ) {
                    DOMContentLoaded = function( context ) {
                        return function() {
                            if ( document.readyState === 'complete' ) {
                                document.detachEvent( 'onreadystatechange', DOMContentLoaded );
                                context._setDOMReady();
                            }
                        };
                    }( this );

                    document.attachEvent( 'onreadystatechange', DOMContentLoaded);
                    window.attachEvent( 'onload', this._setDOMReady );
                }

                /* Check the readyState */
                if ( document.readyState === "complete" ) {
                    this._setDOMReady();
                }
            }
        },

        /**
         * performs all the functions of the readyCallback
         * @return {[type]} [description]
         */
        _executeReadyFunction: function() {
            var i = 0;
                _length = this.readyCallback.length;

            /* execute every function in the Callback Array */
            for ( ; i < _length; i++) {
                (new this.readyCallback[i]());
            }

            /* reset the readyCallback to an empty array */
            this.readyCallback = [];
        },

        /**
         * Sets the internal DOMReady Variable to true
         */
        _setDOMReady: function() {
            this.DOMReady = true;
        },

        /**
         * Public function to add Callbacks to Document ready and execute it if the Document is allready "ready"
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        ready: function ( callback ) {

            /* Test callback for being a function */
            if( typeof callback !== 'function') {
                this.log('error', 'Callback is not a Function');
            }

            /* If the Document is ready execute the Function */
            if( this.DOMReady ) {
                return callback();
            }

            /* add the callback to the readyCallback */
            this.readyCallback.push( callback );

            /* Execute the DOMReadyCheck */
            if( !this.DOMReadyCheckRunning ) {

                /* we just want only one Instance */
                this.DOMReadyCheckRunning = true;

                /* Start the Interval to check the DOMContentLoaded Event */
                this.DOMReadyInterval = window.setInterval( function( context ) {
                    return function(){
                        context._checkDOMReady();

                        if( context.DOMReady ) {
                            /* remove the Interval */
                            clearInterval( context.DOMReadyInterval );

                            /* execute al Function in the readyCallback */
                            context._executeReadyFunction();
                        }
                    };
                }(this), 9);
            }
        },

        /**
         * Provides a logging function
         * @param  {[type]} type    [log, info, warn, error, group, groupEnd]
         * @param  {[type]} message [description]
         * @return {[type]}         [description]
         */
        log: function( type, message ) {
            if( window.console ) {

                switch(type) {

                    /* normal Logger */
                    case 'info':
                        console.info( message );
                        break;
                    case 'warn':
                        console.warn( message );
                        break;
                    case 'error':
                        console.error( message );
                        break;

                    /* Group Logging */
                    case 'group':
                        console.group( message );
                        break;
                    case 'groupEnd':
                        console.groupEnd();
                        break;

                    /* default */
                    default:
                        console.log( message );
                }
            }

            return this;
        },

        /**
         * Iterate over the current Element Collection
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        each: function( callback ) {

            var i = 0,
                _length = this.collection.length,
                _result;

            for( ; i<_length; i++ ) {

                _result = callback.call( this.collection[i], i, this);
                if( _result === false ) {
                    break;
                }
            }

            return this;
        },

        /**
         * A simple Event binding
         * TODO: extends it with an off function to unbind specific callbacks 
         * @param  {[type]}   event     [description]
         * @param  {Function} callback  [description]
         * @return {[type]}             [description]
         */
        on: function( event, callback ) {

            if ( typeof callback !== 'function' ) {
                this.log('error', 'Callback is not a Function');
                return false;
            }

            this.each( function( index, context ){

                if ( this.addEventListener ) {
                    this.addEventListener(event, function(event) {
                        event = event || window.event;
                        event.target = event.target || event.currentTarget || event.srcElement || this;
                        callback.call( this, event );
                    },false);
                }
                else if ( this.elem.attachEvent ) {
                    this.attachEvent('on' + event, function(event) {
                        event = event || window.event;
                        event.target = event.target || event.currentTarget || event.srcElement || this;
                        callback.call( this, event );
                    });
                }
            });

            return this;
        },

        /**
         * [stopPropagation description]
         * @param  {[type]} event [description]
         * @return {[type]}       [description]
         */
        stopPropagation: function ( event ) {
           return ( event.stopPropagation) ? event.stopPropagation() : event.cancelBubble = true;
        },

        /**
         * [preventDefault description]
         * @param  {[type]} event [description]
         * @return {[type]}       [description]
         */
        preventDefault: function( event ) {
            return ( event.preventDefault() ) ? event.preventDefault() : false;
        },

        css: function( property, value ) {
            /* If the Property is an Object */
            if( typeof property === 'object') {
                this.each(function(){
                    var i = 0,
                        _length = property.length;

                    for( i in property) {
                        if( property[i] ) {
                            this.style[i] = property[i];
                        }
                    }
                });
            }
            else if ( property && value ) {
                this.each(function(){
                    this.style[property]  = value;
                });
                
            }

            return this;
        },


        /**
         * Function to manipulate Attributes
         * @param  {[type]} attribute [Could be a String or an Object{key:value}]
         * @param  {[type]} value     [description]
         * @return {[type]}           [description]
         */
        attr: function ( attribute, value ) {
            var _isObject = (typeof attribute === 'object') ? true : false;

            /* if attribute and value or _isObject */
            if( attribute && value || _isObject) {

                this.each(function(){

                    /* attribute is an Object */
                    if( _isObject ) {
                        for( var i in attribute) {
                            if( attribute[i] ) {
                                this.setAttribute( i, attribute[i]);
                            }
                        }
                    }

                    /* Attribute and Value are set */
                    else {
                        this.setAttribute( attribute, value );
                    }
                });
                
            }

            /* get Attribute Value */
            else if( attribute && !value ) {

                /* exit if the Collection has more than 1 Entry */
                if( this.collection.length > 1 ) {
                    this.log('warn', 'You have to select one Element at least to read an Attribute');
                    return undefined;
                }
                else {
                    return this.collection.eq(0).getAttribute( attribute ) || undefined;
                }
            }

            return this;
        },

        /**
         * remove the Elements in the Collection from the DOM
         * @return {[type]} [description]
         */
        remove: function() {
            this.each(function(){
                try {
                    this.parentNode.removeChild(this);
                } catch(e) { this.log('error', e); }
                

            });
            return true;
        },

        /**
         * Adds a Element to the DOM
         * @param {[type]} t [description]
         * @param {[type]} v [description]
         * @param {[type]} o [description]
         */
        addElement: function( html ) {
            if( this.collection.length > 1 ) {
                this.log('warn', 'You have to select one Element at least to read an Attribute');
                return false;
            }

            var node = document.createElement('div');
            node.innerHTML = html;
            return ( this.collection.eq( 0 ).parentNode.insertBefore( node, this.collection.eq( 0 ) ) );
        },


        /**
         * Checks the given Element for a special Classname
         * TODO: make it work
         * @param  {[type]}  classname [description]
         * @return {Boolean}           [description]
         */
        hasClass: function ( classname ) {
            console.log(this.collection.length);
            if( this.collection.length > 1 ) {
                this.log('warn', 'You have to select one Element at least to read an Attribute');
                return false;
            }

            var element = this.eq( 0 );
            console.log(this.eq( 0 ));
            if( !element.className || !element.classList ) return false;

            return ( element.classList ) ? element.classList.contains( classname ) : !!element.className.match( new RegExp( '(^|\\s)'+classname+'(\\s|$)', 'g' ) );
        },

        /**
         * Removes a Classname from the current Element Collection
         * @param  {[type]} classname [description]
         * @return {[type]}           [description]
         */
        removeClass: function( classname ) {
            this.each(function(){
                return ( this.classList.remove( classname ) ) ? this.classList.remove( classname ) : this.className.replace(new RegExp('(^|\\s)'+classname+'(\\s|$)', 'g'), ' ');
            });

            return this;
        },

        /**
         * Adds a Classname to the current Collection of Elements
         * @param {[type]} classname [description]
         */
        addClass: function( classname ) {
            this.each(function(){
                return ( this.classList.add( classname ) ) ? this.classList.add( classname ) : this.className += ' '+classname;
            });
        },

        /**
         * Toggles a Classname on all Elements in the Current Collection
         * TODO: Finish work when the hasClass Method works
         * @param  {[type]} classname [description]
         * @return {[type]}           [description]
         */
        toggleClass: function( classname ) {
            var result = true;

            this.each(function(){
                console.log( $(this) );
                if( $(this).hasClass( classname ) ) {
                    console.log( $(this) );
                    $(this).removeClass( classname );
                }
                else {
                    $(this).addClass( classname );
                }
            });

            if( !result ) {
                this.log('warn', 'One or more Elements are not in Sync');
            }
        },

        /**
         * return the Element for the given Index 
         * @param  {[type]} index [description]
         * @return {[type]}       [description]
         */
        eq: function( index ) {
            return ( this.collection[index] ) ? $(this.collection[index]) : false;
        }

    };

    /**
     * Provides a simple Function for AJAX Calls
     * TODO: Refactoring!
     * @param  {[type]} u [description]
     * @param  {[type]} c [description]
     * @param  {[type]} s [description]
     * @return {[type]}   [description]
     */
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
})();