/* SAP CVOM 4.0 © <2012-2014> SAP SE. All rights reserved. Build Version 1.7.0-SNAPSHOT, Build context uvb_nightly-master.434 */
if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
    window.__sap_viz_internal_requirejs_nextTick__ = requirejs.s.contexts._.nextTick;
    requirejs.s.contexts._.nextTick = function(fn) {fn();};
}
/*
 * 1. Make every AMD module exports itself.
 * 2. Every module stays anonymous until they are required.
 * 3. "Exporting" includes global namespace setup and auto loading.
 * 4. The trick must work for any valid AMD loader.
 */
(function(global){
    var ostring = Object.prototype.toString;
    function isFunction(it) {
        return ostring.call(it) === '[object Function]';
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]';
    }

    function mixin(target, src) {
        for(var prop in src){
            if(src.hasOwnProperty(prop)){
                target[prop] = src[prop];
            }
        }
        if(isFunction(target) && isFunction(src)){
            target = src;
        }
        return target;
    }

    function exportNamespace(id, mod){
        for(var i = 0,
                nameParts = id.split("/"),
                p = global,
                c;
            c = nameParts[i]; ++i){

            if(i < nameParts.length - 1){
                p[c] = p[c] || {};
            }else{
                p[c] = p[c] ? mixin(p[c], mod) : mod;
            }
            p = p[c];
        }
    }
    var exportNamespaces = {
        'sap/viz/vizframe/frame/VizFrame' : 'sap/viz/vizframe/VizFrame',
        'sap/viz/vizframe/common/Version' : 'sap/viz/vizframe/VERSION'
    };
    if(define && define.amd && !define.__exportNS){
        var originalDefine = define;
        define = function(name, deps, callback){
            if(typeof name !== 'string'){
                callback = deps;
                deps = name;
                name = null;
            }
            if(!isArray(deps)){
                callback = deps;
                deps = [];
            }

            var needExport = deps.indexOf('exports') >= 0;
            var needRequire = needExport || deps.indexOf('require') >= 0;
            if(needExport){
                deps.push('module');

                var originalCallback = callback;
                callback = function(){
                    var last = arguments.length - 1;
                    var mod = arguments[last];
                    var result = originalCallback;
                    if(isFunction(originalCallback)){
                        var args = [].slice.apply(arguments, [0, last]);
                        result = originalCallback.apply(this, args);
                    }
                    exportNamespace(exportNamespaces[mod.id] || mod.id, result);
                    return result;
                };
            }
            if(name && needRequire){
                define.__autoLoad.push(name);
            }

            return name ? originalDefine(name, deps, callback) : originalDefine(deps, callback);
        };
        for(var prop in originalDefine){
            define[prop] = originalDefine[prop];
        }
        define.__exportNS = originalDefine;
        define.__autoLoad = [];
    }
})(this);

define('sap/viz/vizframe/common/Version',['exports'], function() {
    /** sap.viz.vizframe.VERSION
     */

    /**
     * Constant, the current version of sap.viz.vizframe.
     * @static
     * @example
     * var version = sap.viz.vizframe.VERSION;
     */
    return '1.7.0-SNAPSHOT';
});

// @formatter:off
define('sap/viz/vizframe/api/Version',[
    'sap/viz/vizframe/common/Version',
    'require'
], function(Version) {
// @formatter:on
    /** sap.viz.vizframe.VERSION
     * @namespace sap.viz.vizframe.VERSION
     */
    sap.viz.vizframe.VERSION = Version;
    return Version;

    /**
     * Constant, the current version of sap.viz.vizframe.
     * @member VERSION
     * @memberof sap.viz.vizframe.VERSION
     * @static
     * @example
     * var version = sap.viz.vizframe.VERSION;
     */
});

define('sap/viz/vizframe/api/APIUtil',[
    
], function() {

    var wrappingMap = {};
    
    function buildProxyMethods(prototype, internalRefKey, methodNames) {
        methodNames.split(/\s+/).forEach( function (key) {
            prototype[key] = function () {
                return wrap( this[internalRefKey][key].apply( this[internalRefKey], arguments ) );
            };
        } );
    }

    function buildProxyProperty(prototype, internalRefKey, propertyNames) {
        propertyNames.split(/\s+/).forEach( function (key) {
            Object.defineProperty(prototype, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    return this[internalRefKey][key];
                },
                set: function (val) {
                    return ( this[internalRefKey][key] = val );
                }
            });
        } );
    }
    
    function setWrapping(from, to) {
        wrappingMap[from] = to;
    }

    function wrap(object) {
        if ( object == null ) {
            return object;
        }
        if ( object.__wrapper__ ) {
            return object.__wrapper__;
        }
        if ( object.__className && wrappingMap[ object.__className ] ) {
            return new wrappingMap[ object.__className ]( object );
        }
        return object;
    }

    return {
        buildProxyMethods: buildProxyMethods,
        buildProxyProperty: buildProxyProperty,
        wrap: wrap,
        setWrapping: setWrapping
    };
});

define( "jquery", [], function () { return jQuery; } );

define("sap/viz/vizframe/common/LanguageLoader", [], function() {
    sap.viz.extapi.env.Language.register({id:'language',value: {VIZ_FRAME_CONTROL_LOAD_ERROR:"Failed to load the control object {0}.",VIZ_FRAME_INVALID:"Invalid VizFrame instance.",VIZ_FRAME_DESTORYED:"VizFrame instance was destroyed.",}});
});

define('sap/viz/vizframe/common/utils/OOUtil',[],function() {

    var OOUtil = {};

    /**
     * Extend class, superClz's constructor will be applied with no parameters.
     *
     * @para {function} subClz the sub class
     * @para {function} superClz the super class to be extended
     * @return {function} the extended subClz
     * @public
     * @static
     */
    OOUtil.extend = function(subClz, superClz) {
        var subClzPrototype = subClz.prototype;

        // add the superclass prototype to the subclass definition
        subClz.superclass = superClz.prototype;

        // copy prototype
        var F = function() {
        };
        F.prototype = superClz.prototype;

        subClz.prototype = new F();
        for(var prop in subClzPrototype) {
            if(subClzPrototype.hasOwnProperty(prop)) {
                subClz.prototype[prop] = subClzPrototype[prop];
            }
        }
        subClz.prototype.constructor = subClz;
        if(superClz.prototype.constructor == Object.prototype.constructor) {
            superClz.prototype.constructor = superClz;
        }
        return subClz;
    };
    return OOUtil;
});

define('sap/viz/vizframe/common/utils/utils',[],function() {
    var utils = {};

    var hasOwn = Object.prototype.hasOwnProperty;

    var class2type = {
        '[object Boolean]' : 'boolean',
        '[object Number]' : 'number',
        '[object String]' : 'string',
        '[object Function]' : 'function',
        '[object Array]' : 'array',
        '[object Date]' : 'date',
        '[object RegExp]' : 'regexp',
        '[object Object]' : 'object'
    };
    /**
     * judge object type
     * @param {object}
     */
    utils.type = function(obj) {
        return obj == null ? String(obj) : class2type[Object.prototype.toString.call(obj)] || "object";
    };
    /**
     * judge object type is or not Object
     * @param {object}
     */
    utils.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };
    /**
     * judge object type is or not Function
     * @param {object}
     */
    utils.isFunction = function(obj) {
        return utils.type(obj) === "function";
    };
    /**
     * judge object type is or not Boolean
     * @param {object}
     */
    utils.isBoolean = function(obj) {
        return utils.type(obj) === "boolean";
    };
    /**
     * judge object type is or not String
     * @param {object}
     */
    utils.isString = function(obj) {
        return utils.type(obj) === "string";
    };
    /**
     * judge object type is or not Array
     * @param {object}
     */
    utils.isArray = function(obj) {
        return utils.type(obj) === "array";
    };
    /**
     * judge object type is or not Number
     * @param {object}
     */
    utils.isNumber = function(obj) {
        return utils.type(obj) === "number";
    };
    /**
     * judge object type is or not Object
     * @param {object}
     */
    utils.isObject = function(obj) {
        return utils.type(obj) === "object";
    };

    /**
     * Returns a boolean value indicating whether the parameter is a plain
     * object
     *
     * @param {object}
     * @returns {boolean} Caution: A plain object is an object that has no
     *          prototype method and no parent class. Null, undefined, DOM
     *          nodes and window object are not considered as plain object.
     */
    utils.isPlainObject = function(obj) {
        // Must be an Object.
        // Because of IE, we also have to check the presence of the
        // constructor property.
        // Make sure that DOM nodes and window objects don't pass through,
        // as well
        if (!obj || utils.type(obj) !== "object" || obj.nodeType || (obj && typeof obj === "object" && "setInterval" in obj)) {
            return false;
        }

        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.

        var key;
        for (key in obj) {
        }// jshint ignore:line

        return key === undefined || hasOwn.call(obj, key);
    },

    /**
     * Returns a boolean value indicating whether the parameter is an empty
     * object
     *
     * @param {object}
     * @returns {boolean} Caution: An empty is a plain object without any
     *          properties.
     */
    utils.isEmptyObject = function(obj) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                return false;
            }

        }
        return utils.isPlainObject(obj);
    },
    /**
     * judge object type is or not RegExp
     * @param {object}
     */
    utils.isRegExp = function(obj) {
        return utils.type(obj) === "regexp";
    };
    /**
     * An empty function doing nothing.
     */
    utils.noop = function() {
    };
    
    utils.substitute = function(str, rest) {
        if (!str) { return ''; }

        for (var i = 1; i < arguments.length; i++) {
            str = str.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), arguments[i]);
        }

        return str;
    };
    
    utils.deepEqual = function(source, target) {
        if ( typeof source === 'object' && typeof target === 'object' && utils.isExist(source) && utils.isExist(target)) {
            var key = null;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    if (!target.hasOwnProperty(key)) {
                        return false;
                    } else if (!utils.deepEqual(source[key], target[key])) {
                        return false;
                    }
                }
            }
            for (key in target) {
                if (target.hasOwnProperty(key)) {
                    if (!source.hasOwnProperty(key)) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            return source === target;
        }
    };
    
    utils.isExist = function(o) {
        if ((typeof (o) === 'undefined') || (o === null)) {
            return false;
        }
        return true;
    };
    return utils;
});

define('sap/viz/vizframe/common/events/Event',[],function() {

    /**
     * sap.viz.vizframe.common.events.Event Class
     *
     * @param {String} type
     *            event type
     * @param {sap.viz.vizframe.common.events.EventDispatcher} target
     *            event target
     * @param {Object|undefined} data
     *            event data
     */
    var Event = function(type, target, data) {
        this.__className = "sap.viz.vizframe.common.events.Event";

        /**
         * {String}
         */
        this._type = type;
        /**
         * {sap.viz.vizframe.common.events.EventDispatcher}
         */
        this._target = target;
        /**
         * {Object}
         */
        this.data = data;
    };
    /**
     * Get event type
     *
     * @returns {String}
     */
    Event.prototype.type = function() {
        return this._type;
    };
    /**
     * Get event target
     *
     * @returns {sap.viz.vizframe.common.events.EventDispatcher}
     */
    Event.prototype.target = function() {
        return this._target;
    };
    return Event;
});

// @formatter:off
define('sap/viz/vizframe/common/events/EventDispatcher',[
    'sap/viz/vizframe/common/utils/utils'
], function(utils) {
// @formatter:on

    /**
     * The EventDispatcher class is the base class for all classes that dispatch events.
     */
    /**
     * EventDispatcher Class
     * we remove the original two properties, because this is Base class;
     * all the properties should be dynamically created during function call
     * of subclass.
     *
     */
    var EventDispatcher = function() {
        this.__className = "sap.viz.vizframe.common.events.EventDispatcher";

        // lazy create the listeners maps
        // this._listeners/*<String Array<{type:type, scope:scope, listener:listener, priority:priority}>>*/ = {};
        /**
         * {Boolean}
         */
        this._enableDispatchEvent = true;
    };

    /**
     * Registers an event listener object with an EventDispatcher object so that the listener receives notification of an
     * event.
     *
     * You can register event listeners on any EventDispatcher object for a specific type of event, scope, and
     * priority. If you no longer need an event listener, remove it by calling removeEventListener(), or memory problems
     * could result.
     *
     * @method sap.viz.vizframe.common.events.EventDispatcher.prototype.addEventListener
     *
     * @param {String} type
     *            The type of event.
     * @param {Function} listener
     *            The listener function that processes the event.
     * @param {Object} scope
     *            The scope.
     * @param {int} priority
     *            The priority level of the event listener.
     */
    EventDispatcher.prototype.addEventListener = function(type, listener, scope, priority) {
        // default priority is 0 if priority is not assigned or null.
        if (!priority) {
            priority = 0;
        }

        var eventListener = this._findEventListener(type, listener, scope);
        if (eventListener) {
            // already exists
            return;
        }
        eventListener = {
            type : type,
            scope : scope,
            listener : listener,
            priority : priority
        };

        var listeners = this.listeners()[type];
        if (!listeners) {
            this.listeners()[type] = listeners = [eventListener];
        } else {
            // insert the eventListener at correct position according to its priority
            var isAdded = false;
            for (var n = 0; n < listeners.length; ++n) {
                var temp = listeners[n];
                if (priority > temp.priority) {
                    listeners.splice(n, 0, eventListener);
                    isAdded = true;
                    break;
                }
            }

            if (isAdded === false) {
                listeners.push(eventListener);
            }
        }
    };

    /**
     * Removes a listener from the EventDispatcher object.
     * @method sap.viz.vizframe.common.events.EventDispatcher.prototype.removeEventListener
     *
     * @param {String} type
     *            The type of event.
     * @param {Function} listener
     *            The listener function that processes the event.
     * @param {Object} scope
     *            The scope.
     */
    EventDispatcher.prototype.removeEventListener = function(type, listener, scope) {
        var eventListener = this._findEventListener(type, listener, scope);
        if (eventListener) {
            var listeners = this.listeners()[type];
            listeners.splice(listeners.indexOf(eventListener), 1);
        }
    };

    /**
     * Removes the listeners of s specified event type.
     * @method sap.viz.vizframe.common.events.EventDispatcher.prototype.removeEventListeners
     *
     * @param {String} type
     *            The type of event.
     */
    EventDispatcher.prototype.removeEventListeners = function(type) {
        this.listeners()[type] = [];
    };

    /**
     * Removes all the event listeners.
     * @method sap.viz.vizframe.common.events.EventDispatcher.prototype.removeEventListeners
     *
     */
    EventDispatcher.prototype.removeAllEventListeners = function() {
        this._listeners = {};
    };

    /**
     * Checks whether the EventDispatcher object has any listeners registered for a specific type,
     * listener and scope of event.
     *
     * @param {String} type
     *            The type of event
     * @param {Function} listener
     *            The listener function that processes the event
     * @param {Object} scope
     *            scope
     * @returns {Boolean}
     */
    EventDispatcher.prototype.hasEventListener = function(type, listener, scope) {
        var eventListener = this._findEventListener(type, listener, scope);
        return eventListener !== null;
    };

    /**
     * Checks whether the EventDispatcher object has any listeners registered for a specific type
     * (with any listeners or scopes) of event.
     *
     * @param {String} type
     *            The type of event
     * @returns {Boolean}
     */
    EventDispatcher.prototype.hasEventListeners = function(type) {
        var listeners = this.listeners()[type];
        if (listeners) {
            return listeners.length > 0;
        }
        return false;
    };

    /**
     * Dispatch event.
     *
     * @param {Event} event
     *            The event object.
     */
    EventDispatcher.prototype._dispatchEvent = function(event) {
        if (this._enableDispatchEvent === undefined) {
            this._enableDispatchEvent = true;
        }
        if (this._enableDispatchEvent) {
            var type = event.type();
            var listeners = this.listeners()[type];
            if (listeners) {
                var clones = listeners.slice(0);
                for (var n = 0; n < clones.length; ++n) {
                    var listener = clones[n];
                    listener.listener.call(listener.scope, event);
                }
            }
        }
    };

    /**
     * Enable/disable dispatch event.
     * @param value Enable-true, disable-false
     */
    EventDispatcher.prototype.enableDispatchEvent = function(v) {
        if (this._enableDispatchEvent === undefined) {
            this._enableDispatchEvent = true;
        }
        if (arguments.length >= 1) {
            if (utils.isBoolean(v)) {
                this._enableDispatchEvent = v;
            }
            return this;
        } else {
            return this._enableDispatchEvent;
        }
    };
    // -------------------------------------------
    // Private Methods
    // -------------------------------------------

    /**
     * Find the EventListener.
     * @private
     *
     * @param {String} type
     *            The type of event
     * @param {Function} listener
     *            The listener function that processes the event
     * @param {Object} scope
     *            scope
     * @returns {Object|null}
     */
    EventDispatcher.prototype._findEventListener = function(type, listener, scope) {
        var listeners = this.listeners()[type];
        if (!listeners) {
            return null;
        }

        for (var n = 0; n < listeners.length; ++n) {
            var eventListener = listeners[n];
            if (eventListener.listener === listener && eventListener.scope === scope) {
                return eventListener;
            }
        }

        return null;
    };

    /**
     * Get all event listeners.(Read only)
     * @returns All event listeners.
     */
    EventDispatcher.prototype.listeners = function() {
        if (this._listeners === undefined) {
            this._listeners = {};
        }
        return this._listeners;
    };

    return EventDispatcher;
});

// @formatter:off
define('sap/viz/vizframe/common/UIControl',[
    'jquery',
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/common/events/EventDispatcher'
], function($, 
    OOUtil, 
    EventDispatcher) {
// @formatter:on

    /**
     * Base class for UI control.
     * @extends sap.viz.vizframe.common.events.EventDispatcher
     */
    var UIControl = function UIControl(dom/*HTMLElement*/) {
        UIControl.superclass.constructor.apply(this, arguments);
        this.__className = "sap.viz.vizframe.common.UIControl";

        this._dom = dom;
        this._dom$ = $(dom);
    };
    OOUtil.extend(UIControl, EventDispatcher);

    UIControl.prototype.dom$ = function() {
        return this._dom$;
    };
    /**
     * Destroy this control instance by removing all children dom elements and event listeners. The inherited class
     * should override this method to perform clean staff.
     * @method sap.viz.vizframe.common.UIControl.prototype.destroy
     */
    UIControl.prototype.destroy = function() {
        this.removeAllEventListeners();
        if (this._dom$) {
            this._dom$.empty().removeData().off();
        }
        this._dom = null;
        this._dom$ = null;
    };

    return UIControl;
});

// @formatter:off
define('sap/viz/vizframe/frame/viz/VizUtil',[
], function() {
// @formatter:on
    var VizUtil = {};

    VizUtil.mergeOptions = function(destination, source) {
        if (source.data) {
            destination.data = source.data;
        }
        if (source.bindings) {
            destination.bindings = source.bindings;
        }
        if (source.properties) {
            destination.properties = sap.viz.vizservices.__internal__.PropertyService.mergeProperties(destination.type, destination.properties, source.properties);
        }
        if (source.scales) {
            destination.scales = sap.viz.vizservices.__internal__.ScaleService.mergeScales(destination.type, destination.scales, source.scales);
        }
        if (source.customizations) {
            destination.customizations = source.customizations;
        }
        if (source.template) {
            destination.template = source.template;
        }
        if (source.size) {
            destination.size = source.size;
        }
        return destination;
    };

    return VizUtil;
});

