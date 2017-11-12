/*global jQuery:false */
/*global define:false */
/*global d3:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";
jQuery.sap.declare("crosstab-bundle",function(){
    var CrosstabBundleUtil = {};
    CrosstabBundleUtil.createCrosstab = function(manifest, ctx, viComponentType) {
        var properties = jQuery.extend(true, {}, manifest.props(null));
        var width, height, data;
        var eDispatch = d3.dispatch("initialized",
                                    "sizeCalculated",
                                    "crosstableMembersRequest",
                                    "crosstablePageRequest",
                                    "crosstablePropertyChange",
                                    "crosstablePropertyZoneChanged",
                                    "crosstableMousedOver",
                                    "crosstableMenuEvent",
                                    "contextualData");
        var initialized = false;
        var root, crosstabViewer;

        var crosstab = function(container) {
            if (!initialized) {
                initialized = true;
                //root = container.node();
                var oDataModel = data;
                if (!oDataModel.formatArr){
                    oDataModel.formatArr = [];
                }
                registerCrosstabModulePath(viComponentType);

                // initial width and height, was empty constructor originally so sending undefined just in case
                crosstabViewer = new sap.cvom.crosstabviewer.CrosstabViewer(undefined, width, height);

                crosstabViewer.setWidth(width);
                crosstabViewer.setHeight(height);
                crosstabViewer.apply(oDataModel, eDispatch, properties);
                setTimeout(function() {
                    eDispatch.initialized();
                }, 0);
                if (properties) {
                    // Sometimes chart.properties is not called in desktop, so we need to set it here if properties is defined
                    crosstabViewer.setProperties(properties, eDispatch, true);
                }
                crosstabViewer.placeAt(container);
            } else {
                var underlyingCrosstab = crosstabViewer.getUnderlyingCrosstab();
                var pageHeight = underlyingCrosstab.getPageHeight();
                var pageWidth = underlyingCrosstab.getPageWidth();
                if (properties.hideVerticalScrollbar && width > 0 && height > 0) {
                    // do not update the height if width or height is <= 0
                    var totalHeight = crosstabViewer.getTotalHeight();

                    var minHeight = Math.min(pageHeight, totalHeight);
                    height = Math.max(height, minHeight);
                }

                if (properties.hideHorizontalScrollbar) {
                    var totalWidth = crosstabViewer.getTotalWidth();

                    var minWidth = Math.min(pageWidth, totalWidth);
                    width = Math.max(width, minWidth);
                }
                crosstabViewer.setWidth(width);
                crosstabViewer.setHeight(height);
            }
        };


        crosstab.width = function(value) {
            if (!arguments.length) {
                return width;
            }
            width = value;
            return crosstab;
        };

        crosstab.height = function(value) {
            if (!arguments.length) {
                return height;
            }
            height = value;
            return crosstab;
        };

        crosstab.size = function(value) {
            if (!arguments.length) {
                return {
                    width: width,
                    height: height
                };
            }
            width = value.width;
            height = value.height;
            return crosstab;
        };

        crosstab.data = function(value) {
            if (!arguments.length) {
                return data;
            }

            if (crosstabViewer && value) {
                if (value.isMetadata) {
                    crosstabViewer.updateAxesMetadata(value);
                } else if (value.page) {
                    crosstabViewer.addPageData(value);
                }
            }

            data = value;

            return crosstab;
        };

        crosstab.properties = function(props) {
            if (!arguments.length) {
                return properties;
            }

            properties = jQuery.extend({}, properties, props);
            if (crosstabViewer && props) {
                crosstabViewer.setProperties(props, eDispatch);
            }

            return crosstab;
        };

        crosstab.dispatch = function(_) {
            if (!arguments.length) {
                return eDispatch;
            }
            eDispatch = _;
            return crosstab;
        };

        crosstab.destroy = function() {
            if (crosstabViewer !== undefined) {
                // Call destroy to clean up the event subscription
                crosstabViewer.destroy();
                crosstabViewer = null;
            }
        };

        function registerCrosstabModulePath(){
            var declaredModules = jQuery.sap.getAllDeclaredModules();
            if (declaredModules.indexOf("sap.cvom.crosstabviewer.CrosstabViewer")  < 0 ) {
                var crosstabPath = sap.viz.api.env.Resource.path("viz.ext.crosstab");
                jQuery.sap.registerModulePath("sap.basetable", crosstabPath + "sap/basetable");
                sap.ui.getCore().loadLibrary("sap.basetable.crosstab");
                var currentLanguagePaths = sap.viz.api.env.Resource.path("sap.viz.api.env.Language.loadPaths");
                if (!currentLanguagePaths) {
                    currentLanguagePaths = [];
                } else if (typeof currentLanguagePaths === "string") {
                    currentLanguagePaths = [currentLanguagePaths];
                }
                currentLanguagePaths.push(crosstabPath + "libs/langs/");

                sap.viz.api.env.Resource.path("sap.viz.api.env.Language.loadPaths", currentLanguagePaths);
                jQuery.sap.registerModulePath("sap.cvom.crosstabviewer", crosstabPath + "crosstabviewer");
                jQuery.sap.require("sap.cvom.crosstabviewer.CrosstabViewer");
            }
        }
        return crosstab;
    };

    CrosstabBundleUtil.createFeedDef = function(viComponentType) {
        var rowsFeed = {
            "id": "rows",
            "name": "",
            "type": "Dimension",
            "min": 0,
            "max": Number.POSITIVE_INFINITY,
            "aaIndex": 2,
            "acceptMND" : 1
        };

        var valuesFeed = {
            "id": "values",
            "name": "",
            "type": "Measure",
            "min": 0,
            "max": Number.POSITIVE_INFINITY,
            "mgIndex": 1
        };

        var rowsSubTotalsFeed = {
            "id": "r_subtotals",
            "name": "Rows Subtotals",
            "type": "Subtotal",
            "min": 0,
            "max": Number.POSITIVE_INFINITY
        };
        if (viComponentType === "viz/ext/crosstab") {
            var colsFeed = {
                "id": "cols",
                "name": "",
                "type": "Dimension",
                "min": 0,
                "max": Number.POSITIVE_INFINITY,
                "aaIndex": 1,
                "acceptMND" : 2
            };
            return [valuesFeed, colsFeed, rowsFeed, rowsSubTotalsFeed];
        } else {
            return [valuesFeed, rowsFeed, rowsSubTotalsFeed];
        }
    };

    CrosstabBundleUtil.createFeedingzonefn = function(id, selection, feedDef) {
        var div = selection.select("div.v-m-crosstab").node();
        var rect = div.getBoundingClientRect();
        var parentRect = div.parentElement.getBoundingClientRect();
        var bound = [];
        var point1 = [rect.left - parentRect.left, rect.top - parentRect.top];
        var point2 = [point1[0] + rect.width, point1[1]];
        var point3 = [point1[0] + rect.width, point1[1] + rect.height];
        var point4 = [point1[0], point1[1] + rect.height];
        bound.push([point1, point2, point3, point4]);
        var res = {
            name: "plot",
            feedDef: feedDef,
            isCrosstab: true,
            bound: bound
        };
        return [res];
    };

    CrosstabBundleUtil.createModule = function(moduleId, description, feeds, fn) {
        var defaultHeaderLabelProperties = {
            description: "Default font properties and text alignment of dimension header.",
            value: {
                "font-family" : "Arial,Helvetica,sans-serif",
                "font-size" : "11px !important",
                "font-weight" : "bold",
                "color" : "#666",
                "font-style" : "normal",
                "text-align" : "left"
            }
        };

        var defaultHeaderCellProperties = {
            description: "Default background color of dimension header cell.",
            value: {
                "background-color" : "#f2f1f0"
            }
        };

        var defaultMemberLabelProperties = {
            description: "Default font properties and text alignment of dimension member labels.",
            value: {
                "font-family" : "Arial,Helvetica,sans-serif",
                "font-size" : "11px !important",
                "font-weight" : "normal",
                "color" : "#000000",
                "font-style" : "normal",
                "text-align" : "left"
            }
        };

        var defaultMemberCellProperties = {
            description: "Default background color of dimension member labels cell.",
            value: {
                "background-color" : "#ffffff"
            }
        };

        var defaultDataCellPropertiesOdd = {
            description: "Default background color of odd data cell",
            value: {
                "background-color": "#f7f7f8"
            }
        };

        var defaultDataCellPropertiesEven = {
            description: "Default background color of even data cell",
            value: {
                "background-color": "#ffffff"
            }
        };

        var defaultDataCellPropertiesGrandTotals = {
            description: "Default background color of grand totals data cell",
            value: {
                "background-color": "#ffffff"
            }
        };

        var defaultDataCellFontProperties = {
            description: "Default font properties and text alignment of data cells.",
            value: {
                "font-family" : "Arial,Helvetica,sans-serif",
                "font-size" : "11px !important",
                "font-weight" : "normal",
                "color" : "#000000",
                "font-style" : "normal",
                "text-align" : "right"
            }
        };

        return {
            id: moduleId,
            name: "Crosstab",
            type: "SUPPLEMENTARY",
            renderto: "DIV",
            css: {
                // column dimension header
                ".crosstab-ColumnHeaderContainer .crosstab-ColumnDimensionCell-first .crosstab-CellContent" : defaultHeaderLabelProperties,
                ".crosstab-ColumnHeaderContainer .crosstab-ColumnDimensionCell .crosstab-CellContent" : defaultHeaderLabelProperties,
                ".crosstab-ColumnHeaderContainer .crosstab-ColumnDimensionCell-first" : defaultHeaderCellProperties,
                ".crosstab-ColumnHeaderContainer .crosstab-ColumnDimensionCell" : defaultHeaderCellProperties,
                ".crosstab-rightAreaDimensionHeader" : defaultHeaderCellProperties,

                // column member labels
                ".crosstab-TopSection .crosstab-Cell-Top .crosstab-CellContent" : defaultMemberLabelProperties,
                ".crosstab-TopSection .crosstab-Cell .crosstab-CellContent" : defaultMemberLabelProperties,
                ".crosstab-ColumnHeaderContainer .crosstab-FloatingCell" : defaultMemberLabelProperties,
                ".crosstab-TopSection .crosstab-Cell-Top" : defaultMemberCellProperties,
                ".crosstab-TopSection .crosstab-Cell" : defaultMemberCellProperties,

                // row dimension header
                ".crosstab-LeftDimensionHeaders .crosstab-RowDimensionCell .crosstab-CellContent" : defaultHeaderLabelProperties,
                ".crosstab-LeftDimensionHeaders .crosstab-RowDimensionCell" : defaultHeaderCellProperties,

                // row member labels
                ".crosstab-RowAxisHeaderContent .crosstab-Cell-Top .crosstab-CellContent" : defaultMemberLabelProperties,
                ".crosstab-RowAxisHeaderContent .crosstab-Cell .crosstab-CellContent" : defaultMemberLabelProperties,
                ".crosstab-RowAxisheaderContainer .crosstab-FloatingCell" : defaultMemberLabelProperties,
                ".crosstab-RowAxisHeaderContent .crosstab-Cell-Top" : defaultMemberCellProperties,
                ".crosstab-RowAxisHeaderContent .crosstab-Cell" : defaultMemberCellProperties,
                ".crosstab-GrandTotal .crosstab-dimensionHeaderCell .crosstab-Cell" : defaultMemberCellProperties,

                // data cells
                ".crosstab-content-row-odd": defaultDataCellPropertiesOdd,
                ".crosstab-content-row-even": defaultDataCellPropertiesEven,
                ".crosstab-content-row-odd .crosstab-CellContent": defaultDataCellFontProperties,
                ".crosstab-content-row-even .crosstab-CellContent": defaultDataCellFontProperties,
                ".crosstab-GrandTotal .crosstab-DataCell-first" : defaultDataCellPropertiesGrandTotals,
                ".crosstab-GrandTotal .crosstab-DataCell" : defaultDataCellPropertiesGrandTotals
            },
            description: description,
            feeds: feeds,
            fn: fn,
            properties: {
             "hideVerticalScrollbar": {
               "name" : "hideVerticalScrollbar",
               "supportedValueType" : "Boolean",
               "defaultValue" : false,
               "description" : "Set the visibility of the vertical scrollbar."
             },
             "hideHorizontalScrollbar": {
               "name" : "hideHorizontalScrollbar",
               "supportedValueType" : "Boolean",
               "defaultValue" : false,
               "description" : "Set the visibility of the horizontal scrollbar."
             },
             "foldedNodes": {
               "name" : "foldedNodes",
               "supportedValueType" : "Array",
               "defaultValue" : [],
               "description" : "Store the folded nodes."
             },
             "enableFolding": {
               "name" : "enableFolding",
               "supportedValueType" : "Boolean",
               "defaultValue" : true,
               "description" : "Configure whether folding/unfolding is enabled in the crosstab."
             },
             "conditionalFormat": {
                "name" : "conditionalFormat",
                "supportedValueType" : "Array",
                "defaultvalue" : [],
                "description" : "Apply a conditional format to the crosstab"
             },
             "resizedElements": {
               "name" : "resizedElements",
               "supportedValueType" : "Array",
               "defaultValue" : [],
               "description" : "Change the default width/height for specific tuples/dimensions in rows/columns. See resizing indexes in CrosstabElementResizedEventConstants for more information on the meaning of each element."
             },
             "measuresScrollData": {
               "name" : "measuresScrollData",
               "supportedValueType" : "Array",
               "defaultValue" : [],
               "description" : "Keeps the current scroll position of the measures axis. It's used to persist the position after sorting."
             },
             "sizeProperties": {
               "name" : "sizeProperties",
               "supportedValueType" : "Array",
               "defaultValue" : [128, 32, 96, 32],
               "description" : "The default values for row width, row height, column width, and column height. 0 for height means automatic word wrapping."
             },
             "containerId": {
               "name" : "containerId",
               "supportedValueType" : "String",
               "defaultValue" : "",
               "description" : "Set the id of the container"
             },
              "anchoredTotals": {
               "name" : "anchoredTotals",
               "supportedValueType" : "Boolean",
               "defaultValue" : false,
               "description" : "Set the if totals are anchored"
             },
             "subTotals": {
               "name": "subTotals",
               "supportedValueType": "Array",
               "defaultValue": [],
               "description": "A copy of the currently applied totals is at the first element"
             },
             "columnDimensionHeaderVisible": {
                "name" : "columnDimensionHeaderVisible",
                "supportedValueType" : "Boolean",
                "defaultValue" : true,
                "description" : "Set the visibility of the column dimensions header."
            },
            "alternateRowColors": {
                "name" : "alternateRowColors",
                "supportedValueType" : "Boolean",
                "defaultValue" : true,
                "description" : "Set whether rows have alternating background colors."
            }
          }
        };
    };

    CrosstabBundleUtil.createViz = function(id, name, moduleId, feedingzonefn) {
        return {
            id: id,
            name: name,
            modules: {
                root: {
                    id: "sap.viz.modules.divcontainer",
                    configure: {
                        propertyCategory: "root",

                    },
                    modules: {
                        title : {
                            id : "sap.viz.modules.title",
                            configure : {
                                propertyCategory : "title",
                                properties : {
                                    layout : {
                                        position : "top",
                                        priority : 0
                                    },
                                    alignment : "left"
                                }
                            }
                        },
                        crosstab: {
                            id: moduleId,
                            configure: {
                            propertyCategory : "crosstab",
                                properties: {
                                    layout: {
                                        position: "center",
                                        priority: 0
                                    }
                                }
                            }
                        }
                    }
                }
            },
            feedingZone: feedingzonefn
        };
    };

    var crosstabfn = function(manifest, ctx) {
        return CrosstabBundleUtil.createCrosstab(manifest, ctx, "viz/ext/crosstab");
    };

    var crosstabFeedDef = CrosstabBundleUtil.createFeedDef("viz/ext/crosstab");

    var crosstabFeedingzonefn = function(id, selection) {
        return CrosstabBundleUtil.createFeedingzonefn(id, selection, crosstabFeedDef);
    };

    var crosstabModule = CrosstabBundleUtil.createModule("sap.viz.modules.control.crosstab", "A crosstab control to show data.", crosstabFeedDef, crosstabfn);

    var crosstabViz = CrosstabBundleUtil.createViz("viz/ext/crosstab", "Crosstab", "sap.viz.modules.control.crosstab", crosstabFeedingzonefn);

    var vizExtImplcrosstab = {
        viz     : [crosstabViz],
        module: [crosstabModule],
        feeds : []
    };

    var vizExtBundle = sap.bi.framework.declareBundle({
        "id" : "viz.ext.crosstab",
        "dependencies" : [],
        "version" : "1.0.0.0",
        "components" : [
        {
            "id" : "viz/ext/crosstab",
            "provide" : "sap.viz.impls",
            "instance" : vizExtImplcrosstab,
            "customProperties" : {
                "name" : "Crosstab",
                "description" : "CVOM Extension Sample: Crosstab",
                "icon" : {"path" : ""},
                "category" : [],
                "resources" : [{
                    "key" : "viz.ext.crosstab",
                    "path" : "./"
                },
                {
                    "key": "sap.viz.api.env.Language.loadPaths",
                    "path": "./libs/langs"
                },],
                "requires" : [{
                    "id" : "sap.viz.common.core",
                    "version" : "5.9.0"
                }]
            }
        }]
    });


    // register bundle to support Lumira extension framework
    if (sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi")) {
        return sap.bi.framework.getService("sap.viz.aio", "sap.viz.extapi").core.registerBundle(vizExtBundle);
    } else {
        return vizExtBundle;
    }
});
