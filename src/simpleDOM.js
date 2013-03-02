/**
 * simpleDOM
 * A very small DOM Manipulating Library
 *
 * @Version: 0.1 alpha
 * @Maintainer: Jan Wiemers
 * @Package: simpleDOM
 */

(function(

	$ = simpleDOM = function(selector, context) {
		if (!(this instanceof simpleDOM)) {
            return new simpleDOM(selector, context)
        }

        this.elems    = null;
        this.DOMReady = false;


	}

	DOM.prototype = {

		checkDOMReady: function () {
            if (!this.DOMReady) {
                if (document.addEventListener) {
                    DOMContentLoaded = function (scope) {
                        return function () {
                            document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
                            scope.setDOMReady()
                        }
                    }(this)
                } else {
                    if (document.attachEvent) {
                        DOMContentLoaded = function (scope) {
                            return function () {
                                if (document.readyState === "complete") {
                                    document.detachEvent("onreadystatechange", DOMContentLoaded);
                                    scope.setDOMReady()
                                }
                            }
                        }(this)
                    }
                }
                if (document.readyState === "complete") {
                    this.setDOMReady()
                }
                if (document.addEventListener) {
                    document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);
                    window.addEventListener("load", this.setDOMReady, false)
                } else {
                    if (document.attachEvent) {
                        document.attachEvent("onreadystatechange", DOMContentLoaded);
                        window.attachEvent("onload", this.setDOMReady)
                    }
                }
            }
        },
        executeDOMReadyFunctions: function () {
            for (var i = 0; i < this.DOMReadyList.length; i++) {
                (new this.DOMReadyList[i]())
            }
        },
        setDOMReady: function () {
            this.DOMReady = true
        },
        ready: function (fn) {
            if (typeof fn !== "function") {
                return
            }
            if (this.DOMReady) {
                return fn()
            }
            this.DOMReadyList.push(fn);
            if (!this.DOMReadyCheckRunning) {
                this.DOMReadyCheckRunning = true;
                this.DOMReadyInterval = window.setInterval(function (scope) {
                    return function () {
                        scope.checkDOMReady();
                        if (scope.DOMReady) {
                            clearInterval(scope.DOMReadyInterval);
                            scope.executeDOMReadyFunction()
                        }
                    }
                }(this), 9)
            }
        },	

	}

)){}