// @formatter:off
define('sap/viz/vizframe/frame/viz/VizCache',[
    'sap/viz/vizframe/frame/viz/VizUtil'
], function(
    VizUtil
    ) {
// @formatter:on
    var VizCache = function(options) {
        this.__className = 'sap.viz.vizframe.frame.viz.VizCache';

        this._options = options;
    };

    VizCache.generateFromVizInstance = function(vizInstance) {
        var options = {
            'data' : vizInstance.data(),
            'bindings' : vizInstance.bindings(),
            'properties' : vizInstance.properties({}, {
                'level' : 'user'
            }),
            'scales' : vizInstance.scales([], {
                'level' : 'user'
            }),
            'customizations' : vizInstance.customizations(),
            'template' : vizInstance.template()
        };

        var size = vizInstance.size();
        if (!size.auto) {
            options.size = size;
        }
        return new VizCache(options);
    };

    VizCache.generateFromOptions = function(options) {
        return new VizCache(options);
    };

    VizCache.prototype.options = function(value) {
        if (arguments.length) {
            this._options = value;
        } else {
            return this._options;
        }
    };

    VizCache.prototype.update = function(options) {
        VizUtil.mergeOptions(this._options, options);
    };

    return VizCache;
});

// @formatter:off
define('sap/viz/vizframe/frame/viz/Viz',[
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/common/UIControl',
    'sap/viz/vizframe/frame/viz/VizCache',
    'sap/viz/vizframe/frame/viz/VizUtil'
], function(
    OOUtil,
    UIControl,
    VizCache,
    VizUtil) {
// @formatter:on
    var Viz = function(dom, beforeRenderCallback, afterRenderCallback) {
        Viz.superclass.constructor.apply(this, arguments);
        this.__className = 'sap.viz.vizframe.frame.viz.Viz';

        this._onCaches = [];

        this._type = null;

        this._vizInstance = null;
        this._vizCache = null;

        this._beforeRenderCallback = beforeRenderCallback;
        this._afterRenderCallback = afterRenderCallback;
    };
    OOUtil.extend(Viz, UIControl);

    Viz.prototype.update = function(options) {
        this._beforeRenderCallback();
        try {
            if (!this._vizInstance) {
                this._createVizInstance(options);
            } else {
                if (options.type !== undefined && options.type !== this._type) {
                    this._vizCache = VizCache.generateFromVizInstance(this._vizInstance);
                    this._clearVizInstance();
                    this._createVizInstance(options);
                } else {
                    this._updateVizInstance(options);
                }
            }
        } catch (err) {
            this._afterRenderCallback();
            throw err;
        }
    };

    Viz.prototype.type = function() {
        return this._type;
    };

    Viz.prototype.save = function() {
        if (this._vizInstance) {
            return sap.viz.api.core.exportViz(this._vizInstance);
        } else {
            return {
                'type' : 'vizCache',
                'options' : this._vizCache.options()
            };
        }
    };

    Viz.prototype.load = function(json) {
        this._clearVizInstance();
        if (json.type === 'vizCache') {
            this._vizCache = VizCache.generateFromOptions(json.options);
        } else {
            this._vizCache = null;

            this._beforeRenderCallback();
            try {
                this._vizInstance = sap.viz.api.core.loadViz(json, this._dom);
                this._initVizInstance();
                this._type = json.type;
            } finally {
                this._afterRenderCallback();
            }
        }
    };

    Viz.prototype.destroy = function() {
        this._clearVizInstance();
        this._vizCache = null;

        this._onCaches = null;
    };

    ['data', 'bindings', 'properties', 'scales', 'sharedRuntimeScales', 
    'customizations', 'template'].forEach(function(name) {
        (function(name) {
            Viz.prototype[name] = function() {
                var options = {};
                var result;
                if (arguments.length >= 2) {
                    // Set with option
                    options[name] = arguments[0];
                    options[name + 'Option'] = arguments[1];
                    if (this._vizInstance) {
                        this._beforeRenderCallback();
                        result = this._vizInstance[name](options[name], options[name + 'Option']);
                        this._afterRenderCallback();
                    } else {
                        this._vizCache.update(options);
                        return this._vizCache.options()[name];
                    }
                } else if (arguments.length === 1) {
                    // Set
                    options[name] = arguments[0];
                    // Delegate to update
                    this.update(options);
                    return this;
                } else {
                    // Get
                    if (this._vizInstance) {
                        return this._vizInstance[name]();
                    } else {
                        return this._vizCache.options()[name];
                    }
                }
                // Return
                return result === this._vizInstance ? this : result;

            };
        })(name);
    });

    ['selection', 'propertyZone', 'feedingZone', 'runtimeScales', 'size'].forEach(function(name) {
        (function(name) {
            Viz.prototype[name] = function() {
                if (this._vizInstance) {
                    return this._vizInstance[name].apply(this._vizInstance, arguments);
                } else {
                    return [];
                }
            };
        })(name);
    });

    ['states', 'exportToSVGString'].forEach(function(name) {
        (function(name) {
            Viz.prototype[name] = function() {
                var result;
                if (this._vizInstance) {
                    result = this._vizInstance[name].apply(this._vizInstance, arguments);
                }
                return result === this._vizInstance ? this : result;
            }
        })(name);
    });

    Viz.prototype.on = function(type, callback) {
        if (this._vizInstance) {
            this._vizInstance.on(type, callback);
        }
        this._onCaches.push({
            'type' : type,
            'callback' : callback
        });
    };

    Viz.prototype.off = function(type) {
        if (this._vizInstance) {
            this._vizInstance.off(type);
        }
        this._onCaches = this._onCaches.filter(function(cache) {
            return type !== cache.type;
        });
    };

    Viz.prototype.zoom = function(options) {
        if (this._vizInstance) {
            this._vizInstance.states({
                zoomInOut : options
            });
        }
    };

    Viz.prototype._createVizInstance = function(options) {
        try {
            if (options.type) {
                this._type = options.type;
            }
            // Merge options from exsiting vizCache
            var mergedOptions = null;
            if (this._vizCache) {
                mergedOptions = {
                    'type' : this._type
                };
                VizUtil.mergeOptions(mergedOptions, this._vizCache.options());
                VizUtil.mergeOptions(mergedOptions, options);
            } else {
                mergedOptions = options;
            }
            mergedOptions.container = this._dom;
            // Switch to vizInstance
            this._vizInstance = sap.viz.api.core.createViz(mergedOptions);
            this._initVizInstance();
            this._vizCache = null;
        } catch (err) {
            // Switch to vizCache
            if (this._vizCache) {
                this._vizCache.options(mergedOptions);
            } else {
                this._vizCache = VizCache.generateFromOptions(options);
            }
            this._clearVizInstance();
            throw err;
        }
    };

    Viz.prototype._updateVizInstance = function(options) {
        try {
            if (options.type) {
                this._type = options.type;
            }
            this._vizInstance.update(options);
        } catch (err) {
            // Switch vizInstance to vizCache
            this._vizCache = VizCache.generateFromVizInstance(this._vizInstance);
            this._vizCache.update(options);

            this._clearVizInstance();

            throw err;
        }
    };

    Viz.prototype._initVizInstance = function() {
        // On renderComplete
        this._vizInstance.on('renderComplete', ( function() {
                this._afterRenderCallback();
            }.bind(this)));
        // Release on caches
        this._onCaches.forEach( function(cache) {
            this._vizInstance.on(cache.type, cache.callback);
        }.bind(this));
    };

    Viz.prototype._clearVizInstance = function() {
        if (this._vizInstance) {
            this._vizInstance.destroy();
        }
        this._vizInstance = null;
    };

    return Viz;
});

// @formatter:off
define('sap/viz/vizframe/frame/VizFrameEvent',[
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/common/events/Event'
],
function(OOUtil, Event) {
// @formatter:on
    /**
     * The VizFrame Event.
     */
    var VizFrameEvent = function(type, target, data) {
        VizFrameEvent.superclass.constructor.apply(this, arguments);
        this.__className = "sap.viz.vizframe.common.events.VizFrameEvent";
    };
    OOUtil.extend(VizFrameEvent, Event);

    VizFrameEvent.BEFORE_RENDER = "beforeRender";

    VizFrameEvent.AFTER_RENDER = 'afterRender';

    return VizFrameEvent;
});

// @formatter:off
define('sap/viz/vizframe/frame/VizFrameConfig',[
],
function() {
// @formatter:on
    var VizFrameConfig = {};

    VizFrameConfig.instance = function() {
        return JSON.parse(JSON.stringify({
            'controls' : {
                'morpher' : {
                    'enabled' : true
                }
            }
        }));
    };
    return VizFrameConfig;
});

// @formatter:off
define('sap/viz/vizframe/frame/VizFrameProxy',[
    'jquery',
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/common/events/EventDispatcher'
], function($, OOUtil, EventDispatcher) {
// @formatter:on
    var VizFrameProxy = function VizFrameProxy(vizframe) {
        this._vizframe = vizframe;
    };

    VizFrameProxy.prototype.dataset = function () {
        try {
            return this._vizframe.data.apply(this._vizframe, arguments);
        }
        catch (e) {
            return null;
        }
    };

    VizFrameProxy.prototype.vizType = function () {
        try {
            return this._vizframe.type.apply(this._vizframe, arguments);
        }
        catch (e) {
            return null;
        }
    };

    VizFrameProxy.prototype.feedingZone = function () {
        try {
            return this._vizframe.feedingZone.apply(this._vizframe, arguments);
        }
        catch (e) {
            return null;
        }
    };

    VizFrameProxy.prototype.addEventListener = function () {
        this._vizframe.addEventListener.apply(this._vizframe, arguments);
    };

    VizFrameProxy.prototype.removeEventListener = function () {
        this._vizframe.removeEventListener.apply(this._vizframe, arguments);
    };

    return VizFrameProxy;
});

// @formatter:off
define('sap/viz/vizframe/frame/ControlFactory',[
    'require'
], function(require) {
// @formatter:on
    var ControlFactory = function() {
        this.__className = "sap.viz.vizframe.frame.ControlFactory";
    };

    var clazzMap = {
        'morpher' : 'sap/viz/vizframe/controls/morpher/Morpher'
    };

    ControlFactory.createControl = function(id, dom, config, proxy) {
        var control = null;
        try {
            if (clazzMap[id]) {
                var clazz = require(clazzMap[id]);
                control = new clazz(dom, config, proxy);
            }
        } catch(e) {
        }
        return control;
    };

    return ControlFactory;
});

// @formatter:off
define('sap/viz/vizframe/frame/VizFrame',[
    'jquery',
    'sap/viz/vizframe/common/LanguageLoader',
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/common/utils/utils',
    'sap/viz/vizframe/common/events/Event',
    'sap/viz/vizframe/common/events/EventDispatcher',
    'sap/viz/vizframe/frame/viz/Viz',
    'sap/viz/vizframe/frame/VizFrameEvent',
    'sap/viz/vizframe/frame/VizFrameConfig',
    'sap/viz/vizframe/frame/VizFrameProxy',
    'sap/viz/vizframe/frame/ControlFactory',
    'exports'
], function($,
    LanguageLoader,
    OOUtil,
    utils, 
    Event,
    EventDispatcher,
    Viz,
    VizFrameEvent,
    VizFrameConfig,
    VizFrameProxy, 
    ControlFactory
    ) {
// @formatter:on
    var VizFrame = function(options, config) {
        VizFrame.superclass.constructor.call(this);
        this.__className = 'sap.viz.vizframe.frame.VizFrame';

        this._dom = options.container, this._dom$ = $(this._dom);
        this._config = $.extend(true, VizFrameConfig.instance(), config);
        this._destroyed = false;

        // Build dom tree
        this._vizInstanceContainer = document.createElement('div');
        $(this._vizInstanceContainer).appendTo(this._dom$).css({
            'width' : '100%',
            'height' : '100%'
        });
        this._viz = new Viz(this._vizInstanceContainer, function() {
            this._dispatchEvent(new VizFrameEvent(VizFrameEvent.BEFORE_RENDER, this));
        }.bind(this), function() {
            this._dispatchEvent(new VizFrameEvent(VizFrameEvent.AFTER_RENDER, this));
        }.bind(this));
        this._controlsContainer = document.createElement('div');
        $(this._controlsContainer).appendTo(this._dom$);

        // Create controls
        this._controls = {};
        var id = null;
        for (id in this._config.controls) {
            if (this._config.controls[id].enabled !== false) {
                try {
                    this._enableControl(id, this._config.controls[id].config);
                } catch (e) {
                    if (config && config.controls && config.controls[id] &&
                        config.controls[id].hasOwnProperty("enabled") &&
                        config.controls[id].enabled !== false) {
                        throw e;
                    }
                }
            }
        }
        // Create viz
        try {
            this._viz.update(options);
        } catch (err) {
            if (this._config.throwError === true) {
                throw err;
            }
        }
    };

    OOUtil.extend(VizFrame, EventDispatcher);

    // @formatter:off
    ['data', 'bindings', 'properties', 'scales', 'sharedRuntimeScales', 'runtimeScales', 'customizations',
     'template', 'exportToSVGString', "states", 'size', 'update', 'selection', 'propertyZone', 'feedingZone', 'on', 'off'].forEach(function(name) {
    // @formatter:on
        (function(name) {
            VizFrame.prototype[name] = function() {
                this._validateLifecycle();

                var result = this._viz[name].apply(this._viz, arguments);
                return result === this._viz ? this : result;
            };
        })(name);
    });

    VizFrame.prototype.getControl = function(id) {
        return this._controls[id];
    };

    VizFrame.prototype.enableControl = function(id, config) {
        this._validateLifecycle();
        return this._enableControl.apply(this, arguments);
    };

    VizFrame.prototype.disableControl = function(id) {
        this._validateLifecycle();
        return this._disableControl.apply(this, arguments);
    };

    VizFrame.prototype.destroy = function() {
        this._validateLifecycle();
        // Destroy controls
        for (var id in this._controls) {
            this._disableControl(id);
        }
        // Destroy viz instance
        if (this._viz) {
            this._viz.destroy();
        }
        // Destroy dom
        this.removeAllEventListeners();
        if (this._dom$) {
            this._dom$.empty().removeData().off();
        }
        this._dom = null;
        this._dom$ = null;
        this._destroyed = true;
    };

    VizFrame.prototype.type = function(type) {
        this._validateLifecycle();
        if (arguments.length > 0) {
            this.update({
                'type' : type
            });
            return this;
        } else {
            return this._viz.type();
        }
    };

    VizFrame.prototype.save = function() {
        this._validateLifecycle();
        return this._viz.save();
    };

    VizFrame.prototype.load = function(json) {
        this._validateLifecycle();
        this._viz.load(json);
    };
    
    VizFrame.prototype.zoom = function(options) {
        this._viz.zoom(options);
    };

    VizFrame.prototype._validateLifecycle = function(options) {
        if (this._destroyed) {
            throw utils.substitute(sap.viz.extapi.env.Language.getResourceString('VIZ_FRAME_DESTORYED'));
        }
    };

    VizFrame.prototype._enableControl = function(id, config) {
        // Check already enabled
        if (this.getControl(id)) {
            return;
        }
        // Allocate dom, Create control, connect control
        var dom = this._attachControl(id);
        var control = ControlFactory.createControl(id, dom, config, new VizFrameProxy(this));
        if (control) {
            if (id === 'morpher') {
                control.bindVizInstanceContainer(this._vizInstanceContainer);
            }
            this._controls[id] = control;
        } else {
            throw utils.substitute(sap.viz.extapi.env.Language.getResourceString('VIZ_FRAME_CONTROL_LOAD_ERROR'), id);
        }
    };

    VizFrame.prototype._disableControl = function(id) {
        var control = this._controls[id];
        if (!control) {
            return;
        }
        if (control.dom$()) {
            control.dom$().detach();
        }
        control.destroy();
        delete this._controls[id];
    };

    VizFrame.prototype._attachControl = function(id) {
        var dom$ = null;
        if (id === 'morpher') {
            dom$ = $(document.createElement('div')).appendTo(this._controlsContainer);
            dom$.css({
                'position' : 'absolute',
                'left' : '0px',
                'top' : '0px'
            });
        }
        return dom$ ? dom$.get(0) : null;
    };

    return VizFrame;
});

