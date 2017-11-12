/* -----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying
 * source files only (*.type, *.js) or they will be lost after the next generation.
 * ----------------------------------------------------------------------------------- */

/**
 * Initialization Code and shared classes of library sap.viz.ext.basetable (0.0)
 */
jQuery.sap.declare("sap.basetable.crosstab.library");
jQuery.sap.require("sap.ui.core.Core");
/**
 * [Enter description for sap.viz.ext.basetable]
 *
 * @namespace
 * @name sap.viz.ext.basetable
 * @public
 */


// library dependencies
jQuery.sap.require("sap.ui.core.library");

// delegate further initialization of this library to the Core
sap.ui.getCore().initLibrary({
  name : "sap.basetable.crosstab",
  dependencies : ["sap.ui.core"],
  types: [],
  interfaces: [],
  controls: [
    "sap.basetable.crosstab.UI5Crosstab"
  ],
  elements: [],
  version: "0.0"});

