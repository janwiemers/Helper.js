/**
 * simpleDOM
 * A very small DOM Manipulating Library
 *
 * @Version: 0.1 alpha
 * @Maintainer: Jan Wiemers
 * @Package: simpleDOM
 */

(function(){

    $ = simpleDOM = function(selector, context) {
        if (!(this instanceof simpleDOM)) {
            return new simpleDOM(selector, context);
        }

        this.document = document;
        this.window   = window
        this.elems    = [];
        this.context  = (context !== undefined) ? context : document;
        this.DOMReady = false;

        /* Is the Sector a Function add it to the DOMReadyList */
        if(typeof selector === 'function') { this.ready(selector); }
        
        /* else Execute the Query on the Context */
        var _elemsHolder = this.context.querySelectorAll(selector);

        try {
            this.elems = Array.prototype.concat.call(_elemsHolder);
        } catch (ex) {

            for (var i in _elemsHolder) {
                _elemsHolder.hasOwnProperty(i) && this.elems.push(_elemsHolder[i]);
            }
        }


    };

    simpleDOM.prototype = {

        /**
         * Add the Document Ready event
         */
        checkDOMReady: function () {

            if (!this.DOMReady) {
                if (this.document.addEventListener) {
                    DOMContentLoaded = function (scope) {
                        return function () {
                            this.document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                            scope.setDOMReady();
                        };
                    }(this);
                } else {
                    if (this.document.attachEvent) {
                        DOMContentLoaded = function (scope) {
                            return function () {
                                if (this.document.readyState === "complete") {
                                    this.document.detachEvent("onreadystatechange", DOMContentLoaded);
                                    scope.setDOMReady();
                                }
                            };
                        }(this);
                    }
                }
                if (this.document.readyState === "complete") {
                    this.setDOMReady();
                }
                if (this.document.addEventListener) {
                    this.document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                    this.window.addEventListener("load", this.setDOMReady, false);
                } else {
                    if (this.document.attachEvent) {
                        this.document.attachEvent("onreadystatechange", DOMContentLoaded);
                        this.window.attachEvent("onload", this.setDOMReady);
                    }
                }
            }
        },

        /**
         * Executes the Functions applyed
         * @return {[type]} [description]
         */
        executeDOMReadyFunctions: function () {
            for (var i = 0; i < this.DOMReadyList.length; i++) {
                (new this.DOMReadyList[i]());
            }
        },

        /**
         * Sets the Document Ready Function to true
         */
        setDOMReady: function () {
            this.DOMReady = true;
        },

        /**
         * Public function to add Functions to the DocuementReady Event
         * @param  function
         */
        ready: function (fn) {
            if (typeof fn !== "function") {
                return;
            }
            if (this.DOMReady) {
                return fn();
            }
            this.DOMReadyList.push(fn);
            if (!this.DOMReadyCheckRunning) {
                this.DOMReadyCheckRunning = true;
                this.DOMReadyInterval = window.setInterval(function (scope) {
                    return function () {
                        scope.checkDOMReady();
                        if (scope.DOMReady) {
                            clearInterval(scope.DOMReadyInterval);
                            scope.executeDOMReadyFunction();
                        }
                    };
                }(this), 9);
            }
        },

        /**
         * Returns the indexed Item of the Current Collection
         * @param  integer index  [The Item id starts at 0]
         * @return Array Index
         */
        eq: function( index ) {
            return this.elems[index];
        },

        /**
         * Execute a for loop
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        each: function( callback ){

            var _length = this.elems.length,
                _i      = 0;

            while (_i < _length) {
                _i++;
                callback.call(this.elems[_i], _i);
            }

        }



    };

})();