// @formatter:off
define('sap/viz/vizframe/api/VizFrame',[
    "sap/viz/vizframe/api/APIUtil",
    "sap/viz/vizframe/frame/VizFrame",
    "require",
], function(APIUtil, VizFrame) {
// @formatter:on

    /**
     * VizFrame wraps Info Chart from factory consumption mode to be standard UI control with full lifecycle support.<br/>
     * VizFrame provides same Info Chart Consumption API (dataset, bindings, scales, properties, customizations and events...) with some extra API of built-in controls.<br/>
     * VizFrame provides some optional built-in visualization specific controls like Morpher, and expose extra API via extending Consumption API. Consumer application can decide to enable or disable the built-in controls.<br/><ul>
     * @class sap.viz.vizframe.VizFrame
     * @param {Object} options
     * <pre>
     * {
     *   "type": String, // Refer to the Chart Property documentation for all supported chart types.
     *   "properties": Object, // (Optional) Refer to the Chart Property documentation for all supported options for each chart type.
     *   "size": Object, // (Optional) Sets the width and height of the chart. For example, {width: 100, height: 200}. If the size is not supplied, the size of the rendered chart uses the size of the HTML element referred to in 'container'.
     *   "container": HTMLDivElement, // A reference to the containing HTML element in the HTML page.
     *   "data": {@link sap.viz.api.data.FlatTableDataset}, // Set the data of the chart.
     *   "bindings": Array, // Assigns data binding information.
     *   "events": Object, // (Optional) Sets the customized function when a specified event is called. The schema of the Object is {'<event name>': {fn: function(){}, scope: this}}. Refer to the Chart Property documentation for all supported events for each chart. For example: {'initialized':{ fn: function(){return;}, scope: this}}.
     *   "template": String, // (Optional) Sets the template id for this chart, if invalid, the current global template will be used.
     *   "scales": Array // Sets the scales of the chart.
     *   "customizations": Object // Sets the customizations of the chart.
     * }
     * </pre>
     * @param {Object} [config]
     *      A configuration options for initial declarative vizframe setup.
     *      <pre>
     *      {
     *          controls : {
     *              morpher : {
     *                  enabled : true
     *              }
     *          }
     *      }
     *      </pre>
     * @return {Object} {@link sap.viz.vizframe.VizFrame} VizFrame itself.<br/>
     * Sample code:<br/>
     * <pre>
     * var options = {
     *     type : type, 
     *     container : div, 
     *     data : dataset, 
     *     bindings : bindings
     * };
     * var vizFrame = new VizFrame(options);
     * </pre>
     */
    
    var VizFrameAPI = sap.viz.vizframe.VizFrame = function(div, uiConfig){
        this.__internal_reference_VizFrame__ = new VizFrame(div, uiConfig);
        this.__internal_reference_VizFrame__.__wrapper__ = this;
    };
    
    APIUtil.setWrapping("sap.viz.vizframe.VizFrame", VizFrameAPI);
   
    APIUtil.buildProxyMethods(VizFrameAPI.prototype, "__internal_reference_VizFrame__",
        ["enableControl",
        "disableControl",
        "destroy",
        "on",
        "off",
        "type",
        "update",
        "data",
        "bindings",
        "properties",
        "scales",
        "customizations",
        "template",
        "selection",
        "propertyZone",
        "feedingZone",
        "size",
        "save",
        "load",
        "exportToSVGString",
        //sharedRuntimeScales, runtimeScales, states, zoom are internal apis
        "sharedRuntimeScales",
        "runtimeScales",
        "states",
        "zoom" 
        ].join(" "));

    /**
     * Get/Set data binding information to charts. For more details, see "bindings" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.bindings
     * @param {Array|null} [binding]
     * @return {Array}
     * If getting the binding, it returns bindings array;
     * if setting the binding, it returns instance of VizFrame.
     */

    /**
     * Get/Set chart data. For more details, see "data" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.data
     * @param {sap.viz.api.data.FlatTableDataset} [value]
     * @return {sap.viz.api.data.FlatTableDataset}
     */

    /**
     * Destroy VizFrame.
     * @method sap.viz.vizframe.VizFrame.prototype.destroy
     */

    /**
     * Disable control on VizFrame.
     * @method sap.viz.vizframe.VizFrame.prototype.disableControl
     * @param {String} id
     *       Built-in control's id.
     * @example <caption>Sample Code:</caption>
     * vizFrame.disableControl("morpher");//Disable "morpher" control from VizFrame.
     */

    /**
     * Enable control on VizFrame.
     * @method sap.viz.vizframe.VizFrame.prototype.enableControl
     * @param {String} id
     *       Built-in control's id.
     * @param {Object} [config]
     *       Configuration for the control.
     * @example <caption>Sample Code:</caption>
     * var vizFrame = new VizFrame(...);
     * vizFrame.enableControl("morpher");//Enable "morpher" control to VizFrame.
     */

    /**
     * Get current feeding zone information. For more details, see "feedingZone" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.feedingZone
     * @return {Array} Feeding information group by the visualization element.
     */

    /**
     * Deserialize VizFrame from JSON object.<br/>
     * @method sap.viz.vizframe.VizFrame.prototype.load
     * @param {JSON} valueJSON
     * @example <caption>Sample Code:</caption>
     *  var vizFrameA = new VizFrame(...);
     *  var jsonA = vizFrameA.save();
     *  var vizFrameB = new VizFrame(...);
     *  vizFrameB.load(jsonA);              
     */

    /**
     * Remove event listener on viz instance. For more details, see "off" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.off
     * @param {String} evtType
     * @return {Object} {@link sap.viz.vizframe.VizFrame} VizFrame itself.
     */

    /**
     * Add event listener on viz instance. For more details, see "on" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.on
     * @param {String} evtType
     * @param {Function} callback
     * @return {Object} {@link sap.viz.vizframe.VizFrame} VizFrame itself.
     */


    /**
     * Get/Set chart properties. For more details, see "properties" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.properties
     * @param {Object} props Refers to Chart Property
     * @return {Object} {@link sap.viz.vizframe.VizFrame} VizFrame itself.
     */

    /**
     * Get current property zone information. For more details, see "propertyZone" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.propertyZone
     * @return {Array} Property information group by visualization element.
     */

    /**
     * Serialize VizFrame to a JSON object. The serialization includes viz instance(type, data, properties, bindings, size, scales, customizations and template).<br/>
     * @method sap.viz.vizframe.VizFrame.prototype.save
     * @return {JSON}
     * @example <caption>Sample Code:</caption>
     * var vizFrame = new VizFrame(...);
     * var vizFrameJSON = vizFrame.save();
     */

    /**
     * Get/Set scales. For more details, see "scales" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.scales
     * @param {Array} [scales] Scale settings.
     * @return {Array} Scale settings of current VizFrame.
     */
    
    /**
     * Get/Set customizations. For more details, see "customizations" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.customizations
     * @param {Object} [customizations] Customizations setting with id and customOverlayProperties.
     * @return {Object} Customizations setting of current VizFrame.
     */

    /**
     * Get/Set selected data points. For more details, see "selection" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.selection
     * @param {Array}  [selectionPoint] Array of Objects with either data or ctx should be set to points.
     * @param {Object} [options] Selection options.
     * @returns {Array|Boolean}
     */

    /**
     * Get/Set chart size. For more details, see "size" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.size
     * @param {Object} [value]
     *     {"width" : Number, "height" : Number, ["auto" : Boolean]} | {"auto" : Boolean}
     * @return {Object} Size of VizFrame.
     */

    /**
     * Get/Set VizFrame templateId. For more details, see "template" api on sap.viz.api.core.VizInstance.
     * @method sap.viz.vizframe.VizFrame.prototype.template
     * @param {string} [value]
     * @return {string|sap.viz.vizframe.VizFrame}.
    */

    /**
     * Get/Set chart type.
     * @method sap.viz.vizframe.VizFrame.prototype.type
     * @param {String} [value]
     *      Chart type
     * @return {String|Object}
     * If getting the type, it returns chart type;
     * if setting the type, it returns instance of VizFrame.
     * @example <caption>Sample Code:</caption>
     * var vizFrame = new VizFrame(...);
     * vizFrame.type("info/line");// Set VizFrame type.
     * vizFrame.type();// Get VizFrame type.
     */

    /**
     * Update various options in one API. And VizFrame provide another API type() to update chart type. 
     * @method sap.viz.vizframe.VizFrame.prototype.update
     * @param {Object} updates
     * <pre>
     * {
     *     "data": {@link sap.viz.api.data.FlatTableDataset},
     *     "bindings": Array, // Assigns data binding information.
     *     "properties": Object, // Refer to the Chart Property documentation for all supported options for each chart type.
     *     "scales" : Array, // Set the scales of the chart.
     *     "customizations" : Object, // Set the customizations of the chart.
     *     "size" : Object, // Set the size of the chart.
     *     "type" : String, // Set the type of the chart.
     *     "template" : String // Sets the new template id for this chart, if invalid, the current global template will be used.
     * }
     * </pre>
     * @return {Object} {@link sap.viz.vizframe.VizFrame} VizFrame itself.
     */    

    /**
     * Export the current viz as SVG String.
     * The viz is ready to be exported to svg ONLY after the initialization is finished.
     * Any attempt to export to svg before that will result in an empty svg string.
     * @method sap.viz.vizframe.VizFrame.prototype.exportToSVGString
     * @param {Object} [option] 
     * <pre>
     * {
     *     width: Number - the exported svg will be scaled to the specific width.
     *     height: Number - the exported svg will be scaled to the specific height.
     *     hideTitleLegend: Boolean - flag to indicate if the exported svg includes the original title and legend.
     *     hideAxis: Boolean - flag to indicate if the exported svg includes the original axis.
     * }
     * </pre>
     * @return {Object} the SVG Object of the current viz or empty svg if error occurs.
     */

     
    return VizFrameAPI;
});

// @formatter:off
define('sap/viz/vizframe/controls/ControlBase',[
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/common/events/EventDispatcher',
    'sap/viz/vizframe/common/UIControl'
], function(OOUtil, EventDispatcher, UIControl) {
// @formatter:on

    /**
     * Base class for Viz UI control. Each Viz UI control should inherit from ControlBase.
     * @param {HTMLElement} dom
     *                      The dom element to host the control.
     * @param {JSON} [config]
     *               Configuration for the control.
     * @param {VizFrameProxy} [proxy]
     *               Proxy for the vizframe.
     */
    var ControlBase = function ControlBase(dom, config, proxy) {
        ControlBase.superclass.constructor.call(this, dom, config);
        this.__className = "sap.viz.vizframe.common.ControlBase";

        this._proxy = proxy;
    };

    OOUtil.extend(ControlBase, UIControl);

    return ControlBase;
});

define('sap/viz/vizframe/controls/morpher/vo/VizShapesHolder',[
    'jquery'],
function($) {
    /**
     * VizShapes VO
     */
    var VizShapesHolder = function() {
        this.plotShapes = [];
        //[sap.viz.morph.vo.VizShape]
        this.plotLines = [];
        //[sap.viz.morph.vo.VizShape]
        this.xAxisLabels = [];
        //[sap.viz.morph.vo.VizShape]
        this.xAxis2Labels = [];
        //[sap.viz.morph.vo.VizShape]
        this.yAxisLabels = [];
        //[sap.viz.morph.vo.VizShape]
        this.yAxis2Labels = [];
        //[sap.viz.morph.vo.VizShape]
        this.background = [];
        //[sap.viz.morph.vo.VizShape]
        this.plotBackgrounds = [];
        //[sap.viz.morph.vo.VizShape]
    };
    
    VizShapesHolder.prototype.empty = function() {
        this.plotShapes = [];
        this.plotLines = [];
        this.xAxisLabels = [];
        this.xAxis2Labels = [];
        this.yAxisLabels = [];
        this.yAxis2Labels = [];
        this.background = [];
        this.plotBackgrounds = [];
    };
    
    /**
     * convert to a single array with all the shapes
     *
     * @return {[sap.viz.morph.vo.VizShape]}
     */
    VizShapesHolder.prototype.allByOrder = function() {
        // defined the drawing order, upper is deeper
        return [].concat(this.background,
                         this.plotBackgrounds,
                         this.xAxis2Labels,
                         this.xAxisLabels, 
                         this.yAxis2Labels,
                         this.yAxisLabels, 
                         this.plotLines,
                         this.plotShapes 
                         );
    };
    
    VizShapesHolder.prototype.toShapesByPlotArea = function(hasAnimationLayer) {
        var allByPlotArea = {};
        if (hasAnimationLayer && this.background.length > 0) {
            this.background.forEach(function(background) {
                $(background.display).attr('visibility', 'hidden');
                $(background.display).attr('class', function(index, classNames) {
                    return classNames + ' v-main-background';
                });
            });
        } 
        allByPlotArea['insidePlotArea'] = [].concat(this.plotLines, this.plotShapes);
        allByPlotArea['outsidePlotArea'] = [].concat(this.background, this.plotBackgrounds, this.xAxis2Labels, this.xAxisLabels, this.yAxis2Labels, this.yAxisLabels);
        return allByPlotArea;
    };
    
    VizShapesHolder.prototype.toShapesBySvgType = function() {
        var allByType = {};
        var allShapes = [];
        allByType["all"] = allShapes;
        var allVizShapes = this.allByOrder();
        for(var i = 0; i < allVizShapes.length; i++) {
            var vizShape = allVizShapes[i];
            if(vizShape.to) {
                var type = vizShape.to.localName;
                var typeShapes = allByType[type];
                if(!typeShapes) {
                    allByType[type] = typeShapes = [];
                }
                typeShapes.push(vizShape);
                allShapes.push(vizShape);
            }
        }
        return allByType;
    };
    return VizShapesHolder;
});

define('sap/viz/vizframe/common/constants/ChartConst',[],function() {
     /**
     * Chart Types.
     */
    var ChartConst = {};

    // Chart types
    ChartConst.TYPE_COLUMN = "info/column";

    /**
     * Stacked column chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_STACKED_COLUMN = "info/stacked_column";

    /**
     * Dual column chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_COLUMN = "info/dual_column";

    /**
     * Time Line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_TIMESERIES_LINE = "info/timeseries_line";

    /**
     * Line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_LINE = "info/line";

     /**
     * Area chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_AREA = "info/area";

     /**
     * Combination chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_COMBINATION = "info/combination";

     /**
     * Dual line chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_LINE = "info/dual_line";

     /**
     * Dual combination chart, the dataset is sap.viz.api.data.FlattableDataset.
     */
    ChartConst.TYPE_DUAL_COMBINATION = "info/dual_combination";


    /**
     * Pie chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_PIE = "info/pie";

     /**
     * Donut chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DONUT = "info/donut";

     /**
     * Scatter chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_SCATTER = "info/scatter";

     /**
     * Bubble chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_BUBBLE = "info/bubble";

     /**
     * Heatmap chart, the dataset is sap.viz.api.data.FlattableDataset.
     */
    ChartConst.TYPE_HEATMAP = "info/heatmap";

    ChartConst.TYPE_TREEMAP = "info/treemap";

     /**
     * Tag Cloud chart, the dataset is sap.viz.api.data.FlattableDataset.
     */
    ChartConst.TYPE_TAG_CLOUD = "info/tagcloud";

    /**
     * Number chart, the dataset is sap.viz.api.data.FlattableDataset.
     */
    ChartConst.TYPE_NUMBER = 'info/number';

    // Peer charts
    /**
     * Bar chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_BAR = "info/bar";

    /**
     * Stacked Bar chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_STACKED_BAR = "info/stacked_bar";
    ChartConst.TYPE_100_STACKED_COLUMN = "info/100_stacked_column";
    ChartConst.TYPE_100_STACKED_BAR = "info/100_stacked_bar";

    /**
     * Dual Bar chart, the dataset is sap.viz.api.data.FlatTableDataset.
     */
    ChartConst.TYPE_DUAL_BAR = "info/dual_bar";

    ChartConst.TYPE_HORIZONTAL_LINE = "info/horizontal_line";

    ChartConst.TYPE_HORIZONTAL_AREA = "info/horizontal_area";
    ChartConst.TYPE_100_AREA = "info/100_area";
    ChartConst.TYPE_100_HORIZONTAL_AREA = "info/100_horizontal_area";

    ChartConst.TYPE_HORIZONTAL_COMBINATION = "info/horizontal_combination";

    ChartConst.TYPE_DUAL_HORIZONTAL_LINE = "info/dual_horizontal_line";

    ChartConst.TYPE_DUAL_HORIZONTAL_COMBINATION = "info/dual_horizontal_combination";

    /**
     * @memberof sap.viz.controls.common.constants.ChartConst
     * @member TYPE_MEKKO
     * @static
     */

    ChartConst.TYPE_MEKKO = "info/mekko";
    ChartConst.TYPE_100_MEKKO = "info/100_mekko";
    ChartConst.TYPE_HORIZONTAL_MEKKO = "info/horizontal_mekko";
    ChartConst.TYPE_100_HORIZONTAL_MEKKO = "info/100_horizontal_mekko";

    //Trellis chart
    ChartConst.TYPE_TRELLIS_BAR = "info/trellis_bar";
    ChartConst.TYPE_TRELLIS_LINE = "info/trellis_line";
    ChartConst.TYPE_TRELLIS_HORIZONTAL_LINE = "info/trellis_horizontal_line";
    ChartConst.TYPE_TRELLIS_COLUMN = "info/trellis_column";
    ChartConst.TYPE_TRELLIS_DUAL_COLUMN = "info/trellis_dual_column";
    ChartConst.TYPE_TRELLIS_DUAL_LINE = "info/trellis_dual_line";
    ChartConst.TYPE_TRELLIS_DUAL_HORIZONTAL_LINE = "info/trellis_dual_horizontal_line";
    ChartConst.TYPE_TRELLIS_DUAL_BAR = "info/trellis_dual_bar";
    ChartConst.TYPE_TRELLIS_SCATTER = "info/trellis_scatter";
    ChartConst.TYPE_TRELLIS_BUBBLE = "info/trellis_bubble";
    ChartConst.TYPE_TRELLIS_100_STACKED_COLUMN = "info/trellis_100_stacked_column";
    ChartConst.TYPE_TRELLIS_STACKED_COLUMN = "info/trellis_stacked_column";
    ChartConst.TYPE_TRELLIS_STACKED_BAR = "info/trellis_stacked_bar";
    ChartConst.TYPE_TRELLIS_100_STACKED_BAR = "info/trellis_100_stacked_bar";
    //ChartConst.TYPE_TRELLIS_COMBINATION = "info/trellis_combination";
    //ChartConst.TYPE_TRELLIS_HORIZONTAL_COMBINATION = "info/trellis_horizontal_combination";
    ChartConst.TYPE_TRELLIS_PIE = "info/trellis_pie";
    ChartConst.TYPE_TRELLIS_DONUT = "info/trellis_donut";
    ChartConst.TYPE_TRELLIS_AREA = "info/trellis_area";
    ChartConst.TYPE_TRELLIS_HORIZONTAL_AREA = "info/trellis_horizontal_area";
    ChartConst.TYPE_TRELLIS_100_AREA = "info/trellis_100_area";
    ChartConst.TYPE_TRELLIS_100_HORIZONTAL_AREA = "info/trellis_100_horizontal_area";

    return ChartConst;
});

define('sap/viz/vizframe/controls/morpher/constant/MorphConst',[
    'sap/viz/vizframe/common/constants/ChartConst'], 
function(ChartConst) {

    var MorphConst = {};

    // Shape Data Key
    MorphConst.SHAPE_DATA = "data";
    
    // Morphing Data Key
    MorphConst.MORPHING_DATA = "morph-data";

    MorphConst.SHAPE_GLOBAL_TRANSLATE_X = "translateX";
    MorphConst.SHAPE_GLOBAL_TRANSLATE_Y = "translateY";

    MorphConst.MORPHER_DISABLE_COLOR = "MORPHER_DISABLE_COLOR";
    MorphConst.MORPHER_DISABLE_LINE = "MORPHER_DISABLE_LINE";
    MorphConst.MORPHER_DISABLE_PATH = "MORPHER_DISABLE_PATH";
    MorphConst.MORPHER_DISABLE_RECT = "MORPHER_DISABLE_RECT";
    MorphConst.MORPHER_DISABLE_TEXT = "MORPHER_DISABLE_TEXT";
    MorphConst.MORPHER_DISABLE_TRANSFORM = "MORPHER_DISABLE_TRANSFORM";

    // Chart Horizontal - Vertical Mapping
    var _CHART_VERTICAL_HORIZONTAL_MAPPING = {};
    var mapChartVH = function(vType, hType) {
        _CHART_VERTICAL_HORIZONTAL_MAPPING[vType] = hType;
    };
    mapChartVH(ChartConst.TYPE_COLUMN, ChartConst.TYPE_BAR);
    mapChartVH(ChartConst.TYPE_TRELLIS_COLUMN, ChartConst.TYPE_TRELLIS_BAR);
    mapChartVH(ChartConst.TYPE_STACKED_COLUMN, ChartConst.TYPE_STACKED_BAR);
    mapChartVH(ChartConst.TYPE_TRELLIS_STACKED_COLUMN, ChartConst.TYPE_TRELLIS_STACKED_BAR);
    mapChartVH(ChartConst.TYPE_100_STACKED_COLUMN, ChartConst.TYPE_100_STACKED_BAR);
    mapChartVH(ChartConst.TYPE_TRELLIS_100_STACKED_COLUMN, ChartConst.TYPE_TRELLIS_100_STACKED_BAR);
    mapChartVH(ChartConst.TYPE_DUAL_COLUMN, ChartConst.TYPE_DUAL_BAR);
    mapChartVH(ChartConst.TYPE_TRELLIS_DUAL_COLUMN, ChartConst.TYPE_TRELLIS_DUAL_BAR);
    mapChartVH(ChartConst.TYPE_LINE, ChartConst.TYPE_HORIZONTAL_LINE);
    mapChartVH(ChartConst.TYPE_TRELLIS_LINE, ChartConst.TYPE_TRELLIS_HORIZONTAL_LINE);
    mapChartVH(ChartConst.TYPE_DUAL_LINE, ChartConst.TYPE_DUAL_HORIZONTAL_LINE);
    mapChartVH(ChartConst.TYPE_TRELLIS_DUAL_LINE, ChartConst.TYPE_TRELLIS_DUAL_HORIZONTAL_LINE);
    mapChartVH(ChartConst.TYPE_AREA, ChartConst.TYPE_HORIZONTAL_AREA);
    mapChartVH(ChartConst.TYPE_TRELLIS_AREA, ChartConst.TYPE_TRELLIS_HORIZONTAL_AREA);
    mapChartVH(ChartConst.TYPE_100_AREA, ChartConst.TYPE_100_HORIZONTAL_AREA);
    mapChartVH(ChartConst.TYPE_TRELLIS_100_AREA, ChartConst.TYPE_TRELLIS_100_HORIZONTAL_AREA);
    mapChartVH(ChartConst.TYPE_COMBINATION, ChartConst.TYPE_HORIZONTAL_COMBINATION);
    mapChartVH(ChartConst.TYPE_DUAL_COMBINATION, ChartConst.TYPE_DUAL_HORIZONTAL_COMBINATION);
    
    /**
     *
     * @param {String} type1
     * @param {String} type2
     *
     * @return {Boolean}
     */
    MorphConst.IS_V_H_MAP = function(type1, type2) {
        if(_CHART_VERTICAL_HORIZONTAL_MAPPING[type1] && _CHART_VERTICAL_HORIZONTAL_MAPPING[type1] === type2) {
            return true;
        }
        if(_CHART_VERTICAL_HORIZONTAL_MAPPING[type2] && _CHART_VERTICAL_HORIZONTAL_MAPPING[type2] === type1) {
            return true;
        }
        return false;
    };
    return MorphConst;
});

