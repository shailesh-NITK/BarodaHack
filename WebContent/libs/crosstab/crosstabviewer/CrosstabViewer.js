jQuery.sap.declare("sap.cvom.crosstabviewer.CrosstabDataModelHelper");

sap.cvom.crosstabviewer.CrosstabDataModelHelper = function () {    
};
/*global jQuery:false */
/*global $:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.cvom.crosstabviewer.CrosstabViewer");

sap.cvom.crosstabviewer.CrosstabViewer = function (contentProviderDataModelHelper, width, height) {
    this.setProviderDataModelHelper(contentProviderDataModelHelper);
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
    this.createCrosstab(width,height);
};

sap.cvom.crosstabviewer.CrosstabViewer.prototype ={

     OPTS: Object.freeze({
        TYPE_SIZE: "sizeCalculated",
        SIZE: "size",
        TYPE_WIDTH: "widthCalculated",
        TYPE_HEIGHT: "heightCalculated",
        WIDTH: "width",
        HEIGHT: "height",
        PADDING: 150,
        SIZE_NOT_CHANGED: -1,
        CROSSTAB_DEFAULT_PADDING: 24 // This is a padding size around crosstab in VizFrame.
    }),

    getProviderDataModelHelper:function() {
        return this._contentProviderDataModelHelper;
    },

    setProviderDataModelHelper:function(contentProviderDataModelHelper) {
        this._contentProviderDataModelHelper=contentProviderDataModelHelper;
    },

    apply:function(contentProviderDataModel, eDispatch, properties) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();
        underlyingCrosstab.setDispatch(eDispatch);

        var pageSizeSpecification;
        if (properties) {
            if (properties.hideVerticalScrollbar && !properties.hideHorizontalScrollbar) {
                // not specifying page row size because we are not paging the rows
                pageSizeSpecification = this._crosstabConstants.PAGE_COLUMN_SIZE_SPECIFICATION;
            } else if (!properties.hideVerticalScrollbar && properties.hideHorizontalScrollbar) {
                // not specifying page column size because we are not paging the columns
                pageSizeSpecification = this._crosstabConstants.PAGE_ROW_SIZE_SPECIFICATION;
            } else if (!properties.hideVerticalScrollbar && !properties.hideHorizontalScrollbar) {
                pageSizeSpecification = this._crosstabConstants.STANDARD_PAGE_SIZE_SPECIFICATION;
            }
        } else {
            pageSizeSpecification = this._crosstabConstants.STANDARD_PAGE_SIZE_SPECIFICATION;
        }

        //Isolate the grand totals only when both anchored totals has been selected and the crosstab's
        //vertical scrollbar is showing (i.e., the "Expand Crosstab to See All Rows" option is off).
        //Otherwise, the crosstab height will be miscalculated, and the totals will appear truncated
        //in the compose room. (See BITVDC25-2307.)
        var isolateGrandTotals = properties.anchoredTotals && !properties.hideVerticalScrollbar;

        var dataProvider = new sap.basetable.crosstab.CrosstabDataProvider(contentProviderDataModel, underlyingCrosstab, pageSizeSpecification, isolateGrandTotals);
        this._oCrosstab.setDataProvider(dataProvider);
    },

    placeAt:function(oRef) {
        if (this._oCrosstab && oRef) {
            this._oCrosstab.placeAt(oRef);
        }
    },

    updateUI:function(contentProviderDataModel) {
        this.reset();
        this.updateCrosstabModel(contentProviderDataModel);
        this.reRendering();
    },

    setWidth:function(w) {
        if ($.isNumeric(w)) {
            w=w+"px";
        }
        this.getCrosstab().setWidth(w);
    },

    setHeight:function(h) {
        if ($.isNumeric(h)) {
            h=h+"px";
        }

        this.getCrosstab().setHeight(h);
    },

    setProperties: function(properties, eDispatch, inhibitRedraw) {
        var noFurtherProcessingRequired = this.setMeasuresScrollData(properties);
        if (noFurtherProcessingRequired) {
            return;
        }

        if (properties.sizeProperties) {
            this.setSizeProperties(properties.sizeProperties);
        }
        if (properties.conditionalFormat) {
            // Set conditional formatting if exists.
            this.setConditionalFormat(properties.conditionalFormat);
        }
        if (properties.resizedElements && properties.resizedElements.length > 0) {
            this.setResizedElements(properties.resizedElements, inhibitRedraw);
        }
        if (properties.anchoredTotals !== undefined) {
            this.setTotalsAnchored(properties.anchoredTotals);
        }
        if (properties.columnDimensionHeaderVisible !== undefined) {
            this.setColumnDimensionHeaderVisible(properties.columnDimensionHeaderVisible);
        }
        this.setScrollableProperties(properties, eDispatch);
        this.setContainerId(properties.containerId);
    },

    setConditionalFormat:function(conditionalFormat) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if (underlyingCrosstab &&
            conditionalFormat &&
            typeof conditionalFormat.conditionalFormatCallBack === "function") {
                underlyingCrosstab.setConditionalFormat(conditionalFormat.conditionalFormatCallBack);
                underlyingCrosstab.setConditionalFormatRules(conditionalFormat.conditionalFormatRules);
        }
    },

    // Handles the measures scroll data. Returns true if no further processing of properties should be done
    setMeasuresScrollData: function(properties) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();
        if (underlyingCrosstab) {
            var crosstabScrollbarController = underlyingCrosstab.getCrosstabScrollBarController();

            // Set measures scroll data if it's present
            if (properties.measuresScrollData && properties.measuresScrollData.length) {
                crosstabScrollbarController.setMeasuresScrollData(properties.measuresScrollData);
            }

            // Stop processing the properties if it's only meant to reset measures scrollbar's data
            if (crosstabScrollbarController && crosstabScrollbarController.isResetingMeasuresScrollData()) {
                return true;
            }

            // Reset measures scroll data if it's not present
            if (!properties.measuresScrollData || properties.measuresScrollData.length === 0) {
                crosstabScrollbarController.setMeasuresScrollData([]);
            }
        }

        return false;
    },

    setScrollableProperties:function(properties, eDispatch) {
        var verticallyScrollable = !properties.hideVerticalScrollbar;
        var horizontallyScrollable = !properties.hideHorizontalScrollbar;
        var width = this.getCrosstab().getWidth();
        var height = this.getCrosstab().getHeight();
        var underlyingCrosstab = this.getUnderlyingCrosstab();
        var isCellJustResized = underlyingCrosstab.crosstabElementResizeHandler().isCellJustResized();
        var isFitToContentOn = !verticallyScrollable && horizontallyScrollable;

        if (underlyingCrosstab) {
            var verticalChanged = underlyingCrosstab.setVerticallyScrollable(verticallyScrollable);
            var horizontalChanged = underlyingCrosstab.setHorizontallyScrollable(horizontallyScrollable);
            var sizeChanged = false;
            // Dispatch a size calculated to inform containers that the size of the crosstab has been recalculated
            // to determine the space required to contain the entire axis-set
            if (verticalChanged && !verticallyScrollable) {
                height = this.getTotalHeight();
                sizeChanged = true;
            }
            if (horizontalChanged && !horizontallyScrollable) {
                width = this.getTotalWidth();
                sizeChanged = true;
            }
            if((sizeChanged || isCellJustResized) && isFitToContentOn) { // This block is only executed when fit-to-content is turned on in Infographic.
                // When fit-to-content is turned on in Infographic, the width must be set to width of vizFrame.
                // Otherwise, it is considered to be resized and sizeChanged event is triggered which causes crosstab to be shrunk everytime we resize column.
                width = parseInt(width) + this.OPTS.CROSSTAB_DEFAULT_PADDING * 2;
                height = this.getTotalHeight();
                sizeChanged = true;
            }
            if (sizeChanged) {
                this.dispatchSizeCalculated(eDispatch, width, height);
            } else {
                // TODO: Hacky fix for BITVDC25-1466
                // Dispatch a dummy event to unblock PDF export
                this.dispatchSizeCalculated(eDispatch, this.OPTS.SIZE_NOT_CHANGED, this.OPTS.SIZE_NOT_CHANGED);
            }
        }
    },

    dispatchSizeCalculated: function(eDispatch, width, height) {
        setTimeout((function() {
            var data = {
                width: parseInt(width),
                height: parseInt(height)
            };
            var payload = {
               name: this.OPTS.TYPE_SIZE,
               data: data
            };
            eDispatch.sizeCalculated(payload);
        }).bind(this), 0);
    },

    setResizedElements: function(resizedElements, inhibitRedraw) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if (underlyingCrosstab && resizedElements) {
            underlyingCrosstab.setResizedElements(resizedElements, inhibitRedraw);
        }
    },

    setSizeProperties: function(sizeProperties) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if (underlyingCrosstab && sizeProperties) {
            underlyingCrosstab.setSizeProperties(sizeProperties);
        }
    },

    setTotalsAnchored: function(anchored) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if (underlyingCrosstab) {
            underlyingCrosstab.setTotalsAnchored(anchored);
        }
    },

    setColumnDimensionHeaderVisible: function(isColumnDimensionHeaderVisible) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();
        if (underlyingCrosstab) {
            underlyingCrosstab.setColumnDimensionHeaderVisible(isColumnDimensionHeaderVisible);
        }
    },

    resize:function() {
        this.getCrosstab().resize();
    },

    destroy:function() {
        this.getCrosstab().destroy();
    },

    /*
     * update crosstable with the new data
     */
    updateCrosstabModel:function(contentProviderDataModel) {

        this.buildModelFromContentProviderDataModel(contentProviderDataModel);

    },

    reRendering:function() {

    },

    createCrosstab:function(width,height) {
        var widthProperty = width + "px";
        var heightProperty = height + "px";
        this._oCrosstab = new sap.basetable.crosstab.UI5Crosstab({
                width : widthProperty,
                height : heightProperty,
                columnCellWidth : this._crosstabConstants.COLUMN_CELL_WIDTH + "px",
                columnCellHeight : this._crosstabConstants.COLUMN_CELL_HEIGHT + "px",
                rowCellHeight : this._crosstabConstants.ROW_CELL_HEIGHT + "px",
                rowCellWidth : this._crosstabConstants.ROW_CELL_WIDTH + "px"
            });
    },

    getCrosstab:function() {
        return this._oCrosstab;
    },

    getUnderlyingCrosstab:function() {
        if(this._oCrosstab && typeof this._oCrosstab.getCrosstab === "function") {
            return this._oCrosstab.getCrosstab();
        }
    },

    getUI:function() {
        return this.getCrosstab();
    },

    buildModelFromContentProviderDataModel:function(contentProviderDataModel) {
        this.getProviderDataModelHelper().buildModelFromContentProviderDataModel(contentProviderDataModel);
    },

    updateAxesMetadata:function(data) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if(underlyingCrosstab && typeof underlyingCrosstab.updateAxesMetadata === "function") {
            underlyingCrosstab.updateAxesMetadata(data);
        }
    },

    addPageData:function(data) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if(underlyingCrosstab && typeof underlyingCrosstab.addPageData === "function") {
            underlyingCrosstab.addPageData(data);
        }
    },

    reset:function() {

    },

    setContainerId: function(containerId) {
        var underlyingCrosstab = this.getUnderlyingCrosstab();

        if (underlyingCrosstab) {
            underlyingCrosstab.setContainerId(containerId);
        }
    },

    getTotalHeight:function() {
        var underlyingCrosstab = this.getUnderlyingCrosstab();
        return  underlyingCrosstab.getTotalHeight() + this.OPTS.PADDING;
    },

    getTotalWidth:function() {
        var underlyingCrosstab = this.getUnderlyingCrosstab();
        return underlyingCrosstab.getTotalWidth() + this.OPTS.PADDING;
    }
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";
jQuery.sap.declare("sap.cvom.crosstabviewer.LanguageManager");

sap.cvom.crosstabviewer.LanguageManager = function (){
  this._cvomLangManager = null;
  this._initialize();
};

sap.cvom.crosstabviewer.LanguageManager.prototype.get = function (id){
  var ret = "";
  if (this._cvomLangManager){
    ret = this._cvomLangManager.getResourceString(id);
  }
  return ret;
};

sap.cvom.crosstabviewer.LanguageManager.prototype._initialize = function (){
  var that = this;
  try {

    that._cvomLangManager = sap.viz.extapi.env.Language;
    // NOTE: The strings added here are only for default values when properties file not present.
    // YOU MUST ALSO ADD YOUR STRINGS TO language.properties FOR TRANSLATION.
    that._cvomLangManager.register({
      id : "language",
      value : {
        XTAB_MEASURE_AXIS_TITLE : "Measures",
        XTAB_SUBTOTAL_LABEL_TOTAL: "Aggregation Total",
        XTAB_SUBTOTAL_LABEL_SUM: "Sum",
        XTAB_SUBTOTAL_LABEL_AVERAGE: "Average",
        XTAB_SUBTOTAL_LABEL_COUNT: "Count",
        XTAB_SUBTOTAL_LABEL_MAX: "Maximum",
        XTAB_SUBTOTAL_LABEL_MIN: "Minimum"
      }
    });
  } catch (e){
    that._cvomLangManager = null;
  }
};
 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *
 * (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare('sap.basetable.crosstab.BaseControl');
jQuery.sap.require('sap.ui.core.Control');
sap.ui.core.Control.extend('sap.basetable.crosstab.BaseControl',
    {
        metadata:
        {
            properties:
            {
                'uiConfig':
                {
                    type: 'object',
                    group: 'Misc',
                    defaultValue: null
                }
            }
        }
    });
sap.basetable.crosstab.BaseControl.prototype.init = function() {
    this._app$ = null;
    this._uiConfig = null;
    this._controls = {};
    this._requestedLoad = null;
    this._handlers = {'resize': null};
};
sap.basetable.crosstab.BaseControl.prototype.exit = function() {
    this._app$ = null;
    this._deregister();
    for (var k in this._controls) {
        this._controls[k].destroy()
    }
};
sap.basetable.crosstab.BaseControl.prototype.onBeforeRendering = function() {
    this._deregister()
};
sap.basetable.crosstab.BaseControl.prototype.onAfterRendering = function() {
    if (!this._app$) {
        this._app$ = jQuery(document.createElement('div')).appendTo(this.getDomRef()).addClass('ui5-viz-controls-app');
        jQuery(this._app$).attr('data-sap-ui-preserve', true);
        this._createChildren();
        this._validateSize()
    } else {
        this._app$.appendTo(this.getDomRef());
        this._validateSize();
        this._updateChildren(this.mProperties)
    }
    // Event listener to all the resizable celles (column depending)
    this._crosstab.addResizeListener();
    this._crosstab.addSortingListener();
    this._register();
};
sap.basetable.crosstab.BaseControl.prototype.getUiConfig = function() {
    return this._uiConfig
};
sap.basetable.crosstab.BaseControl.prototype.setUiConfig = function(u) {
    if (this._app$) {
        return
    }
    this._mergeConfig(u)
};
sap.basetable.crosstab.BaseControl.prototype.save = function() {
    var j = {};
    for (var k in this._controls) {
        j[k] = this._controls[k].save()
    }
    return j
};
sap.basetable.crosstab.BaseControl.prototype.load = function(j) {
    for (var k in j) {
        if (this._controls[k]) {
            this._controls[k].load(j[k])
        } else {
            this._requestedLoad = j
        }
    }
};
sap.basetable.crosstab.BaseControl.prototype._createChildren = function() {
};
sap.basetable.crosstab.BaseControl.prototype._updateChildren = function() {
};
sap.basetable.crosstab.BaseControl.prototype._mergeConfig = function(u) {
    this._uiConfig = u
};
sap.basetable.crosstab.BaseControl.prototype._deregister = function() {
    if (this._handlers.resize) {
        sap.ui.core.ResizeHandler.deregister(this._handlers.resize)
    }
    this._handlers.resize = null
};
sap.basetable.crosstab.BaseControl.prototype._register = function() {
    this._handlers.resize = sap.ui.core.ResizeHandler.register(this.getDomRef(), jQuery.proxy(this._validateSize, this))
};
sap.basetable.crosstab.BaseControl.prototype._validateSize = function() {
};
sap.basetable.crosstab.BaseControl.prototype._registerControl = function(k, c) {
    this._controls[k] = c;
    if (this._requestedLoad && this._requestedLoad[k]) {
        c.load(this._requestedLoad[k]);
        delete this._requestedLoad[k]
    }
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CellGroup");

sap.basetable.crosstab.CellGroup = function (crosstab, index, tuplePaths, groupType, cellType) {
    this._id = index;
    this._tuplePaths = tuplePaths;
    if (cellType) {
        this._cellType = cellType;
    } else {
        this._cellType = sap.basetable.crosstab.CellGroup.CELL_TYPE_DATAPOINTS;
    }
    if (groupType) {
        this._groupType = groupType;
    } else {
        this._groupType = sap.basetable.crosstab.CellGroup.TYPE_INDIVIDUAL;
    }
    this._crosstabModel = crosstab.model();
    this._cellHeight = crosstab.getRowCellHeight();
    this._cellWidth = crosstab.getColumnCellWidth();
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
};

sap.basetable.crosstab.CellGroup.prototype = {
    _mergedContainerId: undefined,
    _data : []
};


sap.basetable.crosstab.CellGroup.CELL_TYPE_DATAPOINTS = "datapoints";
sap.basetable.crosstab.CellGroup.CELL_TYPE_MEMBER_HEADER = "memberHeader";

sap.basetable.crosstab.CellGroup.GROUP_TYPE_RANGE = "range";
sap.basetable.crosstab.CellGroup.GROUP_TYPE_INDIVIDUAL = "individual";

sap.basetable.crosstab.CellGroup.DATA_TYPE_TUPLEPATHS = "tuplePaths";
sap.basetable.crosstab.CellGroup.DATA_TYPE_RAW = "raw";

sap.basetable.crosstab.CellGroup.RENDERER_TYPE_CVOM = "cvom";
sap.basetable.crosstab.CellGroup.RENDERER_TYPE_MINICHART = "minichart";
sap.basetable.crosstab.CellGroup.RENDERER_TYPE_CUSTOM = "custom";

sap.basetable.crosstab.CellGroup.prototype.id = function(id) {
    if (!arguments.length) {
        return this._id;
    }
    this._id = id;
    return this._id;
};

sap.basetable.crosstab.CellGroup.prototype.tuplePaths = function(tuplePaths) {
    if (!arguments.length) {
        return this._tuplePaths;
    }
    this._tuplePaths = tuplePaths;
    return this._tuplePaths;
};

sap.basetable.crosstab.CellGroup.prototype.cellType = function(cellType) {
    if (!arguments.length) {
        return this._cellType;
    }
    this._cellType = cellType;
    return this._cellType;
};

sap.basetable.crosstab.CellGroup.prototype.groupType = function(groupType) {
    if (!arguments.length) {
        return this._groupType;
    }
    this._groupType = groupType;
    return this._groupType;
};

sap.basetable.crosstab.CellGroup.prototype.formats = function (formats) {
    if (!arguments.length) {
        return this._formats;
    }
    this._formats = formats;
};

sap.basetable.crosstab.CellGroup.prototype.expression = function(expression) {
    if (!arguments.length) {
        return this._expression;
    }
    this._expression = expression;
};

sap.basetable.crosstab.CellGroup.prototype.data = function (data, dataType) {
    if (!arguments.length) {
        return this._data;
    }
    if (sap.basetable.crosstab.CellGroup.DATA_TYPE_TUPLEPATHS === dataType) {
        var cellCoordinates = this._getCellCoordinates(this._crosstabModel.getNumberOfTuples(0),
            this._crosstabModel.getNumberOfTuples(1), data, sap.basetable.crosstab.CellGroup.GROUP_TYPE_RANGE);
        this._data = [];
        this._data[0] = [];
        cellCoordinates.forEach(function(cellCoordinate){
            var containerId = "dataCell_" + cellCoordinate[0] + "_" + cellCoordinate[1];
            var cell = $("#" + containerId);
            this._data[0].push(cell.text());
        }.bind(this));
    } else {
        this._data = data;
    }
};

sap.basetable.crosstab.CellGroup.prototype.setMerged = function(isMerged) {
    this._isMerged = isMerged;
};

sap.basetable.crosstab.CellGroup.prototype.isMerged = function() {
    return this._isMerged;
};

sap.basetable.crosstab.CellGroup.prototype.renderer = function(renderer) {
    if (!arguments.length) {
        return this._renderer;
    }
    this._renderer = renderer;
};

sap.basetable.crosstab.CellGroup.prototype.draw = function () {
    if (this._isMerged) {
        var data = this.data();
        this.mergeCell();
        if (data.length > 0) {
            this.data(data);
        }
        this._drawCell(this._mergedContainerId, this._data[0]);
    } else {
        var numberOfRowTuple = this._crosstabModel.getNumberOfTuples(0);
        var numberOfColumnTuple = this._crosstabModel.getNumberOfTuples(1);
        var cellCoordinates = this._getCellCoordinates(numberOfRowTuple, numberOfColumnTuple, this._tuplePaths, this._groupType);
        cellCoordinates.forEach(function(cellCoordinate, index){
            var containerId = "dataCell_" + cellCoordinate[0] + "_" + cellCoordinate[1];
            var cell = $("#" + containerId);
            var content = this._data.length > 0 ? this._data[index] : cell.text();
            this._drawCell(containerId, content);
        }.bind(this));
    }
};

sap.basetable.crosstab.CellGroup.prototype.mergeCell = function () {
    var numberOfRowTuple = this._crosstabModel.getNumberOfTuples(0);
    var numberOfColumnTuple = this._crosstabModel.getNumberOfTuples(1);
    var cellCoordinates = this._getCellCoordinates(numberOfRowTuple, numberOfColumnTuple, this._tuplePaths, this._groupType);
    var mergedParentTR;
    this._data = [];
    this._data[0] = [];
    cellCoordinates.forEach(function(cellCoordinate, index){
        var containerId = "dataCell_" + cellCoordinate[0] + "_" + cellCoordinate[1];
        var cell = $("#" + containerId);
        this._data[0].push(cell.text());
        var parentTD = $("#" + containerId).closest("td");
        var parentTR = $("#" + containerId).closest("tr");
        if (index === 0) {
            mergedParentTR = parentTR;
        }
        parentTR[0].removeChild(parentTD[0]);
    }.bind(this));
    var start = cellCoordinates[0];
    var end = cellCoordinates[cellCoordinates.length - 1];
    this._mergedContainerId = "dataCell_" + start[0] + "_" + start[1];
    var rowSpan = end[0] - start[0] + 1;
    var colSpan = end[1] - start[1] + 1;
    var newCell = sap.basetable.crosstab.utils.RenderUtils.createContentCell(this._mergedContainerId, this._cellWidth(),
    this._cellHeight(), this._borderWidth(), undefined, false, false, rowSpan, colSpan, this._crosstabConstants.CELL);
    mergedParentTR.append(newCell);
    this._isMerged = true;
};

sap.basetable.crosstab.CellGroup.prototype._getTupleIndex = function (tuplePath) {
        var rowTupleIndexRange = [];
        var columnTupleIndexRange = [];
        rowTupleIndexRange = this._crosstabModel.getTupleIndex(0, tuplePath);
        if (rowTupleIndexRange === undefined) {
            rowTupleIndexRange = [];
            columnTupleIndexRange = this._crosstabModel.getTupleIndex(1, tuplePath);
        }
        return {"rowTupleIndexRange" : rowTupleIndexRange, "columnTupleIndexRange" : columnTupleIndexRange};
};

sap.basetable.crosstab.CellGroup.prototype._getCellCoordinates = function (numberOfRowTuple, numberOfColumnTuple, tuplePaths, groupType) {
    var cellCoordinates = [];
    tuplePaths.forEach(function(tuplePaths) {
        var tupleIndexRanges = [];
        var rowTupleIndexRange = [];
        var columnTupleIndexRange = [];
        var wholeColumn = false;
        var wholeRow = false;
        if (tuplePaths.length === 1) {
            tupleIndexRanges = this._getTupleIndex(tuplePaths[0]);
            if (tupleIndexRanges.rowTupleIndexRange.length === 0) {
                columnTupleIndexRange = tupleIndexRanges.columnTupleIndexRange;
                wholeColumn = true;
            } else {
                rowTupleIndexRange = tupleIndexRanges.rowTupleIndexRange;
                wholeRow = true;
            }
        } else if (tuplePaths.length === 2) {
            for (var i = 0; i < tuplePaths.length; i++) {
                tupleIndexRanges = this._getTupleIndex(tuplePaths[i]);
                if (tupleIndexRanges.rowTupleIndexRange.length === 0) {
                    columnTupleIndexRange = tupleIndexRanges.columnTupleIndexRange;
                } else {
                    rowTupleIndexRange = tupleIndexRanges.rowTupleIndexRange;
                }
            }
        }
        if (wholeColumn) {
            for (var j = 0; j < numberOfRowTuple; j++) {
                for (var k = columnTupleIndexRange[0]; k < columnTupleIndexRange[1]; k++) {
                    cellCoordinates.push([j, k]);
                }
            }
        } else if (wholeRow) {
            for (var l= rowTupleIndexRange[0]; l < rowTupleIndexRange[1]; l++) {
                for (var m = 0; m < numberOfColumnTuple; m++) {
                    cellCoordinates.push([l, m]);
                }
            }
        } else {
            cellCoordinates.push([rowTupleIndexRange[0], columnTupleIndexRange[0]]);
        }

    }.bind(this));
    if (groupType === sap.basetable.crosstab.CellGroup.GROUP_TYPE_RANGE) {
        var start = cellCoordinates[0];
        var end = cellCoordinates[1];
        cellCoordinates = [];
        for (var i = start[0]; i <= end[0]; i++) {
            for (var j = start[1]; j <= end[1]; j++) {
                cellCoordinates.push([i, j]);
            }
        }
    }
    return cellCoordinates;
};


sap.basetable.crosstab.CellGroup.prototype._drawCell = function (containerId, content) {
    var renderer = this._renderer;
    if (renderer) {
        var type = renderer.type;
        if (sap.basetable.crosstab.CellGroup.RENDERER_TYPE_CVOM === type) {
            sap.basetable.crosstab.renderer.CVOMRenderer.render(renderer.body, containerId, content, this._formats);
        } else if (sap.basetable.crosstab.CellGroup.RENDERER_TYPE_MINICHART === type) {
            var data =
            {
                  "analysisAxis":[{
                      "index":1,
                      "data":[{
                          "type":"Dimension",
                          "values":[]
                      }]
                  }],
                  "measureValuesGroup":[{
                      "index":1,
                      "data":[{
                          "type":"Measure",
                          "values":[]
                      }]
                  }]
            };
            data.measureValuesGroup[0].data[0].values[0] = [];
            content.forEach(function(value) {
                data.measureValuesGroup[0].data[0].values[0].push(parseFloat(value));
                data.analysisAxis[0].data[0].values.push("0");
            });
            sap.basetable.crosstab.renderer.CVOMRenderer.render(renderer.body, containerId, data, this._formats);
        } else if (sap.basetable.crosstab.CellGroup.RENDERER_TYPE_CUSTOM === type) {
            sap.basetable.crosstab.renderer.CustomRenderer.render(renderer.body, containerId, content, this._formats);
        }
    } else {
        sap.basetable.crosstab.renderer.StringRenderer.render(containerId, content, this._formats);
    }
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.ConditionalCellFormatter");


sap.basetable.crosstab.ConditionalCellFormatter = function(rowDimensionIds, leafTuplePathsOnRow, columnDimensionIds, leafTuplePathsOnColumn, crosstabConstants, model) {
    this._model = model;
    this._crosstabConstants = crosstabConstants;
    this._queryResponseUtils = model.getQueryResponseUtils();
    this._rowDimensionIds = rowDimensionIds;
    this._rowMemberMatrix = this._constructMemberMatrix(leafTuplePathsOnRow, model.getModifiedMemberKeys());
    this._columnDimensionIds = columnDimensionIds;
    this._columnMemberMatrix = this._constructMemberMatrix(leafTuplePathsOnColumn, model.getModifiedMemberKeys());
    this._measureIds = model.getMeasureMap();
};

sap.basetable.crosstab.ConditionalCellFormatter.prototype.getStyles = function(rowIndex, columnIndex, cellValue, styleGenerator) {
    var styles = {};

    if (typeof styleGenerator !== "function") {
        return styles;
    }

    var valuesForEntityIds = this._getValuesForEntityIds(rowIndex, columnIndex, cellValue);
    styles = styleGenerator(valuesForEntityIds);
    return styles;
};

sap.basetable.crosstab.ConditionalCellFormatter.prototype._constructMemberMatrix = function(tuplePaths, modifiedMemberKeys) {
    if (!Array.isArray(tuplePaths)) {
        return [];
    }

    return tuplePaths.map(function(tuplePath) {
        // memberKeys which contains TUPLE_PATH_DELIMITER will be modified and stored in modifiedMemberKeys
        // pass in modifiedMemberKeys list when parsing tuplePath will get the original member ids insetad of the modified ones.
        return sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(tuplePath, modifiedMemberKeys);
    }, this);
};

sap.basetable.crosstab.ConditionalCellFormatter.prototype._getValuesForEntityIds = function(rowIndex, columnIndex, cellValue) {

    var valuesForEntityIds = {};

    var rowMemberIds = this._rowMemberMatrix[rowIndex];
    this._addValuesForEntityIds(valuesForEntityIds, rowMemberIds, this._rowDimensionIds, rowIndex, cellValue);

    var columnMemberIds = this._columnMemberMatrix[columnIndex];
    this._addValuesForEntityIds(valuesForEntityIds, columnMemberIds, this._columnDimensionIds, columnIndex, cellValue);

    return valuesForEntityIds;
};

sap.basetable.crosstab.ConditionalCellFormatter.prototype._addValuesForEntityIds = function(valuesForEntityIds, memberIds, dimensionIds, cellIndex, cellValue) {
    var dimensionId;
    var memberValue;

    if(!Array.isArray(memberIds)) {
        return;
    }

    for (var i = 0; i < memberIds.length; i++) {
        dimensionId = dimensionIds[i];
        if (dimensionId === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
            //The conditional formatting rules are based on the measure metadata ids, so we must use the metadata id's
            //as keys for the valuesForEntityIds map (see BITVDC25-2075).
            valuesForEntityIds[this._model.getMeasureMetadataId(this._measureIds[cellIndex])] = cellValue;
        } else {
            if (this._model.isNumericDataType(dimensionId)) {
                // For certain data types, we must not convert memberKeys (number) to memberCaption (string) considering cell formatting.
                // For example, if a memberKey is 10000 in integer and is cell formatted to use a thousand separator, memberCaption is "10,000" which is NaN and that is incorrect.
                // The same thing is applied to percentage, bracket for negative numbers, custom prefix and suffix too.
                memberValue = memberIds[i];
                switch (memberValue) {
                    case this._crosstabConstants.NULL_VALUE:
                        memberValue = null;
                        break;
                    case this._crosstabConstants.EMPTY_VALUE:
                        memberValue = "";
                        break;
                    default:
                        memberValue = Number(memberValue);
                }
            } else {
                memberValue = this._queryResponseUtils.getCaption(dimensionId, memberIds[i]);
                memberValue = memberValue === this._crosstabConstants.NULL_VALUE ? null : memberValue;
                memberValue = memberValue === this._crosstabConstants.EMPTY_VALUE ? "" : memberValue;
            }
            valuesForEntityIds[dimensionId] = memberValue;
        }
    }
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/

"use strict";
jQuery.sap.declare("sap.basetable.crosstab.Crosstab");

sap.basetable.crosstab.Crosstab = function (crosstabContext) {
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
    this._crosstabScrollBarEventMediator = new sap.basetable.crosstab.CrosstabScrollBarEventMediator();
    this._crosstabScrollBarEventConstants = new sap.basetable.crosstab.CrosstabScrollBarEventConstants();
    this._languageManager = new sap.cvom.crosstabviewer.LanguageManager();
    this._crosstabElementResizedEventConstants = new sap.basetable.crosstab.CrosstabElementResizedEventConstants();
    this._model = new sap.basetable.crosstab.CrosstabModel(crosstabContext,
                                                            this,
                                                            this._crosstabScrollBarEventMediator,
                                                            this._crosstabScrollBarEventConstants);
    this._container = crosstabContext.container;
    this._size = crosstabContext.size;
    this._sizeProperties = null;
    this._totalsAnchored = false;
    this._id = crosstabContext.parentId;
    this._containerId = null;
    this._crosstabContainers = new sap.basetable.crosstab.CrosstabContainers(this, this._crosstabScrollBarEventMediator, this._crosstabScrollBarEventConstants);
    this._renderer = new sap.basetable.crosstab.CrosstabRenderer(this, this._crosstabScrollBarEventMediator, crosstabContext);
    this._registerScrollBarEvents();
    this._crosstabScrollBarController = new sap.basetable.crosstab.CrosstabScrollBarController(this, this._crosstabScrollBarEventMediator, this._crosstabScrollBarEventConstants);
    this._conditionalFormat = null;
    this._conditionalFormatRules = [];
    this._crosstabElementResizeHandler = new sap.basetable.crosstab.CrosstabElementResizeHandler(this,
                                                                                this._model,
                                                                                this._renderer,
                                                                                this._crosstabElementResizedEventConstants);
    this.addResizeListener();

    this._selectionHandler = new sap.basetable.crosstab.CrosstabSelectionHandler(this);
    this._sortingHandler = new sap.basetable.crosstab.CrosstabSortingHandler(this);
    this._contextMenuHandler = new sap.basetable.crosstab.CrosstabContextMenuHandler(this);
    this._tooltipHandler = new sap.basetable.crosstab.CrosstabTooltipHandler(this);
    this._selectionHandler.addSelectionListeners();
    this._contextMenuHandler.addContextMenuListeners();
    this._tooltipHandler.initTooltips();
};

sap.basetable.crosstab.Crosstab.prototype = {
    _verticallyScrollable : true,
    _horizontallyScrollable : true,
    _scaleFactor : 1,
    _isColumnDimensionHeaderVisible : true,
    BORDER_WIDTH : 1,
    EXTRA_ROW_BUFFER : 1
};

sap.basetable.crosstab.Crosstab.prototype.getColumnCellWidth = function () {
    if (this._sizeProperties &&
            this._sizeProperties.length &&
            this._sizeProperties[this._crosstabConstants.DEFAULT_COLUMN_WIDTH_INDEX]) {
        return this._sizeProperties[this._crosstabConstants.DEFAULT_COLUMN_WIDTH_INDEX];
    }
    return this._size.columnCellWidth ? this._size.columnCellWidth : this._crosstabConstants.COLUMN_CELL_WIDTH;
};

sap.basetable.crosstab.Crosstab.prototype.getColumnCellHeight = function () {
    if (this._sizeProperties &&
            this._sizeProperties.length &&
            this._sizeProperties[this._crosstabConstants.DEFAULT_COLUMN_HEIGHT_INDEX]) {
        return this._sizeProperties[this._crosstabConstants.DEFAULT_COLUMN_HEIGHT_INDEX];
    }
    return this._size.columnCellHeight ? this._size.columnCellHeight : this._crosstabConstants.COLUMN_CELL_HEIGHT;
};

sap.basetable.crosstab.Crosstab.prototype.getRowCellHeight = function() {
    if (this._sizeProperties &&
            this._sizeProperties.length &&
            this._sizeProperties[this._crosstabConstants.DEFAULT_ROW_HEIGHT_INDEX]) {
        return this._sizeProperties[this._crosstabConstants.DEFAULT_ROW_HEIGHT_INDEX];
    }
    return this._size.rowCellHeight ? this._size.rowCellHeight : this._crosstabConstants.ROW_CELL_HEIGHT;
};

sap.basetable.crosstab.Crosstab.prototype.getRowCellWidth = function() {
    if (this._sizeProperties &&
            this._sizeProperties.length &&
            this._sizeProperties[this._crosstabConstants.DEFAULT_ROW_WIDTH_INDEX]) {
        return this._sizeProperties[this._crosstabConstants.DEFAULT_ROW_WIDTH_INDEX];
    }
    return this._size.rowCellWidth ? this._size.rowCellWidth : this._crosstabConstants.ROW_CELL_WIDTH;
};

sap.basetable.crosstab.Crosstab.prototype.getBorderWidth = function () {
    return this._size.borderWidth ? this._size.borderWidth : this.BORDER_WIDTH;
};

sap.basetable.crosstab.Crosstab.prototype.getId = function() {
    return this._id;
};

sap.basetable.crosstab.Crosstab.prototype.getContainerId = function() {
    return this._containerId;
};

sap.basetable.crosstab.Crosstab.prototype.setContainerId = function(containerId) {
    if (containerId) {
        this._containerId = containerId;
    }
};

sap.basetable.crosstab.Crosstab.prototype.getHeight = function() {
    return this._size.height;
};

sap.basetable.crosstab.Crosstab.prototype.getWidth = function() {
    return this._size.width;
};


sap.basetable.crosstab.Crosstab.prototype.getTotalHeight = function () {
    return this.getSize(this._crosstabConstants.ROW_AXIS_INDEX, true);
};

sap.basetable.crosstab.Crosstab.prototype.getTotalWidth = function() {
    return this.getSize(this._crosstabConstants.COLUMN_AXIS_INDEX, true);
};

sap.basetable.crosstab.Crosstab.prototype.getSize = function (axis, ofEntireAxis) {
    var releventCellDimension = 0;
    var releventCellDimensionInOtherAxis = 0;

    if (axis === this._crosstabConstants.ROW_AXIS_INDEX) {

        if (ofEntireAxis) {
            releventCellDimension += this._renderer.calculateRowAxisHeight();
        } else {
            releventCellDimension += this._renderer.calculateBottomSectionHeight(true);
        }

        releventCellDimensionInOtherAxis = this._renderer.calculateTopSectionHeight();
    } else {
        releventCellDimension += this._renderer.calculateRightAreaWidth(ofEntireAxis);
        releventCellDimensionInOtherAxis = this._renderer.calculateLeftAreaWidth();
    }
    return releventCellDimension + releventCellDimensionInOtherAxis;
};

sap.basetable.crosstab.Crosstab.prototype.getPageWidth = function() {
    return this.getSize(this._crosstabConstants.COLUMN_AXIS_INDEX, false);
};

sap.basetable.crosstab.Crosstab.prototype.getPageHeight = function() {
    return this.getSize(this._crosstabConstants.ROW_AXIS_INDEX, false);
};

sap.basetable.crosstab.Crosstab.prototype.isColumnDimensionHeaderVisible = function() {
    return this._isColumnDimensionHeaderVisible;
};

sap.basetable.crosstab.Crosstab.prototype._registerScrollBarEvents = function(){
    this._registerBorderEvent();
    this._registerNextPageEvent();
    this._registerUpdateAxisLengthEvent();
};

sap.basetable.crosstab.Crosstab.prototype._registerBorderEvent = function(){
    this._crosstabScrollBarEventMediator.subscribe(this._crosstabScrollBarEventConstants.borderEvent, this.borderEvent.bind(this));
};

sap.basetable.crosstab.Crosstab.prototype.borderEvent = function(isVertical){
    this.getRenderer().updateContainerBordersEvent(isVertical);
};

sap.basetable.crosstab.Crosstab.prototype._registerNextPageEvent = function (){
    this._crosstabScrollBarEventMediator.subscribe(this._crosstabScrollBarEventConstants.nextPageEvent, this.requestNextPageEvent.bind(this));
};

sap.basetable.crosstab.Crosstab.prototype.requestNextPageEvent = function(pageData){
    this.model().fetchPage(pageData);
};

sap.basetable.crosstab.Crosstab.prototype._registerUpdateAxisLengthEvent = function(){
    this._crosstabScrollBarEventMediator.subscribe(this._crosstabScrollBarEventConstants.updateAxisLength, this.updateAxisLength.bind(this));
};

sap.basetable.crosstab.Crosstab.prototype.updateAxisLength = function(eventData){
    var scrollBarVisibility = this._renderer.getScrollbarVisibility();
    this._crosstabScrollBarController.updateScrollBars(this._crosstabScrollBarEventConstants.updateAxisLength, eventData, scrollBarVisibility);
};

sap.basetable.crosstab.Crosstab.prototype.container = function () {
    return this._container;
};

sap.basetable.crosstab.Crosstab.prototype.model = function () {
    return this._model;
};

sap.basetable.crosstab.Crosstab.prototype.crosstabElementResizeHandler = function() {
    return this._crosstabElementResizeHandler;
};

sap.basetable.crosstab.Crosstab.prototype.selectionHandler = function () {
    return this._selectionHandler;
};

sap.basetable.crosstab.Crosstab.prototype.sortingHandler = function() {
    return this._sortingHandler;
};

sap.basetable.crosstab.Crosstab.prototype.contextMenuHandler = function() {
    return this._contextMenuHandler;
};

sap.basetable.crosstab.Crosstab.prototype.tooltipHandler = function() {
    return this._tooltipHandler;
};

sap.basetable.crosstab.Crosstab.prototype.conditionalFormat = function() {
    return this._conditionalFormat;
};

sap.basetable.crosstab.Crosstab.prototype.setConditionalFormat = function(conditionalFormat) {
    this._conditionalFormat = conditionalFormat;
};

sap.basetable.crosstab.Crosstab.prototype.setConditionalFormatRules = function(conditionalFormatRules) {
    if(conditionalFormatRules === null || conditionalFormatRules === undefined) {
        conditionalFormatRules = [];
    }
    if( conditionalFormatRules.length > 0  || this._conditionalFormatRules.length !== conditionalFormatRules.length && typeof this.draw === "function"){
        this.redraw(this._crosstabScrollBarEventConstants.conditionalFormatEvent);
    }
    this._conditionalFormatRules = conditionalFormatRules;
};

sap.basetable.crosstab.Crosstab.prototype.getConditionalFormatRules = function(){
    return this._conditionalFormatRules;
};

sap.basetable.crosstab.Crosstab.prototype.setResizedElements = function(resizedElements, inhibitRedraw) {
    resizedElements = resizedElements || [];
    this._crosstabElementResizeHandler.setResizedElements(resizedElements);
    if (!inhibitRedraw && typeof this.draw === "function") {
        this.redraw(this._crosstabElementResizedEventConstants.ELEMENT_RESIZED_EVENT);
    }
};

sap.basetable.crosstab.Crosstab.prototype.setSizeProperties = function(sizeProperties) {
    if (sizeProperties && sizeProperties.length) {
        this._sizeProperties = sizeProperties;
        this._dispatch.initialized();
    }
};

sap.basetable.crosstab.Crosstab.prototype.setTotalsAnchored = function(totalsAnchored) {
    if(this._totalsAnchored !== totalsAnchored) {
        this._totalsAnchored = totalsAnchored;
    }
};

sap.basetable.crosstab.Crosstab.prototype.isTotalsAnchored = function() {
    return this._totalsAnchored;
};

sap.basetable.crosstab.Crosstab.prototype.setColumnDimensionHeaderVisible = function(isColumnDimensionHeaderVisible) {
    if (this._isColumnDimensionHeaderVisible !== isColumnDimensionHeaderVisible) {
        this._isColumnDimensionHeaderVisible = isColumnDimensionHeaderVisible;
        this.redraw(this._crosstabConstants.COLUMN_DIMENSION_HEADER_VISIBILITY);
    }
};

sap.basetable.crosstab.Crosstab.prototype.crosstabContainers = function() {
    return this._crosstabContainers;
};

sap.basetable.crosstab.Crosstab.prototype.getRenderer = function() {
    return this._renderer;
};

sap.basetable.crosstab.Crosstab.prototype.getCrosstabScrollBarController = function() {
    return this._crosstabScrollBarController;
};

sap.basetable.crosstab.Crosstab.prototype.select = function (tuplePaths, groupType, cellType) {
    return this._model.select(tuplePaths, groupType, cellType);
};

sap.basetable.crosstab.Crosstab.prototype.setDataProvider = function (dataProvider) {
    this._model.setDataProvider(dataProvider);
};

sap.basetable.crosstab.Crosstab.prototype.setDispatch = function (dispatch) {
    this._dispatch = dispatch;
};

sap.basetable.crosstab.Crosstab.prototype.getDispatch = function () {
    return this._dispatch;
};

sap.basetable.crosstab.Crosstab.prototype.vizUpdate = function (dataProvider) {
    this.setDataProvider(dataProvider);
    this._renderer.draw();
    this.renderCellGroups();
};

sap.basetable.crosstab.Crosstab.prototype.renderCellGroups = function () {
    var cellGroups = this._model.getCellGroups();
    cellGroups.forEach(function(cellGroup) {
        cellGroup.draw();
    });
};

sap.basetable.crosstab.Crosstab.prototype.redraw = function (type, eventData) {
    var scrollBarVisibility = this._renderer.getScrollbarVisibility();
    if(type === this._crosstabScrollBarEventConstants.conditionalFormatEvent){
        this._renderer.redrawFromConditionalFormatting();
        this._crosstabScrollBarController.updateScrollBars(type, eventData, scrollBarVisibility);
        this.addResizeListener();
        this.addSortingListener();
    } else if (type === this._crosstabScrollBarEventConstants.newPageEvent){
        this._renderer.redrawFromPageData(eventData);
        this._crosstabScrollBarController.updateScrollBars(type, eventData, scrollBarVisibility);
        this._addFeedbackDuringPaging();
        this.addResizeListener();
        this.addSortingListener();
    } else if (type === this._crosstabElementResizedEventConstants.ELEMENT_RESIZED_EVENT) {
        var resizedElements = JSON.stringify(this._crosstabElementResizeHandler.getResizedElements(
                                                this._crosstabElementResizedEventConstants.COLUMN_AXIS_COLUMN_WIDTH)) + ":" +
                                    JSON.stringify(this._crosstabElementResizeHandler.getResizedElements(
                                                this._crosstabElementResizedEventConstants.ROW_AXIS_COLUMN_WIDTH)) + ":" +
                                    JSON.stringify(this._crosstabElementResizeHandler.getResizedElements(
                                                this._crosstabElementResizedEventConstants.ROW_AXIS_ROW_HEIGHT)) + ":" +
                                    JSON.stringify(this._crosstabElementResizeHandler.getResizedElements(
                                                        this._crosstabElementResizedEventConstants.COLUMN_AXIS_ROW_HEIGHT)) + "::" +
                                    JSON.stringify(this._sizeProperties);
        if (!this._lastResizedElements || this._lastResizedElements !== resizedElements) {
            this.draw(this._size.height, this._size.width, true);
            this.addResizeListener();
            this._lastResizedElements = resizedElements;
            this.setCellJustResized(true);
            this.addSortingListener();
        }
    } else if (type === this._crosstabConstants.COLUMN_DIMENSION_HEADER_VISIBILITY) {
        this.draw(this._size.height, this._size.width);
        this.addResizeListener();
        this.addSortingListener();
    }
};

sap.basetable.crosstab.Crosstab.prototype.draw = function (height, width, isResize) {
    this._updateSize(height, width);
    this.model().initializePageManagerForAnchoredTotals();
    this._renderer.draw(height, width);
    var scrollBarVisibility = this._renderer.getScrollbarVisibility();
    this._crosstabScrollBarController.draw(isResize, scrollBarVisibility);
    this._crosstabScrollBarController.attachCrosstabTouchEvents(scrollBarVisibility);
    this.model().initializeAxesMetadata();
    this._addFeedbackDuringPaging();
};

sap.basetable.crosstab.Crosstab.prototype.drawSection = function (sectionData) {

    var coordinates = sectionData.coordinates;

    var lastAvailableRow = this.model().getFullAxisLength(this._crosstabConstants.ROW_AXIS_INDEX);
    var lastAvailableColumn = this.model().getFullAxisLength(this._crosstabConstants.COLUMN_AXIS_INDEX);

    if(coordinates.endRowIndex >= lastAvailableRow) {
        coordinates.endRowIndex = lastAvailableRow === 0 ? 0 : lastAvailableRow - 1;
        var shiftedStartRowIndex = coordinates.endRowIndex - this.model().getPageRowSize() - 1;
        coordinates.startRowIndex = Math.max(shiftedStartRowIndex, 0);
    }

    if(coordinates.endColumnIndex >= lastAvailableColumn) {
        coordinates.endColumnIndex = lastAvailableColumn === 0 ? 0 : lastAvailableColumn - 1;
        var shiftedStartColumnIndex = coordinates.endColumnIndex - this.model().getPageColumnSize() - 1;
        coordinates.startColumnIndex = Math.max(shiftedStartColumnIndex, 0);
    }


    this._renderer.drawSection(sectionData);
    var scrollBarVisibility = this._renderer.getScrollbarVisibility();
    this._crosstabScrollBarController.updateScrollBars( this._crosstabScrollBarEventConstants.newSectionEvent, sectionData, scrollBarVisibility);

    //Bind the resize listener methods to the mousedown and mouseup events of the newly drawn crosstab section.
    this.addResizeListener();
};

sap.basetable.crosstab.Crosstab.prototype.isHorizontallyScrollable = function(){
    return this._horizontallyScrollable;
};

sap.basetable.crosstab.Crosstab.prototype.setHorizontallyScrollable = function(scrollable){
    if(typeof scrollable === "boolean" && this._horizontallyScrollable !== scrollable) {
        this._horizontallyScrollable = scrollable;
        return true;
    }
    return false;
};

sap.basetable.crosstab.Crosstab.prototype.isVerticallyScrollable = function(){
    return this._verticallyScrollable;
};

sap.basetable.crosstab.Crosstab.prototype.setVerticallyScrollable = function(scrollable){
    if(typeof scrollable === "boolean" && this._verticallyScrollable !== scrollable) {
        this._verticallyScrollable = scrollable;
        return true;
    }
    return false;
};

sap.basetable.crosstab.Crosstab.prototype.getScaleFactor = function() {
    return this._scaleFactor;
};

sap.basetable.crosstab.Crosstab.prototype.setScaleFactor = function(scaleFactor){
    if(typeof scaleFactor === "number") {
        this._scaleFactor = scaleFactor;
    }
};

sap.basetable.crosstab.Crosstab.prototype.updateAxesMetadata = function (data) {
    this._model.updateAxesMetadata(data);
};

sap.basetable.crosstab.Crosstab.prototype.addPageData = function (pageData) {
    this._model.addPageData(pageData);
};

sap.basetable.crosstab.Crosstab.prototype.addResizeListener = function() {
    this._crosstabElementResizeHandler.addResizeListener();
};

sap.basetable.crosstab.Crosstab.prototype.setCellJustResized = function(value) {
    this._crosstabElementResizeHandler.setCellJustResized(value);
};

sap.basetable.crosstab.Crosstab.prototype.addSortingListener = function() {
    this._sortingHandler.addSortingListeners();
};

sap.basetable.crosstab.Crosstab.prototype._addFeedbackDuringPaging = function() {
    var selectedItems = this._selectionHandler.getSelectedItems();
    if (selectedItems.dimension) {
        this._selectionHandler.addFeedbackDuringPaging();
    } else if (selectedItems.dataCellIndex) {
        this._selectionHandler.addFeedbackDataCellDuringPaging();
    }
};

sap.basetable.crosstab.Crosstab.prototype._updateSize = function (height, width) {
    this._size.height = height;
    this._size.width = width;
};

sap.basetable.crosstab.Crosstab.prototype.publishNextPageEvent = function(pageData){
    this._crosstabScrollBarEventMediator.publish(this._crosstabScrollBarEventConstants.nextPageEvent, pageData);
};

sap.basetable.crosstab.Crosstab.prototype.isMetaDataBorderPresent = function(type) {
    var visible = null;
    if (type === this._crosstabConstants.HORIZONTAL) {
        visible = this.model().getMeasureMembers().length > 0 || this.model().getDimensions(this._crosstabConstants.ROW_AXIS_INDEX).length > 0;
    }
    return visible;
};

sap.basetable.crosstab.Crosstab.prototype.getLanguageManager = function() {
    return this._languageManager;
};

sap.basetable.crosstab.Crosstab.prototype.getCrosstabConstants = function() {
    return this._crosstabConstants;
};

// This is used to find the current "div.v-m-crosstab" that the crosstab is being added to.
// It's only a weak way to find the frame, as crosstab._container is not attached to
// the DOM at the time of creation. The usage of this should be limited to necessary
// applications such as crosstab-wide event listeners.
sap.basetable.crosstab.Crosstab.prototype.getUI5Frame = function() {
    return jQuery("." + this._crosstabConstants.UI5_FRAME_CLASS + ":empty").last();
};

sap.basetable.crosstab.Crosstab.prototype.isCrosstabInStory = function () {
    // TODO: Here we use JQuery to determine if a crosstab is in a story. This is not a good solution but there is no flag we can use.
    // A better solution must be sought and therefore, this matter is added to our technial debt.
    return this._container.closest("#" + this._crosstabConstants.STORY_CONTAINER).length > 0;
};
/*global jQuery:false */
/*global sap:false */
jQuery.sap.declare("sap.basetable.crosstab.CrosstabConstants");

sap.basetable.crosstab.CrosstabConstants = function() {
    "use strict";
    var CONSTANTS = {};


    /**
     * Axes
     */
    CONSTANTS.ROW = "row";
    CONSTANTS.COLUMN = "column";

    CONSTANTS.ROW_AXIS_INDEX = 0;
    CONSTANTS.COLUMN_AXIS_INDEX =1;

    CONSTANTS.INCREASE_AXIS ="IncreaseAxis";
    CONSTANTS.DECREASE_AXIS =".DECREASE_AXIS";

    /**
     * DataType
     */
    CONSTANTS.DATATYPE_DATE = "date";
    CONSTANTS.DATATYPE_INTEGER = "integer";
    CONSTANTS.DATATYPE_BIGINTEGER = "biginteger";
    CONSTANTS.DATATYPE_NUMBER = "number";
    CONSTANTS.DATATYPE_TIME = "time";

    /**
     * Direction
     */
    CONSTANTS.BOTH = "Both";
    CONSTANTS.HORIZONTAL = "Horizontal";
    CONSTANTS.VERTICAL = "Vertical";

    /**
     * Totals
     */
    CONSTANTS.COUNT = "count";

    /**
     * Sizing
     */

    CONSTANTS.COLUMN_CELL_HEIGHT = 32;
    CONSTANTS.COLUMN_CELL_WIDTH = 96;
    CONSTANTS.ROW_CELL_HEIGHT = 32;
    CONSTANTS.ROW_CELL_WIDTH = 128;

    CONSTANTS.LAYOUT_BORDER_WIDTH = 2;
    CONSTANTS.LAYOUT_BORDER_HEIGHT = 2;

    CONSTANTS.METADATA_BORDER_HEIGHT = 3;
    CONSTANTS.METADATA_BORDER_WIDTH = 2;

    CONSTANTS.TOUCH_THRESHOLD = 20;

    CONSTANTS.DEFAULT_ROW_WIDTH_INDEX = 0;
    CONSTANTS.DEFAULT_ROW_HEIGHT_INDEX = 1;
    CONSTANTS.DEFAULT_COLUMN_WIDTH_INDEX = 2;
    CONSTANTS.DEFAULT_COLUMN_HEIGHT_INDEX = 3;
    CONSTANTS.AUTOMATIC_HEIGHT = 0;


    /**
     * DOM Reference
     */
    CONSTANTS.VIZ_ROOT = ".v-m-root";
    CONSTANTS.VIZ_TITLE = ".v-m-title";
    CONSTANTS.CROSSTAB_SCROLL = ".crosstab-scroll";
    CONSTANTS.UI5_CROSSTAB_ID_TEMPLATE = ".sapUI5Crosstab#__{ID}";
    CONSTANTS.UI5_CROSSTAB = ".sapUI5Crosstab";
    CONSTANTS.MEASURE_NAMES_DIMENSION = "MeasureNamesDimension";
    CONSTANTS.MEASURES_ICON_WRAPPED_CLASS = "measures-icon-wrapped";
    CONSTANTS.RIGHT_AREA_DIM_HEADER = "rightAreaDimensionHeaderCellLayout";
    CONSTANTS.ROW_AXIS_HEADER = "RowAxisHeader";
    CONSTANTS.RESIZABLE = "crosstab-resizable";
    CONSTANTS.RESIZABLE_LINE = "crosstab-resizable-line";
    CONSTANTS.RESIZABLE_COL = "crosstab-resizable-col";
    CONSTANTS.RESIZABLE_COL_LINE = "crosstab-resizable-col-line";
    CONSTANTS.RESIZABLE_ROW = "crosstab-resizable-row";
    CONSTANTS.RESIZABLE_ROW_LINE = "crosstab-resizable-row-line";
    CONSTANTS.SORTING_FEEDBACK = "crosstab-sorting-feedback";
    CONSTANTS.KEEP_VISIBLE = "keep-visible";
    CONSTANTS.SUBTOTAL = "crosstab-Total";
    CONSTANTS.GRAND_TOTALS = "crosstab-GrandTotal";
    CONSTANTS.CELL_CONTENT = "crosstab-CellContent";
    CONSTANTS.CELL = "crosstab-Cell";
    CONSTANTS.CELL_TOP = "crosstab-Cell-Top";
    CONSTANTS.FLOATING_CELL = "crosstab-FloatingCell";
    CONSTANTS.UNDER_FLOATING_HEADER = "crosstab-Cell-Under-Floating-Header";
    CONSTANTS.UI5_FRAME_CLASS = "v-m-crosstab";
    CONSTANTS.STORY_CONTAINER = "storyContainer";
    CONSTANTS.RIGHT_DIM_HEADER_CELL_ROW = "rightAreaDimensionHeaderCellRow";
    CONSTANTS.LEFT_DIM_HEADER_CELL_ROW = "leftAreaDimensionHeaderCellRow";
    CONSTANTS.COL_DIM_HEADER_CELL_ROW = "columnDimensionHeaderRow";
    CONSTANTS.DIMENSION_HEADER_CELL = "crosstab-dimensionHeaderCell";
    CONSTANTS.COLUMN_HEADER_CELL = "crosstab-ColumnHeaderCell";
    CONSTANTS.WORD_WRAP_CLASS = "crosstab-word-wrap";
    CONSTANTS.WORD_WRAP_HEADER_CLASS = "crosstab-word-wrap-header";
    CONSTANTS.CELL_SPAN_WRAPPED_CLASS = "cell-span-wrapped";
    CONSTANTS.CROSSTAB_LAYOUT_CLASS = "crosstab-Layout";
    CONSTANTS.SELECTION_OUTLINE_CLASS = "crosstab-selection-outline";
    CONSTANTS.TOP_SECTION_ID = "topSection";
    CONSTANTS.DATA_SECTION_ID = "rowAxisContent-Content";

    /**
     * UI Substrings
     */
    CONSTANTS.ROW_AXIS_CONTENT_CONTAINER = "rowAxisContent-Container";
    CONSTANTS.COLUMNHEADER_CONTAINER = "columnHeader-Container";
    CONSTANTS.ROW_AXIS_HEADER_CELL = "RowAxisheaderCell";
    CONSTANTS.COLUMN_MEMBER_HEADER_CELL = "ColumnMemberHeaderCell";
    CONSTANTS.LEAF_CHILD_CELL = "crosstab-LeafChildCell";

    /**
     * Special values
     */
    CONSTANTS.EMPTY_VALUE = "<<empty>>";
    CONSTANTS.NULL_VALUE = "<<null>>";
    CONSTANTS.TUPLE_PATH_DELIMITER = "|";
    CONSTANTS.MEMBER_KEY_DELIMITER = "&";
    CONSTANTS.ROOT_TUPLE_PATH = ":";
    CONSTANTS.SUBTOTAL_TUPLE_PATH_DELIMETER = "#?*-*?#";

    /**
     * Axes RegExp
    */
    CONSTANTS.REGEXP_ROW_HEADER =  /RowAxisheaderCell_(.*)$/;
    CONSTANTS.REGEXP_COLUMN_HEADER = /ColumnMemberHeaderCell_(.*)$/;
    /**
     * Mouse events
     * constants refer to event.which (event.button is mapped to {0,1,2})
     */
    CONSTANTS.MOUSE_BUTTON = {
        left : 0,
        middle : 1,
        right : 2
    };

    /**
     * STYLE
     */
    CONSTANTS.GREY_BACKGROUND = "#f7f7f8";
    CONSTANTS.POSITION_LEFT = "left";
    CONSTANTS.POSITION_TOP = "top";

    /**
     * Base64 Icons
     */
    CONSTANTS.BASE64_ICONS = Object.freeze({
        FILTER: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANtJREFUeNq0U8ENgzAMhIgFmKEjZAU6QjNCOgJI9FmkMgKM0IwAq7QrdIT0jPyw0qQKqmrpZOdkO/FhSu99EbNL39/hTnx012EwsTyVKJ7gNHBgaObyGvDNM259EigWr8lqkG1VgneAxbMdny1znw2QVMMvPDPZCHQAifgQIp6Re0PcMrcCpuJELZpSwgsFx0DYVhSTNcCkOIiJmMXtEbFOfYU1IWJoc4RbSQPDOjQiccbMi+C2TQSnxSibiGVslXnrbECPaNLt2cTQ7F82UX3ZxByuKH/9nd8CDAAV20rpvWCrHwAAAABJRU5ErkJggg==",
        EXCLUDE: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAUxJREFUeNqsVDFOw0AQvBwv8Bf8BfMCYpeUoaS0S0oihZJIuKRMnoCfYMsVJW7pcEvpFilIZkaas1aGKEiw0up8vpnZ2/WuF+M4urndbTa3WFJ5sAFewcv77ba3+IUVATnB8gSPRFiDMOgsx7KSMIXW30QA4mENbwDI3BETjoEq4IpJBAeM/CaBK3fCdONaNyq93j9oLQSK4bXEpzopJQdiRwE430Vnn4cDgTupNiI+wxktbdu2gl/j+RF+ief3i+Wyw/qK/Q38wwtMYqMog6I4nb0oiFO6e4MjJ6FILMD02QQstI2NwLzg5MTe/d4iWyNr3twgNkXMTQq9Sa2eCZHTexZT3ZhKgKBcIH6Fc5NaooYLOHK6kE4VPpcKlqloGfeqETu0CIU1gfb/12wm+opNdkIgjAfbvjw2gLswgHbIRA5D+PMA/uVX8CXAAJALvYSRg1/tAAAAAElFTkSuQmCC",
        CONDITIONAL_FORMAT : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/VpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ1dWlkOjY1RTYzOTA2ODZDRjExREJBNkUyRDg4N0NFQUNCNDA3IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZFNzc1OEZBMDE4RDExRTVCQkM0OURDM0RDMDQ2Nzc2IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZFNzc1OEY5MDE4RDExRTVCQkM0OURDM0RDMDQ2Nzc2IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIElsbHVzdHJhdG9yIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowMTFlNzRhZi00NTMzLTQ1OTAtOTljYi0zNGMwYTAwODEwZTEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ZDZjYjk1ZGQtZWQ3NC00ZjMxLWIwM2MtOTIxNmFlYzcwYWJhIi8+IDxkYzp0aXRsZT4gPHJkZjpBbHQ+IDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+V2ViPC9yZGY6bGk+IDwvcmRmOkFsdD4gPC9kYzp0aXRsZT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4I4T7PAAABBElEQVR42mJMS0v7z0A6EJw1a9YHEIOJgULAhGQiIwgTyccwgBTwFIh/wDgsUJofGBb4NMHkQRodgC6BG8BIQiCCbHYA4vtAvBCIjwINmk5KGMgA6bswi4F4GtDyTGK8APYzUJ4NSK8G4h1AHAeVc4MZ8ABN00Oo1x5Dnf0PiNcAsS8Q+0HVxOGLRnkgWwCIdYHsR0iaYcADZChQ/i/eaAS6ghnqbGTNm4E4FKj5P6508AaIf0I1L0JyMkxzCFDzL/R0APPzKyB2BSr4DuQvBbKj8GmGGSCIxP8BSiTQEL9MSDPYAFiuQgOgQAsBeQUaC6HYNCN7AR34wgwBauzHF9AAAQYAsxB47+tXc7sAAAAASUVORK5CYII="
    });


    // from static classes in library.css
    CONSTANTS.LAYOUT_BORDER_SIZE = { // .crosstab-Layout
        top : 1,
        right : 0,
        bottom : 0,
        left : 1
    };

    CONSTANTS.LEFT_DIMENSION_HEADER_BORDER_SIZE = { // .crosstab-LeftDimensionHeaders
        top : 0,
        right : 0,
        bottom : 3,
        left : 0
    };

    CONSTANTS.ROW_AXIS_HEADER_CONTAINER_BORDER_SIZE = { // .crosstab-RowAxisheaderContainer
        top : 0,
        right : 2,
        bottom : 0,
        left : 0
    };

    /**
     * Page Sizes
     */
    CONSTANTS.STANDARD_PAGE_ROW_SIZE = 75;
    CONSTANTS.STANDARD_PAGE_COLUMN_SIZE = 75;

    CONSTANTS.STANDARD_PAGE_SIZE_SPECIFICATION = {
        rows: CONSTANTS.STANDARD_PAGE_ROW_SIZE,
        columns: CONSTANTS.STANDARD_PAGE_COLUMN_SIZE
    };
    CONSTANTS.PAGE_ROW_SIZE_SPECIFICATION = {
        rows: CONSTANTS.STANDARD_PAGE_ROW_SIZE
    };
    CONSTANTS.PAGE_COLUMN_SIZE_SPECIFICATION = {
        columns: CONSTANTS.STANDARD_PAGE_COLUMN_SIZE
    };

    /**
     * Sections for viz properties
     */
    // A map from the property section ID to the CSS selector for the related area
    CONSTANTS.SELECTION_SECTIONS = {
        "sap.viz.controls.propertyeditor.section.column_dimension_header": ".crosstab-columnDimensionHeaderRow",
        "sap.viz.controls.propertyeditor.section.column_labels": "#colDimRow.crosstab-row",
        "sap.viz.controls.propertyeditor.section.row_dimension_header": ".crosstab-LeftDimensionHeaders",
        "sap.viz.controls.propertyeditor.section.row_labels": ".crosstab-RowAxisheaderContainer",
        "sap.viz.controls.propertyeditor.section.data_cells": "#rowAxisContent-Container",
        "sap.viz.controls.propertyeditor.section.chart_title": "svg"
    };

    // A map from the property section ID to the CSS selector for the containing area (SELECTION_SECTION can run out of screen)
    CONSTANTS.SELECTION_BOUNDARY_SECTIONS = {
        "sap.viz.controls.propertyeditor.section.column_dimension_header": ".crosstab-ColumnHeaderContainer",
        "sap.viz.controls.propertyeditor.section.column_labels": ".crosstab-ColumnHeaderContainer",
        "sap.viz.controls.propertyeditor.section.data_cells": "#bottomRow"
    };

    CONSTANTS.SECTION_ZONES = {
        "sap.viz.controls.propertyeditor.section.column_dimension_header": "COLUMN_AXIS_TITLE",
        "sap.viz.controls.propertyeditor.section.column_labels": "COLUMN_AXIS",
        "sap.viz.controls.propertyeditor.section.row_dimension_header": "ROW_AXIS_TITLE",
        "sap.viz.controls.propertyeditor.section.row_labels": "ROW_AXIS",
        "sap.viz.controls.propertyeditor.section.data_cells": "DATA_POINT",
        "sap.viz.controls.propertyeditor.section.chart_title": "CHART_TITLE"
    };

    CONSTANTS.SELECTION_OUTLINE_BORDER_WIDTH = 3;

    /**
     * Sort Direction
     */
    CONSTANTS.ASCENDING = "ascending";
    CONSTANTS.DESCENDING = "descending";

    /**
     * Column Header Visibility
     */
    CONSTANTS.COLUMN_DIMENSION_HEADER_VISIBILITY = "setColumnDimensionHeaderVisability";

    return Object.freeze(CONSTANTS);
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.CrosstabContainers");

sap.basetable.crosstab.CrosstabContainers = function (crosstab) {
    this._crosstab = crosstab;
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
};

sap.basetable.crosstab.CrosstabContainers.prototype = {
    //pixel adjustments for the borders in the UX spec.
    _overallContainerHeight : null,
    _overallContainerWidth : null,
    _bodyHeight : null,
    _headerHeight : null,
    _scrollContainer : null,
    _rowAxisHeaderContainer : null,
    _rowAxisHeaderContent : null,
    _rowAxisContentContainer : null,
    _rowAxisContentContent : null,
    _columnHeaderContainer : null,
    _columnHeaderLayout : null,
    _columnHeaderContent : null,
    _grandTotalsHeaderContainer : null,
    _grandTotalsContentContainer : null,
    _leftAreaDimensionHeaderContainer : null,
    _leftAreaDimensionHeaderOuterContainer : null,
    _leftAreaDimensionHeaderContent : null,
    _rowAxisFloatingHeaderContainer : null,
    _oLayout : null,
    _topSectionContainer : null,
    _leftAreaContainerWidth : null,
    _rightAreaContainerWidth: null
};

sap.basetable.crosstab.CrosstabContainers.scrollbarOutsideContainerAdjustment = 20;
sap.basetable.crosstab.CrosstabContainers.percentageOfLastCellShown = 0.50;

sap.basetable.crosstab.CrosstabContainers.prototype.setOverallContainerHeight = function(height){
    var containerHeight = height ? height : this._crosstab.getHeight();
    if(this._crosstab.isHorizontallyScrollable()) {
        //If we have an internal scrollbar, adjust the container height accordingly  (Fixes BITVDC25-1476).
        containerHeight -= sap.basetable.crosstab.CrosstabContainers.scrollbarOutsideContainerAdjustment;
    }
    this._overallContainerHeight = containerHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getOverallContainerHeight = function(){
    return this._overallContainerHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setOverallContainerWidth = function(width){
    var containerWidth = width ? width : this._crosstab.getWidth();
    if(this._crosstab.isVerticallyScrollable()) {
        //If we have an internal vertical scrollbar, adjust the container width accordingly.
        containerWidth -= sap.basetable.crosstab.CrosstabContainers.scrollbarOutsideContainerAdjustment;
    } else {
        //If there is no internal vertical scrollbar, the container width must still be adjusted to account for
        //the widths of the outer crosstab borders and inner metadata border. Without this adjustment,
        //the horizontal scrollbar and right border of the crosstab can become clipped (see BITVDC25-1565).
        containerWidth -= (this._crosstabConstants.METADATA_BORDER_WIDTH +
                           this._crosstabConstants.LAYOUT_BORDER_WIDTH);
    }
    this._overallContainerWidth = containerWidth;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getOverallContainerWidth = function(){
    return this._overallContainerWidth;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setBodyHeight = function (bodyHeight) {
    this._bodyHeight = bodyHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setHeaderHeight = function (headerHeight) {
    this._headerHeight = headerHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getBodyHeight = function () {
    return this._bodyHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getHeaderHeight = function () {
    return this._headerHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setScrollContainer = function(scrollContainer){
    this._scrollContainer = scrollContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getScrollContainer = function(){
    return this._scrollContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setRowAxisHeaderContainer = function(rowAxisHeaderContainer){
    this._rowAxisHeaderContainer = rowAxisHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRowAxisHeaderContainer = function(){
    return this._rowAxisHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setRowAxisHeaderContent= function(rowAxisHeaderContent){
    this._rowAxisHeaderContent = rowAxisHeaderContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRowAxisHeaderContent= function(){
    return this._rowAxisHeaderContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setRowAxisContentContainer = function(rowAxisHeaderContentContainer){
    this._rowAxisContentContainer = rowAxisHeaderContentContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRowAxisContentContainer = function(){
    return this._rowAxisContentContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setRowAxisContentContent = function(rowAxisContentContent){
    this._rowAxisContentContent = rowAxisContentContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRowAxisContentContent = function(){
    return this._rowAxisContentContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setColumnHeaderContainer = function(columnHeaderContainer){
    this._columnHeaderContainer = columnHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getColumnHeaderContainer = function(){
    return this._columnHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setColumnHeaderLayout = function(columnHeaderLayout){
    this._columnHeaderLayout = columnHeaderLayout;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getColumnHeaderLayout = function(){
    return this._columnHeaderLayout;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setColumnHeaderContent = function(columnHeaderContent){
    this._columnHeaderContent = columnHeaderContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getColumnHeaderContent = function(){
    return this._columnHeaderContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setGrandTotalsHeaderContainer = function(grandTotalsHeaderContainer){
    this._grandTotalsHeaderContainer = grandTotalsHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getGrandTotalsHeaderContainer = function(){
    return this._grandTotalsHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setGrandTotalsContentContainer = function(grandTotalsContentContainer){
    this._grandTotalsContentContainer = grandTotalsContentContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getGrandTotalsContentContainer = function(){
    return this._grandTotalsContentContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setLeftAreaDimensionHeaderContainer = function(leftAreaDimensionHeaderContainer){
    this._leftAreaDimensionHeaderContainer = leftAreaDimensionHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getLeftAreaDimensionHeaderContainer = function(){
    return this._leftAreaDimensionHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setLeftAreaDimensionHeaderOuterContainer = function(leftAreaDimensionHeaderOuterContainer){
    this._leftAreaDimensionHeaderOuterContainer = leftAreaDimensionHeaderOuterContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getLeftAreaDimensionHeaderOuterContainer = function(){
    return this._leftAreaDimensionHeaderOuterContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setLeftAreaDimensionHeaderContent = function(leftAreaDimensionHeaderContents){
    this._leftAreaDimensionHeaderContent = leftAreaDimensionHeaderContents;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getLeftAreaDimensionHeaderContent = function(){
    return this._leftAreaDimensionHeaderContent;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setRowAxisFloatingHeaderContainer = function(rowAxisFloatingHeaderContainer){
    this._rowAxisFloatingHeaderContainer = rowAxisFloatingHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRowAxisFloatingHeaderContainer = function(){
    return this._rowAxisFloatingHeaderContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setTopSectionContainer = function(topSectionContainer){
    this._topSectionContainer = topSectionContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getTopSectionContainer = function(){
    return this._topSectionContainer;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setLayout = function(oLayout){
    this._oLayout = oLayout;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getLayout = function(){
    return this._oLayout;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setLeftAreaContainerWidth = function(leftAreaContainerWidth){
    this._leftAreaContainerWidth = leftAreaContainerWidth;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getLeftAreaContainerWidth = function(){
    return this._leftAreaContainerWidth;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setRightAreaContainerWidth = function(rightAreaContainerWidth){
    this._rightAreaContainerWidth = rightAreaContainerWidth;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRightAreaContainerWidth = function(){
    return this._rightAreaContainerWidth;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getHorizontalScrollAreas = function() {
    var scrollAreas = {
        "bodyContainer": this._rowAxisContentContainer,
        "bodyContent": this._rowAxisContentContent,
        "headerContainer": this._columnHeaderContainer,
        "headerContent": this._columnHeaderContent,
        "floatingHeaders": null,
        "fullContainer": this._oLayout,
        "grandTotalsContentContainer": this._grandTotalsContentContainer
    };
    return scrollAreas;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getVerticalScrollAreas = function() {
    var scrollAreas = {
        "bodyContainer": this._rowAxisContentContainer,
        "bodyContent": this._rowAxisContentContent,
        "headerContainer": this._rowAxisHeaderContainer,
        "headerContent": this._rowAxisHeaderContent,
        "floatingHeaders": null,
        "fullContainer": this._oLayout,
        "grandTotalsHeaderContainer": this._grandTotalsHeaderContainer,
        "grandTotalsContentContainer": this._grandTotalsContentContainer
    };
    return scrollAreas;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getRowAxisHeaderScrollAreas = function() {
    var scrollAreas = {
        "bodyContainer": this._rowAxisHeaderContainer,
        "bodyContent": this._rowAxisHeaderContent,
        "headerContainer": this._leftAreaDimensionHeaderContainer,
        "headerContent": this._leftAreaDimensionHeaderContent,
        "floatingHeaders": this._rowAxisFloatingHeaderContainer,
        "fullContainer": this._oLayout,
        "grandTotalsHeaderContainer": this._grandTotalsHeaderContainer
    };
    return scrollAreas;
};

sap.basetable.crosstab.CrosstabContainers.prototype.replaceContainer = function(content, containerContent) {
    // The DOM element should be detached first before replaceAll() is called to optimize performance/prevent reflow
    var newContent;
    if (containerContent && containerContent[0] && containerContent[0].parentElement) {
        var parent = containerContent[0].parentElement;
        var nextSibling = containerContent[0].nextSibling;
        containerContent.detach();
        newContent = content.replaceAll(containerContent);
        if (nextSibling) {
            parent.insertBefore(newContent[0], nextSibling);
        } else {
            parent.appendChild(newContent[0]);
        }
    } else {
        newContent = content.replaceAll(containerContent);
    }
    return newContent;
};


sap.basetable.crosstab.CrosstabContainers.prototype.setGrandTotalsHeight = function(grandTotalsHeight){
    this._grandTotalsHeight = grandTotalsHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getGrandTotalsHeight = function(){
    return this._grandTotalsHeight;
};

sap.basetable.crosstab.CrosstabContainers.prototype.setNumOfGrandTotals = function(numOfGrandTotals){
    this._numOfGrandTotals = numOfGrandTotals;
};

sap.basetable.crosstab.CrosstabContainers.prototype.getNumOfGrandTotals = function(){
    return this._numOfGrandTotals;
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/

"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabContextMenuHandler");

sap.basetable.crosstab.CrosstabContextMenuHandler = function (crosstab) {
    this._crosstab = crosstab;
    this._model = crosstab.model();
    this._selectionHandler = crosstab.selectionHandler();
    this._languageManager = crosstab.getLanguageManager();
    this._crosstabConstants = crosstab.getCrosstabConstants();
    this._crosstabSortingHandler = crosstab.sortingHandler();
};


sap.basetable.crosstab.CrosstabContextMenuHandler.prototype = {
    _CONTEXTUALDATA_TYPE_TITLE: "title",
    _CONTEXTUALDATA_TYPE_CROSSTAB: "crosstab",
    _MEASURE_NAMES_DIMENSION_SELECTOR: "#MeasureNamesDimension-div",
    _CROSSTAB_VIZ_TYPE: "viz/ext/crosstab",
    MENU_ITEM_IDS: Object.freeze({
        SIZE_PROPERTIES: "sap.viz.controls.contextmenu.ext.item.SizeProperties",
        FILTER: "sap.viz.controls.contextmenu.ext.item.Filter",
        EXCLUDE: "sap.viz.controls.contextmenu.ext.item.Exclude",
        CF_MENUS: "sap.viz.controls.contextmenu.ext.item.condtionalformatting.menus",
        CF_MENUS_NEW: "sap.viz.controls.contextmenu.ext.item.condtionalformatting.menus.new",
        CF_MENUS_MANAGE: "sap.viz.controls.contextmenu.ext.item.condtionalformatting.menus.manage",
        CF_SUBMENU: "sap.viz.controls.contextmenu.custom.crosstab.conditionalformatting",
        SORT_MENU_ASCENDING: "sap.viz.controls.contextmenu.ext.item.sorting.menus.Ascending",
        SORT_MENU_DESCENDING: "sap.viz.controls.contextmenu.ext.item.sorting.menus.Descending",
        SUBTOTAL: "sap.viz.controls.contextmenu.ext.item.SubTotal",
        SUBTOTAL_SUBMENU: "sap.viz.controls.contextmenu.custom.crosstab.subtotal"
    })
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype.addContextMenuListeners = function () {
    var frame = this._crosstab.getUI5Frame();
    var crosstabTitle = frame.siblings("svg");
    crosstabTitle.on("contextmenu", function(event) {
        if ($(event.target).closest(this._crosstabConstants.VIZ_ROOT).find(this._crosstabConstants.UI5_CROSSTAB_ID_TEMPLATE.replace("{ID}", this._crosstab.getId())).length &&
                !this._crosstab.isCrosstabInStory()) {
            var dispatch = this._crosstab.getDispatch();
            if (dispatch && typeof dispatch.contextualData === "function") {
                dispatch.contextualData(this._getContextualData(event, this._CONTEXTUALDATA_TYPE_TITLE));
            }
        }
    }.bind(this));

    frame.on("contextmenu", function(event) {
        // any events done while resizing should be a no-op
        if (!this._shouldRenderContextMenu(event.target) || this._crosstab.crosstabElementResizeHandler().isResizing()) {
            return;
        }

        var contextMenuData = this._buildEmptyContextMenuData();

        this._selectionHandler.handleContextMenu(event);

        if (this._shouldShowFilter()) {
            this._addFilterMenuItems(contextMenuData);
        }

        if (this._crosstabSortingHandler.shouldShowSort(event.target, false)) {
            this._addSortingMenuItems(contextMenuData);
        }

        this._addConditionalFormattingMenuItems(contextMenuData, event.target);

        if (this._invokedWithinCrosstab(event)) {
            this._addSubTotalMenuItem(contextMenuData, event.target);
        }

        if (this._invokedWithinCrosstab(event)) {
            this._addSizePropertiesMenuItem(contextMenuData);
        }

        // Dispatch "contextualData", which will trigger context menu to be rendered
        if (contextMenuData.length > 0 && !(this._crosstab.isCrosstabInStory() && this._isContextMenuDataEmpty(contextMenuData))) {
            var dispatch = this._crosstab.getDispatch();
            if (dispatch && typeof dispatch.contextualData === "function") {
                dispatch.contextualData(this._getContextualData(event, this._CONTEXTUALDATA_TYPE_CROSSTAB, contextMenuData));
                this._crosstab.tooltipHandler().onContextmenuLoaded();
            }
        }
    }.bind(this));
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._shouldRenderContextMenu = function(target) {
    return $(target).closest(this._crosstabConstants.UI5_CROSSTAB_ID_TEMPLATE.replace("{ID}", this._crosstab.getId())).length !== 0 &&
            !$(target).hasClass(this._crosstabConstants.RESIZABLE);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._isContextMenuDataEmpty = function(contextMenuData) {
    for (var i = 0; i < contextMenuData.length; i++) {
        if (contextMenuData[i].length > 0) {
            return false;
        }
    }
    return true;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._buildEmptyContextMenuData = function() {
    var contextMenuData  = [];
    var rootMenuData = [];
    var conditionalFormattingSubMenuData = [];
    contextMenuData.push(rootMenuData);
    contextMenuData.push(conditionalFormattingSubMenuData);
    return contextMenuData;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._addSizePropertiesMenuItem = function (contextMenuData) {
    var rootMenuData = contextMenuData[0];

    rootMenuData.push([{
                        id: this.MENU_ITEM_IDS.SIZE_PROPERTIES,
                        label: this._languageManager.get("XTAB_MENU_LABEL_SIZE_PROPERTIES"),
                        enabled: true,
                        data: {}
                    }]);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._addFilterMenuItems = function (contextMenuData) {
    var selectedItems = this._selectionHandler.getSelectedItems();
    var menuItemsEnabled = !this._selectionHandler.areAllDimensionMembersSelected();

    var rootMenuData = contextMenuData[0];

    rootMenuData.push([{
                        id: this.MENU_ITEM_IDS.FILTER,
                        label: this._languageManager.get("XTAB_MENU_LABEL_FILTER"),
                        enabled: menuItemsEnabled,
                        data: {
                            selectedItems: selectedItems
                        },
                        icon: {
                            url: this._crosstabConstants.BASE64_ICONS.FILTER
                        }
                    },
                    {
                        id: this.MENU_ITEM_IDS.EXCLUDE,
                        label: this._languageManager.get("XTAB_MENU_LABEL_EXCLUDE"),
                        enabled: menuItemsEnabled,
                        data: {
                            selectedItems: selectedItems
                        },
                        icon: {
                            url: this._crosstabConstants.BASE64_ICONS.EXCLUDE
                        }
                    }]);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype.emulateFilterMenuItemSelected = function (isExclude) {
    var selectedItems = this._selectionHandler.getSelectedItems();
    var menuData = {
                        data: {
                            menuItem: {
                                id: isExclude ? this.MENU_ITEM_IDS.EXCLUDE : this.MENU_ITEM_IDS.FILTER,
                                data: {
                                    selectedItems: selectedItems,
                                }
                            },
                            vizType: this._CROSSTAB_VIZ_TYPE
                        }
                    };
    this._crosstab.getDispatch().crosstableMenuEvent(menuData);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._addConditionalFormattingMenuItems = function (contextMenuData, clickTarget) {
    var visibility = this._getConditionalFormattingVisibility(clickTarget);
    var rootMenuData = contextMenuData[0];

    if (!visibility.root) {
        return;
    }

    rootMenuData.push({
                        id: this.MENU_ITEM_IDS.CF_MENUS,
                        label: this._languageManager.get("XTAB_MENU_LABEL_CONDITIONAL_FORMATTING"),
                        enabled: true,
                        icon: {
                            url: this._crosstabConstants.BASE64_ICONS.CONDITIONAL_FORMAT
                        },
                        subMenus: [this.MENU_ITEM_IDS.CF_SUBMENU]

                    });

    var subMenuData = contextMenuData[1];
    var clickedDimensionId = this._selectionHandler.getClickedDimensionId(clickTarget);
    var selectedItems = this._selectionHandler.getSelectedItems();
    var selectedMembers;
    if(selectedItems.dimension && selectedItems.dimension === clickedDimensionId && selectedItems.members) {
        selectedMembers =  this._selectionHandler.getSelectedMemberIds();
    }
    var selectionData = this._selectionHandler.getItemSelectedEventPayload(clickedDimensionId, selectedMembers);
    this._addConditionalFormattingSubMenuItems(subMenuData, visibility, selectionData);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._addConditionalFormattingSubMenuItems = function(contextMenuData, visibility, selectionData) {
    contextMenuData.push({
                        id: this.MENU_ITEM_IDS.CF_MENUS_NEW,
                        label: this._languageManager.get("XTAB_MENU_LABEL_CONDITIONAL_FORMATTING_NEW_RULE"),
                        tooltip: this._languageManager.get("XTAB_MENU_TOOLTIP_CONDITIONAL_FORMATTING_NEW_RULE"),
                        enabled: visibility.newRule,
                        data: selectionData
                    });
    contextMenuData.push({
                        id: this.MENU_ITEM_IDS.CF_MENUS_MANAGE,
                        label: this._languageManager.get("XTAB_MENU_LABEL_CONDITIONAL_FORMATTING_MANAGE_RULES"),
                        tooltip: this._languageManager.get("XTAB_MENU_TOOLTIP_CONDITIONAL_FORMATTING_MANAGE_RULES"),
                        enabled: visibility.manageRule,
                        data: selectionData
                    });
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._addSubTotalMenuItem = function (contextMenuData, clickTarget) {
    var rootMenuData = contextMenuData[0];

    var selectedDimension = this._selectionHandler.getClickedDimensionId(clickTarget);

    var menuItem = {
        id: this.MENU_ITEM_IDS.SUBTOTAL,
        label: this._languageManager.get("XTAB_MENU_LABEL_SUBTOTAL"),
        enabled: true,
        data: selectedDimension,
        subMenus: [this.MENU_ITEM_IDS.SUBTOTAL_SUBMENU]
    };

    // Group conditional formatting and totals menu items
    if (rootMenuData.length > 0 && rootMenuData[rootMenuData.length - 1].id === this.MENU_ITEM_IDS.CF_MENUS) {
        rootMenuData[rootMenuData.length - 1] = [rootMenuData[rootMenuData.length - 1], menuItem];
    } else {
        rootMenuData.push(menuItem);
    }

    //TODO: Refactor to either extract constants or use objects and properties instead of arrays and indices.
    contextMenuData[2] = {dimension: selectedDimension};
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._getContextualData = function (event, type, contextMenuData) {
    return {
        name: "contextualData",
        type: type,
        point: {
            x: event.x || event.pageX,
            y: event.y || event.pageY
        },
        data: contextMenuData
    };
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._invokedWithinCrosstab = function (event) {
    return !!$(event.target).closest("." + this._crosstabConstants.CROSSTAB_LAYOUT_CLASS).length;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._shouldShowFilter = function () {
    var selectedItems = this._selectionHandler.getSelectedItems();
    return selectedItems &&
            selectedItems.dimension &&
            selectedItems.dimension !== this._crosstabConstants.MEASURE_NAMES_DIMENSION &&
            !jQuery.isEmptyObject(selectedItems.members);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._getConditionalFormattingVisibility = function (clickTarget) {
    var visibility = {
        root: false,
        newRule: false,
        manageRule: false
    };

    // Only add conditionalFormatting menu items if invoked inside the crosstab's layout area
    var crosstabLayout = this._crosstab.crosstabContainers().getLayout();
    var hasMeasures = this._crosstab.model().getMeasureMembers().length > 0;

    if (hasMeasures && $(clickTarget).closest($(crosstabLayout)).length !== 0 && !this._crosstab.isCrosstabInStory()) {

        visibility.root = true;
        visibility.manageRule = true;

        // Should not display new rule menu item when invoked on a measure dimension, subtotal,
        // unsupported data types (date and hierarchy) or key/label dimensions.
        var dimensionId = this._selectionHandler.getClickedDimensionId(clickTarget);
        var dataType = this._model.getDataType(dimensionId);
        if (!this._isMeasureNamesDimension(clickTarget) && !this._isSubtotal(clickTarget) && this._isSupportedDataType(dataType) &&
                !this._model.isDimensionHierarchy(dimensionId) && !this._model.isKeyLabelDimensions(dimensionId)) {
            visibility.newRule = true;
        }
    }

    return visibility;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._isMeasureNamesDimension = function (clickTarget) {
    var targetId = $(clickTarget).closest("div")[0].id;
    if (targetId === this._crosstabConstants.RIGHT_AREA_DIM_HEADER) {
        targetId = this._model.getLastDimensionId(this._crosstabConstants.COLUMN_AXIS_INDEX);
    }

    return $(clickTarget).closest(this._MEASURE_NAMES_DIMENSION_SELECTOR).length > 0 ||
                targetId === this._crosstabConstants.MEASURE_NAMES_DIMENSION;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._isSubtotal = function (clickTarget) {
    return $(clickTarget).hasClass(this._crosstabConstants.SUBTOTAL) || $(clickTarget).children().hasClass(this._crosstabConstants.SUBTOTAL);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._isSupportedDataType = function (dataType) {
    return dataType !== this._crosstabConstants.DATATYPE_DATE &&
            dataType !== this._crosstabConstants.DATATYPE_TIME &&
            dataType !== this._crosstabConstants.DATATYPE_BIGINTEGER;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._addSortingMenuItems = function (contextMenuData) {
    var enabled = this._getSortingEnabled();
    var selectedMemberID = Object.keys(this._selectionHandler.getSelectedItems().members)[0];
    var checked = this._getSortingChecked(selectedMemberID);
    var rootMenuData = contextMenuData[0];

    rootMenuData.push([{
                        id: this.MENU_ITEM_IDS.SORT_MENU_ASCENDING,
                        label: this._languageManager.get("XTAB_MENU_LABEL_SORT_ASCENDING"),
                        enabled: enabled,
                        checked: checked.ascending,
                        data: {
                            selectedObjectID: selectedMemberID,
                            measuresScrollData: this._crosstab.getCrosstabScrollBarController().getMeasuresScrollData()
                        }
                    },
                    {
                        id: this.MENU_ITEM_IDS.SORT_MENU_DESCENDING,
                        label: this._languageManager.get("XTAB_MENU_LABEL_SORT_DESCENDING"),
                        enabled: enabled,
                        checked: checked.descending,
                        data: {
                            selectedObjectID: selectedMemberID,
                            measuresScrollData: this._crosstab.getCrosstabScrollBarController().getMeasuresScrollData()
                        }
                    }
                ]);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype.emulateSortingMenuItemSelected = function (selectedItems, sortDirection) {
    var menuData = {
                        data: {
                            location: "crosstab",
                            menuItem: {
                                data: {
                                    selectedObjectID: selectedItems,
                                    measuresScrollData: this._crosstab.getCrosstabScrollBarController().getMeasuresScrollData()
                                },
                                id: sortDirection === this._crosstabConstants.DESCENDING ? this.MENU_ITEM_IDS.SORT_MENU_DESCENDING : this.MENU_ITEM_IDS.SORT_MENU_ASCENDING,
                            },
                            vizType: this._CROSSTAB_VIZ_TYPE
                        }
                    };
    this._crosstab.getDispatch().crosstableMenuEvent(menuData);
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._getSortingEnabled = function () {
    var columnDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);

    // If measures being stacked with another dimension it should be visible but disabled
    var enabled =
        (columnDimensions.length === 1 && columnDimensions[0].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION) ||
        (rowDimensions.length === 1 && rowDimensions[0].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION);

    return enabled;
};

sap.basetable.crosstab.CrosstabContextMenuHandler.prototype._getSortingChecked = function (selectedMemberID) {
    var checked = {
        ascending: false,
        descending: false
    };

    var sortingState = this._model.getSortingState();
    if (sortingState && sortingState.measure.objId === selectedMemberID) {
        checked.ascending = sortingState.direction === this._crosstabConstants.ASCENDING;
        checked.descending = sortingState.direction === this._crosstabConstants.DESCENDING;
    }

    return checked;
};
jQuery.sap.declare("sap.basetable.crosstab.CrosstabDataProvider");

sap.basetable.crosstab.CrosstabDataProvider = function (data, crosstab, pageSizeSpecification, isolateGrandTotals) {
    this._dataChangeListeners = [];
    this._jsonData = data;
    this._feeding = data.feeding;
    this._consumptionModel = data.consumptionModel;
    this._measureMembers = [];
    this._languageManager = crosstab.getLanguageManager();
    this._isolateGrandTotals = !!isolateGrandTotals;
    this._grandTotals = [];
    this._containsGrandTotals = false;

    var queryRequest = data.queryRequest && data.queryRequest.queries ? data.queryRequest.queries[0] : {};
    this._queryRequestUtils = new sap.basetable.crosstab.utils.QueryRequestUtils(queryRequest);
    var queryResponse = data.queryResponse[0];
    // this._modifiedMemberKeys will be added by _buildMemberKey,
    // which will be used in this._scrollPageManager.initialize(data).
    // Do not move this line below this._scrollPageManager.initialize(data)
    this._modifiedMemberKeys = null;
    this._queryResponseUtils = new sap.basetable.crosstab.utils.QueryResponseUtils(queryResponse, this.getMeasureValues());

    this._entityIdDataTypeMap = data.entityIdDataTypeMap;
    this._hierarchies = data.hierarchies;
    this._keyLabelDimensions = data.keyLabelDimensions;

    this._calculationEntityIdSet = this._queryRequestUtils.buildCalculationEntityIdSet();
    this._scrollPageManager = new sap.basetable.crosstab.ScrollPageManager(data, this, crosstab);
    this.initializePageManager();
    this.initializePageSizeSpecification(pageSizeSpecification);

    this.build();
};

// Static constants since they're used in static methods
sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();

sap.basetable.crosstab.CrosstabDataProvider.prototype.initializePageSizeSpecification = function (pageSizeSpecification) {
    this._pageSizeSpecification = {};

    if (pageSizeSpecification) {
        if (pageSizeSpecification.rows) {
            this._pageSizeSpecification.rows = pageSizeSpecification.rows;
        }
        if (pageSizeSpecification.columns) {
            this._pageSizeSpecification.columns = pageSizeSpecification.columns;
        }
    }

    // If number of rows/columns not specified, use the full axis length which
    // in effect means we are not paging on the axis.
    if (!this._pageSizeSpecification.rows) {
        this._pageSizeSpecification.rows = this._scrollPageManager.getFullAxisLength(0);
    }
    if (!this._pageSizeSpecification.columns) {
        this._pageSizeSpecification.columns = this._scrollPageManager.getFullAxisLength(1);
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getPageRowSize = function () {
    return this._pageSizeSpecification.rows;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getPageColumnSize = function () {
    return this._pageSizeSpecification.columns;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.addDataChangeListener = function (listener) {
    this._dataChangeListeners.push(listener);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.updateData = function () {
    this._rebuild();
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getDimensions = function () {
    return this._dimensions;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getTupleTree = function (axis) {
    if(!this._tupleTree) {
        var axisTupleTree = {
            rootnode: {
                tuplePath: "",
                children: []
            }
        };
        return axisTupleTree;
    }
    return this._tupleTree[axis];
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.isolateGrandTotals = function () {
    // We should not isolate grand totals when measures is outer most on the rows
    if (this._measureAxisType === "row" && this._measureAxisPosition === 0) {
        return false;
    }
    return this._isolateGrandTotals;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getGrandTotals = function() {
     return this._grandTotals;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getFormatMap = function () {
    return this._formatMap;
};


sap.basetable.crosstab.CrosstabDataProvider.prototype._buildAxesValuesArray = function(queryResponse, rowAxisSpec, columnAxisSpec, rowAxisName, columnAxisName, measureAxisType, measureGroupName) {
    var primaryAxis;
    var primaryAxisSpec;
    var primaryAxisName;
    var secondaryAxis;
    var secondaryAxisSpec;
    var secondaryAxisName;

    if (measureAxisType === "row") {
        primaryAxis = queryResponse.dimAxes[rowAxisName];
        primaryAxisSpec = rowAxisSpec;
        primaryAxisName = rowAxisName;
        secondaryAxis = queryResponse.dimAxes[columnAxisName];
        secondaryAxisSpec = columnAxisSpec;
        secondaryAxisName = columnAxisName;
    } else if (measureAxisType === "column") {
        primaryAxis = queryResponse.dimAxes[columnAxisName];
        primaryAxisSpec = columnAxisSpec;
        primaryAxisName = columnAxisName;
        secondaryAxis = queryResponse.dimAxes[rowAxisName];
        secondaryAxisSpec = rowAxisSpec;
        secondaryAxisName = rowAxisName;
    }

    var primaryAxisStartOffset = primaryAxisSpec ? primaryAxisSpec.startIndexOffset : 0;
    var secondaryAxisStartOffset = secondaryAxisSpec ? secondaryAxisSpec.startIndexOffset : 0;

    // calculate the axis end offset, considering that the last page on the axis may be fetched and is smaller than the specified page size
    var primaryAxisEndOffset = primaryAxisSpec ? Math.max(0, primaryAxisSpec.endIndexOffset - (primaryAxisSpec.pageSize - primaryAxis.values.length)) : 0;
    var secondaryAxisEndOffset = secondaryAxisSpec ? Math.max(0, secondaryAxisSpec.endIndexOffset - (secondaryAxisSpec.pageSize - secondaryAxis.values.length)) : 0;

    // initialize the values array with undefined values
    var lastSecondaryIndex = secondaryAxisName ? secondaryAxis.values.length - (secondaryAxisStartOffset + secondaryAxisEndOffset) - 1 : 0;
    var primaryValuesArray = [];
    var primaryAxisLength = primaryAxis ? primaryAxis.values.length - (primaryAxisStartOffset + primaryAxisEndOffset) : 1;
    for (var primaryIndex = 0; primaryIndex < primaryAxisLength; ++primaryIndex) {
        primaryValuesArray[primaryIndex] = [];
        primaryValuesArray[primaryIndex][lastSecondaryIndex] = undefined;
    }

    // populate the values array
    var valueAxes = queryResponse.valueAxes;
    for (var valueIndex = 0; valueIndex < valueAxes.length; ++valueIndex) {
        var value = valueAxes[valueIndex];
        var measureValues = value[measureGroupName];

        if (measureValues && measureValues.length > 0) {
            if ( (primaryAxisName && (value[primaryAxisName] < primaryAxisStartOffset || value[primaryAxisName] > primaryAxis.values.length - primaryAxisEndOffset - 1)) ||
                 (secondaryAxisName && (value[secondaryAxisName] < secondaryAxisStartOffset || value[secondaryAxisName] > secondaryAxis.values.length - secondaryAxisEndOffset - 1)) )
            {
                continue;
            }

            var primaryAxisIndex = primaryAxisName ? value[primaryAxisName] - primaryAxisStartOffset: 0;
            var secondaryAxisIndex = secondaryAxisName ? value[secondaryAxisName] - secondaryAxisStartOffset: 0;

            primaryValuesArray[primaryAxisIndex][secondaryAxisIndex] = measureValues;
        }
    }

    return primaryValuesArray;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._getAppEntityNameByAttribute = function(attribute) {
    var caption = "";
    if (this._jsonData.consumptionModel) {
        var entities = this._jsonData.consumptionModel.entities;
        entities.forEach(function(entity) {
            if (entity && entity.attributes) {
                for (var entityAttribute in entity.attributes){
                    if (attribute === entityAttribute) {
                        caption = entity.caption;
                    }
                }
            }
        });
    }
    return caption;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._formatCalculationName = function(type, properties) {
    var calcDic = {
        "Running.Sum": "Running_Sum",
        "Running.Min": "Running_Min",
        "Running.Max": "Running_Max",
        "Running.Count": "Running_Count",
        "Running.Average": "Running_Avg",
        "Moving.Average": "Moving_Avg",
        "Percentage": "Percentage"
    };
    var noEmpties = false;
    var formattedType = calcDic[type] || type;

    if (properties && properties.withEmpties) {
        noEmpties = properties.withEmpties === "false";
    }

    if (noEmpties) {
        formattedType = formattedType + "_NE";
    }

    return formattedType;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildMeasureAggregationTypeMap = function(queryRequest, measureGroupName) {
    var measureAggregationTypeMap = {};

    if (queryRequest[measureGroupName] && queryRequest[measureGroupName].components){
        // BI Query Model v2
        for (var i = 0; i < queryRequest[measureGroupName].components.length; ++i) {
            var measureComponent = queryRequest[measureGroupName].components[i];
            measureAggregationTypeMap[measureComponent.id] = measureComponent.aggregationType;
        }
    } else if (queryRequest.dataQuery && queryRequest.dataQuery.dataSources) {
        // BI Query Model v3
        for (var j = 0; j < queryRequest.dataQuery.dataSources.length; ++j) {
            var dataSource = queryRequest.dataQuery.dataSources[j];
            if (dataSource.entities) {
                for (var k = 0; k < dataSource.entities.length; ++k) {
                    var entity = dataSource.entities[k];
                    if (entity.analyticType === "measure") {
                        measureAggregationTypeMap[entity.refId] = entity.aggregationType;
                    }
                }
            }
        }
    }

    return measureAggregationTypeMap;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildMeasuresInfo = function(queryRequest, measureGroupName, measureAxisPosition, entityIdCaptionMap, measureIdCaptionMap) {
    var measuresInfo = {
        members : [],
        axisPosition : measureAxisPosition,
        containAggregationNone : false
    };

    var measureGroupContainer = queryRequest.layout ? queryRequest.layout : queryRequest;
    if (measureGroupName && measureGroupContainer[measureGroupName]) {
        var measureAggregationTypeMap = this._buildMeasureAggregationTypeMap(queryRequest, measureGroupName);
        var measureMembers = measureGroupContainer[measureGroupName].components;
        this._measureMembers = measureMembers; // TODO probably shouldn't initialize this._measureMembers here
        var indexForSubTotal = 0;
        measureMembers.forEach(function(measureMember) {

            // hidden calculations should be ignored.
            if (measureMember.calculation && measureMember.calculation.hidden) {
                return;
            }

            var measureMemberJSON = {
                id : measureMember.id
            };

            // set the measure caption
            if (entityIdCaptionMap && measureIdCaptionMap) {
                if (this._isCalculatedMeasure(measureMember) && !this._isAggregatable(measureMember)) {
                    // case of running calculations

                    if (measureMember.key && measureMember.key.calculation) {
                        // BI Query Model v2
                        var idCaptionMap = this._buildEntityIdCaptionMapFromConsumption(this._consumptionModel);
                        var measureName = idCaptionMap[measureMember.key.calculation.measure];
                        if (typeof measureName === "undefined") {
                            measureName = this._getAppEntityNameByAttribute(measureMember.key.calculation.measure);
                        }
                        var type = measureMember.key.calculation.type;
                        var properties = measureMember.key.calculation.properties;
                        measureMemberJSON.caption = this._formatCalculationName(type, properties) + ": " + measureName;
                    } else {
                        // BI Query Model v3
                        measureMemberJSON.caption = entityIdCaptionMap[measureMember.id];

                        // For predictive calculations, the component id in the measure group axis
                        // does not match the id in the feeding info.
                        // For example:
                        // feeding id: EM_0[PRED]SPAForecast[*]1[;]DAY_OF_MONTH
                        // component id: CalEM_0_Predictive_SPAForecast
                        // Use the caption found in the measure metadata of the raw data set.
                        if (typeof measureMemberJSON.caption === "undefined") {
                            measureMemberJSON.caption = measureIdCaptionMap[measureMember.id];
                        }
                    }
                } else {
                    // case of all other measures
                    measureMemberJSON.caption = entityIdCaptionMap[measureMember.id];
                }
            }

            measuresInfo.containAggregationNone = measuresInfo.containAggregationNone || measureAggregationTypeMap[measureMember.id] === "none";

            if (!this._isCalculatedMeasure(measureMember) || this._isAggregatable(measureMember)) {
                // the index used for retrieving subtotals need to skip calculated member
                measureMemberJSON.indexForSubTotal = indexForSubTotal;
                indexForSubTotal++;
            } else {
                // calculated member does not have subtotal, so we use -1 to skip them
                measureMemberJSON.indexForSubTotal = -1;
            }

            measuresInfo.members.push(measureMemberJSON);
        }.bind(this));
    }

    return measuresInfo;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getMeasureMembers = function () {
    return this._measureMembers;
};

// Value returned here is what is visually displayed in the cross-table.
sap.basetable.crosstab.CrosstabDataProvider.sanitizeMemberValue = function(memberValue) {
    var sanitizedMemberValue;

    if (memberValue === null) {
        sanitizedMemberValue = ""; // TODO show empty string for now
    } else {
        sanitizedMemberValue = memberValue;
    }

    return sanitizedMemberValue;
};

// Note: This logic is duplicated in QueryResponseUtils.prototype.getTupleMemberFromDimensionIndexes,
// please make sure they match if you are changing anything here.
sap.basetable.crosstab.CrosstabDataProvider.prototype._buildMemberKey = function(memberJSON) {
    var keys = sap.basetable.crosstab.utils.MemberKeyUtils.buildMemberKey(memberJSON);
    if (keys.hasModified) {
        // if hasModified === true, the key has been modified, save to the map.
        if (!this._modifiedMemberKeys) {
            this._modifiedMemberKeys = [];
        }
        this._modifiedMemberKeys[keys.memberKey] = keys.originalKey;
    }

    return keys.memberKey;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addChildNode = function(currentNode, memberPath, memberId, baseMemberId, memberCaption, includeStackIndex, includeDataPoints) {
    var newChildNode = {
        tuplePath: currentNode.tuplePath.length === 0 ?
                            String(memberPath) :
                            currentNode.tuplePath + sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.TUPLE_PATH_DELIMITER + memberPath,
        member: {
            id: memberId,
            baseId: baseMemberId,
            caption: memberCaption
        },
        children: []
    };

    if (includeStackIndex) {
        newChildNode.member.stackIndex = currentNode.member ? currentNode.member.stackIndex + 1 : 0;
    }

    if (includeDataPoints) {
        newChildNode.dataPoints = [];
    }

    currentNode.children.push(newChildNode);

    return newChildNode;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addChildMeasureNode = function(currentNode, memberPath, memberId, baseMemberId, memberCaption, includeStackIndex, includeDataPoints) {
    var newChildNode = this._addChildNode(currentNode, memberPath, memberId, baseMemberId, memberCaption, includeStackIndex, includeDataPoints);
    newChildNode.isMeasure = true;
    return newChildNode;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addEmptySubTotalNode = function(currentNode, includeStackIndex, includeDataPoints, aggregationTarget, isLeaf) {
    var newChildNode = {
        tuplePath: currentNode.tuplePath.length === 0 ?
                            "" :
                            currentNode.tuplePath + sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.TUPLE_PATH_DELIMITER + "",
        member: {
            id: "",
            caption: "",
            aggregationTarget: aggregationTarget
        },
        children: [],
        isTotal: true,
        numOfLeafChildren: isLeaf ? 0 : 1
    };

    if (includeStackIndex) {
        newChildNode.member.stackIndex = currentNode.member ? currentNode.member.stackIndex + 1 : 0;
    }

    if (includeDataPoints) {
        newChildNode.dataPoints = [];
    }

    currentNode.children.push(newChildNode);

    return newChildNode;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addSubTotalNode = function(currentNode, aggregationType, aggregationTarget, includeStackIndex, includeDataPoints, numEmptyNodes, addToGrandTotals) {
    var subTotalTuplePath;
    if (aggregationTarget) {
        subTotalTuplePath = aggregationType + sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.SUBTOTAL_TUPLE_PATH_DELIMETER + aggregationTarget.id;
    } else {
        subTotalTuplePath = aggregationType;
    }
    var newChildNode = {
        tuplePath: currentNode.tuplePath.length === 0 ?
                            subTotalTuplePath :
                            currentNode.tuplePath + sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.TUPLE_PATH_DELIMITER + subTotalTuplePath,
        member: {
            id: aggregationType,
            caption: this._languageManager.get(this._getAggregationLabel(aggregationType)),
            aggregationTarget: aggregationTarget
        },
        children: [],
        isTotal: true,
        numOfLeafChildren: numEmptyNodes > 0 ? 1 : 0
    };

    if (includeStackIndex) {
        newChildNode.member.stackIndex = currentNode.member ? currentNode.member.stackIndex + 1 : 0;
    }

    if (includeDataPoints) {
        newChildNode.dataPoints = [];
    }


    if (addToGrandTotals) {
        this._grandTotals.push(newChildNode);
    } else {
        currentNode.children.push(newChildNode); // TODO to support totals before, we can insert the node at position 0
    }

    var isLeaf = false;
    for (var emptyNodeIndex = 0; emptyNodeIndex < numEmptyNodes; ++emptyNodeIndex) {
        isLeaf = emptyNodeIndex + 1 === numEmptyNodes;
        newChildNode = this._addEmptySubTotalNode(newChildNode, includeStackIndex, includeDataPoints, aggregationTarget, isLeaf);
    }

    return newChildNode;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addDataPoints = function(axisValuesArray, node, orthogonalAxisSubtotalTuples, flattenValuesArray, measureIndex, measureIndexForSubTotal, axisIndex) {
    var valuesArray = axisValuesArray[axisIndex];
    for (var valueIndex = 0; valueIndex < valuesArray.length; ++valueIndex) {
        // TODO we're assuming that a cell will have values for all measures or none
        // is it possible for a cell to have a value for one measure member and not for the other?
        var value = valuesArray[valueIndex] ? valuesArray[valueIndex][measureIndex] : "";

        if (node) {
            // When retriving subtotal values, we need to use the index that does not include calculated member
            this._addSubTotalValues(node, orthogonalAxisSubtotalTuples, valueIndex, measureIndexForSubTotal, axisIndex);

            node.dataPoints.push(value);

            // handle the case when the orthgonal subtotal is positioned to be the last value
            if (valueIndex === valuesArray.length - 1) {
                this._addSubTotalValues(node, orthogonalAxisSubtotalTuples, valuesArray.length, measureIndexForSubTotal, axisIndex);
            }
        }

        if (flattenValuesArray) {
            if (!flattenValuesArray[valueIndex]) {
                flattenValuesArray[valueIndex] = [];
            }
            flattenValuesArray[valueIndex].push(value);
        }
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addSubTotalNodeDataPoints = function(aggregationValues, subTotalNode, orthogonalAxisSubtotalTuples, flattenValuesArray) {
    for (var aggrValueIndex = 0; aggrValueIndex < aggregationValues.length; ++aggrValueIndex) {
        var aggrValue = aggregationValues[aggrValueIndex] === undefined ? "" : aggregationValues[aggrValueIndex];

        if (subTotalNode) {
            // TODO for now insert empty value where subtotals intersect
            this._addEmptySubTotalValues(subTotalNode, orthogonalAxisSubtotalTuples, aggrValueIndex);

            subTotalNode.dataPoints.push(aggrValue);

            // handle the case when the orthgonal subtotal is positioned to be the last value
            if (aggrValueIndex === aggregationValues.length - 1) {
                // TODO for now insert empty value where subtotals intersect
                this._addEmptySubTotalValues(subTotalNode, orthogonalAxisSubtotalTuples, aggregationValues.length);
            }
        }

        if (flattenValuesArray) {
            if (!flattenValuesArray[aggrValueIndex]) {
                flattenValuesArray[aggrValueIndex] = [];
            }
            flattenValuesArray[aggrValueIndex].push(aggrValue);
        }
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addFlattenSubTotalValues = function(flattenSubTotalValues, orthogonalAxisSubtotalTuples, measureIndexForSubTotal, axisIndex) {
    for (var orthogonalSubTotalAxisIndex in orthogonalAxisSubtotalTuples) {
        if (orthogonalAxisSubtotalTuples.hasOwnProperty(orthogonalSubTotalAxisIndex)) {
            var levelArray = orthogonalAxisSubtotalTuples[orthogonalSubTotalAxisIndex];
            for (var levelIndex in levelArray) {
                if (levelArray.hasOwnProperty(levelIndex)) {
                    var tupleContainer = levelArray[levelIndex];
                    for (var tuplePath in tupleContainer) {
                        if (tupleContainer.hasOwnProperty(tuplePath)) {
                            var aggregationArray = tupleContainer[tuplePath].aggregations;
                            for (var aggregationArrayIndex = 0; aggregationArrayIndex < aggregationArray.length; ++aggregationArrayIndex) {
                                var aggregationObject = aggregationArray[aggregationArrayIndex];
                                var tupleElement = this._findTupleElementByPath(flattenSubTotalValues, tuplePath);
                                var flattenSubTotalValuesArray = tupleElement.aggregations[aggregationObject.aggregation];
                                if (measureIndexForSubTotal < 0) {
                                    // If measureIndexForSubTotal is less than 0, it is a calculated member, add empty value instead
                                    flattenSubTotalValuesArray.push("");
                                } else {
                                    // When retrieving subtotal values, use the index that does not include calculated member
                                    flattenSubTotalValuesArray.push(aggregationObject.values[measureIndexForSubTotal][axisIndex]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addEmptyFlattenSubTotalValues = function(flattenSubTotalValues) {
    if (flattenSubTotalValues.hasOwnProperty('aggregations')) {
        var aggregationArray = flattenSubTotalValues.aggregations;
        for (var aggregationIndex in aggregationArray) {
            if (aggregationArray.hasOwnProperty(aggregationIndex)) {
                aggregationArray[aggregationIndex].push("");
            }
        }
    }
    if (flattenSubTotalValues.hasOwnProperty('children')) {
        var children = flattenSubTotalValues.children;
        for (var tupleElement in children) {
            if (children.hasOwnProperty(tupleElement)) {
                this._addEmptyFlattenSubTotalValues(children[tupleElement]);
            }
        }
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addSubTotalValues = function(node, orthogonalAxisSubtotalTuples, columnIndex, measureIndexForSubTotal, axisIndex) {
    var levelArray = orthogonalAxisSubtotalTuples[columnIndex];
    if (levelArray !== undefined) {
        // important that we iterate from innermost subtotal
        for (var levelIndex = levelArray.length - 1; levelIndex >= 0; --levelIndex) {
            var tupleContainer = levelArray[levelIndex];
            if (tupleContainer !== undefined) {
                for (var tuplePath in tupleContainer) {
                    if (tupleContainer.hasOwnProperty(tuplePath)) {
                        var tupleObject = tupleContainer[tuplePath];
                        for (var aggrIndex = 0; aggrIndex < tupleObject.aggregations.length; ++aggrIndex) {
                            var subTotalValue = "";
                            var aggregationMeasureValues = tupleObject.aggregations[aggrIndex].values[measureIndexForSubTotal];
                            if (aggregationMeasureValues && aggregationMeasureValues[axisIndex] !== undefined) {
                                subTotalValue = aggregationMeasureValues[axisIndex];
                            }
                            node.dataPoints.push(subTotalValue);
                        }
                    }
                }
            }
        }
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addEmptySubTotalValues = function(node, orthogonalAxisSubtotalTuples, columnIndex) {
    var levelArray = orthogonalAxisSubtotalTuples[columnIndex];
    if (levelArray !== undefined) {
        for (var levelIndex = levelArray.length - 1; levelIndex >= 0; --levelIndex) {
            var tupleContainer = levelArray[levelIndex];
            if (tupleContainer !== undefined) {
                for (var tuplePath in tupleContainer) {
                    if (tupleContainer.hasOwnProperty(tuplePath)) {
                        var tupleObject = tupleContainer[tuplePath];
                        for (var aggrIndex = 0; aggrIndex < tupleObject.aggregations.length; ++aggrIndex) {
                            node.dataPoints.push("");
                        }
                    }
                }
            }
        }
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildAxisTupleTree = function(queryResponse, axisName, includeStackIndex, axisValuesArray, includeDataPoints, measuresInfo, flattenValuesArray, flattenSubTotalValues, axisSpecification, appendAllSubtotals, isolateGrandTotals) {
    // root node
    var axisTupleTree = {
        rootnode: {
            tuplePath: "",
            children: []
        }
    };

    var rootNode = axisTupleTree.rootnode;
    if (axisName) {
        var axis = queryResponse.dimAxes[axisName];

        var axisStartIndexOffset = axisSpecification ? axisSpecification.startIndexOffset : 0;
        var axisEndIndexOffset = axisSpecification ? Math.max(0, axisSpecification.endIndexOffset - (axisSpecification.pageSize - axis.values.length)) : 0;
        var axisIndex = axisStartIndexOffset;
        var axisCount = axis.values.length - axisEndIndexOffset;

        for (; axisIndex < axisCount; ++axisIndex) {
            var currentNode = rootNode;

            var tuple = axis.values[axisIndex];
            var tupleLength = tuple.length;
            var tupleNodes = [];

            var subTotalTuples = [];

            for (var dimIndex = 0; dimIndex < tupleLength; ++dimIndex) {

                currentNode.numOfLeafChildren = currentNode.numOfLeafChildren ? currentNode.numOfLeafChildren + 1 : 1;

                var lastChildNode = currentNode.children[currentNode.children.length - 1];

                var tupleIndex = dimIndex;

                var memberIndex = tuple[tupleIndex];
                var memberId = this._buildMemberKey(queryResponse.metadata.dictionary[axisName][tupleIndex].value[memberIndex]);
                var baseMemberId = memberId;
                // If there is a measure with aggregation none, there may be multiple identical tuples with different values. In order to ensure that a tuple for each value
                // is inserted into the tuple tree, the member id is appended with the axis index in order to make it unique. This has the side affect of repeating the
                // innermost member name for each value in the crosstab.
                if (measuresInfo && measuresInfo.containAggregationNone && (dimIndex === (tupleLength - 1))) {
                    memberId = memberId + "_" + axisIndex;
                }
                var memberCaption = sap.basetable.crosstab.CrosstabDataProvider.sanitizeMemberValue(queryResponse.metadata.dictionary[axisName][tupleIndex].value[memberIndex].attributes.value[0]);

                if (lastChildNode && lastChildNode.member.id === memberId && lastChildNode.member.caption === memberCaption) {
                    currentNode = lastChildNode;
                } else {
                    var memberPath = this._buildMemberKey(queryResponse.metadata.dictionary[axisName][tupleIndex].value[memberIndex]);
                    currentNode = this._addChildNode(currentNode, memberPath, memberId, baseMemberId, memberCaption, includeStackIndex, includeDataPoints);
                }

                tupleNodes.push(currentNode);

                // add values for leaf node datapoints
                if (includeDataPoints && flattenValuesArray && dimIndex === tupleLength - 1) {
                    currentNode.dataPoints = flattenValuesArray[axisIndex - axisStartIndexOffset];
                }
            } // for (var dimIndex = 0; dimIndex < tupleLength; ++dimIndex)

            if (flattenSubTotalValues) {
                // keep track of the ancestor nodes for a subtotal node
                var currentTupleArray = this._buildTupleArray(queryResponse, axisName, tuple, tupleLength - 1);
                var tupleElement = flattenSubTotalValues;
                for (var elementIndex = -1; elementIndex < currentTupleArray.length; ++elementIndex) {
                    if (elementIndex >= 0) {
                        if (tupleElement.hasOwnProperty('children')) {
                            tupleElement = tupleElement.children[currentTupleArray[elementIndex]];
                        } else {
                            break;
                        }
                    }
                    if (tupleElement) {
                        if (tupleElement.hasOwnProperty('level') && tupleElement.hasOwnProperty('path')) {
                            subTotalTuples[tupleElement.level] = {};
                            subTotalTuples[tupleElement.level][tupleElement.path] = {
                                tupleElement: tupleElement,
                                nodes: tupleNodes.slice(0, tupleElement.level)
                            };
                        }
                    } else {
                        break;
                    }
                }

                var nextTuple = axis.values[axisIndex + 1];
                var nextTuplePath = this._buildTuplePath(queryResponse, axisName, nextTuple);

                // important that we iterate from innermost (highest level) subtotal
                for (var subTotalLevel = subTotalTuples.length - 1; subTotalLevel >= 0; --subTotalLevel) {
                    var subTotalTupleContainer = subTotalTuples[subTotalLevel];
                    if (subTotalTupleContainer === undefined) {
                        continue;
                    }

                    for (var tp in subTotalTupleContainer) {
                        if (subTotalTupleContainer.hasOwnProperty(tp)) {
                            var expectedNumOfNodes = subTotalLevel;

                            // if path of the next axis tuple does not match the tuple path of the subtotal, then we create the subtotal node
                            if (subTotalTupleContainer[tp] !== undefined && subTotalTupleContainer[tp].nodes.length === expectedNumOfNodes &&
                                ((nextTuplePath === null && appendAllSubtotals) || (nextTuplePath !== null && !this._containsTuplePath(nextTuplePath, tp)))) {
                                var ancestorNodes = subTotalTupleContainer[tp].nodes;
                                ancestorNodes.splice(0, 0, rootNode); // always include the root node
                                var parentNode = ancestorNodes[ancestorNodes.length - 1];
                                var subTotalAggregations = subTotalTupleContainer[tp].tupleElement.aggregations;
                                for (var aggregation in subTotalAggregations) {
                                    if (subTotalAggregations.hasOwnProperty(aggregation)) {
                                        var numEmptyNodes = queryResponse.metadata.dictionary[axisName].length - ancestorNodes.length;
                                        var subTotalNode;
                                        if (subTotalLevel === 0) {
                                            this._containsGrandTotals = true;
                                        }
                                        if (subTotalLevel === 0 && isolateGrandTotals) {
                                            subTotalNode = this._addSubTotalNode(parentNode, aggregation, null, includeStackIndex, includeDataPoints, numEmptyNodes, isolateGrandTotals);
                                        } else {
                                            for (var ancestorIndex = 0; ancestorIndex < ancestorNodes.length; ++ancestorIndex) {
                                                ancestorNodes[ancestorIndex].numOfLeafChildren++;
                                            }
                                            subTotalNode = this._addSubTotalNode(parentNode, aggregation, null, includeStackIndex, includeDataPoints, numEmptyNodes);
                                        }

                                        if (includeDataPoints) {
                                            subTotalNode.dataPoints = subTotalAggregations[aggregation];
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } else {
        // case of no dimensions on the axis
        if (includeDataPoints && flattenValuesArray) {
            // only insert 1 row of flatten values
            rootNode.dataPoints = flattenValuesArray[0];
        }
    }

    return axisTupleTree;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._findTupleElementByArray = function(measureAxisSubtotalTuples, currentTupleArray) {
    var tupleElement = null;

    var element = measureAxisSubtotalTuples;
    for (var i = 0; i < currentTupleArray.length && element !== null; ++i) {
        if (element.hasOwnProperty('children')) {
            var childElements = element.children;
            if (childElements.hasOwnProperty(currentTupleArray[i])) {
                element = childElements[currentTupleArray[i]];
            } else {
                element = null;
            }
        } else {
            element = null;
        }
    }

    tupleElement = element;

    return tupleElement;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._findTupleElementByPath = function(measureAxisSubtotalTuples, currentTuplePath) {
    var tupleArray = sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(currentTuplePath);
    return this._findTupleElementByArray(measureAxisSubtotalTuples, tupleArray);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildMeasureAxisTupleTree = function(queryResponse, axisName, includeStackIndex, axisValuesArray, includeDataPoints, measuresInfo, flattenValuesArray, flattenSubTotalValues, measureAxisSubtotalTuples, orthogonalAxisSubtotalTuples, axisSpecification, measuresSpecification, appendAllSubtotals, isolateGrandTotals) {
    // root node
    var axisTupleTree = {
        rootnode : {
            tuplePath: "",
            children: []
        }
    };

    var rootNode = axisTupleTree.rootnode;

    if (axisName) {
        var axis = queryResponse.dimAxes[axisName];
        var measureIndex = measuresSpecification ? measuresSpecification.measureStartIndex : 0;
        var measureEndIndex = measuresSpecification ? measuresSpecification.measureEndIndex : measuresInfo.members.length - 1;
        var startAxisIndex = axisSpecification ? axisSpecification.startIndexOffset : 0; // keep track of index to reset to when iterating each measure member

        var subTotalTuples = [];

        var axisStartIndexOffset = axisSpecification ? axisSpecification.startIndexOffset : 0;
        var axisEndIndexOffset = axisSpecification ? Math.max(0, axisSpecification.endIndexOffset - (axisSpecification.pageSize - axis.values.length)) : 0;
        var axisIndex = axisStartIndexOffset;
        var axisCount = axis.values.length - axisEndIndexOffset;

        while (axisIndex < axisCount) {
            var currentNode = rootNode;

            var tuple = axis.values[axisIndex];
            var tupleLength = tuple.length + 1; // increment tuple length by one to accomodate measure member
            var tupleNodes = [];
            var measureIndexForSubTotal = -1;
            if (measuresInfo.members && measuresInfo.members.length > measureIndex) {
                measureIndexForSubTotal = measuresInfo.members[measureIndex].indexForSubTotal;
            }

            // reset if it is not a calculated member
            if (measureIndexForSubTotal >= 0) {
                subTotalTuples = [];
            }
            var parentNode;

            for (var dimIndex = 0; dimIndex < tupleLength; ++dimIndex) {

                parentNode = currentNode;
                var lastChildNode = currentNode.children[currentNode.children.length - 1];

                var insertMeasure = measuresInfo.axisPosition === dimIndex && measuresInfo.members.length > 0;

                var tupleIndex = dimIndex >= measuresInfo.axisPosition ? dimIndex - 1 : dimIndex; // offset the added measure

                var memberIndex = tuple[tupleIndex];
                var memberId = insertMeasure ? measuresInfo.members[measureIndex].id : this._buildMemberKey(queryResponse.metadata.dictionary[axisName][tupleIndex].value[memberIndex]);
                var baseMemberId = memberId;
                // If there is a measure with aggregation none, there may be multiple identical tuples with different values. In order to ensure that a tuple for each value
                // is inserted into the tuple tree, the member id is appended with the axis index in order to make it unique. This has the side affect of repeating the
                // innermost member name for each value in the crosstab.
                if (measuresInfo.containAggregationNone && (dimIndex === (tupleLength - 1))) {
                    memberId = memberId + "_" + axisIndex;
                }
                var memberCaption = insertMeasure ? measuresInfo.members[measureIndex].caption : sap.basetable.crosstab.CrosstabDataProvider.sanitizeMemberValue(queryResponse.metadata.dictionary[axisName][tupleIndex].value[memberIndex].attributes.value[0]);


                if (lastChildNode && lastChildNode.member.id === memberId && lastChildNode.member.caption === memberCaption) {
                    currentNode = lastChildNode;
                } else {
                    var memberPath = insertMeasure ?
                        measuresInfo.members[measureIndex].caption :
                        this._buildMemberKey(queryResponse.metadata.dictionary[axisName][tupleIndex].value[memberIndex]);

                    currentNode = insertMeasure ?
                        this._addChildMeasureNode(currentNode, memberPath, memberId, baseMemberId, memberCaption, includeStackIndex, includeDataPoints) :
                        this._addChildNode(currentNode, memberPath, memberId, baseMemberId, memberCaption, includeStackIndex, includeDataPoints);
                }

                parentNode.numOfLeafChildren = parentNode.numOfLeafChildren ? parentNode.numOfLeafChildren + 1 : 1;

                tupleNodes.push(currentNode);

                // add values for leaf node datapoints and flattenValuesArray
                if ((includeDataPoints || flattenValuesArray) && dimIndex === tupleLength - 1) {
                    this._addDataPoints(axisValuesArray, includeDataPoints ? currentNode : null, orthogonalAxisSubtotalTuples, flattenValuesArray, measureIndex, measureIndexForSubTotal, axisIndex - axisStartIndexOffset);
                }
            } // for (var dimIndex = 0; dimIndex < tupleLength; ++dimIndex)

            if (flattenSubTotalValues) {
                this._addFlattenSubTotalValues(flattenSubTotalValues, orthogonalAxisSubtotalTuples, measureIndexForSubTotal, axisIndex - axisStartIndexOffset);
            }

            // keep track of the ancestor nodes for a subtotal node
            // note: the currentTupleArray does not include the measure member
            // consequently, the measure node will be added as an ancestor node
            if (measureIndexForSubTotal >= 0) {
                // Only loop through subtotal tuple when it is not a calculated member
                var currentTupleArray = this._buildTupleArray(queryResponse, axisName, tuple, tuple.length - 1);
                var tupleElement = measureAxisSubtotalTuples;
                for (var elementIndex = -1; elementIndex < currentTupleArray.length; ++elementIndex) {
                    if (elementIndex >= 0) {
                        if (tupleElement.hasOwnProperty('children')) {
                            tupleElement = tupleElement.children[currentTupleArray[elementIndex]];
                        } else {
                            break;
                        }
                    }
                    if (tupleElement) {
                        if (tupleElement.hasOwnProperty('level') && tupleElement.hasOwnProperty('path')) {
                            subTotalTuples[tupleElement.level] = {};
                            var maxNumNodes = tupleElement.level < measuresInfo.axisPosition ? tupleElement.level : tupleElement.level + 1;
                            subTotalTuples[tupleElement.level][tupleElement.path] = {
                                tupleElement: tupleElement,
                                nodes: tupleNodes.slice(0, maxNumNodes)
                            };
                        }
                    } else {
                        break;
                    }
                }
            }

            var nextTuple = axis.values[axisIndex + 1];
            var nextTuplePath = this._buildTuplePath(queryResponse, axisName, nextTuple);
            var aggregations;
            var aggregation;
            var aggrIndex;
            var aggregationTarget;
            var aggregationValues;
            var ancestorNodes;
            var ancestorIndex;
            var numEmptyNodes;
            var subTotalNode;

            // important that we iterate from innermost (highest level) subtotal
            for (var subTotalLevel = subTotalTuples.length - 1; subTotalLevel >= 0; --subTotalLevel) {
                var subTotalTupleContainer = subTotalTuples[subTotalLevel];

                if (subTotalTupleContainer === undefined) {
                    continue;
                }

                for (var tp in subTotalTupleContainer) {
                    if (subTotalTupleContainer.hasOwnProperty(tp)) {
                        // calculate expected number of ancestor nodes, based on 0-based subTotalLevel and whether subtotal is positioned after the measures
                        var expectedNumOfNodes = measuresInfo.axisPosition <= subTotalLevel ? subTotalLevel + 1 : subTotalLevel;

                        // if path of the next axis tuple does not match the tuple path of the subtotal, then we create the subtotal node
                        if (subTotalTupleContainer[tp] !== undefined && subTotalTupleContainer[tp].nodes.length === expectedNumOfNodes &&
                            ((nextTuplePath === null && appendAllSubtotals) || (nextTuplePath !== null && !this._containsTuplePath(nextTuplePath, tp)))) {

                            // case when the subTotal is positioned as an ancestor of all measure members
                            if (subTotalLevel < measuresInfo.axisPosition) {
                                if (measureIndex === measuresInfo.members.length - 1) { // check whether we've iterated all measures
                                    ancestorNodes = subTotalTupleContainer[tp].nodes;
                                    ancestorNodes.splice(0, 0, rootNode); // always include the root node
                                    aggregations = subTotalTupleContainer[tp].tupleElement.aggregations;
                                    for (aggrIndex = 0; aggrIndex < aggregations.length; ++aggrIndex) {
                                        aggregation = aggregations[aggrIndex];

                                        for (var m = 0; m < measuresInfo.members.length; ++m) { // iterate through all the measures
                                            var indexForSubTotal = measuresInfo.members[m].indexForSubTotal;
                                            if (indexForSubTotal >= 0) {
                                                // Only add subtotals if it is not a calculated member
                                                // use the index without calculated member to retrieve subtotals
                                                aggregationValues = aggregation.values[indexForSubTotal];
                                                aggregationTarget = measuresInfo.members[m];

                                                if (aggregationValues) {
                                                    for (ancestorIndex = 0; ancestorIndex < ancestorNodes.length; ++ancestorIndex) {
                                                        ancestorNodes[ancestorIndex].numOfLeafChildren++;
                                                    }
                                                    parentNode = ancestorNodes[ancestorNodes.length - 1];
                                                    numEmptyNodes = (queryResponse.metadata.dictionary[axisName].length - ancestorNodes.length) + 1; // include measure node
                                                    if (subTotalLevel === 0) {
                                                        this._containsGrandTotals = true;
                                                    }
                                                    if (subTotalLevel === 0 && isolateGrandTotals) {
                                                        subTotalNode = this._addSubTotalNode(parentNode, aggregation.aggregation, aggregationTarget, includeStackIndex, includeDataPoints, numEmptyNodes, isolateGrandTotals);
                                                    } else {
                                                        subTotalNode = this._addSubTotalNode(parentNode, aggregation.aggregation, aggregationTarget, includeStackIndex, includeDataPoints, numEmptyNodes);
                                                    }

                                                    if (includeDataPoints || flattenValuesArray) {
                                                        this._addSubTotalNodeDataPoints(aggregationValues, includeDataPoints ? subTotalNode : null, orthogonalAxisSubtotalTuples, flattenValuesArray);
                                                    }
                                                    if (flattenSubTotalValues) {
                                                        // TODO for now, insert empty value where subtotals intersect
                                                        this._addEmptyFlattenSubTotalValues(flattenSubTotalValues);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                // case when the subTotal is positioned as a child of a measure member
                                // build subtotal node for each aggregation based on current measure
                                if (measureIndexForSubTotal >= 0) {
                                    // Only add subtotals if it is not a calculated member
                                    ancestorNodes = subTotalTupleContainer[tp].nodes;
                                    ancestorNodes.splice(0, 0, rootNode); // always include the root node
                                    aggregations = subTotalTupleContainer[tp].tupleElement.aggregations;
                                    for (aggrIndex = 0; aggrIndex < aggregations.length; ++aggrIndex) {
                                        aggregation = aggregations[aggrIndex];
                                        aggregationTarget = measuresInfo.members[measureIndex];
                                        // use the index without calculated member to retrieve subtotals
                                        aggregationValues = aggregation.values[measureIndexForSubTotal];
                                        if (aggregationValues) {
                                            for (ancestorIndex = 0; ancestorIndex < ancestorNodes.length; ++ancestorIndex) {
                                                ancestorNodes[ancestorIndex].numOfLeafChildren++;
                                            }
                                            parentNode = ancestorNodes[ancestorNodes.length - 1];
                                            numEmptyNodes = (queryResponse.metadata.dictionary[axisName].length - ancestorNodes.length) + 1; // include measure node
                                            if (subTotalLevel === 0 && isolateGrandTotals) {
                                                subTotalNode = this._addSubTotalNode(parentNode, aggregation.aggregation, aggregationTarget, includeStackIndex, includeDataPoints, numEmptyNodes, isolateGrandTotals);
                                            } else {
                                                subTotalNode = this._addSubTotalNode(parentNode, aggregation.aggregation, aggregationTarget, includeStackIndex, includeDataPoints, numEmptyNodes);
                                            }
                                            if (includeDataPoints || flattenValuesArray) {
                                                this._addSubTotalNodeDataPoints(aggregationValues, includeDataPoints ? subTotalNode : null, orthogonalAxisSubtotalTuples, flattenValuesArray);
                                            }
                                            if (flattenSubTotalValues) {
                                                // TODO for now, insert empty value where subtotals intersect
                                                this._addEmptyFlattenSubTotalValues(flattenSubTotalValues);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // check the next tuple whether we should re-iterate the axis for another measure or
            // move to the next axis member
            if (nextTuple) {
                var measureParentIndex = measuresInfo.axisPosition - 1;
                var sameMeasureAncestors = true;
                for (var measureAncestorIndex = 0; measureAncestorIndex <= measureParentIndex; ++measureAncestorIndex) {
                    if (tuple[measureAncestorIndex] !== nextTuple[measureAncestorIndex]) {
                        sameMeasureAncestors = false;
                        break;
                    }
                }
                if (!sameMeasureAncestors) {
                    if (measureIndex === measuresInfo.members.length - 1) {
                        measureIndex = 0;
                        startAxisIndex = axisIndex + 1;
                    } else {
                        measureIndex++;
                        axisIndex = startAxisIndex;
                        continue;
                    }
                }
            // at the last tuple and we haven't reached the last expected measure; continue iterating the measures
            } else if (measureEndIndex && measureIndex < measureEndIndex) {
                measureIndex++;
                axisIndex = startAxisIndex;
                continue;
            }

            axisIndex++;
        }

    } else {
        // case of no dimensions on the axis, only handle measure members
        for (var i = 0; i < measuresInfo.members.length; ++i) {
            var member = measuresInfo.members[i];
            var measureNode = this._addChildMeasureNode(rootNode, member.caption, member.id, member.id, member.caption, includeStackIndex, includeDataPoints);
            if (includeDataPoints || flattenValuesArray) {
                this._addDataPoints(axisValuesArray, includeDataPoints ? measureNode : null, orthogonalAxisSubtotalTuples, flattenValuesArray, i, member.indexForSubTotal, 0);
            }
            if (flattenSubTotalValues) {
                this._addFlattenSubTotalValues(flattenSubTotalValues, orthogonalAxisSubtotalTuples, member.indexForSubTotal, 0);
            }
        }
        rootNode.numOfLeafChildren = measuresInfo.members.length;
    }

    return axisTupleTree;
};

/*
The function below creates the following data structure:
The path, level, and aggregations properties are defined for
a tuple element if there is a subtotal value for the tuple
path that consists of itself and all ancestor tuple elements.
The children property is defined for a tuple element if there
are any subtotal tuple paths that consist of itself as an
ancestor.
// TODO When iterating the aggregations by the type,
// ie. for (aggregationType in aggregations)
// the order appears to be dependant on the order which the
// <aggregation type> property was created.
// Is this guaranteed to always be the case in Javascript?
{
    path: <tuple path>
    level: <subtotal level>
    aggregations: {
        <aggregation type>: [
            <aggregation values for all measures>
        ]
        ...
    }
    children: {
        <tuple element>: {
            level: <subtotal level>
            aggregations: {
                <aggregation type>: [
                    <aggregation values for all measures>
                ]
                ...
            }
            children: {
                <tuple element>: {
                    ...
                }
                ...
            }
        }
        ...
    }
}
*/
sap.basetable.crosstab.CrosstabDataProvider.prototype._buildFlattenSubtotalValues = function(axisSubtotalTuples) {
    var flattenSubtotalValues = {};

    for (var axisIndex = 0; axisIndex < axisSubtotalTuples.length; ++axisIndex) {
        var levelArray = axisSubtotalTuples[axisIndex];
        if (!levelArray) {
            continue;
        }

        for (var levelIndex = 0; levelIndex < levelArray.length; ++levelIndex) {
            var tupleContainer = levelArray[levelIndex];
            if (!tupleContainer) {
                continue;
            }

            for (var tuplePath in tupleContainer) {
                if (tupleContainer.hasOwnProperty(tuplePath)) {
                    var currentTupleElement;
                    var tuple = sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(tuplePath);
                    for (var elementIndex = -1; elementIndex < tuple.length; ++elementIndex) {
                        var tupleElement;
                        if (elementIndex === -1) {
                            tupleElement = flattenSubtotalValues;
                        } else {
                            var element = tuple[elementIndex];

                            var currentTupleElementChildren = currentTupleElement.children;
                            if (!currentTupleElementChildren) {
                                currentTupleElement.children = {};
                                currentTupleElementChildren = currentTupleElement.children;
                            }

                            tupleElement = currentTupleElementChildren[element];
                            if (!tupleElement) {
                                currentTupleElementChildren[element] = {};
                                tupleElement = currentTupleElementChildren[element];
                            }
                        }

                        if (elementIndex === tuple.length - 1) {
                            tupleElement.path = this._buildTuplePathFromArray(tuple);
                            tupleElement.level = levelIndex;
                            tupleElement.aggregations = {};

                            var aggregations = tupleContainer[tuplePath].aggregations;
                            for (var aggregationIndex = 0; aggregationIndex < aggregations.length; ++aggregationIndex) {
                                var aggregationObject = aggregations[aggregationIndex];
                                tupleElement.aggregations[aggregationObject.aggregation] = []; // we will write values to this empty array
                            }
                        }

                        currentTupleElement = tupleElement;
                    }

                }
            }

        }
    }

    return flattenSubtotalValues;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildTupleTrees = function(query, queryResponse, entityIdCaptionMap, measureIdCaptionMap, rowAxisName, columnAxisName,
    measureAxisType, measureGroupName, measureAxisPosition, pageSpecification, measuresSpecification, axisTupleLengths, appendAllRowSubtotals, appendAllColumnSubtotals, anchoredTotals) {
    this._grandTotals = [];
    var rowAxisTupleTree;
    var columnAxisTupleTree;

    var rowAxisSpec = pageSpecification ? pageSpecification[rowAxisName] : null;
    var columnAxisSpec = pageSpecification ? pageSpecification[columnAxisName] : null;

    var rowAxisFullLength = axisTupleLengths ? axisTupleLengths[rowAxisName] : null;
    var columnAxisFullLength = axisTupleLengths ? axisTupleLengths[columnAxisName] : null;

    var flattenSubTotalValues;
    if (measureAxisType === "row" || measureAxisType === "column") {
        var primaryValuesArray = this._buildAxesValuesArray(queryResponse, rowAxisSpec, columnAxisSpec, rowAxisName, columnAxisName, measureAxisType, measureGroupName);
        var measuresInfo = this._buildMeasuresInfo(query, measureGroupName, measureAxisPosition, entityIdCaptionMap, measureIdCaptionMap);
        var measureAxisName = measureAxisType === "row" ? rowAxisName : columnAxisName;
        var orthogonalAxisName = measureAxisType === "row" ? columnAxisName : rowAxisName;
        var measureAxisSpec = pageSpecification ? pageSpecification[measureAxisName] : null;
        var orthogonalAxisSpec = pageSpecification ? pageSpecification[orthogonalAxisName] : null;

        var appendAllMeasureAxisSubtotals = measureAxisType === "row" ? appendAllRowSubtotals : appendAllColumnSubtotals;
        var measureAxisSubtotalTuples = this._buildMeasureAxisSubTotalTuples(query, queryResponse, measureAxisName, orthogonalAxisSpec, orthogonalAxisName, measureGroupName);

        var orthogonalAxisFullLength = axisTupleLengths ? axisTupleLengths[orthogonalAxisName] : null;
        var appendAllOrthogonalAxisSubtotals = measureAxisType === "row" ? appendAllColumnSubtotals : appendAllRowSubtotals;
        var orthogonalAxisSubtotalTuples = this._buildAxisSubTotalTuples(query, queryResponse, orthogonalAxisSpec, orthogonalAxisFullLength, orthogonalAxisName, measureAxisSpec, measureAxisName, measureGroupName, appendAllOrthogonalAxisSubtotals);

        flattenSubTotalValues = this._buildFlattenSubtotalValues(orthogonalAxisSubtotalTuples);
        if (measureAxisType === "row") {
            rowAxisTupleTree = this._buildMeasureAxisTupleTree(queryResponse, rowAxisName, false, primaryValuesArray, true, measuresInfo, null, flattenSubTotalValues, measureAxisSubtotalTuples, orthogonalAxisSubtotalTuples, rowAxisSpec, measuresSpecification, appendAllMeasureAxisSubtotals, anchoredTotals);
            columnAxisTupleTree = this._buildAxisTupleTree(queryResponse, columnAxisName, true, null, false, measuresInfo, null, flattenSubTotalValues, columnAxisSpec, appendAllOrthogonalAxisSubtotals, false);
        } else {
            var flattenValuesArray = [];
            columnAxisTupleTree = this._buildMeasureAxisTupleTree(queryResponse, columnAxisName, true, primaryValuesArray, false, measuresInfo, flattenValuesArray, flattenSubTotalValues, measureAxisSubtotalTuples, orthogonalAxisSubtotalTuples, columnAxisSpec, measuresSpecification, appendAllMeasureAxisSubtotals, false);
            rowAxisTupleTree = this._buildAxisTupleTree(queryResponse, rowAxisName, false, null, true, measuresInfo, flattenValuesArray, flattenSubTotalValues, rowAxisSpec, appendAllOrthogonalAxisSubtotals, anchoredTotals);
        }
    } else {
        // no measures on any of the axes
        var rowAxisSubtotalTuples = this._buildAxisSubTotalTuples(query, queryResponse, rowAxisSpec, rowAxisFullLength, rowAxisName, columnAxisSpec, columnAxisName, measureGroupName, appendAllRowSubtotals);
        flattenSubTotalValues = this._buildFlattenSubtotalValues(rowAxisSubtotalTuples);
        rowAxisTupleTree = this._buildAxisTupleTree(queryResponse, rowAxisName, false, null, true, null, null, flattenSubTotalValues, rowAxisSpec, appendAllRowSubtotals, anchoredTotals);

        var columnAxisSubtotalTuples = this._buildAxisSubTotalTuples(query, queryResponse, columnAxisSpec, columnAxisFullLength, columnAxisName, rowAxisSpec, rowAxisName, measureGroupName, appendAllColumnSubtotals);
        flattenSubTotalValues = this._buildFlattenSubtotalValues(columnAxisSubtotalTuples);
        columnAxisTupleTree = this._buildAxisTupleTree(queryResponse, columnAxisName, true, null, false, null, null, flattenSubTotalValues, columnAxisSpec, appendAllColumnSubtotals);
    }

    return [rowAxisTupleTree, columnAxisTupleTree];
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildAxisDimensions = function(queryResponse, entityIdCaptionMap, axisName, measureAxisPosition) {
    var axis = {
        dimensions: []
    };

    var axisDimensionArray = queryResponse.metadata.dictionary[axisName];
    for (var dimIndex = 0; axisDimensionArray && dimIndex < axisDimensionArray.length; ++dimIndex) {
        var dimensionId = axisDimensionArray[dimIndex].id;
        var hasCompositeKey = !!axisDimensionArray[dimIndex].hasCompositeKey;
        var dimension = {
            id: dimensionId,
            caption: entityIdCaptionMap[dimensionId],
            hasCompositeKey: hasCompositeKey
        };

        axis.dimensions.push(dimension);
    }

    if (measureAxisPosition !== null) {
        var measureDimension = {
            id: sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.MEASURE_NAMES_DIMENSION,
            caption: this._languageManager.get("XTAB_MEASURE_AXIS_TITLE")
        };
        axis.dimensions.splice(measureAxisPosition, 0, measureDimension);
    }

    return axis;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildAxesDimensions = function(queryResponse, entityIdCaptionMap, rowAxisName, columnAxisName, measureAxisType, measureAxisPosition) {
    var rowMeasurePos = measureAxisType === "row" ? measureAxisPosition : null;
    var rowAxis = this._buildAxisDimensions(queryResponse, entityIdCaptionMap, rowAxisName, rowMeasurePos);
    var columnMeasurePos = measureAxisType === "column" ? measureAxisPosition : null;
    var columnAxis = this._buildAxisDimensions(queryResponse, entityIdCaptionMap, columnAxisName, columnMeasurePos);
    this._measureAxisType = measureAxisType;
    this._measureAxisPosition = measureAxisPosition;
    return [rowAxis, columnAxis];
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._findAxisName = function(queryResponse, dimensionIdArray) {
    var foundAxis = null;

    if (dimensionIdArray.length > 0) {
        var dimAxes = queryResponse.dimAxes;
        for (var axis in dimAxes) {
            if (dimAxes.hasOwnProperty(axis)) {
                var axisDimArray = queryResponse.metadata.dictionary[axis];
                var axisDimIdArray = [];
                for (var axisDimIndex = 0; axisDimIndex < axisDimArray.length; ++axisDimIndex) {
                    axisDimIdArray.push(axisDimArray[axisDimIndex].id);
                }

                // check the number of dimensions and the ids
                if (dimensionIdArray.length === axisDimIdArray.length) {
                    foundAxis = axis;
                    for (var dimIdIndex = 0; dimIdIndex < dimensionIdArray.length; ++dimIdIndex) {
                        if (axisDimIdArray.indexOf(dimensionIdArray[dimIdIndex]) === -1) {
                            foundAxis = null;
                            break;
                        }
                    }
                }

                if (foundAxis !== null) {
                    break;
                }
            }
        }
    }

    return foundAxis;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._findMeasureGroupName = function(queryRequest) {
    var measureGroupName = null;

    if (queryRequest) {
        var axesContainer = queryRequest.layout ? queryRequest.layout : queryRequest;
        for (var axisName in axesContainer) {
            if (axesContainer.hasOwnProperty(axisName) && axesContainer[axisName].axisType === "numerical" && !axesContainer[axisName].hidden) {
                measureGroupName = axisName;
                break;
            }
        }
    }

    return measureGroupName;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._getAggregationTypes = function(queryRequest, axisName, calculationId) {
    var aggregationTypes = [];

    var axesContainer = queryRequest.layout ? queryRequest.layout : queryRequest;
    var calculations = axesContainer[axisName].calculations;
    for (var calcIndex = 0; calcIndex < calculations.length; ++calcIndex) {
        if (calculations[calcIndex].id === calculationId) {
            for (var defIndex = 0; defIndex < calculations[calcIndex].definitions.length; ++defIndex) {
                aggregationTypes.push(calculations[calcIndex].definitions[defIndex].aggregationType);
            }
            break;
        }
    }

    return aggregationTypes;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._getAggregationLabel = function(aggregationType) {
    var label = null;

    switch(aggregationType.toLowerCase()) {
        case "default":
            label = "XTAB_SUBTOTAL_LABEL_TOTAL";
            break;
        case "sum":
            label = "XTAB_SUBTOTAL_LABEL_SUM";
            break;
        case "count":
            label = "XTAB_SUBTOTAL_LABEL_COUNT";
            break;
        case "average":
            label = "XTAB_SUBTOTAL_LABEL_AVERAGE";
            break;
        case "min":
            label = "XTAB_SUBTOTAL_LABEL_MIN";
            break;
        case "max":
            label = "XTAB_SUBTOTAL_LABEL_MAX";
            break;
        default:
            break;
    }

    return label;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._getMeasureIndices = function(queryRequest, axisName, calculationId, measureGroupName) {
    var measureIndices = [];

    var measureMembersNoCalc = [];
    var measureGroupContainer = queryRequest.layout ? queryRequest.layout : queryRequest;
    if (measureGroupName && measureGroupContainer[measureGroupName]) {
        var measureMembers = measureGroupContainer[measureGroupName].components;

        // Will return the id of the aggregatable calculation if found, or fail gracefully and return undefined.
        var getAggregatableCalculationId = function (testCalc) {
            if (testCalc.calculation && testCalc.calculation.AST && testCalc.calculation.AST.root && testCalc.calculation.AST.root.id) {
                return testCalc.calculation.AST.root.id;
            }
        };

        measureMembers.forEach(function(measureMember) {
            var measureMemberId;
            if (!this._isCalculatedMeasure(measureMember)) {
                measureMemberId =  measureMember.id;
            } else if (this._isAggregatable(measureMember)) {
                measureMemberId = getAggregatableCalculationId(measureMember);
            }
            if (measureMemberId) {
                measureMembersNoCalc.push(measureMemberId);
            }
        }.bind(this));
    }
    var axesContainer = queryRequest.layout ? queryRequest.layout : queryRequest;
    var calculations = axesContainer[axisName].calculations;
    for (var calcIndex = 0; calcIndex < calculations.length; ++calcIndex) {
        if (calculations[calcIndex].id === calculationId) {
            for (var targetIndex = 0; targetIndex < calculations[calcIndex].target.length; ++targetIndex) {
                var measureId = calculations[calcIndex].target[targetIndex].id;
                var measureIndex = measureMembersNoCalc.indexOf(measureId);
                measureIndices.push(measureIndex);
            }
            break;
        }
    }

    return measureIndices;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._coordsStartsWith = function(coords, axisCoords) {
    var startsWith = true;

    for (var i = 0; i < axisCoords.length; ++i) {
        if (coords[i] !== axisCoords[i]) {
            startsWith = false;
            break;
        }
    }

    return startsWith;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildTupleArray = function(queryResponse, axisName, axisCoords, dimIndex) {
    var tupleArray = null;

    if (axisCoords) {
        tupleArray = [];
        var length = dimIndex === undefined ? axisCoords.length : dimIndex + 1;
        for (var i = 0; i < length; ++i) {
            var memberIndex = axisCoords[i];
            var tupleElement = this._buildMemberKey(queryResponse.metadata.dictionary[axisName][i].value[memberIndex]);
            tupleArray.push(tupleElement);
        }
    }

    return tupleArray;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildTuplePathFromArray = function(tupleArray) {
    var tuplePath = null;

    if (tupleArray) {
        tuplePath = "";
        for (var i = 0; i < tupleArray.length; ++i) {
            if (tuplePath.length > 0) {
                tuplePath += sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.TUPLE_PATH_DELIMITER;
            }
            tuplePath += tupleArray[i];
        }
    }

    return tuplePath;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildTuplePath = function(queryResponse, axisName, axisCoords, dimIndex) {
    var tuplePath = null;

    if (axisCoords) {
        tuplePath = "";
        var length = dimIndex === undefined ? axisCoords.length : dimIndex + 1;
        for (var i = 0; i < length; ++i) {
            var memberIndex = axisCoords[i];
            if (tuplePath.length > 0) {
                tuplePath += sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.TUPLE_PATH_DELIMITER;
            }
            tuplePath += this._buildMemberKey(queryResponse.metadata.dictionary[axisName][i].value[memberIndex]);
        }
    }

    return tuplePath;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._containsTuplePath = function(tuplePath, tuplePathToCheck) {
    if (tuplePath !== undefined && tuplePathToCheck !== undefined) {
        if (tuplePath === tuplePathToCheck || tuplePathToCheck.length === 0) {
            return true;
        }

        if (tuplePath.indexOf(tuplePathToCheck) !== 0) {
            return false;
        }
        var tuplePathArr = sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(tuplePath);
        var tuplePathToCheckArr = sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(tuplePathToCheck);
        if (tuplePathArr.length >= tuplePathToCheckArr.length) {
            for (var i = 0; i < tuplePathToCheckArr.length; i++) {
                if (tuplePathToCheckArr[i] !== tuplePathArr[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._findSubtotalAxisIndex = function(queryResponse, axisSpec, axisFullLength, axisName, axisCoords, isTotalsAfter, appendAllSubtotals) {
    var axisIndex = null;
    var axisLength = queryResponse.dimAxes[axisName].values.length;

    // handle the case for grand totals
    if (axisCoords === undefined || axisCoords.length === 0) {
        if (isTotalsAfter) {
            if (axisSpec === null || axisFullLength === null) {
                axisIndex = axisLength; // TODO we only consider this case because old tests do not use axisSpec and axisFullLength
            } else {
                if (((axisSpec.page + 1) * axisSpec.pageSize) - axisSpec.endIndexOffset >= axisFullLength) {
                    axisIndex = axisLength;
                }
            }
        } else {
            if (axisSpec === null || axisFullLength === null) {
                axisIndex = 0;
            } else {
                if ((axisSpec.page + axisSpec.startIndexOffset) === 0) {
                    axisIndex = 0;
                }
            }
        }
    } else {
        if (isTotalsAfter) {
            var index = 0;
            var axisStartOffset = axisSpec ? axisSpec.startIndexOffset : 0;
            var axisEndOffset = axisSpec ? Math.max(0, axisSpec.endIndexOffset - (axisSpec.pageSize - axisLength)) : 0;
            for (var i = axisStartOffset; i < axisLength - axisEndOffset; ++i) {
                var coords = queryResponse.dimAxes[axisName].values[i];
                var nextCoords = queryResponse.dimAxes[axisName].values[i + 1];
                if (this._coordsStartsWith(coords, axisCoords) &&
                    ((nextCoords === undefined && appendAllSubtotals) || (nextCoords !== undefined && !this._coordsStartsWith(nextCoords, axisCoords)))) {
                    axisIndex = index + 1;
                    break;
                }
                index++;
            }
        }
        // TODO not isTotalsAfter - the query request will need to include an extra tuple at the beginning for this to work when
        // the start of the axis range is on a tuple that should have it's subtotal displayed
    }

    return axisIndex;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._coordsEqual = function(coords1, coords2) {
    var isEqual = true;
    if (coords1.length === coords2.length) {
        for (var i = 0; i < coords1.length; ++i) {
            if (coords1[i] !== coords2[i]) {
                isEqual = false;
                break;
            }
        }
    } else {
        isEqual = false;
    }

    return isEqual;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._addAggregationValues = function(queryResponse, aggregations, value, orthogonalAxisSpec, orthogonalAxisName, aggregationTypes, measureIndices) {
    for (var aggregationTypeIndex = 0; aggregationTypeIndex < aggregationTypes.length; ++aggregationTypeIndex) {
        var aggregationType = aggregationTypes[aggregationTypeIndex];
        var aggregationObject = null;
        for (var aggregationIndex = 0; aggregationIndex < aggregations.length; ++aggregationIndex) {
            if (aggregations[aggregationIndex].aggregation === aggregationType) {
                aggregationObject = aggregations[aggregationIndex];
                break;
            }
        }
        if (aggregationObject === null) {
            aggregationObject = {
                aggregation : aggregationType,
                values : []
            };
            aggregations.push(aggregationObject);
        }

        var orthogonalAxisStartOffset = orthogonalAxisSpec ? orthogonalAxisSpec.startIndexOffset : 0;
        var orthogonalAxisEndOffset = orthogonalAxisSpec ? Math.max(0, orthogonalAxisSpec.endIndexOffset - (orthogonalAxisSpec.pageSize - queryResponse.dimAxes[orthogonalAxisName].values.length)) : 0;

        for (var m = 0; m < measureIndices.length; ++m) {
            var measureIndex = measureIndices[m];

            var aggregationValues = aggregationObject.values[measureIndex];
            if (aggregationValues === undefined) {
                aggregationValues = [];

                var orthogonalAxisCount;
                if (orthogonalAxisName === null) {
                    orthogonalAxisCount = 1;
                } else {
                    orthogonalAxisCount = queryResponse.dimAxes[orthogonalAxisName].values.length - (orthogonalAxisStartOffset + orthogonalAxisEndOffset);
                }

                aggregationValues[orthogonalAxisCount - 1] = undefined; // initialize an array of undefined
                aggregationObject.values[measureIndex] = aggregationValues;
            }

            if (orthogonalAxisName === null) {
                aggregationValues[0] = value.values[aggregationTypeIndex][measureIndex];
            } else {
                var orthogonalAxisCoords = value.window[orthogonalAxisName];
                var coords = queryResponse.dimAxes[orthogonalAxisName].values;
                var orthogonalAxisIndex = 0;
                for (var coordsIndex = orthogonalAxisStartOffset; coordsIndex < coords.length - orthogonalAxisEndOffset; ++coordsIndex) {
                    if (this._coordsEqual(coords[coordsIndex], orthogonalAxisCoords)) {

                        // To help fix BITVDC25-1001.
                        // Only record the subtotal value if the subtotal value at the orthogonalAxisIndex has not been set
                        // or was set to null. The actual bug is in NETT adapter where duplicate subtotal values exist for a
                        // set of axis indices, where one of the subtotal value is null. Previously when reading the subtotal
                        // values, we overwrote the previous valid subtotal value with the null value.
                        if (aggregationValues[orthogonalAxisIndex] === undefined || aggregationValues[orthogonalAxisIndex] === null) {
                            aggregationValues[orthogonalAxisIndex] = value.values[aggregationTypeIndex][measureIndex];
                        }

                        break;
                    }
                    orthogonalAxisIndex++;
                }
            }
        }
    }

    return aggregations;
};

/*
The function _buildAxisSubTotalTuples below creates the following data structure:
[
    // axis index x
    [
        // level m
        {
            <tuple path>: {
                aggregations: [
                    {
                        aggregation: <aggregation type>
                        values: [
                            [ <measure 0 values of orthogonal axis> ],
                            [ <measure 1 values of orthogonal axis> ],
                            ...
                        ]
                    }
                    ...
                ]
            }
        },

        // level n, where n > m
        {
            ...
        },
        ...
    ],

    // axis index y
    [
    ],
    ...
]
*/
sap.basetable.crosstab.CrosstabDataProvider.prototype._buildAxisSubTotalTuples = function(query, queryResponse, axisSpec, axisFullLength, axisName, orthogonalAxisSpec, orthogonalAxisName, measureGroupName, appendAllSubtotals) {
    var subTotalTuples = [];

    var calculations = queryResponse.calculations;

    if (calculations) {

        var axisCalculations = calculations[axisName];
        if (axisCalculations) {
            for (var axisCalcIndex = 0; axisCalcIndex < axisCalculations.length; ++ axisCalcIndex) {
                var axisCalc = axisCalculations[axisCalcIndex];

                // TODO should we also partition by calculation Id?
                var aggregationTypes = this._getAggregationTypes(query, axisName, axisCalc.id);

                var measureIndices = this._getMeasureIndices(query, axisName, axisCalc.id, measureGroupName);

                for (var valuesIndex = 0; valuesIndex < axisCalc.values.length; ++valuesIndex) {
                    var value = axisCalc.values[valuesIndex];

                    var axisCoords = value.window[axisName] ? value.window[axisName] : [];

                    var axisIndex = this._findSubtotalAxisIndex(queryResponse, axisSpec, axisFullLength, axisName, axisCoords, true, appendAllSubtotals);
                    // axisIndex is null if we cannot find where the subtotal should be inserted
                    if (axisIndex !== null) {
                        var levelArray = subTotalTuples[axisIndex];
                        if (levelArray === undefined) {
                            levelArray = [];
                            subTotalTuples[axisIndex] = levelArray;
                        }

                        var level = axisCoords.length;

                        var tupleContainer = levelArray[level];
                        if (tupleContainer === undefined) {
                            tupleContainer = {};
                            levelArray[level] = tupleContainer;
                        }

                        var tuplePath = this._buildTuplePath(queryResponse, axisName, axisCoords);
                        var tupleObject = tupleContainer[tuplePath];
                        if (tupleObject === undefined) {
                            tupleObject = {
                                aggregations : []
                            };
                            tupleContainer[tuplePath] = tupleObject;
                        }

                        this._addAggregationValues(queryResponse, tupleObject.aggregations, value, orthogonalAxisSpec, orthogonalAxisName, aggregationTypes, measureIndices);
                    }
                }
            }
        }
    }

    return subTotalTuples;
};

/*
The function _buildMeasureAxisSubTotalTuples below creates the following data structure:
{
    path: <tuple path>
    level: <subtotal level>
    aggregations: [
        {
            aggregation: <aggregation type>
            values: [
                [ <measure 0 values of orthogonal axis> ],
                [ <measure 1 values of orthogonal axis> ],
                ...
            ]
        }
        ...
    ]
    children: {
        <tuple element>: {
            path: <tuple path>
            level: <subtotal level>
            aggregations: [
                {
                    aggregation: <aggregation type>
                    values: [
                        [ <measure 0 values of orthogonal axis> ],
                        [ <measure 1 values of orthogonal axis> ],
                        ...
                    ]
                }
                ...
            ]
            children: {
                <tuple element>: {
                    ...
                }
                ...
            }
        }
        ...
    }
}
*/
sap.basetable.crosstab.CrosstabDataProvider.prototype._buildMeasureAxisSubTotalTuples = function(query, queryResponse, axisName, orthogonalAxisSpec, orthogonalAxisName, measureGroupName) {
    var subTotalTuples = {};

    var calculations = queryResponse.calculations;

    if (calculations) {
        var axisCalculations = calculations[axisName];
        if (axisCalculations) {
            for (var axisCalcIndex = 0; axisCalcIndex < axisCalculations.length; ++ axisCalcIndex) {
                var axisCalc = axisCalculations[axisCalcIndex];

                // TODO should we also partition by calculation Id?
                var aggregationTypes = this._getAggregationTypes(query, axisName, axisCalc.id);

                var measureIndices = this._getMeasureIndices(query, axisName, axisCalc.id, measureGroupName);

                for (var valuesIndex = 0; valuesIndex < axisCalc.values.length; ++valuesIndex) {
                    var value = axisCalc.values[valuesIndex];

                    var axisCoords = value.window[axisName] ? value.window[axisName] : [];

                    var tuple = this._buildTupleArray(queryResponse, axisName, axisCoords);
                    var currentTupleElement;
                    for (var elementIndex = -1; elementIndex < tuple.length; ++elementIndex) {
                        var tupleElement;
                        if (elementIndex === -1) {
                            tupleElement = subTotalTuples;
                        } else {
                            var element = tuple[elementIndex];

                            var currentTupleElementChildren = currentTupleElement.children;
                            if (!currentTupleElementChildren) {
                                currentTupleElement.children = {};
                                currentTupleElementChildren = currentTupleElement.children;
                            }

                            tupleElement = currentTupleElementChildren[element];
                            if (!tupleElement) {
                                currentTupleElementChildren[element] = {};
                                tupleElement = currentTupleElementChildren[element];
                            }
                        }

                        if (elementIndex === tuple.length - 1) {
                            tupleElement.path = this._buildTuplePathFromArray(tuple);
                            tupleElement.level = axisCoords.length;
                            if (tupleElement.aggregations === undefined) {
                                tupleElement.aggregations = [];
                            }
                            this._addAggregationValues(queryResponse, tupleElement.aggregations, value, orthogonalAxisSpec, orthogonalAxisName, aggregationTypes, measureIndices);
                        }

                        currentTupleElement = tupleElement;
                    }
                }
            }
        }
    }

    return subTotalTuples;
};


sap.basetable.crosstab.CrosstabDataProvider.prototype._processAxisFeeding = function(axisFeeding) {
    var measureAxisPosition = null;
    var numMeasures = 0;

    var dimensionIdArray = [];
    var levelIndexOffset = 0;
    for (var index = 0; index < axisFeeding.length; ++index) {
        var item = axisFeeding[index];
        if (item.type === "dimension") {
            dimensionIdArray.push(item.id);
        } else if (item.type === "hierarchy") {
            for (var i = 0; i < item.levels.length; i++) {
                var level = item.levels[i];
                dimensionIdArray.push(level.id);
                levelIndexOffset++;
                if (level.selected) {
                    break;
                }
            }
            // decrease for hierarchy
            levelIndexOffset -= 1;
        } else if (item.type === "measure") {
            numMeasures++;
            if (measureAxisPosition === null) {
                measureAxisPosition = index + levelIndexOffset;
            }
        }
    }

    var result = {
        measureAxisPosition: measureAxisPosition,
        numMeasures: numMeasures,
        dimensionIdArray: dimensionIdArray
    };

    return result;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildEntityIdCaptionMapFromConsumption = function(consumptionModel) {
    var entityIdCaptionMap = {};
    if (consumptionModel) {
        for (var entityIndex = 0; entityIndex < consumptionModel.entities.length; ++entityIndex) {
            var entity = consumptionModel.entities[entityIndex];
            entityIdCaptionMap[entity.id] = entity.caption;
        }
        if (consumptionModel.userHierarchies) {
            for (var hierarchyIndex = 0; hierarchyIndex < consumptionModel.userHierarchies.length; ++hierarchyIndex) {
                if (consumptionModel.userHierarchies[hierarchyIndex].levels) {
                    for (var levelIndex = 0; levelIndex < consumptionModel.userHierarchies[hierarchyIndex].levels.length; ++levelIndex) {
                        var levelEntity = consumptionModel.userHierarchies[hierarchyIndex].levels[levelIndex];
                        entityIdCaptionMap[levelEntity.id] = levelEntity.caption;
                    }
                }
            }
        }
    }
    return entityIdCaptionMap;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._buildEntityIdCaptionMap = function(feeding) {
    var entityIdCaptionMap = {};

    if (feeding) {
        var mapIdToCaption = function(entity) {
            entityIdCaptionMap[entity.id] = entity.name;
            if (entity.type === "hierarchy" && entity.levels) {
                entity.levels.forEach(function(level) {
                    entityIdCaptionMap[level.id] = level.name;
                }.bind(this));
            }
        }.bind(this);

        feeding.cols.forEach(mapIdToCaption);
        feeding.rows.forEach(mapIdToCaption);
        feeding.values.forEach(mapIdToCaption);
    }

    return entityIdCaptionMap;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.buildMeasureIdCaptionMap = function(measureMetadata) {
    var measureIdCaptionMap = {};

    if (measureMetadata) {
        for (var measureId in measureMetadata) {
            if (measureMetadata.hasOwnProperty(measureId)) {
                measureIdCaptionMap[measureId] = measureMetadata[measureId].name;
            }
        }
    }

    return measureIdCaptionMap;
};

// Builds a map from measure names to their formatting string
sap.basetable.crosstab.CrosstabDataProvider.prototype._buildFormatMap = function() {
    var result = {};
    if (this._measureMembers && this._measureMembers.length > 0) {
        var modelFormatArray = this._jsonData.formatArr;
        var formatArray = sap.basetable.crosstab.utils.FormatUtils.createFormatArray(modelFormatArray);
        if (formatArray && formatArray.length > 0) {
            var formatIndex = 0;
            for (var measureIndex = 0; measureIndex < this._measureMembers.length; measureIndex++) {
                var measureMember = this._measureMembers[measureIndex];
                result[measureMember.id] = formatArray[formatIndex];
                formatIndex++;
            }
        }
    }
    return result;
};

// create view coordinates of the initial view page
sap.basetable.crosstab.CrosstabDataProvider.prototype._createInitialViewCoordinates = function() {
    var viewCoordinates = {};

    var rowAxisLength = this.getFullAxisLength(0);
    var columnAxisLength = this.getFullAxisLength(1);

    if (rowAxisLength > 0) {
        var rowPageIndex = this._jsonData.windowing ? this._jsonData.windowing.pages[0].rowPageIndex : 0;
        viewCoordinates.startRowIndex = rowPageIndex * this._pageSizeSpecification.rows;
        var effectiveRowPageSize = Math.min(this._pageSizeSpecification.rows, rowAxisLength);
        viewCoordinates.endRowIndex = viewCoordinates.startRowIndex + (effectiveRowPageSize - 1);
    }

    if (columnAxisLength > 0) {
        var columnPageIndex = this._jsonData.windowing ? this._jsonData.windowing.pages[0].columnPageIndex : 0;
        viewCoordinates.startColumnIndex = columnPageIndex * this._pageSizeSpecification.columns;
        var effectiveColumnPageSize = Math.min(this._pageSizeSpecification.columns, columnAxisLength);
        viewCoordinates.endColumnIndex = viewCoordinates.startColumnIndex + (effectiveColumnPageSize - 1);
    }

    return viewCoordinates;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.build = function() {
    // TODO should remove from here since it is already in PageManager
    var measureAxisType = null;
    var measureAxisPosition = null;

    var result = this._processAxisFeeding(this._feeding.cols);
    var columnDimensionIdArray = result.dimensionIdArray;
    if (result.measureAxisPosition !== null) {
        measureAxisType = "column";
        measureAxisPosition = result.measureAxisPosition;
    }
    result = this._processAxisFeeding(this._feeding.rows);
    var rowDimensionIdArray = result.dimensionIdArray;
    if (measureAxisType === null && result.measureAxisPosition !== null) {
        measureAxisType = "row";
        measureAxisPosition = result.measureAxisPosition;
    }

    var queryResponse = this._jsonData.queryResponse[0];

    var columnAxisName = this._findAxisName(queryResponse, columnDimensionIdArray);
    var rowAxisName = this._findAxisName(queryResponse, rowDimensionIdArray);
    var entityIdCaptionMap = this._buildEntityIdCaptionMap(this._jsonData.feeding);

    var initialViewCoordinates = this._createInitialViewCoordinates();

    // The initial page should already be cached, so this._setTupleTrees should be called synchronously to update this._tupleTrees
    this._scrollPageManager.fetchViewPage(initialViewCoordinates, this.setTupleTrees.bind(this));

    this._dimensions = this._buildAxesDimensions(queryResponse, entityIdCaptionMap, rowAxisName, columnAxisName, measureAxisType, measureAxisPosition);

    this._formatMap = this._buildFormatMap(measureAxisType);

    this._rowHeadersDirty = true;
    this._columnHeadersDirty = true;
    this._cellsDirty = true;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._rebuild = function () {
    this._rowHeadersDirty = true;
    this._columnHeadersDirty = true;
    this._cellsDirty = true;
    this._notifyDataChangeListeners();
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._notifyDataChangeListeners = function () {
    this._dataChangeListeners.forEach(function(listener) {
        listener.dataChanged(this);
    });
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.setTupleTrees = function (coordinates, tupleTrees) {
    this._tupleTree = tupleTrees;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.initializeAxesMetadata = function () {
    this._scrollPageManager.initializeAxesMetadata();
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.updateAxesMetadata = function (windowData, metadataUpdateHandler) {
    this._scrollPageManager.updateAxesMetadata(windowData, metadataUpdateHandler);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.addPage = function (page, windowIndex, windowData) {
    this._scrollPageManager.addPage(page, windowIndex, windowData);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.fetchViewPage = function (viewCoordinates, pageResultCallback) {
    this._scrollPageManager.fetchViewPage(viewCoordinates, pageResultCallback);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getFullAxisLength = function (axisIndex) {
    return this._scrollPageManager.getFullAxisLength(axisIndex);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getQueryResponse = function () {
    return this._jsonData.queryResponse[0];
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getQueryResponseUtils = function () {
    return this._queryResponseUtils;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getMeasureValues = function () {
    return this._feeding.values.filter(function (feedingItem) {
        return feedingItem.type === "measure";
    });
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getDataType = function (entityId) {
    if (this._entityIdDataTypeMap) {
        return this._entityIdDataTypeMap[entityId];
    }
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.isCalculation = function (entityId) {
    return this._calculationEntityIdSet.hasOwnProperty(entityId);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getSortingState = function () {
    return this._jsonData.sorting;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getRankingState = function () {
    return this._jsonData.ranking;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._isCalculatedMeasure = function (measureMember) {
    return measureMember && measureMember.analyticType === "calculation";
};

sap.basetable.crosstab.CrosstabDataProvider.prototype._isAggregatable = function (measureMember) {
    return measureMember && measureMember.isAggregatable;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getHierarchies = function () {
    return this._hierarchies;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getKeyLabelDimensions = function () {
    return this._keyLabelDimensions;
};

// Get the array of memberKeys that have been modified because they contain TUPLE_PATH_DELIMITER
// Use the modified memberKey as the key to retrieve the original member key in the array
sap.basetable.crosstab.CrosstabDataProvider.prototype.getModifiedMemberKeys = function () {
    return this._modifiedMemberKeys;
};

// Returns the measure metadata id if it exists. If the metadata id does not exist for the specified
// measure, the measure id is returned.
sap.basetable.crosstab.CrosstabDataProvider.prototype.getMeasureMetadataId = function (measureId) {
    if (this._jsonData.measureMetadata && this._jsonData.measureMetadata[measureId]) {
        return this._jsonData.measureMetadata[measureId].id;
    }
    return measureId;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getMeasureAxisType = function () {
    return this._measureAxisType;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.getMeasureAxisPosition = function () {
    return this._measureAxisPosition;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.setMeasureAxisType = function (measureAxisType) {
    this._measureAxisType = measureAxisType;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.setMeasureAxisPosition = function (measureAxisPosition) {
    this._measureAxisPosition = measureAxisPosition;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.initializePageManager = function () {
    this._scrollPageManager.initialize(this._jsonData);
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.containsGrandTotals = function () {
    return this._containsGrandTotals;
};

sap.basetable.crosstab.CrosstabDataProvider.prototype.initializePageManagerForAnchoredTotals = function () {
    this._scrollPageManager.initializePageManagerForAnchoredTotals();
};
/*global jQuery:false */
/*global sap:false */

jQuery.sap.declare("sap.basetable.crosstab.CrosstabElementResizedEventConstants");

sap.basetable.crosstab.CrosstabElementResizedEventConstants = function() {
    "use strict";
    var CONSTANTS = {};
    CONSTANTS.ELEMENT_RESIZED_EVENT_TRIGGER = "crosstableElementsResized";
    CONSTANTS.ELEMENT_RESIZED_EVENT = "elementResizedEvent";
    CONSTANTS.COLUMN_DIMENSION_WIDTH = "COLUMN_DIMENSION_WIDTH";
    CONSTANTS.ROW_DIMENSION_WIDTH = "ROW_DIMENSION_WIDTH";
    CONSTANTS.COLUMN_DIMENSION_HEIGHT = "COLUMN_DIMENSION_HEIGHT";
    CONSTANTS.ROW_DIMENSION_HEIGHT = "ROW_DIMENSION_HEIGHT";
    CONSTANTS.EMPTY_COLUMN_DIMENSION = "__:__";
    CONSTANTS.EMPTY_ROW_TUPLE = "__..__";
    CONSTANTS.DIMENSION_HEADER_ROW = "_._._._";

    //Resizing indexes
    CONSTANTS.COLUMN_AXIS_COLUMN_WIDTH = 0;
    CONSTANTS.ROW_AXIS_COLUMN_WIDTH = 1;
    CONSTANTS.ROW_AXIS_ROW_HEIGHT = 2;
    CONSTANTS.COLUMN_AXIS_ROW_HEIGHT = 3;

    return Object.freeze(CONSTANTS);
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/

"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabElementResizeHandler");

sap.basetable.crosstab.CrosstabElementResizeHandler = function (crosstab, model, renderer, elementResizedEventConstants) {
    this._resizedElements = [{}, {}, {}, {}];
    this._isCellJustResized = false;

    this._crosstab = crosstab;
    this._model = model;
    this._renderer = renderer;
    this._elementResizedEventConstants = elementResizedEventConstants;
    this._crosstabConstants = crosstab.getCrosstabConstants();
    this._inResizingState = false;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype = {
    // How many pixels to drag at least to trigger resizing
    _RESIZING_DRAG_TOLERANCE: 3,
    _DATA_CELL: "dataCell",
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype.isResizing = function() {
    return this._inResizingState;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype.addResizeListener = function() {
    var pane = this._crosstab.container().closest(this._crosstabConstants.UI5_CROSSTAB);
    pane.unbind("mousedown");
    pane.mousedown(this._startResize.bind(this));

    pane.unbind("mouseup");
    pane.mouseup(this._stopResize.bind(this));

    pane.unbind("mouseleave");
    pane.mouseleave(this._exitResizingArea.bind(this));

    // TouchEvent supported by Chrome and Safari
    if ("ontouchstart" in window && !sap.ui.Device.browser.internet_explorer) {
        this._setResizeListenerToTouch(pane);
    }

     // Pointer events that supported by IE in touch devices
    if (window.navigator.pointerEnabled && sap.ui.Device.browser.internet_explorer) {
        this._setResizeListenerToPointer(pane);
    }
};

// Returns the resized elements. index=0 for column-tuple-to-width map, index=1 for row-dimension-to-width map,
// index=2 for row-tuple-to-height map, and index=3 for column-dimension-to-height map
// index=2 or 3 can return undefined for historical reasons.
sap.basetable.crosstab.CrosstabElementResizeHandler.prototype.getResizedElements = function (index) {
    return index < this._resizedElements.length ? this._resizedElements[index] : undefined;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype.setResizedElements = function (resizedElements) {
    if (!resizedElements ||
            resizedElements.length < 2 ||
            typeof resizedElements[this._elementResizedEventConstants.COLUMN_AXIS_COLUMN_WIDTH] !== "object" ||
            typeof resizedElements[this._elementResizedEventConstants.ROW_AXIS_COLUMN_WIDTH] !== "object") {
        this._resizedElements = [{}, {}, {}, {}];
        return;
    }
    this._resizedElements = resizedElements;
};

// Resizing event handler calls this method, so the vizProperties is updated, and
// a redrawing is triggered.
sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._elementsResized = function(eventData) {
    if (!eventData || !eventData.type) {
        return;
    }

    switch (eventData.type) {
    case this._elementResizedEventConstants.ROW_DIMENSION_WIDTH:
        var rowDimensionId;
        if ("dimensionId" in eventData) {
            rowDimensionId = eventData.dimensionId;
        } else {
            var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
            rowDimensionId = rowDimensions[eventData.index].id;
        }
        this._resizedElements[this._elementResizedEventConstants.ROW_AXIS_COLUMN_WIDTH][rowDimensionId] = eventData.size;
        break;
    case this._elementResizedEventConstants.COLUMN_DIMENSION_HEIGHT:
        var colDimensionId;
        if ("dimensionId" in eventData) {
            colDimensionId = eventData.dimensionId;
        } else {
            var colDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);
            colDimensionId = colDimensions[eventData.index].id;
        }

        if (!this._resizedElements[this._elementResizedEventConstants.COLUMN_AXIS_ROW_HEIGHT]) {
            this._resizedElements[this._elementResizedEventConstants.COLUMN_AXIS_ROW_HEIGHT] = {};
        }
        this._resizedElements[this._elementResizedEventConstants.COLUMN_AXIS_ROW_HEIGHT][colDimensionId] = eventData.size;
        break;
    case this._elementResizedEventConstants.COLUMN_DIMENSION_WIDTH:
        var columnTuplePath = this._calculateTuplePathFromEventData(eventData);
        if (columnTuplePath) {
            this._resizedElements[this._elementResizedEventConstants.COLUMN_AXIS_COLUMN_WIDTH][columnTuplePath] = eventData.size;
        }
        break;
    case this._elementResizedEventConstants.ROW_DIMENSION_HEIGHT:
        var rowTuplePath = this._calculateTuplePathFromEventData(eventData);
        if (rowTuplePath) {
            if (!this._resizedElements[this._elementResizedEventConstants.ROW_AXIS_ROW_HEIGHT]) {
                this._resizedElements[this._elementResizedEventConstants.ROW_AXIS_ROW_HEIGHT] = {};
            }
            this._resizedElements[this._elementResizedEventConstants.ROW_AXIS_ROW_HEIGHT][rowTuplePath] = eventData.size;
        }
        break;
    default:
        throw new Error("Event type " + eventData.type + " not supported!");
    }

    this._isCellJustResized = true;
    // Update the vizProperties, and trigger a redraw
    var dispatch = this._crosstab.getDispatch();
    if (dispatch) {
        dispatch.crosstablePropertyChange({
            properties: {
                crosstab: {
                    resizedElements: this._resizedElements
                }
            },
            userInteraction: true,
            trigger: this._elementResizedEventConstants.ELEMENT_RESIZED_EVENT_TRIGGER
        });

        // Crosstab is not fully redrawn after resizing, but "initialized" should
        // be dispatched so tray model gets updated, and an undoable action is registered.
        dispatch.initialized();
    }
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._calculateTuplePathFromEventData = function (eventData) {
    var childIndex,
        tupleChildIndex,
        tupleTreeNode;
    var tuplePath = null;
    var isColumnResizing = this._resizingData.isColumnResizing;
    var axisIndex = isColumnResizing ? this._crosstabConstants.COLUMN_AXIS_INDEX : this._crosstabConstants.ROW_AXIS_INDEX;
    // tupleIndex contains a list of child indices on the tuple tree
    tupleTreeNode = this._model.getTupleTree(axisIndex).rootnode;

    if ("tupleIndex" in eventData) {
        // the element that resized may be a Anchored subtotal
        if (this._crosstab.isTotalsAnchored() && !isColumnResizing && tupleTreeNode.children && eventData.tupleIndex[0] >= tupleTreeNode.children.length) {
            childIndex = eventData.tupleIndex[0] - tupleTreeNode.children.length;
            tuplePath = this._generateTuplePathForGrandTotals(axisIndex, childIndex);
        } else {
            for (tupleChildIndex = 0; tupleChildIndex < eventData.tupleIndex.length; tupleChildIndex++) {
                childIndex = eventData.tupleIndex[tupleChildIndex];
                tupleTreeNode = tupleTreeNode.children[childIndex];
            }
            tuplePath = tupleTreeNode.tuplePath.toString();
        }
    } else if ("index" in eventData) {
        // index contains the column index on the current page
        var dimensionsLength = this._model.getDimensions(axisIndex).length;
        if (dimensionsLength === 0) {
            // resizing column without tuple path (no column dims)
            tuplePath = isColumnResizing ? this._elementResizedEventConstants.EMPTY_COLUMN_DIMENSION : this._elementResizedEventConstants.EMPTY_ROW_TUPLE;
        } else {
            var startIndex = isColumnResizing ? this._model.getStartColumnIndex() : this._model.getStartRowIndex();
            // the element that resized may be a Anchored subtotal
            if (this._crosstab.isTotalsAnchored() && !isColumnResizing && eventData.grandTotalsIndex > -1) {
                tuplePath = this._generateTuplePathForGrandTotals(axisIndex, eventData.grandTotalsIndex);
            } else {
                if (this._model.isGrandTotalsCurrentlyAnchored() && !isColumnResizing && eventData.index >= tupleTreeNode.children.length) {
                    // BITVDC25-2384: This is to fix resizing a height of a grandtotal datacell when grandtotal is anchored but there is no vertical scrollbar,
                    // which means the crosstab is small enough to fit into its container.
                    childIndex = eventData.index - tupleTreeNode.children.length;
                    tuplePath = this._generateTuplePathForGrandTotals(axisIndex, childIndex);
                } else {
                    tuplePath = this._model.getTupleFromIndex(axisIndex, eventData.index - startIndex);
                }
            }

        }
    }
    return tuplePath;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._generateTuplePathForGrandTotals = function (axisIndex, grandTotalIndex) {
    var grandTotals = this._model.getGrandTotalNodes(axisIndex);
    var tupleTreeNode = grandTotals[grandTotalIndex];
    // Since the children of grand totalas are empty and almost fake, there is no reason to creat a loop for that, it can be just caclulated
    var tuplePathCorrection = new Array(this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX).length).join("|");
    return tupleTreeNode.tuplePath + tuplePathCorrection;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype.isCellJustResized = function () {
    return this._isCellJustResized;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype.setCellJustResized = function (value) {
    this._isCellJustResized = value;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._setResizeListenerToTouch = function(pane) {
    pane.unbind("touchstart touchmove touchend contextmenu");
    pane.bind("touchstart touchmove touchend contextmenu", this._handleResizeTouch.bind(this));
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._setResizeListenerToPointer = function(pane) {
    pane.unbind("pointerdown pointerup pointermove contextmenu");
    pane.bind("pointerdown pointerup pointermove contextmenu" , this._handleResizeTouch.bind(this));
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._handleResizeTouch = function(event) {
    var target = event.target;
    var eventType;
        switch (event.type) {
            case "contextmenu":
                return;
            case "touchstart":
            case "pointerdown":
                eventType = "mousedown";
                break;
            case "touchmove":
            case "pointermove":
                if (this._inResizingState) {
                    eventType = "mousemove";
                    break;
                }
                return;
            case "touchend":
            case "pointerup":
                eventType = "mouseup";
                break;
            default:
                return;
            }

    // We are dispatching an equivalent mouse event.
    var simulatedEvent = document.createEvent("MouseEvent");
    // Pointer events have different properties in the event object than touch events
    if (sap.ui.Device.browser.internet_explorer) {
        simulatedEvent.initMouseEvent(eventType, true, true, window, 1, event.originalEvent.screenX, event.originalEvent.screenY, event.originalEvent.clientX, event.originalEvent.clientY, false, false, false, false, event.originalEvent.button, null);
    } else {
        var firstTouch = event.changedTouches[0];
        simulatedEvent.initMouseEvent(eventType, true, true, window, 1, firstTouch.screenX, firstTouch.screenY, firstTouch.clientX, firstTouch.clientY, false, false, false, false, this._crosstabConstants.MOUSE_BUTTON.left, null);
        target = firstTouch.target;
    }
    target.dispatchEvent(simulatedEvent);
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._startResize = function(event) {
    var target = $(event.target);
    if (!target.hasClass(this._crosstabConstants.RESIZABLE)) {
        return;
    }
    if (event.originalEvent.button !== this._crosstabConstants.MOUSE_BUTTON.left) {
        // While we are holding down on the right mouse button, the blue bar must be visible whereas holding down on the left mouse button must hide it.
        target.addClass(this._crosstabConstants.KEEP_VISIBLE);
        return;
    }

    this._inResizingState = true;
    var targetCell = target.parent();
    var targetDiv = targetCell.parent();
    var startingPointOfResize;
    var isColumnResizing;
    var isLeftAreaDimensionHeaderRow = false;
    if (target.hasClass(this._crosstabConstants.RESIZABLE_COL)) {
        isColumnResizing = true;
        startingPointOfResize = event.clientX;
    } else {
        if (targetCell.closest("#" + this._crosstabConstants.LEFT_DIM_HEADER_CELL_ROW).length) {
            isLeftAreaDimensionHeaderRow = true;
        } else if (targetCell.closest("#" + this._crosstabConstants.RIGHT_DIM_HEADER_CELL_ROW).length) {
            targetCell = targetCell.parent();
        }
        isColumnResizing = false;
        startingPointOfResize = event.clientY;
    }
    var isRowTuple = targetDiv.hasClass(this._crosstabConstants.DIMENSION_HEADER_CELL);
    var isColumnTuple = targetDiv.hasClass(this._crosstabConstants.COLUMN_HEADER_CELL);
    if ((isRowTuple && !isColumnResizing || isColumnTuple && isColumnResizing) &&
            !targetDiv.hasClass(this._crosstabConstants.LEAF_CHILD_CELL)) {
        // If target is a non-leaf dimension member, change target cell to corresponding last leaf member as the leaves define the correct tuple for resizing
        targetCell = targetDiv.find("." + this._crosstabConstants.LEAF_CHILD_CELL + ":last").children();
    }
    var name = targetCell.attr("id");
    var axisIdParts = name.split("_");

    this._resizingData = {
        originalStartPoint: startingPointOfResize,
        target: targetCell,
        axisIdParts: axisIdParts,
        isColumnResizing : isColumnResizing,
        isLeftAreaDimensionHeaderRow : isLeftAreaDimensionHeaderRow
    };

    if (this._crosstab.isTotalsAnchored() && !isColumnResizing) {
        // When resizing from dataCell it should be checked if it belogs to anchored subtotals
        var targetParent = targetDiv.parent();
        if(targetParent.hasClass(this._crosstabConstants.GRAND_TOTALS)) {
            var grandTotalsDivArr = targetParent.children();
            var index = -1;
            for (var i = 0; i < grandTotalsDivArr.length && index === -1; i++) {
                if (grandTotalsDivArr[i] === targetDiv[0]) {
                    index = i;
                }
            }
            this._resizingData.grandTotalsIndex = index;
        }
    }

    this._createVisualLineForResize(startingPointOfResize, targetCell);
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._handleResize = function(offset, event) {
    // create animation during the movement of the line
    // only visual part of that
    event.preventDefault();
    event.stopPropagation();
    var movingElement;
    if (this._resizingData.isColumnResizing) {
        movingElement = $("#" + this._crosstabConstants.RESIZABLE_COL_LINE);
        movingElement.css("left", (event.pageX - offset) / this._crosstab.getScaleFactor());
        document.body.style.cursor = "col-resize";
    } else {
        movingElement = $("#" + this._crosstabConstants.RESIZABLE_ROW_LINE);
        movingElement.css("top", (event.pageY - offset) / this._crosstab.getScaleFactor());
        document.body.style.cursor = "row-resize";
    }
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._stopResize = function(event) {
    var crosstabContainer = this._crosstab.container();
    crosstabContainer.find("." + this._crosstabConstants.RESIZABLE + "." + this._crosstabConstants.KEEP_VISIBLE).removeClass(this._crosstabConstants.KEEP_VISIBLE);

    if (!this._isResizingLegal(event)) {
        return;
    }

    this._removeVisualLineForResize();

    if (!this._resizingData) {
        return;
    }

    var isColumnResizing = this._resizingData.isColumnResizing;
    var endPointOfResize = isColumnResizing ? event.clientX : event.clientY;
    var diffBetweenSizes = this._resizingData.originalStartPoint && endPointOfResize ?
                                endPointOfResize - this._resizingData.originalStartPoint : 0;
    var originalSize;
    if (this._resizingData.isLeftAreaDimensionHeaderRow) { // only for row-resizing
        // resizing the left area header changes the right area leaf dimension (or header row if not available) instead
        if (this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX).length === 0) {
            originalSize = crosstabContainer.find("#" + this._crosstabConstants.COL_DIM_HEADER_CELL_ROW).height() ||
                            crosstabContainer.find("#" + this._crosstabConstants.LEFT_DIM_HEADER_CELL_ROW).height();
        } else {
            originalSize = crosstabContainer.find("." + this._crosstabConstants.COLUMN_HEADER_CELL + "." + this._crosstabConstants.LEAF_CHILD_CELL + ":first").height();
        }
    } else {
        originalSize = isColumnResizing ? this._resizingData.target.width() : this._resizingData.target.height();
    }
    var cellNewSize = originalSize + diffBetweenSizes;

    if (Math.abs(diffBetweenSizes) >= this._RESIZING_DRAG_TOLERANCE &&
            crosstabContainer &&
            crosstabContainer.has(this._resizingData.target).length){
        var minimumSize = isColumnResizing ? this._renderer.MINIMUM_RESIZED_CELL_WIDTH : this._renderer.MINIMUM_RESIZED_CELL_HEIGHT;
        cellNewSize = Math.floor(Math.max(minimumSize, cellNewSize));
        var resizingEventData = this._createResizingEventData(this._resizingData.axisIdParts, cellNewSize);

        if (this._resizingData.grandTotalsIndex > -1) {
            resizingEventData.grandTotalsIndex = this._resizingData.grandTotalsIndex;
        }

        this._elementsResized(resizingEventData);
    }

    this._resizingData = null;
    if (sap.ui.Device.browser.internet_explorer){
        //IE11 have a problem with CSS :hover selector when you rendering a new elemnt and placing the mouse in the new area where the element are rendered.
        // it will stay with hover status until the mouse will hover again through that element
        // That code can be removed once IE will fix the bug
        // Related bug in JIRA : https://sapjira.wdf.sap.corp/browse/BITVDC25-1369
        var colResizableElements = crosstabContainer.find("." + this._crosstabConstants.RESIZABLE_COL);
        var rowResizableElements = crosstabContainer.find("." + this._crosstabConstants.RESIZABLE_ROW);
        colResizableElements.removeClass(this._crosstabConstants.RESIZABLE_COL);
        rowResizableElements.removeClass(this._crosstabConstants.RESIZABLE_ROW);
        setTimeout(function(){
            colResizableElements.addClass(this._crosstabConstants.RESIZABLE_COL);
            rowResizableElements.addClass(this._crosstabConstants.RESIZABLE_ROW);
        }.bind(this), 100);
    }

    this._inResizingState = false;
};


sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._exitResizingArea = function (event) {
    if (!this._isResizingLegal(event)) {
        return;
    }
    this._removeVisualLineForResize();
    this._inResizingState = false;
};

/**
* This function is responsible for checking if resizing flow was correct
* before any changes for crosstab is calculated.
* @return true: if resizing flow was legitimate
*/
sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._isResizingLegal = function (event) {
    if (!this._inResizingState) {
        return false;
    }

    if (event.originalEvent.button !== this._crosstabConstants.MOUSE_BUTTON.left) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    return true;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._createVisualLineForResize = function (coordinate, cell) {
    var isColumnResizing = this._resizingData.isColumnResizing;
    var parentCrosstab = cell.closest(this._crosstabConstants.UI5_CROSSTAB);
    var id = isColumnResizing ? this._crosstabConstants.RESIZABLE_COL_LINE : this._crosstabConstants.RESIZABLE_ROW_LINE;
    var lineParams = this._setParametersForVisualLine(cell, parentCrosstab, coordinate);
    var oDiv = $(document.createElement("div"));
    $("." + this._crosstabConstants.RESIZABLE_LINE).remove();
    oDiv.attr("id", id);
    oDiv.attr("class", this._crosstabConstants.RESIZABLE_LINE);
    var offset;
    if (isColumnResizing) {
        oDiv.css({height : lineParams.height + "px",
                        "line-height" : lineParams.height + "px",
                        left: lineParams.left +"px",
                        top: lineParams.top +"px"
        });
        offset = lineParams.offsetLeft;
    } else {
        oDiv.css({width : lineParams.width + "px",
                        left: lineParams.left +"px",
                        top: lineParams.top +"px"
        });
        offset = lineParams.offsetTop;
    }
    parentCrosstab.append(oDiv);
    parentCrosstab.mousemove(this._handleResize.bind(this, offset));
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._removeVisualLineForResize = function () {
    var movingElement = $("." + this._crosstabConstants.RESIZABLE_LINE);
    if (movingElement.length){
        movingElement.remove();
        var uiCrosstabID = this._crosstabConstants.UI5_CROSSTAB_ID_TEMPLATE.replace("{ID}", this._crosstab.getId());
        $(uiCrosstabID).unbind("mousemove");
    }
    document.body.style.cursor = "default";
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._setParametersForVisualLine = function(cell, crosstab, offset){
    var isColumnResizing = this._resizingData.isColumnResizing;
    var crosstabLayout = crosstab.find("#crosstabLayout");
    var scaleFactor = this._crosstab.getScaleFactor();
    if (isColumnResizing) {
        var colDimRow;
        var crosstabScrollContainer = crosstab.find("#crosstabScrollContainer");
        var containerHeight = Math.max(crosstabLayout.height(), crosstabScrollContainer.height());
        var borderHeight = parseInt(crosstabLayout.css("border-top-width"), 10);
        var height = containerHeight + borderHeight;
        var top = borderHeight;
        var offsetLeft = crosstab.offset().left;
        if (cell.closest("#" + this._crosstabConstants.ROW_AXIS_CONTENT_CONTAINER).length ||
                cell.closest("#" + this._crosstabConstants.COLUMNHEADER_CONTAINER).length){
            colDimRow = crosstab.find("#colDimRow");
            //colDimRow only exists when if there is at least one item on COLUMNS axis
            if (colDimRow.length){
                top = (colDimRow.offset().top - crosstab.offset().top) / scaleFactor;
            }
        }
        height = height - top;
        return {
            top: top,
            height: height,
            offsetLeft: offsetLeft,
            left: (offset - offsetLeft) / scaleFactor
        };
    } else {
        var width = crosstabLayout.width();
        var offsetTop = crosstab.offset().top;
        var leftBorderWidth = parseInt(crosstabLayout.css("border-left-width"), 10);
        return {
            left: leftBorderWidth, // the line should start after the border line of crosstab
            width: width,
            offsetTop: offsetTop,
            top: (offset - offsetTop) / scaleFactor
        };
    }
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._createResizingEventData = function(axisIdParts, size) {
    var idPrefix;
    var isColumnResizing = this._resizingData.isColumnResizing;

    if (!axisIdParts.length){
        return;
    }

    idPrefix = this._getIdPrefix(axisIdParts[0]);

    switch(idPrefix){
    case this._crosstabConstants.ROW_AXIS_HEADER_CELL:
        if (isColumnResizing) {
            return {
                type: this._elementResizedEventConstants.ROW_DIMENSION_WIDTH,
                index: axisIdParts.length - 2,
                size: size
            };
        }
        return {
            type: this._elementResizedEventConstants.ROW_DIMENSION_HEIGHT,
            tupleIndex: axisIdParts.slice(1, axisIdParts.length),
            size: size
        };
    case this._crosstabConstants.COLUMN_MEMBER_HEADER_CELL:
        if (isColumnResizing) {
            return {
                type: this._elementResizedEventConstants.COLUMN_DIMENSION_WIDTH,
                tupleIndex: axisIdParts.slice(1, axisIdParts.length),
                size: size
            };
        }
        return {
            type: this._elementResizedEventConstants.COLUMN_DIMENSION_HEIGHT,
            index: axisIdParts.length - 2,
            size: size
        };
    case this._DATA_CELL:
        if (isColumnResizing) {
            return {
                type: this._elementResizedEventConstants.COLUMN_DIMENSION_WIDTH,
                index: parseInt(axisIdParts[axisIdParts.length - 1]),
                size: size
            };
        }
        return {
            type: this._elementResizedEventConstants.ROW_DIMENSION_HEIGHT,
            index: parseInt(axisIdParts[axisIdParts.length - 2]),
            size: size
        };
    default:
    // Default case refers to any resizing done on dimension header names. We expect idPrefix to be either "EM" for dimension or "MeasureNamesDimension"
        if (isColumnResizing) {
            return {
                type:this._elementResizedEventConstants.ROW_DIMENSION_WIDTH,
                dimensionId: idPrefix + this._createDimensionPathId(axisIdParts),
                size: size
            };
        }
        var dimensionPath = {
                type: this._elementResizedEventConstants.COLUMN_DIMENSION_HEIGHT,
                size: size
            };
        // For row-resizing left area dimension row, we instead resize the column axis leaf dimension. If it does not exist, we resize the right area header row
        if (!this._resizingData.isLeftAreaDimensionHeaderRow || this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX).length === 0) {
            dimensionPath.dimensionId = this._elementResizedEventConstants.DIMENSION_HEADER_ROW;
        } else {
            dimensionPath.index = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX).length - 1;
        }
        return dimensionPath;
    }
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._createDimensionPathId = function(data){
    var sId ="";
    for (var i = 1; i < data.length; i++) {
        sId = sId +"_" + data[i];
    }
    return sId;
};

sap.basetable.crosstab.CrosstabElementResizeHandler.prototype._getIdPrefix = function(data){
    var tempData = data.replace("#", "");

    if ((tempData.indexOf("ui5crosstab") !== -1) || (tempData.indexOf("Crosstab") !== -1)) {
        tempData = tempData.split("-");
        return tempData[1];
    }

    return tempData;
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabDataModel");

sap.basetable.crosstab.CrosstabModel = function (crosstabContext, crosstab, crosstabScrollBarEventMediator, crosstabScrollBarEventConstants) {
    this._crosstab = crosstab;
    this._crosstabScrollBarEventMediator = crosstabScrollBarEventMediator;
    this._crosstabConstants = crosstab.getCrosstabConstants();
    this._crosstabScrollBarEventConstants = crosstabScrollBarEventConstants;
    this._rowAxisLength = null;
    this._columnAxisLength = null;
    this._currentVerticalPosition = 0;
    this._currentHorizontalPosition = 0;
    this._recentPageData = {
        redrawRowAxisHeader : null,
        redrawRowAxisContent : null,
        redrawColumnHeader : null,
        coordinates : {
            startRowIndex : 0,
            startColumnIndex : 0,
            endRowIndex : 0,
            endColumnIndex : 0
        }
    };
    this._cellGroup = [];
    this._dimensionHeaderTemplates = [];
    this._tupleTrees = [];
    this._tupleMap = [];
    this._tuplePathFrequency = [];
    this._tupleIndexes = [];
    this._measureMap = [];
    this._measuresPosition = {"axis" : null, "level" : null};
    this._cachedGrandTotalNodes = [];
    if (crosstabContext.dataProvider) {
        this._dataProvider = crosstabContext.dataProvider;
        this._tupleTrees[this._crosstabConstants.ROW_AXIS_INDEX] = this._dataProvider.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX);
        this._tupleTrees[this._crosstabConstants.COLUMN_AXIS_INDEX] = this._dataProvider.getTupleTree(this._crosstabConstants.COLUMN_AXIS_INDEX);
        this._buildTupleMap();
        this._currentCoordinates = [ {"rowAxisIndex": 0, "columnAxisIndex": 0}, {"rowAxisIndex": this.getPageRowSize(), "columnAxisIndex": this.getPageColumnSize()} ];
    }
};

sap.basetable.crosstab.CrosstabModel.prototype = {
    // The page render ratios define the proportion of the page size that renders before and after the current axis index
    _PAGE_FLOOR_RENDER_RATIO: 1/3,
    _PAGE_CEILING_RENDER_RATIO: 2/3,
};

sap.basetable.crosstab.CrosstabModel.prototype._constructConditionalCellFormatter = function() {

    var rowTupleTreeRoot = this.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX).rootnode;
    var columnTupleTreeRoot = this.getTupleTree(this._crosstabConstants.COLUMN_AXIS_INDEX).rootnode;

    var tupleTreeUtils = sap.basetable.crosstab.TupleTreeUtil;
    var rowLeafTuplePaths = tupleTreeUtils.getLeafTuplePaths(rowTupleTreeRoot);
    var columnLeafTuplePaths = tupleTreeUtils.getLeafTuplePaths(columnTupleTreeRoot);

    var dimensionIdMapper = function(dimension){return dimension.id;};

    var rowDimensionIds = this.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX).map(dimensionIdMapper);
    var columnDimensionIds = this.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX).map(dimensionIdMapper);

    return new sap.basetable.crosstab.ConditionalCellFormatter(rowDimensionIds, rowLeafTuplePaths, columnDimensionIds, columnLeafTuplePaths, this._crosstabConstants, this);
};



sap.basetable.crosstab.CrosstabModel.prototype._initializeRecentPageData = function() {
    this._recentPageData.coordinates.endRowIndex = this.getPageRowSize() - 1;
    this._recentPageData.coordinates.endColumnIndex = this.getPageColumnSize() - 1;
};

sap.basetable.crosstab.CrosstabModel.prototype.getDimensions = function (axis) {
    return this._dataProvider.getDimensions()[axis].dimensions;
};

sap.basetable.crosstab.CrosstabModel.prototype.getTupleTree = function (axis) {
    return this._tupleTrees[axis];
};

sap.basetable.crosstab.CrosstabModel.prototype.getDataType = function (entityId) {
    return this._dataProvider.getDataType(entityId);
};

sap.basetable.crosstab.CrosstabModel.prototype.isNumericDataType = function (entityId) {

    if (typeof entityId !== "string") {
        return false;
    }

    var dataType = this.getDataType(entityId);
    return dataType === this._crosstabConstants.DATATYPE_INTEGER ||
        dataType === this._crosstabConstants.DATATYPE_BIGINTEGER ||
        dataType === this._crosstabConstants.DATATYPE_NUMBER;
};

sap.basetable.crosstab.CrosstabModel.prototype.isCalculation = function (entityId) {
    return this._dataProvider.isCalculation(entityId);
};

// parse tuplePath string to count number of valid delimiters
sap.basetable.crosstab.CrosstabModel.prototype.getTupleDepth = function (tuplePath) {
    var memberKeys = sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(tuplePath);
    var tupleDepth = memberKeys.length;
    // The memberKeys will not return one last empty key if there are subtotals on non-innermost dimensions.
    if (!tuplePath.length || tuplePath[tuplePath.length - 1] === this._crosstabConstants.TUPLE_PATH_DELIMITER) {
        tupleDepth++;
    }
    return tupleDepth;
};

sap.basetable.crosstab.CrosstabModel.prototype.getDataCells = function (tuplePaths, expression, selectionType) {
    return this._dataProvider.getDataCells(tuplePaths, expression, selectionType);
};

sap.basetable.crosstab.CrosstabModel.prototype.getCellGroups = function () {
    return this._cellGroup;
};

sap.basetable.crosstab.CrosstabModel.prototype.getMeasuresPosition = function () {
    if(!$.isEmptyObject(this._measuresPosition)){
        var rowDimensions = this.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
        var columnDimensions = this.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);

        for(var i = 0; i < columnDimensions.length; i++){
            if (columnDimensions[i].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION){
                this._measuresPosition.axis = this._crosstabConstants.COLUMN;
                this._measuresPosition.level = i;
                break;
            }
        }
        if(this._measuresPosition.axis !== this._crosstabConstants.COLUMN){
            for(var j = 0; j < rowDimensions.length; j++){
                if (rowDimensions[j].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION){
                    this._measuresPosition.axis = this._crosstabConstants.ROW;
                    this._measuresPosition.level = j;
                    break;
                }
            }
        }
    }
    return this._measuresPosition;
};

sap.basetable.crosstab.CrosstabModel.prototype.getMeasuresValues = function () {
    return this._dataProvider.getMeasureValues();
};

sap.basetable.crosstab.CrosstabModel.prototype.select = function (tuplePaths, groupType, cellType) {
    var index = this._cellGroup.length;
    var cellGroup = new sap.basetable.crosstab.CellGroup(this, index, tuplePaths, groupType, cellType);
    this._cellGroup.push(cellGroup);
    return cellGroup;
};

sap.basetable.crosstab.CrosstabModel.prototype.setDataProvider = function (dataProvider) {
    this._dataProvider = dataProvider;
    this._initializeRecentPageData();
    this._rebuild();
};

sap.basetable.crosstab.CrosstabModel.prototype.getMeasureMembers = function() {
    return this._dataProvider.getMeasureMembers();
};

sap.basetable.crosstab.CrosstabModel.prototype.createDimensionHeaderTemplate = function (dimensionTemplateDef) {
    var index = this._dimensionHeaderTemplates.length;
    dimensionTemplateDef.id = index;
    var dimensionHeaderTemplate = new sap.basetable.crosstab.DimensionHeaderTemplate(dimensionTemplateDef);
    this._dimensionHeaderTemplates.push(dimensionHeaderTemplate);
};

sap.basetable.crosstab.CrosstabModel.prototype.getDimensionHeaderTemplate = function (dimensionId) {
    this._dimensionHeaderTemplates.forEach(function(dimensionHeaderTemplate) {
        if (dimensionId === dimensionHeaderTemplate.dimensionId || dimensionId === "") {
            return dimensionHeaderTemplate.cellTemplate;
        }
    });
    return null;
};

sap.basetable.crosstab.CrosstabModel.prototype.getTupleIndex = function (axis, tuplePath) {
    return this._tupleMap[axis][tuplePath];
};

// Returns the frequency of leaf node tuple paths
sap.basetable.crosstab.CrosstabModel.prototype.getTuplePathFrequency = function (axis, tuplePath) {
    return this._tuplePathFrequency[axis][tuplePath];
};

// Returns the leaf node tuple path at relative "index" on the given axis within the current page
sap.basetable.crosstab.CrosstabModel.prototype.getTupleFromIndex = function (axis, index) {
    return this._tupleIndexes[axis][index];
};

sap.basetable.crosstab.CrosstabModel.prototype.getTupleMap = function (axis) {
    return this._tupleMap[axis];
};

sap.basetable.crosstab.CrosstabModel.prototype.getNumberOfTuples = function (axis) {
    return this._tupleTrees[axis].rootnode.numOfLeafChildren;
};

sap.basetable.crosstab.CrosstabModel.prototype.getMeasureMap = function () {
    return this._measureMap;
};

sap.basetable.crosstab.CrosstabModel.prototype._addTuplePath = function (axis, node, iTupleIndex, runningDimensionIndexes) {
    for (var i = 0; i < node.children.length; i++) {
        var childNode = node.children[i];
        var tuplePath = childNode.tuplePath;
        var numOfLeafChildren = childNode.numOfLeafChildren ? childNode.numOfLeafChildren : 1;
        this._tupleMap[axis][tuplePath] = [iTupleIndex, iTupleIndex + numOfLeafChildren];
        if (childNode.isMeasure) {
            for (var j = iTupleIndex; j < iTupleIndex + numOfLeafChildren; j++) {
                this._measureMap[j] = childNode.member.id;
            }
        }
        var dimensionIndexes = "";
        if (runningDimensionIndexes.length > 0) {
            dimensionIndexes += runningDimensionIndexes + "_";
        }
        dimensionIndexes += i;
        this._tupleMap[axis][tuplePath].dimensionIndexes = dimensionIndexes;
        if (childNode.children.length > 0) {
            iTupleIndex = this._addTuplePath(axis, childNode, iTupleIndex, dimensionIndexes);
        } else {
            this._tuplePathFrequency[axis][tuplePath] = (this._tuplePathFrequency[axis][tuplePath] || 0) + 1;
            this._tupleIndexes[axis][iTupleIndex] = tuplePath;
            iTupleIndex++;
        }
    }
    return iTupleIndex;
};

sap.basetable.crosstab.CrosstabModel.prototype._buildTupleMap = function () {
    this._measureMap = [];
    this._tupleTrees.forEach(function(tupleTree, index) {
        var iTupleIndex = 0;
        var rootNode = tupleTree.rootnode;
        var totalTuple = rootNode.numOfLeafChildren ? rootNode.numOfLeafChildren : 1;
        this._tupleMap[index] = {};
        this._tupleMap[index][this._crosstabConstants.ROOT_TUPLE_PATH] = [0, totalTuple];
        this._tuplePathFrequency[index] = {};
        this._tupleIndexes[index] = [];
        this._addTuplePath(index, rootNode, iTupleIndex, "");
    }.bind(this));
};

sap.basetable.crosstab.CrosstabModel.prototype._rebuild = function () {
    this._tupleTrees[0] = this._dataProvider.getTupleTree(0);
    this._tupleTrees[1] = this._dataProvider.getTupleTree(1);
    this._tupleMap = [];
    this._tuplePathFrequency = [];
    this._tupleIndexes = [];
    this._buildTupleMap();
    this._numberFormat_Map = this._dataProvider.getFormatMap();
    this._conditionalCellFormatter = this._constructConditionalCellFormatter();
};

sap.basetable.crosstab.CrosstabModel.prototype.rebuildTupleTree = function () {
    this._dataProvider.build();
    this.fetchPage(this._recentPageData);
};

sap.basetable.crosstab.CrosstabModel.prototype.fetchPage = function(pageData){
    var horizontalPosition = this._currentHorizontalPosition;
    var verticalPosition = this._currentVerticalPosition;
    this.updateRowAxisLength();
    this.updateColumnAxisLength();

    var rowCoordinates = this._calculatePageAxisCoordinates(this._rowAxisLength, verticalPosition, this._dataProvider.getPageRowSize());
    pageData.coordinates.startRowIndex = rowCoordinates.startAxisIndex;
    pageData.coordinates.endRowIndex = rowCoordinates.endAxisIndex;

    var columnCoordinates = this._calculatePageAxisCoordinates(this._columnAxisLength, horizontalPosition, this._dataProvider.getPageColumnSize());
    pageData.coordinates.startColumnIndex = columnCoordinates.startAxisIndex;
    pageData.coordinates.endColumnIndex = columnCoordinates.endAxisIndex;

    if(pageData.coordinates.endColumnIndex === -1){
        pageData.coordinates.endColumnIndex = 0;
    }
    if(pageData.coordinates.endRowIndex === -1){
        pageData.coordinates.endRowIndex = 0;
    }

    this._fetchPageDirectly(pageData);
};

sap.basetable.crosstab.CrosstabModel.prototype._calculatePageAxisCoordinates = function(axisLength, axisPosition, renderSize) {
    var startAxisIndex;
    var endAxisIndex;

    // Since axis length is less than render size, start and end axis index are static
    if(axisLength <= renderSize) {
        startAxisIndex = 0;
        endAxisIndex = axisLength -1;
    } else {
        var fullAxisIndex = axisLength - 1;
        endAxisIndex = this._calculateEndAxisIndex(axisPosition, renderSize);
        startAxisIndex = this._calculateStartAxisIndex(axisPosition, renderSize);
        // If end axis index is greater than full axis index, make sure we fetch exactly render size worth of data
        if(endAxisIndex > fullAxisIndex){
            endAxisIndex = fullAxisIndex;
            startAxisIndex = axisLength - renderSize;
        } else if(startAxisIndex <= 0) { // If start axis index is less than 0, make sure we fetch exactly render size of data
            startAxisIndex = 0;
            endAxisIndex = (renderSize - 1);
        } else { // Distance between start and end axis index is render size
            endAxisIndex -= 1;
        }
    }
    return {
        startAxisIndex : startAxisIndex,
        endAxisIndex : endAxisIndex
    };
};

sap.basetable.crosstab.CrosstabModel.prototype._calculateStartAxisIndex = function(axisPosition, renderSize) {
    var startAxisIndex =  axisPosition - (renderSize * this._PAGE_FLOOR_RENDER_RATIO);
    return Math.floor(startAxisIndex);
};


sap.basetable.crosstab.CrosstabModel.prototype._calculateEndAxisIndex = function(axisPosition, renderSize) {
    var endAxisIndex = axisPosition + (renderSize * this._PAGE_CEILING_RENDER_RATIO);
    return Math.floor(endAxisIndex);
};

sap.basetable.crosstab.CrosstabModel.prototype._fetchPageDirectly = function(pageData) {
    this._recentPageData = pageData;
    this.fetchTupleTrees(pageData.coordinates, this._setTupleTrees.bind(this));
};

sap.basetable.crosstab.CrosstabModel.prototype.fetchTupleTrees = function(coordinates, callback) {
    this._dataProvider.fetchViewPage(coordinates, callback);
};

sap.basetable.crosstab.CrosstabModel.prototype.getRecentPageData = function() {
    return this._recentPageData;
};

/*
    This function could return true, false or undefined.
    this._isGrandTotalsCurrentlyAnchored is only set to true or false when this.initializePageManager() is executed.
    This is to check if initializePageManager is ever executed or not.
*/
sap.basetable.crosstab.CrosstabModel.prototype.isGrandTotalsCurrentlyAnchored = function() {
    return this._isGrandTotalsCurrentlyAnchored;
};

sap.basetable.crosstab.CrosstabModel.prototype.setIsGrandTotalsCurrentlyAnchored = function(isGrandTotalsCurrentlyAnchored) {
    this._isGrandTotalsCurrentlyAnchored = isGrandTotalsCurrentlyAnchored;
};

sap.basetable.crosstab.CrosstabModel.prototype._setTupleTrees = function (coordinates, tupleTrees) {
    if(this._recentPageData.coordinates === coordinates){
        this._dataProvider.setTupleTrees(coordinates,tupleTrees);
        this._rebuild();

        // If both scroll bars are custom scrollable than redraw()
        // If any scroll bars are default must drawSection()
        if(this._crosstab.isHorizontallyScrollable() && this._crosstab.isVerticallyScrollable()) {
            this._crosstab.redraw(this._crosstabScrollBarEventConstants.newPageEvent, this._recentPageData);
        } else {
            var sectionData = this.getSectionData(coordinates);
            this._crosstab.drawSection(sectionData, false);
        }
    }
};

sap.basetable.crosstab.CrosstabModel.prototype.getSectionData = function(coordinates) {
    var showColumnAxisHeaders = coordinates.endRowIndex <= (this.getPageRowSize() - 1);
    var showRowAxisHeaders;
    if(this._crosstab.isHorizontallyScrollable()){
        showRowAxisHeaders = true;
    } else {
        showRowAxisHeaders = coordinates.endColumnIndex <= (this.getPageColumnSize() - 1);
    }

    var topBuffer = 0;
    var leftBuffer = 0;

    if (coordinates.startRowIndex > 0) {
        topBuffer = (coordinates.startRowIndex) * this._crosstab.getRowCellHeight();
    }

    // TODO: take into account column resizing
    // if crosstab is using external horizontal scroll bar than add buffer
    if(!this._crosstab.isHorizontallyScrollable() && (coordinates.startColumnIndex > 0)) {
        leftBuffer = (coordinates.startColumnIndex) * this._crosstab.getColumnCellWidth();
    }

    var rowDimensions = this.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    var columnDimensions = this.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);

    var sectionData = {
        redrawRowAxisHeader : rowDimensions.length !== 0,
        redrawRowAxisContent : true,
        redrawColumnHeader : columnDimensions.length !== 0,
        coordinates : coordinates,
        showRowAxisHeaders: showRowAxisHeaders,
        showColumnAxisHeaders: showColumnAxisHeaders,
        topBuffer: topBuffer,
        leftBuffer: leftBuffer
    };

   return sectionData;
};

sap.basetable.crosstab.CrosstabModel.prototype.setFullAxisLength = function (axisIndex, length) {
    var eventData = {
        "axisIndex" : axisIndex,
        "length" : length
    };
    this._crosstabScrollBarEventMediator.publish(this._crosstabScrollBarEventConstants.updateAxisLength, eventData);
};

sap.basetable.crosstab.CrosstabModel.prototype.updateRowAxisLength = function () {
    this._rowAxisLength = this.getFullAxisLength(this._crosstabConstants.ROW_AXIS_INDEX);
};

sap.basetable.crosstab.CrosstabModel.prototype.updateColumnAxisLength = function () {
    this._columnAxisLength = this.getFullAxisLength(this._crosstabConstants.COLUMN_AXIS_INDEX);
};

sap.basetable.crosstab.CrosstabModel.prototype.getFullAxisLength = function (axisIndex) {
    return this._dataProvider.getFullAxisLength(axisIndex);
};

sap.basetable.crosstab.CrosstabModel.prototype.initializeAxesMetadata = function () {
    this._dataProvider.initializeAxesMetadata();
};

sap.basetable.crosstab.CrosstabModel.prototype.updateAxesMetadata = function (data) {
    this._dataProvider.updateAxesMetadata(data, this);
};

sap.basetable.crosstab.CrosstabModel.prototype.addPageData = function (pageData) {
    // TODO if page information will always be in pageData, then maybe we should
    // update data provider, scroll page manager, and page manager to only accept
    // pageData
    this._dataProvider.addPage(pageData.page, pageData.windowIndex, pageData);
};

sap.basetable.crosstab.CrosstabModel.prototype.getFormat = function (measure) {
    return this._numberFormat_Map === undefined ? this._numberFormat_Map : this._numberFormat_Map[measure];
};

sap.basetable.crosstab.CrosstabModel.prototype.getPageRowSize = function() {
    return this._dataProvider.getPageRowSize();
};

sap.basetable.crosstab.CrosstabModel.prototype.getPageColumnSize = function() {
    return this._dataProvider.getPageColumnSize();
};

sap.basetable.crosstab.CrosstabModel.prototype.setVerticalScrollPosition  = function(verticalPosition){
    this._currentVerticalPosition = verticalPosition;
};

sap.basetable.crosstab.CrosstabModel.prototype.setHorizontalScrollPosition = function(horizontalPosition){
    this._currentHorizontalPosition = horizontalPosition;
};

sap.basetable.crosstab.CrosstabModel.prototype.getStartRowIndex = function(){
    var startRowIndex = 0;
    if($.isNumeric(this._recentPageData.coordinates.startRowIndex)){
        startRowIndex = this._recentPageData.coordinates.startRowIndex;
    }
    return startRowIndex;
};

sap.basetable.crosstab.CrosstabModel.prototype.getStartColumnIndex  = function(){
    var startColumnIndex = 0;
    if($.isNumeric(this._recentPageData.coordinates.startColumnIndex)) {
        startColumnIndex = this._recentPageData.coordinates.startColumnIndex;
    }
    return startColumnIndex;
};

sap.basetable.crosstab.CrosstabModel.prototype.getEndRowIndex = function(){
    var endRowIndex = Math.min(this.getFullAxisLength(this._crosstabConstants.ROW_AXIS_INDEX), this.getPageRowSize());
    if($.isNumeric(this._recentPageData.coordinates.endColumnIndex)){
        endRowIndex = this._recentPageData.coordinates.endRowIndex;
    }
    return endRowIndex;
};

sap.basetable.crosstab.CrosstabModel.prototype.getEndColumnIndex  = function(){
    var endColumnIndex = Math.min(this.getFullAxisLength(this._crosstabConstants.COLUMN_AXIS_INDEX), this.getPageColumnSize());
    if($.isNumeric(this._recentPageData.coordinates.endColumnIndex)) {
        endColumnIndex = this._recentPageData.coordinates.endColumnIndex;
    }
    return endColumnIndex;
};

sap.basetable.crosstab.CrosstabModel.prototype.getQueryResponseUtils = function () {
    return this._dataProvider.getQueryResponseUtils();
};

sap.basetable.crosstab.CrosstabModel.prototype.findDimension = function (dimensionName) {
    for (var dimensionAxis = 0; dimensionAxis <= 1; dimensionAxis++) {
        var dimensions = this.getDimensions(dimensionAxis);
        for (var dimensionId = 0; dimensionId < dimensions.length; dimensionId++) {
            if (dimensionName === dimensions[dimensionId].id) {
                return {dimensionId: dimensionId, dimensionAxis: dimensionAxis};
            }
        }
    }
    return null;
};

sap.basetable.crosstab.CrosstabModel.prototype.getLastDimensionId = function (axis) {
    var dimensions = this.getDimensions(axis);
    var lastDimensionId;
    if (dimensions.length > 0) {
        lastDimensionId = dimensions[dimensions.length - 1].id;
    }
    return lastDimensionId;
};

sap.basetable.crosstab.CrosstabModel.prototype.getAbsoluteTupleIndex = function (tuplePath, dimension) {
    var dimensionLocation = this.findDimension(dimension);
    var dimensionAxis = dimensionLocation.dimensionAxis;
    var tupleIndex = this._tupleMap[dimensionAxis][tuplePath];
    if (tupleIndex && tupleIndex.length) {
        var indexOffset = dimensionAxis === this._crosstab.ROW_AXIS ? this.getStartRowIndex() : this.getStartColumnIndex();
        return tupleIndex[0] + indexOffset;
    }
    return null;
};

sap.basetable.crosstab.CrosstabModel.prototype.getConditionalFormattingStyles = function (rowIndex, columnIndex, value) {
    var styles = {};
    var formatter = this._crosstab.conditionalFormat();

    if (this._conditionalCellFormatter !== undefined) {
        styles = this._conditionalCellFormatter.getStyles(rowIndex, columnIndex, value, formatter);
    }

    return styles;
};

// The Crosstab is a vertical table if there are only dimensions on the rows axis (no measures and nothing on columns axis)
sap.basetable.crosstab.CrosstabModel.prototype.isVerticalTable = function() {
    return this.getMeasureMembers().length === 0 && this.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX).length === 0;
};

sap.basetable.crosstab.CrosstabModel.prototype.getSortingState = function () {
    return this._dataProvider.getSortingState();
};

sap.basetable.crosstab.CrosstabModel.prototype.getRankingState = function () {
    return this._dataProvider.getRankingState();
};

sap.basetable.crosstab.CrosstabModel.prototype.isDimensionHierarchy = function (dimensionId) {
    var hierarchies = this._dataProvider.getHierarchies();
    return hierarchies.hasOwnProperty(dimensionId);
};

sap.basetable.crosstab.CrosstabModel.prototype.isKeyLabelDimensions = function (dimensionId) {
    var keyLabelDimensions = this._dataProvider.getKeyLabelDimensions();
    return keyLabelDimensions.hasOwnProperty(dimensionId);
};

// Get the array of memberKeys that have been modified because they contain TUPLE_PATH_DELIMITER from CrosstabDataProvider
// Use the modified memberKey as the key to retrieve the original member key in the array
sap.basetable.crosstab.CrosstabModel.prototype.getModifiedMemberKeys = function () {
    if (this._dataProvider) {
        return this._dataProvider.getModifiedMemberKeys();
    }
    return null;
};

// Returns the measure metadata id if it exists. If the metadata id does not exist for the specified
// measure, the measure id is returned.
sap.basetable.crosstab.CrosstabModel.prototype.getMeasureMetadataId = function (measureId) {
    return this._dataProvider.getMeasureMetadataId(measureId);
};

sap.basetable.crosstab.CrosstabModel.prototype.getGrandTotalNodes = function (axisIndex) {
    var grandTotals = [];
    // Currently only row totals are anchored
    if (axisIndex === this._crosstabConstants.ROW_AXIS_INDEX && this._dataProvider) {
        grandTotals = this._dataProvider.getGrandTotals();
    }
    return grandTotals;
};

sap.basetable.crosstab.CrosstabModel.prototype.initializePageManagerForAnchoredTotals = function () {
    this._dataProvider.initializePageManagerForAnchoredTotals();
};

sap.basetable.crosstab.CrosstabModel.prototype.isolateGrandTotals = function () {
    return this._dataProvider.isolateGrandTotals();
};

sap.basetable.crosstab.CrosstabModel.prototype.containsGrandTotals = function () {
    return this._dataProvider.containsGrandTotals();
};

sap.basetable.crosstab.CrosstabModel.prototype.getGrandTotalsTuplePaths = function(axisIndex){
    var grandTotalsTuplePaths = [];
    var grandTotalNodes = this.getGrandTotalNodes(axisIndex);
    if (!grandTotalNodes || grandTotalNodes.length === undefined) {
        return [];
    }
    if (grandTotalNodes.length === 0 && this._cachedGrandTotalNodes) {
        // If grandTotalNodes is empty and cachedGrandTotalNodes has some values, we use cachedGrandTotalNodes to get tuplePaths of grandtotals.
        // This is required in case of resizing crosstab in compose room or resizing a brower window size. Resizing could cause anchoredTotals to be
        // deanchoring totals when the crosstab container is too small to show them anchored.
        // And when that happens, we have grandTotalNodes being empty in crosstabModel.
        // We need to cache it in order to recalcuate totals can be anchored or not when the crosstab is resized again.
        grandTotalNodes = this._cachedGrandTotalNodes;
    }

    if (grandTotalNodes.length > 0) {
        grandTotalsTuplePaths = grandTotalNodes.map(function(node) {
                                    return node.tuplePath;
                                });
    }

    // next line is a shortcut for going all the way in the tree of the grandTotalsTuplePath.
    // It's a specific solution for the grandTotals since they have a fake children
    var tuplePathCorrection = new Array(this.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX).length).join("|");
    for (var i = 0; i < grandTotalsTuplePaths.length; i++) {
        grandTotalsTuplePaths[i] += tuplePathCorrection;
    }

    return grandTotalsTuplePaths;
};

sap.basetable.crosstab.CrosstabModel.prototype.getCachedGrandTotalNodes = function () {
    return this._cachedGrandTotalNodes;
};

sap.basetable.crosstab.CrosstabModel.prototype.setCachedGrandTotalNodes = function (cachedGrandTotalNodes) {
    this._cachedGrandTotalNodes = cachedGrandTotalNodes;
};
/*global $:false */
/*global jQuery: false */
/*global sap: false */
/*jshint globalstrict: true*/
/*jshint -W083 */
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.CrosstabRenderer");


sap.basetable.crosstab.CrosstabRenderer = function (crosstab, crosstabScrollBarEventMediator) {
    this._crosstab = crosstab;
    this._model = this._crosstab.model();
    this._crosstabContainers = this._crosstab.crosstabContainers();
    this._crosstabScrollBarEventMediator = crosstabScrollBarEventMediator;
    this._crosstabConstants = crosstab.getCrosstabConstants();
    this._resizingConstants = new sap.basetable.crosstab.CrosstabElementResizedEventConstants();

    this._columnSubtotals = [];
    // A map from row/col numbers to the measure type the rows/cols contain
    this._measuresMap = [];
    this._grandTotalsHeaderWrapper = null;
    this._grandTotalsContentWrapper = null;
    this._grandTotalsHeight = 0;
    this._horizontalScrollBarVisible = false;
    this._verticalScrollBarVisible = false;
    this._rowAxisHeaderScrollBarVisible = false;
    this._isContentWidthGreaterThanContainerWidth = false;
    this._isLeftAreaGreaterThanThirtyPercentOfContainerWidth = false;
    this._isContentHeightGreaterThanContainerHeight = false;
    this._isLoading = false;
    this._columnDimensionsDoNotHaveMembers = false;
};

sap.basetable.crosstab.CrosstabRenderer.prototype = {
     // Only the constants should be declared here
    _leftAreaContainerMaxSizeOfWindow : 0.3,
    //pixel adjustments for the borders in the UX spec.
    _CELL_CORRECTION_PIXEL_OFFSET : 1,
    _FIRST_COLUMN_DIMENSION_CELL : "crosstab-ColumnDimensionCell-first",
    MINIMUM_RESIZED_CELL_WIDTH : 32,
    MINIMUM_RESIZED_CELL_HEIGHT : 32,
    _HIDDEN_DIMENSION_CELL_HEIGHT : 0,
    _HIDE_SECTION : "crosstab-hideSection",
    _MEASURES_SPAN : "Crosstab-MeasuresSpan",
    _MEASURES_ICON_CONTAINER_WIDTH : 24, // from css class #Crosstab-MeasuresIconContainer (16px icon + 8px paddings)
    _HEADER_ROW_COUNT: 1,
    _WORD_WRAP_HEIGHT_PADDING: 2,
    _HEADER_CELL_PADDING: 8
};

sap.basetable.crosstab.CrosstabRenderer.prototype.getMeasuresMap = function(index){
    if (typeof index === "number"){
        return this._measuresMap[index];
    } else {
        return this._measuresMap;
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createContentSpan = function(id, text, isTotal, styleString, rawValue) {
    var span = $(document.createElement("span"));
    text = text === null ? "" : this._sanitizeContent(text);
    span[0].innerHTML = text;
    //assumption: if a raw value is undefined, we have a member (title is text).
    //If a raw value is present, we have a cell value (title is rawValue).
    if(rawValue !== undefined) {
        span[0].setAttribute("title", rawValue);
    }
    if (isTotal) {
        span[0].className += " " + this._crosstabConstants.SUBTOTAL;
    } else {
        span[0].className += " " + this._crosstabConstants.CELL_CONTENT;
    }
    if (!$.isEmptyObject(styleString)) {
        span[0].setAttribute("style", styleString);
    }
    return span;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._sanitizeContent = function(text) {
    if (typeof text !== "string") {
        return text.toString();
    }
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return text;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createContentCell = function(id, text, isTotal, isGrandTotal, rowSpan, colSpan, styleClass, rawValue, resizedSize) {
    var styleString;
    var conditionalBackgroundColor;
    if (!$.isEmptyObject(styleClass)) {
        styleString = sap.basetable.crosstab.utils.RenderUtils.styleClasstoString(styleClass);
        conditionalBackgroundColor = styleClass["background-color"];
    }
    var span = this._createContentSpan(id, text, isTotal, styleString, rawValue);
    var isTop = id.indexOf("dataCell_0") === 0;

    var cell = sap.basetable.crosstab.utils.RenderUtils.createContentCell(id, this._crosstab.getColumnCellWidth(),
        this._crosstab.getRowCellHeight(), this._crosstab.getBorderWidth(), span, true, isTop, rowSpan, colSpan, this._crosstabConstants.CELL,
        false, resizedSize, undefined, false);

    var anchoredTotals = isGrandTotal && !this._isEntireGrandTotalsVisible && this.canGrandTotalsBeAnchored();
    if (anchoredTotals) {
        cell[0].style.height = (parseInt(cell[0].style.height) - this._CELL_CORRECTION_PIXEL_OFFSET) + "px";
    }

    if(conditionalBackgroundColor && conditionalBackgroundColor.length > 0){
        cell.css({"background-color": conditionalBackgroundColor});
    }
    return cell;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createHeaderCell = function(id, text, isTotal, rowSpan, colSpan, children, styleClass, isTop, addAPixelToWidth, memberId, isMeasure, isRow, resizedSize, disableResize, sortable, wrapped) {
    var childrenCell;
    if (children && children.length>0){
        childrenCell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell(id+"-children");
        for (var i = 0; i < children.length; i++){
            childrenCell.append(children[i]);
        }
        childrenCell.addClass("crosstab-ChildrenCell");
    }
    var span = this._createContentSpan(id, text, isTotal, undefined, undefined);
    //subtract one from the line height, so we don't hide the blue bar when members on the columns.
    if (wrapped) {
        span.addClass(this._crosstabConstants.WORD_WRAP_CLASS);
    }

    var cellStyle = isTop ? this._crosstabConstants.CELL_TOP : this._crosstabConstants.CELL;
    var cell;

    var heightCorrection = isTop ? 0 : this._CELL_CORRECTION_PIXEL_OFFSET;
    if (!this._crosstab.isColumnDimensionHeaderVisible() && isTop && !isRow) {
        heightCorrection = this._CELL_CORRECTION_PIXEL_OFFSET;
    }

    if (isRow) {
        cell = sap.basetable.crosstab.utils.RenderUtils.createHeaderCell(id, this._crosstab.getRowCellWidth(), this._crosstab.getRowCellHeight() - heightCorrection, this._crosstab.getBorderWidth(), span,  true, isTop, childrenCell, rowSpan, colSpan, cellStyle, addAPixelToWidth, text, resizedSize, disableResize, sortable);
    } else {
        cell = sap.basetable.crosstab.utils.RenderUtils.createHeaderCell(id, this._crosstab.getColumnCellWidth(), this._crosstab.getColumnCellHeight() - heightCorrection, this._crosstab.getBorderWidth(), span,  true, isTop, childrenCell, rowSpan, colSpan, cellStyle, addAPixelToWidth, text, resizedSize, disableResize, sortable);
    }

    if (styleClass){
        cell.addClass(styleClass);
    }

    if (wrapped) {
        span[0].style.height = (parseInt(cell[0].childNodes[0].style.height) - this._WORD_WRAP_HEIGHT_PADDING) + "px";
    }

    return cell;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createDimensionHeaderCell = function(id, text, styleClass, isRow, rowDimWidth, rowDimHeight, sortable, wrapped) {
    var span = $(document.createElement("span"));
    var disableResize = {
        row: false,
        column: !isRow
    };
    span.text(text);
    span.attr("title", text);
    span.addClass(this._crosstabConstants.CELL_CONTENT);

    if (wrapped) {
        span.addClass(this._crosstabConstants.WORD_WRAP_CLASS + " " + this._crosstabConstants.WORD_WRAP_HEADER_CLASS);
    }
    // Border width must be added to align its size with the data cells width (that have borders)
    rowDimWidth += this._crosstab.getBorderWidth();
    var defaultRowHeight = isRow ? this._crosstab.getRowCellHeight() : this._crosstab.getColumnCellHeight();

    if (!this._crosstab.isColumnDimensionHeaderVisible() && !isRow) {
        rowDimHeight = this._HIDDEN_DIMENSION_CELL_HEIGHT;
    } else {
        if (!rowDimHeight) {
            rowDimHeight = defaultRowHeight;
        }
    }

    // We need to rename dimension id width "Crosstab-" in front because a dimension id is identical to the one for a card in feeding shelf.
    var xtId;
    if (id.indexOf(this._crosstabConstants.MEASURE_NAMES_DIMENSION) < 0) {
        xtId = "Crosstab-" + id;
    } else {
        xtId = id;
        span.attr("id", this._MEASURES_SPAN);
    }

    var cell = sap.basetable.crosstab.utils.RenderUtils.createHeaderCell(xtId, rowDimWidth,
                                rowDimHeight, this._crosstab.getBorderWidth(), span, false, false, undefined, undefined,
                                undefined, undefined, undefined, undefined, undefined, disableResize, sortable);
    cell.addClass("crosstab-DimensionCell");
    if (styleClass) {
        cell.addClass(styleClass);
    }

    if (!this._crosstab.isColumnDimensionHeaderVisible() && !isRow) {
        cell.css({display: "none"});
    }
    return cell;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._hasDataPoints = function (node) {
    for (var i = 0; i < node.children.length; i++){
        var childNode = node.children[i];
        if (childNode.dataPoints && childNode.dataPoints.length > 0) {
            return true;
        }
        if (childNode.children && childNode.children.length > 0 && this._hasDataPoints(childNode)){
            return true;
        }
    }
    if (node.children && node.children.length === 0 && node.dataPoints && node.dataPoints.length > 0){
        return true;
    }
    return false;
};

sap.basetable.crosstab.CrosstabRenderer.prototype.draw = function (height, width) {
    var container = this._crosstab.container();
    //TODO: We don't need to reset the entire HTML!
    container.html("");
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    var columnDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);

    var rowTupleRootNode = this._model.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX).rootnode;
    var columnTupleRootNode = this._model.getTupleTree(this._crosstabConstants.COLUMN_AXIS_INDEX).rootnode;

    var leftAreaWidth = this.calculateLeftAreaWidth();
    var rightAreaWidth = this.calculateRightAreaWidth();
    var headerHeight = this.calculateTopSectionHeight();
    var bodyHeight = this.calculateBottomSectionHeight(true);

    if (!this._crosstab._model.isGrandTotalsCurrentlyAnchored()) {
        bodyHeight -= this.getGrandTotalsHeight(this._crosstabConstants.ROW_AXIS_INDEX);
    }

    this._crosstabContainers.setHeaderHeight(headerHeight);
    this._crosstabContainers.setBodyHeight(bodyHeight);

    var layoutTotalWidth = leftAreaWidth + rightAreaWidth;
    var layoutTotalHeight = this._crosstabContainers.getHeaderHeight() + this._crosstabContainers.getBodyHeight();
    var crosstabData = {
        layoutTotalWidth: layoutTotalWidth,
        layoutTotalHeight: layoutTotalHeight,
        rowDimensions: rowDimensions,
        columnDimensions: columnDimensions,
        rowTupleRootNode: rowTupleRootNode,
        columnTupleRootNode: columnTupleRootNode
    };
    this._setOverallContainerSizes(height, width);

    var crosstabLayoutInfo = this._createLayout(crosstabData);

    this._createTopSection(crosstabLayoutInfo.layoutObject, leftAreaWidth, rightAreaWidth, rowDimensions, columnDimensions, rowTupleRootNode, columnTupleRootNode);
    this._createBottomSection(crosstabLayoutInfo.layoutObject, leftAreaWidth, rightAreaWidth, rowDimensions, rowTupleRootNode);

    this._createScrollContainer(crosstabLayoutInfo.layoutObject);
    this._setContainerSizes(leftAreaWidth, rightAreaWidth);
    this._createLoadingIndicator(crosstabLayoutInfo);

    if (!this._crosstab.isHorizontallyScrollable() || !this._crosstab.isVerticallyScrollable()) {
        var coordinates = this._model.getRecentPageData().coordinates;
        var sectionData = this._model.getSectionData(coordinates);
        this._drawPostProcessing(sectionData);
    }

    this._addSelectionOutline(container);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._addSelectionOutline = function(container){
    var ui5Frame = container.closest("." + this._crosstabConstants.UI5_FRAME_CLASS);
    ui5Frame.find("." + this._crosstabConstants.SELECTION_OUTLINE_CLASS).remove();
    ui5Frame.append($("<div class='" + this._crosstabConstants.SELECTION_OUTLINE_CLASS + "'></div>"));
    // The selection outline listens to the following events, hides itself and fires the event to the element
    // that lies beneath it. It only matters in IE, since Chrome ignores the listeners with "pointer-events: none".
    var events = ["click", "mousedown", "mouseup", "mousemove", "wheel", "contextmenu", "mouseenter", "mouseleave"];
    for (var eventIndex in events) {
        ui5Frame.find("." + this._crosstabConstants.SELECTION_OUTLINE_CLASS).on(events[eventIndex], function(event) {
            var originalEvent = event.originalEvent;

            var outline = ui5Frame.find("." + this._crosstabConstants.SELECTION_OUTLINE_CLASS);
            outline.hide();
            var target = document.elementFromPoint(originalEvent.pageX, originalEvent.pageY);
            outline.show();

            var isScrolling = originalEvent.type === "wheel";
            // Scrolling-related events should be tied to the row axis content container
            if (isScrolling || event.type === "mouseenter" || event.type === "mouseleave") {
                target = this._crosstabContainers.getRowAxisContentContainer()[0];
            }
            if (!target) {
                return;
            }

            var mouseEvent = document.createEvent("MouseEvent");
            mouseEvent.initMouseEvent(originalEvent.type, true, true, window, originalEvent.detail, originalEvent.screenX, originalEvent.screenY, originalEvent.clientX, originalEvent.clientY, originalEvent.ctrlKey, originalEvent.altKey, originalEvent.shiftKey, false, originalEvent.button, null);
            if (isScrolling) {
                mouseEvent.deltaX = originalEvent.deltaX;
                mouseEvent.deltaY = originalEvent.deltaY;
            }
            target.dispatchEvent(mouseEvent);
            return false;
        }.bind(this));
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._drawPostProcessing = function(sectionData){
    this._addBuffer(sectionData);
    this._determineSectionsToHide(sectionData);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setOverallContainerSizes = function(height, width){
    this._crosstabContainers.setOverallContainerHeight(height);
    this._crosstabContainers.setOverallContainerWidth(width);
};

sap.basetable.crosstab.CrosstabRenderer.prototype.getScrollbarVisibility = function() {
    // Only show the horizontal, row axis, and vertical scrollbars if header height is less than the overall crosstab container height.
    // If shown when the header height is greater than the container height, the horizontal and row axis scrollbars will overlap the
    // header area and the vertical scrollbar will occassionally expand to the full height of the headers (see incident: BITVDC25-1047).
    // NOTE: The scrollbar visibility must be disabled here, as opposed to setting the _horizontalScrollBarVisible, _verticalScrollBarVisible
    // and _rowAxisHeaderScrollBarVisible variables to false, as these variables are actually used to determine the layout for the various
    // container areas. We want to hide the scrollbars while leaving the layout of the containers unaffected.
    var scrollBarVisibility = {
        horizontalScrollBar:   this._horizontalScrollBarVisible && this._isHeaderHeightLessThanContainerHeight(),
        verticalScrollBar: this._verticalScrollBarVisible && this._isHeaderHeightLessThanContainerHeight(),
        rowAxisHeaderScrollBar: this._rowAxisHeaderScrollBarVisible && this._isHeaderHeightLessThanContainerHeight(),
        isVerticallyScrollable: this._crosstab.isVerticallyScrollable()
    };
    return scrollBarVisibility;
};


// Returns true if the header height is less than the overall crosstab container height.
sap.basetable.crosstab.CrosstabRenderer.prototype._isHeaderHeightLessThanContainerHeight = function() {
    return this._crosstabContainers._headerHeight < this._crosstabContainers._overallContainerHeight;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createScrollContainer = function(crosstabLayout) {
    var scrollContainer = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("crosstabScrollContainer");
    scrollContainer.addClass("crosstab-Scroll-Container");

    if(!this._crosstab.isVerticallyScrollable()) {
        var height = this._crosstab.getTotalHeight();
        scrollContainer.css({height: height});
    }

    if(!this._crosstab.isHorizontallyScrollable()) {
        var width = this._crosstab.getTotalWidth();
        scrollContainer.css({width: width});
    }

    this._crosstabContainers.setScrollContainer(scrollContainer);
    this._crosstab.container().append(scrollContainer);
    scrollContainer.append(crosstabLayout);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createLayout = function(crosstabData){

    var classList = [];

    var layoutSize = this._getCrosstabLayoutSize(crosstabData);

    if(crosstabData.layoutTotalWidth <= layoutSize.width){
        classList.push("borderRightWidth");
    }
    if(crosstabData.layoutTotalHeight <= layoutSize.height){
        classList.push("borderBottomWidth");
    }


    var layout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("crosstabLayout", layoutSize.width, layoutSize.height);
    layout.addClass(this._crosstabConstants.CROSSTAB_LAYOUT_CLASS);

    if (crosstabData.rowDimensions.length === 0 && crosstabData.columnDimensions.length === 0) {
        layout.addClass("noBorder");
    }

    for(var i = 0; i < classList.length; i ++){
       layout.addClass(classList[i]);
    }

    if(!this._crosstab.isVerticallyScrollable() || !this._crosstab.isHorizontallyScrollable()) {
        layout.css({position:"relative"});
    }

    this._crosstabContainers.setLayout(layout);
    return {layoutObject: layout, layoutSize: layoutSize};
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setContainerSizes = function(leftAreaWidth, rightAreaWidth) {
    this._setContainerBoundaries(leftAreaWidth,rightAreaWidth);
    this._resetScrollBarVisibleFlags();
    this._intializeScrollContainers(leftAreaWidth,rightAreaWidth);
    if(this._rowAxisHeaderScrollBarVisible && !(this._horizontalScrollBarVisible)){
        this._updateContainerWidths();
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createLoadingIndicator = function(crosstabLayoutInfo) {
    this._loadingIndicator = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("crosstabLoadingIndicator");
    this._loadingIndicator.addClass("crosstab-loadingIndicator crosstab-loadingHidden");

    var top = Math.round(crosstabLayoutInfo.layoutSize.height/2);
    var left = Math.round(crosstabLayoutInfo.layoutSize.width/2);
    this._loadingIndicator.css({top: top, left: left});
    crosstabLayoutInfo.layoutObject.append(this._loadingIndicator);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._getCrosstabLayoutSize = function(crosstabData) {
    var crosstabLayoutHeight = this._crosstabContainers.getOverallContainerHeight();
    var crosstabLayoutWidth = this._crosstabContainers.getOverallContainerWidth();

    if(crosstabData.layoutTotalWidth <= crosstabLayoutWidth){
        crosstabLayoutWidth = crosstabData.layoutTotalWidth;
    }
    if(crosstabData.layoutTotalHeight <= crosstabLayoutHeight){
        crosstabLayoutHeight = crosstabData.layoutTotalHeight;
    }


    if (crosstabData.rowDimensions.length > 0 &&
        (this._hasDataPoints(crosstabData.rowTupleRootNode) ||
            crosstabData.columnTupleRootNode.numOfLeafChildren)) {
        crosstabLayoutWidth += this._crosstabConstants.METADATA_BORDER_WIDTH;
    }

    // If measures or dimensions on columns, a metadata border will exist, account for its height
    if (this._crosstab.isMetaDataBorderPresent(this._crosstabConstants.HORIZONTAL)) {
        crosstabLayoutHeight += this._crosstabConstants.METADATA_BORDER_HEIGHT;
    }
    return {height: crosstabLayoutHeight, width: crosstabLayoutWidth};
};

sap.basetable.crosstab.CrosstabRenderer.prototype._resetScrollBarVisibleFlags = function(){
    this._rowAxisHeaderScrollBarVisible = false;
    this._horizontalScrollBarVisible = false;
    this._verticalScrollBarVisible = false;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setContainerBoundaries = function(leftAreaWidth, rightAreaWidth){
    this._setIsContentWidthGreaterThanContainerWidth(leftAreaWidth, rightAreaWidth);
    this._setIsLeftAreaGreaterThanThirtyPercentOfContainerWidth(leftAreaWidth);
    this._setIsContentHeightGreaterThanContainerHeight();
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setIsContentWidthGreaterThanContainerWidth = function(leftAreaWidth, rightAreaWidth){
    if((leftAreaWidth + rightAreaWidth) > this._crosstabContainers.getOverallContainerWidth()){
        this._isContentWidthGreaterThanContainerWidth = true;
    } else{
        this._isContentWidthGreaterThanContainerWidth = false;
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setIsLeftAreaGreaterThanThirtyPercentOfContainerWidth = function(leftAreaWidth){
    if(leftAreaWidth > (this._crosstabContainers.getOverallContainerWidth() * this._leftAreaContainerMaxSizeOfWindow)){
        this._isLeftAreaGreaterThanThirtyPercentOfContainerWidth = true;
    } else{
        this._isLeftAreaGreaterThanThirtyPercentOfContainerWidth = false;
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setIsContentHeightGreaterThanContainerHeight = function(){
    if((this._crosstabContainers.getHeaderHeight()+ this._crosstabContainers.getBodyHeight()) > this._crosstabContainers.getOverallContainerHeight()){
        this._isContentHeightGreaterThanContainerHeight = true;
    } else{
        this._isContentHeightGreaterThanContainerHeight = false;
    }
};

/**
 * UpdateContainerWidths is called when rowAxisHeader scroll bar is visible and horizontal scrollbar is not visible
 * When this occurs the crosstab width has shrunk so the cross tab container must be updated with the correct width
 * Also, we must add borderRightWidth to crosstab layout because we are at the horizontal end.
 */
sap.basetable.crosstab.CrosstabRenderer.prototype._updateContainerWidths = function(){
    var leftAreaContainerWidth = this._crosstabContainers.getLeftAreaContainerWidth();
    var rightAreaContainerWidth = this._crosstabContainers.getRightAreaContainerWidth();
    var layout = this._crosstabContainers.getLayout();
    // Row Axis scroll bar is visible so must add meta data border width (2px)
    $(layout).css({width: leftAreaContainerWidth + rightAreaContainerWidth + this._crosstabConstants.METADATA_BORDER_WIDTH });
    // Always add borderRightWidth because horizontal scroll bar is not visible
    $(layout).addClass("borderRightWidth");
};

sap.basetable.crosstab.CrosstabRenderer.prototype._intializeScrollContainers = function(leftAreaWidth, rightAreaWidth){
    if (this._crosstab.isHorizontallyScrollable()) {
        this._setLeftAreaContainerWidth(leftAreaWidth, rightAreaWidth);
        this._setHorizontalScrollBarVisible();
    }

    if (this._crosstab.isVerticallyScrollable()) {
        this._setVerticalScrollBarVisible();
    }

    this._setContainers(leftAreaWidth, rightAreaWidth);
};

/**
 * When requirements for a rowAxisHeader scrollbar are met, check to see if there is less than one cell or one of many cells to show when
 * leftAreaWidth is reduced. If there is at least one cell not shown than set leftAreaContainerWidth to 30% of overallcontainerWidth;
 * If there is less than one cell not shown find out percentage of last cell showing. If percentage of last cell showing is greater than 0.50
 * than shrink container and rowAxisHeaderScrollBar will appear unless only one cell in left area width.
 * If percentage of last cell showing is less than 0.50 than grow container and do not have a rowAxisHeaderScrollBar.
 * Since we are adjusting leftAreaWidth we have to check if we need horizontal scroll bar.
 *
 * @param leftAreaWidth: width of rowAxisHeaderContent
 * @param rightAreaWidth: width of rowAxisContentContent
 */
sap.basetable.crosstab.CrosstabRenderer.prototype._setLeftAreaContainerWidth = function(leftAreaWidth,rightAreaWidth){
    if (this._isContentWidthGreaterThanContainerWidth && this._isLeftAreaGreaterThanThirtyPercentOfContainerWidth) {
        this._rowAxisHeaderScrollBarVisible = true;
        var crosstabContainerWidth = this._crosstabContainers.getOverallContainerWidth();
        var leftAreaWidthReduced = Math.floor(crosstabContainerWidth * this._leftAreaContainerMaxSizeOfWindow);
        if (leftAreaWidthReduced + rightAreaWidth < crosstabContainerWidth){
            var dynamicLeftAreaWidth = crosstabContainerWidth - rightAreaWidth;
            this._crosstabContainers.setLeftAreaContainerWidth(dynamicLeftAreaWidth);
        } else {
            this._crosstabContainers.setLeftAreaContainerWidth(leftAreaWidthReduced);
        }
    } else {
        this._crosstabContainers.setLeftAreaContainerWidth(leftAreaWidth);
    }
    this._setIsContentWidthGreaterThanContainerWidth(this._crosstabContainers.getLeftAreaContainerWidth(), rightAreaWidth);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setHorizontalScrollBarVisible = function(){
    if (this._isContentWidthGreaterThanContainerWidth && !this._columnDimensionsDoNotHaveMembers) {
        // When there is column dimensions but no column members or datapoints, do not show horizontal scrollbar
        this._horizontalScrollBarVisible = true;
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setVerticalScrollBarVisible = function(){
    if(this._isContentHeightGreaterThanContainerHeight){
        this._verticalScrollBarVisible = true;
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setContainers = function(leftAreaWidth,rightAreaWidth){
    if(this._isContentHeightGreaterThanContainerHeight && this._isContentWidthGreaterThanContainerWidth){
        this._setRightAreaContainerWidth(rightAreaWidth);
        this._setRowHeaderContainerSize(true);
        this._setColumnHeaderContainerSize();
        this._setBodyContainerSize(true,this._crosstabConstants.BOTH);
    } else if(this._isContentHeightGreaterThanContainerHeight){
        this._setRightAreaContainerWidth(rightAreaWidth);
        this._setRowHeaderContainerSize(true);
        this._setBodyContainerSize(true,this._crosstabConstants.VERTICAL);
    } else if(this._isContentWidthGreaterThanContainerWidth){
        this._setRightAreaContainerWidth(rightAreaWidth);
        this._setColumnHeaderContainerSize();
        this._setBodyContainerSize(true, this._crosstabConstants.HORIZONTAL);
    }
    if(this._rowAxisHeaderScrollBarVisible){
        if(!this._horizontalScrollBarVisible && !this._verticalScrollBarVisible){
            this._setRightAreaContainerWidth(rightAreaWidth);
            this._setLeftAreaDimensionHeaderContainer();
            this._setRowHeaderContainerSize(false);
            this._setColumnHeaderContainerSize();
            this._setBodyContainerSize(false);
        } else if(this._horizontalScrollBarVisible && !this._verticalScrollBarVisible ){
            this._setRowHeaderContainerSize(false);
            this._setLeftAreaDimensionHeaderContainer();
        } else{
            this._setLeftAreaDimensionHeaderContainer();
        }
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setLeftAreaDimensionHeaderContainer = function() {
    $(this._crosstabContainers.getLeftAreaDimensionHeaderContainer())
        .css({height: this._crosstabContainers.getHeaderHeight(), width: this._crosstabContainers.getLeftAreaContainerWidth() + this._CELL_CORRECTION_PIXEL_OFFSET});
    $(this._crosstabContainers.getLeftAreaDimensionHeaderOuterContainer())
        .css({height: this._crosstabContainers.getHeaderHeight(), width: this._crosstabContainers.getLeftAreaContainerWidth() +
            this._crosstabContainers.getRightAreaContainerWidth() + this._crosstabConstants.METADATA_BORDER_WIDTH});
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setRightAreaContainerWidth = function(rightAreaWidth){
    if(this._isContentWidthGreaterThanContainerWidth){
        this._crosstabContainers.setRightAreaContainerWidth(this._crosstabContainers.getOverallContainerWidth() - this._crosstabContainers.getLeftAreaContainerWidth());
    } else{
        this._crosstabContainers.setRightAreaContainerWidth(rightAreaWidth);
    }
};


sap.basetable.crosstab.CrosstabRenderer.prototype._setBodyContainerSize = function(setFromVerticalOrHorizontalScrollBar, identifier){
    var height = this._crosstabContainers.getBodyHeight();
    var identifierIncludesVertical = (identifier === this._crosstabConstants.VERTICAL || identifier === this._crosstabConstants.BOTH);
    var heightAdjustmentRequired = setFromVerticalOrHorizontalScrollBar && identifierIncludesVertical;
    if(heightAdjustmentRequired){
        height = this._crosstabContainers.getOverallContainerHeight() - this._crosstabContainers.getHeaderHeight();
    }
    $(this._crosstabContainers.getRowAxisContentContainer())
        .css({height: height, width: this._crosstabContainers.getRightAreaContainerWidth()});
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setRowHeaderContainerSize = function(setFromVerticalScrollBar){
    var rowAxisHeaderContainer = this._crosstabContainers.getRowAxisHeaderContainer();
    var height;
    var leftAreaContainerWidth = this._crosstabContainers.getLeftAreaContainerWidth();
    if(setFromVerticalScrollBar){
        height = this._crosstabContainers.getHeaderHeight();
        var currentContainerHeight = this._crosstabContainers.getOverallContainerHeight() - height;
        $(rowAxisHeaderContainer).css({height: currentContainerHeight, width: leftAreaContainerWidth});
    } else{
        height = this._crosstabContainers.getBodyHeight();
        $(rowAxisHeaderContainer).css({height: height, width: leftAreaContainerWidth});
    }
};

/**
 * When horizontal scrollbar is visible and there are > 0 row dimensions, the entire column heading needs to be incremented by one pixel.
 * TODO: This is a patch to a possible issue we may fix later (i.e. 2px blue border vs 1px grey border discrepancy which necessitates an incremental offset)
 */
sap.basetable.crosstab.CrosstabRenderer.prototype._incrementWidthIfHorizontalScrollbarVisible = function(width) {
    var incrementedWidth = width;
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    if (this._horizontalScrollBarVisible && rowDimensions.length > 0) {
        return incrementedWidth + this._CELL_CORRECTION_PIXEL_OFFSET;
    }
    return incrementedWidth;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._setColumnHeaderContainerSize = function(){
    var columnHeaderContainer = this._crosstabContainers.getColumnHeaderContainer();
    var rightAreaWidth = this._crosstabContainers.getRightAreaContainerWidth();
    if (this._columnDimensionsDoNotHaveMembers) {
        // When there is column dimensions but no column members or datapoints, update width of all layout elements in column header
        var columnHeaderContent = this._crosstabContainers.getColumnHeaderContent();
        var columnHeaderLayout = this._crosstabContainers.getColumnHeaderLayout();
        $(columnHeaderContent).css("width", rightAreaWidth);
        $(columnHeaderContainer).css("width", rightAreaWidth);
        $(columnHeaderContainer).css("overflow", "hidden");
        $(columnHeaderLayout).css("width", rightAreaWidth);
        $(columnHeaderLayout.find("div[id$='Layout']")).css("width", rightAreaWidth);
    } else {
        var incrementedRightAreaWidth = this._incrementWidthIfHorizontalScrollbarVisible(rightAreaWidth);
        $(columnHeaderContainer).css({height: this._crosstabContainers.getHeaderHeight(), width: incrementedRightAreaWidth });
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createRowDimensionHeader = function (leftAreaWidth, rightAreaWidth, rowDimensions, columnDimensions, rowTupleRootNode, columnTupleRootNode, wrapped) {
    var isRow = true;
    var scrollCell, resizedColumns;
    var cell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("leftAreaDimensionHeader-Container");
    cell.addClass("crosstab-LeftDimensionHeaders");
    this._crosstabContainers.setLeftAreaDimensionHeaderContainer(cell);

    if(!this._hasDataPoints(rowTupleRootNode) && (rowDimensions.length > 0 || !columnTupleRootNode.numOfLeafChildren)) {
        leftAreaWidth = leftAreaWidth - 1;
    }
    var innerContainerWidth = leftAreaWidth;
    if (this._hasDataPoints(rowTupleRootNode) && !columnTupleRootNode.numOfLeafChildren) {
        resizedColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_COLUMN_WIDTH);
        var emptyColDim = this._resizingConstants.EMPTY_COLUMN_DIMENSION;
        var emptyColDimWidth = resizedColumns[emptyColDim] ? resizedColumns[emptyColDim] : this._crosstab.getColumnCellWidth();
        leftAreaWidth = leftAreaWidth + emptyColDimWidth + this._crosstabConstants.METADATA_BORDER_WIDTH;
        if (leftAreaWidth > this._crosstabContainers.getOverallContainerWidth()) {
            leftAreaWidth = this._crosstabContainers.getOverallContainerWidth() + this._crosstabConstants.METADATA_BORDER_WIDTH;
        }
        scrollCell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("leftAreaDimensionHeader-ScrollbarContainer");
        this._crosstabContainers.setLeftAreaDimensionHeaderContainer(scrollCell);
        this._crosstabContainers.setLeftAreaDimensionHeaderOuterContainer(cell);
    }
    var layout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("leftAreaDimensionHeader-Content", leftAreaWidth);
    layout.addClass("crosstab-Layout-Column");

    var innerLayout;

    if(!columnTupleRootNode.numOfLeafChildren){
        innerLayout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("leftAreaDimensionHeader-Content-inner", innerContainerWidth);
    }

    if (!this._hasDataPoints(rowTupleRootNode) && !columnTupleRootNode.numOfLeafChildren) {
        layout.addClass("noDataPoints");
    } else if (columnTupleRootNode.numOfLeafChildren) {
        layout.addClass("leftArea");
    }
    this._crosstabContainers.setLeftAreaDimensionHeaderContent(layout);
    var headerHeight = this._crosstabContainers.getHeaderHeight();
    if (this._crosstab.getColumnCellHeight() > this.MINIMUM_RESIZED_CELL_HEIGHT) {
        wrapped = true;
    }

    layout.css({
        height: (headerHeight - 1) + "px"
    });
    var row = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("leftAreaDimensionHeaderCellRow", headerHeight);
    if (innerLayout !== undefined) {
        innerLayout.append(row);
        layout.append(innerLayout);
    } else {
        layout.append(row);
    }

    resizedColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_COLUMN_WIDTH);

    rowDimensions.forEach(function(dimension, index) {
        var rowDimWidth = resizedColumns[dimension.id];
        if(!rowDimWidth){
            rowDimWidth = this._crosstab.getRowCellWidth();
        }
        var sortable = dimension.id === this._crosstabConstants.MEASURE_NAMES_DIMENSION;
        var dimensionCell = this._createDimensionHeaderCell(dimension.id,
                                                            dimension.caption,
                                                            "crosstab-RowDimensionCell",
                                                            isRow,
                                                            rowDimWidth,
                                                            this._crosstab.getColumnCellHeight(),
                                                            sortable,
                                                            wrapped);
        dimensionCell.find("." + this._crosstabConstants.RESIZABLE_COL).css("height", headerHeight);
        if(dimension.id === this._crosstabConstants.MEASURE_NAMES_DIMENSION){
            var iconCell = $(document.createElement("div")).attr("id", "Crosstab-MeasuresIconContainer").addClass("icon-Crosstab-Measures-Rows");
            var measuresSpan = dimensionCell.find("#" + this._MEASURES_SPAN);
            measuresSpan.css("width", dimensionCell.children().width() - this._MEASURES_ICON_CONTAINER_WIDTH);
            dimensionCell.children().prepend(iconCell);
            if (wrapped) {
                iconCell.addClass(this._crosstabConstants.MEASURES_ICON_WRAPPED_CLASS);
                iconCell.siblings("span." + this._crosstabConstants.WORD_WRAP_HEADER_CLASS).css({
                    width: (rowDimWidth - this._HEADER_CELL_PADDING - this._MEASURES_ICON_CONTAINER_WIDTH) + "px"
                });
            }
        }
        dimensionCell.attr("valign", "bottom");

        // Adjust CSS style for word wrapping
        if (wrapped) {
            var spanContainer = dimensionCell.children().first();
            var spanContainerWidth = rowDimWidth - this._HEADER_CELL_PADDING * 2;
            var measureNamesDimensionId = this._crosstabConstants.MEASURE_NAMES_DIMENSION;
            spanContainer.addClass(this._crosstabConstants.CELL_SPAN_WRAPPED_CLASS);
            spanContainer.find("span." + this._crosstabConstants.WORD_WRAP_HEADER_CLASS).each(function () {
                if ($(this).parent().attr("id") !== measureNamesDimensionId) {
                    $(this).css({width: spanContainerWidth + "px"});
                }
            });
        }

        // Stretch the row resizer to the right area if no dimensions present on the columns
        if (index === rowDimensions.length - 1 && columnDimensions.length === 0 && rightAreaWidth > 0) {
            var resizerWidth = rowDimWidth +
                                rightAreaWidth +
                                this._crosstab.getBorderWidth() +
                                this._crosstabConstants.ROW_AXIS_HEADER_CONTAINER_BORDER_SIZE.right;
            if (!columnDimensions.length) {
                resizerWidth += this._crosstabConstants.METADATA_BORDER_WIDTH;
            }
            dimensionCell.find("." + this._crosstabConstants.RESIZABLE_ROW).css({
                width: resizerWidth + "px",
                right: "auto",
                left: "0px"
            });
            dimensionCell.add(dimensionCell.children()).css("overflow", "visible");
        }
        row.append(dimensionCell);
    }.bind(this));

    if (scrollCell) {
        scrollCell.append(layout);
        cell.append(scrollCell);
    } else {
        cell.append(layout);
    }

    return cell;
};


sap.basetable.crosstab.CrosstabRenderer.prototype._isAdditionalBorderVisible = function (columnDimensions, rowDimensions) {
    if (columnDimensions.length > 0 && rowDimensions.length > 0) {
        return false;
    } else {
        for (var i = 0; i < columnDimensions.length; i++) {
            if (columnDimensions[i].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
                return false;
            }
        }
    }
    return true;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createColumnHeaderContainer = function (rightAreaWidth, rowDimensions, columnDimensions, rowTupleRootNode, columnTupleRootNode, columnIndex) {
    var defaultRowHeight = this._crosstab.getColumnCellHeight();
    var columnHeaderContainer = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell(this._crosstabConstants.COLUMNHEADER_CONTAINER);
    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_ROW_HEIGHT);

    var totalColumns = columnTupleRootNode.numOfLeafChildren ? columnTupleRootNode.numOfLeafChildren : 0;
    // true when there is column dimensions but no column members or datapoints, use diemsnions to determin width
    this._columnDimensionsDoNotHaveMembers = (totalColumns === 0 && !this._hasDataPoints(rowTupleRootNode) && columnDimensions.length > 0);

    if (this._isAdditionalBorderVisible(columnDimensions, rowDimensions)) {
        columnHeaderContainer.addClass("crosstab-ColumnHeaderContainer-blueBarsRemoved");
    } else {
        columnHeaderContainer.addClass("crosstab-ColumnHeaderContainer");
    }
    this._crosstabContainers.setColumnHeaderContainer(columnHeaderContainer);

    var contentWidth = rightAreaWidth;
    if (rowDimensions.length > 0 && this._hasDataPoints(rowTupleRootNode)) {
        contentWidth = contentWidth + 1;
    }

    var layout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("columnHeaderCell-Content", contentWidth, this._crosstabContainers.getHeaderHeight());
    layout.addClass("crosstab-Layout-Column");
    this._crosstabContainers.setColumnHeaderLayout(layout);
    var dimensionHeaderHeight = resizedRows ? resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] : 0;
    var headerHeightResized = !!dimensionHeaderHeight;
    dimensionHeaderHeight = headerHeightResized ? dimensionHeaderHeight : defaultRowHeight;
    if (!this._crosstab.isColumnDimensionHeaderVisible()) {
        dimensionHeaderHeight = this._HIDDEN_DIMENSION_CELL_HEIGHT;
    }
    var wrapped = dimensionHeaderHeight > this.MINIMUM_RESIZED_CELL_HEIGHT;


    var dimensionHeaderRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("columnDimensionHeaderRow", dimensionHeaderHeight, null, "crosstab-columnDimensionHeaderRow");

    if (!this._crosstab.isColumnDimensionHeaderVisible()) {
        dimensionHeaderRow.css({display: "none"});
    }

    var dimensionHeaderCell = this._createColumnDimensionHeaderCell(rightAreaWidth, dimensionHeaderHeight, columnDimensions, rowDimensions.length > 0, wrapped);
    dimensionHeaderRow.append(dimensionHeaderCell);
    layout.append(dimensionHeaderRow);

    var memberHeaderRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("columnMemberHeaderRow", this._crosstabContainers.getHeaderHeight() - dimensionHeaderHeight);
    var memberHeaderCell = this._createColumnMemberHeaderCell(rightAreaWidth, this._crosstabContainers.getHeaderHeight() - dimensionHeaderHeight, dimensionHeaderHeight,columnDimensions, columnTupleRootNode, columnIndex, rowDimensions.length > 0);
    memberHeaderRow.append(memberHeaderCell);
    layout.append(memberHeaderRow);

    this._crosstabContainers.setColumnHeaderContent(memberHeaderCell);

    columnHeaderContainer.append(layout);
    return columnHeaderContainer;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createColumnDimensionHeaderCell = function (rightAreaWidth, rightHeaderHeight, columnDimensions, hasRow, wrapped) {
    // Do not add the pixel offset if no members on columns
    rightAreaWidth = hasRow && columnDimensions.length > 0 && !this._columnDimensionsDoNotHaveMembers? rightAreaWidth + this._CELL_CORRECTION_PIXEL_OFFSET : rightAreaWidth;

    var cell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("rightAreaDimensionHeaderCell", rightAreaWidth, rightHeaderHeight);
    cell.addClass("crosstab-rightAreaDimensionHeader");
    var layout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rightAreaDimensionHeaderCellLayout", rightAreaWidth, rightHeaderHeight);
    var row = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("rightAreaDimensionHeaderCellRow", rightHeaderHeight);
    layout.append(row);
    var defaultCellWidth = this._crosstab.getColumnCellWidth();
    if (rightAreaWidth < defaultCellWidth * columnDimensions.length) {
        defaultCellWidth = Math.floor(rightAreaWidth / columnDimensions.length);
    }

    columnDimensions.forEach(function(dimension, index) {
        var styleClass = (index === 0) ? this._FIRST_COLUMN_DIMENSION_CELL : "crosstab-ColumnDimensionCell";
        var dimensionCell = this._createDimensionHeaderCell(dimension.id, dimension.caption, styleClass, false, defaultCellWidth, rightHeaderHeight, false, wrapped);
        if(dimension.id === this._crosstabConstants.MEASURE_NAMES_DIMENSION){
            var iconCell = $(document.createElement("div")).attr("id", "Crosstab-MeasuresIconContainer").addClass("icon-Crosstab-Measures-Columns");
            dimensionCell.children().prepend(iconCell);

            if (wrapped) {
                iconCell.addClass(this._crosstabConstants.MEASURES_ICON_WRAPPED_CLASS);
            }
        }

        // Adjust CSS style for word wrapping
        if (wrapped) {
            var cellSpan = dimensionCell.children().first();
            cellSpan.addClass(this._crosstabConstants.CELL_SPAN_WRAPPED_CLASS);
            cellSpan.find("span." + this._crosstabConstants.WORD_WRAP_HEADER_CLASS).css({
                width: (defaultCellWidth - this._HEADER_CELL_PADDING * 2) + "px"
            });
        }

        // Extend the last column dimension header to the whole right area
        if (index === columnDimensions.length - 1) {
            var lastCellResizerWidth = rightAreaWidth - (columnDimensions.length - 1) * defaultCellWidth - this._crosstab.getBorderWidth();
            if (lastCellResizerWidth > defaultCellWidth) {
                dimensionCell.find("." + this._crosstabConstants.RESIZABLE_ROW).css({
                    width: lastCellResizerWidth + "px",
                    right: "auto",
                    left: "0px"
                });
                dimensionCell.add(dimensionCell.children()).css("overflow", "visible");
            }
        }
        row.append(dimensionCell);
    }.bind(this));
    cell.append(layout);
    return cell;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._addColumnMemberHeader = function (node, index, level, parentID, hasRow) {
    var nodes = [];
    var isLeaf = false;
    var nodeTotalWidth = 0;
    var resizedColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_COLUMN_WIDTH);
    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_ROW_HEIGHT);
    var columnDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var disableResize = {
        row: false,
        column: false
    };

    var isHeightResized = resizedRows && resizedRows[columnDimensions[level].id];
    var resizedHeight = isHeightResized ? resizedRows[columnDimensions[level].id] : null;

    for (var i = 0; i < node.children.length; i++) {
        var childNode = node.children[i];
        var childrenCells = [];
        var nodeWidth = 0;
        var colSpan = childNode.numOfLeafChildren ? childNode.numOfLeafChildren : 1;
        var cellLabel = childNode.member.caption;
        if (childNode.isTotal) {
            if (childNode.member.id.length > 0) {
                    this._columnSubtotals[index] = {
                    type: childNode.member.id
                };
            }

            var multipleSubtotals = $.grep(node.children, function (checkNode, checkIndex) {
                var childNodeTuplePath = childNode.tuplePath;
                var checkNodeTuplePath = checkNode.tuplePath;
                var childNodeDelimiterIndex = childNode.tuplePath.indexOf(this._crosstabConstants.SUBTOTAL_TUPLE_PATH_DELIMETER);
                var checkNodeDelimiterIndex = checkNode.tuplePath.indexOf(this._crosstabConstants.SUBTOTAL_TUPLE_PATH_DELIMETER);

                if (childNodeDelimiterIndex > 0 && checkNodeDelimiterIndex > 0) {
                    childNodeTuplePath = childNode.tuplePath.substring(0, childNodeDelimiterIndex);
                    checkNodeTuplePath = checkNode.tuplePath.substring(0, checkNodeDelimiterIndex);
                }

                return checkIndex !== i && checkNode.tuplePath.length > 0 && childNodeTuplePath === checkNodeTuplePath;
            }.bind(this));
            if (multipleSubtotals.length > 0){
                cellLabel = cellLabel + " (" + childNode.member.aggregationTarget.caption + ")";
            }
        }
        if (childNode.children.length > 0){
            // non-leaf column dimension header
            isLeaf = false;
            var childInfo = this._addColumnMemberHeader(childNode, index, level + 1, parentID + "_" + i, hasRow);
            index = childInfo.index;
            childrenCells = childInfo.nodes;
            nodeWidth = childInfo.width;
            nodeTotalWidth += nodeWidth;
            disableResize.column = true; // only disable column resizing
        } else {
            isLeaf = true;
            var newWidth = resizedColumns[childNode.tuplePath];
            nodeWidth = newWidth ? newWidth : this._crosstab.getColumnCellWidth();
            nodeTotalWidth += nodeWidth;
            index++;
        }

        var addAPixelToWidth = false;
        if(hasRow && i === 0 && (parentID.lastIndexOf("_") === -1 || this._isHeaderCellInFirstColumn(parentID))) {
            addAPixelToWidth = true;
        }

        var resizedSize = {width: nodeWidth, height: resizedHeight};
        var wrapped = resizedHeight ? resizedHeight > this.MINIMUM_RESIZED_CELL_HEIGHT : this._crosstab.getColumnCellHeight() > this.MINIMUM_RESIZED_CELL_HEIGHT;
        var memberCell = this._createHeaderCell(parentID + "_" + i,
                                                cellLabel,
                                                childNode.isTotal,
                                                1,
                                                colSpan,
                                                childrenCells,
                                                this._crosstabConstants.COLUMN_HEADER_CELL,
                                                level === 0,
                                                addAPixelToWidth,
                                                childNode.member.id,
                                                childNode.isMeasure,
                                                false,
                                                resizedSize,
                                                disableResize,
                                                childNode.isMeasure,
                                                wrapped);
        if(isLeaf){
            memberCell.addClass(this._crosstab.getId() + "-ColumnHeader-LeafChild" + index);
            memberCell.addClass(this._crosstabConstants.LEAF_CHILD_CELL);
        }

       nodes.push(memberCell);
    }

    var measuresPosition = this._model.getMeasuresPosition();
    if (measuresPosition.axis === "column" && level === measuresPosition.level){
        var endIndex = 0;
        for (var measureIndex = 0; measureIndex < node.children.length; measureIndex++){
            var measure = node.children[measureIndex];
            var startIndex;
            if (measure.numOfLeafChildren > 0) {
                startIndex = endIndex === 0 ? index - node.numOfLeafChildren : endIndex;
                for (var childIndex = 0; childIndex < measure.numOfLeafChildren; childIndex++){
                    this._measuresMap[startIndex+childIndex] = measure.member.id;
                    if (measure.member.id === "") {
                        // totals empty nodes does not contain member id but contains aggregation target id instead.
                        this._measuresMap[startIndex+childIndex] = measure.member.aggregationTarget.id;
                    }
                    endIndex = startIndex + childIndex + 1;
                }
            } else {
                startIndex = index - node.numOfLeafChildren + measureIndex;
                this._measuresMap[startIndex] = measure.member.id;
                if (measure.member.id === "") {
                    // totals empty nodes does not contain member id but contains aggregation target id instead.
                    this._measuresMap[startIndex] = measure.member.aggregationTarget.id;
                }
            }
        }
    }

    return {
        index: index,
        nodes: nodes,
        width: nodeTotalWidth
    };
};

// regex in format "ColumnMemberHeaderCell_0" where "_0" occurs 1 or more times
sap.basetable.crosstab.CrosstabRenderer.prototype._isHeaderCellInFirstColumn = function(parentID){
    return /ColumnMemberHeaderCell(_0)+$/i.test(parentID);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createColumnMemberHeaderCell = function (rightAreaWidth, headerHeight, dimensionHeaderHeight, columnDimensions, columnTupleRootNode, columnIndex, hasRow) {
    var cell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("rightAreaMemberHeaderCell");
    var layout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rightAreaMembersHeaderCellLayout", rightAreaWidth, headerHeight);
    var rowsMap = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("colDimRow");
    layout.append(rowsMap);
    var headers = this._addColumnMemberHeader(columnTupleRootNode, columnIndex, 0, this._crosstab.getId() + "-" + this._crosstabConstants.COLUMN_MEMBER_HEADER_CELL, hasRow);
    for (var i = 0; i < headers.nodes.length; i++){
        rowsMap.append(headers.nodes[i]);
    }
    cell.append(layout);
    cell.addClass("crosstab-columnMemberHeaderRow");
    cell.css({top: dimensionHeaderHeight + "px"});
    return cell;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createTopSection = function (crosstabLayout, leftAreaWidth, rightAreaWidth, rowDimensions, columnDimensions, rowTupleRootNode, columnTupleRootNode) {
    var topSection = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("topSection", this._crosstabContainers.getHeaderHeight(), null, "crosstab-TopSection");
    var startColumnIndex = this._model.getStartColumnIndex();
    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_ROW_HEIGHT) || {};
    var wrapped = resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] ?
                    resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] > this.MINIMUM_RESIZED_CELL_HEIGHT :
                    false;

    for (var index = 0; index < columnDimensions.length && !wrapped; index++) {
        wrapped = columnDimensions[index].id in resizedRows ? resizedRows[columnDimensions[index].id] > this.MINIMUM_RESIZED_CELL_HEIGHT : false;
    }

    if (rowDimensions.length > 0) {
        var rowDimensionHeader = this._createRowDimensionHeader(leftAreaWidth, rightAreaWidth, rowDimensions, columnDimensions, rowTupleRootNode, columnTupleRootNode, wrapped);
        topSection.append(rowDimensionHeader);
    }
    if (columnDimensions.length > 0) {
        var columnHeaderContainer = this._createColumnHeaderContainer(rightAreaWidth, rowDimensions, columnDimensions, rowTupleRootNode, columnTupleRootNode, startColumnIndex);
        var resizedDimensionHeaderRow = resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW];
        var cumulativeHeight = resizedDimensionHeaderRow ? resizedDimensionHeaderRow : this._crosstab.getColumnCellHeight();
        if (!this._crosstab.isColumnDimensionHeaderVisible()) {
            cumulativeHeight = this._HIDDEN_DIMENSION_CELL_HEIGHT;
        }
        for (var i = 0; i < columnDimensions.length - 1; i++){
            var floatingCell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell(this._crosstab.getId() + "-ColumnAxisFloatingHeader" + i);
            var floatingCellTop = i === 0 ? cumulativeHeight - this._crosstab.getBorderWidth() : cumulativeHeight; // adjust first floating cell top for no border
            floatingCell.css({
                height: this._crosstab.getColumnCellHeight() + "px",
                left: "0px",
                top: floatingCellTop + "px",
                "z-index": "100"
            });

            floatingCell.addClass(this._crosstabConstants.FLOATING_CELL + " " + this._crosstabConstants.CELL_CONTENT);

            columnHeaderContainer.append(floatingCell);

            var resizedDimension = columnDimensions[i].id;
            cumulativeHeight += resizedRows[resizedDimension] ? resizedRows[resizedDimension] : this._crosstab.getColumnCellHeight();
        }
        topSection.append(columnHeaderContainer);
    }
    this._crosstabContainers.setTopSectionContainer(topSection);
    crosstabLayout.append(topSection);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._addDataPointsCellsToRow = function (rowsMap, node, rowIndex, numberOfColumnTuples, isFormattable, resizedHeight, isGrandTotal) {
    var columnIndex;
    var dataCell;
    var index;
    var startColumnIndex = this._model.getStartColumnIndex();
    // leaf node which has dataPoints
    if (node.dataPoints && node.dataPoints.length > 0) {
        var endColumnIndex;
        if (isGrandTotal) {
            // If it is anchored grandTotal node, set endColumnIndex, because it contains all of the dataPoints
            endColumnIndex = startColumnIndex + numberOfColumnTuples - 1;
        }
        for (index = 0; index < node.dataPoints.length; index++) {
            var measure;
            var format;
            var indexForDataPoint;
            columnIndex = index + startColumnIndex;
            var dataPoint;
            if (isGrandTotal) {
                if (columnIndex > endColumnIndex) {
                    // we have rendered the dataPoints for the current page
                    break;
                }
                // since dataPoints in anchored grandTotal is not paged, we need to use the non-paged columnIndex
                dataPoint = node.dataPoints[columnIndex];
            } else {
                dataPoint = node.dataPoints[index];
            }
            var value = dataPoint;
            if (!dataPoint  && dataPoint !== 0) {
                value = null;
            }
            var measuresPosition = this._model.getMeasuresPosition();
            if (measuresPosition.axis === this._crosstabConstants.COLUMN) {
                indexForDataPoint = columnIndex;
            } else if (measuresPosition.axis === this._crosstabConstants.ROW) {
                indexForDataPoint = rowIndex;
            }

            measure = this.getMeasuresMap(indexForDataPoint);
            format = this._model.getFormat(measure);

            var isTotal = node.isTotal ? node.isTotal : this._isColumnTotal(columnIndex);
            //Conditional Formatting
            var cfStyles = null;
            if(!isTotal) {
                var cfRowIndex =  rowIndex - this._model.getStartRowIndex();
                cfStyles = this._model.getConditionalFormattingStyles(cfRowIndex, index, value);
            }

            // Display Formatting
            // count subtotals should not get number formatting, as they are always integers
            if (format && isFormattable && !this._isColumnCount(columnIndex)) {
                value = sap.basetable.crosstab.utils.FormatUtils.applyFormats(dataPoint, format);
            }

            var resizedColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_COLUMN_WIDTH);
            var columnDimensionsLength = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX).length;
            var resizedSize = {};
            if (resizedHeight) {
                resizedSize.height = resizedHeight;
                if (rowIndex !== 0) {
                    resizedSize.height += this._crosstab.getBorderWidth();
                }
            }

            var columnTuplePath = this._model.getTupleFromIndex(this._crosstabConstants.COLUMN_AXIS_INDEX, index);
            if (columnTuplePath && resizedColumns[columnTuplePath]) {
                resizedSize.width = resizedColumns[columnTuplePath];
            } else if (columnDimensionsLength === 0 && resizedColumns[this._resizingConstants.EMPTY_COLUMN_DIMENSION]) {
                resizedSize.width = resizedColumns[this._resizingConstants.EMPTY_COLUMN_DIMENSION];
            }

            if (!$.isEmptyObject(cfStyles)) {
                dataCell = this._createContentCell("dataCell_" + rowIndex + "_" + columnIndex, value, isTotal, isGrandTotal, null, null, cfStyles, dataPoint, resizedSize);
            } else {
                dataCell = this._createContentCell("dataCell_" + rowIndex + "_" + columnIndex, value, isTotal, isGrandTotal, null, null, null, dataPoint, resizedSize);
            }

            var dataCellStyle = (index === 0) ? "crosstab-DataCell-first" : "crosstab-DataCell";
            dataCell.addClass(dataCellStyle);

            // If a non-transparent color format has been applied to the cell, set the top border color to match the format color.
            // This is required, as the top border color defined in the crosstab-DataCell-first and crosstab-DataCell css is light gray.
            if (!$.isEmptyObject(cfStyles) && (cfStyles["background-color"] !== "transparent")) {
                dataCell.css({"border-top-color": cfStyles["background-color"]});
            }

            rowsMap[rowIndex].append(dataCell);
        }
    } else {
        // leaf node which does not have children
        for (index = 0; index < numberOfColumnTuples; index++) {
            columnIndex = index + startColumnIndex;
            dataCell = this._createContentCell("dataCell_" + rowIndex + "_" + columnIndex, "", node.isTotal, isGrandTotal, null, null, null, null, null, null);
            dataCell.addClass("crosstab-DataCell");
            rowsMap[rowIndex].append(dataCell);
        }
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._addCellsToRow = function (contentRowsMap, node, rowIndex, numberOfColumnTuples, level, isFormattable, parentID, isTop, measureId) {
    var isRow = true;
    var nodes = [];
    var rowSpan;
    var measuresPosition = this._model.getMeasuresPosition();
    if (node.isTotal && !measureId) {
        // If the node is subtotal, keep the measure id which subtotal is based on in order to add its id to measureMap later on.
        var target = node.member.aggregationTarget;
        if (target !== undefined && target !== null) {
            measureId = target.id;
        }
    }

    // If it's the measures level, populate this._measuresMap
    if (measuresPosition.axis === this._crosstabConstants.ROW && level === measuresPosition.level && level !== undefined){
        var measuresMapIndex = rowIndex;
        for (var measureIndex = 0; measureIndex < node.children.length; measureIndex++){
            var measure = node.children[measureIndex];
            if(!measureId || !node.isTotal) {
                measureId = measure.member.id;
            }
            rowSpan = measure.numOfLeafChildren ? measure.numOfLeafChildren : 1;
            for (var childIndex = 0; childIndex < rowSpan; childIndex++){
                this._measuresMap[measuresMapIndex] = measureId;
                measuresMapIndex++;
            }
        }
    }

    // The following lines calculate the width of children's cells
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    var resizedRowColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_COLUMN_WIDTH);
    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_ROW_HEIGHT) || {};
    var resizedLevelWidth = resizedRowColumns[rowDimensions[level].id];
    var childWidth = resizedLevelWidth ? resizedLevelWidth : this._crosstab.getRowCellWidth();
    var cellSize = {width: childWidth};
    var totalHeight = 0;

    for (var i = 0; i < node.children.length; i++) {
        var childNode = node.children[i];
        var childrenCells = [];
        var formattable;
        var isLeaf;
        if (childNode.children.length > 0){
            formattable = isFormattable && !(childNode.isTotal && childNode.member.id === "count");
            var childInfo = this._addCellsToRow(contentRowsMap,
                                                childNode,
                                                rowIndex,
                                                numberOfColumnTuples,
                                                level + 1,
                                                formattable,
                                                parentID + "_" + i,
                                                rowIndex === 0,
                                                measureId);
            rowIndex = childInfo.rowIndex;
            childrenCells = childInfo.nodes;
            cellSize.height = childInfo.totalHeight;
            isLeaf = false;
        } else {
            formattable = isFormattable && !(childNode.isTotal && childNode.member.id === "count");
            var resizedHeight = resizedRows[childNode.tuplePath];
            // check if it is anchored grandTotal
            var isGrandTotal = rowIndex >= contentRowsMap.length - this._model.getGrandTotalNodes(this._crosstabConstants.ROW_AXIS_INDEX).length && childNode.isTotal && this._crosstab.isTotalsAnchored();
            this._addDataPointsCellsToRow(contentRowsMap, childNode, rowIndex, numberOfColumnTuples, formattable, resizedHeight, isGrandTotal);
            cellSize.height = resizedHeight ? resizedHeight : this._crosstab.getRowCellHeight();
            isLeaf = true;
            rowIndex++;
        }
        totalHeight += cellSize.height;
        rowSpan = childNode.numOfLeafChildren ? childNode.numOfLeafChildren : 1;
        var wrapped = cellSize.height > this.MINIMUM_RESIZED_CELL_HEIGHT * rowSpan;
        var hasMultipleSubtotal = false;
        var multipleSubtotals;
        var memberCell = null;
        if (childNode.isTotal){
            multipleSubtotals = $.grep(node.children, function (checkNode, checkIndex) {
                if (checkIndex !== i) {
                    var childNodeTuplePathArray = childNode.tuplePath.split(this._crosstabConstants.SUBTOTAL_TUPLE_PATH_DELIMETER);
                    var childNodeTuplePath;
                    if (childNode.member.aggregationTarget && childNodeTuplePathArray.length > 1) {
                        childNodeTuplePath = childNodeTuplePathArray[0] + childNodeTuplePathArray[1].substring(childNode.member.aggregationTarget.id.length);
                    } else {
                        childNodeTuplePath = childNodeTuplePathArray[0];
                    }
                    var checkNodeTuplePathArray = checkNode.tuplePath.split(this._crosstabConstants.SUBTOTAL_TUPLE_PATH_DELIMETER);
                    var checkNodeTuplePath;
                    if (checkNode.member.aggregationTarget && checkNodeTuplePathArray.length > 1) {
                        checkNodeTuplePath = checkNodeTuplePathArray[0] + checkNodeTuplePathArray[1].substring(checkNode.member.aggregationTarget.id.length);
                    } else {
                        checkNodeTuplePath = checkNodeTuplePathArray[0];
                    }
                    if (checkNodeTuplePath && childNodeTuplePath) {
                        return checkNode.tuplePath.length > 0 && childNodeTuplePath === checkNodeTuplePath;
                    }
                }
                return false;
            }.bind(this));
            if (multipleSubtotals.length > 0){
                var cellLabel = childNode.member.caption + " (" + childNode.member.aggregationTarget.caption + ")";
                memberCell = this._createHeaderCell(parentID + "_" + i,
                                                    cellLabel,
                                                    childNode.isTotal,
                                                    rowSpan,
                                                    null,
                                                    childrenCells,
                                                    this._crosstabConstants.DIMENSION_HEADER_CELL,
                                                    null,
                                                    null,
                                                    childNode.member.id,
                                                    childNode.isMeasure,
                                                    isRow,
                                                    cellSize,
                                                    null,
                                                    null,
                                                    wrapped);
                if(isLeaf){
                    memberCell.addClass(this._crosstab.getId() + "-RowAxisHeader-LeafChild" + rowIndex);
                    memberCell.addClass(this._crosstabConstants.LEAF_CHILD_CELL);
                }
                hasMultipleSubtotal = true;
            }
        }
        if (!hasMultipleSubtotal){
            memberCell = this._createHeaderCell(parentID + "_" + i,
                                                childNode.member.caption,
                                                childNode.isTotal,
                                                rowSpan,null,
                                                childrenCells,
                                                this._crosstabConstants.DIMENSION_HEADER_CELL,
                                                isTop,
                                                null,
                                                childNode.member.id,
                                                childNode.isMeasure,
                                                isRow,
                                                cellSize,
                                                undefined,
                                                childNode.isMeasure,
                                                wrapped);
            if(isLeaf){
                memberCell.addClass(this._crosstab.getId() + "-RowAxisHeader-LeafChild" + rowIndex);
                memberCell.addClass(this._crosstabConstants.LEAF_CHILD_CELL);
            }
        }

        if(memberCell) {
            nodes.push(memberCell);
            isTop = false;
        }
    }

    return {
        rowIndex: rowIndex,
        nodes: nodes,
        totalHeight: totalHeight
    };
};

sap.basetable.crosstab.CrosstabRenderer.prototype._createBottomSection = function (crosstabLayout, leftAreaWidth, rightAreaWidth, rowDimensions, rowTupleRootNode) {
    var contentContainer = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell(this._crosstabConstants.ROW_AXIS_CONTENT_CONTAINER);
    contentContainer.addClass("crosstab-RowAxisContentContainer");
    this._crosstabContainers.setRowAxisContentContainer(contentContainer);

    var contentLayout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rowAxisContent-Content", rightAreaWidth, this._crosstabContainers.getBodyHeight());
    contentLayout.addClass("crosstab-DataArea");
    this._crosstabContainers.setRowAxisContentContent(contentLayout);

    var bottomSection = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("bottomRow", this._crosstabContainers.getBodyHeight());
    bottomSection.addClass("crosstab-BottomSection");

    var totalRows = rowTupleRootNode.numOfLeafChildren ? rowTupleRootNode.numOfLeafChildren : 0;
    var contentRowsMap = [];
    // startRowIndex will be equal to 0 initially for first draw
    // if window resize, must get first index of the page to set leaf children
    var startRowIndex = this._model.getStartRowIndex();
    var numberOfColumnTuples = this._model.getNumberOfTuples(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_ROW_HEIGHT);
    var contentRow;

    // No members on the row axis
    if (totalRows === 0){
        if (rowTupleRootNode.dataPoints && rowTupleRootNode.dataPoints.length > 0) {
            var emptyRowHeight = resizedRows && resizedRows[this._resizingConstants.EMPTY_ROW_TUPLE] ?
                                    resizedRows[this._resizingConstants.EMPTY_ROW_TUPLE] :
                                    this._crosstab.getRowCellHeight();
            contentRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("row0", emptyRowHeight, null, this._getCrosstabContentRowClass(0));
            contentLayout.append(contentRow);
            contentRowsMap[0] = contentRow;
            this._addDataPointsCellsToRow(contentRowsMap, rowTupleRootNode, startRowIndex, numberOfColumnTuples, true, emptyRowHeight, false);
            contentContainer.append(contentLayout);
            bottomSection.append(contentContainer);
        }  else {
            var nowRowAxisHeaderContainer = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("rowAxisHeader-Container");
            this._crosstabContainers.setRowAxisHeaderContainer(nowRowAxisHeaderContainer);
            var noRowHeaderLayout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rowAxisHeader-Content", leftAreaWidth, this._crosstabContainers.getBodyHeight());
            noRowHeaderLayout.addClass("crosstab-RowAxisHeaderContent");
            this._crosstabContainers.setRowAxisHeaderContent(noRowHeaderLayout);
            nowRowAxisHeaderContainer.append(noRowHeaderLayout);
            bottomSection.append(nowRowAxisHeaderContainer);
        }
        crosstabLayout.append(bottomSection);
        return;
    }

    var appendToGrandTotal = false;
    var anchoredGrandTotals = this._model.getGrandTotalNodes(this._crosstabConstants.ROW_AXIS_INDEX);
    var anchoredGrandTotalsLength = anchoredGrandTotals.length;
    this._grandTotalsHeight = this.canGrandTotalsBeAnchored() ? this.getGrandTotalsHeight(this._crosstabConstants.ROW_AXIS_INDEX) : 0;
    this._isEntireGrandTotalsVisible = true;
    this._grandTotalsHeaderWrapper = null;
    this._grandTotalsContentWrapper = null;

    if (anchoredGrandTotalsLength > 0) {
        this._isEntireGrandTotalsVisible = this.calculateBottomSectionHeight(true) <= this._crosstabContainers.getOverallContainerHeight() - this._crosstabContainers.getHeaderHeight();

        if (!this._isEntireGrandTotalsVisible  && this.canGrandTotalsBeAnchored()) {
            appendToGrandTotal = true;
            this._grandTotalsHeaderWrapper = $(document.createElement("div")).addClass(this._crosstabConstants.GRAND_TOTALS);
            this._grandTotalsContentWrapper = $(document.createElement("div")).addClass(this._crosstabConstants.GRAND_TOTALS);
        }
    }

    var totalRowCount = startRowIndex + totalRows;

    for (var rowIndex = startRowIndex; rowIndex < totalRowCount ; rowIndex++) {
        contentRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("row" + rowIndex, null, null, this._getCrosstabContentRowClass(rowIndex));
        contentLayout.append(contentRow);
        contentRowsMap[rowIndex] = contentRow;
    }

    for (; rowIndex < totalRowCount + anchoredGrandTotalsLength; rowIndex++) {
        contentRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("row" + rowIndex, null, null, this._getCrosstabContentRowClass(rowIndex));

        if (appendToGrandTotal) {
            this._grandTotalsContentWrapper.append(contentRow);
        } else {
            contentLayout.append(contentRow);
            contentRowsMap[rowIndex] = contentRow;
        }
        contentRowsMap[rowIndex] = contentRow;
    }

    // copy row tuple root node and append grand totals to it.
    var tempRowTupleRootNode = $.extend({}, rowTupleRootNode, true);

    tempRowTupleRootNode.children = rowTupleRootNode.children.concat(anchoredGrandTotals);
    tempRowTupleRootNode.numOfLeafChildren = rowTupleRootNode.numOfLeafChildren + anchoredGrandTotalsLength;

    var rows = this._addCellsToRow(contentRowsMap, tempRowTupleRootNode, startRowIndex, numberOfColumnTuples, 0, true, this._crosstab.getId() + "-" + this._crosstabConstants.ROW_AXIS_HEADER_CELL, true, undefined);
    var rowAxisHeaderContainer = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("rowAxisHeader-Container");
    if(!this._hasDataPoints(tempRowTupleRootNode) && rightAreaWidth === 0) {
        rowAxisHeaderContainer.addClass("crosstab-RowAxisheaderContainer-noDataPoints");
    } else {
        rowAxisHeaderContainer.addClass("crosstab-RowAxisheaderContainer");
    }

    if ((rightAreaWidth > 0 && leftAreaWidth > 0) || this._hasDataPoints(tempRowTupleRootNode)){
        rowAxisHeaderContainer.addClass("crosstab-RowAxisheaderContainer-blueBars");
    }

    this._crosstabContainers.setRowAxisFloatingHeaderContainer(sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell("rowAxisHeader-FloatingHeadersContainer"));
    var rowAxisFloatingHeaderContainer = this._crosstabContainers.getRowAxisFloatingHeaderContainer();
    rowAxisFloatingHeaderContainer.addClass("crosstab-RowAxisFloatingHeadersContainer");

    var resizedRowColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_COLUMN_WIDTH);
    var leftWidth = 0;
    for (var index = 0; index < rowDimensions.length-1; index++) {
        var floatingCell = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell(this._crosstab.getId()+"-RowAxisFloatingHeader"+index);
        var width = this._crosstab.getRowCellWidth();
        var resizedWidth = resizedRowColumns[rowDimensions[index].id];
        width = resizedWidth ? resizedWidth : width;

        var display = {};
        if (this._crosstabContainers.getHeaderHeight() + this._crosstabContainers.getBodyHeight() < this._crosstabContainers.getOverallContainerHeight()) {
            // Fix for BITVDC25-1809. Hiding floating headers so the right click event gets the correct event.target.
            display = {display: "none"};
        }

        floatingCell.css({
            height: this._crosstab.getRowCellHeight() - this._crosstab.getBorderWidth() + "px",
            width: width + "px",
            top: 0 + "px",
            left: leftWidth + "px"
        });
        floatingCell.css(display);
        leftWidth += width;
        floatingCell.addClass(this._crosstabConstants.FLOATING_CELL + " " + this._crosstabConstants.CELL_CONTENT);
        rowAxisFloatingHeaderContainer.append(floatingCell);
    }
    rowAxisHeaderContainer.append(rowAxisFloatingHeaderContainer);
    this._crosstabContainers.setRowAxisHeaderContainer(rowAxisHeaderContainer);

    var headerLayout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rowAxisHeader-Content", leftAreaWidth, this._crosstabContainers.getBodyHeight());
    headerLayout.addClass("crosstab-RowAxisHeaderContent");
    this._crosstabContainers.setRowAxisHeaderContent(headerLayout);
    for (var nodeIndex = 0; nodeIndex < rows.nodes.length - anchoredGrandTotalsLength ; nodeIndex++){
        headerLayout.append(rows.nodes[nodeIndex]);
    }

    for (;nodeIndex < rows.nodes.length; nodeIndex++) {
        if (appendToGrandTotal) {
            this._grandTotalsHeaderWrapper.append(rows.nodes[nodeIndex]);
        } else {
            headerLayout.append(rows.nodes[nodeIndex]);
        }
    }

    // Fix for BITVDC25-2483
    // It appears PDF export does not respect the z-index of the floating cell.
    // To ensure the floating cell is not covered when the background color is
    // set on the cell underneath, the div rowAxisHeader-FloatingHeadersContainer
    // must be after the div rowAxisHeader-Content.
    rowAxisHeaderContainer.prepend(headerLayout);
     if (this._grandTotalsHeaderWrapper) {
        if (!this._isEntireGrandTotalsVisible) {
            contentLayout.height(contentLayout.height() - this._grandTotalsHeight);
            headerLayout.height(headerLayout.height() - this._grandTotalsHeight);
            var topPositionOfGrandTotals = this._crosstabContainers.getLayout().height() - this._crosstabContainers.getHeaderHeight() - this._grandTotalsHeight - this._crosstabConstants.METADATA_BORDER_HEIGHT;
            this._grandTotalsHeaderWrapper.css({width: leftAreaWidth, top: topPositionOfGrandTotals});
            rowAxisHeaderContainer.append(this._grandTotalsHeaderWrapper);
            this._grandTotalsContentWrapper.css({width: rightAreaWidth, top: topPositionOfGrandTotals});
            if (!crosstabLayout.hasClass("borderBottomWidth")) {
                crosstabLayout.addClass("borderBottomWidth"); // The bottom border must be always visible when anchored total is on.
            }
        }
        this._crosstabContainers.setGrandTotalsHeaderContainer(this._grandTotalsHeaderWrapper);
        this._crosstabContainers.setGrandTotalsContentContainer(this._grandTotalsContentWrapper);
    }
    bottomSection.append(rowAxisHeaderContainer);
    if(this._hasDataPoints(tempRowTupleRootNode)){
        contentContainer.append(contentLayout);
        if (this._grandTotalsContentWrapper) {
            contentContainer.append(this._grandTotalsContentWrapper);
        }
        bottomSection.append(contentContainer);
    }

    crosstabLayout.append(bottomSection);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._addBuffer = function(sectionData){
    var top = sectionData.topBuffer;
    var left = sectionData.leftBuffer;

    if(top === 0) {
        this._crosstabContainers.getLayout().css({top: ""});
    } else {
        this._crosstabContainers.getLayout().css({top: top + "px"});
    }

    if(left === 0) {
        this._crosstabContainers.getLayout().css({left: ""});
    } else {
          this._crosstabContainers.getLayout().css({left: left + "px"});
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._determineSectionsToHide = function(sectionData){
    var leftAreaDimensionHeader = this._crosstabContainers.getLeftAreaDimensionHeaderContainer();
    var rowAxisHeaderContainer = this._crosstabContainers.getRowAxisHeaderContainer();
    var topSectionContainer = this._crosstabContainers.getTopSectionContainer();
    var layout = this._crosstabContainers.getLayout();

    var showLeftAreaDimensionHeader;

    var widthAdjustment, adjustedWidth, heightAdjustment, adjustedHeight;

    if(rowAxisHeaderContainer){
        if(sectionData.showRowAxisHeaders === false && rowAxisHeaderContainer.is(":visible")) {
            widthAdjustment = parseInt(rowAxisHeaderContainer.css("width"));
            adjustedWidth = parseInt(layout.css("width")) - widthAdjustment;
            layout.css({width: adjustedWidth});

            rowAxisHeaderContainer.addClass(this._HIDE_SECTION);
            showLeftAreaDimensionHeader = false;

        } else if(sectionData.showRowAxisHeaders === true && !rowAxisHeaderContainer.is(":visible")){
            rowAxisHeaderContainer.removeClass(this._HIDE_SECTION);
            widthAdjustment = parseInt(rowAxisHeaderContainer.css("width"));
            adjustedWidth = parseInt(layout.css("width")) + widthAdjustment;
            layout.css({width: adjustedWidth});
            showLeftAreaDimensionHeader = true;
        }
    }
    if(sectionData.showColumnAxisHeaders === false && !topSectionContainer.is(":visible")) {
        heightAdjustment = parseInt(topSectionContainer.css("height"));
        adjustedHeight = parseInt(layout.css("height")) - heightAdjustment;
        layout.css({height: adjustedHeight});
        topSectionContainer.addClass(this._HIDE_SECTION);
        showLeftAreaDimensionHeader = false;

    } else if(sectionData.showColumnAxisHeaders === true && !topSectionContainer.is(":visible")) {
        this._crosstabContainers.getTopSectionContainer().removeClass(this._HIDE_SECTION);
        heightAdjustment = parseInt(topSectionContainer.css("height"));
        adjustedHeight = parseInt(layout.css("height")) + heightAdjustment;
        layout.css({height: adjustedHeight});
        showLeftAreaDimensionHeader = true;
    }
    if(leftAreaDimensionHeader){
        if(showLeftAreaDimensionHeader === false && leftAreaDimensionHeader.is(":visible")) {
            leftAreaDimensionHeader.addClass(this._HIDE_SECTION);
        } else if(showLeftAreaDimensionHeader === true && !leftAreaDimensionHeader.is(":visible")){
            leftAreaDimensionHeader.removeClass(this._HIDE_SECTION);
        }
    }

};

sap.basetable.crosstab.CrosstabRenderer.prototype.drawSection = function(sectionData){
    this._drawPostProcessing(sectionData);
    this.redrawFromPageData(sectionData);

    // TODO: currently scroll bars add css properties to content of crosstab; design issue.
    // Since we do not have any scroll bars, we must manually set position absolute
    if(!this._crosstab.isVerticallyScrollable() && !this._crosstab.isHorizontallyScrollable()){
        this._crosstabContainers.getRowAxisContentContent().addClass("crosstab-DataArea-PositionAbsolute ");
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype.redrawFromPageData = function(pageData){
    var rows;
    var rightAreaWidth = 0;
    if(pageData.redrawRowAxisContent){
        if(pageData.redrawColumnHeader){
            this._redrawColumnHeaderContent();
            if(!this._crosstab.isHorizontallyScrollable()) {
                rightAreaWidth = this.calculateRightAreaWidth() + this._CELL_CORRECTION_PIXEL_OFFSET;
            }
        }
        rows = this._redrawRowAxisContentContent();
        if(pageData.redrawRowAxisHeader){
            this._redrawRowAxisHeaderContent(rows);
        }
    }

    // When we resize column in Report, we need to update crosstabLayout width and some other elements' width as we scroll in order to have correct width for current dataset.
    if(rightAreaWidth > 0) {
        this._updateCrosstabLayoutWidth(rightAreaWidth);
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype._redrawRowAxisContentContent = function(){
    var rowTupleRootNode = this._model.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX).rootnode;
    var rightAreaWidth = this.calculateRightAreaWidth();
    this._crosstabContainers.setBodyHeight(this.calculateBottomSectionHeight(false));
    var contentLayout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rowAxisContent-Content", rightAreaWidth, this._crosstabContainers.getBodyHeight());
    contentLayout.addClass("crosstab-DataArea");
    var totalRows = rowTupleRootNode.numOfLeafChildren ? rowTupleRootNode.numOfLeafChildren : 0;
    var contentRowsMap = [];
    var numberOfColumnTuples = this._model.getNumberOfTuples(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var startRowIndex = this._model.getStartRowIndex();
    var contentRow;
    var rows;
    var appendToGrandTotal = false;
    var grandTotalsContentWrapper;
    if (totalRows === 0 && rowTupleRootNode.dataPoints && rowTupleRootNode.dataPoints.length > 0) {
        var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_ROW_HEIGHT);
        var emptyRowHeight = resizedRows && resizedRows[this._resizingConstants.EMPTY_ROW_TUPLE] ?
                                resizedRows[this._resizingConstants.EMPTY_ROW_TUPLE] :
                                this._crosstab.getRowCellHeight();
        contentRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("row0", emptyRowHeight, null, this._getCrosstabContentRowClass(0));
        contentLayout.append(contentRow);
        contentRowsMap[0] = contentRow;
        this._addDataPointsCellsToRow(contentRowsMap, rowTupleRootNode, startRowIndex, numberOfColumnTuples, true, emptyRowHeight, false);
    } else if (totalRows > 0){

        var anchoredGrandTotals = this._model.getGrandTotalNodes(this._crosstabConstants.ROW_AXIS_INDEX);
        var anchoredGrandTotalsLength = anchoredGrandTotals.length;
        this._isEntireGrandTotalsVisible = true;
        this._isGrandTotalsHeightGreaterThanBottomSection = this._grandTotalsHeight >= this._crosstabContainers.getOverallContainerHeight() - this._crosstabContainers.getHeaderHeight();

        if (anchoredGrandTotalsLength > 0) {
            // If there is anchored grand totals, setup grand totals content
            this._isEntireGrandTotalsVisible = this.calculateBottomSectionHeight(true) <=
                                this._crosstabContainers.getOverallContainerHeight() - this._crosstabContainers.getHeaderHeight();
            if (!this._isEntireGrandTotalsVisible  && !this._isGrandTotalsHeightGreaterThanBottomSection) {
                appendToGrandTotal = true;
                grandTotalsContentWrapper = $(document.createElement("div")).addClass(this._crosstabConstants.GRAND_TOTALS);
            }
        }

        var totalRowCount = startRowIndex + totalRows;

        for (var rowIndex = startRowIndex; rowIndex < totalRowCount ; rowIndex++) {
            contentRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("row" + rowIndex, null, null, this._getCrosstabContentRowClass(rowIndex));
            contentLayout.append(contentRow);
            contentRowsMap[rowIndex] = contentRow;
        }

        for (; rowIndex < totalRowCount + anchoredGrandTotalsLength ; rowIndex++) {
            contentRow = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow("row" + rowIndex, null, null, this._getCrosstabContentRowClass(rowIndex));

            if (appendToGrandTotal) {
                 grandTotalsContentWrapper.append(contentRow);
            } else {
                contentLayout.append(contentRow);
                contentRowsMap[rowIndex] = contentRow;
            }
            contentRowsMap[rowIndex] = contentRow;
        }
        // Add content rows first
        rows = this._addCellsToRow(contentRowsMap, rowTupleRootNode, startRowIndex, numberOfColumnTuples, 0, true, this._crosstab.getId() + "-" + this._crosstabConstants.ROW_AXIS_HEADER_CELL, startRowIndex === 0, undefined);
        // Create a separate temp rootNode to hold anchored grand totals, so it is not part of the return value "rows ""
        var tempRowTupleRootNode = {
                tuplePath: "",
                children: []
            };
        tempRowTupleRootNode.children = anchoredGrandTotals;
        tempRowTupleRootNode.numOfLeafChildren = anchoredGrandTotalsLength;
        this._addCellsToRow(contentRowsMap, tempRowTupleRootNode, startRowIndex + totalRows, numberOfColumnTuples, 0, true, this._crosstab.getId() + "-" + this._crosstabConstants.ROW_AXIS_HEADER_CELL, startRowIndex === 0, undefined);
    }
    if (appendToGrandTotal && grandTotalsContentWrapper) {
        // if we need to anchor grand totals setup the css for the grand totals content wrapper
        if (!this._isEntireGrandTotalsVisible) {
            var topPositionOfGrandTotals = this._crosstabContainers.getOverallContainerHeight() - this._crosstabContainers.getHeaderHeight() - this._grandTotalsHeight;
            grandTotalsContentWrapper.css({width: rightAreaWidth, top: topPositionOfGrandTotals, left: 0, position: "absolute"});
        }
        // Replace grand totals content wrapper
        this._crosstabContainers.replaceContainer(grandTotalsContentWrapper, this._crosstabContainers.getGrandTotalsContentContainer());
        this._crosstabContainers.setGrandTotalsContentContainer(grandTotalsContentWrapper);
    }
    var newRowAxisContentContent = this._crosstabContainers.replaceContainer(contentLayout, this._crosstabContainers.getRowAxisContentContent());
    this._crosstabContainers.setRowAxisContentContent(newRowAxisContentContent);
    return rows;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._redrawRowAxisHeaderContent = function (rows) {
    var leftAreaWidth = this.calculateLeftAreaWidth();
    this._crosstabContainers.setBodyHeight(this.calculateBottomSectionHeight(false));
    var headerLayout = sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout("rowAxisHeader-Content", leftAreaWidth, this._crosstabContainers.getBodyHeight());
    headerLayout.addClass("crosstab-RowAxisHeaderContent");
    if (rows && rows.nodes) {
        for (var i = 0; i < rows.nodes.length; i++){
            headerLayout.append(rows.nodes[i]);
        }
    }
    var newRowAxisHeaderContent = this._crosstabContainers.replaceContainer(headerLayout, this._crosstabContainers.getRowAxisHeaderContent());
    this._crosstabContainers.setRowAxisHeaderContent(newRowAxisHeaderContent);
};

sap.basetable.crosstab.CrosstabRenderer.prototype._redrawColumnHeaderContent = function () {
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    var columnDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var columnTupleRootNode = this._model.getTupleTree(this._crosstabConstants.COLUMN_AXIS_INDEX).rootnode;

    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_ROW_HEIGHT);
    var defaultColumnHeight = this._crosstab.getColumnCellHeight();
    var headerHeight;
    if (!this._crosstab.isColumnDimensionHeaderVisible()) {
        headerHeight = this._HIDDEN_DIMENSION_CELL_HEIGHT;
    } else{
        headerHeight = resizedRows && resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] ?
                            resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] :
                            defaultColumnHeight;
    }

    this._crosstabContainers.setHeaderHeight(this.calculateTopSectionHeight());
    var rightAreaWidth = this._incrementWidthIfHorizontalScrollbarVisible(this.calculateRightAreaWidth());
    var startIndex = this._model.getStartColumnIndex();
    var memberHeaderCell = this._createColumnMemberHeaderCell(rightAreaWidth, this._crosstabContainers.getHeaderHeight() - headerHeight + 1, headerHeight,columnDimensions, columnTupleRootNode, startIndex, rowDimensions.length > 0);
    var newColumnHeaderContent = this._crosstabContainers.replaceContainer(memberHeaderCell, this._crosstabContainers.getColumnHeaderContent());
    this._crosstabContainers.setColumnHeaderContent(newColumnHeaderContent);
};

/**
 * Calculates the width of the right area of the crosstab.
 *
 * @param: ofEntireAxis. An optional parameter for when the width of the entire axis is required. Resizing is only considered for the current page
 * @return: The width of the crosstab's right area.
 */
sap.basetable.crosstab.CrosstabRenderer.prototype.calculateRightAreaWidth = function (ofEntireAxis) {
    var rightAreaWidth = 0;
    var columnDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var columnTupleRootNode = this._model.getTupleTree(this._crosstabConstants.COLUMN_AXIS_INDEX).rootnode;
    var resizedColumns = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_COLUMN_WIDTH);
    if (columnTupleRootNode.numOfLeafChildren) {
        var resizedColumnCount = 0;
        for (var resizedElement in resizedColumns) {
            if (this._model.getTupleIndex(this._crosstabConstants.COLUMN_AXIS_INDEX, resizedElement) &&
                    this._model.getTupleDepth(resizedElement) === columnDimensions.length) {
                var tuplePathFrequency = this._model.getTuplePathFrequency(this._crosstabConstants.COLUMN_AXIS_INDEX, resizedElement);
                rightAreaWidth += resizedColumns[resizedElement] * tuplePathFrequency;
                resizedColumnCount += tuplePathFrequency;
            }
        }

        var columnCount;
        if (typeof ofEntireAxis !== "undefined" && ofEntireAxis === true) {
            columnCount = this._model.getFullAxisLength(this._crosstabConstants.COLUMN_AXIS_INDEX);
        } else {
            columnCount = columnTupleRootNode.numOfLeafChildren;
        }

        rightAreaWidth += (columnCount - resizedColumnCount) * this._crosstab.getColumnCellWidth();
    } else {
        // No column is defined, check whether need to have one column for datapoints
        var rowTupleRootNode = this._model.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX).rootnode;
        if (this._hasDataPoints(rowTupleRootNode)) {
            var emptyColDim = this._resizingConstants.EMPTY_COLUMN_DIMENSION;
            rightAreaWidth = resizedColumns[emptyColDim] ? resizedColumns[emptyColDim] : this._crosstab.getColumnCellWidth();
        } else if (columnDimensions.length > 0) {
            rightAreaWidth = columnDimensions.length * this._crosstab.getColumnCellWidth();
        }
    }
    return rightAreaWidth;
};

sap.basetable.crosstab.CrosstabRenderer.prototype.calculateLeftAreaWidth = function () {
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    var resizedRowDimensions = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_COLUMN_WIDTH);
    var numOfResizedColumns = 0;
    var resizedTotalWidth = 0;
    for (var dimensionIndex = 0; dimensionIndex < rowDimensions.length; dimensionIndex++) {
        if (rowDimensions[dimensionIndex].id in resizedRowDimensions) {
            resizedTotalWidth += resizedRowDimensions[rowDimensions[dimensionIndex].id];
            numOfResizedColumns++;
        }
    }
    return (rowDimensions.length - numOfResizedColumns) * this._crosstab.getRowCellWidth() + resizedTotalWidth;
};

sap.basetable.crosstab.CrosstabRenderer.prototype.calculateTopSectionHeight = function () {
    var columnDimensions = this._model.getDimensions(this._crosstabConstants.COLUMN_AXIS_INDEX);
    var defaultCellHeight = this._crosstab.getColumnCellHeight();
    var headerHeight = (!this._crosstab.isColumnDimensionHeaderVisible() && columnDimensions.length > 0) ?
                            columnDimensions.length * defaultCellHeight :
                            (columnDimensions.length + this._HEADER_ROW_COUNT) * defaultCellHeight;


    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.COLUMN_AXIS_ROW_HEIGHT);
    if (!resizedRows) {
        return headerHeight;
    }

    if (resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] && this._crosstab.isColumnDimensionHeaderVisible()) {
        headerHeight += resizedRows[this._resizingConstants.DIMENSION_HEADER_ROW] - defaultCellHeight;
    }

    for (var i = 0; i < columnDimensions.length; i++) {
        if (resizedRows[columnDimensions[i].id]) {
            headerHeight += resizedRows[columnDimensions[i].id] - defaultCellHeight;
        }
    }

    return headerHeight;
};

/**
 * Calculates the height of the bottom section of the crosstab.
 *
 * @return: The height of the crosstab's bottom area.
 */
sap.basetable.crosstab.CrosstabRenderer.prototype.calculateBottomSectionHeight = function (includeGrandTotals) {
    var height = this._getRowsHeight();

    if (includeGrandTotals) {
        height += this.getGrandTotalsHeight(this._crosstabConstants.ROW_AXIS_INDEX);
    }

    return height;
};


/**
 * Calculates the height of the bottom section of the crosstab.
 *
 * @return: The height of the crosstab's bottom area.
 */
sap.basetable.crosstab.CrosstabRenderer.prototype.calculateRowAxisHeight = function () {
    var rowCount = this._model.getFullAxisLength(this._crosstabConstants.ROW_AXIS_INDEX);
    var height = this._getRowsHeight(rowCount);
    return height;
};


/**
 * Calculates the height of the of the given number of rows.
 * @param:  the number of rows to acvcount for in the height. If not supplied the entire rows axis will be used
 * @return: The height of the given rows.
 */
sap.basetable.crosstab.CrosstabRenderer.prototype._getRowsHeight = function(rowCount) {
    var rowTupleRootNode = this._model.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX).rootnode;

    if (rowCount === undefined) {
        rowCount = rowTupleRootNode.numOfLeafChildren;
    }

    var defaultRowHeight = this._crosstab.getRowCellHeight();
    var height = rowCount ? rowCount * defaultRowHeight : 0;

    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._resizingConstants.ROW_AXIS_ROW_HEIGHT);
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);

    // No row is defined. Check if we need a row for datapoints.
    if (rowDimensions.length === 0 && this._hasDataPoints(rowTupleRootNode)) {
        height = resizedRows && resizedRows[this._resizingConstants.EMPTY_ROW_TUPLE] ?
                        resizedRows[this._resizingConstants.EMPTY_ROW_TUPLE] :
                        defaultRowHeight;
    } else if (resizedRows) {
        for (var resizedRow in resizedRows) {
            if (this._model.getTupleIndex(this._crosstabConstants.ROW_AXIS_INDEX, resizedRow) &&
                                    this._model.getTupleDepth(resizedRow) === rowDimensions.length) {
                height += (resizedRows[resizedRow] - defaultRowHeight) *
                                this._model.getTuplePathFrequency(this._crosstabConstants.ROW_AXIS_INDEX, resizedRow);
            }
        }
    }

    return height;
};

sap.basetable.crosstab.CrosstabRenderer.prototype.updateContainerBordersEvent = function(isVertical) {
    var layout = this._crosstabContainers.getLayout();
    if (isVertical) {
        if (!$(layout).hasClass("borderBottomWidth")) {
            layout.addClass("borderBottomWidth");
        } else {
            layout.removeClass("borderBottomWidth");
        }
    } else {
        if (!$(layout).hasClass("borderRightWidth")) {
            layout.addClass("borderRightWidth");
        } else {
            layout.removeClass("borderRightWidth");
        }
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype.redrawFromConditionalFormatting = function() {
   this._redrawRowAxisContentContent();
};

sap.basetable.crosstab.CrosstabRenderer.prototype._updateCrosstabLayoutWidth = function(rightAreaWidth) {
    var crosstab = this._crosstab.container().closest(this._crosstabConstants.UI5_CROSSTAB);
    var leftAreaWidth = 0;
    var leftAreaDimensionHeader = this._crosstabContainers.getLeftAreaDimensionHeaderContainer();
    if (leftAreaDimensionHeader && !leftAreaDimensionHeader.hasClass(this._HIDE_SECTION)) {
        leftAreaWidth = this.calculateLeftAreaWidth() + this._crosstabConstants.METADATA_BORDER_WIDTH;
    }

    var totalWidth = leftAreaWidth + rightAreaWidth;
    if (crosstab && totalWidth > 0) {
        crosstab.find("#crosstabLayout").width(totalWidth);
        crosstab.find("#columnHeaderCell-Content").width(rightAreaWidth);
        crosstab.find("#rightAreaDimensionHeaderCellLayout").width(rightAreaWidth);
    }
};

sap.basetable.crosstab.CrosstabRenderer.prototype.getGrandTotalsHeight = function(axis) {
    var grandTotalsHeight = 0;
    var grandTotalsTuplePaths = this._model.getGrandTotalsTuplePaths(axis);
    var resizedRows = this._crosstab.crosstabElementResizeHandler().getResizedElements(2);

    for (var i = 0; i < grandTotalsTuplePaths.length; i++) {
        if (resizedRows && resizedRows.hasOwnProperty(grandTotalsTuplePaths[i])) {
            grandTotalsHeight += resizedRows[grandTotalsTuplePaths[i]];
        } else {
            grandTotalsHeight += this._crosstab.getRowCellHeight();
        }
    }
    return grandTotalsHeight;
};

sap.basetable.crosstab.CrosstabRenderer.prototype.canGrandTotalsBeAnchored = function() {
    var height = this._crosstab.getHeight();

    if (this._crosstab.isHorizontallyScrollable()) {
        height -= sap.basetable.crosstab.CrosstabContainers.scrollbarOutsideContainerAdjustment;
    }
    var grandTotalsHeight = this.getGrandTotalsHeight(this._crosstabConstants.ROW_AXIS_INDEX);

    return grandTotalsHeight + this._crosstabConstants.ROW_CELL_HEIGHT * 3 < height - this.calculateTopSectionHeight();
};

sap.basetable.crosstab.CrosstabRenderer.prototype._getCrosstabContentRowClass = function(rowIndex) {
    var contentClass = "crosstab-content-row";
    // 0 based index => %2 for odd rows
    if (rowIndex % 2 === 0) {
        contentClass += "-odd";
    } else {
        contentClass += "-even";
    }
    return contentClass;
};

sap.basetable.crosstab.CrosstabRenderer.prototype._isColumnTotal = function(columnIndex) {
    return !!this._columnSubtotals[columnIndex];
};

sap.basetable.crosstab.CrosstabRenderer.prototype._isColumnCount = function(columnIndex) {
    var isColumnCount = false;
    if (this._isColumnTotal(columnIndex)) {
        isColumnCount = this._columnSubtotals[columnIndex].type === this._crosstabConstants.COUNT;
    }
    return isColumnCount;
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabScrollBar");

sap.basetable.crosstab.CrosstabScrollBar = function(crosstab, scrollBarType, crosstabScrollBarEventMediator, scrollAmount, headersforScrollBar) {
    this._scrollBarType = scrollBarType;
    this._crosstabScrollBarEventMediator = crosstabScrollBarEventMediator;
    this._scrollableCellAmount = scrollAmount;
    this._crosstabScrollBarEventConstants = new sap.basetable.crosstab.CrosstabScrollBarEventConstants();
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
    this._crosstab = crosstab;
    this._model = crosstab.model();
    this._selectionHandler = crosstab.selectionHandler();
    this._floatedHeaders = headersforScrollBar;
    this._isHorizontalScrolling = (this._scrollBarType === this._crosstabConstants.HORIZONTAL);
    this._isVerticalScrolling = (this._scrollBarType === this._crosstabConstants.VERTICAL);
    this._isPageable = (this._scrollBarType !== this._crosstabConstants.ROW_AXIS_HEADER);
    this._crosstabElementResizedEventConstants = new sap.basetable.crosstab.CrosstabElementResizedEventConstants();
    this._positionMap = [];
    this._endPageThresholdIndex = null;
    this._lastScrollWindowTupleTree = null;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype = {
    _ScrollBarContainer: null,
    _ScrollBarContainerSpan: null,
    _ScrollBarTrack: null,
    _ScrollBarTrackPiece: null,
    _bodyContainer: null,
    _bodyScrollable: null,
    _headerContainer: null,
    _headerScrollable: null,
    _floatingHeadersScrollable: null,
    _parentContainerSize: null,
    _scrollableContentSize: null,
    _scrollBarSize: null,
    _pagingRequestLimit: null,
    _nextPageEventFired: false,
    _axisIndex: 0,
    _scrollbarStepAmount: 0,
    _totalScrollBarSteps: null,
    _scrollableContent: null,
    _fullAxisLength: null,
    _fullAxisLengthPixels: null,
    _pageSize: null,
    _pageSizeInPixels: null,
    _startPageIndex: null,
    _endPageIndex: null,
    _previousPosition: null,
    _currentStartIndex: null,
    _atLastPage: false,
    _atFirstPage: false,
    _scrollBarMinSize: 15,
    _showEnd: false,
    _touchScrollData: {
        startX: null,
        startY: null,
        endX: null,
        endY: null
    },
    _MINIMUM_FLOATING_HEADER_WIDTH: 28,
    _MINUMUM_VISIBILITY : 1.5,
    REGEXP_LEAF : /\bLeafChild(\d*)/
};

/**
 * Initializes the Scrollbar
 *
 * @param scrollAreas: Object {
 *      "bodyContainer": the container for the body content you want to scroll
 *      "bodyContent": the scrollable content within the body container
 *      "headerContainer": the container for the header area you want to scroll
 *      "headerContent": the scrolable content within the header area you want to scroll
 *      "floatingHeaders": any floating headers that also need to be scrollable
 *      "fullContainer": the full container containing the body container and the header container (the mouse wheel event listener)
 *  }
 * @param offsetTop: the scrollbars offset from the top
 * @param offsetLeft: the scrollbars offset from the left
 * @param numOfMembers: Number of rows(horizontal scrollbars) or columns(vertical scrollbars) in the scrollable content
 * @param pageSize: size fo the data page in the content
 * @alignAtBeginning: true or false whether to align the scrollbar at beginning (if false align at end)
 */
sap.basetable.crosstab.CrosstabScrollBar.prototype.initializeScrollBar = function (scrollAreas, offsetProperties, numOfMembers, pageSize, alignAtBeginning, updateData, numOfGrandTotals, grandTotalsHeight, appendToGrandTotal){
    this._numOfGrandTotals = numOfGrandTotals;
    this._appendToGrandTotal = appendToGrandTotal;
    this._grandTotalsHeight = this._appendToGrandTotal ? grandTotalsHeight : 0;
    this._setFullAxisLength(numOfMembers);
    this._setFullAxisLengthPixels();
    if(this._isPageable){
        this._setPageSize(pageSize);
        this._setPageSizeInPixels();
    }
    this._setBodyScrollable(scrollAreas.bodyContent);
    this._setBodyContainer(scrollAreas.bodyContainer);
    this._setHeaderScrollable(scrollAreas.headerContent);
    this._setHeaderContainer(scrollAreas.headerContainer);

    if (scrollAreas.grandTotalsHeaderContainer) {
        this._setGrandTotalsHeaderScrollable(scrollAreas.grandTotalsHeaderContainer);
    }
    if (scrollAreas.grandTotalsContentContainer) {
        this._setGrandTotalsContentScrollable(scrollAreas.grandTotalsContentContainer);
    }

    if(scrollAreas.floatingHeaders){
        this.setScrollableFloatingHeaders(scrollAreas.floatingHeaders);
    }
    this._calculatePositionMap();
    this._setScrollableContent();
    this._setupScrollBar(offsetProperties.Top, offsetProperties.Left);
    this._setPositions(alignAtBeginning);
    // positionData is defined when window resize otherwise only if pageable define those properties
    if (updateData.eventData) {
        this._setShowEnd(updateData.eventData.showEnd);
        this.updateFromExternalEvent(updateData);
    } else if (this._isPageable) {
        this._setEndPageIndex();
        this._setStartPageIndex();
        this._setCurrentStartIndex();
    }

    this._updateResizeBarVisibility(scrollAreas.headerContent, scrollAreas.bodyContent);
    this._setMouseWheelEvent($(scrollAreas.bodyContainer).add(scrollAreas.headerContainer).add(this._ScrollBarContainer));
    this._setScrollBarTouchEvents();
    this._updateFloatedHeaders();
    this._registerCrosstabTouchEvent();
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateResizeBarVisibility = function(headerContent, bodyContent) {
    if (this._grandTotalsHeaderScrollable || this._grandTotalsContentScrollable) {
        var grandTotalsContainer = this._grandTotalsHeaderScrollable ? this._grandTotalsHeaderScrollable : this._grandTotalsContentScrollable;

        if ($(grandTotalsContainer).is(':visible')) {
            headerContent.find(".crosstab-resizable-row:hidden").show();
            $(headerContent.find(".crosstab-resizable-row").toArray().filter(function(resizer) {
                return $(resizer).offset().top > grandTotalsContainer.offset().top;
            }.bind(this))).hide();
            bodyContent.find(".crosstab-resizable-row:hidden").show();
            $(bodyContent.find(".crosstab-resizable-row").toArray().filter(function(resizer) {
                return $(resizer).offset().top > grandTotalsContainer.offset().top;
            }.bind(this))).hide();
        }
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._registerCrosstabTouchEvent = function() {
    var eventType;
    switch(this._scrollBarType) {
    case this._crosstabConstants.HORIZONTAL:
        eventType = this._crosstabScrollBarEventConstants.touchCrosstabHorizontalScrollBarEvent;
        break;

    case this._crosstabConstants.VERTICAL:
        eventType = this._crosstabScrollBarEventConstants.touchCrosstabVerticalScrollBarEvent;
        break;

    case this._crosstabConstants.ROW_AXIS_HEADER:
        eventType = this._crosstabScrollBarEventConstants.touchCrosstabRowAxisScrollBarEvent;
        break;

    default:
        throw "Invalid Crosstab Touch Event Type";
    }
    this._crosstabScrollBarEventMediator.subscribe(eventType, this._doTouchScroll.bind(this));
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doTouchScroll = function(event) {
    // If resizing, scrolling should be prevented
    if (this._crosstab.crosstabElementResizeHandler().isResizing()) {
        return;
    }

    this._atLastPage =  this._isLastPage();
    this._atFirstPage =  this._isFirstPage();

    this._adjustIndexUpOrDown(event.scrollBarAction === this._crosstabConstants.DECREASE_AXIS);
    if (event.direction === this._crosstabConstants.VERTICAL) {
        this._updateScrollPositionAndContent(this._crosstabConstants.POSITION_TOP);
    } else {
        this._updateScrollPositionAndContent(this._crosstabConstants.POSITION_LEFT);
    }

    if (this._isRowScrollScroll) {
        this._doPaging(false);
    } else if(this._isVerticalScrolling) {
        this._doPaging(true);
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setScrollBarTouchEvents = function(){
    if (window.TouchEvent) { // TouchEvent supported by Chrome and Safari
        $(this._ScrollBarTrackPiece).bind("touchstart touchmove touchend",function(event){
            this._handleScrollBarTouch(event);
        }.bind(this));
    }

    // No need to handle PointerEvent for the scroll track piece because the
    // compatible mouse event will be dispatched afterwards.
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._handleScrollBarTouch = function(event) {
    var firstTouch = event.changedTouches[0];

    var eventType;
    switch(event.type)
    {
      case "touchstart":
        eventType = "mousedown";
        break;

      case "touchmove":
        eventType = "mousemove";
        break;

      case "touchend":
        eventType = this._crosstabConstants.MOUSE_UP;
        break;
    }

    // We are dispatching an equivalent mouse event.
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(eventType, true, true, window, 1, firstTouch.screenX, firstTouch.screenY, firstTouch.clientX, firstTouch.clientY, false, false, false, false, 0/*left*/, null);
    firstTouch.target.dispatchEvent(simulatedEvent);

};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setFullAxisLength = function(fullAxisLength) {
    this._fullAxisLength = fullAxisLength;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setFullAxisLengthPixels = function(){
    var renderer = this._crosstab.getRenderer();
    if (this._isPageable) {
        this._fullAxisLengthPixels = this._isHorizontalScrolling ? renderer.calculateRightAreaWidth(true) : renderer.calculateRowAxisHeight();
    } else {
        this._fullAxisLengthPixels = renderer.calculateLeftAreaWidth();
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setPageSize = function(pageSize) {
    this._pageSize = pageSize;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setPageSizeInPixels = function() {
    this._pageSizeInPixels  = this._pageSize * this._scrollableCellAmount;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setBodyScrollable = function(bodyScrollable) {
    this._bodyScrollable = bodyScrollable;
    $(bodyScrollable).addClass("crosstab-scrollableContent");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setBodyContainer = function(bodyContainer) {
    this._bodyContainer = bodyContainer;
    $(bodyContainer).addClass("crosstab-scrollableContainer");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setHeaderScrollable= function(headerScrollable) {
    this._headerScrollable = headerScrollable;
    $(headerScrollable).addClass("crosstab-scrollableContent");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setHeaderContainer = function(headerContainer) {
    this._headerContainer = headerContainer;
    $(headerContainer).addClass("crosstab-scrollableContainer");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setScrollableFloatingHeaders = function(scrollableHeaders) {
    this._floatingHeadersScrollable = scrollableHeaders;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setScrollableContent  = function () {
    this._scrollableContent = $(this._bodyScrollable).add(this._headerScrollable).add(this._grandTotalsHeaderScrollable).add(this._grandTotalsContentScrollable);
    //In the case of row axis scrolling, also move the floating headers div
    if(this._floatingHeadersScrollable){
        this._scrollableContent = this._scrollableContent.add(this._floatingHeadersScrollable);
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setGrandTotalsHeaderScrollable = function(grandTotalsHeaderScrollable) {
    this._grandTotalsHeaderScrollable = grandTotalsHeaderScrollable;
    $(grandTotalsHeaderScrollable).addClass("crosstab-scrollableContent");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setGrandTotalsContentScrollable = function(grandTotalsContentScrollable) {
    this._grandTotalsContentScrollable = grandTotalsContentScrollable;
    $(grandTotalsContentScrollable).addClass("crosstab-scrollableContent");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setPositions = function (alignAtBeginning){
    this._setCSSForScrollableContent(alignAtBeginning);
    this.setCSSForTrackPiece(alignAtBeginning);
    this.setCSSForFloatingHeaders();
    this.setCSSForContainers();
};

/* This method is used to set the CSS for scrollable content. It is called in only two places, from initializeScrollBars() where alignAtBeginning is defined
 * and updateScrollBar() where it is not. Scrollable Content's position is set to absolute before setting top/left because in _getScrollableContentPosition()
 * we need to get the current height/width of the scrollable content. This is because after we redraw from paging, position of scrollable content
 * is no longer absolute. In this method, this._getScrollableContentPosition() is only called from updateScrollBar()
 *
 * @param alignAtBeginning: This variable is set only when this method is called from initializeScrollBar() in CrosstabScrollRenderer. It is equal to true
 *                          for vertical and horizontal scrollbars and false for rowAxisHeader scrollbar
 */
sap.basetable.crosstab.CrosstabScrollBar.prototype._setCSSForScrollableContent = function(alignAtBeginning){
    $(this._scrollableContent).css({position: "absolute"});
    var contentPosition;
    if(alignAtBeginning === true){
        contentPosition = 0;
    }else if(alignAtBeginning === false){
        this._setShowEnd(true);
        contentPosition = (this._scrollableContentSize-this._parentContainerSize);
    } else{
        contentPosition = this._getScrollableContentPosition();
    }
    if(this._isVerticalScrolling){
        if (!this._appendToGrandTotal && this._showEnd) {
            contentPosition -= this._grandTotalsHeight;
        }
        $(this._scrollableContent).not(this._grandTotalsHeaderScrollable).not(this._grandTotalsContentScrollable).css({top: -(contentPosition)});
    } else{
        $(this._scrollableContent).css({left: -(contentPosition)});
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setShowEnd = function(showEnd){
    if(this._showEnd !== showEnd && this._isPageable && this._numOfGrandTotals === 0){
        this._crosstabScrollBarEventMediator.publish(this._crosstabScrollBarEventConstants.borderEvent, this._isVerticalScrolling);
    }
    this._showEnd = showEnd;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getShowEnd = function(){
    return this._showEnd;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setCSSForFloatingHeaders = function(){
    if (this._floatingHeadersScrollable){
        $(this._floatingHeadersScrollable).css({top: 0});
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setCSSForContainers = function(){
    $(this._headerContainer).css({position: "relative", overflow: "hidden"});
    $(this._bodyContainer).css({position: "relative", overflow: "hidden"});
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setCSSForTrackPiece = function(alignAtBeginning){
    var trackPeicePosition = alignAtBeginning ? 0 : (this._parentContainerSize-this._scrollBarSize);
    if(this._isVerticalScrolling){
        $(this._ScrollBarTrackPiece).css({top: trackPeicePosition});
    } else{
        $(this._ScrollBarTrackPiece).css({left: trackPeicePosition});
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setupScrollBar = function(offsetTop, offSetLeft){
    this.setupContainer();
    this.setScrollBarSizeRelativeToContent();
    this.setupTrack(offsetTop, offSetLeft);
    this.setupTrackPiece();
    this._ScrollBarTrack.append(this._ScrollBarTrackPiece);
    this._ScrollBarContainerSpan.append(this._ScrollBarTrack);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setupContainer = function(){
    this._ScrollBarContainer = $(document.createElement("div"));
    this._ScrollBarContainerSpan = $(document.createElement("span"));
    this._ScrollBarContainer.append(this._ScrollBarContainerSpan);
    this._ScrollBarContainer.addClass("crosstab-scroll");
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setupTrack = function(offsetTop, offSetLeft){
    this._ScrollBarTrack = $(document.createElement("div"));
    var trackStyle = "top: " + offsetTop + "px; left: " + offSetLeft + "px;";
    var scrollTrackSize = this._parentContainerSize + "px";
    if(this._isVerticalScrolling){
         /* TODO: CSS changes are applied using javascript in order to support safari on iPad.
        When we use a class on Scroll Bar Track the css is not applied from style sheet on safari*/
        trackStyle += "position: absolute; border-radius: 2.5px; width: 20px;" + "height: " + scrollTrackSize;
        $(this._ScrollBarTrack).addClass("vertical-Scroll-Bar-Track");
    } else{
        /* TODO: CSS changes are applied using javascript in order to support safari on iPad.
        When we use a class on Scroll Bar Track Piece the css is not applied from style sheet  on safari*/
        trackStyle += "position: absolute; border-radius: 2.5px; height: 20px;" + "width: " + scrollTrackSize;
        $(this._ScrollBarTrack).addClass("horizontal-Scroll-Bar-Track");
    }
    this._ScrollBarTrack.attr("style", trackStyle);
    // Make sure nothing is animated before allowing another click action
    $(this._ScrollBarTrack).click(function(e) {
        if(!($(this._bodyScrollable).is(":animated")) && !($(this._ScrollBarTrackPiece).is(":animated")) && !($(this._headerScrollable).is(":animated")))
        {
            var scrollBarTrackElement = this._ScrollBarTrack.context;
            var scrollBarTrackPieceElement = this._ScrollBarTrackPiece.context;
            var topScrollBarPosition = scrollBarTrackPieceElement.offsetTop;
            var leftScrollBarPosition = scrollBarTrackPieceElement.offsetLeft;
            if(e.target === scrollBarTrackElement){
                // make sure click is not where track piece is already located
                if(this._isVerticalScrolling && (e.offsetY < topScrollBarPosition || e.offsetY > (scrollBarTrackPieceElement.offsetHeight + topScrollBarPosition))){
                    this._doVerticalClickScroll(e, scrollBarTrackPieceElement.offsetTop, scrollBarTrackPieceElement.offsetHeight);
                } else if(!this._isVerticalScrolling && (e.offsetX < leftScrollBarPosition || e.offsetX > (scrollBarTrackPieceElement.offsetWidth + leftScrollBarPosition))){
                    this._doHorizontalClickScroll(e, scrollBarTrackPieceElement.offsetWidth, scrollBarTrackPieceElement.offsetLeft);
                }
            }
         }
    }.bind(this));
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.enforceMinScrollbarSize = function(){
    var sizeAdjustment = 0;
    if(this._scrollBarSize < this._scrollBarMinSize){
        sizeAdjustment = this._scrollBarMinSize - this._scrollBarSize;
        this._scrollBarSize = this._scrollBarMinSize;
    }

    return sizeAdjustment;
};

// set scroll bar size relative to data, Also sets container and scrollable sizes
sap.basetable.crosstab.CrosstabScrollBar.prototype.setScrollBarSizeRelativeToContent = function(){
    var sizeAdjustment = 0;
    this._scrollableContentSize = this._fullAxisLengthPixels;
    var containerHeight = parseInt(this._bodyContainer[0].style.height, 10);
    containerHeight = containerHeight > this._grandTotalsHeight && this._appendToGrandTotal ? containerHeight - this._grandTotalsHeight : containerHeight;
    this._parentContainerSize = this._isVerticalScrolling ? containerHeight : parseInt(this._bodyContainer[0].style.width, 10);
    this._scrollBarSize = this._parentContainerSize / (this._scrollableContentSize /this._parentContainerSize);
    sizeAdjustment = this.enforceMinScrollbarSize();
    this._setScrollBarTotalSteps();
    this._setScrollBarStepAmount(sizeAdjustment);
};

// How much a cell (scrollable content) is represented in scroll Bar pixels
sap.basetable.crosstab.CrosstabScrollBar.prototype._setScrollBarStepAmount = function(sizeAdjustment){
    this._scrollBarStepAmount = (this._parentContainerSize - sizeAdjustment - this._scrollBarSize) / this._totalScrollBarSteps;
};

/**
 * Total scrollbar steps is calculated by the full axis length minus how many row/columns fit in the last window.
 * Therefore, we must cumulatively add the cell sizes starting from the last member until it no longer fits in the container window
 * This information is obtained by fetching the last scroll window tuple tree
*/
sap.basetable.crosstab.CrosstabScrollBar.prototype._setScrollBarTotalSteps = function() {
    if (this._isPageable) {
        this._calculateTotalStepsForPageableScrollbar();
    } else { // Case for Row Axis Scrollbar
        var lastWindowSize = 0;
        for (var k = this._fullAxisLength; k >= 0; k--) {
            if (lastWindowSize > this._parentContainerSize) {
                this._totalScrollBarSteps = k + 1;
                break;
            }
            lastWindowSize += (this._positionMap[k] - this._positionMap[k-1]);
        }
    }
};

// Sets the endPageIndex AND the endPageThresholdIndex which is the endPageIndex minus the buffer of visible cells that fit within the scroll container
sap.basetable.crosstab.CrosstabScrollBar.prototype._setEndPageIndex = function (endPageIndex){
    this._endPageIndex = endPageIndex ? endPageIndex : this._pageSize - 1; // endPageIndex doesn't exist upon scrollbar initialization. set to default page size index instead.;
    // case for when we are at last page, set endPageThresholdIndex to unreachable index so we cannot page any further
    if (this._endPageIndex >= this._fullAxisLength - 1) {
        this._endPageThresholdIndex = this._totalScrollBarSteps + 1;
        return;
    }
    // calculate buffer size by adding cumulative cell size backwards from the endPageIndex until it is larger than the container
    var cumulativeBufferSize = 0;
    var bufferAxisIndex = this._endPageIndex;
    var endPagePosition = this._positionMap[bufferAxisIndex];
    while(this._positionMap[bufferAxisIndex] !== undefined) {
        cumulativeBufferSize = endPagePosition - this._positionMap[bufferAxisIndex];
        if (cumulativeBufferSize > this._parentContainerSize) {
            break;
        } else {
            bufferAxisIndex--;
        }
    }
    this._endPageThresholdIndex = bufferAxisIndex + 1;
};

// An asynchronous callback dispatched from _calculateTotalStepsForPageableScrollbar
// Sets the tuple tree needed to calculate the total scrollbar steps
// Traverses the tree in reverse-order to calculate the number of steps that fit within the last window
sap.basetable.crosstab.CrosstabScrollBar.prototype._setLastScrollWindowTupleTree = function(coordinates, tupleTrees) {
    this._lastScrollWindowTupleTree = tupleTrees;
    var resizeHandler = this._crosstab.crosstabElementResizeHandler();
    this._lastWindowSize = 0;
    var startTupleNode;
    var resizedElements;
    var defaultCellSize;
    var startAxisIndex = this._fullAxisLength - 1;
    if (this._isHorizontalScrolling) {
        startTupleNode = this._lastScrollWindowTupleTree[this._crosstabConstants.COLUMN_AXIS_INDEX].rootnode;
        defaultCellSize = this._crosstab.getColumnCellWidth();
        resizedElements = resizeHandler.getResizedElements(this._crosstabElementResizedEventConstants.COLUMN_AXIS_COLUMN_WIDTH);
    } else {
        startTupleNode = this._lastScrollWindowTupleTree[this._crosstabConstants.ROW_AXIS_INDEX].rootnode;
        defaultCellSize = this._crosstab.getRowCellHeight();
        resizedElements = resizeHandler.getResizedElements(this._crosstabElementResizedEventConstants.ROW_AXIS_ROW_HEIGHT) || {};
    }
    this._calculateTotalStepsFromTuple(startTupleNode, startAxisIndex, defaultCellSize, resizedElements);
};

// Dispatches a callback function that sets the last scroll window tuple tree. Assumes minimum cell sizes when creating coordinates
sap.basetable.crosstab.CrosstabScrollBar.prototype._calculateTotalStepsForPageableScrollbar = function() {
    var renderer = this._crosstab.getRenderer();
    var minimumCellSize = this._isHorizontalScrolling ? renderer.MINIMUM_RESIZED_CELL_WIDTH : renderer.MINIMUM_RESIZED_CELL_HEIGHT;
    // minimum possible index that can fit in last scroll window assuming all cells are resized to minimum size
    var startIndex = Math.max(this._fullAxisLength - Math.ceil(this._parentContainerSize/minimumCellSize), 0);
    var coords = {
        endColumnIndex: 0,
        endRowIndex: 0,
        startColumnIndex: 0,
        startRowIndex: 0
    };
    if (this._isHorizontalScrolling) {
        coords.startColumnIndex = startIndex;
        coords.endColumnIndex = this._fullAxisLength - 1;
    } else {
        coords.startRowIndex = startIndex;
        coords.endRowIndex = this._fullAxisLength - 1;
    }
    this._model.fetchTupleTrees(coords, this._setLastScrollWindowTupleTree.bind(this));
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._calculateTotalStepsFromTuple = function(node, index, defaultCellSize, resizedElements) {
    // if the starting index is 0, only one row/column is rendered. Therefore, totalScrollBarSteps is set to 1
    if (index === 0) {
        this._totalScrollBarSteps = 1;
        return;
    }
    for (var i = node.children.length - 1; i >= 0 && this._lastWindowSize < this._parentContainerSize; i--) {
        var childNode = node.children[i];
        if (childNode.children.length > 0) {
            index = this._calculateTotalStepsFromTuple(childNode, index, defaultCellSize, resizedElements);
        } else {
            if (resizedElements[childNode.tuplePath]) {
                this._lastWindowSize += resizedElements[childNode.tuplePath];
            } else {
                this._lastWindowSize += defaultCellSize;
            }
            if (this._lastWindowSize >= this._parentContainerSize) {
                this._totalScrollBarSteps = index + 1;
                return;
            }
            index--;
        }
    }
    return index;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setStartPageIndex = function (startPageIndex) {
    if(startPageIndex){
        this._startPageIndex = startPageIndex;
        if (this._fullAxisLength < this._pageSize){
            this._startPageIndex = -1;
        } else if(this._startPageIndex <= 0 && !this._atFirstPage ){
            this._startPageIndex = 0;
        } else if(this._startPageIndex <= 0 && this._atFirstPage){
            this._startPageIndex = -1;
        }
    } else{
        this._startPageIndex = -1;
    }
};

// Returns container of scroll bar to attach
sap.basetable.crosstab.CrosstabScrollBar.prototype.getContainer = function(){
    return this._ScrollBarContainer;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.setupTrackPiece = function(){
    this._ScrollBarTrackPiece = $(document.createElement("div"));
    var trackPieceStyle = "";
    if(this._isVerticalScrolling){
        /* TODO: CSS changes are applied using javascript in order to support safari on iPad.
        When we use a class on Scroll Bar Track Piece the css is not applied from style sheet on safari*/
        trackPieceStyle += "background: #9d9c9c; position: absolute !important; border-radius: 2.5px; top: 0px; right: 5px; width: 7px;";
        trackPieceStyle += "height: " + this._scrollBarSize + "px;";
        $(this._ScrollBarTrackPiece).addClass("vertical-Scroll-Bar-Track-Piece");
        $(this._ScrollBarTrackPiece).draggable({
            axis: "y",
            containment: "parent",
            drag: this._doVerticalStepScroll.bind(this),
            stop: this._doVerticalStepScroll.bind(this)
        });
    } else{
        /* TODO: CSS changes are applied using javascript in order to support safari on iPad.
        When we use a class on Scroll Bar Track Piece the css is not applied from style sheet on safari*/
        trackPieceStyle += "background: #9d9c9c; border-radius: 2.5px; position: absolute !important; left: 0px; bottom: 5px; height: 7px;";
        trackPieceStyle += "width: " + this._scrollBarSize + "px;";
        $(this._ScrollBarTrackPiece).addClass("horizontal-Scroll-Bar-Track-Piece");
        $(this._ScrollBarTrackPiece).draggable({
            axis: "x",
            containment: "parent",
            drag: this._doHorizontalStepScroll.bind(this),
            stop: this._doHorizontalStepScroll.bind(this)
        });
    }
    this._ScrollBarTrackPiece.attr("style", trackPieceStyle);
};

// Used by the mousewheel and trackpad.
sap.basetable.crosstab.CrosstabScrollBar.prototype._setMouseWheelEvent = function(mousewheelTarget){
    if (this._isVerticalScrolling) {
        mousewheelTarget.mouseenter(function() {
            this._crosstab.getDispatch().crosstableMousedOver({
                crosstab: {
                    mousedOver: true
                }
            });
        }.bind(this));

        mousewheelTarget.mouseleave(function() {
            this._crosstab.getDispatch().crosstableMousedOver({
                crosstab: {
                    mousedOver: false
                }
            });
        }.bind(this));
    }

    $(mousewheelTarget).bind("wheel", function(e){
        if (this._crosstab.crosstabElementResizeHandler().isResizing()) {
            return;
        }
        var isVerticalScrolling =  this._isWheelScrollVertical(e);
        this._atLastPage =  this._isLastPage();
        this._atFirstPage =  this._isFirstPage();
        if(this._isVerticalScrolling && isVerticalScrolling) {
            this._adjustIndexUpOrDown(e.originalEvent.deltaY < 0);
            this._updateScrollPositionAndContent(this._crosstabConstants.POSITION_TOP);
        } else if (!this._isVerticalScrolling && !isVerticalScrolling) {
            this._adjustIndexUpOrDown(e.originalEvent.deltaX < 0);
            this._updateScrollPositionAndContent(this._crosstabConstants.POSITION_LEFT);
        }

        if(this._isPageable && this._isVerticalScrolling && isVerticalScrolling){
            this._doPaging(true);
        } else if (this._isPageable && !this._isVerticalScrolling && !isVerticalScrolling) {
            this._doPaging(false);
        }
    }.bind(this));
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._isWheelScrollVertical = function(e){
    // Trackpads can have x and y delta changes at the same time, determine which one is mostly changing and scroll in that direction.
    return Math.abs(e.originalEvent.deltaX) < Math.abs(e.originalEvent.deltaY);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._adjustIndexUpOrDown = function(isUp){
    if(isUp){
        this._setAxisIndex(this._axisIndex - 1);
        this._setShowEnd(false);
    } else {
        this._setAxisIndex(this._axisIndex + 1);
        this._checkShowEnd();
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateScrollPositionAndContent = function(orientation){
    this._updateScrollBarTrackPiecePosition(orientation);
    this._updateScrollableContentPosition(orientation);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doVerticalStepScroll = function(){
    var scrPos = $(this._ScrollBarTrackPiece).position().top / this._crosstab.getScaleFactor();
    var bottom = Math.round(scrPos + $(this._ScrollBarTrackPiece).outerHeight(true));
    if(bottom === this._parentContainerSize){
        this._setShowEnd(true);
    } else{
        this._setShowEnd(false);
    }
    var tempScrollBarCurrentStep = Math.round(scrPos/this._scrollBarStepAmount);
    this._setAxisIndex(tempScrollBarCurrentStep);
    this._checkShowEnd();
    this._atLastPage = this._isLastPage();
    this._atFirstPage = this._isFirstPage();
    this._updateScrollableContentPosition(this._crosstabConstants.POSITION_TOP);
    this._doPaging(true);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doHorizontalStepScroll = function(){
    var scrPos = $(this._ScrollBarTrackPiece).position().left / this._crosstab.getScaleFactor();
    var right = Math.round(scrPos + $(this._ScrollBarTrackPiece).outerWidth(true));
    if (this._parentContainerSize <= right){
        this._setShowEnd(true);
    } else{
        this._setShowEnd(false);
    }
    var tempScrollBarCurrentStep = Math.round(scrPos/this._scrollBarStepAmount);
    this._setAxisIndex (tempScrollBarCurrentStep);
    this._checkShowEnd();
    this._atLastPage = this._isLastPage();
    this._atFirstPage = this._isFirstPage();
    this._updateScrollableContentPosition(this._crosstabConstants.POSITION_LEFT);
    this._doPaging(false);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doVerticalClickScroll = function(clickEvent, scrollBarOffsetTop, scrollBarOffsetHeight){
    if (clickEvent.offsetY < scrollBarOffsetTop) {
        this._setAxisIndex(this._axisIndex -1);
        this._setShowEnd(false);
    } else if (clickEvent.offsetY > (scrollBarOffsetTop + scrollBarOffsetHeight)) {
        this._setAxisIndex(this._axisIndex + 1);
        this._checkShowEnd();
    }
    this._atLastPage =  this._isLastPage();
    this._atFirstPage =  this._isFirstPage();
    this._doPaging(true);
    this._doScrollAnimation(this._crosstabConstants.POSITION_TOP);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doHorizontalClickScroll = function(clickEvent, scrollBarOffsetWidth, scrollBarOffsetLeft){
    if (clickEvent.offsetX < scrollBarOffsetLeft) {
        this._setAxisIndex(this._axisIndex -1);
        this._setShowEnd(false);
    } else if (clickEvent.offsetX > (scrollBarOffsetWidth + scrollBarOffsetLeft)) {
        this._setAxisIndex(this._axisIndex + 1);
        this._checkShowEnd();
    }
    this._atLastPage =  this._isLastPage();
    this._atFirstPage =  this._isFirstPage();
    this._doPaging(false);
    this._doScrollAnimation(this._crosstabConstants.POSITION_LEFT);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._checkShowEnd = function() {
    if (this._axisIndex === this._totalScrollBarSteps){
        this._setShowEnd(true);
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doScrollAnimation = function(orientation){
    var contentAnimation = {};
    var trackPieceAnimation = {};
    var scrollBarPosition= this._getScrollBarPosition();
    var scrollOffset = this._getScrollableContentPosition();
    contentAnimation[orientation] = -scrollOffset;
    trackPieceAnimation[orientation] = scrollBarPosition;
    if (orientation === this._crosstabConstants.POSITION_LEFT) {
        $(this._scrollableContent).animate(contentAnimation, "fast");
    } else {
        $(this._scrollableContent).not(this._grandTotalsHeaderScrollable).not(this._grandTotalsContentScrollable).animate(contentAnimation, "fast");
    }

    $(this._ScrollBarTrackPiece).animate(trackPieceAnimation, "fast");

    if (this._floatedHeaders.length > 0) {
        // orientation guranteed to be "top" or "left"
        var scrollMarginalOffset = -scrollOffset - parseInt(this._scrollableContent.css(orientation), 10);
        var floatingHeaderAnimation = {
            orientation: orientation,
            scrollMarginalOffset: scrollMarginalOffset
        };
        this._updateFloatedHeaders(floatingHeaderAnimation);
    }

    this._updateResizeBarVisibility(this._headerScrollable, this._bodyScrollable);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateScrollableContentPosition = function(orientation){
    var scrollOffset = this._getScrollableContentPosition();
    var cssUpdate = {};
    cssUpdate[orientation] = -scrollOffset;
    if (orientation === this._crosstabConstants.POSITION_LEFT) {
        $(this._scrollableContent).css(cssUpdate);
    } else {
        $(this._scrollableContent).not(this._grandTotalsHeaderScrollable).not(this._grandTotalsContentScrollable).css(cssUpdate);
    }

    if (this._floatedHeaders.length > 0){
        this._updateFloatedHeaders();
    }

    this._updateResizeBarVisibility(this._headerScrollable, this._bodyScrollable);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateScrollBarTrackPiecePosition = function(orientation){
    var scrollBarPosition;
    var cssUpdate = {};
    scrollBarPosition = this._getScrollBarPosition();
    cssUpdate[orientation] = scrollBarPosition;
    $(this._ScrollBarTrackPiece).css(cssUpdate);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._getScrollableContentPosition = function() {
    if(this._showEnd){
        if(this._isVerticalScrolling){
            return parseInt(this._bodyScrollable[0].style.height, 10) - this._parentContainerSize;
        }
        return parseInt(this._bodyScrollable[0].style.width, 10) - this._parentContainerSize;
    }
    return this._getScrollableContentPositionFromAxisIndex();
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._getScrollableContentPositionFromAxisIndex = function() {
    return this._positionMap[this._axisIndex];
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._getScrollBarPosition = function() {
    if(this._showEnd){
        return this._parentContainerSize - this._scrollBarSize;
    } else{
        return this._axisIndex * this._scrollBarStepAmount;
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._doPaging = function(isVertical) {
    if(!this._isPageable){
        return;
    }
    if (isVertical) {
        this._model.setVerticalScrollPosition(this._axisIndex);
    } else {
        this._model.setHorizontalScrollPosition(this._axisIndex);
    }
    if(this._axisIndex >= this._endPageThresholdIndex || this._axisIndex <= this._startPageIndex){
        this.firePagingEvent();
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.firePagingEvent = function() {
    var pageData = this._getPageData();
    this._crosstabScrollBarEventMediator.publish(this._crosstabScrollBarEventConstants.nextPageEvent, pageData);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._isLastPage = function(){
    if(this._axisIndex >= this._totalScrollBarSteps){
        return true;
    }
    return false;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._isFirstPage = function(){
    if(this._axisIndex === 0){
        return true;
    }
    return false;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._clearFloatedHeader = function(currentIndex){
    this._floatedHeaders[currentIndex].$headerDom.text("");
    this._floatedHeaders[currentIndex].$headerDom.attr("title", "");
    this._floatedHeaders[currentIndex].$headerDom.removeClass(this._selectionHandler.SELECTED_CELL_CLASS);
    this._floatedHeaders[currentIndex].referenceId = null;
    if (this._floatedHeaders[currentIndex].lastCellParsed){
        $(this._floatedHeaders[currentIndex].lastCellParsed[0].childNodes[0]).css({
            opacity: "1"
        });
    }
    this._floatedHeaders[currentIndex].lastCellParsed = null;
};


sap.basetable.crosstab.CrosstabScrollBar.prototype._updateFloatedHeaders = function(floatingHeaderAnimation){
    // Update the _floatedHeaders if any exist. Note: it is necessary to check for the
    // length here to avoid accessing an undefined referenceId below. (See issue BITVDC25-1080.)
    if (this._floatedHeaders.length > 0) {
        var branchTupleIds = this._getHeaderTupleIds();
        if(branchTupleIds.tupleIndex !== undefined) {
            for (var header = branchTupleIds.tupleIndex.length - 1; header >= 0; header--) {
                var newId = branchTupleIds.prefix;
                for (var i = 0; i <= header; i++) {
                    newId = newId + "_" + branchTupleIds.tupleIndex[i];
                }

                var isHeaderVisible = this._setFloatingHeaderSizeAtScrollEnd(newId, header, floatingHeaderAnimation);

                // restore hidden header
                var removeHideHeader = false;
                if (this._floatedHeaders[header].$headerDom.hasClass(this._crosstabConstants.UNDER_FLOATING_HEADER)) {
                    this._floatedHeaders[header].$headerDom.removeClass(this._crosstabConstants.UNDER_FLOATING_HEADER);
                    removeHideHeader = true;
                }

                // reset floating header if: new id is different; header is not visible; when we need to restore the hidden header; we lose our cell reference due to resizing
                if (this._floatedHeaders[header].referenceId !== newId || !isHeaderVisible || removeHideHeader || !this._floatedHeaders[header].lastCellParsed) {
                    this._resetFloatingHeader(header, newId, floatingHeaderAnimation, isHeaderVisible, removeHideHeader);
                }
            }
        }
    }
    if (!this._showEnd) {
        // We only want to update the size of a floating header when it is not at the end of the crosstab
        this._updateFloatedHeadersSize();
    }
};

/**
 * sets floating header to new size at scroll end
 * @returns whether floated header is visible
 */
sap.basetable.crosstab.CrosstabScrollBar.prototype._setFloatingHeaderSizeAtScrollEnd = function(newId, header, floatingHeaderAnimation) {
    if (!this._showEnd) {
        if (this._isVerticalScrolling) {
            this._floatedHeaders[header].$headerDom.css({top: "0px"});
        }
        return true;
    }
    var nextCell = $("#" + newId);
    var newSize = this._calculateFloatingHeaderSizeAtShowEnd(nextCell, header, floatingHeaderAnimation);
    if (this._isHorizontalScrolling) {
        this._floatedHeaders[header].$headerDom.css({width: newSize});
        // is floating header visible? (greater than minimum width)
        if (parseInt(this._floatedHeaders[header].$headerDom[0].style.width, 10) < this._MINIMUM_FLOATING_HEADER_WIDTH) {
            return false;
        }
    } else {
        this._floatedHeaders[header].$headerDom.css({height: newSize});
        // if less than minimum cell height, enforce minimum height and adjust cell top position
        if (newSize < this._scrollableCellAmount) {
            this._floatedHeaders[header].$headerDom.css({height: this._scrollableCellAmount});
            var floatedHeaderTopAdjustment = newSize - this._scrollableCellAmount;
            this._floatedHeaders[header].$headerDom.css({top: floatedHeaderTopAdjustment + "px"});
        }
    }
    return true;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._calculateFloatingHeaderSizeAtShowEnd = function(nextCell, header, floatingHeaderAnimation) {
    var newSize;
    if (floatingHeaderAnimation) {
        var floatingHeaderDom = this._floatedHeaders[header].$headerDom;
        var previousFloatingHeaderSize = this._isHorizontalScrolling ? floatingHeaderDom.outerWidth() : floatingHeaderDom.outerHeight();
        newSize = previousFloatingHeaderSize + floatingHeaderAnimation.scrollMarginalOffset;
    } else {
        var headerFirstLeaf = nextCell.parent().find("." + this._crosstabConstants.LEAF_CHILD_CELL + ":first");
        // Find leafPosition (e.g. find '69' from ui5crosstab1-ColumnHeader-LeafChild69)
        var leafPosition = this.REGEXP_LEAF.exec(headerFirstLeaf[0].className)[1];
        var headerStartingPosition = this._positionMap[leafPosition - 1];
        var dimensionType = this._isHorizontalScrolling ? "width" : "height";
        var endPosition = parseInt(this._bodyScrollable[0].style[dimensionType], 10) - this._parentContainerSize;
        newSize = parseInt(nextCell[0].style[dimensionType], 10) - endPosition + headerStartingPosition;
    }
    return newSize;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateFloatedHeadersSize = function(){
    if (this._floatedHeaders.length > 0) {
        var branchTupleIds = this._getHeaderTupleIds();
        if (branchTupleIds.tupleIndex !== undefined) {
            var floatingHeaderId = branchTupleIds.prefix;
            var leafChildPrefix = branchTupleIds.prefix.split("-")[0];
            leafChildPrefix += this._isHorizontalScrolling ? "-ColumnHeader-LeafChild" : "-RowAxisHeader-LeafChild";
            var lastTupleIndex = branchTupleIds.tupleIndex.length - 1;
            for (var i = 0; i <= lastTupleIndex; i++) {
                floatingHeaderId = floatingHeaderId + "_" + branchTupleIds.tupleIndex[i];
                var firstLeafId = floatingHeaderId;
                for (var j = 0; j <= lastTupleIndex - i; j++) {
                    // find floating header's first leaf
                    firstLeafId = firstLeafId + "_0";
                }
                var leafDiv = $("#"+firstLeafId+"-div")[0];
                var leafIndex = 0;
                for (var k = 0; k <= leafDiv.classList.length - 1; k++) {
                    if (leafDiv.classList[k].indexOf(leafChildPrefix) >= 0) {
                        // find leaf number from class name (e.g. get 88 from ui5crosstab1-ColumnHeader-LeafChild88")
                        leafIndex = leafDiv.classList[k].split(leafChildPrefix)[1] - 1;
                        break;
                    }
                }
                var currentPixelPos = this._positionMap[this._axisIndex];
                var unseenFloatingHeaderSize = currentPixelPos - this._positionMap[leafIndex];
                var newFloatingHeaderSize;
                // referenceCellHeight will reference the cell span height if it is wrapped
                var referenceCellHeight = parseInt($("#" + this._floatedHeaders[i].referenceId)[0].childNodes[0].style.height);
                if (this._isHorizontalScrolling) {
                    newFloatingHeaderSize = parseInt($("#" + floatingHeaderId)[0].style.width) - unseenFloatingHeaderSize;
                    this._floatedHeaders[i].$headerDom.css({width: newFloatingHeaderSize});
                    if (this._floatedHeaders[i].$headerDom.hasClass("crosstab-word-wrap")) {
                        this._floatedHeaders[i].$headerDom.css({height: referenceCellHeight});
                    }
                } else {
                    newFloatingHeaderSize = parseInt($("#" + floatingHeaderId)[0].style.height) - unseenFloatingHeaderSize;
                    if (this._floatedHeaders[i].$headerDom.hasClass("crosstab-word-wrap")) {
                        newFloatingHeaderSize = Math.min(referenceCellHeight, newFloatingHeaderSize);
                    }
                    this._floatedHeaders[i].$headerDom.css({height: newFloatingHeaderSize});
                }
            }
        }
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getFloatedHeaders = function() {
    return this._floatedHeaders;
};

/**
 * Gets the current top headers tuple indices so that we can select each of the headers in the
 * header area dom branch and make them floated headers  *
 *
 * @return prefix: prefix from the leaf child's Id which can be used to rebuild the Id's of all members
 *                 on the branch
 * @return tupleIndex: array of indeces of the header at that level of the tree relative to its parent's children
                       ex. tupleIndex[0] = 0 refers to the first header level's first child
 */
sap.basetable.crosstab.CrosstabScrollBar.prototype._getHeaderTupleIds = function() {
    var childSelector;
    var prefix;
    var branchTupleIds;
    var currentLeaf;
    if (this._isVerticalScrolling) {
        childSelector = "." + this._crosstab.getId() + "-RowAxisHeader-LeafChild";
    } else {
        childSelector = "." + this._crosstab.getId() + "-ColumnHeader-LeafChild";
    }

    var nextChildIndex = this._axisIndex;
    if (!this._showEnd) {
        nextChildIndex++;
    }
    currentLeaf = $(childSelector + nextChildIndex);

    if (currentLeaf.length > 0) {
        branchTupleIds = currentLeaf[0].id.split("_");
        prefix = branchTupleIds[0];
        branchTupleIds.splice(0, 1);
        branchTupleIds.splice(-1,1);
    }

    return {
        prefix: prefix,
        tupleIndex: branchTupleIds
    };
};

/** TODO: Refactor Floating Headers to take into account of redrawing crosstab. Currently when we redraw a new page, the ids are changed causing
 * the floating headers to hold stale/inaccurate data. ReferenceId and lastCellParsed are no longer referring to the correct elements.
 * Until we update floating headers every time we redraw crosstab, there is a workaround in place.
 *
 * Set the floating header to reflect the new cell it has moved to float over. We also need to set the opacity of
 * the new cell's text so that it is invisble and the last cell the floating header was floating over's text to visible.
 * This is because if we do not make the new cell's text invisible, both layers of text are visible and the text appears bolded
 * Add class to cell under floating header(newCellSpan) which this is used for pdf export. Also remove class from cell not floated anymore.
 *
 * @param currentIndex: The index of the member in the floating headers array to modify
 * @param newId: The id of the cell that the flaoting header has moved to float over
 * @param floatingHeaderAnimation: An object containing information of how to animate the floating headers when click scrolling
 * @param isHeaderVisible: A Boolean determining whether the floating header is visible
 * @param removeHideHeader: A Boolean determining if the header that is hidden needs to be unhidden
 */
sap.basetable.crosstab.CrosstabScrollBar.prototype._resetFloatingHeader = function(currentIndex, newId, floatingHeaderAnimation, isHeaderVisible, removeHideHeader){
    var newCell = $("#" + newId);
    this._floatedHeaders[currentIndex].referenceId = newId;
    var newCellSpan = $(newCell[0].childNodes[0]);
    if (floatingHeaderAnimation) {
        var isForwardScroll = floatingHeaderAnimation.scrollMarginalOffset < 0;
        var animationProperties = {};
        animationProperties[floatingHeaderAnimation.orientation] = floatingHeaderAnimation.scrollMarginalOffset;
        if (!isForwardScroll) { // backward scroll - replaceFloatingHeader first, then animate
            this._floatedHeaders[currentIndex].$headerDom.css(floatingHeaderAnimation.orientation, 0 - floatingHeaderAnimation.scrollMarginalOffset + "px");
            animationProperties[floatingHeaderAnimation.orientation] = 0;
            this._replaceFloatingHeader(currentIndex, newCell, newCellSpan, isHeaderVisible, removeHideHeader);
        }
        this._floatedHeaders[currentIndex].$headerDom.stop(true);
        this._floatedHeaders[currentIndex].$headerDom.animate(animationProperties, {
                duration: "fast",
                complete: function() {
                    this._floatedHeaders[currentIndex].$headerDom.css(floatingHeaderAnimation.orientation, "0px");
                    if (isForwardScroll) { // forward scroll - animate first, then replaceFloatingHeader
                        this._replaceFloatingHeader(currentIndex, newCell, newCellSpan, isHeaderVisible, removeHideHeader);
                    }
                }.bind(this)
            });
    } else {
        this._replaceFloatingHeader(currentIndex, newCell, newCellSpan, isHeaderVisible, removeHideHeader);
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._replaceFloatingHeader = function(currentIndex, newCell, newCellSpan, isHeaderVisible, isFloatingHeaderAppearing) {
    // to avoid overlapping, hide floating header if its less than min width
    if (!isHeaderVisible) {
        this._floatedHeaders[currentIndex].$headerDom.addClass(this._crosstabConstants.UNDER_FLOATING_HEADER);
        return;
    }

    /* workaround: since we get span style from the cell that is will be floated and use it for floating header element, we must remove class.
       Special check in case it was not removed due to re writing the dom elements. This "removeClass()" can be deleted once
       $(this._floatedHeaders[currentIndex].lastCellParsed[0].childNodes[0]).removeClass(this._crosstabConstants.UNDER_FLOATING_HEADER) is guaranteed to work.
    */
    newCellSpan.removeClass(this._crosstabConstants.UNDER_FLOATING_HEADER);
    var newCellSpanStyle = newCellSpan.attr("class");
    newCellSpan.addClass(this._crosstabConstants.UNDER_FLOATING_HEADER);

    var newText = newCell.text();
    this._floatedHeaders[currentIndex].$headerDom.text(newText);
    this._floatedHeaders[currentIndex].$headerDom.attr("class", "crosstab-FloatingCell " + newCellSpanStyle);
    this._floatedHeaders[currentIndex].$headerDom.attr("title", newText);
    if (newCell.hasClass(this._selectionHandler.SELECTED_CELL_CLASS)) {
        this._floatedHeaders[currentIndex].$headerDom.addClass(this._selectionHandler.SELECTED_CELL_CLASS);
    } else {
        this._floatedHeaders[currentIndex].$headerDom.removeClass(this._selectionHandler.SELECTED_CELL_CLASS);
    }

    if (this._floatedHeaders[currentIndex].lastCellParsed && !this._showEnd && !isFloatingHeaderAppearing) {
        var id = this._floatedHeaders[currentIndex].lastCellParsed.attr("id");
        var lastCell = $("#" + id);
        if (lastCell.length > 0) {
            // Although we fetched a new section of data, ids of cells still remain the same.
            // Therefore, we need to update lastCellParsed with the same id again to have it reference the correct element.
            $(lastCell[0].childNodes[0]).removeClass(this._crosstabConstants.UNDER_FLOATING_HEADER);
        }
    }

    this._floatedHeaders[currentIndex].lastCellParsed = newCell;
};

/* resets the opacity for a cell underneath a floating header to 0. This is for an issue where a new page
    event is fired and rewrites the DOM, erasing the opacity setting which causes overlapping text of a
    floating header and the cell underneath */
sap.basetable.crosstab.CrosstabScrollBar.prototype.resetCellOpacityUnderFloatingHeader = function() {
    for (var i = 0; i <= this._floatedHeaders.length; i++) {
        var floatedHeader = this._floatedHeaders[i];
        if (floatedHeader !== undefined && floatedHeader.referenceId !== undefined) {
            var newCell = $("#"+floatedHeader.referenceId);
            if (newCell[0] !== undefined && !this._showEnd) {
                $(newCell[0].childNodes[0]).addClass(this._crosstabConstants.UNDER_FLOATING_HEADER);
                var newText = newCell.text();
                floatedHeader.$headerDom.text(newText);
                floatedHeader.$headerDom.attr("title", newText);
            }
        }
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._calculatePositionMap = function() {
    this._positionMap = [];
    this._cumulativePosition = 0;
    if (this._isPageable) {
        var tupleRootNode;
        var startAxisIndex;
        if (this._isHorizontalScrolling) {
            tupleRootNode = this._model.getTupleTree(this._crosstabConstants.COLUMN_AXIS_INDEX).rootnode;
            startAxisIndex = this._model.getStartColumnIndex();
        } else {
            tupleRootNode = this._model.getTupleTree(this._crosstabConstants.ROW_AXIS_INDEX).rootnode;
            startAxisIndex = this._model.getStartRowIndex();
        }
        this._calculatePositionMapFromTuple(tupleRootNode, startAxisIndex);
    } else {
        this._calculatePositionMapFromDimensions();
    }
    // position map has length zero when empty dimension row/column is resized large enough
    if (this._positionMap.length === 0) {
        this._positionMap[0] = 0;
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._calculatePositionMapFromTuple = function(node, index) {
    var resizedElements;
    var resizeHandler = this._crosstab.crosstabElementResizeHandler();
    var defaultCellSize;
    if (this._isHorizontalScrolling) {
        resizedElements = resizeHandler.getResizedElements(this._crosstabElementResizedEventConstants.COLUMN_AXIS_COLUMN_WIDTH);
        defaultCellSize = this._crosstab.getColumnCellWidth();
    } else {
        resizedElements = resizeHandler.getResizedElements(this._crosstabElementResizedEventConstants.ROW_AXIS_ROW_HEIGHT) || {};
        defaultCellSize = this._crosstab.getRowCellHeight();
    }
    for (var i = 0; i < node.children.length; i++) {
        var childNode = node.children[i];
        if (childNode.children.length > 0) {
            index = this._calculatePositionMapFromTuple(childNode, index);
        } else {
            index++;
            this._positionMap[index - 1] = this._cumulativePosition;
            if (resizedElements[childNode.tuplePath]) {
                this._cumulativePosition += resizedElements[childNode.tuplePath];
            } else {
                this._cumulativePosition += defaultCellSize;
            }
        }
    }
    return index;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._calculatePositionMapFromDimensions = function() {
    var rowDimensions = this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX);
    var resizedElements = this._crosstab.crosstabElementResizeHandler().getResizedElements(this._crosstabElementResizedEventConstants.ROW_AXIS_COLUMN_WIDTH);
    for (var i = 0; i < rowDimensions.length; i++) {
        this._positionMap[i] = this._cumulativePosition;
        var tuplePath = rowDimensions[i].id;
        if (resizedElements[tuplePath]) {
            this._cumulativePosition += resizedElements[tuplePath];
        } else {
            this._cumulativePosition += this._crosstab.getRowCellWidth();
        }
    }
    // Add the position at the end of the last cell (content length)
    this._positionMap[rowDimensions.length] = this._cumulativePosition;
};

/**
 * This function is called when an external event occurs such as conditional formatting, window resize, new page event or update axis length
 * This function will update the scroll bars accordingly.
 *
 * @param updateData: Is a JSON object that contains type, event data and containers
 */
sap.basetable.crosstab.CrosstabScrollBar.prototype.updateFromExternalEvent = function(updateData){
    var updateMethod = this._getUpdateHandler(updateData.type);
    updateMethod.apply(this, [updateData]);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._getUpdateHandler = function(type){
    var updateMethod;
    if(type === this._crosstabScrollBarEventConstants.updateAxisLength){
        updateMethod = this._updateAxisLengthEvent;
    } else if(type === this._crosstabScrollBarEventConstants.conditionalFormatEvent){
        updateMethod = this._conditionalFormatEvent;
    } else if(type === this._crosstabScrollBarEventConstants.newPageEvent){
        updateMethod = this._newPageEvent;
    } else if(type === this._crosstabScrollBarEventConstants.windowResize){
        updateMethod = this._windowResizeEvent;
    } else if(type === this._crosstabScrollBarEventConstants.newSectionEvent) {
        updateMethod = this._newSectionEvent;
    }
    return updateMethod;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._newPageEvent = function(updateData){
    this._updateScrollableAreas(updateData);
    this._calculatePositionMap();
    if(this._isPageable){
        var endPageIndex;
        var startPageIndex;
        var currentStartIndex;
        if(this._isVerticalScrolling){
            currentStartIndex = updateData.eventData.coordinates.startRowIndex;
            endPageIndex = updateData.eventData.coordinates.endRowIndex;
            startPageIndex = updateData.eventData.coordinates.startRowIndex;
        } else{
            currentStartIndex = updateData.eventData.coordinates.startColumnIndex;
            endPageIndex = updateData.eventData.coordinates.endColumnIndex;
            startPageIndex = updateData.eventData.coordinates.startColumnIndex;
        }
        this._setEndPageIndex(endPageIndex);
        this._setStartPageIndex(startPageIndex);
        this._setCurrentStartIndex(currentStartIndex);
    }
    this._setScrollableContent();
    this._setCSSForScrollableContent();
    if(this._floatedHeaders.length > 0){
        //To ensure that the floating headers are reset for the new page, we must must clear the
        //referenceId's before calling _updateFloatedHeaders (see BITVDC25-1904).
        for (var i = 0; i < this._floatedHeaders.length; i++) {
            this._floatedHeaders[i].referenceId = null;
        }
        this._updateFloatedHeaders();
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._conditionalFormatEvent = function(updateData){
    this._setBodyScrollable(updateData.containers.rowAxisContentContent);

    this._setScrollableContent();
    this._setCSSForScrollableContent();
    if(this._floatedHeaders.length > 0){
        this._updateFloatedHeaders();
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._newSectionEvent = function(updateData){
    this._updateScrollableAreas(updateData);
    // After drawing new section in crosstab, we must update custom horizontal scroll bars
    if(this._isPageable && this._isHorizontalScrolling && this._crosstab.isHorizontallyScrollable()){
        this._setEndPageIndex(updateData.eventData.coordinates.endColumnIndex);
        this._setStartPageIndex(updateData.eventData.coordinates.startColumnIndex);
        this._setCurrentStartIndex(updateData.eventData.coordinates.startColumnIndex);
    }
    this._calculatePositionMap();
    this._setScrollableContent();
    this._setCSSForScrollableContent();
    if(this._floatedHeaders.length > 0){
        this._updateFloatedHeaders();
    }
};


sap.basetable.crosstab.CrosstabScrollBar.prototype._windowResizeEvent = function (updateData){
    if (updateData.eventData.showEnd) {
        this._setAxisIndex(this._totalScrollBarSteps);
    } else {
        this._setAxisIndex(updateData.eventData.currentPosition);
    }
    if(this._isPageable){
        this._setCurrentStartIndex(updateData.eventData.currentStartIndex);
        this._setEndPageIndex(updateData.eventData.endPageIndex);
        this._setStartPageIndex(updateData.eventData.startPageIndex);
    }
    var orientation;
    if(this._isVerticalScrolling){
        orientation = this._crosstabConstants.POSITION_TOP;
    } else{
        orientation = this._crosstabConstants.POSITION_LEFT;
    }
    this._checkShowEnd();
    this._updateScrollPositionAndContent(orientation);
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateAxisLengthEvent = function(updateData){
    var orientation;
    this._setFullAxisLength(updateData.eventData.length);
    this._setFullAxisLengthPixels();
    this.setScrollBarSizeRelativeToContent();
    this._updateScrollBarSize();
    orientation = this._isVerticalScrolling ? this._crosstabConstants.POSITION_TOP : this._crosstabConstants.POSITION_LEFT;
    this._updateScrollPositionAndContent(orientation);
    if(this._floatedHeaders.length > 0){
        this._updateFloatedHeaders();
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._updateScrollableAreas = function(updateData) {
    if(this._isVerticalScrolling){
        this._setHeaderScrollable(updateData.containers.rowAxisHeaderContent);
        this._setBodyScrollable(updateData.containers.rowAxisContentContent);
    } else if(!this._isVerticalScrolling && this._isPageable){
        this._setHeaderScrollable(updateData.containers.columnHeaderContent);
        this._setBodyScrollable(updateData.containers.rowAxisContentContent);
        if (updateData.containers.grandTotalsContentContainer) {
            this._setGrandTotalsContentScrollable(updateData.containers.grandTotalsContentContainer);
        }
    } else if(!this._isVerticalScrolling && !this._isPageable){
        this._setBodyScrollable(updateData.containers.rowAxisHeaderContent);
    }
};


sap.basetable.crosstab.CrosstabScrollBar.prototype._updateScrollBarSize = function(){
    if(this._isVerticalScrolling){
        $(this._ScrollBarTrackPiece).height(this._scrollBarSize);
    } else{
        $(this._ScrollBarTrackPiece).width(this._scrollBarSize);
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setCurrentStartIndex = function(currentStartIndex) {
    if(currentStartIndex){
        this._currentStartIndex = currentStartIndex;
    } else{
        this._currentStartIndex = 0;
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._getPageData = function(){
    var pageData = {
        redrawRowAxisHeader : null,
        redrawRowAxisContent : null,
        redrawColumnHeader : null,
        coordinates : {
            startRowIndex : null,
            startColumnIndex : null,
            endRowIndex : null,
            endColumnIndex : null
        }
    };
    if(this._isVerticalScrolling){
        pageData.redrawRowAxisHeader = true;
        pageData.redrawRowAxisContent = true;
        pageData.redrawColumnHeader = false;
    } else{
        pageData.redrawRowAxisHeader = false;
        pageData.redrawRowAxisContent = true;
        pageData.redrawColumnHeader = true;
    }
    return pageData;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getAxisIndex = function(){
    return this._axisIndex;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype._setAxisIndex = function(newAxisIndex){
    if(newAxisIndex > this._totalScrollBarSteps){
        this._axisIndex = this._totalScrollBarSteps;
    } else if(newAxisIndex >= 0){
        this._axisIndex = newAxisIndex;
    }
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getCurrentStartIndex = function(){
    return this._currentStartIndex;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getEndPageIndex = function(){
    return this._endPageIndex;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getStartPageIndex = function(){
    return this._startPageIndex;
};

sap.basetable.crosstab.CrosstabScrollBar.prototype.getIsPageable = function(){
    return this._isPageable;
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.CrosstabScrollBarController");

sap.basetable.crosstab.CrosstabScrollBarController = function (crosstab, crosstabScrollBarEventMediator, crosstabScrollBarEventConstants) {
    this._crosstab = crosstab;
    this._crosstabContainers = this._crosstab.crosstabContainers();
    this._crosstabScrollBarEventMediator = crosstabScrollBarEventMediator;
    this._crosstabScrollBarEventConstants = crosstabScrollBarEventConstants;
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
    this._measuresScrollData = null;
    this._isResetingMeasuresScrollData = false;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype = {
    _horizontalScrollBar : null,
    _verticalScrollBar : null,
    _rowAxisHeaderScrollBar : null,
    _touchScrollData: {
        startX: null,
        startY: null,
        endX: null,
        endY: null
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.draw = function (scrollDataRequired, scrollBarVisibility) {
    var updateData;
    if (scrollBarVisibility.horizontalScrollBar) {
        var horizontalScrollData = this._getScrollData(scrollDataRequired, this._horizontalScrollBar);
        if (this._measuresScrollData && this._measuresScrollData.axis === this._crosstabConstants.COLUMN) {
            horizontalScrollData = this._measuresScrollData;
        }
        updateData = this.getScrollBarUpdateData(this._crosstabScrollBarEventConstants.windowResize, horizontalScrollData);
        this.addHorizontalScrollBar(scrollBarVisibility.isVerticallyScrollable, updateData);
    } else {
        this._horizontalScrollBar = null;
    }

    if (scrollBarVisibility.verticalScrollBar) {
        var verticalScrollData = this._getScrollData(scrollDataRequired, this._verticalScrollBar);
        if (this._measuresScrollData && this._measuresScrollData.axis === this._crosstabConstants.ROW) {
            verticalScrollData = this._measuresScrollData;
        }
        updateData = this.getScrollBarUpdateData(this._crosstabScrollBarEventConstants.windowResize, verticalScrollData);
        this.addVerticalScrollBar(scrollBarVisibility.horizontalScrollBar, updateData);
    } else {
        this._verticalScrollBar = null;
    }

    if(scrollBarVisibility.rowAxisHeaderScrollBar){
        var rowAxisHeaderScrollData = this._getScrollData(scrollDataRequired, this._rowAxisHeaderScrollBar);
        updateData = this.getScrollBarUpdateData(this._crosstabScrollBarEventConstants.windowResize, rowAxisHeaderScrollData);
        this.addRowAxisHeaderScrollBar(scrollBarVisibility.isVerticallyScrollable, updateData);
    } else {
        this._rowAxisHeaderScrollBar = null;
    }

   if (this._measuresScrollData) {
        if (!this._isResetingMeasuresScrollData) {
            var dispatch = this._crosstab.getDispatch();
            this._isResetingMeasuresScrollData = true;
            // Reset the measuresScrollData viz property if it was used once
            dispatch.crosstablePropertyChange({
                properties: {
                    crosstab: {
                        measuresScrollData: []
                    }
                },
                userInteraction: false,
                trigger: "CrosstabScrollBarController"
            });
            this._isResetingMeasuresScrollData = false;
        } else {
            this._measuresScrollData = null;
        }
    }
};

// TODO: attaching same event for horizontal and vertical, how can we reduce duplciate event
sap.basetable.crosstab.CrosstabScrollBarController.prototype.attachCrosstabTouchEvents = function(scrollBarVisibility) {
    if (scrollBarVisibility.horizontalScrollBar) {
        this._setCrosstabTouchEvents($(this._crosstabContainers.getRowAxisContentContainer(), this._crosstabContainers.getColumnHeaderContainer()));
    }
    if (scrollBarVisibility.verticalScrollBar) {
        this._setCrosstabTouchEvents($(this._crosstabContainers.getRowAxisContentContainer(), this._crosstabContainers.getRowAxisHeaderContainer()));
    }
    if (scrollBarVisibility.rowAxisHeaderScrollBar) {
        this._setCrosstabTouchEvents($(this._crosstabContainers.getRowAxisHeaderContainer(), this._crosstabContainers.getLeftAreaDimensionHeaderContainer()));
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._setCrosstabTouchEvents = function(touchTarget){
    if (window.PointerEvent) { // PointerEvent supported by IE 11
        $(touchTarget).bind("pointerdown pointermove pointerup", function(event){
            if (event.originalEvent.pointerType === "touch") {
                this._handleTouch(event);
            }
        }.bind(this));
    } else if (window.TouchEvent) { // TouchEvent supported by Chrome and Safari
        $(touchTarget).bind("touchstart touchmove touchend", function(event){
            this._handleTouch(event);
        }.bind(this));
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._handleTouch = function(event){
    var firstTouch;
    if (window.PointerEvent) {
        firstTouch = event.originalEvent;
    } else {
        firstTouch = event.changedTouches[0];
    }

    var eventType;

    switch(event.type) {
    case "pointerdown":
    case "touchstart":
        this._touchScrollData.startX = firstTouch.pageX;
        this._touchScrollData.startY = firstTouch.pageY;
        break;

    case "pointermove":
    case "touchmove":
        eventType = "mousemove";
        this._touchScrollData.endX = this._touchScrollData.startX - firstTouch.pageX;
        this._touchScrollData.endY = this._touchScrollData.startY - firstTouch.pageY;

        var absDeltaY = Math.abs(this._touchScrollData.endY);
        var absDeltaX = Math.abs(this._touchScrollData.endX);

        var moveDirection;
        // Touch move threshold before we issue a wheel event to scroll by 1 row/column
        if (absDeltaY > this._crosstabConstants.TOUCH_THRESHOLD || absDeltaX > this._crosstabConstants.TOUCH_THRESHOLD) {
            if (absDeltaY > absDeltaX) {
            moveDirection = this._crosstabConstants.VERTICAL;
            } else if (absDeltaY < absDeltaX) {
            moveDirection = this._crosstabConstants.HORIZONTAL;
            }
        }
        break;
    }

    if(eventType === "mousemove" && moveDirection) {

        var originalEvent;
        var scrollBarAction;

        if(moveDirection === this._crosstabConstants.VERTICAL) {
            // touchScrollData.endY is negative when motion of finger is down and will scroll page up
            // If finger motion is down, wheel scroll is up
            scrollBarAction = this._touchScrollData.endY < 0 ? this._crosstabConstants.DECREASE_AXIS : this._crosstabConstants.INCREASE_AXIS;
        } else{
            // touchScrollData.endX is negative when motion of finger is right and will scroll page left
            // If finger motion is right, wheel scroll is left
            scrollBarAction = this._touchScrollData.endX < 0 ? this._crosstabConstants.DECREASE_AXIS : this._crosstabConstants.INCREASE_AXIS;
        }

        originalEvent = {
            isTouch: true,
            direction: moveDirection,
            scrollBarAction: scrollBarAction
        };

        this._touchScrollData.startX = firstTouch.pageX;
        this._touchScrollData.startY = firstTouch.pageY;

        var touchEventType = null;
        var currentTarget = event.currentTarget;

        if ($(currentTarget).is($(this._crosstabContainers.getRowAxisContentContainer()))) {
            if(moveDirection === this._crosstabConstants.VERTICAL) {
                touchEventType = this._crosstabScrollBarEventConstants.touchCrosstabVerticalScrollBarEvent;
            } else{
                touchEventType = this._crosstabScrollBarEventConstants.touchCrosstabHorizontalScrollBarEvent;
            }
        } else if ($(currentTarget).is($(this._crosstabContainers.getRowAxisHeaderContainer()))) {
            if(moveDirection === this._crosstabConstants.VERTICAL) {
                touchEventType = this._crosstabScrollBarEventConstants.touchCrosstabVerticalScrollBarEvent;
            } else {
                touchEventType = this._crosstabScrollBarEventConstants.touchCrosstabRowAxisScrollBarEvent;
            }
        } else if ($(currentTarget).is($(this._crosstabContainers.getColumnHeaderContainer()))) {
            if(moveDirection === this._crosstabConstants.HORIZONTAL) {
                touchEventType = this._crosstabScrollBarEventConstants.touchCrosstabHorizontalScrollBarEvent;
            }
        } else if( $(currentTarget).is($(this._crosstabContainers.getLeftAreaDimensionHeaderContainer()))) {
            if (moveDirection === this._crosstabConstants.HORIZONTAL) {
                touchEventType = this._crosstabScrollBarEventConstants.touchCrosstabRowAxisScrollBarEvent;
            }
        }
        /*TODO: potential uneccessary touch event will be fired, when only horizontal scroll bar and touch scroll vertically.
                will publish event but nothing is subscribed to event*/
        if(touchEventType !== null){
            this._crosstabScrollBarEventMediator.publish(touchEventType, originalEvent);
        }
    }
    // cancel the event to avoid further dispatched events and operations
    event.preventDefault();
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.addHorizontalScrollBar = function(isVerticallyScrollable, updateData){
    var isVertical = false;
    var headersforScrollBar = this._floatedHeadersforScrollBar(isVertical, this._crosstab.model().getDimensions(1).length);
    this._horizontalScrollBar = new sap.basetable.crosstab.CrosstabScrollBar(this._crosstab, this._crosstabConstants.HORIZONTAL, this._crosstabScrollBarEventMediator,
        this._crosstab.getColumnCellWidth(), headersforScrollBar);
    var offsetProperties = this._getOffsetProperties(this._crosstabConstants.HORIZONTAL, true, isVerticallyScrollable);
    this._horizontalScrollBar.initializeScrollBar(this._crosstabContainers.getHorizontalScrollAreas(), offsetProperties,
        this._crosstab.model().getFullAxisLength(this._crosstabConstants.COLUMN_AXIS_INDEX), this._crosstab.model().getPageColumnSize(), true, updateData,
        this._crosstab.model().getGrandTotalNodes(this._crosstabConstants.ROW_AXIS_INDEX).length, this._crosstab.getRenderer().getGrandTotalsHeight(this._crosstabConstants.ROW_AXIS_INDEX),
        this._crosstab.getRenderer().canGrandTotalsBeAnchored());
    this._crosstabContainers.getScrollContainer().append(this._horizontalScrollBar.getContainer());
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.addVerticalScrollBar = function(horizontalScrollBarVisible, updateData){
    var isVertical = true;
    var headersforScrollBar = this._floatedHeadersforScrollBar(isVertical, this._crosstab.model().getDimensions(0).length);
    this._verticalScrollBar = new sap.basetable.crosstab.CrosstabScrollBar(this._crosstab, this._crosstabConstants.VERTICAL, this._crosstabScrollBarEventMediator,
        this._crosstab.getRowCellHeight(), headersforScrollBar);
    var offsetProperties = this._getOffsetProperties(this._crosstabConstants.VERTICAL, horizontalScrollBarVisible);
    this._verticalScrollBar.initializeScrollBar(this._crosstabContainers.getVerticalScrollAreas(), offsetProperties,
        this._crosstab.model().getFullAxisLength(this._crosstabConstants.ROW_AXIS_INDEX), this._crosstab.model().getPageRowSize(), true, updateData,
        this._crosstab.model().getGrandTotalNodes(this._crosstabConstants.ROW_AXIS_INDEX).length, this._crosstab.getRenderer().getGrandTotalsHeight(this._crosstabConstants.ROW_AXIS_INDEX),
        this._crosstab.getRenderer().canGrandTotalsBeAnchored());
    this._crosstabContainers.getScrollContainer().append(this._verticalScrollBar.getContainer());
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.addRowAxisHeaderScrollBar = function(isVerticallyScrollable, updateData){
    // The row axis does not have floated headers, so set headersforScrollBar to an empty array.
    var headersforScrollBar = [];
    this._rowAxisHeaderScrollBar = new sap.basetable.crosstab.CrosstabScrollBar(this._crosstab, this._crosstabConstants.ROW_AXIS_HEADER, this._crosstabScrollBarEventMediator,
        this._crosstab.getRowCellWidth(), headersforScrollBar);
    var offsetProperties = this._getOffsetProperties(this._crosstabConstants.ROW_AXIS_HEADER, true, isVerticallyScrollable);
    this._rowAxisHeaderScrollBar.initializeScrollBar(this._crosstabContainers.getRowAxisHeaderScrollAreas(), offsetProperties, this._crosstab.model().getDimensions(0).length,
        null, this._crosstab.model().isVerticalTable(), updateData, 0, 0);
    this._crosstabContainers.getScrollContainer().append(this._rowAxisHeaderScrollBar.getContainer());
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.updateScrollBars = function(type, eventData, scrollBarVisibility){
    var updateData = this.getScrollBarUpdateData(type, eventData);
    var updateMethod = this._getUpdateHandler(type);
    updateMethod.apply(this, [scrollBarVisibility,updateData]);
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._getUpdateHandler = function(type){
    var updateMethod;
    if(type === this._crosstabScrollBarEventConstants.updateAxisLength){
        updateMethod = this._updateAxisLengthEvent;
    } else if(type === this._crosstabScrollBarEventConstants.conditionalFormatEvent){
        updateMethod = this._conditionalFormatEvent;
    } else if(type === this._crosstabScrollBarEventConstants.newPageEvent){
        updateMethod = this._newPageEvent;
    } else if(type === this._crosstabScrollBarEventConstants.newSectionEvent){
        updateMethod  = this._newSectionEvent;
    }
    return updateMethod;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._newPageEvent = function(scrollBarVisibility, updateData){
    if(scrollBarVisibility.horizontalScrollBar){
        this._horizontalScrollBar.updateFromExternalEvent(updateData);
        this._horizontalScrollBar.resetCellOpacityUnderFloatingHeader();
    }
    if(scrollBarVisibility.verticalScrollBar){
        this._verticalScrollBar.updateFromExternalEvent(updateData);
        this._verticalScrollBar.resetCellOpacityUnderFloatingHeader();
    }
    if(scrollBarVisibility.rowAxisHeaderScrollBar){
        this._rowAxisHeaderScrollBar.updateFromExternalEvent(updateData);
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._newSectionEvent = function(scrollBarVisibility, updateData){
    if(scrollBarVisibility.horizontalScrollBar){
        this._horizontalScrollBar.updateFromExternalEvent(updateData);
    }
    if(scrollBarVisibility.verticalScrollBar){
        this._verticalScrollBar.updateFromExternalEvent(updateData);
    }
    if(scrollBarVisibility.rowAxisHeaderScrollBar){
        this._rowAxisHeaderScrollBar.updateFromExternalEvent(updateData);
    }
};


sap.basetable.crosstab.CrosstabScrollBarController.prototype._conditionalFormatEvent = function(scrollBarVisibility, updateData){
    if(scrollBarVisibility.horizontalScrollBar){
        this._horizontalScrollBar.updateFromExternalEvent(updateData);
        this._horizontalScrollBar.resetCellOpacityUnderFloatingHeader();
    }
    if(scrollBarVisibility.verticalScrollBar){
        this._verticalScrollBar.updateFromExternalEvent(updateData);
        this._verticalScrollBar.resetCellOpacityUnderFloatingHeader();
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._updateAxisLengthEvent = function(scrollBarVisibility, updateData){
    if (updateData.eventData.axisIndex === 0){
        if(scrollBarVisibility.verticalScrollBar){
            this._verticalScrollBar.updateFromExternalEvent(updateData);
        }
    } else {
        if(scrollBarVisibility.horizontalScrollBar){
            this._horizontalScrollBar.updateFromExternalEvent(updateData);
        }
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.updatePage = function(){
    if (this._verticalScrollBar) {
        this._verticalScrollBar.firePagingEvent(true);
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.getScrollBarUpdateData = function (type, eventData){
    var updateData = {
        type: type,
        eventData: eventData,
        containers: {
            rowAxisContentContent: this._crosstabContainers.getRowAxisContentContent(),
            columnHeaderContent: this._crosstabContainers.getColumnHeaderContent(),
            rowAxisHeaderContent: this._crosstabContainers.getRowAxisHeaderContent(),
            grandTotalsContentContainer: this._crosstabContainers.getGrandTotalsContentContainer()
        }
    };
    return updateData;
};


sap.basetable.crosstab.CrosstabScrollBarController.prototype.getMeasuresScrollData = function(){
    var model = this._crosstab.model();
    var measuresPosition = model.getMeasuresPosition();
    var scrollData = null;
    if (measuresPosition.axis === this._crosstabConstants.COLUMN) {
        scrollData = this._getScrollData(true, this._horizontalScrollBar);
    } else if (measuresPosition.axis === this._crosstabConstants.ROW) {
        scrollData = this._getScrollData(true, this._verticalScrollBar);
    }

    if (scrollData && measuresPosition.axis) {
        scrollData.axis = measuresPosition.axis;
    }
    return scrollData;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.setMeasuresScrollData = function(measuresScrollData){
    if (measuresScrollData && measuresScrollData.length) {
        this._measuresScrollData = measuresScrollData[0];
    } else {
        this._measuresScrollData = null;
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._getScrollData = function(scrollDataRequired, scrollBar){
    if(scrollDataRequired && scrollBar){
        var scrollData = {
            currentPosition: null,
            currentStartIndex: null,
            endPageIndex: null,
            startPageIndex: null,
            showEnd: false
        };
        scrollData.currentPosition = scrollBar.getAxisIndex();
        scrollData.showEnd = scrollBar.getShowEnd();
        if(scrollBar.getIsPageable()){
            scrollData.currentStartIndex = scrollBar.getCurrentStartIndex();
            scrollData.endPageIndex = scrollBar.getEndPageIndex();
            scrollData.startPageIndex = scrollBar.getStartPageIndex();
        }
        return scrollData;
    } else{
        return null;
    }
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._floatedHeadersforScrollBar =  function (isVertical, numHeaders) {
    var floatedHeaders = [];
    var childSelector;
    if(isVertical){
        childSelector = "#"+this._crosstab.getId()+"-RowAxisFloatingHeader";
    } else {
        childSelector = "#"+this._crosstab.getId()+"-ColumnAxisFloatingHeader";
    }
    for (var header = 0; header < numHeaders; header++){
        floatedHeaders.push({
            /*referenceID is the id of the cell whose text is currently being floated by the floating header*/
            referenceId: undefined,
            $headerDom: $(childSelector+header),
            lastCellParsed: undefined
        });
    }
    return floatedHeaders;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.getFloatedHeadersforScrollBar = function(isVertical) {
    var floatedHeaders;

    if (isVertical) {
        if (this._verticalScrollBar) {
            floatedHeaders = this._verticalScrollBar.getFloatedHeaders();
        }
    } else {
        if (this._horizontalScrollBar) {
            floatedHeaders = this._horizontalScrollBar.getFloatedHeaders();
        }
    }
    return floatedHeaders;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.getAllFloatedHeaders = function() {
    var horizontalFloatedHeaders = this.getFloatedHeadersforScrollBar(false);
    var verticalFloatedHeaders = this.getFloatedHeadersforScrollBar(true);
    var allFloatedHeaders = [];

    if (horizontalFloatedHeaders) {
        allFloatedHeaders = allFloatedHeaders.concat(horizontalFloatedHeaders);
    }
    if (verticalFloatedHeaders) {
        allFloatedHeaders = allFloatedHeaders.concat(verticalFloatedHeaders);
    }

    return allFloatedHeaders;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype._getOffsetProperties = function(scrollType, horizontalScrollBarVisible, isVerticallyScrollable){
    var offsetProperties = {
        Top: null,
        Left: null
    };
    var metaDataBorderWidth = 0;
    var metaDataBorderHeight = 0;
    if (scrollType === this._crosstabConstants.VERTICAL) {
        metaDataBorderHeight += this._crosstabConstants.LEFT_DIMENSION_HEADER_BORDER_SIZE.bottom;
        metaDataBorderHeight += this._crosstabConstants.LAYOUT_BORDER_SIZE.top;
        offsetProperties.Top = this._crosstabContainers.getHeaderHeight() + metaDataBorderHeight;
        offsetProperties.Left = this._crosstabContainers.getLeftAreaContainerWidth() + this._crosstabContainers.getRightAreaContainerWidth();
        if (this._crosstabContainers.getLeftAreaContainerWidth() !== 0) {
            // Add metaData border width and crosstab layout border
            offsetProperties.Left += this._crosstabConstants.METADATA_BORDER_WIDTH + this._crosstabConstants.LAYOUT_BORDER_WIDTH;
        }
    } else if (scrollType === this._crosstabConstants.HORIZONTAL || scrollType === this._crosstabConstants.ROW_AXIS_HEADER) {
        metaDataBorderWidth += this._crosstabConstants.LAYOUT_BORDER_SIZE.left;
        if (scrollType === this._crosstabConstants.HORIZONTAL && this._crosstabContainers.getLeftAreaContainerWidth() !== 0) {
            metaDataBorderWidth += this._crosstabConstants.ROW_AXIS_HEADER_CONTAINER_BORDER_SIZE.right;
            offsetProperties.Left = this._crosstabContainers.getLeftAreaContainerWidth() + metaDataBorderWidth;
        } else {
            offsetProperties.Left = metaDataBorderWidth;
        }
        if (isVerticallyScrollable) {
            offsetProperties.Top = this._crosstabContainers.getBodyHeight() + this._crosstabContainers.getHeaderHeight();
        } else {
            // If not vertically scrollable, we need to use total height for the top position of horizontal scrollbar and row axis scrollbar
            offsetProperties.Top = this._crosstab.getTotalHeight();
        }
        if (offsetProperties.Top > this._crosstabContainers.getOverallContainerHeight()) {
            offsetProperties.Top = this._crosstabContainers.getOverallContainerHeight();
        }

        offsetProperties.Top += this._getAdditionalBorderHeight();
    }
    return offsetProperties;
};

// Add additional border height to horizontal scroll bar top position based on crosstab properties
sap.basetable.crosstab.CrosstabScrollBarController.prototype._getAdditionalBorderHeight = function() {
    var additionalBorderHeight = 0;
    // Vertical Custom Scroll Bar
    if (this._crosstab.isVerticallyScrollable()) {
        // Account for the top and bottom border of the crosstab
        additionalBorderHeight += this._crosstabConstants.LAYOUT_BORDER_HEIGHT;
        if (this._crosstab.isMetaDataBorderPresent(this._crosstabConstants.HORIZONTAL)) {
            additionalBorderHeight += this._crosstabConstants.METADATA_BORDER_HEIGHT;
        }
    } else {
        // Vertical Default Scroll Bar
        var itemsOnRowAxis = this._crosstab.model().getFullAxisLength(this._crosstabConstants.ROW_AXIS_INDEX);
        additionalBorderHeight += this._crosstabConstants.LAYOUT_BORDER_HEIGHT;
        // if items on row axis are less than one page of data and a metadata border is present, account for its height
        // if items are greater than page size we do not account for meta data border height because we hide blue line
        if (itemsOnRowAxis < this._crosstab.model().getPageRowSize() && this._crosstab.isMetaDataBorderPresent(this._crosstabConstants.Horizontal)) {
            additionalBorderHeight += this._crosstabConstants.METADATA_BORDER_HEIGHT;
        }
    }
    return additionalBorderHeight;
};

sap.basetable.crosstab.CrosstabScrollBarController.prototype.isResetingMeasuresScrollData = function () {
    return this._isResetingMeasuresScrollData;
};
jQuery.sap.declare("sap.basetable.crosstab.CrosstabScrollBarEventConstants");

sap.basetable.crosstab.CrosstabScrollBarEventConstants = function() {
    "use strict";
    var CONSTANTS = {};
    CONSTANTS.nextPageEvent = "nextPageEvent";
    CONSTANTS.borderEvent = "borderEvent";
    CONSTANTS.updateAxisLength ="updateAxisLength";
    CONSTANTS.conditionalFormatEvent = "conditionalFormatEvent";
    CONSTANTS.newPageEvent = "newPageEvent";
    CONSTANTS.newSectionEvent = "newSectionEvent";
    CONSTANTS.windowResize = "windowResize";
    CONSTANTS.touchCrosstabRowAxisScrollBarEvent = "touchCrosstabRowAxisScrollBarEvent";
    CONSTANTS.touchCrosstabVerticalScrollBarEvent = "touchCrosstabVerticalScrollBarEvent";
    CONSTANTS.touchCrosstabHorizontalScrollBarEvent = "touchCrosstabHorizontalScrollBarEvent";
    return Object.freeze(CONSTANTS);
};
jQuery.sap.declare("sap.basetable.crosstab.CrosstabScrollBarEventMediator");

sap.basetable.crosstab.CrosstabScrollBarEventMediator =  function() {
    this._participants = {};
};

sap.basetable.crosstab.CrosstabScrollBarEventMediator.prototype.subscribe = function( event, targetCallBack ) {
    if( ! this._participants.hasOwnProperty( event ) ) {
        this._participants[ event ] = [];
    }
    this._participants[ event ].push( targetCallBack );
    return true;
};

sap.basetable.crosstab.CrosstabScrollBarEventMediator.prototype.publish = function(event, args){
    if( ! this._participants.hasOwnProperty( event ) ) {
        return false;
    }
    for( var i = 0, len = this._participants[ event ].length; i < len; i++ ) {
        this._participants[ event ][ i ].call(undefined, args);
    }
    return true;
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/

"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabSelectionHandler");

sap.basetable.crosstab.CrosstabSelectionHandler = function (crosstab) {
    this._crosstab = crosstab;
    this._model = crosstab.model();
    this._renderer = crosstab.getRenderer();
    this._container = this._crosstab.container();
    this._queryResponseUtils = null;
    this._tupleTreeUtils = sap.basetable.crosstab.TupleTreeUtil;
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();

    // Selected items can only be members of a single dimension. "dimension" has the ID of dimension,
    // "members" is a map of selected members to their selection frequency, and "tuples" is a set of tuple paths.
    this._selectedItems = {dimension: null, members: {}, tuples: {}, dataCellIndex: []};
    this._lastTuple = null;
    this._lastTupleIndex = null;
    // Publish null items selected event to reset properties set in listeners
    this._publishItemSelectedEvent(null);
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype = {
    SELECTED_CELL_CLASS: "crosstab-cell-selected",
    ITEM_SELECTED_EVENT: "sap.viz.ext.crosstab.CrosstabEvent.SELECTED",
    REGEXP_CELL: /dataCell_(.*)$/,
    REGEXP_DIMENSION: /^Crosstab-([^-]*)(-div)?$/
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.getSelectedItems = function() {
    var queryResponseUtils = this._getQueryResponseUtils();
    return jQuery.extend({}, this._selectedItems, {captionGenerator: queryResponseUtils.getCaption.bind(queryResponseUtils)});
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.getItemSelectedEventPayload = function (selectedItem, selectedMembers) {
    if (!Array.isArray(selectedMembers)) {
        selectedMembers = null;
    }

    // selectColumn does not mean a column of a crosstab. It means column as in database. It's a property name imposed on us by Lumira.
    // selectColumn can hold values of dimensions in rows too.
    return {selectColumn: selectedItem, selectValues: selectedMembers};
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.getSelectedMemberIds = function() {
    var selectedMemberIds = [];
    if (typeof this._selectedItems.members === "object") {
        selectedMemberIds = Object.keys(this._selectedItems.members);
        if (this._model.isNumericDataType(this._selectedItems.dimension)) {
            selectedMemberIds = selectedMemberIds.map(function (memberId) {
                if (memberId === this._crosstabConstants.NULL_VALUE) {
                    return null;
                }
                return Number(memberId);
            }.bind(this));
        }
    }

    return selectedMemberIds;
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.areAllDimensionMembersSelected = function() {
    if (!this._selectedItems.dimension || this._selectedItems.dimension === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
        return null;
    }
    var dimensionValues = this._getQueryResponseUtils().getDimensionValues(this._selectedItems.dimension);
    return Object.keys(this._selectedItems.members).length === dimensionValues.length;
};

// Handles a context menu event. It's expected to be called from another context menu handler
sap.basetable.crosstab.CrosstabSelectionHandler.prototype.handleContextMenu = function (event) {
    this._handleClick(event, false);
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.addSelectionListeners = function () {
    var frame = this._crosstab.getUI5Frame();
    $(frame).on("mousedown", function(event) {
        if ($(event.target).closest(this._crosstabConstants.UI5_CROSSTAB_ID_TEMPLATE.replace("{ID}", this._crosstab.getId())).length === 0) {
            return;
        }

        this._handleClick(event, true);
        this._fireSelectionOutlineEvent(event);
    }.bind(this));

    sap.ui.getCore().getEventBus().subscribe("viz.ext.crosstab", "crosstabSectionChanged", function(channel, type, data) {
        if (channel !== "viz.ext.crosstab" || type !== "crosstabSectionChanged" || data.containerId !== this._crosstab.getContainerId()) {
            return;
        }

        this.showSelectionOutline(data.sectionId);
    }.bind(this), this);

    var crosstabTitle = this._crosstab.getUI5Frame().closest(this._crosstabConstants.VIZ_ROOT).find("svg" + this._crosstabConstants.VIZ_TITLE);
    crosstabTitle.on("click", this._fireSelectionOutlineEvent.bind(this));
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._setSelectedItems = function(dimension, members, tuples) {
    if (!dimension || jQuery.isEmptyObject(members) || jQuery.isEmptyObject(tuples)) {
        this._selectedItems = {dimension: null, members: {}, tuples: {}};
        this._removeSelectionFeedback();
    } else {
        this._selectedItems = {dimension: dimension, members: members, tuples: tuples};
        // The current selection will not change when members are provided. The caller has to handle them.
    }
    this._lastTuple = null;
    this._lastTupleIndex = null;
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._removeSelectionFeedback = function(elements) {
    if (elements) {
        elements.removeClass(this.SELECTED_CELL_CLASS);
        this._updateChildSpanSelectionFeedback(elements, true);
    } else {
        $(this._container).find("." + this.SELECTED_CELL_CLASS).removeClass(this.SELECTED_CELL_CLASS);
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._updateChildSpanSelectionFeedback = function(elements, removeClass) {
    var childSpan = elements.find("." + this._crosstabConstants.CELL_CONTENT);
    if (removeClass) {
        childSpan.removeClass(this.SELECTED_CELL_CLASS);
    } else {
        childSpan.addClass(this.SELECTED_CELL_CLASS);
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._addSelectionFeedback = function(elements) {
    if (elements) {
        elements.addClass(this.SELECTED_CELL_CLASS);
        this._updateChildSpanSelectionFeedback(elements, false);
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._addSelectedItem = function(dimensionMember) {
    var dimension = dimensionMember.dimension;
    var member = dimensionMember.member;
    var tuple = dimensionMember.tuple;
    var hasCompositeKey = dimensionMember.hasCompositeKey;
    if (dimension && member && tuple) {
        // Checks if the selected cell is aggregated
        var memberParts = member.toString().split(this._crosstabConstants.MEMBER_KEY_DELIMITER);
        if (memberParts.length > 1 && parseInt(memberParts[1]) > 1) {
            return;
        }

        if (this._selectedItems.dimension === dimension) {
            this._selectedItems.members[member] = (this._selectedItems.members[member] || 0) + 1;
            this._selectedItems.tuples[tuple] = true;
        } else {
            // If a different dimension is selected, reset the selection
            var members = {};
            members[member] = 1;
            var tuples = {};
            tuples[tuple] = true;
            this._selectedItems = {dimension: dimension, members: members, tuples: tuples, dataCellIndex: [], hasCompositeKey: hasCompositeKey};
            this._removeSelectionFeedback();
        }
        this._addSelectionFeedback(dimensionMember.elements);

        this._lastTuple = tuple;
        this._lastTupleIndex = this._model.getAbsoluteTupleIndex(tuple, dimension);
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._addSelectedDataCell = function(dataCell) {
    var dataCellIndex = dataCell.dataCellIndex;

    if (dataCellIndex) {
        this._addSelectionFeedback(dataCell.elements);
        this._selectedItems = {dimension: null, members: {}, tuples: {}, dataCellIndex : dataCellIndex};
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._removeSelectedItem = function(dimensionMember) {
    var dimension = dimensionMember.dimension;
    var member = dimensionMember.member;
    var tuple = dimensionMember.tuple;
    if (dimension &&
            member &&
            tuple &&
            this._selectedItems.dimension === dimension &&
            this._selectedItems.tuples[tuple]) {
        delete this._selectedItems.tuples[tuple];
        this._removeSelectionFeedback(dimensionMember.elements);
        this._selectedItems.members[member]--;
        if (this._selectedItems.members[member] === 0) {
            delete this._selectedItems.members[member];
        }
        this._lastTuple = null;
        this._lastTupleIndex = null;
    }
};

// Returns the cell that matches the floating header, or the cell that the floating header is representing.
// isHeader is the boolean that determines if cell is a floating header, or a normal cell.
sap.basetable.crosstab.CrosstabSelectionHandler.prototype._getFloatingHeaderMatch = function (cell, isHeader) {
    var floatedHeaders = this._crosstab.getCrosstabScrollBarController().getAllFloatedHeaders();
    for (var i = 0; i < floatedHeaders.length; i++) {
        var floatedHeader = floatedHeaders[i];
        if (isHeader && floatedHeader.$headerDom.attr("id") === cell.id) {
            return floatedHeader.lastCellParsed && floatedHeader.lastCellParsed[0];
        } else if (!isHeader && floatedHeader.lastCellParsed && floatedHeader.lastCellParsed.attr("id") === cell.id) {
            return floatedHeader.$headerDom && floatedHeader.$headerDom[0];
        }
    }
    return null;
};


// Takes a mouse event and returns an object containing dimension ID, member value, and tuple path.
sap.basetable.crosstab.CrosstabSelectionHandler.prototype._getDimensionMember = function (target) {
    var targetCell = $(target).closest("div")[0];
    if (!targetCell || $(targetCell).find("." + this._crosstabConstants.SUBTOTAL).length) {
        return null;
    }

    var result = {elements: $(targetCell)};
    var clickedOnFloatingHeader = $(targetCell).hasClass(this._crosstabConstants.FLOATING_CELL);

    // Switch to the actuall cell if floating header was clicked on
    if (clickedOnFloatingHeader) {
        var actualCell = this._getFloatingHeaderMatch(targetCell, true);
        if (actualCell) {
            result.elements = result.elements.add(actualCell);
            targetCell = actualCell;
        }
    }

    // Find and add the floating header to the elements
    if (!clickedOnFloatingHeader && $(targetCell).find("." + this._crosstabConstants.UNDER_FLOATING_HEADER).length) {
        var floatedHeader = this._getFloatingHeaderMatch(targetCell, false);
        if (floatedHeader) {
            result.elements = result.elements.add(floatedHeader);
        }
    }

    var regexp, axisId;
    if (targetCell.id.indexOf(this._crosstabConstants.ROW_AXIS_HEADER_CELL) >= 0) {
        axisId = this._crosstabConstants.ROW_AXIS_INDEX;
        regexp = this._crosstabConstants.REGEXP_ROW_HEADER;
    } else if (targetCell.id.indexOf(this._crosstabConstants.COLUMN_MEMBER_HEADER_CELL) >= 0) {
        axisId = this._crosstabConstants.COLUMN_AXIS_INDEX;
        regexp = this._crosstabConstants.REGEXP_COLUMN_HEADER;
    } else {
        return null;
    }
    var dimensions = this._model.getDimensions(axisId);
    var tupleTree = this._model.getTupleTree(axisId).rootnode;

    // Traverse through the tuple tree to find the path
    var dimensionIndexes = regexp.exec(targetCell.id)[1].split("_");
    tupleTree = this._tupleTreeUtils.traverseTree(tupleTree, dimensionIndexes);

    var member = tupleTree.member.baseId;
    var memberParts = member ? member.toString().split(this._crosstabConstants.MEMBER_KEY_DELIMITER) : [];
    // Checks if member is aggregated
    if (memberParts.length > 1 && parseInt(memberParts[1]) > 1) {
        return null;
    }
    member = this._getOriginalMemberKey(member);
    result.dimension = dimensions[dimensionIndexes.length - 1].id;
    result.hasCompositeKey = dimensions[dimensionIndexes.length - 1].hasCompositeKey;
    result.member = member;
    result.tuple = tupleTree.tuplePath.toString();
    result.dimensionIndexes = dimensionIndexes;

    return result;
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._isDimensionMemberSelected = function (dimensionMember) {
    return dimensionMember &&
            this._selectedItems.dimension === dimensionMember.dimension &&
            this._selectedItems.members[dimensionMember.member] &&
            this._selectedItems.tuples[dimensionMember.tuple];
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._isDataCellSelected = function (dataCell) {
    if (!dataCell || !this._selectedItems.dataCellIndex || this._selectedItems.dataCellIndex.length === 0) {
        return false;
    }

    return this._selectedItems.dataCellIndex[0] === dataCell.dataCellIndex[0] && this._selectedItems.dataCellIndex[1] === dataCell.dataCellIndex[1];
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._getCellInfo = function (target) {
    var targetCell = $(target).closest("div")[0];
    var dataCell = {elements: $(targetCell)};
    var dataCellId = this.REGEXP_CELL.exec(targetCell.id);

    if (!dataCellId) {
        // When a measure dimension or dimension is clicked, dataCellId must be null and therefore dataCell must be null.
        return null;
    }

    var coordinates = dataCellId[1].split("_");
    for (var i = 0; i < coordinates.length; i++) {
        coordinates[i] = parseInt(coordinates[i]);
    }

    if (this._crosstab.model().getMeasuresPosition().axis === this._crosstabConstants.ROW) {
        dataCell.measure = this._model.getMeasureMap()[coordinates[0] - this._model.getStartRowIndex()];
    } else {
        dataCell.measure = this._model.getMeasureMap()[coordinates[1] - this._model.getStartColumnIndex()];
    }

    dataCell.dataCellIndex = [coordinates[0], coordinates[1]];

    return dataCell;
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._fireSelectionOutlineEvent = function (event) {
    var target = $(event.target);
    // Change the target element if a floating header was clicked
    if (target.hasClass(this._crosstabConstants.FLOATING_CELL)) {
        if (target.closest("#" + this._crosstabConstants.TOP_SECTION_ID).length) {
            target = this._container.find(this._crosstabConstants.SELECTION_SECTIONS["sap.viz.controls.propertyeditor.section.column_labels"]);
        } else {
            target = this._container.find(this._crosstabConstants.SELECTION_SECTIONS["sap.viz.controls.propertyeditor.section.row_labels"]);
        }
    }
    for (var sectionId in this._crosstabConstants.SELECTION_SECTIONS) {
        var sectionSelector = this._crosstabConstants.SELECTION_SECTIONS[sectionId];
        var targetSection = target.closest(sectionSelector);
        if (targetSection.length) {
            this._crosstab.getDispatch().crosstablePropertyZoneChanged({data: {
                                                                        propertyZones: [{
                                                                            _type: this._crosstabConstants.SECTION_ZONES[sectionId]
                                                                        }]
                                                                    }});
            return;
        }
    }
};

/**
 * Handles updating the selection state when an item on the Crosstab is clicked
 *
 * Contains a chain of local functions that handle different cases depending on where in the crosstab the click occurred
 *
 * @param event contains information on the click event
 * @param incrementalSelection enables ctrl and shift selections
 */
sap.basetable.crosstab.CrosstabSelectionHandler.prototype._handleClick = function (event, incrementalSelection) {

    var dimensionMember = this._getDimensionMember(event.target);
    var isMeasureClicked = dimensionMember && dimensionMember.dimension === this._crosstabConstants.MEASURE_NAMES_DIMENSION;

    // Set up the functions that can potentially handle the click event
    var doNothing = function () {
        return (event.originalEvent.button !== this._crosstabConstants.MOUSE_BUTTON.left && incrementalSelection);
    }.bind(this);

    var doCellSelection = function () {
        if (dimensionMember !== null ) {
            return false;
        }

        var cell = this._getCellInfo(event.target);

        if (!cell) {
             return false;
        }

        if (!this._isDataCellSelected(cell)) {
            this._setSelectedItems(null);
            this._addSelectedDataCell(cell);
            //The conditional formatting rules are based on the measure metadata ids, so we must use the metadata id
            //to identify the measure member in the selection event (see BITVDC25-2075).
            this._publishItemSelectedEvent(this._model.getMeasureMetadataId(cell.measure));
        }

        return true;
    }.bind(this);

    var doResetSelection = function () {
        if (dimensionMember && dimensionMember.dimension) {
            return false;
        }

        if ($(event.target).closest(this._crosstabConstants.CROSSTAB_SCROLL).length === 0 &&
               event.target.className.indexOf(this._crosstabConstants.RESIZABLE_COL) === -1 &&
               event.target.id.indexOf(this._crosstabConstants.RESIZABLE_COL_LINE) === -1) {
            this._setSelectedItems(null);
            this._publishItemSelectedEvent(null);
        }

        return true;
    }.bind(this);

    var doIncrementalSelection = function() {
        if (!event.ctrlKey || !incrementalSelection || isMeasureClicked ) {
            return false;
        }

        if (this._isDimensionMemberSelected(dimensionMember)) {
            this._removeSelectedItem(dimensionMember);
        } else {
            this._addSelectedItem(dimensionMember);
        }
        this._publishItemSelectedEvent(dimensionMember.dimension, this.getSelectedMemberIds());

        return true;
    }.bind(this);

    var doRangeSelection = function() {
        if (!incrementalSelection ||
                !event.shiftKey ||
                !this._lastTuple ||
                this._lastTupleIndex === null ||
                isMeasureClicked ||
                dimensionMember.dimension !== this._selectedItems.dimension) {
            return false;
        }

        this._addRange(this._lastTuple, this._lastTupleIndex, dimensionMember);
        this._publishItemSelectedEvent(dimensionMember.dimension, this.getSelectedMemberIds());
        return true;
    }.bind(this);

    var doRegularSelection = function() {
        if (this._isDimensionMemberSelected(dimensionMember) && !incrementalSelection) {
            return false;
        }

        this._setSelectedItems(null);
        this._addSelectedItem(dimensionMember);

        if (isMeasureClicked) {
            //The conditional formatting rules are based on the measure metadata ids, so we must use the metadata id
            //to identify the measure member in the selection event (see BITVDC25-2075).
            this._publishItemSelectedEvent(this._model.getMeasureMetadataId(dimensionMember.member));
        } else {
            this._publishItemSelectedEvent(dimensionMember.dimension, this.getSelectedMemberIds());
        }
        return true;
    }.bind(this);

    // Set up a chain that will determine the order of how to handle click
    var selectionHandlingChain = [doNothing, doCellSelection, doResetSelection, doIncrementalSelection, doRangeSelection, doRegularSelection];

    // Go through the chain until the click has been handled
    for (var i = 0, handled = false; i < selectionHandlingChain.length; i++) {
        handled = selectionHandlingChain[i].apply();
        if (handled) {
            break;
        }
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._findDimensionElement = function (dimensionAxis, tuple) {
    var elements;
    var tupleIndexes = this._model.getTupleIndex(dimensionAxis, tuple);
    if (tupleIndexes && tupleIndexes.dimensionIndexes) {
        var cellId = this._crosstab.getId();
        if (dimensionAxis === this._crosstabConstants.ROW_AXIS_INDEX) {
            cellId += "-" + this._crosstabConstants.ROW_AXIS_HEADER_CELL + "_";
        } else {
            cellId += "-" + this._crosstabConstants.COLUMN_MEMBER_HEADER_CELL + "_";
        }
        cellId += tupleIndexes.dimensionIndexes;
        elements = $(this._crosstab.container()).find("#" + cellId);
        if (elements.length) {
            var floatingHeader = this._getFloatingHeaderMatch(elements[0], false);
            elements = elements.add(floatingHeader);
        }
    }

    return elements;
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._addDimensionIndexesToSelection = function (dimensionIndexes, dimensions, dimensionAxis) {
    var tupleMember = this._getQueryResponseUtils().getTupleMemberFromDimensionIndexes(dimensionIndexes, dimensions);
    var member = this._getOriginalMemberKey(tupleMember.member);
    var dimensionMember = {
        dimension: this._selectedItems.dimension,
        member: member,
        tuple: tupleMember.tuple,
        hasCompositeKey: this._selectedItems.hasCompositeKey
    };

    dimensionMember.elements = this._findDimensionElement(dimensionAxis, tupleMember.tuple);

    if (!this._isDimensionMemberSelected(dimensionMember)) {
        this._addSelectedItem(dimensionMember);
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.addFeedbackDuringPaging = function () {
    var dimension = this._selectedItems.dimension,
        dimensionLocation = this._model.findDimension(dimension),
        dimensionAxis = dimensionLocation.dimensionAxis,
        selectedTuples = Object.keys(this._selectedItems.tuples),
        elements;

    for (var i = 0; i < selectedTuples.length; i++) {
        elements = this._findDimensionElement(dimensionAxis, selectedTuples[i]);
        if (elements && elements.length) {
            this._addSelectionFeedback(elements);
        }
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.addFeedbackDataCellDuringPaging = function () {
    var dataCell = this._selectedItems.dataCellIndex;
    var element = $(this._crosstab.container()).find("#dataCell_" + dataCell[0] + "_" + dataCell[1]);
    this._addSelectionFeedback(element);
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._addRange = function (startTuple, startTupleIndex, targetDimensionMember) {
    var dimensionLocation = this._model.findDimension(this._selectedItems.dimension);
    var dimensionAxis = dimensionLocation.dimensionAxis;
    var dimensions = this._model.getDimensions(dimensionAxis);

    var endTuple = targetDimensionMember.tuple;
    if (startTuple === endTuple) {
        return;
    }

    // pass in the modifiedMemberKeys so we can parse the tuple and get the origianl member Ids
    var startDimensionIndexes = this._getQueryResponseUtils().getDimensionIndexes(startTuple, dimensions, this._model.getModifiedMemberKeys());
    var endDimensionIndexes = this._getQueryResponseUtils().getDimensionIndexes(endTuple, dimensions, this._model.getModifiedMemberKeys());

    var queryResponseAxisName = this._getQueryResponseUtils().findDimensionLocation(this._selectedItems.dimension).axisName;

    var endTupleIndex = this._model.getAbsoluteTupleIndex(endTuple, this._selectedItems.dimension);
    var direction = startTupleIndex < endTupleIndex ? 1 : -1;

    var currentDimensionIndexes = startDimensionIndexes.slice();
    while (this._getQueryResponseUtils().compareDimensionIndexes(currentDimensionIndexes, endDimensionIndexes) !== 0) {
        this._addDimensionIndexesToSelection(currentDimensionIndexes, dimensions, dimensionAxis);
        currentDimensionIndexes = this._getQueryResponseUtils().nextDimensionIndexes(queryResponseAxisName,
                                                                                    currentDimensionIndexes,
                                                                                    dimensions,
                                                                                    direction);
    }
    this._addDimensionIndexesToSelection(endDimensionIndexes, dimensions, dimensionAxis);
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._getQueryResponseUtils = function () {
    if (!this._queryResponseUtils) {
        this._queryResponseUtils = this._model.getQueryResponseUtils();
    }
    return this._queryResponseUtils;
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype.getClickedDimensionId = function (clickTarget) {
    var dimensionInfo = this._getDimensionMember(clickTarget);
    if (dimensionInfo) {
        if (dimensionInfo.dimension === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
            return null;
        }
        return dimensionInfo.dimension;
    }

    var targetId = $(clickTarget).closest("div")[0].id;
    var dimensionId = this.REGEXP_DIMENSION.exec(targetId);
    if (dimensionId) {
        return dimensionId[1];
    }

    if (targetId === this._crosstabConstants.RIGHT_AREA_DIM_HEADER) {
        dimensionId = this._model.getLastDimensionId(this._crosstabConstants.COLUMN_AXIS_INDEX);
        if (dimensionId === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
            return null;
        }
        return dimensionId;
    }
};

sap.basetable.crosstab.CrosstabSelectionHandler.prototype._publishItemSelectedEvent = function (selectedItem, selectedMembers) {
    var selection = this.getItemSelectedEventPayload(selectedItem, selectedMembers);
    sap.ui.getCore().getEventBus().publish("crosstab", this.ITEM_SELECTED_EVENT, selection);
};

// get the original memberKey, CrosstabModel.prototype.getModifiedMemberKeys for details
sap.basetable.crosstab.CrosstabSelectionHandler.prototype._getOriginalMemberKey = function (member) {
    var modifiedMemberKeys = this._model.getModifiedMemberKeys();
    if (modifiedMemberKeys && modifiedMemberKeys[member]) {
        member = modifiedMemberKeys[member];
    }
    return member;
};

// When sectionId is false, it hides the selection outline, otherwise it shows the outline for the specified section
sap.basetable.crosstab.CrosstabSelectionHandler.prototype.showSelectionOutline = function (sectionId) {
    var ui5Frame = this._container.closest("." + this._crosstabConstants.UI5_FRAME_CLASS);
    var selectionOutline = ui5Frame.find("." + this._crosstabConstants.SELECTION_OUTLINE_CLASS);

    if (!sectionId || !ui5Frame.length) {
        selectionOutline.hide();
        ui5Frame.css({overflow: "hidden"});
        return;
    }

    var sectionSelector = this._crosstabConstants.SELECTION_SECTIONS[sectionId];
    var containerOffset = this._container.offset();
    if (!sectionSelector || !containerOffset || containerOffset.left === undefined || containerOffset.top === undefined) {
        return;
    }

    // scaleFactor is applied to jQuery offset output to compensate for the zoom level
    var scaleFactor = this._crosstab.getScaleFactor();
    containerOffset.left /= scaleFactor;
    containerOffset.top /= scaleFactor;

    var section;

    if (sectionId === "sap.viz.controls.propertyeditor.section.chart_title") {
        var vizRoot = this._container.closest(this._crosstabConstants.VIZ_ROOT);
        section = vizRoot.find(sectionSelector);
    } else {
        section = this._container.find(sectionSelector);
    }
    var sectionOffset = section.offset();
    sectionOffset.left /= scaleFactor;
    sectionOffset.top /= scaleFactor;

    // Section boundary restricts the area that the selection outline can be shown (on scrollable areas)
    // The following part applies the limits to outlineProperties
    var sectionBoundarySelector = this._crosstabConstants.SELECTION_BOUNDARY_SECTIONS[sectionId];
    var sectionBoundary = sectionBoundarySelector ? this._container.find(sectionBoundarySelector) : null;
    var sectionBoundaryOffset;
    if (sectionBoundary && sectionBoundary.length) {
        sectionBoundaryOffset = sectionBoundary.offset();
        sectionBoundaryOffset.left /= scaleFactor;
        sectionBoundaryOffset.top /= scaleFactor;
    }

    // Fix for an exception in the outline for data cells
    if (sectionId === "sap.viz.controls.propertyeditor.section.data_cells" &&
            this._model.getDimensions(this._crosstabConstants.ROW_AXIS_INDEX).length &&
            sectionBoundaryOffset.left === sectionOffset.left) {
        section = this._container.find("#" + this._crosstabConstants.DATA_SECTION_ID);
        sectionOffset = section.offset();
        sectionOffset.left /= scaleFactor;
        sectionOffset.top /= scaleFactor;
    }

    var outlineProperties = {
        left: (sectionOffset.left - containerOffset.left) + "px",
        top: (sectionOffset.top - containerOffset.top) + "px",
        width: (section.width() - this._crosstabConstants.SELECTION_OUTLINE_BORDER_WIDTH * 2) + "px",
        height: (section.height() - this._crosstabConstants.SELECTION_OUTLINE_BORDER_WIDTH * 2) + "px"
    };

    if (sectionBoundary && sectionBoundary.length) {
        if (sectionBoundaryOffset.left > sectionOffset.left) {
            outlineProperties.left = (sectionBoundaryOffset.left - containerOffset.left) + "px";
        }
        if (sectionBoundaryOffset.top > sectionOffset.top) {
            outlineProperties.top = (sectionBoundaryOffset.top - containerOffset.top) + "px";
        }

        var outlineLeft = parseInt(outlineProperties.left);
        if (containerOffset.left + outlineLeft + section.width() > sectionBoundaryOffset.left + sectionBoundary.width()) {
            outlineProperties.width = (sectionBoundaryOffset.left + sectionBoundary.width() - outlineLeft - containerOffset.left -
                                            this._crosstabConstants.SELECTION_OUTLINE_BORDER_WIDTH * 2) + "px";
        }

        var outlineTop = parseInt(outlineProperties.top);
        if (containerOffset.top + outlineTop + section.height() > sectionBoundaryOffset.top + sectionBoundary.height()) {
            outlineProperties.height = (sectionBoundaryOffset.top + sectionBoundary.height() - outlineTop - containerOffset.top -
                                            this._crosstabConstants.SELECTION_OUTLINE_BORDER_WIDTH * 2) + "px";
        }
    }

    selectionOutline.css(outlineProperties);
    selectionOutline.show();
    ui5Frame.css({overflow: "visible"});
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/

"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabSortingHandler");

sap.basetable.crosstab.CrosstabSortingHandler = function (crosstab) {
    this._crosstab = crosstab;
    this._model = crosstab.model();
    this._crosstabConstants = crosstab.getCrosstabConstants();
    this._languageManager = crosstab.getLanguageManager();
    this._SORTING_FEEDBACK_SELECTION = "." + this._crosstabConstants.SORTING_FEEDBACK;
    this._TOOLTIP_SORT_ASCENDING_BY = this._languageManager.get("XTAB_MENU_TOOLTIP_SORTED_ASCENDING_BY");
    this._TOOLTIP_SORT_DESCENDING_BY = this._languageManager.get("XTAB_MENU_TOOLTIP_SORTED_DESCENDING_BY");
    this._TOOLTIP_SORT_BY_DIMENSION = this._languageManager.get("XTAB_MENU_TOOLTIP_SORTED_BY_DIMENSIONS");
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype = {
    _UNSORTED: "unsorted",
    _SORTING_CLASS_ACSENDING: "icon-Crosstab-Measures-Sorting-Ascending",
    _SORTING_CLASS_DESCENDING: "icon-Crosstab-Measures-Sorting-Descending",
    _SORTING_CLASS_UNSORTED: "icon-Crosstab-Measures-Sorting-Unsorted",
    _SORTING_CLASS_SORTED: "crosstab-sorting-feedback-when-overlaps",
    _SORTING_CLASS_BACKGROUND: "crosstab-sorting-feedback-background",
    _SORTING_WIDTH: 40, // 32px the size of icon + 8px for the space
    _MIN_TEXT_WIDTH: 12 // that number is used to insure that text will not collapse when don't have enough space
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype.addSortingListeners = function () {
    var sortingState = this._model.getSortingState();
    if (sortingState) {
        this._setSortingState(sortingState.measure.objId, sortingState.direction);
    }

    if (!this._crosstab.isCrosstabInStory()) {
        var uiCrosstabID = this._crosstabConstants.UI5_CROSSTAB_ID_TEMPLATE.replace("{ID}", this._crosstab.getId());
        var sortingContent = $(uiCrosstabID).find(this._SORTING_FEEDBACK_SELECTION);
        var sortingDimension = sortingContent.parent();
        var target;

        // In case of touch devices sorting behavior slightly different
        if ("ontouchstart" in window) {
            this._addSortingListenersForTouchDevices(uiCrosstabID, target, sortingDimension, sortingContent);
        } else {
            this._addSortingListenersForDevices(target, sortingDimension, sortingContent);
        }

    } else {
        this._setTooltipForSortedMeasure();
    }
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._addSortingListenersForDevices  = function(target, sortingDimension, sortingContent) {
    //Clear existing mouseover/mouseout handlers before adding new ones to prevent handling the events multiple times (BITVDC-2007).
    sortingDimension.off("mouseover mouseout");
    sortingDimension.on("mouseover mouseout", function(event) {
        target = $(event.delegateTarget);
        if (this.shouldShowSort(target, true)) {
            this._handleHover(target);
        }
    }.bind(this));

    sortingContent.off("click");
    sortingContent.on("click", function(event) {
        target = $(event.delegateTarget).parent();
        if (this.shouldShowSort(target, true)) {
            this._handleClick(target);
        }
    }.bind(this));
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._addSortingListenersForTouchDevices  = function(uiCrosstabID, target, sortingDimension, sortingContent) {
    var frame = $(uiCrosstabID).closest("." + this._crosstabConstants.UI5_FRAME_CLASS);
    frame.off("click touchstart");
    frame.on("click touchstart", function(uiCrosstabID, event) {
        if ($(event.target).closest(uiCrosstabID).length === 0) {
            return;
        }
        this._cleanUnnecessarySortingIcons(sortingContent);
    }.bind(this, uiCrosstabID));

    sortingContent.off("click");
    sortingContent.on("click", function(event) {
        target = $(event.delegateTarget).parent();
        if (this.shouldShowSort(target, true)) {
            this._handleTouch(target, true);
        }
    }.bind(this));

    sortingDimension.off("click");
    sortingDimension.on("click", function(event) {
        // To avoid code invocation if the event was bubbled
        if ($(event.delegateTarget).hasClass(this._crosstabConstants.SORTING_FEEDBACK)) {
            return;
        }
        target = $(event.delegateTarget).parent();
        if (this.shouldShowSort(target, true)) {
            this._handleTouch(target, false);
        }
    }.bind(this));
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._handleHover = function(target) {
    var sortingStateStyle;
    var sortingState = this._model.getSortingState();
    var measureMemberId = this._getMeasureMember(target);

    if (measureMemberId && (!sortingState ||  sortingState.measure.objId !== measureMemberId)) {
        sortingStateStyle = this._SORTING_CLASS_UNSORTED;
    }

    var sortingElement = target.find(this._SORTING_FEEDBACK_SELECTION);
    if (sortingElement) {
        if (sortingElement.hasClass(sortingStateStyle)) {
            sortingElement.removeClass(sortingStateStyle);
        } else {
            sortingElement.attr("title", this._getSortingTooltip(measureMemberId, sortingState));
            if (sortingStateStyle) {
                sortingElement.addClass(sortingStateStyle);
            }
        }

        if (sortingElement.hasClass(this._SORTING_CLASS_SORTED)) {
            sortingElement.removeClass(this._SORTING_CLASS_SORTED);
        } else if (sortingStateStyle) {
            var targetElement = target.find("." + this._crosstabConstants.CELL_CONTENT);
            var textAlignment = targetElement.css("text-align");
            var textWidth = this._getTextSize(targetElement);

            if (textAlignment === "right") {
                if (textWidth > 0) {
                    sortingElement.addClass(this._SORTING_CLASS_SORTED);
                }
            } else {
                var targetWidth = target.width();
                if (textAlignment === "center") {
                    textWidth /= 2;
                    targetWidth /= 2;
                }
                if (sortingElement.outerWidth() + textWidth > targetWidth) {
                    sortingElement.addClass(this._SORTING_CLASS_SORTED);
                }
            }
        }
    }
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._handleClick = function(target) {
    var sortingTypeRequired;
    var sortedDimensionMember = this._getMeasureMember(target);
    var sortingState = this._model.getSortingState();

    if (sortingState && sortingState.measure.objId === sortedDimensionMember) {
        switch (sortingState.direction) {
            case this._crosstabConstants.DESCENDING:
                sortingTypeRequired = this._crosstabConstants.ASCENDING;
                break;
            case this._crosstabConstants.ASCENDING:
                sortingTypeRequired = this._UNSORTED;
                break;
        }
    } else {
        sortingTypeRequired = this._crosstabConstants.DESCENDING;
    }

    this._crosstab.contextMenuHandler().emulateSortingMenuItemSelected(sortedDimensionMember, sortingTypeRequired);
};

/**
* Handle Touch events - in case of touch devices different approach is been taken
 * No hovering in case of touch devices
 * If no sorting icon shown for the dimension first selection will show the unsorted icon for users
 * @param target: target for executing the sorting
 * @param sort: flag that will trigger the click event only if true
 */
sap.basetable.crosstab.CrosstabSortingHandler.prototype._handleTouch = function(target, sort) {
    var targetState;
    var isAlreadyHaveUnsortedIcon;
    var sortingState = this._model.getSortingState();
    var measureMemberId = this._getMeasureMember(target);

    if (measureMemberId && (!sortingState ||  sortingState.measure.objId !== measureMemberId)) {
        targetState = this._UNSORTED;
    }

    if (targetState === this._UNSORTED) {
        isAlreadyHaveUnsortedIcon = target.find("." + this._SORTING_CLASS_UNSORTED);
    }
    if (isAlreadyHaveUnsortedIcon && isAlreadyHaveUnsortedIcon.length < 1) {
        var sortingElement = target.find(this._SORTING_FEEDBACK_SELECTION);
        sortingElement.addClass(this._SORTING_CLASS_UNSORTED);
    } else if (sort) {
        this._handleClick(target);
    }
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._setSortingState = function(sortObjId, sortDirection) {
    var target = this._getMeasureMemberElement(sortObjId);
    var sortingClass = sortDirection === this._crosstabConstants.ASCENDING ? this._SORTING_CLASS_ACSENDING : this._SORTING_CLASS_DESCENDING;
    target.find(this._SORTING_FEEDBACK_SELECTION).addClass(sortingClass);
    this._updateMeasureCellSize(target);
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._setTooltipForSortedMeasure = function() {
    var sortingState = this._model.getSortingState();

    if (!sortingState) {
        return;
    }

    var target = this._getMeasureMemberElement(sortingState.measure.objId);
    var sortingElement = target.find(this._SORTING_FEEDBACK_SELECTION);
    sortingElement.attr("title", this._getSortingTooltip(sortingState.measure.objId, sortingState));
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._getSortingTooltip = function (measureId, sortingState) {
    if (sortingState && sortingState.measure.objId === measureId) {
        switch (sortingState.direction) {
            case this._crosstabConstants.ASCENDING:
                return this._TOOLTIP_SORT_ASCENDING_BY.replace("{0}", this._getMeasureCaption(measureId));
            case this._crosstabConstants.DESCENDING:
                return this._TOOLTIP_SORT_DESCENDING_BY.replace("{0}", this._getMeasureCaption(measureId));
        }
    } else {
        return this._TOOLTIP_SORT_BY_DIMENSION;
    }
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._getDimensions = function (target) {
    var axisId;
    var targetCell = $(target).closest("div")[0];
    if (targetCell.id.indexOf(this._crosstabConstants.ROW_AXIS_HEADER_CELL) >= 0) {
        axisId = this._crosstabConstants.ROW_AXIS_INDEX;
    } else if (targetCell.id.indexOf(this._crosstabConstants.COLUMN_MEMBER_HEADER_CELL) >= 0) {
        axisId = this._crosstabConstants.COLUMN_AXIS_INDEX;
    } else {
        return null;
    }
    return this._model.getDimensions(axisId);
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._getMeasureMember = function (target) {
    var targetCell = $(target).closest("div")[0];
    var measuresPosition = this._model.getMeasuresPosition();
    var regexp;
    if (measuresPosition.axis === this._crosstabConstants.COLUMN) {
        regexp = this._crosstabConstants.REGEXP_COLUMN_HEADER;
    } else if (measuresPosition.axis === this._crosstabConstants.ROW) {
        regexp = this._crosstabConstants.REGEXP_ROW_HEADER;
    } else {
        return null;
    }

    var regexpResult = regexp.exec(targetCell.id);
    if (!regexpResult || regexpResult.length < 2) {
        return null;
    }
    var dimensionIndexes = regexpResult[1].split("_");
    var measureMembers = this._model.getMeasureMembers();
    var measureIndex = parseInt(dimensionIndexes[measuresPosition.level]);
    return measureIndex < measureMembers.length ? measureMembers[measureIndex].id : null;
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._getMeasureCaption = function (measureId) {
    var measures = this._model.getMeasuresValues();
    for (var i = 0; i < measures.length; i++) {
        if (measureId === measures[i].id) {
            return measures[i].name;
        }
    }
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._getMeasureMemberElement = function(sortObjId) {
    var measureMembers = this._model.getMeasureMembers();
    var measureMembersID;
    for (var i = 0; i < measureMembers.length; i++) {
        if (sortObjId === measureMembers[i].id) {
            var dimensionAxis = this._model.getMeasuresPosition().axis;
            if (dimensionAxis === this._crosstabConstants.COLUMN) {
                measureMembersID = this._crosstab.getId() + "-" + this._crosstabConstants.COLUMN_MEMBER_HEADER_CELL + "_" + i;
            } else if ( dimensionAxis === this._crosstabConstants.ROW ) {
                measureMembersID = this._crosstab.getId() + "-" + this._crosstabConstants.ROW_AXIS_HEADER_CELL + "_" + i;
            }
        }
    }
    return $("#" + measureMembersID);
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._getTextSize = function (target) {
    var elementWIdth;
    var cssStyle = {
        visibility: "hidden",
        position: "absolute",
        "font-family": target.css("font-family"),
        "font-size": target.css("font-size")
    };
    var element = document.createElement("span");
    element.textContent = target.text(); // TODO: Need to consider case of hyperlinks

    var $element = $(element);
    $element.css(cssStyle);
    target.parent().append(element);
    elementWIdth = $element.outerWidth();
    $element.remove();

    return elementWIdth;
};

/**
 * @param target: DOM target element
 * @param isIcon: sorting for icon? (if false, assumed to be sorting for context menu)
 */
sap.basetable.crosstab.CrosstabSortingHandler.prototype.shouldShowSort = function (target, isIcon) {
    // Do not show sorting menu items if:
    // rank is applied; we are in story mode; invoked outside the crosstab's layout area; target is a running calc
    var crosstabLayout = this._crosstab.crosstabContainers().getLayout();
    var measureId = this._getMeasureMember(target);
    if (!measureId ||
            this._model.getRankingState() ||
            this._crosstab.isCrosstabInStory() ||
            $(target).closest(crosstabLayout).length === 0 ||
            this._model.isCalculation(measureId)) {
        return false;
    }

    // called from context menu, checks if selectedItems is measures dimension
    if (!isIcon) {
        var selectionHandler = this._crosstab.selectionHandler();
        var selectedItems = selectionHandler.getSelectedItems();
        return selectedItems && selectedItems.dimension === this._crosstabConstants.MEASURE_NAMES_DIMENSION;
    }

    // NOTE: sortedDimension.id only looks at the root dimension
    var sortedDimension = this._getDimensions(target);
    return sortedDimension && (sortedDimension.length === 1) && (sortedDimension[0].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION);
};

sap.basetable.crosstab.CrosstabSortingHandler.prototype._updateMeasureCellSize = function (target) {
    var minimalWidth = this._MIN_TEXT_WIDTH;
    var targetWidh  = target.width();
    if (targetWidh - this._SORTING_WIDTH > minimalWidth) {
         target.find("." + this._crosstabConstants.CELL_CONTENT).css("max-width", targetWidh - this._SORTING_WIDTH + "px");
    } else {
        target.find("." + this._crosstabConstants.CELL_CONTENT).css("max-width", minimalWidth + "px");
        target.find(this._SORTING_FEEDBACK_SELECTION).addClass(this._SORTING_CLASS_BACKGROUND);
    }
};

/**
* Clean Unnecessary Sorting Icons - in case of touch devices, unsorted icon should be removed in case of switching to
* different dimension, or in case of clicking on any other place that remove the selection
* @param sortingContent: jQuery elements that can be sorted
*/
sap.basetable.crosstab.CrosstabSortingHandler.prototype._cleanUnnecessarySortingIcons = function(sortingContent) {
    var isUnsortedButNotSelectedContent = $(sortingContent)
                                            .filter("." + this._SORTING_CLASS_UNSORTED)
                                            .parent()
                                            .not("." + this._crosstab.selectionHandler().SELECTED_CELL_CLASS);
    isUnsortedButNotSelectedContent.find("." + this._SORTING_CLASS_UNSORTED).removeClass(this._SORTING_CLASS_UNSORTED);
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/

"use strict";
jQuery.sap.declare("sap.basetable.crosstab.CrosstabTooltipHandler");

sap.basetable.crosstab.CrosstabTooltipHandler = function (crosstab) {
    this._crosstab = crosstab;
    this._selectionHandler = crosstab.selectionHandler();
    this._contextMenuHandler = crosstab.contextMenuHandler();
    this._crosstabConstants = crosstab.getCrosstabConstants();
    this._languageManager = crosstab.getLanguageManager();

    this._tooltip = null;
    this._tooltipContainer = null;
    this._tooltipShown = false;
    this._tooltipEnabled = false;
    this._hoverObject = null;

    this._tooltipWidth = null;
    this._tooltipHeight = null;
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype = {
    FILTER_BUTTON_CLASS: "crosstab-filter-button",
    EXCLUDE_BUTTON_CLASS: "crosstab-exclude-button",
    DISABLED_BUTTON_CLASS: "crosstab-tooltip-disabled",
    TOOLTIP_CLASS: "v-m-tooltip",
    CONTEXTMENU_CLASS: "viz-controls-contextmenu"
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype.initTooltips = function () {
    if (this._tooltip) {
        return;
    }

    var frame = this._crosstab.getUI5Frame();
    // Dynamically build the tooltip if not already built
    this._renderTooltip(frame);
    this._tooltipShown = false;
    this._tooltipEnabled = false;
    this._hoverObject = null;

    this._tooltipWidth = this._tooltip.outerWidth();
    this._tooltipHeight = this._tooltip.outerHeight();

    $(frame).on("mousemove", this._handleTooltip.bind(this));
    $(this._tooltip).find("." + this.FILTER_BUTTON_CLASS).on("click", this._handleTooltipButton.bind(this, false));
    $(this._tooltip).find("." + this.EXCLUDE_BUTTON_CLASS).on("click", this._handleTooltipButton.bind(this, true));
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype.onContextmenuLoaded = function () {
    this._hideTooltip();
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype._renderTooltip = function (frame) {
    this._tooltipContainer = $("<div>")
                            .addClass("v-m-tooltip-container")
                            .addClass("crosstab-tooltip-container");

    this._tooltip = $("<div>")
                    .addClass(this.TOOLTIP_CLASS)
                    .addClass("crosstab-tooltip")
                    .hide();
    this._tooltipContainer.append(this._tooltip);
    this._tooltipContainer.insertAfter(frame);

    var tooltipBackground = $("<div>")
                                .addClass("v-background")
                                .addClass("crosstab-tooltip-background");
    this._tooltip.append(tooltipBackground);

    var tooltipExtension = $("<div>")
                            .addClass("v-tooltip-extension")
                            .addClass("crosstab-tooltip-extension");
    tooltipBackground.append(tooltipExtension);

    var tooltipActionBar = $("<div>")
                            .addClass("sap-bi-va-explorer-VizEditor-tooltip-action-bar")
                            .attr("tabindex", "0")
                            .attr("aria-disabled", "false");
    tooltipExtension.append(tooltipActionBar);

    var tooltipMatrixLayout = $("<table><tbody><tr></tr></tbody></table>")
                                .addClass("sap-bi-va-explorer-VizEditor-tooltip-action-bar-matrix-layout")
                                .addClass("sapUiMlt")
                                .addClass("crosstab-tooltip-matrix-layout")
                                .attr("role", "presentation")
                                .attr("cellpadding", "0")
                                .attr("cellspacing", "0");
    tooltipActionBar.append(tooltipMatrixLayout);

    var tooltipMatrixCell = $("<td>")
                                .addClass("sapUiMltCell")
                                .addClass("sapUiMltPadRight");
    var filterButton = $("<button>")
                        .addClass(this.FILTER_BUTTON_CLASS)
                        .addClass("sapUiBtn sapUiBtnLite sapUiBtnS sapUiBtnStd")
                        .attr("type", "button")
                        .attr("title", this._languageManager.get("XTAB_MENU_LABEL_FILTER"))
                        .attr("role", "button")
                        .attr("aria-disabled", "false")
                        .append(
                            $("<img>")
                                .addClass("sapUiBtnIco sapUiBtnIcoL")
                                .attr("src", this._crosstabConstants.BASE64_ICONS.FILTER)
                        )
                        .append(
                            $("<span>")
                                .addClass("sapUiBtnTxt")
                                .addClass("crosstab-tooltip-icon-caption")
                                .text(this._languageManager.get("XTAB_MENU_LABEL_FILTER"))
                        );
    var excludeButton = $("<button>")
                        .addClass(this.EXCLUDE_BUTTON_CLASS)
                        .addClass("sapUiBtn sapUiBtnLite sapUiBtnS sapUiBtnStd")
                        .attr("type", "button")
                        .attr("title", this._languageManager.get("XTAB_MENU_LABEL_EXCLUDE"))
                        .attr("role", "button")
                        .attr("aria-disabled", "false")
                        .append(
                            $("<img>")
                                .addClass("sapUiBtnIco sapUiBtnIcoL")
                                .attr("src", this._crosstabConstants.BASE64_ICONS.EXCLUDE)
                        )
                        .append(
                            $("<span>")
                                .addClass("sapUiBtnTxt")
                                .addClass("crosstab-tooltip-icon-caption")
                                .text(this._languageManager.get("XTAB_MENU_LABEL_EXCLUDE"))
                        );
    tooltipMatrixLayout.find("tr").append(tooltipMatrixCell.clone().append(filterButton));
    tooltipMatrixLayout.find("tr").append(tooltipMatrixCell.clone().append(excludeButton));
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype._handleTooltip = function (event) {
    if (this._isContextmenuShown()) {
        this._hideTooltip();
        return;
    }

    var overSelectedCell = event.target.className.indexOf(this._selectionHandler.SELECTED_CELL_CLASS) > -1;
    var selectedItems;

    if (!this._tooltipShown) {
        // Immediately leave if there's no tooltip and no selected item is hovered over
        if (!overSelectedCell) {
            return;
        }

        selectedItems = this._selectionHandler.getSelectedItems();
        if (selectedItems.dimension && selectedItems.dimension !== this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
            this._showTooltip(event);
        }
    } else if (overSelectedCell) {
        this._updateTooltip(event);
    } else if ($(event.target).closest("." + this.TOOLTIP_CLASS).length === 0) {
        this._hideTooltip();
    }
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype._updateTooltip = function (event) {
    if (this._selectionHandler.areAllDimensionMembersSelected()) {
        this._tooltip.find("button").addClass(this.DISABLED_BUTTON_CLASS);
        this._tooltipEnabled = false;
    } else {
        this._tooltip.find("button").removeClass(this.DISABLED_BUTTON_CLASS);
        this._tooltipEnabled = true;
    }

    // Find the top element that has the selected class
    var topSelectedObject = $(event.target);
    var selectedParent = topSelectedObject.parent("." + this._selectionHandler.SELECTED_CELL_CLASS);
    if (selectedParent.length) {
        topSelectedObject = selectedParent;
    }

    if (topSelectedObject.length && topSelectedObject[0] !== this._hoverObject) {
        var tooltipContainerOffset = this._tooltipContainer.offset();
        var mouseX = event.x || event.pageX,
            mouseY = event.y || event.pageY,
            containerX = mouseX - tooltipContainerOffset.left,
            containerY = mouseY - tooltipContainerOffset.top;
        if (containerX + this._tooltipWidth > $(event.target).closest(this._crosstabConstants.VIZ_ROOT).width()) {
            containerX -= this._tooltipWidth;
        }
        this._tooltip.css({
            top: (containerY - this._tooltipHeight) + "px",
            left: containerX + "px"
        });
        this._hoverObject = topSelectedObject[0];
    }
};

// Figures out if buttons should be enabled and shows the tooltip
sap.basetable.crosstab.CrosstabTooltipHandler.prototype._showTooltip = function (event) {
    this._updateTooltip(event);
    this._tooltip.show();
    this._tooltipShown = true;
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype._hideTooltip = function () {
    if (this._tooltipShown) {
        this._tooltip.hide();
        this._tooltipShown = false;
        this._hoverObject = null;
    }
};

sap.basetable.crosstab.CrosstabTooltipHandler.prototype._handleTooltipButton = function (isExclude) {
    if (!this._tooltipShown || !this._tooltipEnabled) {
        return;
    }

    this._contextMenuHandler.emulateFilterMenuItemSelected(isExclude);
};

// TODO: CVOM's contextmenu doesn't expose its current state, so we have to get creative.
// This is a very fragile condition and can be broken if context menu moves to somwhere
// else other than immediately under <body>. It's performant as is though.
sap.basetable.crosstab.CrosstabTooltipHandler.prototype._isContextmenuShown = function () {
    return $("body").children("." + this.CONTEXTMENU_CLASS).length > 0;
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
/*global $:false */
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.ExternalScrollHandler");


sap.basetable.crosstab.ExternalScrollHandler = function (UI5Crostab) {
    this._UI5Crostab = UI5Crostab;
    this._crosstab = this._UI5Crostab.getCrosstab();
    this._crosstabConstants = this._crosstab.getCrosstabConstants();
};

sap.basetable.crosstab.ExternalScrollHandler.prototype = {
    _data : null,
    _currentRow : 0,
    _currentCol : 0,
    _direction : Object.freeze({horizontal: "horizontal", vertical : "vertical", undetermined : "undetermined"})
};

sap.basetable.crosstab.ExternalScrollHandler.prototype.getUI5Crosstab = function () {
    return this._UI5Crostab;
};


sap.basetable.crosstab.ExternalScrollHandler.prototype.doScroll = function (newData) {
    var direction = this._determineDirection(newData);
    this._data = newData;
    if (direction === this._direction.vertical) {
        this._handleVerticalScroll();
    } else if (direction === this._direction.horizontal) {
        this._handleHorizontalScroll();
    }
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._handleVerticalScroll = function() {
    var multiplePagesExist = this._getMultiplePagesExist(this._direction.vertical);

    if (multiplePagesExist) {
        var containerScrollTop = this._data.containerScrollTop;
        var containerOffsetTop = this._data.containerOffsetTop;
        var containerHeight = this._data.containerHeight;
        var containerBottom = containerScrollTop + containerHeight;

        var UI5CrostabObj = $("#" + this._UI5Crostab.sId);

        if (this._getUI5CrosstabValid(UI5CrostabObj)) {
            var crosstabTop = (UI5CrostabObj.offset().top / this.getUI5Crosstab().getScaleFactor()) - containerOffsetTop;
            var crosstabHeight =  UI5CrostabObj.height() * this.getUI5Crosstab().getScaleFactor();

            var atBeginning = this._getAtBeginning(crosstabTop, containerBottom);

            var start = -1;

            if (atBeginning) {
                start = 0;
            } else {
                crosstabTop = Math.abs(crosstabTop);
                if(crosstabHeight > crosstabTop) {
                  start = crosstabTop;
                }
            }

            if (start >= 0) {
                var cellHeight = this._crosstab.getRowCellHeight();
                var headerHeight = this._getDimensionCount(this._crosstabConstants.COLUMN_AXIS_INDEX) * cellHeight;
                var currentRow = (start- headerHeight) / cellHeight;
                currentRow = Math.ceil(currentRow);

                if(currentRow < 0) {
                    currentRow = 0;
                }
                this._crosstab.model().setVerticalScrollPosition(currentRow);

                var recentPageData = this._crosstab.model().getRecentPageData();
                var visibleRowsInWindow = Math.ceil(containerHeight / cellHeight);
                var aboveCurrentView = currentRow < recentPageData.coordinates.startRowIndex;
                var belowCurrentView  = (currentRow + visibleRowsInWindow) >= recentPageData.coordinates.endRowIndex;

                if (aboveCurrentView || belowCurrentView) {
                    this._crosstab.publishNextPageEvent(this._getEmptyPageData());
                    return;
                }
            }
        }
    }
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._getEmptyPageData = function(){
    var pageData = {
        redrawRowAxisHeader : null,
        redrawRowAxisContent : null,
        redrawColumnHeader : null,
        coordinates : {
            startRowIndex : null,
            startColumnIndex : null,
            endRowIndex : null,
            endColumnIndex : null
        }
    };
    return pageData;
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._handleHorizontalScroll = function() {
    var multiplePagesExist = this._getMultiplePagesExist(this._direction.horizontal);

    if (multiplePagesExist) {
        var containerScrollLeft = this._data.containerScrollLeft;
        var containerOffsetLeft = this._data.containerOffsetLeft;
        var containerWidth = this._data.containerWidth;
        var containerRight = containerScrollLeft + containerWidth;


        var UI5CrostabObj = $("#" + this._UI5Crostab.sId);

        if (this._getUI5CrosstabValid(UI5CrostabObj)) {
            var crosstabLeft = (UI5CrostabObj.offset().left / this.getUI5Crosstab().getScaleFactor()) - containerOffsetLeft ;
            var crosstabWidth =  UI5CrostabObj.width() * this.getUI5Crosstab().getScaleFactor();
            var atBeginning = this._getAtBeginning(crosstabLeft, containerRight);
            var start = -1;

            if (atBeginning) {
                start = 0;
            } else {
                crosstabLeft = Math.abs(crosstabLeft);
                if (crosstabWidth > crosstabLeft) {
                  start = crosstabLeft;
                }
            }

            if (start >= 0) {
                var cellWidth = this._crosstab.getColumnCellWidth();
                var headerWidth = this._getDimensionCount(this._crosstabConstants.ROW_AXIS_INDEX) * cellWidth;
                var currentCol = (start - headerWidth) / cellWidth;
                currentCol = Math.ceil(currentCol);

                if (currentCol < 0) {
                    currentCol = 0;
                }
                this._crosstab.model().setHorizontalScrollPosition(currentCol);

                var recentPageData = this._crosstab.model().getRecentPageData();
                var visibleColsInWindow = Math.ceil(containerWidth / cellWidth);
                var leftOfCurrentView = currentCol < recentPageData.coordinates.startColumnIndex;
                var rightOFCurrentView  = (currentCol + visibleColsInWindow) >= recentPageData.coordinates.endColumnIndex;

                if (leftOfCurrentView||rightOFCurrentView) {
                    this._crosstab.publishNextPageEvent(this._getEmptyPageData());
                }
            }
        }
    }
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._getUI5CrosstabValid = function(UI5CrostabObj) {



    if (!UI5CrostabObj) {
        return false;
    }

    if (typeof UI5CrostabObj.offset !== "function" || UI5CrostabObj.offset() === null) {
        return false;
    }

    if (typeof UI5CrostabObj.height !== "function" || typeof UI5CrostabObj.width !== "function") {
        return false;
    }

    return true;
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._getAtBeginning = function(startOfRange, endOfRange) {
   return startOfRange >=0 && startOfRange <= endOfRange;
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._getMultiplePagesExist = function(direction) {
    var axis;
    var pageSize;
    if (direction === this._direction.vertical) {
       axis = this._crosstabConstants.ROW_AXIS_INDEX;
        pageSize = this._crosstab.model().getPageRowSize();
    } else {
        axis = this._crosstabConstants.COLUMN_AXIS_INDEX;
        pageSize = this._crosstab.model().getPageColumnSize();
    }

    return this._crosstab.model().getFullAxisLength(axis) > pageSize;
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._determineDirection = function (newData) {
    var verticalOffsetDelta = newData.containerScrollTop;
    var horizontalOffsetDelta = newData.containerScrollLeft;

    if (this._data) {
        verticalOffsetDelta -= this._data.containerScrollTop;
        horizontalOffsetDelta -= this._data.containerScrollLeft;
    }

    return this._getDirection(verticalOffsetDelta, horizontalOffsetDelta);
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._getDirection = function(verticalOffsetDelta, horizontalOffsetDelta) {
    var direction = this._direction.undetermined;

    if (verticalOffsetDelta !== 0 && horizontalOffsetDelta === 0) {
        direction = this._direction.vertical;
    } else if (horizontalOffsetDelta !== 0 && verticalOffsetDelta === 0) {
        direction = this._direction.horizontal;
    }
    return direction;
};

sap.basetable.crosstab.ExternalScrollHandler.prototype._getDimensionCount = function(axis) {
    var dimensionCount = this._crosstab.model().getDimensions(axis).length;
    if (axis === this._crosstabConstants.COLUMN_AXIS_INDEX) {
        dimensionCount += 1;
    }
    return dimensionCount;
};
jQuery.sap.declare("sap.basetable.crosstab.Format");

sap.basetable.crosstab.Format = function () {
    this._type;
    this.body;
};

sap.basetable.crosstab.Format.TYPE_STYLE = "style";
sap.basetable.crosstab.Format.TYPE_SIMPLE = "simple";
sap.basetable.crosstab.Format.TYPE_CONDITIONS = "conditions";

sap.basetable.crosstab.Format.prototype.type = function (type) {
};

sap.basetable.crosstab.Format.prototype.body = function (body) {
};
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

jQuery.sap.declare("sap.basetable.crosstab.MockBIQueryModelRequestHandler");

sap.basetable.crosstab.MockBIQueryModelRequestHandler = function (data, crosstabDataProvider) {
    this._jsonData = data;
    this._crosstabDataProvider = crosstabDataProvider;
};

sap.basetable.crosstab.MockBIQueryModelRequestHandler.prototype._truncateInitialData = function (jsonData, pageSize) {
    var response = {
        dimAxes: {}
    };

    // filter the dimAxes
    var axisName;
    for (axisName in jsonData.queryResponse[0].dimAxes) {
        response.dimAxes[axisName] = {};
        response.dimAxes[axisName].values = jsonData.queryResponse[0].dimAxes[axisName].values.slice(0, pageSize);
        response.dimAxes[axisName].count = jsonData.queryResponse[0].dimAxes[axisName].count; // TODO we are assuming count will always be the full axis length
    }

    response.ranges = jsonData.queryResponse[0].ranges;

    response.valueAxes = [];

    // filter the valueAxes
    for (var valueAxesIndex = 0; valueAxesIndex < jsonData.queryResponse[0].valueAxes.length; ++valueAxesIndex) {
        var valueAxesObject = jsonData.queryResponse[0].valueAxes[valueAxesIndex];

        var addValueAxesObject = true;
        for (axisName in jsonData.queryResponse[0].dimAxes) {
            if (valueAxesObject[axisName] >= pageSize) {
                addValueAxesObject = false;
                break;
            }
        }
        if (addValueAxesObject) {
            response.valueAxes.push(valueAxesObject);
        }
    }

    response.calculations =  jsonData.queryResponse[0].calculations;
    response.metadata =  jsonData.queryResponse[0].metadata;
    response.executionStatus =  jsonData.queryResponse[0].executionStatus;

    var windowData = {
        queryRequest: jsonData.queryRequest,
        queryResponse: [response],
        consumptionModel: jsonData.consumptionModel,
        feeding: jsonData.feeding
    };

    return windowData;
};

// simulates query response for the inital window request (top-left corner)
sap.basetable.crosstab.MockBIQueryModelRequestHandler.prototype._fetchInitialWindow = function (pageSize) {
    var windowData = this._truncateInitialData(this._jsonData, pageSize);

    this._crosstabDataProvider._initialize(windowData);
};

// simulates query response for axes metadata request
sap.basetable.crosstab.MockBIQueryModelRequestHandler.prototype._fetchAxesMetadata = function (metadataFeedIds, rowAxisName, columnAxisName) {
    var response = {
        dimAxes: {}
    };

    // filter the dimAxes
    for (var i = 0; i < metadataFeedIds.length; ++i) {
        var axisName = metadataFeedIds[i] === "rows" ? rowAxisName : columnAxisName;
        response.dimAxes[axisName] = {
            values: this._jsonData.queryResponse[0].dimAxes[axisName].values,
            count: this._jsonData.queryResponse[0].dimAxes[axisName].count
        };
    }

    response.ranges = this._jsonData.queryResponse[0].ranges;

    response.valueAxes = [];

    response.calculations =  this._jsonData.queryResponse[0].calculations;
    response.metadata =  this._jsonData.queryResponse[0].metadata;
    response.executionStatus =  this._jsonData.queryResponse[0].executionStatus;

    var windowData = {
        queryRequest: this._jsonData.queryRequest,
        queryResponse: [response],
        consumptionModel: this._jsonData.consumptionModel,
        feeding: this._jsonData.feeding
    };

    this._crosstabDataProvider.initializeAxesMetadata(windowData);
};

// simulates query response for window request
sap.basetable.crosstab.MockBIQueryModelRequestHandler.prototype._fetchWindow = function (pageSpecification, measureGroupName, rowAxisName, columnAxisName) {
    // var windowQueryRequest = {
    //     version: "2.0",
    //     queries: []
    // };

    //var windowQueryResponse = [];

    //for (var pageSpecIndex = 0; pageSpecIndex < pageSpecifications.length; ++pageSpecIndex) {
    for (var queryWindowIndex = 0; queryWindowIndex < pageSpecification.queryWindowSpecifications.length; ++queryWindowIndex) {
        var windowQueryRequest = {
            version: "2.0",
            queries: []
        };

        var windowQueryResponse = [];

        //var pageSpec = pageSpecifications[pageSpecIndex];
        var queryWindowSpec = pageSpecification.queryWindowSpecifications[queryWindowIndex];

        var query = {};
        var response = {
            dimAxes: {}
        };

        var axisName, startIndex, endIndex;

        //for (axisName in pageSpec) {
        for (var feedType in queryWindowSpec) {
            axisName = feedType === "rows" ? rowAxisName : columnAxisName;
            query[axisName] = {
                //page: pageSpec[axisName].page,
                page: queryWindowSpec[feedType].page,
                //pageSize: pageSpec[axisName].pageSize,
                pageSize: queryWindowSpec[feedType].pageSize,
                axisType: this._jsonData.queryRequest.queries[0][axisName].axisType,
                components: this._jsonData.queryRequest.queries[0][axisName].components,
                calculations: this._jsonData.queryRequest.queries[0][axisName].calculations
            };

            //startIndex = pageSpec[axisName].page * pageSpec[axisName].pageSize;
            startIndex = queryWindowSpec[feedType].page * queryWindowSpec[feedType].pageSize;
            //endIndex = (startIndex + pageSpec[axisName].pageSize) - 1;
            endIndex = (startIndex + queryWindowSpec[feedType].pageSize) - 1;
            response.dimAxes[axisName] = {
                values: this._jsonData.queryResponse[0].dimAxes[axisName].values.slice(startIndex, endIndex + 1),
                count: this._jsonData.queryResponse[0].dimAxes[axisName].count // TODO we are assuming count will always be the full axis length
            };
        }
        windowQueryRequest.queries.push(query);

        response.ranges = this._jsonData.queryResponse[0].ranges;

        response.valueAxes = [];
        for (var valueAxesIndex = 0; valueAxesIndex < this._jsonData.queryResponse[0].valueAxes.length; ++valueAxesIndex) {
            var valueAxesObject = this._jsonData.queryResponse[0].valueAxes[valueAxesIndex];
            var addValueAxesObject = true;
            var value = {};
            //for (axisName in pageSpec) {
            for (feedType in queryWindowSpec) {
                //startIndex = pageSpec[axisName].page * pageSpec[axisName].pageSize;
                startIndex = queryWindowSpec[feedType].page * queryWindowSpec[feedType].pageSize;
                //endIndex = (startIndex + pageSpec[axisName].pageSize) - 1;
                endIndex = (startIndex + queryWindowSpec[feedType].pageSize) - 1;
                if (valueAxesObject[axisName] < startIndex || valueAxesObject[axisName] > endIndex) {
                    addValueAxesObject = false;
                    break;
                }
                // offset tuple index by start index
                value[axisName] = valueAxesObject[axisName] - startIndex;
            }
            if (addValueAxesObject) {
                value[measureGroupName] = valueAxesObject[measureGroupName];
                response.valueAxes.push(value);
            }
        }

        response.calculations =  this._jsonData.queryResponse[0].calculations;
        response.metadata =  this._jsonData.queryResponse[0].metadata;
        response.executionStatus =  this._jsonData.queryResponse[0].executionStatus;

        windowQueryResponse.push(response);

        var windowData = {
            queryRequest: windowQueryRequest,
            queryResponse: windowQueryResponse,
            consumptionModel: this._jsonData.consumptionModel,
            feeding: this._jsonData.feeding
        };

        this._crosstabDataProvider.addPage(pageSpecification.coordinates, queryWindowIndex, windowData);
    }

};
jQuery.sap.declare("sap.basetable.crosstab.PageManager");

// TODO for now pass in crossstabDataProvider to access the helper methods
sap.basetable.crosstab.PageManager = function (data, pageRequestHandler, crosstabDataProvider, crosstab) {
    this._crosstabDataProvider = crosstabDataProvider;

    // for each axis, temporarily store an array of concatenated tuple member keys
    // once the axis tuple map is constructed, delete
    this._axisTupleArray = {};

    // for each axis, store the number of aggregations per subtotal level
    this._axisSubtotalLevelNumAggregationsMap = {};

    // for each axis, an array of axis tuple information
    this._axisTupleMaps = {};

    this._pendingPageRequests = [];
    this._inProcessPageRequest = undefined;

    this._initializePageSize();

    // TODO purge the page cache
    this._pageCache = []; // [rowAxisIndex][columnAxisIndex]

    this._pageResults = [];

    this._eDispatch = crosstab.getDispatch();
    this._crosstab = crosstab;
    this._model = crosstab.model();
    this._metadataFeedIds = [];
    this._pendingMetadataRequests = [];
    this._initializingAxesMetadata = false;

    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();
};

// Default page size of the tuple trees generated and cached by the page manager.
// The size applies to both rows and columns, ie. square page.
// Not to be confused with the page size specification that is used for rendering.
sap.basetable.crosstab.PageManager.PAGE_SIZE = 100;

sap.basetable.crosstab.PageManager.prototype._initializePageSize = function () {
    // TODO Temporary solution allowing the user to specify the page size via web URL.
    // Still to decide whether we should allow the user to specify the page size that way
    // for Lumira Server. Ideally, the administrator would be able to specify the page
    // size from HANA.
    // Still need to allow Lumira Desktop to specify the page size.
    var parameterValue = sap.basetable.crosstab.utils.ParameterUtils.getURLValue("pageSize");
    var pageSize = sap.basetable.crosstab.PageManager.PAGE_SIZE;
    if (parameterValue) {
        pageSize = Math.max(parameterValue, pageSize);
    }

    this._pageSize = pageSize;
};

sap.basetable.crosstab.PageManager.prototype.getPageSize = function () {
    return this._pageSize;
};

sap.basetable.crosstab.PageManager.prototype.initialize = function (initialWindowData) {
    var windowData;
    if (initialWindowData.windowing) {
        this._queryRequestHandler = new sap.basetable.crosstab.MockBIQueryModelRequestHandler(initialWindowData, this._crosstabDataProvider);
        this._eDispatch = d3.dispatch("mock_axesMetadataRequest", "mock_pageRequest");
        this._eDispatch.on("mock_axesMetadataRequest", this._queryRequestHandler._fetchAxesMetadata);
        this._eDispatch.on("mock_pageRequest", this._queryRequestHandler._fetchWindow);
        windowData = this._queryRequestHandler._truncateInitialData(initialWindowData, this._pageSize);
    } else {
        windowData = initialWindowData;
    }

    // discover the measure axis, position, and number of members
    this._measureAxisType = null;
    var result = this._crosstabDataProvider._processAxisFeeding(windowData.feeding.cols);
    this._columnDimensionIdArray = result.dimensionIdArray;
    if (result.measureAxisPosition !== null) {
        this._measureAxisType = "column";
        this._measureAxisPosition = result.measureAxisPosition;
        this._numMeasures = result.numMeasures;
    }
    result = this._crosstabDataProvider._processAxisFeeding(windowData.feeding.rows);
    this._rowDimensionIdArray = result.dimensionIdArray;
    if (this._measureAxisType === null && result.measureAxisPosition !== null) {
        this._measureAxisType = "row";
        this._measureAxisPosition = result.measureAxisPosition;
        this._numMeasures = result.numMeasures;
    }

    // set meausre axis Type and position for CrosstabDataProvider
    this._crosstabDataProvider.setMeasureAxisType(this._measureAxisType);
    this._crosstabDataProvider.setMeasureAxisPosition(this._measureAxisPosition);
    // The isolateGrandTotals function in CrosstabDataProvider needs _measureAxisType and _measureAxisPosition
    // So this funciton can only be called after setMeasureAxisType and setMeasureAxisPosition are updated
    this._anchoredTotals = this._model.isGrandTotalsCurrentlyAnchored();
    if (this._anchoredTotals === undefined) {
        this._anchoredTotals = this._crosstabDataProvider.isolateGrandTotals();
    }
    // record the captions
    this._entityIdCaptionMap = this._crosstabDataProvider._buildEntityIdCaptionMap(windowData.feeding);
    this._measureIdCaptionMap = this._crosstabDataProvider.buildMeasureIdCaptionMap(windowData.measureMetadata);


    var query = windowData.queryRequest ? windowData.queryRequest.queries[0] : null;
    var queryResponse = windowData.queryResponse[0];

    // discover the row and column axis names
    this._columnAxisName = this._crosstabDataProvider._findAxisName(queryResponse, this._columnDimensionIdArray);
    this._rowAxisName = this._crosstabDataProvider._findAxisName(queryResponse, this._rowDimensionIdArray);

    // determine the measure axis name
    this._measureAxisName = null;
    if (this._measureAxisType === "row") {
        this._measureAxisName = this._rowAxisName;
    } else if (this._measureAxisType === "column") {
        this._measureAxisName = this._columnAxisName;
    }

    // relying on query request to get the measureGroupName
    this._measureGroupName = this._crosstabDataProvider._findMeasureGroupName(query);

    // record the number of aggregations per subtotal level per axis
    if (this._rowAxisName) {
        this._axisSubtotalLevelNumAggregationsMap[this._rowAxisName] = this._buildSubtotalLevelNumAggregationsMap(this._rowAxisName, queryResponse);
    }
    if (this._columnAxisName) {
        this._axisSubtotalLevelNumAggregationsMap[this._columnAxisName] = this._buildSubtotalLevelNumAggregationsMap(this._columnAxisName, queryResponse);
    }

    // record the axis length based on the data passed in
    this._axisTupleLengths = {};
    var dimAxes = queryResponse.dimAxes;
    if (dimAxes[this._columnAxisName]) {
        this._axisTupleLengths[this._columnAxisName] = dimAxes[this._columnAxisName].count;
    }
    if (dimAxes[this._rowAxisName]) {
        this._axisTupleLengths[this._rowAxisName] = dimAxes[this._rowAxisName].count;
    }

    // Determine the feed Ids of the axis which we require to fetch metadata for.
    // If the actual axis length is less than the reuested page size, then we know
    // the query response contains metadata for the entire axis, in which case
    // create the axis tuple map for the axis.
    if (query) {
        var axesContainer = query.layout ? query.layout : query;
        if (this._columnAxisName) {
            if (axesContainer[this._columnAxisName] && this._axisTupleLengths[this._columnAxisName] < axesContainer[this._columnAxisName].pageSize) {
                this._initializeAxisMetadata(this._columnAxisName, query, queryResponse);
            } else {
                this._metadataFeedIds.push("cols");
            }
        }
        if (this._rowAxisName) {
            if (axesContainer[this._rowAxisName] && this._axisTupleLengths[this._rowAxisName] < axesContainer[this._rowAxisName].pageSize) {
                this._initializeAxisMetadata(this._rowAxisName, query, queryResponse);
            } else {
                this._metadataFeedIds.push("rows");
            }
        }
        // TODO Previously, we only needed the full axis metadata for certain conditions.
        // However, currently NETT adapter cannot return the full axis length when there
        // are multiple dimension stacked on the axis. We are then forced to fetch (in pages)
        // the metadata for each axis to determine its length.

        // Flag introduced to indicated whether the query response contains data for the
        // whole visualization.
        // TODO Hopefully we can remove this flag once we ensure the query response is
        // always complete.
        this._initializedWithFullQuery = this._metadataFeedIds.length === 0;
    }

    var actualRowAxisPageSize = this._rowAxisName ? Math.max(this._pageSize, queryResponse.dimAxes[this._rowAxisName].values.length) : undefined;
    var actualColumnAxisPageSize = this._columnAxisName ? Math.max(this._pageSize, queryResponse.dimAxes[this._columnAxisName].values.length) : undefined;

    var windowPageSpecification = this._createInitialWindowPageSpecification(actualRowAxisPageSize, actualColumnAxisPageSize);

    var windowMeasuresSpecification = this._createInitialWindowMeasuresSpecification(queryResponse);

    var appendAllRowSubtotals = actualRowAxisPageSize ? actualRowAxisPageSize >= this._axisTupleLengths[this._rowAxisName] : true;
    var appendAllColumnSubtotals = actualColumnAxisPageSize ? actualColumnAxisPageSize >= this._axisTupleLengths[this._columnAxisName] : true;

    var currentTupleTrees = this._crosstabDataProvider._buildTupleTrees(
        query,
        queryResponse,
        this._entityIdCaptionMap,
        this._measureIdCaptionMap,
        this._rowAxisName,
        this._columnAxisName,
        this._measureAxisType,
        this._measureGroupName,
        this._measureAxisPosition,
        windowPageSpecification,
        windowMeasuresSpecification,
        this._axisTupleLengths,
        appendAllRowSubtotals,
        appendAllColumnSubtotals,
        this._anchoredTotals);

    this._storeInCache(currentTupleTrees, {rowPageIndex: 0, columnPageIndex: 0}, this._pageSize);
};

sap.basetable.crosstab.PageManager.prototype.initializePageManagerForAnchoredTotals = function () {
    if (!this._model.containsGrandTotals()) {
        this._model.setCachedGrandTotalNodes([]);
    } else if (this._model.getGrandTotalNodes(0).length > 0) {
        // this._model.getGrandTotalNodes(0) could return 0 when the grand totals are not anchored.
        // We only want to cache grandTotalsNodes in _cachedGrandTotalNodes (in crosstabModel) when grand totals present in crosstab and they are anchored.
        // The reason to do this is that when the crosstab is resized smaller than its container which causes de-anchoring, that sets grandTotalNodes in CrosstabModel empty.
        // As we cannot calculate grandTotalHight with empty node, we cache it so that we can determine if we have enough space to anchore grand totals or not later on.
        this._model.setCachedGrandTotalNodes(this._model.getGrandTotalNodes(this._crosstabConstants.ROW_AXIS_INDEX));
    }

    var isolateGrandTotals = this._model.isolateGrandTotals();
    var canBeAnchored = this._crosstab.getRenderer().canGrandTotalsBeAnchored();
    var isAnchored = this._model.isGrandTotalsCurrentlyAnchored();

    // Only initialize the PageManager if the internal state for anchored totals and the user preference in dialog are different.
    // This is becuase the tupletree are in the incorrect state to fetch the grand totals.
    // (e.g. If the user has opted to see anchored totals and the crosstab has enough space to show anchored totals, we don't need to call initializePageManager.
    // If the user has opted to see anchored totals, however there is not enough space for anchored totals,
    // we need to initializePageManager to update tupletree to position the grand totals correctly.)
    if(isolateGrandTotals && this._model.containsGrandTotals() && canBeAnchored !== isAnchored) {
        this._model.setIsGrandTotalsCurrentlyAnchored(canBeAnchored);
        this._crosstabDataProvider.initializePageManager();
        var pageSize = {};
        pageSize.rows = this._model.getPageRowSize();
        pageSize.columns = this._model.getPageRowSize();
        this._crosstabDataProvider.initializePageSizeSpecification(pageSize);
        this._model.rebuildTupleTree();
        this._crosstab.getCrosstabScrollBarController().updatePage();
    }
};

sap.basetable.crosstab.PageManager.prototype._initializeAxisMetadata = function (axisName, queryRequest, queryResponse) {
    var measuresInfo;
    if (this._measureAxisPosition !== undefined) {
        measuresInfo = this._crosstabDataProvider._buildMeasuresInfo(queryRequest, this._measureGroupName, this._measureAxisPosition);
    }
    this._axisTupleMaps[axisName] = this._buildAxisTupleMap(
        axisName,
        queryResponse,
        this._measureAxisName,
        measuresInfo,
        this._axisSubtotalLevelNumAggregationsMap[axisName]);
};

sap.basetable.crosstab.PageManager.prototype.initializeAxesMetadata = function () {
    if (this._initializingAxesMetadata) {
        return;
    }

    if (this._metadataFeedIds.length > 0) {
        for (var i = this._metadataFeedIds.length - 1; i >= 0; --i) {
            var metadataQueryWindow = {};
            var feedId = this._metadataFeedIds[i];
            metadataQueryWindow[feedId] = {
                page: 0,
                // TODO have to do more testing to determine an appropriate page size for metadata
                pageSize: (this._pageSize * 100) - 1
            };
            this._metadataFeedIds.splice(i, 1);

            // we process metadata query separately for each axis
            this._pendingMetadataRequests.push(metadataQueryWindow);
        }

        this._eDispatch.crosstableMembersRequest(this._pendingMetadataRequests[0]);
        this._pendingMetadataRequests.shift();

        this._initializingAxesMetadata = true;
    }
};

// update with the next page axes metadata information
// TODO do some refactoring to pass in the feed id. We should not assume that the axis name in the query response
// corresponds to the row or column axis name that we store. Also, since we only query metadata one axis at a
// time, there should only be one axis in the response.
sap.basetable.crosstab.PageManager.prototype.updateAxesMetadata = function (windowMetaData, metadataUpdateHandler) {
    var queryRequest = windowMetaData.queryRequest.queries[0];
    var queryResponse = windowMetaData.queryResponse[0];

    var metadataQueryWindow;

    for (var axisName in queryResponse.dimAxes) {
        if (queryResponse.dimAxes.hasOwnProperty(axisName)) {

            this._updateAxisTupleArray(axisName, queryResponse);

            var requestedPage = windowMetaData.queryRequest.queries[0][axisName].page;
            var requestedPageSize = windowMetaData.queryRequest.queries[0][axisName].pageSize;

            var axisIndex = (axisName === this._rowAxisName) ? 0 : 1;

            var axisObject = queryResponse.dimAxes[axisName];
            if (axisObject.values.length === requestedPageSize) {
                var currentAxisTupleLength = (requestedPage + 1) * requestedPageSize;
                if (this._axisTupleLengths[axisName] < currentAxisTupleLength) {
                    this._axisTupleLengths[axisName] = currentAxisTupleLength;
                    // callback to crosstab model to redraw scrollbars
                    metadataUpdateHandler.setFullAxisLength(axisIndex, this._axisTupleLengths[axisName]);
                }

                var feedId = axisName === this._rowAxisName ? "rows" : "cols";
                if (!metadataQueryWindow) {
                    metadataQueryWindow = {};
                }
                metadataQueryWindow[feedId] = {
                    page: requestedPage + 1,
                    pageSize: requestedPageSize
                };

                this._pendingMetadataRequests.push(metadataQueryWindow);

            } else {
                // number of axis tuples is less than requested page size, meaning we've reached the
                // last page of metadata - now build the axis tuple map
                var measuresInfo;
                if (this._measureAxisPosition !== undefined) {
                    measuresInfo = this._crosstabDataProvider._buildMeasuresInfo(queryRequest, this._measureGroupName, this._measureAxisPosition);
                }
                this._axisTupleMaps[axisName] = this._buildAxisTupleMap(
                    axisName,
                    queryResponse,
                    this._measureAxisName,
                    measuresInfo,
                    this._axisSubtotalLevelNumAggregationsMap[axisName],
                    this._axisTupleArray[axisName]);
                // once we build the axis tuple map, we can delete the array of tuple member keys
                delete this._axisTupleArray[axisName];

                // callback to crosstab model to redraw scrollbars
                metadataUpdateHandler.setFullAxisLength(axisIndex, this.getFullAxisLengthByIndex(axisIndex));
            }
        }
    }

    if (this._pendingMetadataRequests.length > 0) {
        this._eDispatch.crosstableMembersRequest(this._pendingMetadataRequests[0]);
        this._pendingMetadataRequests.shift();
    } else {
        // We've retrieved all meta-data information, now we can process
        // the pending page requests.
        this._initializingAxesMetadata = false;
        this._processNextPendingPageRequest();
    }
};

// creates a map of subtotal level to total number of aggregations
sap.basetable.crosstab.PageManager.prototype._buildSubtotalLevelNumAggregationsMap = function (axisName, response) {
    var numAggregationsMap = [];

    if (response.calculations) {
        var axisCalculations = response.calculations[axisName];
        if (axisCalculations) {
            for (var calcIndex = 0; calcIndex < axisCalculations.length; ++calcIndex) {
                var calcValues = axisCalculations[calcIndex].values;
                if (calcValues.length > 0) {
                    var calcValue = calcValues[0];
                    var axisCoords = calcValue.window[axisName];
                    var level = axisCoords === undefined ? 0 : axisCoords.length;
                    var numAggregations = calcValue.values.length;

                    var recordedNumAggregations = numAggregationsMap[level] === undefined ? 0 : numAggregationsMap[level];
                    numAggregationsMap[level] = recordedNumAggregations + numAggregations;
                }
            }
        }
    }

    return numAggregationsMap;
};

sap.basetable.crosstab.PageManager.prototype._buildAxisTupleMap = function (axisName, metadataResponse, measureAxisName, measuresInfo, subtotalLevelNumAggregationsMap, axisTuples) {
    var axisTupleMap = [];

    var startIndex = 0;
    var measureIndex = measureAxisName === axisName ? 0 : undefined;

    var dimTupleIndex = startIndex;
    var dimTuples = axisTuples ? axisTuples : metadataResponse.dimAxes[axisName].values;
    while (dimTupleIndex < dimTuples.length) {

        axisTupleMap.push({
            axisTupleIndex: dimTupleIndex,
            measureIndex: measureIndex
        });

        var dimTuple = dimTuples[dimTupleIndex];
        var nextDimTuple = dimTuples[dimTupleIndex + 1];

        var startLevel = 0;
        var endLevel = dimTuple.length;
        var tupleSameAsNext = false;

        if (nextDimTuple !== undefined) {
            tupleSameAsNext = true;
            for (var index = 0; index < nextDimTuple.length; ++index) {
                if (dimTuple[index] !== nextDimTuple[index]) {
                    tupleSameAsNext = false;
                    startLevel = index + 1;
                    endLevel = nextDimTuple.length;
                    break;
                }
            }
        }

        // Only add the subtotals to the map if the current tuple is not identical to the next tuple. This avoids adding duplicate subtotal entries
        // when there are identical tuples with different values, as can occur when a measure has its aggregation set to none (see BITVDC25-1398).
        if (!tupleSameAsNext) {
            for (var levelIndex = endLevel; levelIndex >= startLevel; --levelIndex) {
                var numAggregations = subtotalLevelNumAggregationsMap[levelIndex];
                if (numAggregations) {

                    // DO not push any row Grand totals (at level 0) if they've been isolated
                    if( axisName === this._rowAxisName && levelIndex === 0 && this._anchoredTotals) {
                        continue;
                    }

                    if (measureIndex !== undefined) {
                        // building the tuple map for the axis containing measures
                        if (levelIndex < measuresInfo.axisPosition) {
                            if (measureIndex === measuresInfo.members.length - 1) {
                                for (var i = 0; i < numAggregations; ++i) {
                                    // iterate through all the measures except running calculation
                                    for (var m = 0; m < measuresInfo.members.length; ++m) {
                                        var indexForSubTotal = measuresInfo.members[m].indexForSubTotal;
                                        if (indexForSubTotal >= 0) {
                                            axisTupleMap.push({
                                                axisTupleIndex: dimTupleIndex,
                                                subTotal: {
                                                    level: levelIndex,
                                                    aggregationIndex: i
                                                },
                                                measureIndex: indexForSubTotal
                                            });
                                        }
                                    }
                                }
                            }
                        } else if (measuresInfo.members[measureIndex].indexForSubTotal >= 0) {
                            // only add subtotal if measures is not running calculation
                            for (var k = 0; k < numAggregations; ++k) {
                                axisTupleMap.push({
                                    axisTupleIndex: dimTupleIndex,
                                    subTotal: {
                                        level: levelIndex,
                                        aggregationIndex: k
                                    },
                                    measureIndex: measuresInfo.members[measureIndex].indexForSubTotal
                                });
                            }
                        }
                    } else {
                        for (var j = 0; j < numAggregations; ++j) {
                            axisTupleMap.push({
                                axisTupleIndex: dimTupleIndex,
                                subTotal: {
                                    level: levelIndex,
                                    aggregationIndex: j
                                },
                                measureIndex: measureIndex
                            });
                        }
                    }
                }
            }
        }

        if (measureIndex !== undefined) {
            var numMeasures = measuresInfo.members.length;
            if (nextDimTuple === undefined) {
                if (measureIndex < numMeasures - 1) {
                    measureIndex++;
                    dimTupleIndex = startIndex;
                    continue;
                }
            } else {
                var measureParentTupleIndex = measuresInfo.axisPosition - 1;
                var nextParentMemberIndex = nextDimTuple[measureParentTupleIndex];
                if (nextParentMemberIndex !== undefined) {
                    if (nextParentMemberIndex !== dimTuple[measureParentTupleIndex]) {
                        if (measureIndex === numMeasures - 1) {
                            measureIndex = 0;
                            startIndex = dimTupleIndex + 1;
                        } else {
                            measureIndex++;
                            dimTupleIndex = startIndex;
                            continue;
                        }
                    }
                }
            }
        }

        dimTupleIndex++;
    }

    return axisTupleMap;
};

sap.basetable.crosstab.PageManager.prototype._lookUpMemberKey = function (metadataDictionary, axisName, levelIndex, memberIndex) {
    var memberKey;

    var axisObject = metadataDictionary[axisName];
    if (axisObject) {
        var levelObject = axisObject[levelIndex];
        if (levelObject) {
            var memberObject = levelObject.value[memberIndex];
            if (memberObject) {
                var keys = memberObject.attributes.key;
                if (keys) {
                    for (var k = 0; k < keys.length; ++k) {
                        memberKey += keys[k];
                    }
                } else {
                    memberKey = memberObject.key;
                }
            }
        }
    }

    return memberKey;
};

sap.basetable.crosstab.PageManager.prototype._updateAxisTupleArray = function (axisName, metadataResponse) {
    var dimTuples = metadataResponse.dimAxes[axisName].values;
    var metadataDictionary = metadataResponse.metadata.dictionary;

    for (var i = 0; i < dimTuples.length; ++i) {
        var dimTuple = dimTuples[i];

        var memberTuple = [];
        for (var levelIndex = 0; levelIndex < dimTuple.length; ++levelIndex) {
            var memberIndex = dimTuple[levelIndex];
            var memberKey = this._lookUpMemberKey(metadataDictionary, axisName, levelIndex, memberIndex);
            memberTuple.push(memberKey);
        }

        if (!this._axisTupleArray[axisName]) {
            this._axisTupleArray[axisName] = [];
        }
        this._axisTupleArray[axisName].push(memberTuple);
    }
};

sap.basetable.crosstab.PageManager.prototype._findDimensionMemberMeasureIndex = function (axisTupleMap, index) {
    var i = index;
    var tupleInfo = axisTupleMap[i];

    while (tupleInfo.subTotal !== undefined) {
        i--;
        tupleInfo = axisTupleMap[i];
    }

    return tupleInfo.measureIndex;
};

// TODO should calculate the offset outside of the axis ranges, especically if this class is truncating the tree for subtotals
sap.basetable.crosstab.PageManager.prototype._calculateSubtotalOffset = function (axisTupleMap, index) {
    var offset;

    var tupleInfo = axisTupleMap[index];
    if (tupleInfo.subTotal) {
        var axisStartIndex = axisTupleMap[index].axisTupleIndex;
        var start = index;
        while (!(axisTupleMap[start].axisTupleIndex === axisStartIndex && axisTupleMap[start].subTotal === undefined) && start >= 0) {
            start--;
        }
        offset = index - start;
    }

    return offset;
};

sap.basetable.crosstab.PageManager.prototype._getAxisRange = function (pageIndex, axisName) {
    var axisStartIndex;
    var axisEndIndex;
    var axisEndOffset;
    var offset;

    var pageAxisStartIndex = pageIndex * this._pageSize;
    var pageAxisEndIndex = pageAxisStartIndex + this._pageSize - 1;

    var axisTupleMap = this._axisTupleMaps[axisName];
    if (axisTupleMap === undefined) {
        axisStartIndex = pageAxisStartIndex;
        axisEndIndex = Math.min(pageAxisEndIndex, this._axisTupleLengths[axisName] - 1);
    } else {
        axisStartIndex = axisTupleMap[pageAxisStartIndex].axisTupleIndex;
        axisEndIndex = pageAxisEndIndex < axisTupleMap.length ? axisTupleMap[pageAxisEndIndex].axisTupleIndex : axisTupleMap[axisTupleMap.length - 1].axisTupleIndex;

        offset = this._calculateSubtotalOffset(axisTupleMap, pageAxisStartIndex);
    }

    axisEndOffset = 0;
    // query for 1 extra tuple
    if (axisEndIndex < this._axisTupleLengths[axisName] - 1) {
        axisEndIndex = axisEndIndex + 1;
        axisEndOffset = 1;
    }

    return {
        startIndex: axisStartIndex,
        endIndex: axisEndIndex,
        endIndexOffset: axisEndOffset,
        subtotalOffset: offset
    };
};

sap.basetable.crosstab.PageManager.prototype._getNumDimensions = function (axisName) {
    var numDimensions = null;

    if (axisName === this._columnAxisName) {
        numDimensions = this._columnDimensionIdArray.length;
    }

    if (axisName === this._rowAxisName) {
        numDimensions = this._rowDimensionIdArray.length;
    }

    return numDimensions;
};

sap.basetable.crosstab.PageManager.prototype._buildMeasureAxisRangesFromAxisTupleMap = function (pageIndex, axisName, axisTupleMap) {
    var axisRanges = [];

    var axisStart;
    var axisEnd;
    var axisEndOffset;
    var measureStart;
    var measureEnd;
    var offset;

    var pageAxisStartIndex = pageIndex * this._pageSize;
    var pageAxisLength = axisTupleMap.length;
    var pageAxisEndIndex = Math.min(pageAxisStartIndex + this._pageSize - 1, pageAxisLength - 1);

    var axisStartTupleInfo = axisTupleMap[pageAxisStartIndex];
    axisStart = axisStartTupleInfo.axisTupleIndex;
    axisEnd = axisStartTupleInfo.axisTupleIndex;

    var tupleIndex;

    for (var tupleInfoIndex = pageAxisStartIndex + 1; tupleInfoIndex <= pageAxisEndIndex; ++tupleInfoIndex) {
        tupleIndex = axisTupleMap[tupleInfoIndex].axisTupleIndex;
        if (tupleIndex < axisStart) {
            break;
        } else {
            axisEnd = Math.max(axisEnd, tupleIndex);
        }
    }

    // case when we have to split the query
    if (tupleInfoIndex <= pageAxisEndIndex) {
        measureStart = this._findDimensionMemberMeasureIndex(axisTupleMap, pageAxisStartIndex);

        offset = this._calculateSubtotalOffset(axisTupleMap, pageAxisStartIndex);

        axisRanges.push({
            startIndex: axisStart,
            endIndex: axisEnd,
            endIndexOffset: 0,
            measureStartIndex: measureStart,
            measureEndIndex: measureStart, // TODO don't need measureEndIndex, really we want to iterate through all measure or not
            subtotalOffset: offset
        });

        pageAxisStartIndex = tupleInfoIndex;
        axisStartTupleInfo = axisTupleMap[pageAxisStartIndex];
        axisStart = axisStartTupleInfo.axisTupleIndex;
        axisEnd = axisStartTupleInfo.axisTupleIndex;

        for (tupleInfoIndex = tupleInfoIndex + 1; tupleInfoIndex <= pageAxisEndIndex; ++tupleInfoIndex) {
            tupleIndex = axisTupleMap[tupleInfoIndex].axisTupleIndex;
            axisEnd = Math.max(axisEnd, tupleIndex);
        }

        axisEndOffset = 0;
        // query for 1 extra tuple
        if (axisEnd <  this._axisTupleLengths[axisName] - 1) {
            axisEnd = axisEnd + 1;
            axisEndOffset = 1;
        }

        measureStart = this._findDimensionMemberMeasureIndex(axisTupleMap, pageAxisStartIndex);
        measureEnd = this._findDimensionMemberMeasureIndex(axisTupleMap, pageAxisEndIndex);

        axisRanges.push({
            startIndex: axisStart,
            endIndex: axisEnd,
            endIndexOffset: axisEndOffset,
            measureStartIndex: measureStart,
            measureEndIndex: measureEnd, // TODO don't need measureEndIndex, really we want to iterate through all measure or not
            subtotalOffset: 0
        });
    } else {
        axisEndOffset = 0;
        // query for 1 extra tuple
        if (axisEnd <  this._axisTupleLengths[axisName] - 1) {
            axisEnd = axisEnd + 1;
            axisEndOffset = 1;
        }

        measureStart = this._findDimensionMemberMeasureIndex(axisTupleMap, pageAxisStartIndex);
        measureEnd = this._findDimensionMemberMeasureIndex(axisTupleMap, pageAxisEndIndex);

        offset = this._calculateSubtotalOffset(axisTupleMap, pageAxisStartIndex);

        axisRanges.push({
            startIndex: axisStart,
            endIndex: axisEnd,
            endIndexOffset: axisEndOffset,
            measureStartIndex: measureStart,
            measureEndIndex: measureEnd,
            subtotalOffset: offset
        });
    }

    return axisRanges;
};

sap.basetable.crosstab.PageManager.prototype._getMeasureAxisRanges = function (pageIndex, axisName) {
    var axisRanges;

    var axisTupleMap = this._axisTupleMaps[axisName];

    if (axisTupleMap !== undefined) {
        // axisTupleMap will exist if there are subtotals and/or the measure is neither in the innermost or outermost position
        axisRanges = this._buildMeasureAxisRangesFromAxisTupleMap(pageIndex, axisName, axisTupleMap);
    } else {
        axisRanges = [];

        var axisStart;
        var axisEnd;
        var axisEndOffset;
        var measureStart;
        var measureEnd;
        var offset;

        var pageAxisStartIndex;
        var pageAxisLength;
        var pageAxisEndIndex;

        // measures is in outermost position
        if (this._measureAxisPosition === 0) {
            pageAxisStartIndex = pageIndex * this._pageSize;
            pageAxisLength = this._axisTupleLengths[axisName];
            pageAxisEndIndex = Math.min(pageAxisStartIndex + this._pageSize - 1, (pageAxisLength * this._numMeasures) - 1);

            axisStart = pageAxisStartIndex % pageAxisLength;

            axisEnd = pageAxisEndIndex % pageAxisLength;
            axisEndOffset = 0;
            // query for 1 extra tuple
            if (axisEnd < this._axisTupleLengths[axisName] - 1) {
                axisEnd = axisEnd + 1;
                axisEndOffset = 1;
            }

            measureStart = Math.floor(pageAxisStartIndex / pageAxisLength);
            measureEnd = Math.floor(pageAxisEndIndex / pageAxisLength);

            if (measureStart === measureEnd) {
                axisRanges.push({
                    startIndex: axisStart,
                    endIndex: axisEnd,
                    endIndexOffset: axisEndOffset,
                    measureStartIndex: measureStart,
                    measureEndIndex: measureEnd
                });
            } else {
                // split the window query
                axisRanges.push({
                    startIndex: axisStart,
                    endIndex: pageAxisLength - 1,
                    endIndexOffset: 0,
                    measureStartIndex: measureStart,
                    measureEndIndex: measureStart
                });
                axisRanges.push({
                    startIndex: 0,
                    endIndex: axisEnd,
                    endIndexOffset: axisEndOffset,
                    measureStartIndex: measureEnd,
                    measureEndIndex: measureEnd
                });
            }
        // measures is in innermost position
        } else if (this._measureAxisPosition === this._getNumDimensions(axisName)) {
            pageAxisStartIndex = pageIndex * this._pageSize;
            pageAxisLength = this._axisTupleLengths[axisName];
            pageAxisEndIndex = Math.min(pageAxisStartIndex + this._pageSize - 1, (pageAxisLength * this._numMeasures) - 1);

            axisStart = Math.floor(pageAxisStartIndex / this._numMeasures);

            axisEnd = Math.floor(pageAxisEndIndex / this._numMeasures);
            axisEndOffset = 0;
            // query for 1 extra tuple
            if (axisEnd <  this._axisTupleLengths[axisName] - 1) {
                axisEnd = axisEnd + 1;
                axisEndOffset = 1;
            }

            measureStart = pageAxisStartIndex % this._numMeasures;
            measureEnd = pageAxisEndIndex % this._numMeasures;

            axisRanges.push({
                startIndex: axisStart,
                endIndex: axisEnd,
                endIndexOffset: axisEndOffset,
                measureStartIndex: measureStart,
                measureEndIndex: measureEnd,
                subtotalOffset: offset
            });
        }
    }

    return axisRanges;
};

sap.basetable.crosstab.PageManager.prototype._createWindowAxisSpecifications = function (page) {
    var axisSpec;
    var axisSpecArray = [];

    if (this._measureAxisType === "row" || this._measureAxisType === "column") {
        var measureAxisName = this._measureAxisType === "row" ? this._rowAxisName : this._columnAxisName;
        var measurePageIndex = this._measureAxisType === "row" ? page.rowPageIndex : page.columnPageIndex;
        var orthogonalAxisName = this._measureAxisType === "row" ? this._columnAxisName : this._rowAxisName;
        var orthogonalPageIndex = this._measureAxisType === "row" ? page.columnPageIndex : page.rowPageIndex;

        var orthogonalAxisRange = orthogonalAxisName ? this._getAxisRange(orthogonalPageIndex, orthogonalAxisName) : null;
        var measureAxisRanges = measureAxisName ? this._getMeasureAxisRanges(measurePageIndex, measureAxisName) : null;

        if (measureAxisRanges) {
            for (var rangeIndex = 0; rangeIndex < measureAxisRanges.length; ++rangeIndex) {
                axisSpec = {};
                axisSpec[measureAxisName] = measureAxisRanges[rangeIndex];
                if (orthogonalAxisRange) {
                    axisSpec[orthogonalAxisName] = orthogonalAxisRange;
                }
                axisSpecArray.push(axisSpec);
            }
        } else if (orthogonalAxisRange) {
            axisSpec = {};
            axisSpec[orthogonalAxisName] = orthogonalAxisRange;
            axisSpecArray.push(axisSpec);
        }
    } else {
        axisSpec = {};
        if (this._rowAxisName) {
            axisSpec[this._rowAxisName] = this._getAxisRange(page.rowPageIndex, this._rowAxisName);
        }
        if (this._columnAxisName) {
            axisSpec[this._columnAxisName] = this._getAxisRange(page.columnPageIndex, this._columnAxisName);
        }
        axisSpecArray.push(axisSpec);
    }

    return axisSpecArray;
};

sap.basetable.crosstab.PageManager.prototype._calculatePageSize = function (axisRange) {
    var requestedPageSize = (axisRange.endIndex - axisRange.startIndex) + 1;

    while (Math.floor(axisRange.startIndex / requestedPageSize) !== Math.floor(axisRange.endIndex / requestedPageSize) && requestedPageSize < (axisRange.endIndex + 1)) {
        requestedPageSize++;
    }

    return requestedPageSize;
};

sap.basetable.crosstab.PageManager.prototype._convertWindowAxisRangeToPageSpecification = function (axisRange) {
    var requestedPageSize = this._calculatePageSize(axisRange);

    var pageSpec = {
        page: Math.floor(axisRange.startIndex / requestedPageSize),
        pageSize: requestedPageSize
    };

    return pageSpec;
};

// convert axis specifications to page and pageSize for BI Query Model request for axes
sap.basetable.crosstab.PageManager.prototype._convertWindowAxisRangeToWindowPageSpecification = function (axisRange) {
    var requestedPageSize = this._calculatePageSize(axisRange);

    var pageSpec = {
        page: Math.floor(axisRange.startIndex / requestedPageSize),
        pageSize: requestedPageSize,
        startIndexOffset: axisRange.startIndex % requestedPageSize,
        endIndexOffset: requestedPageSize - (axisRange.endIndex % requestedPageSize) + axisRange.endIndexOffset - 1 // TODO is this right?
    };

    return pageSpec;
};

sap.basetable.crosstab.PageManager.prototype._createPageSpecification = function (page, windowAxisSpecifications) {
    var pageSpecification = {
        coordinates: page,
        queryWindowSpecifications: []
    };

    for (var specIndex = 0; specIndex < windowAxisSpecifications.length; ++specIndex) {
        var axisSpec = windowAxisSpecifications[specIndex];

        var queryWindowSpec = {};
        for (var axisName in axisSpec) {
            if (axisSpec.hasOwnProperty(axisName)) {
                var axisRange = axisSpec[axisName];
                var feedType = axisName === this._rowAxisName ? "rows" : "cols";
                queryWindowSpec[feedType] = this._convertWindowAxisRangeToPageSpecification(axisRange);
            }
        }
        pageSpecification.queryWindowSpecifications.push(queryWindowSpec);
    }

    return pageSpecification;
};

sap.basetable.crosstab.PageManager.prototype._createWindowPageSpecifications = function (windowAxisSpecifications) {
    var windowPageSpecifications = [];

    for (var specIndex = 0; specIndex < windowAxisSpecifications.length; ++specIndex) {
        var axisSpec = windowAxisSpecifications[specIndex];
        var winPageSpec = {};
        for (var axisName in axisSpec) {
            if (axisSpec.hasOwnProperty(axisName)) {
                var axisRange = axisSpec[axisName];
                winPageSpec[axisName] = this._convertWindowAxisRangeToWindowPageSpecification(axisRange);
            }
        }
        windowPageSpecifications.push(winPageSpec);
    }

    return windowPageSpecifications;
};

sap.basetable.crosstab.PageManager.prototype._createWindowMeasuresSpecifications = function (windowAxisSpecifications) {
    var windowMeasuresSpecifications = [];

    var measureAxisName = null;
    if (this._measureAxisType === "row" || this._measureAxisType === "column") {
        measureAxisName = this._measureAxisType === "row" ? this._rowAxisName : this._columnAxisName;
    }

    if (measureAxisName !== null) {
        for (var specIndex = 0; specIndex < windowAxisSpecifications.length; ++specIndex) {
            var axisRange = windowAxisSpecifications[specIndex][measureAxisName];

            var winMeasuresSpec = {
                measureStartIndex: axisRange.measureStartIndex,
                measureEndIndex: axisRange.measureEndIndex
            };
            windowMeasuresSpecifications.push(winMeasuresSpec);
        }
    }

    return windowMeasuresSpecifications;
};

sap.basetable.crosstab.PageManager.prototype._createInitialWindowPageSpecification = function (actualRowAxisPageSize, actualColumnAxisPageSize) {
    var windowPageSpecification = {};

    if (actualRowAxisPageSize) {
        windowPageSpecification[this._rowAxisName] = {
            page: 0,
            pageSize: actualRowAxisPageSize,
            startIndexOffset: 0,
            endIndexOffset: 0
        };
    }
    if (actualColumnAxisPageSize) {
        windowPageSpecification[this._columnAxisName] = {
            page: 0,
            pageSize: actualColumnAxisPageSize,
            startIndexOffset: 0,
            endIndexOffset: 0
        };
    }

    return windowPageSpecification;
};

sap.basetable.crosstab.PageManager.prototype._createInitialWindowMeasuresSpecification = function (queryResponse) {
    var windowMeasuresSpecification;

    if (this._measureAxisName) {
        windowMeasuresSpecification = {
            measureStartIndex: 0
        };

        var actualMeasureAxisPageSize = Math.max(this._pageSize, queryResponse.dimAxes[this._measureAxisName].values.length);

        // page encapsulates the entire axis; iterate through all measures
        if (actualMeasureAxisPageSize >= this._axisTupleLengths[this._measureAxisName]) {
            windowMeasuresSpecification.measureEndIndex = this._numMeasures - 1;
        } else {
            // measures is in outermost position
            if (this._measureAxisPosition === 0) {
                windowMeasuresSpecification.measureEndIndex = 0;

            // measures is in innermost position
            } else if (this._measureAxisPosition === this._getNumDimensions(this._measureAxisName)) {
                windowMeasuresSpecification.measureEndIndex = this._numMeasures - 1;
            }
            // if measures is in between dimension, then leave measureEndIndex undefined
        }
    }

    return windowMeasuresSpecification;
};

sap.basetable.crosstab.PageManager.prototype._getFullAxisLength = function (axisName) {
    var axisLength = 0;

    if (axisName) {
        var axisTupleMap = this._axisTupleMaps ? this._axisTupleMaps[axisName] : undefined;
        if (axisTupleMap === undefined) {
            var axisType = axisName === this._rowAxisName ? "row" : "column";
            if (this._measureAxisType === axisType) {
                // for measure axis, we need to multiply axisTupleLength by the number of measures
                axisLength = this._axisTupleLengths[axisName] * this._numMeasures;
            } else {
                // for none measure axis, we only need to add axisTupleLength
                axisLength = this._axisTupleLengths[axisName];
            }
        } else {
            axisLength = axisTupleMap.length;
        }
    }

    return axisLength;
};

sap.basetable.crosstab.PageManager.prototype._fetchPageFromCache = function (page, pageSize) {
    var tupleTrees = null;

    var rowCache = this._pageCache[page.rowPageIndex];
    if (rowCache) {
        var trees = rowCache[page.columnPageIndex];
        if (trees !== undefined) {
            if (this._initializedWithFullQuery) {
                // Case when the full query result was used to initialize the page manager.
                // The cache should contain all the pages so just return the tree at the
                // specified page index.
                // TODO In theory, we do not need this if case but we notice that the axis lengths
                // from the BI Query response may not match the expected number of rows/columns.
                // ie. BITVDC25-1423 [Desktop][VE] Cross-table and table has missing rows of data
                // when there are subtotals
                // Return the tuple tree to allow us to still render the cross-table even though
                // there is missing data. However, these issues need to be fixed for query windowing
                // because having less than expected number of rows/columns means we need to issue
                // a query request.
                tupleTrees = trees;
            } else {
                var numRows = ((page.rowPageIndex + 1) * pageSize);
                var rowFullAxisLength = this._getFullAxisLength(this._rowAxisName);
                var isLastRowPage = numRows >= rowFullAxisLength;
                var expectedNumRows = isLastRowPage ? rowFullAxisLength % pageSize : pageSize;

                // trees[0].rootnode.numOfLeafChildren is undefined if there are no row dimensions
                var numOfRowLeafChildren = trees[0].rootnode.numOfLeafChildren ? trees[0].rootnode.numOfLeafChildren : 0;

                // Number of leaf children should at least match expected num rows/columns, if it
                // doesn't it is an incomplete tuple tree and we do not fetch it from cache.
                if (numOfRowLeafChildren >= expectedNumRows) {
                    var numColumns = ((page.columnPageIndex + 1) * pageSize);
                    var columnFullAxisLength = this._getFullAxisLength(this._columnAxisName);
                    var isLastColumnPage = numColumns >= columnFullAxisLength;
                    var expectedNumColumns = isLastColumnPage ? columnFullAxisLength % pageSize : pageSize;

                    // trees[1].rootnode.numOfLeafChildren is undefined if there are no column dimensions
                    var numOfColumnLeafChildren = trees[1].rootnode.numOfLeafChildren ? trees[1].rootnode.numOfLeafChildren : 0;

                    if (numOfColumnLeafChildren >= expectedNumColumns) {
                        tupleTrees = trees;
                    }
                }
            }
        }
    }

    return tupleTrees;
};

// store in cache, may result in multiple pages being stored
sap.basetable.crosstab.PageManager.prototype._storeInCache = function (tupleTrees, page, pageSize) {
    var rowTupleTrees = sap.basetable.crosstab.TupleTreeUtil.splitTupleTree(tupleTrees[0], pageSize);
    var columnTupleTrees = sap.basetable.crosstab.TupleTreeUtil.splitTupleTree(tupleTrees[1], pageSize);

    var totalNumDataPoints = tupleTrees[1].rootnode.numOfLeafChildren ? tupleTrees[1].rootnode.numOfLeafChildren : 0;
    var rowIndex = page.rowPageIndex;
    for (var rowTreeIndex = 0; rowTreeIndex < rowTupleTrees.length; ++rowTreeIndex) {
        var rowTupleTree = rowTupleTrees[rowTreeIndex];
        var rowDataPointTupleTrees = sap.basetable.crosstab.TupleTreeUtil.splitTupleTreeByDataPoints(rowTupleTree, totalNumDataPoints, pageSize);

        var rowCache = this._pageCache[rowIndex];
        if (rowCache === undefined) {
            rowCache = [];
            this._pageCache[rowIndex] = rowCache;
        }

        var columnIndex = page.columnPageIndex;
        for (var columnTreeIndex = 0; columnTreeIndex < columnTupleTrees.length; ++columnTreeIndex) {
            rowCache[columnIndex] = [rowDataPointTupleTrees[columnTreeIndex], columnTupleTrees[columnTreeIndex]];
            columnIndex++;
        }

        rowIndex++;
    }
};

sap.basetable.crosstab.PageManager.prototype.addPage = function (page, windowIndex, windowData) {
    var windowAxisSpecifications = this._createWindowAxisSpecifications(page);
    var windowPageSpecifications = this._createWindowPageSpecifications(windowAxisSpecifications);
    var windowMeasuresSpecifications = this._createWindowMeasuresSpecifications(windowAxisSpecifications);

    var generatedTupleTrees = this._crosstabDataProvider._buildTupleTrees(
        windowData.queryRequest.queries[0],
        windowData.queryResponse[0],
        this._entityIdCaptionMap,
        this._measureIdCaptionMap,
        this._rowAxisName,
        this._columnAxisName,
        this._measureAxisType,
        this._measureGroupName,
        this._measureAxisPosition,
        windowPageSpecifications[windowIndex],
        windowMeasuresSpecifications[windowIndex],
        this._axisTupleLengths,
        true,
        true,
        this._anchoredTotals);

    for (var pageIndex = this._pageResults.length - 1; pageIndex >= 0; --pageIndex) {
        var pageResultEntry = this._pageResults[pageIndex];
        if (this._equalPages(pageResultEntry.page, page)) {
            pageResultEntry.windows[windowIndex] = generatedTupleTrees;

            var fetchedAllWindows = true;
            for (var i = 0; fetchedAllWindows && i < pageResultEntry.windows.length; ++i) {
                if (pageResultEntry.windows[i] === undefined) {
                    fetchedAllWindows = false;
                }
            }

            if (fetchedAllWindows) {
                var currentTupleTrees = null;
                for (var j = 0; j < pageResultEntry.windows.length; ++j) {
                    if (currentTupleTrees === null) {
                        currentTupleTrees = pageResultEntry.windows[j];
                    } else {
                        currentTupleTrees = this._measureAxisType === "row" ?
                            sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreesVertically(currentTupleTrees, pageResultEntry.windows[j]) :
                            sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreesHorizontally(currentTupleTrees, pageResultEntry.windows[j]);
                    }
                }

                // TODO truncate here or in the conversion code?
                currentTupleTrees = sap.basetable.crosstab.TupleTreeUtil.truncateTupleTrees(currentTupleTrees, windowAxisSpecifications, this._rowAxisName, this._columnAxisName);

                this._storeInCache(currentTupleTrees, page, this._pageSize);

                var tupleTrees = this._fetchPageFromCache(page, this._pageSize);

                this._pageResults.splice(pageIndex, 1);

                var inProcessPageRequest = this._inProcessPageRequest;
                this._inProcessPageRequest = undefined;

                // notify all handlers for the particular page
                for (var h = 0; inProcessPageRequest && h < inProcessPageRequest.responseHandlers.length; ++h) {
                    inProcessPageRequest.responseHandlers[h]._setTupleTrees(page, tupleTrees);
                }

                // process the next pending page request
                this._processNextPendingPageRequest();
            } else {
                // fetch the next window of the page
                var pageSpecification = this._createPageSpecification(page, windowAxisSpecifications);
                this._eDispatch.crosstablePageRequest(pageSpecification.coordinates, pageSpecification.queryWindowSpecifications[windowIndex + 1], windowIndex + 1);
            }
        }
    }
};

sap.basetable.crosstab.PageManager.prototype._processNextPendingPageRequest = function () {
    if (this._pendingPageRequests.length > 0) {
        var pendingPageRequest = this._pendingPageRequests[0];
        this._pendingPageRequests.shift();
        for (var p = 0; p < pendingPageRequest.responseHandlers.length; ++p) {
            this.fetchPage(pendingPageRequest.page, pendingPageRequest.responseHandlers[p]);
        }
    }
};

sap.basetable.crosstab.PageManager.prototype._equalPages = function (page1, page2) {
    return (page1.rowPageIndex === page2.rowPageIndex) && (page1.columnPageIndex === page2.columnPageIndex);
};

sap.basetable.crosstab.PageManager.prototype._addToPendingPageRequests = function (page, pageResponseHandler) {
    var pendingPageRequest;
    for (var p = 0; p < this._pendingPageRequests.length; ++p) {
        if (this._equalPages(this._pendingPageRequests[p].page, page)) {
            pendingPageRequest = this._pendingPageRequests[p];
            break;
        }
    }

    if (!pendingPageRequest) {
        pendingPageRequest = {
            page: page,
            responseHandlers: []
        };
        this._pendingPageRequests.push(pendingPageRequest);
    }

    pendingPageRequest.responseHandlers.push(pageResponseHandler);
};

// send page request for tuple trees
sap.basetable.crosstab.PageManager.prototype.fetchPage = function (page, pageResponseHandler) {
    // check cache
    var tupleTrees = this._fetchPageFromCache(page, this._pageSize);

    if (tupleTrees === null) {
        if (this._metadataFeedIds.length > 0 || this._initializingAxesMetadata) {
            this._addToPendingPageRequests(page, pageResponseHandler);
            return;
        }

        if (this._inProcessPageRequest) {
            // add to the list of handlers waiting for a particular page
            if (this._equalPages(this._inProcessPageRequest.page, page)) {
                this._inProcessPageRequest.responseHandlers.push(pageResponseHandler);
            } else {
                this._addToPendingPageRequests(page, pageResponseHandler);
            }
        } else {
            var windowAxisSpecifications = this._createWindowAxisSpecifications(page);
            var pageSpecification = this._createPageSpecification(page, windowAxisSpecifications);

            if (this._eDispatch.mock_pageRequest) {
                this._eDispatch.mock_pageRequest.call(this._queryRequestHandler, pageSpecification, this._measureGroupName, this._rowAxisName, this._columnAxisName);
            } else {
                var pageResultEntry = {
                    page: pageSpecification.coordinates,
                    windows: []
                };
                pageResultEntry.windows[pageSpecification.queryWindowSpecifications.length - 1] = undefined;
                this._pageResults.push(pageResultEntry);

                // send request for first window data of the page; the next window
                // will be requested once the previous window data is received
                this._eDispatch.crosstablePageRequest(pageSpecification.coordinates, pageSpecification.queryWindowSpecifications[0], 0);
            }

            this._inProcessPageRequest = {
                page: page,
                responseHandlers: [pageResponseHandler]
            };
        }

    } else {
        pageResponseHandler._setTupleTrees(page, tupleTrees);
    }
};

sap.basetable.crosstab.PageManager.prototype.getFullAxisLengthByIndex = function (axisIndex) {
    var fullAxisLength = 0;

    if (axisIndex === 0) { // rows
        if (this._rowAxisName === null) {
            fullAxisLength = this._measureAxisType === this._crosstabConstants.ROW ? this._numMeasures : 1;
        } else {
            fullAxisLength = this._getFullAxisLength(this._rowAxisName);
        }
    } else if (axisIndex === 1) { // columns
        if (this._columnAxisName === null) {
            fullAxisLength = this._measureAxisType === this._crosstabConstants.COLUMN ? this._numMeasures : 1;
        } else {
            fullAxisLength = this._getFullAxisLength(this._columnAxisName);
        }
    }

    return fullAxisLength;
};



jQuery.sap.declare("sap.basetable.crosstab.renderer.CustomRenderer");
sap.basetable.crosstab.renderer.CustomRenderer = function () {
};

sap.basetable.crosstab.renderer.CustomRenderer.render = function (body, containerId, data, formats, scale) {
    var callBack = body.callBack;
    callBack.call(this, containerId, data, formats, scale);
};
jQuery.sap.declare("sap.basetable.crosstab.renderer.CVOMRenderer");
sap.basetable.crosstab.renderer.CVOMRenderer = function () {
};

sap.basetable.crosstab.renderer.CVOMRenderer.render = function (body, containerId, data, formats, scale) {
  var defaultOption = {
    plotArea : {
    },
    title : {
      visible : false
    },
    xAxis : {
    visible: false
    },
    yAxis : {
    visible: false
    },
    tooltip: {
        visible: false
    },
    legend: {
        visible: false              
    }
  };

  var chartOption = body.chartOption ? body.chartOption : defaultOption;
  $('#' + containerId).html("");
  var ds1 = new sap.viz.api.data.CrosstableDataset();
  ds1.data(data);
  var chart = sap.viz.api.core.createViz({
    type : body.type,
    data : ds1,
    container : $('#' + containerId),
    options : chartOption
  });
};
jQuery.sap.declare("sap.basetable.crosstab.renderer.MiniChartRenderer");
sap.basetable.crosstab.renderer.MiniChartRenderer = function () {
};

sap.basetable.crosstab.renderer.MiniChartRenderer.render = function (body, containerId, data, formats, scale) {
  var defaultOption = {
    plotArea : {
    },
    title : {
      visible : false
    },
    xAxis : {
    visible: false
    },
    yAxis : {
    visible: false
    },
    tooltip: {
        visible: false
    },
    legend: {
        visible: false              
    }
  };

  var chartOption = body.chartOption ? body.chartOption : defaultOption;
  $('#' + containerId).html("");
  var ds1 = new sap.viz.api.data.CrosstableDataset();
  ds1.data(data);
  var chart = sap.viz.api.core.createViz({
    type : body.type,
    data : ds1,
    container : $('#' + containerId),
    options : chartOption
  });
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.renderer.StringRenderer");

sap.basetable.crosstab.renderer.StringRenderer = function () {
};

sap.basetable.crosstab.renderer.StringRenderer.render = function (containerId, content, formats) {
    var container = $("#" + containerId);
    var text = content;
    if (formats) {
        formats.forEach(function(format) {
            if (sap.basetable.crosstab.Format.TYPE_STYLE === format.type) {
                container.css(format.body.style);
            }
            if (sap.basetable.crosstab.Format.TYPE_SIMPLE === format.type) {

            }
        });
    }
    container.children(0).text(text);
};
jQuery.sap.declare("sap.basetable.crosstab.ScrollPageManager");

sap.basetable.crosstab.ScrollPageManager = function (data, crosstabDataProvider, crosstab) {
    this._pageManager = new sap.basetable.crosstab.PageManager(data, this, crosstabDataProvider, crosstab);
    this._coordinatesPages = [];
};

sap.basetable.crosstab.ScrollPageManager.prototype.initialize = function (initialWindowData) {
    this._pageManager.initialize(initialWindowData);
};

sap.basetable.crosstab.ScrollPageManager.prototype.initializeAxesMetadata = function () {
    this._pageManager.initializeAxesMetadata();
};

sap.basetable.crosstab.ScrollPageManager.prototype.updateAxesMetadata = function (windowData, metadataUpdateHandler) {
    this._pageManager.updateAxesMetadata(windowData, metadataUpdateHandler);
};

sap.basetable.crosstab.ScrollPageManager.prototype.addPage = function (page, windowIndex, windowData) {
    this._pageManager.addPage(page, windowIndex, windowData);
};

sap.basetable.crosstab.ScrollPageManager.prototype._getPageCoordinatesFromViewCoordinates = function (coordinates) {
    var pageSize = this._pageManager.getPageSize();

    // Index for row or column is not specified if there are no axis tuples.
    // We still need to specify a page index of 0.
    var startRowPageIndex = coordinates.startRowIndex ? Math.floor(coordinates.startRowIndex / pageSize) : 0;
    var endRowPageIndex = coordinates.endRowIndex ? Math.floor(coordinates.endRowIndex / pageSize) : 0;
    var startColumnPageIndex = coordinates.startColumnIndex ? Math.floor(coordinates.startColumnIndex / pageSize) : 0;
    var endColumnPageIndex = coordinates.endColumnIndex ? Math.floor(coordinates.endColumnIndex / pageSize) : 0;

    var pages = [];
    for (var rowIndex = startRowPageIndex; rowIndex <= endRowPageIndex; ++rowIndex) {
        var columnArray = [];
        for (var columnIndex = startColumnPageIndex; columnIndex <= endColumnPageIndex; ++columnIndex) {
            var page = {
                rowPageIndex: rowIndex,
                columnPageIndex: columnIndex
            };
            columnArray.push(page);
        }
        pages.push(columnArray);
    }

    return pages;
};

sap.basetable.crosstab.ScrollPageManager.prototype.fetchViewPage = function (viewCoordinates, pageResultCallback) {
    var pageIndices = this._getPageCoordinatesFromViewCoordinates(viewCoordinates);

    var coordinatesEntry = {
        coordinates: viewCoordinates,
        pageIndices: pageIndices,
        pages: [],
        resultCallback: pageResultCallback
    };
    this._coordinatesPages.push(coordinatesEntry);

    for (var rowIndex = 0; rowIndex < pageIndices.length; ++rowIndex) {
        var columnArray = pageIndices[rowIndex];
        for (var columnIndex = 0; columnIndex < columnArray.length; ++columnIndex) {
            this._pageManager.fetchPage(columnArray[columnIndex], this);
        }
    }
};

sap.basetable.crosstab.ScrollPageManager.prototype._storeTupleTree = function (coordinatesEntry, pageIndex, tupleTrees) {
    for (var rowIndex = 0; rowIndex < coordinatesEntry.pageIndices.length; ++rowIndex) {
        var columnArray = coordinatesEntry.pageIndices[rowIndex];
        for (var columnIndex = 0; columnIndex < columnArray.length; ++columnIndex) {
            var page = columnArray[columnIndex];
            if (page.rowPageIndex === pageIndex.rowPageIndex && page.columnPageIndex === pageIndex.columnPageIndex) {
                var columnResultArray = coordinatesEntry.pages[rowIndex];
                if (columnResultArray === undefined) {
                    columnResultArray = [];
                    coordinatesEntry.pages[rowIndex] = columnResultArray;
                }
                columnResultArray[columnIndex] = tupleTrees;
                return;
            }
        }
    }
};

sap.basetable.crosstab.ScrollPageManager.prototype._allPagesFetched = function (coordinatesEntry) {
    for (var rowIndex = 0; rowIndex < coordinatesEntry.pageIndices.length; ++rowIndex) {
        var columnArray = coordinatesEntry.pages[rowIndex];
        if (columnArray === undefined) {
            return false;
        } else {
            for (var columnIndex = 0; columnIndex < coordinatesEntry.pageIndices[rowIndex].length; ++columnIndex) {
                if (columnArray[columnIndex] === undefined) {
                    return false;
                }
            }
        }
    }

    return true;
};

sap.basetable.crosstab.ScrollPageManager.prototype._setTupleTrees = function (pageIndex, tupleTrees) {
    for (var coordsIndex = this._coordinatesPages.length - 1; coordsIndex >= 0; --coordsIndex) {
        var coordinatesPageResult = this._coordinatesPages[coordsIndex];

        this._storeTupleTree(coordinatesPageResult, pageIndex, tupleTrees);

        if (this._allPagesFetched(coordinatesPageResult)) {
            // merge tuple trees from multiple pages
            var mergedRowTupleTrees = [];
            coordinatesPageResult.pages.forEach(function(columnArray) {
                var tupleTrees = columnArray[0];
                for (var columnIndex = 1; columnIndex < columnArray.length; ++columnIndex) {
                    tupleTrees = sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreesHorizontally(tupleTrees, columnArray[columnIndex]);
                }
                mergedRowTupleTrees.push(tupleTrees);
            }.bind(this));

            var mergedTupleTrees = mergedRowTupleTrees[0];
            for (var rowIndex = 1; rowIndex < mergedRowTupleTrees.length; ++rowIndex) {
                mergedTupleTrees = sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreesVertically(mergedTupleTrees, mergedRowTupleTrees[rowIndex]);
            }

            // truncate merged tuple trees to fit the coordinates
            var pageSize = this._pageManager.getPageSize();

            var truncatedTupleTrees = mergedTupleTrees;
            if (coordinatesPageResult.coordinates.startRowIndex || coordinatesPageResult.coordinates.endRowIndex) {
                var startRowIndex = coordinatesPageResult.coordinates.startRowIndex % pageSize;
                var rowCount = (coordinatesPageResult.coordinates.endRowIndex - coordinatesPageResult.coordinates.startRowIndex) + 1;
                truncatedTupleTrees = sap.basetable.crosstab.TupleTreeUtil.truncateTupleTreeRows(truncatedTupleTrees, startRowIndex, rowCount);
            }

            if (coordinatesPageResult.coordinates.startColumnIndex || coordinatesPageResult.coordinates.endColumnIndex) {
                var startColumnIndex = coordinatesPageResult.coordinates.startColumnIndex % pageSize;
                var columnCount = (coordinatesPageResult.coordinates.endColumnIndex - coordinatesPageResult.coordinates.startColumnIndex) + 1;
                truncatedTupleTrees = sap.basetable.crosstab.TupleTreeUtil.truncateTupleTreeColumns(truncatedTupleTrees, startColumnIndex, columnCount);
            }

            coordinatesPageResult.resultCallback(coordinatesPageResult.coordinates, truncatedTupleTrees);

            this._coordinatesPages.splice(coordsIndex, 1);
        }
    }
};

sap.basetable.crosstab.ScrollPageManager.prototype.getFullAxisLength = function (axisIndex) {
    return this._pageManager.getFullAxisLengthByIndex(axisIndex);
};

sap.basetable.crosstab.ScrollPageManager.prototype.initializePageManagerForAnchoredTotals = function () {
    this._pageManager.initializePageManagerForAnchoredTotals();
};

jQuery.sap.declare("sap.basetable.crosstab.TupleTreeUtil");

sap.basetable.crosstab.TupleTreeUtil = {};

sap.basetable.crosstab.TupleTreeUtil.getFirstTupleNodes = function (tupleNodes) {
    var node = tupleNodes[tupleNodes.length - 1];
    if (node.children !== undefined && node.children.length > 0) {
        tupleNodes.push(node.children[0]);
        this.getFirstTupleNodes(tupleNodes);
    }
    return tupleNodes;
};

sap.basetable.crosstab.TupleTreeUtil.getLastTupleNodes = function (tupleNodes) {
    var node = tupleNodes[tupleNodes.length - 1];
    if (node.children !== undefined && node.children.length > 0) {
        tupleNodes.push(node.children[node.children.length - 1]);
        this.getLastTupleNodes(tupleNodes);
    }
    return tupleNodes;
};

sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreeNodes = function (currentBranch, node, level) {
    var currentNode = currentBranch[level];

    if (node.children.length === 0) {
        for (var levelIndex = 0; levelIndex < level; ++levelIndex) {
            currentBranch[levelIndex].numOfLeafChildren =
                currentBranch[levelIndex].numOfLeafChildren ? currentBranch[levelIndex].numOfLeafChildren + 1 : 1;
        }
    } else {
        for (var childIndex = 0; childIndex < node.children.length; ++childIndex) {
            var currentChildNode = currentBranch[level + 1];
            var nextChildNode = node.children[childIndex];
            if (!currentChildNode || currentChildNode.tuplePath !== nextChildNode.tuplePath ||
                currentChildNode.member.id !== nextChildNode.member.id ||
                currentChildNode.member.caption !== nextChildNode.member.caption ||
                currentChildNode.member.aggregationTarget !== nextChildNode.member.aggregationTarget) {
                var newChildNode = this.copyNode(nextChildNode);
                currentNode.children.push(newChildNode);
                currentBranch.splice(level + 1, currentBranch.length - (level + 1));
                currentBranch.push(newChildNode);
            }
            this.mergeTupleTreeNodes(currentBranch, nextChildNode, level + 1);
        }
    }
};

sap.basetable.crosstab.TupleTreeUtil.mergeTupleTree = function (currentRootNode, nextRootNode) {
    var mergedRootNode = this.copyNode(currentRootNode, true);
    var currentBranch = this.getLastTupleNodes([mergedRootNode]);

    this.mergeTupleTreeNodes(currentBranch, nextRootNode, 0);

    return mergedRootNode;
};

sap.basetable.crosstab.TupleTreeUtil.mergeDataPoints = function (currentNode, nextNode) {
    if (currentNode.dataPoints !== undefined && nextNode.dataPoints !== undefined) {
        currentNode.dataPoints = currentNode.dataPoints.concat(nextNode.dataPoints);
    }
    for (var childIndex = 0; childIndex < currentNode.children.length; ++childIndex) {
        this.mergeDataPoints(currentNode.children[childIndex], nextNode.children[childIndex]);
    }
};

sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreeDataPoints = function (currentRootNode, nextRootNode) {
    var mergedNode = this.copyNode(currentRootNode, true);
    this.mergeDataPoints(mergedNode, nextRootNode);
    return mergedNode;
};

// Assumption is that currentTupleTrees and nextTupleTrees have the same columns. This method concats the rows.
sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreesVertically = function (currentTupleTrees, nextTupleTrees) {
    var mergedTupleTrees = [];
    mergedTupleTrees[0] = {
        rootnode: this.mergeTupleTree(currentTupleTrees[0].rootnode, nextTupleTrees[0].rootnode)
    };
    mergedTupleTrees[1] = {
        rootnode: this.copyNode(currentTupleTrees[1].rootnode, true)
    };
    return mergedTupleTrees;
};

// Assumption is that currentTupleTrees and nextTupleTrees have the same rows. This method concats the columns and row
// data points.
sap.basetable.crosstab.TupleTreeUtil.mergeTupleTreesHorizontally = function (currentTupleTrees, nextTupleTrees) {
    var mergedTupleTrees = [];
    mergedTupleTrees[0] = {
        rootnode: this.mergeTupleTreeDataPoints(currentTupleTrees[0].rootnode, nextTupleTrees[0].rootnode)
    };
    mergedTupleTrees[1] = {
        rootnode: this.mergeTupleTree(currentTupleTrees[1].rootnode, nextTupleTrees[1].rootnode)
    };
    return mergedTupleTrees;
};

// Kristina's version
sap.basetable.crosstab.TupleTreeUtil.mergeTrees = function (currentTree, nextTree){

    currentTree.numOfLeafChildren+=nextTree.numOfLeafChildren;
    for (var n =0; n < nextTree.children.length; n++){
        var nextNode = nextTree.children[n];
        var simular = false;
        for (var c =0; c < currentTree.children.length; c++){
            var currentNode = currentTree.children[c];

            if (currentNode.tuplePath === nextNode.tuplePath && currentNode.member.id === nextNode.member.id && currentNode.member.caption === nextNode.member.caption){
                if(currentNode.member.aggregationTarget && nextNode.member.aggregationTarget && currentNode.member.aggregationTarget.id !== nextNode.member.aggregationTarget.id ){
                    continue;
                } else if (currentNode.member.aggregationTarget && nextNode.member.aggregationTarget && currentNode.member.aggregationTarget.id === nextNode.member.aggregationTarget.id) {
                    simular = true;
                    break;
                } else {
                    this.mergeTrees(currentNode, nextNode);
                    simular = true;
                    break;
                }

            }

        }
        if (!simular){
            currentTree.children.push(nextNode);
        }
    }
};

sap.basetable.crosstab.TupleTreeUtil._copyNodeBase = function (node, copyChildren) {
    var newNode = {
        tuplePath: node.tuplePath,
        children: []
    };

    if (node.numOfLeafChildren) {
        newNode.numOfLeafChildren = copyChildren ? node.numOfLeafChildren : 0;
    }

    if (node.member) {
        newNode.member = {
            id: node.member.id,
            baseId: node.member.baseId,
            caption: node.member.caption,
            aggregationTarget: node.member.aggregationTarget
        };
        if (node.member.stackIndex !== undefined) {
            newNode.member.stackIndex = node.member.stackIndex;
        }
    }

    if (node.isTotal !== undefined) {
        newNode.isTotal = node.isTotal;
    }

    if (node.isMeasure !== undefined) {
        newNode.isMeasure = node.isMeasure;
    }

    return newNode;
};

sap.basetable.crosstab.TupleTreeUtil.copyNode = function (node, copyChildren) {
    var newNode = this._copyNodeBase(node, copyChildren);

    if (node.dataPoints) {
        newNode.dataPoints = [];
        for (var dataIndex = 0; dataIndex < node.dataPoints.length; ++dataIndex) {
            newNode.dataPoints.push(node.dataPoints[dataIndex]);
        }
    }

    if (copyChildren) {
        for (var childIndex = 0; childIndex < node.children.length; ++childIndex) {
            var newChild = this.copyNode(node.children[childIndex], copyChildren);
            newNode.children.push(newChild);
        }
    }

    return newNode;
};

sap.basetable.crosstab.TupleTreeUtil.copyDataPointLeafNode = function (node, dataStartIndex, dataSize) {
    var newNode = this._copyNodeBase(node);

    if (node.dataPoints) {
        newNode.dataPoints = [];
        for (var dataIndex = dataStartIndex; dataIndex < node.dataPoints.length; ++dataIndex) {
            if (dataSize !== undefined && dataIndex >= (dataStartIndex + dataSize)) {
                break;
            }
            newNode.dataPoints.push(node.dataPoints[dataIndex]);
        }
    }

    return newNode;
};

sap.basetable.crosstab.TupleTreeUtil.flattenTupleNodes = function (node, tupleNodes, flattenTuples) {
    if (node.children.length === 0) {
        tupleNodes.push(node);
        flattenTuples.push(tupleNodes);
    } else {
        for (var childIndex = 0; childIndex < node.children.length; ++childIndex) {
            this.flattenTupleNodes(node.children[childIndex], tupleNodes.concat([node]), flattenTuples);
        }
    }

    return flattenTuples;
};

sap.basetable.crosstab.TupleTreeUtil.getLeafTuplePaths = function (node) {
    return this.getLeafNodes(node).map(function(leafNode) {
        return leafNode.tuplePath;
    });
};

sap.basetable.crosstab.TupleTreeUtil.getLeafNodes = function (node, currentLeafNodes) {

    if (!Array.isArray(currentLeafNodes)) {
        currentLeafNodes = [];
    }

    if (node.children.length === 0) {
        currentLeafNodes.push(node);
    } else {
        for (var childIndex = 0; childIndex < node.children.length; ++childIndex) {
            this.getLeafNodes(node.children[childIndex], currentLeafNodes);
        }
    }

    return currentLeafNodes;
};

// truncate the tuples from the start of the tree
sap.basetable.crosstab.TupleTreeUtil.truncateTupleTree = function (tupleTree, startIndex, numTuples) {
    var flattenTuples = this.flattenTupleNodes(tupleTree.rootnode, [], []);

    var previousTuple = null;

    var lastTupleIndex;
    if (numTuples === undefined) {
        lastTupleIndex = flattenTuples.length - 1;
    } else {
        lastTupleIndex = Math.min(flattenTuples.length, startIndex + numTuples) - 1;
    }

    for (var tupleIndex = startIndex; tupleIndex <= lastTupleIndex; ++tupleIndex) {
        var tuple = flattenTuples[tupleIndex];

        var currentTuple = [];
        for (var elementIndex = 0; elementIndex < tuple.length; ++elementIndex) {
            var parentNode = elementIndex === 0 ? null : currentTuple[elementIndex - 1];
            var node = tuple[elementIndex];

            var matchPreviousTupleNode = true;
            var newNode = null;
            if (previousTuple && matchPreviousTupleNode) {
                var previousTupleNode = previousTuple[elementIndex];
                matchPreviousTupleNode = !node.isTotal &&
                    (previousTupleNode.tuplePath === node.tuplePath) &&
                    ((!node.member && !previousTupleNode.member) || (node.member && previousTupleNode.member && node.member.id === previousTupleNode.member.id && node.member.caption === previousTupleNode.member.caption));
                if (matchPreviousTupleNode) {
                    newNode = previousTupleNode;
                }
            }
            if (newNode === null) {
                newNode = this.copyNode(node);
                if (parentNode) {
                    parentNode.children.push(newNode);
                }
            }

            if (parentNode) {
                parentNode.numOfLeafChildren++;
            }

            currentTuple.push(newNode);
            parentNode = newNode;
        }

        previousTuple = currentTuple;
    }

    var truncatedTree = null;
    if (previousTuple !== null) {
        truncatedTree = {
            rootnode: previousTuple[0]
        };
    }

    return truncatedTree;
};

// truncates the data points of the leaf nodes
sap.basetable.crosstab.TupleTreeUtil.truncateTupleTreeDataPoints = function (tupleTree, startIndex, numDataPoints) {
    var flattenTuples = this.flattenTupleNodes(tupleTree.rootnode, [], []);

    var previousTuple = null;
    for (var tupleIndex = 0; tupleIndex < flattenTuples.length; ++tupleIndex) {
        var tuple = flattenTuples[tupleIndex];

        var currentTuple = [];
        for (var elementIndex = 0; elementIndex < tuple.length; ++elementIndex) {
            var parentNode = elementIndex === 0 ? null : currentTuple[elementIndex - 1];
            var node = tuple[elementIndex];

            var matchPreviousTupleNode = true;
            var newNode = null;
            if (previousTuple && matchPreviousTupleNode) {
                var previousTupleNode = previousTuple[elementIndex];
                matchPreviousTupleNode = !node.isTotal &&
                    (previousTupleNode.tuplePath === node.tuplePath) &&
                    ((!node.member && !previousTupleNode.member) || (node.member && previousTupleNode.member && node.member.id === previousTupleNode.member.id && node.member.caption === previousTupleNode.member.caption));
                if (matchPreviousTupleNode) {
                    newNode = previousTupleNode;
                }
            }
            if (newNode === null) {
                newNode = elementIndex === tuple.length - 1 ? this.copyDataPointLeafNode(node, startIndex, numDataPoints) : this.copyNode(node);
                if (parentNode) {
                    parentNode.children.push(newNode);
                }
            }

            if (parentNode) {
                parentNode.numOfLeafChildren++;
            }

            currentTuple.push(newNode);
            parentNode = newNode;
        }

        previousTuple = currentTuple;
    }

    var truncatedTree = null;
    if (previousTuple !== null) {
        truncatedTree = {
            rootnode: previousTuple[0]
        };
    }

    return truncatedTree;
};

// TODO TupleTreeUtil should not be aware of windowAxisSpecifications - move this function to PageManager
sap.basetable.crosstab.TupleTreeUtil.truncateTupleTrees = function (tupleTrees, windowAxisSpecifications, rowAxisName, columnAxisName) {
    var rowTupleTree = tupleTrees[0];
    var columnTupleTree = tupleTrees[1];

    var windowAxisSpecification = windowAxisSpecifications[0]; // TODO only care about the subtotal offset of first window axis spec?

    // truncate the tuples before the sub-totals
    if (windowAxisSpecification !== undefined) {
        var columnAxisRange = windowAxisSpecification[columnAxisName];
        if (columnAxisRange && columnAxisRange.subtotalOffset) {
            columnTupleTree = this.truncateTupleTree(columnTupleTree, columnAxisRange.subtotalOffset);
            rowTupleTree = this.truncateTupleTreeDataPoints(rowTupleTree, columnAxisRange.subtotalOffset);
        }

        var rowAxisRange = windowAxisSpecification[rowAxisName];
        if (rowAxisRange && rowAxisRange.subtotalOffset) {
            rowTupleTree = this.truncateTupleTree(rowTupleTree, rowAxisRange.subtotalOffset);
        }
    }

    return [rowTupleTree, columnTupleTree];
};

sap.basetable.crosstab.TupleTreeUtil.truncateTupleTreeRows = function (tupleTrees, startRowIndex, numRows) {
    var truncatedRowTupleTree = this.truncateTupleTree(tupleTrees[0], startRowIndex, numRows);
    return [truncatedRowTupleTree, tupleTrees[1]];
};

sap.basetable.crosstab.TupleTreeUtil.truncateTupleTreeColumns = function (tupleTrees, startColumnIndex, numColumns) {
    var truncatedRowTupleTree = this.truncateTupleTreeDataPoints(tupleTrees[0], startColumnIndex, numColumns);
    var truncatedColumnTupleTree = this.truncateTupleTree(tupleTrees[1], startColumnIndex, numColumns);
    return [truncatedRowTupleTree, truncatedColumnTupleTree];
};

sap.basetable.crosstab.TupleTreeUtil.truncateTupleTreeRowsColumns = function (tupleTrees, startRowIndex, numRows, startColumnIndex, numColumns) {
    var truncatedTupleTrees = this.truncateTupleTreeRows(tupleTrees, startRowIndex, numRows);
    return this.truncateTupleTreeColumns(truncatedTupleTrees, startColumnIndex, numColumns);
};

sap.basetable.crosstab.TupleTreeUtil.splitTupleTree = function (tupleTree, pageSize) {
    var flattenTuples = this.flattenTupleNodes(tupleTree.rootnode, [], []);

    var tupleTreeArray = [];
    var previousTuple = null;
    for (var tupleIndex = 0; tupleIndex < flattenTuples.length; ++tupleIndex) {
        var tuple = flattenTuples[tupleIndex];

        var matchPreviousTupleNode = true;
        var currentTuple = [];
        for (var elementIndex = 0; elementIndex < tuple.length; ++elementIndex) {
            var parentNode = elementIndex === 0 ? null : currentTuple[elementIndex - 1];
            var node = tuple[elementIndex];

            var newNode = null;
            if (previousTuple && matchPreviousTupleNode) {
                var previousTupleNode = previousTuple[elementIndex];
                matchPreviousTupleNode = !node.isTotal &&
                    (previousTupleNode.tuplePath === node.tuplePath) &&
                    ((!node.member && !previousTupleNode.member) || (node.member && previousTupleNode.member && node.member.id === previousTupleNode.member.id && node.member.caption === previousTupleNode.member.caption));
                if (matchPreviousTupleNode) {
                    newNode = previousTupleNode;
                }
            }
            if (newNode === null) {
                newNode = this.copyNode(node);
                if (parentNode) {
                    parentNode.children.push(newNode);
                }
            }

            if (parentNode) {
                parentNode.numOfLeafChildren++;
            }

            currentTuple.push(newNode);
            parentNode = newNode;
        }

        if ((tupleIndex + 1) % pageSize === 0) {
            tupleTreeArray.push({
                rootnode: currentTuple[0]
            });
            previousTuple = null;
        } else {
            previousTuple = currentTuple;
        }
    }

    if (previousTuple) {
        tupleTreeArray.push({
            rootnode: previousTuple[0]
        });
    }

    return tupleTreeArray;
};

sap.basetable.crosstab.TupleTreeUtil.splitTupleTreeByDataPoints = function (tupleTree, totalNumDataPoints, pageSize) {
    var flattenTuples = this.flattenTupleNodes(tupleTree.rootnode, [], []);

    var tupleTreeArray = [];
    var previousTuple = null;
    var dataStartIndex = 0;
    do {
        for (var tupleIndex = 0; tupleIndex < flattenTuples.length; ++tupleIndex) {
            var tuple = flattenTuples[tupleIndex];

            var matchPreviousTupleNode = true;
            var currentTuple = [];
            for (var elementIndex = 0; elementIndex < tuple.length; ++elementIndex) {
                var parentNode = elementIndex === 0 ? null : currentTuple[elementIndex - 1];
                var node = tuple[elementIndex];

                var newNode = null;
                if (previousTuple && matchPreviousTupleNode) {
                    var previousTupleNode = previousTuple[elementIndex];
                    matchPreviousTupleNode = !node.isTotal &&
                        (previousTupleNode.tuplePath === node.tuplePath) &&
                        ((!node.member && !previousTupleNode.member) || (node.member && previousTupleNode.member && node.member.id === previousTupleNode.member.id && node.member.caption === previousTupleNode.member.caption));
                    if (matchPreviousTupleNode) {
                        newNode = previousTupleNode;
                    }
                }
                if (newNode === null) {
                    newNode = elementIndex === tuple.length - 1 ? this.copyDataPointLeafNode(node, dataStartIndex, pageSize) : this.copyNode(node);
                    if (parentNode) {
                        parentNode.children.push(newNode);
                    }
                }

                if (parentNode) {
                    parentNode.numOfLeafChildren++;
                }

                currentTuple.push(newNode);
                parentNode = newNode;
            }

            previousTuple = currentTuple;
        }

        if (previousTuple) {
            tupleTreeArray.push({
                rootnode: previousTuple[0]
            });
        }

        previousTuple = null;
        dataStartIndex += pageSize;

    } while (dataStartIndex < totalNumDataPoints)

    return tupleTreeArray;
};

sap.basetable.crosstab.TupleTreeUtil.traverseTree = function(tupleTreeNode, dimensionIndexes) {
    for (var index = 0; index < dimensionIndexes.length; index++) {
        tupleTreeNode = tupleTreeNode.children[dimensionIndexes[index]];
    }
    return tupleTreeNode;
};
 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *
 * (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";
jQuery.sap.declare("sap.basetable.crosstab.UI5Crosstab");
jQuery.sap.require("sap.ui.core.Control");
sap.basetable.crosstab.BaseControl.extend("sap.basetable.crosstab.UI5Crosstab",
    {
        metadata:
        {
            publicMethods: ["select"],
            properties:
            {
                "width": {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                "height": {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                "columnCellWidth": {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                "columnCellHeight": {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                "rowCellHeight": {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                "rowCellWidth": {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },

            },
            aggregations:
            {
                "dataProvider": {
                    type: "sap.basetable.crosstab.CrosstabDataProvider",
                    multiple: false
                }
            },
            events:
            {}
        }
    });

sap.basetable.crosstab.UI5Crosstab.prototype.init = function() {
    sap.basetable.crosstab.BaseControl.prototype.init.apply(this, arguments);
    this._crosstab = null;
    this._onThemeChanged = jQuery.proxy(this._applyTheme, this);
    sap.ui.getCore().attachThemeChanged(this._onThemeChanged);
    this._clearVariables();
    this._externalScrollHandler = null;

    sap.ui.getCore().getEventBus().subscribe("viz.ext.crosstab", "externalCrosstabScroll", this.handleExternalScroll, this);
    sap.ui.getCore().getEventBus().subscribe("viz.ext.crosstab", "scaleCrosstab", this.handleCrosstabScaling, this);
};

sap.basetable.crosstab.UI5Crosstab.prototype.applySettings = function() {
    sap.ui.core.Control.prototype.applySettings.apply(this, arguments);
    this._createCrosstab();
};

sap.basetable.crosstab.UI5Crosstab.prototype.exit = function() {
    sap.basetable.crosstab.BaseControl.prototype.exit.apply(this, arguments);
    sap.ui.getCore().detachThemeChanged(this._onThemeChanged);
    this._clearVariables();

    sap.ui.getCore().getEventBus().unsubscribe("viz.ext.crosstab", "externalCrosstabScroll", this.handleExternalScroll, this);
    sap.ui.getCore().getEventBus().unsubscribe("viz.ext.crosstab", "scaleCrosstab", this.handleCrosstabScaling, this);
};

sap.basetable.crosstab.UI5Crosstab.prototype.setDataProvider = function(dataProvider) {
    if (this._crosstab) {
        this._crosstab.setDataProvider(dataProvider);
    }
};

sap.basetable.crosstab.UI5Crosstab.prototype.vizUpdate = function(o) {
    if (this._crosstab && o.dataProvider) {
        this._crosstab.vizUpdate(o.dataProvider);
    }
};

sap.basetable.crosstab.UI5Crosstab.prototype.getIntWidth = function() {
    var iWidth = -1;
    var sWidth = this.getWidth();
    if (sWidth && sWidth !== "auto") {
        iWidth = parseInt(sWidth, 10);
    }
    return iWidth;
};

sap.basetable.crosstab.UI5Crosstab.prototype.getIntHeight = function() {
    var iHeight = -1;
    var sHeight = this.getHeight();
    if (sHeight && sHeight !== "auto") {
        iHeight = parseInt(sHeight, 10);
    }
    return iHeight;
};

sap.basetable.crosstab.UI5Crosstab.prototype.getIntColumnCellWidth = function() {
    var iWidth = -1;
    var sWidth = this.getColumnCellWidth();
    if (sWidth && sWidth !== "auto") {
        iWidth = parseInt(sWidth, 10);
    }
    return iWidth;
};

sap.basetable.crosstab.UI5Crosstab.prototype.getIntColumnCellHeight = function() {
    var iHeight = -1;
    var sHeight = this.getColumnCellHeight();
    if (sHeight && sHeight !== "auto") {
        iHeight = parseInt(sHeight, 10);
    }
    return iHeight;
};

sap.basetable.crosstab.UI5Crosstab.prototype.getIntRowCellHeight = function() {
    var iHeight = -1;
    var sHeight = this.getRowCellHeight();
    if (sHeight && sHeight !== "auto") {
        iHeight = parseInt(sHeight, 10);
    }
    return iHeight;
};

sap.basetable.crosstab.UI5Crosstab.prototype.getIntRowCellWidth = function() {
    var iWidth = -1;
    var sWidth = this.getRowCellWidth();
    if (iWidth && sWidth !== "auto") {
        iWidth = parseInt(sWidth, 10);
    }
    return iWidth;
};

sap.basetable.crosstab.UI5Crosstab.prototype.select = function(tuplePaths, groupType, cellType) {
    if (this._crosstab) {
        return this._crosstab.select(tuplePaths, groupType, cellType);
    }
    return null;
};

sap.basetable.crosstab.UI5Crosstab.prototype.handleExternalScroll = function (channel, type, data) {
    if (this.ignoreExternalScroll() || channel !== "viz.ext.crosstab"  || type !== "externalCrosstabScroll" ) {
        return;
    }

    if(!this.externalScrollHandler || this.externalScrollHandler.getUI5Crosstab().sId !== this.sId) {
        this.externalScrollHandler = new sap.basetable.crosstab.ExternalScrollHandler(this);
    }

    this.externalScrollHandler.doScroll(data);
};

sap.basetable.crosstab.UI5Crosstab.prototype.handleCrosstabScaling = function (channel, type, data) {
    if (channel !== "viz.ext.crosstab"  || type !== "scaleCrosstab" || typeof data === undefined ||
        typeof data.scaleFactor !== "number" || data.scaleFactor < 0) {
        return;
    }

    this._crosstab.setScaleFactor(data.scaleFactor);
};

sap.basetable.crosstab.UI5Crosstab.prototype.getScaleFactor = function () {
    return this._crosstab.getScaleFactor();
};

sap.basetable.crosstab.UI5Crosstab.prototype.ignoreExternalScroll = function() {
    if(this._crosstab) {
        return this._crosstab.isHorizontallyScrollable() && this._crosstab.isVerticallyScrollable();
    }

    return true;
};

sap.basetable.crosstab.UI5Crosstab.prototype._clearVariables = function() {
    this._crosstab$ = null;
};

sap.basetable.crosstab.UI5Crosstab.prototype._createCrosstab = function() {
    this._applyTheme();
    var c = "ui5-viz-controls";
    this._crosstab$ = $(document.createElement("div"));
    this._crosstab$.addClass(c + "-viz-frame");
    $(this._app$).attr("data-sap-ui-preserve", true);
    var crosstabContext = {
        size : {
            width : this.getIntWidth(),
            height : this.getIntHeight(),
            columnCellWidth : this.getIntColumnCellWidth(),
            columnsCellHeight : this.getIntColumnCellHeight(),
            rowCellHeight : this.getIntRowCellHeight(),
            rowCellWidth : this.getIntRowCellWidth()
        },
        container : $(this._crosstab$),
        dataProvider : this.getDataProvider(),
        parentId : this.sId.split("__")[1]
    };
    this._crosstab = new sap.basetable.crosstab.Crosstab(crosstabContext);
};

sap.basetable.crosstab.UI5Crosstab.prototype._updateCrosstab = function(isResize) {
    if (this._crosstab) {
        this._crosstab.draw(this.getIntHeight(), this.getIntWidth(), isResize);
        this._crosstab.renderCellGroups();
    }
};

sap.basetable.crosstab.UI5Crosstab.prototype._createChildren = function() {
    this._crosstab$.appendTo(this._app$);
    this._updateCrosstab(false);
};

sap.basetable.crosstab.UI5Crosstab.prototype._updateChildren = function(mProperties) {
    var resize = !$.isEmptyObject(mProperties);

    this._updateCrosstab(resize);
};

sap.basetable.crosstab.UI5Crosstab.prototype._applyTheme = function() {};

sap.basetable.crosstab.UI5Crosstab.prototype.setRoot = function(root){
    this._crosstab.setRoot(root);
};

sap.basetable.crosstab.UI5Crosstab.prototype.getCrosstab = function(){
    return this._crosstab;
};
 /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *
 * (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare('sap.basetable.crosstab.UI5CrosstabRenderer');
sap.basetable.crosstab.UI5CrosstabRenderer = {};
sap.basetable.crosstab.UI5CrosstabRenderer.render = function(r, c) {
    r.write('<DIV');
    r.writeControlData(c);
    r.addClass('sapUI5Crosstab');
    r.writeClasses();
    r.addStyle('width', c.getWidth());
    r.addStyle('height', c.getHeight());
    r.addStyle('overflow', 'hidden')
    r.writeStyles();
    r.write('>');
    r.write('</DIV>')
};
jQuery.sap.declare("sap.basetable.crosstab.utils.FormatUtils");

sap.basetable.crosstab.utils.FormatUtils = function() {
    "use strict";
};

sap.basetable.crosstab.utils.FormatUtils.NUMERIC_PREFIX = "numeric:";

sap.basetable.crosstab.utils.FormatUtils.createFormatArray =  function(modelFormatArray) {

    if($.isEmptyObject(modelFormatArray)){
        return;
    }

    var numberFormat_Arr=[];

    var isNumberFormatWithPrefix;
    for (var i=0; i<modelFormatArray.length; i++) {
        var format=modelFormatArray[i];
        if (format) {
            if(isNumberFormatWithPrefix === undefined){
                isNumberFormatWithPrefix = format.indexOf(sap.basetable.crosstab.utils.FormatUtils.NUMERIC_PREFIX) === 0;
            }
            if(isNumberFormatWithPrefix){
                numberFormat_Arr.push(format);
            }
            /* TODO; Check if this is still neccesary after the info chart teams refactoring of number formatting
            else{
                var ui5FNFloatInstance=sap.cvom.tableviewer.utils.FormatUtil.createSAPUI5NumberFormat(a[i]);
                if (ui5FNFloatInstance) {
                    numberFormat_Arr.push(ui5FNFloatInstance);
                }
            }*/
        }
    }

    return numberFormat_Arr;
};

sap.basetable.crosstab.utils.FormatUtils.applyFormats = function(value, format) {
    if (typeof(format) === "string") {
        value = sap.viz.api.env.Format.format(value, format);
    } /*TODO; Check if this is still neccesary after the info chart teams refactoring of number formatting
    else {
        value=this._applyDataFormat(value, format);
    } */

    return value;
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.utils.MemberKeyUtils");

sap.basetable.crosstab.utils.MemberKeyUtils = function () {
};

sap.basetable.crosstab.utils.MemberKeyUtils.TUPLE_PATH_DELIMITER_REPLACER = "~";

sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();

// Takes a tuplePath and returns an array of memberKeys for the tuple
// We have modified the memberKeys which contain tuplePath delimiter when we build member key.
// If modifiedMemberKeys parameter exists, we need to return the original memberKey
sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath = function (tuplePath, modifiedMemberKeys) {
    var result = [];
    if (typeof tuplePath === "string") {
        for (var i = 0; i < tuplePath.length; i++) {
            var isInQuotes = false;
            var startIndex = i;
            while (i < tuplePath.length && (isInQuotes || tuplePath[i] !== sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants.TUPLE_PATH_DELIMITER)) {
                if (tuplePath[i] === "\"") {
                    isInQuotes = !isInQuotes;
                } else if (tuplePath[i] === "\\") {
                    i++;
                }
                i++;
            }

            var memberKey = tuplePath.substring(startIndex, i);
            if (modifiedMemberKeys && modifiedMemberKeys[memberKey]) {
                // If the memberKey has been modified, get the original memberKey
                memberKey = modifiedMemberKeys[memberKey];
            }
            result.push(memberKey);
        }
    }
    return result;
};

// Takes a member key and returns a member object with key, parentId and secondaryDistinctCount propertis
sap.basetable.crosstab.utils.MemberKeyUtils.parseMemberKey = function (memberKey) {
    memberKey = String(memberKey);
    var keyParts = memberKey.split(sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants.MEMBER_KEY_DELIMITER);
    // Member key may include parentId and secondaryDistinctCount
    var secondaryDistinctCount = keyParts.length >= 2 ? parseInt(keyParts[1]) : null;
    var parentId = keyParts.length >= 3 ? keyParts[2].substr(1, keyParts[2].length - 2) : null;
    var member = {
        key: keyParts[0],
        parentId: parentId,
        secondaryDistinctCount: secondaryDistinctCount
    };
    return member;
};

sap.basetable.crosstab.utils.MemberKeyUtils.sanitizeMemberKey = function(memberKey) {
    var sanitizedMemberKey = memberKey;
    var originalKey = memberKey;
    var hasModified = false;

    // undefined in the BI Query response from server, null from desktop
    if (memberKey === undefined || memberKey === null) {
        // to help construct a valid tuple path
        sanitizedMemberKey = sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants.NULL_VALUE;
    } else if (memberKey === "") {
        // to help distinguish from the tuple path of root node which is empty string
        sanitizedMemberKey = sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants.EMPTY_VALUE;
    } else if (typeof memberKey === "string") {
        memberKey = String(memberKey);
        var re = new RegExp("\\" + this._crosstabConstants.TUPLE_PATH_DELIMITER, "g");
        sanitizedMemberKey = memberKey.replace(re, sap.basetable.crosstab.utils.MemberKeyUtils.TUPLE_PATH_DELIMITER_REPLACER);
        // Only set hasModified when the member key is replaced
        hasModified = sanitizedMemberKey.length > 0 && sanitizedMemberKey !== memberKey;
    }

    return {memberKey: sanitizedMemberKey, originalKey: originalKey, hasModified: hasModified};
};

// buildMemberKey based on memberJSON
// Convert NULL_VALUE, EMPTY_VALUE and include secondaryDistinctCount and parentId if exist
// Note: TUPLE_PATH_DELIMITER(|) within memberKey will be replaced with TUPLE_PATH_DELIMITER_REPLACER(~)
// In this case, the memberKey will be the replaced one, the originalKey will be what it was before, and hasModified will be true
sap.basetable.crosstab.utils.MemberKeyUtils.buildMemberKey = function(memberJSON) {
    var keys = this.sanitizeMemberKey(memberJSON.key);
    var memberKey = keys.memberKey;
    var originalKey = keys.originalKey;
    var hasModified = keys.hasModified;

    if (memberJSON.properties) {
        if (typeof memberJSON.properties.secondaryDistinctCount !== "undefined") {
            memberKey += sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.MEMBER_KEY_DELIMITER +
                            memberJSON.properties.secondaryDistinctCount.toString();
            originalKey  += sap.basetable.crosstab.CrosstabDataProvider._crosstabConstants.MEMBER_KEY_DELIMITER +
                            memberJSON.properties.secondaryDistinctCount.toString();
        }
        if (typeof memberJSON.properties.parentId !== "undefined") {
            keys = this.sanitizeMemberKey(memberJSON.properties.parentId);
            memberKey += sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants.MEMBER_KEY_DELIMITER + keys.memberKey;
            originalKey += sap.basetable.crosstab.utils.MemberKeyUtils._crosstabConstants.MEMBER_KEY_DELIMITER + keys.originalKey;
            hasModified = keys.hasModified;
        }
    }

    return {memberKey: memberKey, originalKey: hasModified ? originalKey : null, hasModified: hasModified};
};
jQuery.sap.declare("sap.basetable.crosstab.utils.ParameterUtils");

sap.basetable.crosstab.utils.ParameterUtils = function() {
    "use strict";
};

sap.basetable.crosstab.utils.ParameterUtils.getURLValue = function(parameterName) {
    var parameterValue;

    var params = window.location.search.split(/\?|\&/);

    for (var i = 0; i < params.length; ++i) {
        var param = params[i].split("=");
        if (param[0] === parameterName) {
            parameterValue = param[1];
            break;
        }
    }

    return parameterValue;
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.utils.QueryRequestUtils");

// TODO Technical Debt - Move more functions from CrosstabDataProvider to here.
// Currently, query request is being passed to all the functions. We need to
// distinguish between when we need to process the query request with every
// new window data versus only the initial window data.
sap.basetable.crosstab.utils.QueryRequestUtils = function (queryRequest) {
    this._queryRequest = queryRequest || {};
};

sap.basetable.crosstab.utils.QueryRequestUtils.prototype.buildCalculationEntityIdSet = function () {
    var calculationEntityIdSet = {};

    var axesContainer = this._queryRequest.layout ? this._queryRequest.layout : this._queryRequest;
    for (var axisName in axesContainer) {
        if (axesContainer.hasOwnProperty(axisName) && axesContainer[axisName].axisType === "numerical") {
            var measureGroupContainer = axesContainer[axisName];
            if (measureGroupContainer.hasOwnProperty("components")) {
                var measureGroupComponents = measureGroupContainer.components;
                for (var i = 0; i < measureGroupComponents.length; ++i) {
                    if (measureGroupComponents[i].analyticType === "calculation") {
                        var measureGroupComponent = measureGroupComponents[i];
                        calculationEntityIdSet[measureGroupComponent.id] = true;
                    }
                }
            }
        }
    }

    return calculationEntityIdSet;
};
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.utils.QueryResponseUtils");

sap.basetable.crosstab.utils.QueryResponseUtils = function (queryResponse, measureValues) {
    this._queryResponse = queryResponse;
    this._dictionary = this._queryResponse.metadata.dictionary;
    this._measureValues = measureValues;
    this._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();

    this._measureNameToIdMap = {};
    this._measureIdToNameMap = [];
    for (var i = 0; i < this._measureValues.length; i++) {
        var measureValue = this._measureValues[i];
        this._measureNameToIdMap[measureValue.name] = measureValue.id;
        this._measureIdToNameMap.push(measureValue.name);
    }

    this._dimensionLocationCache = {};
    this._dimensionIndexesCache = {};
};

// Returns an object containing axisName and dimensionId on that axis for "dimensionKey".
sap.basetable.crosstab.utils.QueryResponseUtils.prototype.findDimensionLocation = function (dimensionKey) {
    var cachedDimensionLocation = this._dimensionLocationCache[dimensionKey];
    if (cachedDimensionLocation) {
        return cachedDimensionLocation;
    }
    for (var axisId = 1; axisId <= 2; axisId++) {
        var axisName = "axis" + axisId;
        if (axisName in this._dictionary) {
            for (var dimensionId = 0; dimensionId < this._dictionary[axisName].length; dimensionId++) {
                if (this._dictionary[axisName][dimensionId].id === dimensionKey) {
                    this._dimensionLocationCache[dimensionKey] = {axisName: axisName, dimensionId: dimensionId};
                    return this._dimensionLocationCache[dimensionKey];
                }
            }
        }
    }
    return null;
};

// Returns the values (members) of a dimension key
sap.basetable.crosstab.utils.QueryResponseUtils.prototype.getDimensionValues = function (dimensionKey) {
    var dimensionLocation = this.findDimensionLocation(dimensionKey);
    if (!dimensionLocation) {
        return [];
    }
    return this._dictionary[dimensionLocation.axisName][dimensionLocation.dimensionId].value;
};

// Find the index of dimensionIndexes in the query response
// dimensionIndexes doesn't include measures dimension
// If dimensionIndexesLocationHint is provided, we start searching from there direction-ward.
sap.basetable.crosstab.utils.QueryResponseUtils.prototype._findDimensionIndexesLocation = function (axisName, dimensionIndexes, dimensions, dimensionIndexesLocationHint, direction) {
    var jsonKey = axisName + ":" + JSON.stringify(dimensionIndexes);
    var dimensionIndexesLocation = this._dimensionIndexesCache[jsonKey];
    // Search for the indexes if we haven't cached the value or if we have a hint on where to find it
    if (!dimensionIndexesLocation || dimensionIndexesLocationHint) {
        var index = dimensionIndexesLocationHint || 0;
        direction = dimensionIndexesLocationHint && direction ? direction : 1;
        while (index >= 0 && index < this._queryResponse.dimAxes[axisName].values.length) {
            var currentDimensionIndexes = this._queryResponse.dimAxes[axisName].values[index];
            var found = true;
            for (var i = 0; found && i < dimensionIndexes.length; i++) {
                if (dimensions[i].id !== this._crosstabConstants.MEASURE_NAMES_DIMENSION && dimensionIndexes[i] !== currentDimensionIndexes[i]) {
                    found = false;
                }
            }
            if (found) {
                this._dimensionIndexesCache[jsonKey] = index;
                return index;
            }
            index += direction;
        }
    }

    return dimensionIndexesLocation;
};


sap.basetable.crosstab.utils.QueryResponseUtils.prototype._saveDimensionIndexesLocation = function (axisName, dimensionIndexes, value) {
    var jsonKey = axisName + ":" + JSON.stringify(dimensionIndexes);
    this._dimensionIndexesCache[jsonKey] = value;
};

// Finds the next/previous item (based on direction) on the axis. It only takes into account dimensions and measure (e.g. not subtotals)
sap.basetable.crosstab.utils.QueryResponseUtils.prototype.nextDimensionIndexes = function (axisName, dimensionIndexes, dimensions, direction) {
    // Find the measure's location
    var measuresLocation = null, i, result;
    for (i = 0; i < dimensionIndexes.length; i++) {
        if (dimensions[i].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
            measuresLocation = i;
            break;
        }
    }

    // Make measure-less dimension indexes and dimensions
    var measureIndex = null;
    var measurelessDimensionIndexes = dimensionIndexes;
    var measurelessDimensions = dimensions;
    if (measuresLocation !== null) {
        // .slice() clones the indexes and lets splice modify them in-place.
        measurelessDimensionIndexes = measurelessDimensionIndexes.slice();
        measurelessDimensionIndexes.splice(measuresLocation, 1);
        measurelessDimensions = measurelessDimensions.slice();
        measurelessDimensions.splice(measuresLocation, 1);
        measureIndex = dimensionIndexes[measuresLocation];
    }

    var dimensionIndexesLocation = this._findDimensionIndexesLocation(axisName,
                                                                        measurelessDimensionIndexes,
                                                                        measurelessDimensions,
                                                                        dimensionIndexes.dimensionIndexesLocationHint,
                                                                        direction);
    var nextIndex = dimensionIndexesLocation;

    // Find the next indexes where dimensionIndexes has changed. This ignores measues.
    var hitTheEnd = false;
    var sameIndexes = true, nextMeasurelessDimensionIndexes;
    while (sameIndexes) {
        nextIndex += direction;
        if (nextIndex < 0 || nextIndex >= this._queryResponse.dimAxes[axisName].values.length) {
            if (!nextMeasurelessDimensionIndexes) {
                nextMeasurelessDimensionIndexes = measurelessDimensionIndexes;
            }
            hitTheEnd = true;
            break;
        }
        nextMeasurelessDimensionIndexes = this._queryResponse.dimAxes[axisName].values[nextIndex];
        for (i = 0; sameIndexes && i < measurelessDimensionIndexes.length; i++) {
            sameIndexes = measurelessDimensionIndexes[i] === nextMeasurelessDimensionIndexes[i];
        }
        if (!sameIndexes) {
            this._saveDimensionIndexesLocation(axisName, nextMeasurelessDimensionIndexes, nextIndex);
        }
    }

    // If measures were not involved, return the result.
    if (measuresLocation === null) {
        result = nextMeasurelessDimensionIndexes.slice(0, dimensionIndexes.length);
        result.dimensionIndexesLocationHint = nextIndex;
        return result;
    }

    // If dimension members before the measures haven't changed, the measure index stays the same.
    var preMeasureSame = true;
    for (i = 0; i < measuresLocation; i++) {
        preMeasureSame = preMeasureSame && dimensionIndexes[i] === nextMeasurelessDimensionIndexes[i];
    }
    if (preMeasureSame && !hitTheEnd) {
        result = nextMeasurelessDimensionIndexes.slice(0, dimensionIndexes.length - 1);
        result.splice(measuresLocation, 0, measureIndex);
        result.dimensionIndexesLocationHint = nextIndex;
        return result;
    }

    // If measures have reached their last index (-1 or this._measureValues.length), just adjust the measure index and return the result.
    var nextMeasureIndex = measureIndex + direction;
    if (nextMeasureIndex < 0 || nextMeasureIndex === this._measureValues.length) {
        nextMeasureIndex = (this._measureValues.length + nextMeasureIndex) % this._measureValues.length;
        result = nextMeasurelessDimensionIndexes.slice(0, dimensionIndexes.length - 1);
        result.splice(measuresLocation, 0, nextMeasureIndex);
        result.dimensionIndexesLocationHint = nextIndex;
        return result;
    }

    // Go in the reverse direction to find the first indexes before the measure changed
    nextIndex = dimensionIndexesLocation;
    preMeasureSame = true;
    while (preMeasureSame) {
        nextIndex -= direction;
        if (nextIndex < 0 || nextIndex >= this._queryResponse.dimAxes[axisName].values.length) {
            break;
        }
        nextMeasurelessDimensionIndexes = this._queryResponse.dimAxes[axisName].values[nextIndex];
        for (i = 0; i < measuresLocation && preMeasureSame; i++) {
            preMeasureSame = preMeasureSame && dimensionIndexes[i] === nextMeasurelessDimensionIndexes[i];
        }
    }
    nextMeasurelessDimensionIndexes = this._queryResponse.dimAxes[axisName].values[nextIndex + direction];
    result = nextMeasurelessDimensionIndexes.slice(0, dimensionIndexes.length - 1);
    result.splice(measuresLocation, 0, nextMeasureIndex);
    result.dimensionIndexesLocationHint = nextIndex + direction;
    return result;
};

// Finds the index of a member in a dimension or a measure.
sap.basetable.crosstab.utils.QueryResponseUtils.prototype._findDimensionMemberIndex = function (isDimensionMeasure, dimensionLocation, member, secondaryDistinctCount, parentId) {
    var index;
    if (isDimensionMeasure) {
        var measureKey = this._measureNameToIdMap[member];
        for (index = 0; index < this._dictionary.measureGroup1.length; index++) {
            if (this._dictionary.measureGroup1[index] === measureKey) {
                return index;
            }
        }
    } else {
        var memberList = this._dictionary[dimensionLocation.axisName][dimensionLocation.dimensionId].value;
        for (index = 0; index < memberList.length; index++) {
            // Check if member matches considering blended datasets
            var blendingMatch = secondaryDistinctCount === null ||
                        memberList[index].properties && memberList[index].properties.secondaryDistinctCount === secondaryDistinctCount;
            blendingMatch = blendingMatch && (parentId === null ||
                        memberList[index].properties && memberList[index].properties.parentId === parentId);
            if (!blendingMatch) {
                continue;
            }

            if (memberList[index].key !== null && memberList[index].key !== undefined) {
                // If key is not null, compare with member and consider <<empty>>
                if (memberList[index].key.toString() === member ||
                        memberList[index].key.toString() === "" && member === this._crosstabConstants.EMPTY_VALUE) {
                    return index;
                }
            // If key is null and member is <<null>>, check the attribute value or see if it's an aggregated cell from blending
            } else if ((memberList[index].attributes.value[0] === null || memberList[index].properties && memberList[index].properties.secondaryDistinctCount > 1) &&
                    member === this._crosstabConstants.NULL_VALUE) {
                return index;
            }
        }
    }
    return null;
};

// Takes a tuple and a list of dimensions, and returns an array of dimension indexes in query response
sap.basetable.crosstab.utils.QueryResponseUtils.prototype.getDimensionIndexes = function (tuplePath, dimensions, modifiedMemberKeys) {
    var result = [];
    var members = sap.basetable.crosstab.utils.MemberKeyUtils.parseTuplePath(tuplePath, modifiedMemberKeys);
    for (var i = 0; i < members.length; i++) {
        var memberKey = members[i];
        var member = sap.basetable.crosstab.utils.MemberKeyUtils.parseMemberKey(memberKey);
        var isDimensionMeasure = dimensions[i].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION;
        var dimensionMemberIndex = this._findDimensionMemberIndex(isDimensionMeasure,
                                                                isDimensionMeasure ? null : this.findDimensionLocation(dimensions[i].id),
                                                                member.key,
                                                                member.secondaryDistinctCount,
                                                                member.parentId);
        if (dimensionMemberIndex === null) {
            return null;
        }

        result.push(dimensionMemberIndex);
    }

    return result;
};

sap.basetable.crosstab.utils.QueryResponseUtils.prototype.getTupleMemberFromDimensionIndexes = function (dimensionIndexes, dimensions) {
    var tuple = "", member;
    for (var index = 0; index < dimensionIndexes.length; index++) {
        tuple += index === 0 ? "" : this._crosstabConstants.TUPLE_PATH_DELIMITER;
        if (dimensions[index].id === this._crosstabConstants.MEASURE_NAMES_DIMENSION) {
            member = this._measureIdToNameMap[dimensionIndexes[index]];
        } else {
            var dimensionLocation = this.findDimensionLocation(dimensions[index].id);
            var dimensionValues = this._dictionary[dimensionLocation.axisName][dimensionLocation.dimensionId].value;
            var keys = sap.basetable.crosstab.utils.MemberKeyUtils.buildMemberKey(dimensionValues[dimensionIndexes[index]]);
            member = keys.memberKey;
        }
        tuple += member;
    }
    return {tuple: tuple, member: member};
};

// Compares two dimensionIndexes arrays lexicographically and return 1, 0, or -1.
sap.basetable.crosstab.utils.QueryResponseUtils.prototype.compareDimensionIndexes = function (dimensionIndexes1, dimensionIndexes2) {
    for (var i = 0; i < dimensionIndexes1.length; i++) {
        if (dimensionIndexes1[i] > dimensionIndexes2[i]) {
            return 1;
        } else if (dimensionIndexes1[i] < dimensionIndexes2[i]) {
            return -1;
        }
    }
    return 0;
};

sap.basetable.crosstab.utils.QueryResponseUtils.prototype.getCaption = function(dimension, memberKey){
    var dimensionLocation = this.findDimensionLocation(dimension);
    var dimensionData = this._dictionary[dimensionLocation.axisName][dimensionLocation.dimensionId].value;
    var member = sap.basetable.crosstab.utils.MemberKeyUtils.parseMemberKey(memberKey);
    for (var i = 0; i < dimensionData.length; i++) {
        var key = member.key === this._crosstabConstants.NULL_VALUE ? null : member.key;
        key = key === this._crosstabConstants.EMPTY_VALUE ? "" : key;
        if (member.parentId !== null || member.secondaryDistinctCount !== null) {
            // if member key contains parentId or secondaryDistinctCount, check properties
            if (dimensionData[i].properties) {
                var properties = dimensionData[i].properties;
                if (String(dimensionData[i].key) === String(key) && properties.parentId === member.parentId &&
                        properties.secondaryDistinctCount === member.secondaryDistinctCount) {
                    return dimensionData[i].attributes.value[0];
                }
            }
        } else if (dimensionData[i].key && ((dimensionData[i].key).toString() === key)) {
            return dimensionData[i].attributes.value[0];
        }
    }
    return memberKey;
};
/*global $:false */
/*global jQuery:false */
/*global sap:false */
/*jshint globalstrict: true*/
"use strict";

jQuery.sap.declare("sap.basetable.crosstab.utils.RenderUtils");

sap.basetable.crosstab.utils.RenderUtils = function () {
};

// Static constants since they're used in static methods
sap.basetable.crosstab.utils.RenderUtils._crosstabConstants = new sap.basetable.crosstab.CrosstabConstants();

sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutCell = function(id) {
    var cell = $(document.createElement("div"));
    cell.attr({
        id: id
    });
    return cell;
};

sap.basetable.crosstab.utils.RenderUtils.createMatrixLayoutRow = function(id, height, cell, styleClass) {
    var row = $(document.createElement("div"));
    row.attr({
        id : id
    });
    if(height){
        row.css({
            height: height
        });
    }
    if (cell) {
        row.append(cell);
    }
    row.addClass("crosstab-row");
    row.addClass(styleClass);
    return row;
};

sap.basetable.crosstab.utils.RenderUtils.createMatrixLayout = function(id, width, height, widths) {
    var layout = $(document.createElement("div"));
    layout.attr({
        id: id,
        layoutFixed: true,
        widths: widths
    });

    layout.css({
        width: width + "px",
        height: height + "px",
        "border-spacing": "0px",
        padding: "0px"
    });

    return layout;
};

sap.basetable.crosstab.utils.RenderUtils.createContentCell = function(id, baseWidth, baseHeight, borderWidth, content, isMemberCell, isTop, rowSpan, colSpan, styleClass, addAPixelToWidth, resizedSize, disableResize, sortable) {
    var width = baseWidth;
    var height;
    if (typeof rowSpan !== "number" || rowSpan < 1) {
        rowSpan = 1;
    }

    if (resizedSize && resizedSize.height) {
        // The one extra pixel adjustment is for top member cells
        height = resizedSize.height - (isTop && isMemberCell ? 0 : 1);
    } else if (isMemberCell) {
        if (isTop) {
            height = baseHeight * rowSpan;
        } else {
            height = ((baseHeight + borderWidth) * rowSpan) - borderWidth;
        }
    } else {
        height = (baseHeight * rowSpan) - borderWidth;
    }

    if (resizedSize && resizedSize.width) {
        width = resizedSize.width - borderWidth;
    } else if (colSpan && colSpan > 1) {
        width *= colSpan;
        width -= borderWidth;
    } else {
        width -= borderWidth;
    }

    width = addAPixelToWidth ? width + 1 : width;

    var div = $(document.createElement("div"));
    div[0].setAttribute("id", id);
    div[0].style.width = width + "px";
    div[0].style.minWidth = width + "px";
    div[0].style.maxWidth = width + "px";
    div[0].style.height = height + "px";

    if (styleClass) {
        div[0].className = styleClass;
    }

    div.append(content);

    var crosstabConstants = sap.basetable.crosstab.utils.RenderUtils._crosstabConstants;
    if (!disableResize || !disableResize.column) {
        var divColumnResize = document.createElement("div");
        divColumnResize.className = crosstabConstants.RESIZABLE_COL + " " + crosstabConstants.RESIZABLE;
        div.append(divColumnResize);
    }
    if (!disableResize || !disableResize.row) {
        var divRowResize = document.createElement("div");
        divRowResize.className = crosstabConstants.RESIZABLE_ROW + " " + crosstabConstants.RESIZABLE;
        div.append(divRowResize);
    }
    if (sortable) {
        var divSorting = document.createElement("span");
        divSorting.className = crosstabConstants.SORTING_FEEDBACK;
        div.append(divSorting);
    }
    return div;
};

sap.basetable.crosstab.utils.RenderUtils.createHeaderCell = function(id, baseWidth, baseHeight, borderWidth, content, isMemberCell, isTop, children, rowSpan, colSpan, styleClass, addAPixelToWidth, text, resizedSize, disableResize, sortable) {
    var cell = this.createMatrixLayoutCell(id + "-div");
    var div = this.createContentCell(id, baseWidth, baseHeight, borderWidth, content, isMemberCell, isTop, rowSpan, colSpan, styleClass, addAPixelToWidth, resizedSize, disableResize, sortable);
    if(text){
        div.attr("title", text);
    }

    cell.append(div);
    if (children){
        cell.append(children);
    }
    return cell;
};

sap.basetable.crosstab.utils.RenderUtils.styleClasstoString = function (styleClass) {
    var styleString = "";
    for (var styleKey in styleClass) {
        if (styleClass.hasOwnProperty(styleKey)) {
            styleString = styleString + styleKey + ": " + styleClass[styleKey] + ";" ;
        }
    }
    return styleString.substr(0,styleString.length-1);
};
