/* ----------------------
 * (c) Copyright 2011 SAP AG. All rights reserved. 
 * SAP and the SAP logo are registered trademarks of SAP AG in Germany and other countries. Business Objects and the Business Objects logo are registered trademarks of Business Objects Software Ltd. Business Objects is an SAP company.
 */

// Provides control sap.ui.core.mvc.JSView.
jQuery.sap.declare("com.sap.bi.nlpa.utils.ViewEx");
jQuery.sap.require("sap.ui.core.mvc.JSView");

/**
 * Constructor for a new mvc/JSView.
 * 
 * It accepts one JSON-like object (object literal) as parameter <code>mSettings</code> that can define values for any
 * property, aggregation, association or event.<br/> If for a control a specific name is ambiguous (a property has the
 * same name as an event), then the framework assumes property, aggregation, association, event in that order.<br/> To
 * resolve ambiguities, add an "aggregation:", "association:" or "event:" prefix to the key in the JSON object.<br/>
 * Allowed values are:
 * <ul>
 * <li>Properties
 * <ul>
 * </ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * </ul>
 * </li>
 * <li>Associations
 * <ul>
 * </ul>
 * </li>
 * <li>Events
 * <ul>
 * </ul>
 * </li>
 * </ul>
 * 
 * For further parameters see {@link sap.ui.core.mvc.View#constructor}
 * 
 * @param {string}
 *            [sId] optional id for the new control; generated automatically if no id is given. Note: this can be
 *            omitted, no matter whether <code>mSettings</code> is given or not!
 * @param {object}
 *            [mSettings] optional map/JSON-object with initial values for the new control.<br/>
 * 
 * @class A View defined/constructed by JavaScript code.
 * @extends sap.ui.core.mvc.View
 * 
 * @author
 * @version 0.17.1
 * 
 * @constructor
 * @public
 */
com.sap.bi.nlpa.utils.ViewEx = function (sId, mSettings) {
    sap.ui.core.mvc.JSView.apply(this, arguments);
};

// chain the prototypes
com.sap.bi.nlpa.utils.ViewEx.prototype = jQuery.sap.newObject(sap.ui.core.mvc.JSView.prototype);

sap.ui.core.Element.defineClass("sap.ui.core.mvc.JSView", {

    // ---- object ----
    baseType: "sap.ui.core.mvc.JSView",
    publicMethods: [],

    // ---- control specific ----
    library: "sap.ui.core",
    properties: {},

    aggregations: {},
    associations: {},
    events: {}

});

(function () {
    var mRegistry = {};

    com.sap.bi.nlpa.utils.ViewEx.prototype._initCompositeSupport = function (mSettings) {

        /** * STEP 1: init View with constructor settings (e.g. parse XML or identify default controller) ** */
        if (this.initViewSettings) {
            this.initViewSettings(mSettings);
        }

        createAndConnectController(this, mSettings);

        if (this.onControllerConnected) {
            this.onControllerConnected(this.oController);
        }

        /** * STEP 2: Fire afterInit ** */
        this.fireAfterInit();

        /** * STEP 3: Allow to auto bind the model ** */
        if (this.bindModel) {
            this.bindModel();
        }

    };

    var createAndConnectController = function (oThis, mSettings) {

        // Controller handling
        var oController = mSettings.controller; // only set when used internally

        if (!oController && oThis.getControllerName) { // check for default controller
            /** * STEP 3: get optional default controller name ** */
            var defaultController = oThis.getControllerName();
            if (defaultController) {
                /** * STEP 4: create controller ** */
                var oControllerClass = jQuery.sap.getObject(defaultController, 1);
                if (oControllerClass) {
                    oThis.oController = new oControllerClass(mSettings);
                } else {
                    oThis.oController = sap.ui.controller(defaultController);
                }

                /** * STEP 5: connect controller ** */
                oThis.oController.connectToView(oThis); // sets view.oController = oController
            }
        } else {
            oThis.oController = oController;
        }
    };
})();