define('sap/viz/vizframe/controls/morpher/utils/MorphUtil',['jquery'], function($) {
    
    var MorphUtil = {};
    
    MorphUtil.changeDuplicatedId = function(div) {
        var clipPath = $(div).find('clipPath');
        if (clipPath && clipPath.length) {
            clipPath.each(function(i, clippath) {
                var originalId = $(clippath).attr('id');
                // add '_morphing' ending to each clipPath id to construct a different id
                div.innerHTML = div.innerHTML.replace(new RegExp(originalId, 'g'), originalId + '_morphing');
            });
        }
        
        var radialGradient = $(div).find('radialGradient');
        if (radialGradient && radialGradient.length) {
            radialGradient.each(function(i, radialgradient) {
                var originalId = $(radialgradient).attr('id');
                // add '_morphing' ending to each radialGradient id to construct a different id
                div.innerHTML = div.innerHTML.replace(new RegExp(originalId, 'g'), originalId + '_morphing');
            });
        }
        
        var linearGradient = $(div).find('linearGradient');
        if (linearGradient && linearGradient.length) {
            linearGradient.each(function(i, lineargradient) {
                var originalId = $(lineargradient).attr('id');
                // add '_morphing' ending to each linearGradient id to construct a different id
                div.innerHTML = div.innerHTML.replace(new RegExp(originalId, 'g'), originalId + '_morphing');
            });
        }
        
        return div;
    };
    
    return MorphUtil;
});

define('sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata',[],function() {
    var SVGShapeMetadata = {};

    var SHAPE_MP_METADATA = "__vizmp__";

    SVGShapeMetadata.set = function(shapeEl, name, value) {
        if(!shapeEl[SHAPE_MP_METADATA]) {
            shapeEl[SHAPE_MP_METADATA] = {};
        }
        shapeEl[SHAPE_MP_METADATA][name] = value;
    };

    SVGShapeMetadata.get = function(shapeEl, name) {
        if(shapeEl && shapeEl[SHAPE_MP_METADATA] !== null && shapeEl[SHAPE_MP_METADATA] !== undefined) {
            return shapeEl[SHAPE_MP_METADATA][name];
        }
        return undefined;
    };

    SVGShapeMetadata.clone = function(newShapeEl, oldShapeEl) {
        newShapeEl[SHAPE_MP_METADATA] = oldShapeEl[SHAPE_MP_METADATA];
        // TODO use deep clone?
        return newShapeEl;
    };
    return SVGShapeMetadata;
});

define('sap/viz/vizframe/controls/morpher/vo/VizShape',[],function() {
    /**
     * VizShape VO
     */
    var VizShape = function(from, to, display) {
        this.from = from;
        this.to = to;
        this.display = display;
    };
    return VizShape;
});

define('sap/viz/vizframe/controls/morpher/viz/MpShapesCapturer',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/constant/MorphConst',
    'sap/viz/vizframe/controls/morpher/utils/MorphUtil',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata',
    'sap/viz/vizframe/controls/morpher/vo/VizShape',
    'sap/viz/vizframe/controls/morpher/vo/VizShapesHolder'],
// @formatter:on
function(MorphConst, MorphUtil, SVGShapeMetadata, VizShape, VizShapesHolder) {
    var ChartTypeUtil = {
        'isInfoChart' : function() {
            return true;
        }
    };
    
    var MpShapesCapturer = {};
    /**
     * @param {HTMLDivElement} vizDiv
     * @return {sap.viz.morph.vo.VizShapesHolder} cloned mp shapes added as "to shape" in a flaten graphic structure
     */
    MpShapesCapturer.getShapes = function(vizDiv, vizType) {
        var vizShapesHolder = new VizShapesHolder();
        // the root svg
        var vizRootSvg = d3.select(vizDiv).select(".v-m-root");
        // except title and legend
        var vizMainArea = d3.select(vizDiv).select(".v-m-main");

        var rootSvgNode = vizRootSvg.node();

        if(rootSvgNode &&
                // Make sure the svg node is visible (not display:none or under a display:none parent),
                // otherwise, the getScreenCTM function will throw error in IE9.
                rootSvgNode.clientHeight > 0 && rootSvgNode.clientWidth > 0 &&
                // check for only SVG node
                rootSvgNode.getScreenCTM !== undefined) {
            // calculate gradient color
            var vizGradientColors = parseGradientColors(vizRootSvg);
            // calculate x y position
            var vizRootCTM = rootSvgNode.getScreenCTM();

            vizShapesHolder.plotShapes   = captureShapes(vizRootSvg,   ".v-m-root .v-morphable-datapoint", vizRootCTM, vizGradientColors, vizType);
            vizShapesHolder.plotLines    = captureShapes(vizRootSvg,   ".v-m-root .v-morphable-line, " + 
                                                                        ".v-m-root .v-morphable-areabg", vizRootCTM, vizGradientColors);
            vizShapesHolder.xAxisLabels  = captureShapes(vizMainArea,   ".v-m-xAxis .v-morphable-label", vizRootCTM);
            vizShapesHolder.xAxis2Labels = captureShapes(vizMainArea,   ".v-m-xAxis2 .v-morphable-label", vizRootCTM);
            vizShapesHolder.yAxisLabels  = captureShapes(vizMainArea,   ".v-m-yAxis .v-morphable-label", vizRootCTM);
            vizShapesHolder.yAxis2Labels = captureShapes(vizMainArea,   ".v-m-yAxis2 .v-morphable-label", vizRootCTM);
            //Divide backgound into whole chart background and plot backgrounds.
            vizShapesHolder.background = captureShapes(vizRootSvg, ".v-m-background .v-morphable-background", vizRootCTM);
            vizShapesHolder.plotBackgrounds  = captureShapes(vizRootSvg, ".v-m-plot .v-morphable-background", vizRootCTM);
            
            var backgrounds = vizShapesHolder.background.concat(vizShapesHolder.plotBackgrounds);
            // disable size morphing for background
            for(var i = 0; i < backgrounds.length; i++) {
                var vizShape = backgrounds[i];
                SVGShapeMetadata.set(vizShape.to, MorphConst.MORPHER_DISABLE_RECT, true);
            }
            // TODO: disable too complex and too many path morphing
        }

        return vizShapesHolder;
    };

    /**
     * @param {D3Selection} d3Selection
     * @param {String} shapeSelector
     * @param {Matrix} offsetCTM
     *
     * @return [{sap.viz.morph.vo.VizShape}] each VizShape has .to property keep the shape SVGElement
     */
    var captureShapes = function(d3Selection, shapeSelector, offsetCTM, vizGradientColors, vizType) {
        var shapes = d3Selection.selectAll(shapeSelector);
        var clonedShapes = [];
        shapes.each(function(d, i) {
            // clone the shape
            var shape = this.cloneNode(true);
            shape = MorphUtil.changeDuplicatedId(shape);
            if (String(this.getAttribute("class")).indexOf("v-morphable-datapoint") >= 0) {
                if (vizType) {
                    if (ChartTypeUtil.isInfoChart(vizType)) {
                        shape = shape.firstChild ? shape.firstChild.cloneNode(true) : shape;
                    }
                }
            }
            // keep d3 element's metadata
            SVGShapeMetadata.set( shape, MorphConst.SHAPE_DATA, this.__data__ || {} );
            // process shape state for different viz types
            processShape(shape, this, vizGradientColors);
            // flaten shape to one single SVG
            alignPosition(this, offsetCTM, shape);
            // new captured shape is always "to shape"
            clonedShapes.push(new VizShape(null, shape, null));
        });
        return clonedShapes;
    };
    /**
     * // TODO handle more gradient cases introduced by Viz side to get "avg" color for morphing
     *
     * @param {SVGElement} vizRootSvg
     *
     * @return {id, fillColor}
     */
    var parseGradientColors = function(vizRootSvg) {
        var gradientColorMap = {};
        var hasGradientColor = false;
        var vizDefs = vizRootSvg.selectAll("defs");
        vizDefs.each(function() {
            var defNode = this;
            if(defNode.firstChild) {
                var children = defNode.childNodes;
                for(var i = 0; i < children.length; i++) {
                    var gradientNode = children[i];
                    // refered from sap.viz.util.EffectManager
                    if(gradientNode) {
                        var gradientId = "";
                        var stops = [];
                        var fillColor = "#000000";
                        if(gradientNode.localName === "linearGradient") {
                            gradientId = gradientNode.getAttribute("id");
                            stops = gradientNode.childNodes;
                            if(stops.length === 2) {
                                fillColor = stops[1].getAttribute("stop-color");
                            } else if(stops.length === 4) {
                                fillColor = stops[3].getAttribute("stop-color");
                            } else {
                                fillColor = stops[stops.length - 1].getAttribute("stop-color");
                            }
                            gradientColorMap[gradientId] = fillColor;
                            hasGradientColor = true;
                        } else if(gradientNode.localName === "radialGradient") {
                            gradientId = gradientNode.getAttribute("id");
                            stops = gradientNode.childNodes;
                            if(stops.length === 3) {
                                fillColor = stops[1].getAttribute("stop-color");
                            } else if(stops.length === 4) {
                                fillColor = stops[3].getAttribute("stop-color");
                            } else {
                                fillColor = stops[stops.length - 1].getAttribute("stop-color");
                            }
                            gradientColorMap[gradientId] = fillColor;
                            hasGradientColor = true;
                        }
                    }
                }
            }
        });
        if(hasGradientColor) {
            // TODO const the special key
            gradientColorMap["__hasGradientColor"] = true;
        }
        return gradientColorMap;
    };
    /**
     *
     * @param {SVGElement} originalShapeEl
     * @param {Matrix} originalRootCTM
     * @param {SVGElement} newShapeEl
     */
    var alignPosition = function(originalShapeEl, originalRootCTM, newShapeEl) {
        // TODO handle Matrix abcd
        var left, top;
        var originalCTM = originalShapeEl.getScreenCTM();
        var newCTM = newShapeEl.getScreenCTM();
        // If originalShapeEl(has 'morphable' class) and newShapeEl(element actually execute morphing)
        // are not same node, need to include newShapeEl's relative position.
        if (originalShapeEl.isSameNode(newShapeEl) ||
            originalShapeEl.className.baseVal.indexOf("v-morphable-label") > -1 ){
            left = originalCTM.e - originalRootCTM.e;
            top = originalCTM.f - originalRootCTM.f;
        } else {
            left = originalCTM.e + newCTM.e - originalRootCTM.e;
            top = originalCTM.f + newCTM.f - originalRootCTM.f;
        }
        var rotateValue;

        if (newShapeEl.localName === "text") {
            if (SVGShapeMetadata.get(newShapeEl, MorphConst.SHAPE_DATA)) {
                rotateValue = SVGShapeMetadata.get(newShapeEl, MorphConst.SHAPE_DATA).rotate;
            }

            if (undefined === rotateValue) {
                var RAD2DEG = 180 / Math.PI;
                rotateValue = Math.atan2(originalCTM.b, originalCTM.a) * RAD2DEG;
            }
        }


        if (rotateValue) {
            newShapeEl.setAttribute("transform", "translate(" + left + "," + top + ") " + "rotate(" + rotateValue + ")");
        } else {
            newShapeEl.setAttribute("transform", "translate(" + left + "," + top + ")");
        }

        SVGShapeMetadata.set(newShapeEl, MorphConst.SHAPE_GLOBAL_TRANSLATE_X, left);
        SVGShapeMetadata.set(newShapeEl, MorphConst.SHAPE_GLOBAL_TRANSLATE_Y, top);
        return newShapeEl;
    };

    /**
     *
     * @param {SVGElement} shapeEl
     * @param {SVGElement} originalShapeEl shape captured on the SVG with parents
     */
    var processShape = function(shapeEl, originalShapeEl, vizGradientColors) {
        // TODO process and merge g.text struction
        // TODO these shapes special processing should be marked by viz side
        if(shapeEl.localName === "path" && 
            originalShapeEl.getAttribute("class") && originalShapeEl.getAttribute("class").indexOf("v-morphable-line") >= 0) {
            shapeEl.setAttribute("fill-opacity", 0);
        }
        if(shapeEl.localName === "path" && 
            originalShapeEl.getAttribute("class") && originalShapeEl.getAttribute("class").indexOf("v-morphable-datapoint") >= 0 && 
            originalShapeEl.getAttribute("visibility") === "hidden") {
            shapeEl.setAttribute("visibility", "");
            shapeEl.setAttribute("d", "M0,0L0,0Z");
        }
        if(shapeEl.localName === "rect" && 
            originalShapeEl.getAttribute("opacity") === "0" && 
            originalShapeEl.parentNode && 
            originalShapeEl.parentNode.parentNode && 
            originalShapeEl.parentNode.parentNode.getAttribute("class") && 
            originalShapeEl.parentNode.parentNode.getAttribute("class").indexOf("v-heatmap") >= 0) {
            shapeEl.setAttribute("opacity", 1);
        }
        if(vizGradientColors && vizGradientColors["__hasGradientColor"] === true && 
            shapeEl.getAttribute("fill") && shapeEl.getAttribute("fill").indexOf("url(#") === 0) {
            var gradientId = shapeEl.getAttribute("fill");
            // sample: url(#glossyrectangleeacf5e1horizontal)
            gradientId = gradientId.substring(5, gradientId.length - 1);
            var fillColor = vizGradientColors[gradientId];
            fillColor = fillColor ? fillColor : "#000000";
            shapeEl.setAttribute("fill", fillColor);
        }
    };
    return MpShapesCapturer;
});

define('sap/viz/vizframe/controls/morpher/utils/SVGShapeReplacer',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata'],
// @formatter:on
function(SVGShapeMetadata) {

    var SVGShapeReplacer = {};

    var xmlns = "http://www.w3.org/2000/svg";

    var ignoredAttributes = ["x", "y", "width", "height", "rx", "ry", "x1", "x2", "y1", "y2"];

    var getAttrAsFloat = function(svgEl, attrName) {
        var ret = parseFloat(svgEl.getAttribute(attrName));
        return isNaN(ret) ? 0 : ret;
    };

    SVGShapeReplacer.replace = function(shapeEl, newShapeType, attributes, keepOriginalAttrs) {
        if(shapeEl && newShapeType) {
            var newShapeEl = document.createElementNS(xmlns, newShapeType);
            if(keepOriginalAttrs) {
                var originalAttrs = shapeEl.attributes;
                for(var i = 0; i < originalAttrs.length; i++) {
                    var originalAttr = originalAttrs[i];
                    if(ignoredAttributes.indexOf(originalAttr.localName) === -1) {
                        newShapeEl.setAttribute(originalAttr.localName, originalAttr.value);
                    }
                }
            }
            for(var name in attributes) {
                if (attributes.hasOwnProperty(name)) {
                    newShapeEl.setAttribute(name, attributes[name]);
                }
            }
            SVGShapeMetadata.clone(newShapeEl, shapeEl);
            if(shapeEl.parentNode) {
                // replace in the DOM
                shapeEl.parentNode.replaceChild(newShapeEl, shapeEl);
            }
            return newShapeEl;
        }
        return null;
    };

    SVGShapeReplacer.replaceToPath = function(shapeEl) {
        if(shapeEl) {
            var pathStr = null;
            switch(shapeEl.localName) {
                case "rect":
                    var x = getAttrAsFloat(shapeEl, "x");
                    var y = getAttrAsFloat(shapeEl, "y");
                    var w = getAttrAsFloat(shapeEl, "width");
                    var h = getAttrAsFloat(shapeEl, "height");
                    var rx = getAttrAsFloat(shapeEl, "rx");
                    var ry = getAttrAsFloat(shapeEl, "ry");
                    // TODO handle rx ry
                    pathStr = "M" + x + "," + y + "L" + (w + x) + "," + y + "L" + (w + x) + "," + (h + y) + "L" + x + "," + (h + y) + "L" + x + "," + y + "Z";
                    break;
                case "line":
                    var x1 = getAttrAsFloat(shapeEl, "x1");
                    var y1 = getAttrAsFloat(shapeEl, "y1");
                    var x2 = getAttrAsFloat(shapeEl, "x2");
                    var y2 = getAttrAsFloat(shapeEl, "y2");
                    pathStr = "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
                    break;
                default:
            }
            if(pathStr) {
                var attrs = {
                    d : pathStr
                };
                return SVGShapeReplacer.replace(shapeEl, "path", attrs, true);
            }
        }
        return null;
    };
    return SVGShapeReplacer;
});

define('sap/viz/vizframe/controls/morpher/viz/MpShapesMapper',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/constant/MorphConst',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeReplacer',
    'sap/viz/vizframe/controls/morpher/vo/VizShape',
    'sap/viz/vizframe/common/utils/utils'],
// @formatter:on
function(MorphConst, SVGShapeMetadata, SVGShapeReplacer, VizShape, utils) {
    var ChartTypeUtil = {
        'isInfoChart' : function() {
            return true;
        }
    };
    
    var MpShapesMapper = {};

    /**
     * find related existing shape.display for new.from
     * via comparing newShape.to == currentShape.display
     * then put new.from = existingVizShape.display
     *
     * @param {sap.viz.morph.vo.VizShapesHolder} newVizShapes
     * @param {sap.viz.morph.vo.VizShapesHolder} existingVizShapes
     * @param {String} newVizType
     * @param {String} existingVizType
     * @param {Object} chartData
     *
     * @return mapped new shapes
     */
    MpShapesMapper.map = function(newVizShapes, existingVizShapes, newVizType, existingVizType, chartData) {
        convertDatapointMorphData(newVizType, newVizShapes, chartData);
        mapFromShapes(newVizShapes.plotShapes, existingVizShapes.plotShapes, isSameShapeByMorphData);
        
        convertLineMorphData(newVizType, newVizShapes, chartData);
        mapFromShapes(newVizShapes.plotLines, existingVizShapes.plotLines, isSameShapeByMorphData);
        
        convertLabelMorphData(newVizType, newVizShapes);
        if(MorphConst.IS_V_H_MAP(newVizType, existingVizType)) {
            mapFromShapes(newVizShapes.xAxisLabels, existingVizShapes.yAxisLabels, isSameShapeByMorphData);
            mapFromShapes(newVizShapes.xAxis2Labels, existingVizShapes.yAxis2Labels, isSameShapeByMorphData);
            mapFromShapes(newVizShapes.yAxisLabels, existingVizShapes.xAxisLabels, isSameShapeByMorphData);
            mapFromShapes(newVizShapes.yAxis2Labels, existingVizShapes.xAxis2Labels, isSameShapeByMorphData);
        } else {
            mapFromShapes(newVizShapes.xAxisLabels, existingVizShapes.xAxisLabels, isSameShapeByMorphData);
            mapFromShapes(newVizShapes.xAxis2Labels, existingVizShapes.xAxis2Labels, isSameShapeByMorphData);
            mapFromShapes(newVizShapes.yAxisLabels, existingVizShapes.yAxisLabels, isSameShapeByMorphData);
            mapFromShapes(newVizShapes.yAxis2Labels, existingVizShapes.yAxis2Labels, isSameShapeByMorphData);
        }
        mapFromShapes(newVizShapes.background, existingVizShapes.background, isSameBackground);
        mapFromShapes(newVizShapes.plotBackgrounds, existingVizShapes.plotBackgrounds, isSameBackground);
        return newVizShapes;
    };
    
    /**
     * @private
     * 
     * @param {String} vizType
     * @param {[sap.viz.morph.vo.VizShape]} newShapes
     * @param {Object} chartData
     *
     */
    var convertDatapointMorphData = function(vizType, newShapes, chartData) {
        if (ChartTypeUtil.isInfoChart(vizType)) {
            convertInfoChartDatapoint(newShapes, chartData);
        }
    };
    
    /**
     * @private
     * 
     * @param {String} vizType
     * @param {[sap.viz.morph.vo.VizShape]} newShapes
     * @param {Object} chartData
     *
     */
    var convertLineMorphData = function(vizType, newShapes, chartData) {
        if (ChartTypeUtil.isInfoChart(vizType)) {
            convertInfoChartLine(newShapes);
        }
    };
    
    /**
     * @private
     * 
     * @param {String} vizType
     * @param {[sap.viz.morph.vo.VizShape]} newShapes
     *
     */
    var convertLabelMorphData = function(vizType, newShapes) {
        var axisLabelShapes = newShapes.xAxisLabels.concat(newShapes.xAxis2Labels)
                                .concat(newShapes.yAxisLabels).concat(newShapes.yAxis2Labels);
        if (ChartTypeUtil.isInfoChart(vizType)) {
            convertInfoChartLabel(axisLabelShapes);
        }
    };
    
    var convertInfoChartDatapoint = function(newShapes, chartData) {
        var measuresInfo = getInfoChartMeasureInfo(chartData);
        var dimensionsInfo = getInfoChartDimensionInfo(chartData);
        
        for (var i in newShapes.plotShapes) {
            var morphData = {measures : [], dimensions : {}};
            var data = SVGShapeMetadata.get(newShapes.plotShapes[i].to, MorphConst.SHAPE_DATA);
            for (var measure in measuresInfo) {
                if (data.hasOwnProperty(measure)) {
                    var measureName = measuresInfo[measure];
                    morphData.measures.push(measureName);
                }
            }
            for (var dimension in dimensionsInfo) {
                if (data.hasOwnProperty(dimension)) {
                    var dimensionKey = dimensionsInfo[dimension];
                    // use display name to be compatible with viz chart dimension info
                    var dimensionValue = data[dimension + '.d'] ? data[dimension + '.d'] : data[dimension];
                    morphData.dimensions[dimensionKey] = dimensionValue;
                }
            }
            SVGShapeMetadata.set(newShapes.plotShapes[i].to, MorphConst.MORPHING_DATA, morphData);
        }
    };

    var convertInfoChartLine = function(newShapes) {       
        for (var i in newShapes.plotLines) {
            var morphData = [];
            var data = SVGShapeMetadata.get(newShapes.plotLines[i].to, MorphConst.SHAPE_DATA);
            for (var j in newShapes.plotShapes) {
                var pointData = SVGShapeMetadata.get(newShapes.plotShapes[j].to, MorphConst.SHAPE_DATA);
                var match = true;
                for (var key in data) {
                    if (key !== 'measureNames') {
                        if (!pointData.hasOwnProperty(key) || pointData[key] !== data[key]) {
                            match = false;
                        }
                    } else if (utils.isArray(data[key])) {
                        continue;
                    } else if (!pointData.hasOwnProperty(data[key])) {
                        match = false;
                    }
                }
                if (match) {
                    morphData.push(SVGShapeMetadata.get(newShapes.plotShapes[j].to, MorphConst.MORPHING_DATA));
                }
            }
            SVGShapeMetadata.set(newShapes.plotLines[i].to, MorphConst.MORPHING_DATA, morphData);
        }
    };

    var convertInfoChartLabel = function(axisLabelShapes) {
        for (var i in axisLabelShapes) {
            var morphData = {};
            morphData.labelText = "";
            if (axisLabelShapes[i].to.firstChild.localName === "text") {
                morphData.labelText = axisLabelShapes[i].to.firstChild.textContent;
            } else {
                var childLabelShape = axisLabelShapes[i].to.lastChild.cloneNode(true);
                if (childLabelShape && childLabelShape.firstChild && childLabelShape.firstChild.localName === "text") {
                    morphData.labelText = childLabelShape.firstChild.textContent;
                }
            }
            SVGShapeMetadata.set(axisLabelShapes[i].to, MorphConst.MORPHING_DATA, morphData);
        }
    };

    var getInfoChartMeasureInfo = function(chartData) {
        var measures = {};
        var metadata = chartData ? chartData._FlatTableD._dataset.metadata : {};
        if (metadata.fields) {
            metadata.fields.forEach(function(e, i) {
                if (e.semanticType === "Measure") {
                    measures[e.id] = e.name;
                }
            });
        }
        return measures;
    };
    
    var getInfoChartDimensionInfo = function(chartData) {
        var dimensions = {};
        var metadata = chartData ? chartData._FlatTableD._dataset.metadata : {};
        if (metadata.fields) {
            metadata.fields.forEach(function(e, i) {
                if (e.semanticType === "Dimension") {
                    dimensions[e.id] = e.name;
                }
            });
        }
        return dimensions;
    };
    
    /**
     * @private
     * 
     * compare morphing data in two shapes
     * if they are totally equal(have same length/key/value), we regard two shapes are matching
     *
     * @param {SVGElement} fromShapeEl
     * @param {SVGElement} toShapeEl
     *
     * @return {Boolean}
     */
    var isSameShapeByMorphData = function(fromShapeEl, toShapeEl) {
        var data1 = SVGShapeMetadata.get(toShapeEl, MorphConst.MORPHING_DATA);
        var data2 = SVGShapeMetadata.get(fromShapeEl, MorphConst.MORPHING_DATA);
        if(utils.deepEqual(data1, data2)){
            return true;
        }
        return false;
    };
    
    /**
     * @private
     *
     * @param {SVGElement} fromShapeEl
     * @param {SVGElement} toShapeEl
     *
     * @return {Boolean}
     */
    var isSameBackground = function(fromShapeEl, toShapeEl) {
        if (toShapeEl && fromShapeEl && 
                toShapeEl.localName == fromShapeEl.localName && 
                toShapeEl.hasAttribute("class", "v-background-body v-morphable-background") && 
                fromShapeEl.hasAttribute("class", "v-background-body v-morphable-background")) {
            return true;
        }
        return false;
    };
    
    /**
     * if "new.to" maps to "current.display"
     *    "new.from" = "current.display"
     */
    var mapFromShapes = function(newShapes, currentShapes, mapFunc, allowNodeMap) {
        var mappedCurrentShapes = [];
        for(var i = 0; i < newShapes.length; i++) {
            var newShape = newShapes[i];
            for(var j = 0; j < currentShapes.length; j++) {
                var currentShape = currentShapes[j];
                if(allowNodeMap || mappedCurrentShapes.indexOf(currentShape) === -1) {
                    if(mapFunc(newShape.to, currentShape.display)) {
                        // covert current shape to same type as new shape
                        var replacedShapes = replaceShape(newShape.to, currentShape.display);
                        // update new shape
                        newShape.to = replacedShapes.newShape;
                        // put current shape as new shape's from
                        newShape.from = replacedShapes.currentShape;
                        // temp hold mapped shape to avoid duplicate map
                        mappedCurrentShapes.push(currentShape);
                        break;
                    }
                }
            }
        }
    };
    
    var replaceShape = function(newShapeEl, currentShapeEl) {
        var replacedShapes = {
            newShape : newShapeEl,
            currentShape : currentShapeEl
        };
        var replacedShape;
        if(newShapeEl.localName === "path" && currentShapeEl.localName !== "path") {
            replacedShape = SVGShapeReplacer.replaceToPath(currentShapeEl);
            if(replacedShape) {
                replacedShapes.currentShape = replacedShape;
            }
        }
        if(newShapeEl.localName !== "path" && currentShapeEl.localName === "path") {
            replacedShape = SVGShapeReplacer.replaceToPath(newShapeEl);
            if(replacedShape) {
                replacedShapes.newShape = replacedShape;
            }
        }
        return replacedShapes;
    };
    return MpShapesMapper;
});

define('sap/viz/vizframe/controls/morpher/utils/Cache',[],function() {
    var Cache = {};

    var repush = function(array, item) {
        // remove the item, and re-push to the end of array
        for(var i = 0, ii = array.length; i < ii; i++) {
            if(array[i] === item) {
                return array.push(array.splice(i, 1)[0]);
            }
        }
    };

    Cache.func = function(f, scope, postprocessor) {
        function newf() {
            var arg = Array.prototype.slice.call(arguments, 0), args = arg.join("\u2400"), // key
            cache = newf.cache = newf.cache || {}, // result
            count = newf.count = newf.count || [];
            // args
            if(cache.hasOwnProperty(args)) {
                repush(count, args);
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }count.length >= 1e3 &&
            delete cache[count.shift()];
            count.push(args);
            cache[args] = f.apply(scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }

        return newf;
    };
    return Cache;
});

define('sap/viz/vizframe/controls/morpher/utils/ColorUtil',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/utils/Cache'],
// @formatter:on
function(Cache) {
    var ColorUtil = {};

    /**
     * parse color string
     * @param {String} color_string rgb(123, 234, 45) or #FF22CC or ff22cc or #f0c or F2C
     * @return {[r, g, b]}
     */
    var _parseCacheFunc = null;
    ColorUtil.parse = function(colorString) {
        if (!_parseCacheFunc) {
            // global name RGBColorStatic
            _parseCacheFunc = Cache.func(RGBColorStatic.parse);
        }
        return _parseCacheFunc(colorString);
    };
    /**
     * convert number to hex String.
     * @param {Number} color the color to be converted
     * @return {String} the color in hex string
     */
    ColorUtil.numberToHexString = function(color) {
        var r = ((color & 0xff0000) >> 16).toString(16), g = ((color & 0x00ff00) >> 8).toString(16), b = (color & 0x0000ff).toString(16);
        var hex = "#" + ((r.length === 1) ? "0" + r : r) + ((g.length === 1) ? "0" + g : g) + ((b.length === 1) ? "0" + b : b);
        return hex;
    };
    /**
     * @param {String} hexColor
     * @return {Number} 0x000000-0xFFFFFF
     * @private
     */
    ColorUtil.hexStringToNumber = function(hexColor) {
        if (!hexColor) {
            return 0;
        }

        if (hexColor.charAt(0) === '#') {
            hexColor = hexColor.substr(1);
        }
        var r = parseInt(hexColor.substr(0, 2), 16), g = parseInt(hexColor.substr(2, 2), 16), b = parseInt(hexColor.substr(4, 2), 16);

        var hex = (Math.max(0, Math.min(255, r)) * 65536) + (Math.max(0, Math.min(255, g)) * 256) + Math.max(0, Math.min(255, b));
        return hex;
    };
    /**
     * Convert number to rgba color: rgba(r,g,b,a);
     * @param {Number} color
     * @param {Number} a
     *          alpha
     * @return {string}
     * @private
     */
    ColorUtil.numberToRGB = function(color) {
        var r = (color & 0xff0000) >> 16, g = (color & 0x00ff00) >> 8, b = color & 0x0000ff;
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    };
    /**
     * Convert number to rgba color: rgba(r,g,b,a);
     * @param {Number} color
     * @param {Number} a
     *          alpha
     * @return {string}
     * @private
     */
    ColorUtil.numberToRGBA = function(color, alpha) {
        var r = (color & 0xff0000) >> 16, g = (color & 0x00ff00) >> 8, b = color & 0x0000ff;
        if (alpha === undefined || alpha <= 0 || alpha > 1) {
            alpha = 1;
        }
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    };
    /**
     * To color Number
     * @param {Number} r 0-255
     * @param {Number} g 0-255
     * @param {Number} b 0-255
     * @return {Number} the color number 0x000000-0xFFFFFF
     */
    ColorUtil.RGBToNumber = function(r, g, b) {
        var hex = (Math.max(0, Math.min(255, r)) * 65536) + (Math.max(0, Math.min(255, g)) * 256) + Math.max(0, Math.min(255, b));
        return hex;
    };
    /**
     * returns a color from a point between two colors
     * @param {Number} color1
     * @param {Number} color2
     * @param {Number} percentage 0.0-1.0
     * @return {Number}
     */
    ColorUtil.getColorMix = function(color1, color2, percentage) {
        return ColorUtil.getPercentageOfColor(color1, 1 - percentage) + ColorUtil.getPercentageOfColor(color2, percentage);
    };
    /**
     * @param {Number} baseColor
     * @param {Number} percentage 0.0-1.0
     * @return {Number}
     */
    ColorUtil.getPercentageOfColor = function(baseColor, percentage) {
        percentage = Math.min(1, Math.max(0, percentage));
        var red/*Number*/ = (baseColor & 0xff0000) >> 16;
        var green/*Number*/ = (baseColor & 0x00ff00) >> 8;
        var blue/*Number*/ = baseColor & 0x0000ff;
        return (red * percentage) << 16 | (green * percentage) << 8 | (blue * percentage);
    };

    /**
     * Adjust brightness of rgb color
     *
     * @param {Number} rgb
     * @param {Number} briteness
     *
     * @return {Number} new rgb
     *
     */

    ColorUtil.adjustBrightness = function(rgbColor, briteness) {
        var r = Math.min(((rgbColor >> 16) & 0xFF) + briteness, 255);
        r = Math.max(r, 0);
        var g = Math.min(((rgbColor >> 8) & 0xFF) + briteness, 255);
        g = Math.max(g, 0);
        var b = Math.min((rgbColor & 0xFF) + briteness, 255);
        b = Math.max(b, 0);
        return (r << 16) | (g << 8) | b;
    };

    /**
     * Adjust brightness of rgb color, scaled
     *
     * @param {Number} rgb
     * @param {Number} briteness
     *
     * @return {Number} new rgb
     *
     */

    ColorUtil.adjustBrightness2 = function(rgbColor, briteness) {
        var r = NaN, g = NaN, b = NaN;
        if (briteness === 0) {
            return rgbColor;
        } else if (briteness > 0) {
            briteness /= 100;
            r = ((rgbColor >> 16) & 0xFF);
            g = ((rgbColor >> 8) & 0xFF);
            b = (rgbColor & 0xFF);
            r += ((0xFF - r) * briteness);
            g += ((0xFF - g) * briteness);
            b += ((0xFF - b) * briteness);
            r = Math.min(r, 255);
            g = Math.min(g, 255);
            b = Math.min(b, 255);
        } else {
            briteness = (100 + briteness) / 100;
            r = ((rgbColor >> 16) & 0xFF) * briteness;
            g = ((rgbColor >> 8) & 0xFF) * briteness;
            b = (rgbColor & 0xFF) * briteness;
        }

        return (r << 16) | (g << 8) | b;
    };

    /**
     * Multiply 2 colors
     *
     * @param {Number} color1
     * @param {Number} color2
     *
     * @return {Number} new color
     */
    ColorUtil.rgbMultiply = function(color1, color2) {
        var r1 = (color1 >> 16) & 0xFF, g1 = (color1 >> 8) & 0xFF, b1 = color1 & 0xFF;
        var r2 = (color2 >> 16) & 0xFF, g2 = (color2 >> 8) & 0xFF, b2 = color2 & 0xFF;

        return ((r1 * r2 / 255) << 16) | ((g1 * g2 / 255) << 8) | (b1 * b2 / 255);
    };
    return ColorUtil;
});

define('sap/viz/vizframe/controls/morpher/morphers/ColorMorpher',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/utils/ColorUtil'],
// @formatter:on
function(ColorUtil) {

    var ColorMorpher = {};

    var getOpacityAsFloat = function(svgEl, attrName) {
        var ret = parseFloat(svgEl.getAttribute(attrName));
        return isNaN(ret) ? 1 : ret;
    };
    /**
     *
     * @param {String|Number} from
     * @param {String|Number} to
     * @param {Number} percentage
     * @return {String} CSS color string rgb(0,0,0)
     */
    ColorMorpher.getPercentage = function(from, to, percentage) {
        percentage = percentage > 100 ? 100 : percentage < 0 ? 0 : percentage;
        var fromRGB = ColorUtil.parse(from);
        var toRGB = ColorUtil.parse(to);
        // no morph
        if(fromRGB.length === 0 && toRGB.length === 0) {
            return "";
        }
        // from transparent to new color
        
        if (fromRGB.length === 0 && toRGB.length === 3) {
            return "rgb(" + toRGB[0] + "," + toRGB[1] + "," + toRGB[2] + ")";
        }

        // from old color to transparent
        if(fromRGB.length === 3 && toRGB.length === 0) {
            return "";
        }

        return "rgb("+ 
                Math.round(fromRGB[0] + (toRGB[0] - fromRGB[0]) * percentage / 100) + ","+ 
                Math.round(fromRGB[1] + (toRGB[1] - fromRGB[1]) * percentage / 100) + ","+ 
                Math.round(fromRGB[2] + (toRGB[2] - fromRGB[2]) * percentage / 100) + ")";
    };
    /**
     *
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {SVGElement} displayShape
     * @param {Number} percentage
     */
    ColorMorpher.svg = function(fromShape, toShape, displayShape, percentage) {
        if (displayShape && toShape) {
            var fromStroke = fromShape ? fromShape.getAttribute("stroke") : "";
            var toStroke = toShape.getAttribute("stroke");

            var fromFill = fromShape ? fromShape.getAttribute("fill") : "";
            var toFill = toShape.getAttribute("fill");
            
            if (fromStroke === toStroke) {
                displayShape.setAttribute("stroke", toStroke);
            } else {
                displayShape.setAttribute("stroke", ColorMorpher.getPercentage(fromStroke, toStroke, percentage));
            }
            // BITSDC4-461: set fill-opacity="0" if fill="transparent" or invalid
            var displayShapeFill = "";
            if (fromFill === toFill) {
                displayShapeFill = toFill;
                displayShape.setAttribute("fill", displayShapeFill);
            } else {
                if (toFill) {
                    displayShapeFill = ColorMorpher.getPercentage(fromFill, toFill, percentage);
                    displayShape.setAttribute("fill", displayShapeFill);
                } else {
                    displayShapeFill = null;
                }
            }

            var toFillOpacity;
            var toStrokeOpacity;
            if(fromShape) {
                // fill-opacity
                if (displayShapeFill === "") {
                    displayShape.setAttribute("fill-opacity", 0);
                } else {
                    var fromFillOpacity = getOpacityAsFloat(fromShape, "fill-opacity");
                    toFillOpacity = getOpacityAsFloat(toShape, "fill-opacity");
                    if (fromFillOpacity != toFillOpacity) {
                        displayShape.setAttribute("fill-opacity",
                                                  fromFillOpacity + (toFillOpacity - fromFillOpacity) * percentage / 100);
                    }
                }
                // stroke-opacity
                var fromStrokeOpacity = getOpacityAsFloat(fromShape, "stroke-opacity");
                toStrokeOpacity = getOpacityAsFloat(toShape, "stroke-opacity");
                if (fromStrokeOpacity != toStrokeOpacity) {
                    displayShape.setAttribute("stroke-opacity",
                                              fromStrokeOpacity + (toStrokeOpacity - fromStrokeOpacity) * percentage / 100);
                }
            } else {
                // fill-opacity
                if (toShape.getAttribute("fill-opacity") !== "") {
                    if (displayShapeFill === "") {
                        toFillOpacity = 0;
                    } else {
                        toFillOpacity = getOpacityAsFloat(toShape, "fill-opacity");
                    }
                    displayShape.setAttribute("fill-opacity",
                                          0 + (toFillOpacity - 0) * percentage / 100);
                } else {
                    displayShape.setAttribute("fill-opacity", "");
                }
                // stroke-opacity
                if (toShape.getAttribute("stroke-opacity") !== "") {
                    toStrokeOpacity = getOpacityAsFloat(toShape, "stroke-opacity");
                    displayShape.setAttribute("stroke-opacity",
                                              0 + (toStrokeOpacity - 0) * percentage / 100);
                } else {
                    displayShape.setAttribute("stroke-opacity", "");
                }
            }
        }
    };
    return ColorMorpher;
});

define('sap/viz/vizframe/controls/morpher/morphers/RectMorpher',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/constant/MorphConst',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata'],
// @formatter:on
function(MorphConst, SVGShapeMetadata) {
   
    var RectMorpher = {};
    
    RectMorpher.NO_DEFAULT_DIRECTION = 0;
    RectMorpher.DEFAULT_DIRECTION_TO_NORTH = 1;
    RectMorpher.DEFAULT_DIRECTION_TO_SOUTH = 2;
    RectMorpher.DEFAULT_DIRECTION_TO_EAST = 4;
    RectMorpher.DEFAULT_DIRECTION_TO_WEST = 8;
    
    /**
     * 
     * @param {Object} from {w, h, x, y, r}
     * @param {Object} to {w, h, x, y, r}
     * @param {Number} percentage
     * @return {Object} {w, h, x, y, r}
     */
    RectMorpher.getPercentageRect = function(from, to, percentage) {
        return {
            w: from.w + (to.w - from.w) * percentage / 100,
            h: from.h + (to.h - from.h) * percentage / 100,
            x: from.x + (to.x - from.x) * percentage / 100,
            y: from.y + (to.y - from.y) * percentage / 100,
            r: from.r + (to.r - from.r) * percentage / 100
        };
    };
    
    var getAttrAsInt = function(svgEl, attrName) {
        var ret = parseInt(svgEl.getAttribute(attrName), 10);
        return isNaN(ret) ? 0 : ret;
    };
    
    var getAttrAsFloat = function(svgEl, attrName) {
        var ret = parseFloat(svgEl.getAttribute(attrName));
        return isNaN(ret) ? 0 : ret;
    };
    
    /**
     *
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {SVGElement} displayShape
     * @param {Number} percentage
     */
    RectMorpher.svg = function(fromShape, toShape, displayShape, percentage, defaultDirection) {
        if(displayShape && toShape && toShape.localName === "rect") {
            var toX;
            var toRX;
            var toY;
            var toRY;
            var toW;
            var toH;
            if(SVGShapeMetadata.get(toShape, MorphConst.MORPHER_DISABLE_RECT) === true){
                toX = getAttrAsFloat(toShape, "x");
                toRX = getAttrAsFloat(toShape, "rx");
                toY = getAttrAsFloat(toShape, "y");
                toRY = getAttrAsFloat(toShape, "ry");
                toW = getAttrAsFloat(toShape, "width");
                toH = getAttrAsFloat(toShape, "height");
                
                var toX2 = getAttrAsFloat(displayShape, "x");
                var toRX2 = getAttrAsFloat(displayShape, "rx");
                var toY2 = getAttrAsFloat(displayShape, "y");
                var toRY2 = getAttrAsFloat(displayShape, "ry");
                var toW2 = getAttrAsFloat(displayShape, "width");
                var toH2 = getAttrAsFloat(displayShape, "height");
                
                if(toX !== toX2){
                    displayShape.setAttribute("x", toX);
                }
                if(toRX !== toRX2){
                    displayShape.setAttribute("rx", toRX);
                }
                if(toY !== toY2){
                    displayShape.setAttribute("y", toY);
                }
                if(toRY !== toRY2){
                    displayShape.setAttribute("ry", toRY);
                }
                if(toW !== toW2){
                    displayShape.setAttribute("width", toW);
                }
                if(toH !== toH2){
                    displayShape.setAttribute("height",toH);
                }
                
            }else if(fromShape && fromShape.localName === "rect") {
                // rect - rect
                var fromX = getAttrAsFloat(fromShape, "x");
                toX = getAttrAsFloat(toShape, "x");
                
                var fromRX = getAttrAsFloat(fromShape, "rx");
                toRX = getAttrAsFloat(toShape, "rx");
                
                var fromY = getAttrAsFloat(fromShape, "y");
                toY = getAttrAsFloat(toShape, "y");
                
                var fromRY = getAttrAsFloat(fromShape, "ry");
                toRY = getAttrAsFloat(toShape, "ry");
                
                var fromW = getAttrAsFloat(fromShape, "width");
                toW = getAttrAsFloat(toShape, "width");
                
                var fromH = getAttrAsFloat(fromShape, "height");
                toH = getAttrAsFloat(toShape, "height");
                
                // if both from and to shapes are invisible, disable animation for them
                var fromVisible = (fromW >= 1 && fromH >= 1);
                var toVisible = (toW >= 1 && toH >= 1);
                if(!fromVisible && !toVisible){
                    percentage = 100;
                }
                
                displayShape.setAttribute("x",
                                          fromX + (toX - fromX) * percentage / 100);
                displayShape.setAttribute("y",
                                          fromY + (toY - fromY) * percentage / 100);
                displayShape.setAttribute("rx",
                                          fromRX + (toRX - fromRX) * percentage / 100);
                displayShape.setAttribute("ry",
                                          fromRY + (toRY - fromRY) * percentage / 100);
                displayShape.setAttribute("width",
                                          fromW + (toW - fromW) * percentage / 100);
                displayShape.setAttribute("height",
                                          fromH + (toH - fromH) * percentage / 100);
                                          
            }else if(!fromShape) {
                // none to rect
                toX = getAttrAsFloat(toShape, "x");
                toRX = getAttrAsFloat(toShape, "rx");
                toY = getAttrAsFloat(toShape, "y");
                toRY = getAttrAsFloat(toShape, "ry");
                toW = getAttrAsFloat(toShape, "width");
                toH = getAttrAsFloat(toShape, "height");
                
                if(defaultDirection == null || defaultDirection < 0) {
                    defaultDirection = RectMorpher.DEFAULT_DIRECTION_TO_NORTH | RectMorpher.DEFAULT_DIRECTION_TO_WEST;
                }
                
                if((defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_NORTH) && (defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_SOUTH)){
                    displayShape.setAttribute("y", 
                                          toY + (toH - 0) * (100 - percentage) / 100 / 2);
                    displayShape.setAttribute("height",
                                          0 + (toH - 0) * percentage / 100);
                }else if(defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_NORTH){
                    displayShape.setAttribute("y", 
                                          toY + (toH - 0) * (100 - percentage) / 100);
                    displayShape.setAttribute("height",
                                          0 + (toH - 0) * percentage / 100);
                }else if(defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_SOUTH){
                    displayShape.setAttribute("y", 
                                          toY);
                    displayShape.setAttribute("height",
                                          0 + (toH - 0) * percentage / 100);
                }else{
                    displayShape.setAttribute("y", toY);
                    displayShape.setAttribute("height", toH);
                }
                
                if((defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_EAST) && (defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_WEST)){
                    displayShape.setAttribute("x", 
                                          toX + (toW - 0) * (100 - percentage) / 100 / 2);
                    displayShape.setAttribute("width",
                                          0 + (toW - 0) * percentage / 100);
                }else if(defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_EAST){
                    displayShape.setAttribute("x", 
                                          toX + (toW - 0) * (100 - percentage) / 100);
                    displayShape.setAttribute("width",
                                          0 + (toW - 0) * percentage / 100);
                }else if(defaultDirection & RectMorpher.DEFAULT_DIRECTION_TO_WEST){
                    displayShape.setAttribute("x", 
                                          toX);
                    displayShape.setAttribute("width",
                                          0 + (toW - 0) * percentage / 100);
                }else{
                    displayShape.setAttribute("x", toX);
                    displayShape.setAttribute("width", toW);
                }
            }
        }
    };

    return RectMorpher;
});

define('sap/viz/vizframe/controls/morpher/morphers/LineMorpher',[],function() {

    var LineMorpher = {};

    /**
     *
     * @param {Object} from {x, y, x2, y2}
     * @param {Object} to {x, y, x2, y2}
     * @param {Number} percentage
     * @return {Object} {x, y, x2, y2}
     */
    LineMorpher.getPercentageLine = function(from, to, percentage) {
        return {
            x : from.x + (to.x - from.x) * percentage / 100,
            y : from.y + (to.y - from.y) * percentage / 100,
            x2 : from.x2 + (to.x2 - from.x2) * percentage / 100,
            y2 : from.y2 + (to.y2 - from.y2) * percentage / 100
        };
    };
    var getAttrAsInt = function(svgEl, attrName) {
        var ret = parseInt(svgEl.getAttribute(attrName), 10);
        return isNaN(ret) ? 0 : ret;
    };
    var getAttrAsFloat = function(svgEl, attrName) {
        var ret = parseFloat(svgEl.getAttribute(attrName));
        return isNaN(ret) ? 0 : ret;
    };
    /**
     *
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {SVGElement} displayShape
     * @param {Number} percentage
     */
    LineMorpher.svg = function(fromShape, toShape, displayShape, percentage) {
        if(displayShape && toShape && toShape.localName === "line") {
            var toX1;
            var toX2;
            var toY1;
            var toY2;
            if(fromShape && fromShape.localName === "rect") {
                // rect - rect
                var fromX1 = getAttrAsFloat(fromShape, "x1");
                toX1 = getAttrAsFloat(toShape, "x1");

                var fromX2 = getAttrAsFloat(fromShape, "x2");
                toX2 = getAttrAsFloat(toShape, "x2");

                var fromY1 = getAttrAsFloat(fromShape, "y1");
                toY1 = getAttrAsFloat(toShape, "y1");

                var fromY2 = getAttrAsFloat(fromShape, "y2");
                toY2 = getAttrAsFloat(toShape, "y2");

                displayShape.setAttribute("x1", fromX1 + (toX1 - fromX1) * percentage / 100);
                displayShape.setAttribute("y1", fromY1 + (toY1 - fromY1) * percentage / 100);
                displayShape.setAttribute("x2", fromX2 + (toX2 - fromX2) * percentage / 100);
                displayShape.setAttribute("y2", fromY2 + (toY2 - fromY2) * percentage / 100);

            } else if(!fromShape) {
                // none to rect
                toX1 = getAttrAsFloat(toShape, "x1");
                toX2 = getAttrAsFloat(toShape, "x2");
                toY1 = getAttrAsFloat(toShape, "y1");
                toY2 = getAttrAsFloat(toShape, "y2");

                displayShape.setAttribute("x1", toX1);
                displayShape.setAttribute("y1", toY1);
                displayShape.setAttribute("x2", 0 + (toX2 - 0) * percentage / 100);
                displayShape.setAttribute("y2", 0 + (toY2 - 0) * percentage / 100);
            }

        }

    };
    return LineMorpher;
});

define('sap/viz/vizframe/controls/morpher/morphers/PathMorpher',[
// @formatter:off
    'sap/viz/vizframe/common/utils/utils',
    'sap/viz/vizframe/controls/morpher/utils/Cache',
    'sap/viz/vizframe/controls/morpher/constant/MorphConst',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata'],
// @formatter:on
function(utils, Cache, MorphConst, SVGShapeMetadata) {

    //-------------------------------------------
    // PathMorpher algorithm refered from RaphaelJS
    //-------------------------------------------

    var concat = "concat", apply = "apply", has = "hasOwnProperty", split = "split",
    lowerCase = String.prototype.toLowerCase, upperCase = String.prototype.toUpperCase,
    toFloat = parseFloat, toInt = parseInt, math = Math, mmax = math.max, mmin = math.min,
    abs = math.abs, pow = math.pow, PI = math.PI, nu = "number", string = "string", array = "array",
    toString = "toString";

    var p2s = /,?([achlmqrstvxz]),?/gi,
    pathCommand = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/ig,
    pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/ig;

    var _path2string = function(inputArray) {
        return inputArray ? inputArray.join(",").replace(p2s, "$1") : this.join(",").replace(p2s, "$1");
    };
    // http://schepers.cc/getting-to-the-point
    var _catmullRom2bezier = function(crp, z) {
        var d = [];
        for(var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
            var p = [{
                x : +crp[i - 2],
                y : +crp[i - 1]
            }, {
                x : +crp[i],
                y : +crp[i + 1]
            }, {
                x : +crp[i + 2],
                y : +crp[i + 3]
            }, {
                x : +crp[i + 4],
                y : +crp[i + 5]
            }];
            if(z) {
                if(!i) {
                    p[0] = {
                        x : +crp[iLen - 2],
                        y : +crp[iLen - 1]
                    };
                } else if(iLen - 4 === i) {
                    p[3] = {
                        x : +crp[0],
                        y : +crp[1]
                    };
                } else if(iLen - 2 === i) {
                    p[2] = {
                        x : +crp[0],
                        y : +crp[1]
                    };
                    p[3] = {
                        x : +crp[2],
                        y : +crp[3]
                    };
                }
            } else {
                if(iLen - 4 === i) {
                    p[3] = p[2];
                } else if(!i) {
                    p[0] = {
                        x : +crp[i],
                        y : +crp[i + 1]
                    };
                }
            }
            d.push(["C", (-p[0].x + 6 * p[1].x + p[2].x) / 6, (-p[0].y + 6 * p[1].y + p[2].y) / 6, (p[1].x + 6 * p[2].x - p[3].x) / 6, (p[1].y + 6 * p[2].y - p[3].y) / 6, p[2].x, p[2].y]);
        }

        return d;
    };
    var parsePathString = function(pathString) {
        if(!pathString) {
            return null;
        }
        var paramCounts = {
            a : 7,
            c : 6,
            h : 1,
            l : 2,
            m : 2,
            r : 4,
            q : 4,
            s : 4,
            t : 2,
            v : 1,
            z : 0
        }, data = [];
        if(!data.length) {
            String(pathString).replace(pathCommand, function(a, b, c) {
                var params = [], name = b.toLowerCase();
                c.replace(pathValues, function(a, b) {
                    b && params.push(+b);
                });
                if(name === "m" && params.length > 2) {
                    data.push([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b === "m" ? "l" : "L";
                }
                if(name === "r") {
                    data.push([b][concat](params));
                } else {
                    while(params.length >= paramCounts[name]) {
                        data.push([b][concat](params.splice(0, paramCounts[name])));
                        if(!paramCounts[name]) {
                            break;
                        }
                    }
                }
            });
        }
        // TODO move to util function
        data.toString = _path2string;
        return data;
    };
    var pathToAbsolute = function(pathArray/*String*/) {
        if(!utils.isArray(pathArray) || !utils.isArray(pathArray && pathArray[0])) {// rough assumption
            pathArray = parsePathString(pathArray);
        }
        if(!pathArray || !pathArray.length) {
            return [["M", 0, 0]];
        }
        var res = [], x = 0, y = 0, mx = 0, my = 0, start = 0;
        if(pathArray[0][0] === "M") {
            x = +pathArray[0][1];
            y = +pathArray[0][2];
            mx = x;
            my = y;
            start++;
            res[0] = ["M", x, y];
        }
        var crz = pathArray.length === 3 && pathArray[0][0] === "M" && pathArray[1][0].toUpperCase() === "R" && pathArray[2][0].toUpperCase() === "Z";
        for(var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
            res.push( r = []);
            pa = pathArray[i];
            var dots;
            if(pa[0] != upperCase.call(pa[0])) {
                r[0] = upperCase.call(pa[0]);
                switch (r[0]) {
                    case "A":
                        r[1] = pa[1];
                        r[2] = pa[2];
                        r[3] = pa[3];
                        r[4] = pa[4];
                        r[5] = pa[5];
                        r[6] = +(pa[6] + x);
                        r[7] = +(pa[7] + y);
                        break;
                    case "V":
                        r[1] = +pa[1] + y;
                        break;
                    case "H":
                        r[1] = +pa[1] + x;
                        break;
                    case "R":
                        dots = [x, y][concat](pa.slice(1));
                        for(var j = 2, jj = dots.length; j < jj; j++) {
                            dots[j] = +dots[j] + x;
                            dots[++j] = +dots[j] + y;
                        }
                        res.pop();
                        res = res[concat](_catmullRom2bezier(dots, crz));
                        break;
                    case "M":
                        mx = +pa[1] + x;
                        my = +pa[2] + y;
                        break;
                    default:
                        for( j = 1, jj = pa.length; j < jj; j++) {
                            r[j] = +pa[j] + ((j % 2) ? x : y);
                        }
                }
            } else if(pa[0] === "R") {
                dots = [x, y][concat](pa.slice(1));
                res.pop();
                res = res[concat](_catmullRom2bezier(dots, crz));
                r = ["R"][concat](pa.slice(-2));
            } else {
                for(var k = 0, kk = pa.length; k < kk; k++) {
                    r[k] = pa[k];
                }
            }
            switch (r[0]) {
                case "Z":
                    x = mx;
                    y = my;
                    break;
                case "H":
                    x = r[1];
                    break;
                case "V":
                    y = r[1];
                    break;
                case "M":
                    mx = r[r.length - 2];
                    my = r[r.length - 1];
                    break;
                default:
                    x = r[r.length - 2];
                    y = r[r.length - 1];
            }
        }
        res.toString = _path2string;
        return res;
    };
    var l2c = function(x1, y1, x2, y2) {
        return [x1, y1, x2, y2, x2, y2];
    };
    var q2c = function(x1, y1, ax, ay, x2, y2) {
        var _13 = 1 / 3, _23 = 2 / 3;
        return [_13 * x1 + _23 * ax, _13 * y1 + _23 * ay, _13 * x2 + _23 * ax, _13 * y2 + _23 * ay, x2, y2];
    };
    var a2c = function(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
        // for more information of where this math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var f1,f2,cx,cy;
        var _120 = PI * 120 / 180, rad = PI / 180 * (+angle || 0), res = [], xy, rotate = Cache.func(function(x, y, rad) {
            var X = x * math.cos(rad) - y * math.sin(rad), Y = x * math.sin(rad) + y * math.cos(rad);
            return {
                x : X,
                y : Y
            };
        });
        if(!recursive) {
            xy = rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            var cos = math.cos(PI / 180 * angle), sin = math.sin(PI / 180 * angle), x = (x1 - x2) / 2, y = (y1 - y2) / 2;
            var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
            if(h > 1) {
                h = math.sqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            var rx2 = rx * rx, ry2 = ry * ry, k = (large_arc_flag == sweep_flag ? -1 : 1) * math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x)));
            cx = k * rx * y / ry + (x1 + x2) / 2;
            cy = k * -ry * x / rx + (y1 + y2) / 2;
            f1 = math.asin(((y1 - cy) / ry).toFixed(9));
            f2 = math.asin(((y2 - cy) / ry).toFixed(9));
            f1 = x1 < cx ? PI - f1 : f1;
            f2 = x2 < cx ? PI - f2 : f2; f1 < 0 && ( f1 = PI * 2 + f1); f2 < 0 && ( f2 = PI * 2 + f2);
            if(sweep_flag && f1 > f2) {
                f1 = f1 - PI * 2;
            }
            if(!sweep_flag && f2 > f1) {
                f2 = f2 - PI * 2;
            }
        } else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        var df = f2 - f1;
        if(abs(df) > _120) {
            var f2old = f2, x2old = x2, y2old = y2;
            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
            x2 = cx + rx * math.cos(f2);
            y2 = cy + ry * math.sin(f2);
            res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        var c1 = math.cos(f1), s1 = math.sin(f1), c2 = math.cos(f2), s2 = math.sin(f2), t = math.tan(df / 4), hx = 4 / 3 * rx * t, hy = 4 / 3 * ry * t, m1 = [x1, y1], m2 = [x1 + hx * s1, y1 - hy * c1], m3 = [x2 + hx * s2, y2 - hy * c2], m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if(recursive) {
            return [m2, m3, m4][concat](res);
        } else {
            res = [m2, m3, m4][concat](res).join()[split](",");
            var newres = [];
            for(var i = 0, ii = res.length; i < ii; i++) {
                newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
    };
    var path2curveImpl = function(path, path2) {
        var p = pathToAbsolute(path), p2 = path2 && pathToAbsolute(path2), attrs = {
            x : 0,
            y : 0,
            bx : 0,
            by : 0,
            X : 0,
            Y : 0,
            qx : null,
            qy : null
        }, attrs2 = {
            x : 0,
            y : 0,
            bx : 0,
            by : 0,
            X : 0,
            Y : 0,
            qx : null,
            qy : null
        }, processPath = function(path, d) {
            var nx, ny;
            if(!path) {
                return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
            }!(path[0] in {
                T : 1,
                Q : 1
            }) && (d.qx = d.qy = null);
            switch (path[0]) {
                case "M":
                    d.X = path[1];
                    d.Y = path[2];
                    break;
                case "A":
                    path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                    break;
                case "S":
                    nx = d.x + (d.x - (d.bx || d.x));
                    ny = d.y + (d.y - (d.by || d.y));
                    path = ["C", nx, ny][concat](path.slice(1));
                    break;
                case "T":
                    d.qx = d.x + (d.x - (d.qx || d.x));
                    d.qy = d.y + (d.y - (d.qy || d.y));
                    path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                    break;
                case "Q":
                    d.qx = path[1];
                    d.qy = path[2];
                    path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                    break;
                case "L":
                    path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                    break;
                case "H":
                    path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                    break;
                case "V":
                    path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                    break;
                case "Z":
                    path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                    break;
            }
            return path;
        }, fixArc = function(pp, i) {
            if(pp[i].length > 7) {
                pp[i].shift();
                var pi = pp[i];
                while(pi.length) {
                    pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                }
                pp.splice(i, 1);
                ii = mmax(p.length, p2 && p2.length || 0);
            }
        }, fixM = function(path1, path2, a1, a2, i) {
            if(path1 && path2 && path1[i][0] === "M" && path2[i][0] !== "M") {
                path2.splice(i, 0, ["M", a2.x, a2.y]);
                a1.bx = 0;
                a1.by = 0;
                a1.x = path1[i][1];
                a1.y = path1[i][2];
                ii = mmax(p.length, p2 && p2.length || 0);
            }
        };
        for(var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
            p[i] = processPath(p[i], attrs);
            fixArc(p, i);
            p2 && (p2[i] = processPath(p2[i], attrs2));
            p2 && fixArc(p2, i);
            fixM(p, p2, attrs, attrs2, i);
            fixM(p2, p, attrs2, attrs, i);
            var seg = p[i], seg2 = p2 && p2[i], seglen = seg.length, seg2len = p2 && seg2.length;
            attrs.x = seg[seglen - 2];
            attrs.y = seg[seglen - 1];
            attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
            attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
            attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
            attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
            attrs2.x = p2 && seg2[seg2len - 2];
            attrs2.y = p2 && seg2[seg2len - 1];
        }
        return p2 ? [p, p2] : p;
    };
    var _path2curveCacheFunc = null;
    var path2curve = function(path, path2) {
        if(!_path2curveCacheFunc) {
            _path2curveCacheFunc = Cache.func(path2curveImpl);
        }
        return _path2curveCacheFunc(path, path2);
    };
    //-------------------------------------------
    // PathMorpher class definition
    //-------------------------------------------

    var PathMorpher = {};

    /**
     * @param {String} fromPath Path String
     * @param {String} toPath Path String
     * @param {Number} percentage
     *
     * @return {String} current path by percentage
     */
    PathMorpher.getPercentagePath = function(from, to, percentage) {
        if(!from || !to) {
            // error case
            return "";
        }
        var curvePathes = path2curve(String(from), String(to));
        var fromPathArray = curvePathes[0];
        var toPathArray = curvePathes[1];
        var currentPathArray = [];
        for(var i = 0, ii = fromPathArray.length; i < ii; i++) {
            currentPathArray[i] = [fromPathArray[i][0]];
            for(var j = 1, jj = fromPathArray[i].length; j < jj; j++) {
                currentPathArray[i][j] = fromPathArray[i][j] + (toPathArray[i][j] - fromPathArray[i][j]) * percentage / 100;
            }
        }
        return _path2string(currentPathArray);
    };
    /**
     *
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {SVGElement} displayShape
     * @param {Number} percentage
     */
    PathMorpher.svg = function(fromShape, toShape, displayShape, percentage) {
        if(displayShape && toShape && toShape.localName == "path" && (!fromShape || fromShape.localName == "path")) {
            var toPathStr = toShape.getAttribute("d");
            if(toPathStr && toPathStr.length > 1) {
                var displayPathStr;
                if(SVGShapeMetadata.get(toShape, MorphConst.MORPHER_DISABLE_PATH) === true) {
                    displayPathStr = displayShape.getAttribute("d");
                    if(toPathStr !== displayPathStr) {
                        displayShape.setAttribute("d", toPathStr);
                    }
                } else {
                    var fromPathStr = "";
                    if(fromShape) {
                        fromPathStr = fromShape.getAttribute("d");
                    }
                    if(!fromPathStr) {
                        // search for the first init point from toShape's path
                        var cmds = toPathStr.match(pathCommand);
                        if(cmds.length > 0) {
                            fromPathStr = cmds[0];
                        } else {
                            fromPathStr = "M0,0";
                        }
                    }
                    displayPathStr = PathMorpher.getPercentagePath(fromPathStr, toPathStr, percentage);
                    displayShape.setAttribute("d", displayPathStr);
                }
            }
        }
    };
    return PathMorpher;
});

define('sap/viz/vizframe/controls/morpher/utils/TransformParser',[],function() {
    var TransformParser = {};

    var trimString = function(string/*string*/)/*string*/
    {
        return string.replace(/^\s*/, "").replace(/\s*$/, "");
    };

    TransformParser.parse = function(transform) {
        var rotateParams = [];
        var translateParams = [];
        var scaleParams = [];
        if(transform) {
            var trimmedValue;
            if(transform.indexOf("rotate(") >= 0) {
                var transformRotate = transform.substring(transform.indexOf("rotate("));
                transformRotate = transformRotate.substring("rotate(".length, transformRotate.indexOf(")"));
                transformRotate = trimString(transformRotate);
                var rawRotateParams = [];
                if(transformRotate.indexOf(",") > 0) {
                    // number divided by ,
                    rawRotateParams = transformRotate.split(",");
                } else {
                    rawRotateParams = transformRotate.split(" ");
                }
                for(var i = 0; i < rawRotateParams.length && rotateParams.length < 3; i++) {
                    trimmedValue = trimString(rawRotateParams[i]);
                    if(trimmedValue !== "") {
                        trimmedValue = parseFloat(trimmedValue);
                        if(isNaN(trimmedValue)) {
                            trimmedValue = 0;
                        }
                        rotateParams.push(trimmedValue);
                    }
                }
                if(rotateParams.length < 3) {
                    // rotate by 0, 0
                    rotateParams[1] = 0;
                    rotateParams[2] = 0;
                }

            }

            if(transform.indexOf("translate(") >= 0) {
                var transformTranslate = transform.substring(transform.indexOf("translate("));
                transformTranslate = transformTranslate.substring("translate(".length, transformTranslate.indexOf(")"));
                transformTranslate = trimString(transformTranslate);
                var rawTranslateParams = [];
                if(transformTranslate.indexOf(",") > 0) {
                    // number divided by ,
                    rawTranslateParams = transformTranslate.split(",");
                } else {
                    rawTranslateParams = transformTranslate.split(" ");
                }
                for(var j = 0; j < rawTranslateParams.length && translateParams.length < 2; j++) {
                    trimmedValue = trimString(rawTranslateParams[j]);
                    if(trimmedValue !== "") {
                        trimmedValue = parseFloat(trimmedValue);
                        if(isNaN(trimmedValue)) {
                            trimmedValue = 0;
                        }
                        translateParams.push(trimmedValue);
                    }
                }
                if(translateParams.length < 2) {
                    // translate by 0, 0
                    translateParams[1] = 0;
                }
            }

            if(transform.indexOf("scale(") >= 0) {
                var transformScale = transform.substring(transform.indexOf("scale("));
                transformScale = transformScale.substring("scale(".length, transformScale.indexOf(")"));
                transformScale = trimString(transformScale);
                var rawScaleParams = [];
                if(transformScale.indexOf(",") > 0) {
                    // number divided by ,
                    rawScaleParams = transformScale.split(",");
                } else {
                    rawScaleParams = transformScale.split(" ");
                }
                for(var k = 0; k < rawScaleParams.length && scaleParams.length < 2; k++) {
                    trimmedValue = trimString(rawScaleParams[k]);
                    if(trimmedValue !== "") {
                        trimmedValue = parseFloat(trimmedValue);
                        if(isNaN(trimmedValue)) {
                            trimmedValue = 0;
                        }
                        scaleParams.push(trimmedValue);
                    }
                }
                if(scaleParams.length < 2) {
                    // scale by 0, 0
                    scaleParams[1] = 0;
                }
            }
        }

        return {
            rotate : rotateParams.length > 0 ? rotateParams : null,
            translate : translateParams.length > 0 ? translateParams : null,
            scale : scaleParams.length > 0 ? scaleParams : null
        };
    };
    return TransformParser;
});

define('sap/viz/vizframe/controls/morpher/morphers/TransformMorpher',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/constant/MorphConst',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata',
    'sap/viz/vizframe/controls/morpher/utils/TransformParser'],
// @formatter:on
function(MorphConst, SVGShapeMetadata, TransformParser) {
    var TransformMorpher = {};
    /**
     *
     * @param {Number} fromX
     * @param {Number} fromY
     * @param {Number} toX
     * @param {Number} toY
     * @param {Number} percentage
     * @return {String} current translate string, translate(10, 20)
     */
    TransformMorpher.applyTransform = function(fromX, fromY, toX, toY, percentage) {
        var x = fromX + (toX - fromX) * percentage / 100;
        var y = fromY + (toY - fromY) * percentage / 100;
        return "translate(" + x + "," + y + ")";
    };

    /**
     *
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {SVGElement} displayShape
     * @param {Number} percentage
     */
    TransformMorpher.svg = function(fromShape, toShape, displayShape, percentage, useOriginalTranslate) {
        if(displayShape && toShape) {
            var currentTransform = "";
            // translate
            if(fromShape) {
                var fromTransform = TransformParser.parse(fromShape.getAttribute("transform"));
                var toTransform = TransformParser.parse(toShape.getAttribute("transform"));

                if(useOriginalTranslate){
                    // original transform attribute
                    if(fromTransform.translate || toTransform.translate){
                        if(!fromTransform.translate){
                            fromTransform.translate = [0, 0];
                        }
                        if(!toTransform.translate){
                            toTransform.translate = [0, 0];
                        }
                        currentTransform += (currentTransform ? " " : "") +
                                            "translate(" +
                                            (fromTransform.translate[0] + (toTransform.translate[0] - fromTransform.translate[0]) * percentage / 100) + "," +
                                            (fromTransform.translate[1] + (toTransform.translate[1] - fromTransform.translate[1]) * percentage / 100) + ")";
                    }
                }else{
                    // global transform
                    var fromX = SVGShapeMetadata.get(fromShape, MorphConst.SHAPE_GLOBAL_TRANSLATE_X) || 0;
                    var fromY = SVGShapeMetadata.get(fromShape, MorphConst.SHAPE_GLOBAL_TRANSLATE_Y) || 0;
                    var toX = SVGShapeMetadata.get(toShape, MorphConst.SHAPE_GLOBAL_TRANSLATE_X) || 0;
                    var toY = SVGShapeMetadata.get(toShape, MorphConst.SHAPE_GLOBAL_TRANSLATE_Y) || 0;
                    var displayTranslateX = fromX + (toX - fromX) * percentage / 100;
                    var displayTranslateY = fromY + (toY - fromY) * percentage / 100;
                    currentTransform += (currentTransform ? " " : "") +
                                        "translate(" +
                                        displayTranslateX + "," +
                                        displayTranslateY + ")";
                }
                // rotation
                if(fromTransform.rotate || toTransform.rotate){
                    if(!fromTransform.rotate){
                        fromTransform.rotate = [0, 0, 0];
                    }
                    if(!toTransform.rotate){
                        toTransform.rotate = [0, 0, 0];
                    }
                    currentTransform += (currentTransform ? " " : "") +
                                        "rotate(" +
                                        (fromTransform.rotate[0] + (toTransform.rotate[0] - fromTransform.rotate[0]) * percentage / 100) + "," +
                                        (fromTransform.rotate[1] + (toTransform.rotate[1] - fromTransform.rotate[1]) * percentage / 100) + "," +
                                        (fromTransform.rotate[2] + (toTransform.rotate[2] - fromTransform.rotate[2]) * percentage / 100) + ")";
                }
                // scale
                if(fromTransform.scale || toTransform.scale){
                    if(!fromTransform.scale){
                        fromTransform.scale = [0, 0];
                    }
                    if(!toTransform.scale){
                        toTransform.scale = [0, 0];
                    }
                    currentTransform += (currentTransform ? " " : "") +
                                        "scale(" +
                                        (fromTransform.scale[0] + (toTransform.scale[0] - fromTransform.scale[0]) * percentage / 100) + "," +
                                        (fromTransform.scale[1] + (toTransform.scale[1] - fromTransform.scale[1]) * percentage / 100) + ")";
                }

                displayShape.setAttribute("transform", currentTransform);
            }
        }
    };

	return TransformMorpher;
});

define('sap/viz/vizframe/controls/morpher/morphers/TextMorpher',[
// @formatter:off
    'sap/viz/vizframe/controls/morpher/morphers/TransformMorpher'],
// @formatter:on
function(TransformMorpher) {
    var TextMorpher = {};

    var getAttrAsInt = function(svgEl, attrName) {
        var ret = parseInt(svgEl.getAttribute(attrName), 10);
        return isNaN(ret) ? 0 : ret;
    };

    var getAttrAsFloat = function(svgEl, attrName) {
        var ret = parseFloat(svgEl.getAttribute(attrName));
        return isNaN(ret) ? 0 : ret;
    };

    var reg = /(\d+)(in|cm|mm|pt|pc|em|ex|px)/i;

    var getFontSize = function(from, to, percentage) {
        var fromTokens = reg.exec(from);
        if (!fromTokens) {
            // when from = "10", no unit
            fromTokens = [from, from, ""];
        }
        var fromSize = parseInt(fromTokens[1], 10);
        var fromUnit = fromTokens[2];

        var toTokens = reg.exec(to);
        if (!toTokens) {
            // when to = "10", no unit
            toTokens = [to, to, ""];
        }
        var toSize = parseInt(toTokens[1], 10);
        var toUnit = toTokens[2];

        var fromSizeInToUnit = fromSize;

        // TODO add more font size unit support
        // conver from_unit to px
        switch (fromUnit) {
            case "pt":
                fromSizeInToUnit = fromSizeInToUnit * 1.33;
                break;
            case "px":
                fromSizeInToUnit = fromSizeInToUnit;
                break;
            default:
                fromSizeInToUnit = fromSizeInToUnit;
        }

        // conver px to to_unit
        switch (toUnit) {
            case "pt":
                fromSizeInToUnit = fromSizeInToUnit / 1.33;
                break;
            case "px":
                fromSizeInToUnit = fromSizeInToUnit;
                break;
            default:
                fromSizeInToUnit = fromSizeInToUnit;
        }

        return String(Math.round(fromSizeInToUnit + (toSize - fromSizeInToUnit) * percentage / 100)) + toUnit;
    };

    /**
     *
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {SVGElement} displayShape
     * @param {Number} percentage
     */
    TextMorpher.svg = function(fromShape, toShape, displayShape, percentage) {
        if (displayShape && toShape.localName === "g" && toShape.firstChild && toShape.firstChild.localName === "text") {
            if (fromShape && fromShape.localName === "g" && fromShape.firstChild && fromShape.firstChild.localName === "text") {
                // displayShape is g element
                // displayShape.firstChild is text element
                var textFromX = getAttrAsFloat(fromShape.firstChild, "x");
                var textToX = getAttrAsFloat(toShape.firstChild, "x");
                var textFromY = getAttrAsFloat(fromShape.firstChild, "y");
                var textToY = getAttrAsFloat(toShape.firstChild, "y");
                displayShape.firstChild.setAttribute("x", textFromX + (textToX - textFromX) * percentage / 100);
                displayShape.firstChild.setAttribute("y", textFromY + (textToY - textFromY) * percentage / 100);

                var fromFontSize = fromShape.getAttribute("font-size");
                var toFontSize = toShape.getAttribute("font-size");
                if (fromFontSize && toFontSize && fromFontSize != toFontSize) {
                    var displayFontSize = getFontSize(fromFontSize, toFontSize, percentage);
                    displayShape.setAttribute("font-size", displayFontSize);
                }

                TransformMorpher.svg(fromShape.firstChild, toShape.firstChild, displayShape.firstChild, percentage, true);
            } else if (!fromShape) {
                displayShape.setAttribute("opacity", percentage / 100);
            }
        }
    };

    return TextMorpher;
});

define('sap/viz/vizframe/controls/morpher/morphers/ClipPathMorpher',[
// @formatter:off
    'jquery',
    'sap/viz/vizframe/controls/morpher/morphers/RectMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/PathMorpher'],
function($, RectMorpher, PathMorpher) {
// @formatter:on
    var ClipPathMorpher = {};
    
    var getAttrAsInt = function(svgEl, attrName) {
        var ret = parseInt(svgEl.getAttribute(attrName), 10);
        return isNaN(ret) ? 0 : ret;
    };
    
    ClipPathMorpher.svg = function(fromShape, toShape, displayShape, percentage) {
        if (toShape && toShape.localName === "g" && toShape.hasAttribute("clip-path") && 
            fromShape && fromShape.localName === "g" && fromShape.hasAttribute("clip-path")) {
            var morpherSVG = function(shapeType, Morpher) {
                var fromRectShapes = $(fromShape).find(shapeType);
                var toRectShapes = $(toShape).find(shapeType);
                var displayRectShapes = $(displayShape).find(shapeType);
                if (toRectShapes.length && fromRectShapes.length && toRectShapes.length === fromRectShapes.length) {
                    var i;
                    for (i = 0; i < toRectShapes.length; i++) {
                        Morpher.svg(fromRectShapes[i], toRectShapes[i], displayRectShapes[i], percentage);
                    }
                }
            };
            morpherSVG("rect", RectMorpher);
            morpherSVG("path", PathMorpher);
        }
    };
    
    return ClipPathMorpher;
    
});

// @formatter:off
define('sap/viz/vizframe/controls/morpher/Morpher',[
    'jquery',
    'sap/viz/vizframe/common/utils/utils',
    'sap/viz/vizframe/common/utils/OOUtil',
    'sap/viz/vizframe/frame/VizFrameEvent',
    'sap/viz/vizframe/controls/ControlBase',
    'sap/viz/vizframe/controls/morpher/vo/VizShapesHolder',
    'sap/viz/vizframe/controls/morpher/viz/MpShapesCapturer',
    'sap/viz/vizframe/controls/morpher/viz/MpShapesMapper',
    'sap/viz/vizframe/controls/morpher/utils/SVGShapeMetadata',
    'sap/viz/vizframe/controls/morpher/morphers/ColorMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/RectMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/LineMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/PathMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/TextMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/TransformMorpher',
    'sap/viz/vizframe/controls/morpher/morphers/ClipPathMorpher',
    'require'
], function($,
    utils, 
    OOUtil, 
    VizFrameEvent, 
    ControlBase,
    VizShapesHolder, 
    MpShapesCapturer, 
    MpShapesMapper, 
    SVGShapeMetadata,
    ColorMorpher, 
    RectMorpher, 
    LineMorpher, 
    PathMorpher, 
    TextMorpher, 
    TransformMorpher, 
    ClipPathMorpher) {
// @formatter:on

    /**
     * A control module to provide animation when the binding chart (a.k.a viz instance) changes.
     *
     * Mechanism:
     * 0. During morpher creation, it will take a snapshot of its binded vizInstance.
     * 1. Right before chart starting to render, event BeforeRender is dispatched.
     * 2. Morpher handles the event. It hide chart and show itself, allowing chart to render in the background.
     * 3. Right after the chart completes rendering, it dispatches an event named RenderComplete.
     * 4. Morpher handles the event. It makes another snapshot of the new chart.
     *    Based on the new snapshot and the stored one, it generated an animation and display it.
     * 5. After animation completes, Morpher hide itself, show the chart, and store the new snapshot.
     * 6. Morpher free memory and clean up.
     *
     * @param {HTMLElement} dom
     *        the DOM object to host the control.
     * @param {Object} config
     *        the configs to initialize the control.
     * @param {VizFrameProxy} proxy
     *        the proxy to connect the control and viz frame.
     * @extends ControlBase
     * @constructor
     *
     */
    var Morpher = function Morpher(dom, config, proxy) {
        Morpher.superclass.constructor.call(this, dom, config, proxy);
        this.__className = 'sap.viz.vizframe.morpher.Morpher';

        this._requestMorphing = false;
        this._tween = null;

        this._proxy.addEventListener(VizFrameEvent.BEFORE_RENDER, this._onBeforeRender, this);
        this._proxy.addEventListener(VizFrameEvent.AFTER_RENDER, this._onAfterRender, this);
        
        this._setMorpherVisibility(false);
    };

    OOUtil.extend(Morpher, ControlBase);

    /**
     * Bind the vizInstance Container to the morpher controller.
     *
     * Note morpher needs to bind a vizinstance after it is created, or it can not function properly.
     * This is due to the fact that morpher has some different features as to other controllers.
     * It needs direct access to the vizInstanceContainer to hide/show it.
     *
     * @param {HTMLElement} vizInstanceContainer
     * @method
     */
    Morpher.prototype.bindVizInstanceContainer = function (vizInstanceContainer) {
        this._vizInstanceContainer$ = $(vizInstanceContainer);
        this._vizInstanceContainer = vizInstanceContainer;
        this._createMorphLayer();
        this._oldType = this._proxy.vizType();
        this._oldShapes = MpShapesCapturer.getShapes(this._vizInstanceContainer, this._oldType);
        setShapesDisplayState(this._oldShapes, 100);
        MpShapesMapper.map(this._oldShapes, this._oldShapes, this._oldType, this._oldType, this._proxy.dataset());
        placeShapes(this._morphLayer, this._oldShapes, this._proxy.feedingZone());
    };

    /**
     * Destroy the morpher control
     */
    Morpher.prototype.destroy = function () {
        this._oldShapes = null;
        this._oldType = null;
        // There are cases when morpher receive beforeRender and hide the vizInstance,
        // then morpher is disabled right after that,
        // while vizInstance rendering has not completed (therefore still hidden)
        // So we need to set the vizInstance back to visible.
        this._stopPlaying();
        this._setMorpherVisibility(false);

        this._proxy.removeEventListener(VizFrameEvent.BEFORE_RENDER, this._onBeforeRender, this);
        this._proxy.removeEventListener(VizFrameEvent.AFTER_RENDER, this._onAfterRender, this);
        Morpher.superclass.destroy.call(this);
    };

    /**
     * Create a SVG element (a.k.a morph layer) within a morph container to place shapes, it should:
     * 1. have the same css class as the SVG in vizInstance does.
     * 2. have the same size and position as the SVG in vizInstance does.
     *
     * This SVG element has the same life cycle as the morpher does.
     *
     * @private
     */
    Morpher.prototype._createMorphLayer = function() {
        this._morphLayerContainer = document.createElement('div');
        this._morphLayerContainer$ = $(this._morphLayerContainer);
        this._morphLayerContainer$
            .css('overflow', 'hidden')
            .css('position', 'relative')
            .appendTo(this._dom$);
        this._morphLayer = d3.select(this._morphLayerContainer)
                             .append('svg').attr('width', '100%').attr('height', '100%').node();
        this._morphLayer$ = $(this._morphLayer);
        this._syncStyleMorphLayer();
    };
    /**
     * Reset the morph layer to a clean state:
     * - No child elements
     * - The morphLayer container has the same size and position as viz instance container.
     *
     * @private
     */
    Morpher.prototype._resetMorphLayer = function () {
        this._morphLayer$.empty();
        this._syncStyleMorphLayer();
    };

    /**
     * Sync the css style between morph layer (and its container) and the binded vizInstance.
     *
     * @private
     */
    Morpher.prototype._syncStyleMorphLayer = function () {
        var vizInstanceContainer$ = this._vizInstanceContainer$;
        this._morphLayerContainer$
            .width(vizInstanceContainer$.width() || 0)
            .height(vizInstanceContainer$.height() || 0)
            .css(vizInstanceContainer$.offset());
        var vizSvg = vizInstanceContainer$.find("svg");
        if (vizSvg.length > 0) {
            this._morphLayerContainer$.addClass("vc-morph-svg-host " + vizSvg.parent().attr("class"));
        }
    };

    /**
     * Set the visibility of the morpher.
     * The visible object toggles between viz instance container and the morpher.
     *
     * @param {Boolean} visible - if the morpher is visible.
     * @private
     */
    Morpher.prototype._setMorpherVisibility = function (visible) {
        if (visible) {
            this._dom$.show();
            if (this._vizInstanceContainer$) {
                this._vizInstanceContainer$.css("visibility", "hidden");
            }
        } else {
            if (this._vizInstanceContainer$) {
                this._vizInstanceContainer$.css("visibility", "");
            }
            this._dom$.hide();
        }
    };

    /**
     * Handler for beforeRender event.
     * It will hide the viz instance and set requestMorper flag to true.
     *
     * Precondition:
     *  1. vizInstance start to render before this handler finished.
     *  (cuz we need to read vizInstance within the handler)

     * Actions:
     * 1. Stop morphing if it is playing.
     * 2. Show morpher and hide vizInstance,
     * 3. Set requestMoprher flag to true.
     *
     * @param event
     * @private
     */
    Morpher.prototype._onBeforeRender = function (event) {
        this._stopPlaying();
        this._setMorpherVisibility(true);
        this._requestMorphing = true;
    };

    /**
     * Handler for AfterRender event.
     *
     * Precondition:
     *  1. Morpher shall have made a photocopy of previous chart, includes dom and shapes.
     *  2. vizInstance render completed
     *
     * Jobs:
     *  1. Test if morphing is requested.
     *  2. If requested, do necessary preparation for morphing.
     *   - capture new shapes,
     *   - initialize new shapes to proper display state.
     *   - place these new shapes on the morph layer.
     *  3. start animation.
     *
     * @param event
     * @private
     */
    Morpher.prototype._onAfterRender = function (event) {
        if (this._requestMorphing && !this._isPlaying()) {
            var feedingZones = this._proxy.feedingZone();
            var newType = this._proxy.vizType();
            var dataset = this._proxy.dataset();

            /* Preparation for morphing */
            // Capture new shapes in viz instance and save them in newShapes.to
            var newShapes = MpShapesCapturer.getShapes(this._vizInstanceContainer, newType, dataset);
            // Set newShape.from based on the relationship btw oldShapes.display and newShapes.to
            MpShapesMapper.map(newShapes, this._oldShapes, newType, this._oldType, dataset);
            // Set newShape.display based on newShapes.from and newShapes.to
            setShapesDisplayState(newShapes, 0);
            // Place these newShapes in the morphing layer.
            this._resetMorphLayer();
            placeShapes(this._morphLayer, newShapes, feedingZones);

            this._startPlaying(newShapes.allByOrder(), 800, (function () {
                this._oldShapes = newShapes;
                this._oldType = newType;
                this._requestMorphing = false;
                this._tween = null;
            }).bind(this));
        }
    };

    // TODO event handler for render failure.

    /**
     * Is it playing morphing?
     * @return {boolean}
     * @private
     */
    Morpher.prototype._isPlaying = function () {
        return (this._tween !== null);
    };

    /**
     * Stop morphing if it is playing now.
     * @private
     */
    Morpher.prototype._stopPlaying = function () {
        if (this._isPlaying()) {
            this._tween.stop(true, false);
            this._tween.get(0).animationStopCallback();
        }
    };

    /**
     * Show morphing animation in the morphing layer.
     *
     * If animation stops (e.g: stopped by another BeforeRender event), it will run animationStopCallback.
     * If animation completes, it will run animationCompleteCallback, which also set morpher to hidden compared with \
     * animationStopCallback
     *
     * @param shapes
     * @param ms
     * @param morphingStopCallback
     * @private
     */
    Morpher.prototype._startPlaying = function(shapes, ms, morphingStopCallback) {
        this._tween = $({
            percentage : 1,
            animationStopCallback: morphingStopCallback
        });

        var morphingCompleteCallback = (function () {
            morphingStopCallback();
            this._setMorpherVisibility(false);
        }).bind(this);

        this._tween.animate({
            percentage : 100
        }, {
            duration : ms,
            easing : "swing", //or "linear"
            step : function() {
                var percentage = this.percentage;
                morphShapes(shapes, percentage);
            },
            complete : morphingCompleteCallback
        });
    };

    /**
     * Morph shapes to certain state according to percentage:
     * 1. make a copy of toShape and assign the copy to display shape
     * 2. morph to the initial state by percentage.
     *
     * @param {VizShapesHolder} vizShapesHolder
     * @param {Number} percentage
     * @private
     */
    var setShapesDisplayState = function(vizShapesHolder, percentage) {
        percentage = percentage ? percentage : 0;
        var vizShapes = vizShapesHolder.allByOrder();
        for (var i = 0; i < vizShapes.length; i++) {
            var vizShape = vizShapes[i];
            var fromShape = vizShape.from;
            var toShape = vizShape.to;
            if (toShape) {
                var displayShape = vizShape.display = toShape.cloneNode(true);
                SVGShapeMetadata.clone(displayShape, toShape);
                if (percentage !== 100) {
                    morphShape(fromShape, toShape, displayShape, percentage);
                }
            }
        }
    };

    /**
     * Directly Inherited from CVOM HTML
     * generate plot area clip path according to plot feeding zone and place it to morphing layer
     *
     * @private
     * @param {SVGDocument} svg
     * @param {[DropZone]} feedingZones
     *
     */
    var setPlotAreaClipPath = function(svg, feedingZones) {
        var left, top, right, bottom;
        if(feedingZones && feedingZones.length) {
            feedingZones.forEach(function(zone) {
                if (zone.name === "plot") {
                    var plotBound = zone.bound[0];
                    if (!this._currentPlotBound) {
                        this._currentPlotBound = plotBound;
                    }
                    if(this._currentPlotBound && plotBound)
                    {
                        left = Math.min(this._currentPlotBound[0][0], plotBound[0][0]);
                        top = Math.min(this._currentPlotBound[0][1], plotBound[0][1]);
                        right = Math.max(this._currentPlotBound[2][0], plotBound[2][0]);
                        bottom = Math.max(this._currentPlotBound[2][1], plotBound[2][1]);
                    }
                    this._currentPlotBound = plotBound;
                    return;
                }
            }.bind(this));
            var rect = {
                width: right - left,
                height: bottom - top,
                x: left,
                y: top
            };

            var clipPathId = "plot_area_clipPath_morphing";
            var rectElement = d3.select(svg)
                .append('g').attr('clip-path', 'url(#' + clipPathId + ')')
                .append('clipPath').attr('id', clipPathId).append('rect');

            if(this._currentPlotBound)
            {
                rectElement.attr(rect);
            }
        }
    };

    /**
     * Directly Inherited from CVOM HTML
     * add shapes to morphing svg
     *
     * @param {SVGDocument} morphLayer
     * @param {VizShapesHolder} vizShapesHolder
     * @param {[DropZone]} feedingZones
     */
    var placeShapes = function(morphLayer, vizShapesHolder, feedingZones) {
        var shapesByPlotArea = vizShapesHolder.toShapesByPlotArea();

        shapesByPlotArea['outsidePlotArea'].forEach(function (shape) {
            var displayShape = shape.display;
            if (displayShape) {
                morphLayer.appendChild(displayShape);
            }
        });
        // set plotAreaClipPath
        setPlotAreaClipPath(morphLayer, feedingZones);
        var plotAreaGroup = d3.select(morphLayer).select('g[clip-path="url(#plot_area_clipPath_morphing)"]').node();
        plotAreaGroup = plotAreaGroup ? plotAreaGroup : morphLayer;
        shapesByPlotArea['insidePlotArea'].forEach(function (shape) {
            var displayShape = shape.display;
            if (displayShape) {
                plotAreaGroup.appendChild(displayShape);
            }
        });
    };

    /**
     * Directly Inherited from CVOM HTML
     * Morph every single shape
     * Set the displayShape according to fromShape, toShape and percentage.
     *
     * @private
     * @param {SVGElement} fromShape
     * @param {SVGElement} toShape
     * @param {Number} percentage
     */
    var morphShape = function(fromShape, toShape, displayShape, percentage) {
        RectMorpher.svg(fromShape, toShape, displayShape, percentage);
        LineMorpher.svg(fromShape, toShape, displayShape, percentage);
        PathMorpher.svg(fromShape, toShape, displayShape, percentage);
        ColorMorpher.svg(fromShape, toShape, displayShape, percentage);
        TextMorpher.svg(fromShape, toShape, displayShape, percentage);
        TransformMorpher.svg(fromShape, toShape, displayShape, percentage);
        ClipPathMorpher.svg(fromShape, toShape, displayShape, percentage);
    };

    /**
     * Directly inherited from vizMorpher
     * morph all the shapes by percentage
     *
     * @private
     * @param {[VizShape]} visShapes
     * @param {Number} percentage
     */
    var morphShapes = function(visShapes, percentage) {
        for (var i = 0; i < visShapes.length; i++) {
            var vizShape = visShapes[i];
            var fromShape = vizShape.from;
            var toShape = vizShape.to;
            var displayShape = vizShape.display;
            morphShape(fromShape, toShape, displayShape, percentage);
        }
    };

    return Morpher;
});
(function(){
    var list = define && define.__autoLoad;
    if(list && list.length){
        define.__autoLoad = [];
        require(list);
    }
})();
if(define && define.__exportNS){
    define = define.__exportNS;
}
if (window.__sap_viz_internal_requirejs_nextTick__ !== undefined) {
    if (requirejs && requirejs.s && requirejs.s.contexts && requirejs.s.contexts._) {
        requirejs.s.contexts._.nextTick = window.__sap_viz_internal_requirejs_nextTick__;
    }
    window.__sap_viz_internal_requirejs_nextTick__ = undefined;
}