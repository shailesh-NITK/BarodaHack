(function() {
    var toString = Object.prototype.toString;
    var squareLegendMarkerShape = {
        legend : {
            marker: {
                shape : "square"
            }
        }
    };


    var barWithFixedDataPointSize = {
        plotArea:{
            isFixedDataPointSize: true,
            dataPointSize: {min: 8, max: 100},
            gap:{
                groupSpacing: 1.5,
                innerGroupSpacing: 0,
                barSpacing:0.5
            }
        }
    };

    var lineWithFixedDataPointSize = {
        plotArea:{
            isFixedDataPointSize: true
        }
    };

    var areaWithFixedDataPointSize = {
        plotArea:{
            isFixedDataPointSize: true
        }
    };

    var legendGroupByShape = {
        legend : {
            groupByShape : true
        }
    };

    var gridLineStyle = {
        plotArea:{
            gridline:{
                visible: false,
                size: 1,
                color: "#ececec"
            }
        }
    };

    var referenceLineStyle = {
        plotArea:{
            referenceLine:{
                defaultStyle:{
                    label: {
                        fontSize: "11px",
                        fontWeight: "normal"
                    }
                }
            }
        }
    };

    var palettes = {
        single: {
            plotArea: {
                colorPalette: ["#73d2e0", "#bbd03b", "#999d20", "#f2910f", "#fccd8c", "#a5d5cb", "#00adc6", "#919795", "#ed6b06"]
            }
        },
        dual: {
            plotArea: {
                primaryValuesColorPalette: ["#00abaa", "#8ccdcd", "#d4ebeb"],
               secondaryValuesColorPalette: ["#ee6a05", "#f6aa6e", "#fcddc3"]
            }
        }
    };

    var layoutRatio = {
        legendGroup: {
            layout: {
                maxHeight: 0.2,
                maxWidth: 0.2
            }
        },
        title: {
            layout: {
                maxHeight: 0.2,
                maxWidth: 0.2
            }
        },
        categoryAxis: {
            layout: {
                maxHeight: 0.2,
                maxWidth: 0.2
            }
        },
        valueAxis: {
            layout: {
                maxHeight: 0.15,
                maxWidth: 0.15
            }
        }
    };

    var vizSpec = {
        layout: {
            categoryAxis: {
                maxSizeRatio: 0.20
            },
            valueAxis: {
                maxSizeRatio: 0.15
            },
            dualValue: {
                maxSizeRatio: 0.10
            }
        }
    };

    var padding = {
        general:{
            layout:{
                padding:0.05
            }
        }
    };
    
    function isArray(it){
        return toString.call(it) === '[object Array]';
    }
    function isObject(it){
        return toString.call(it) === '[object Object]';
    }
    function _merge(a, b){
        for(var key in b){
            if(isArray(b[key])){
                a[key] = b[key].slice();
            }else if(isObject(b[key])){
                a[key] = a[key] || {};
                _merge(a[key], b[key]);
            }else{
                a[key] = b[key];
            }
        }
        return a;
    }
    function merge(){
        var res = {};
        for(var i = 0; i < arguments.length; ++i){
            _merge(res, arguments[i]);
        }
        return res;
    }

    var categoryAxisColor = "#babab9";
    var valueAxisColor = "#878786";
    var axisGridlineColor = "#ececec";

    var rangeSlider = {
        rangeSlider: {
            sliderStyle: {
                borderColor: "#d8d8d8",
                highlightBorderColor: "#707070"
            },
            tooltipStyle: {
                fontColor: "#000000",
                borderColor: "#bebebe",
                highlightBorderColor: "#748cb2",
                backgroundColor: "#f4f3f4"
            },
            thumbStyle: {
                indicatorStartColor: "#fbfbfb",
                indicatorEndColor: "#cccccc",
                indicatorPressStartColor: "#e8e8e8",
                indicatorPressEndColor: "#a4a4a4",
                indicatorBorderStartColor: "#878787",
                indicatorBorderEndColor: "#474747",
                indicatorPressBorderStartColor: "#878787",
                indicatorPressBorderEndColor: "#474747",
                indicatorInternalLineColor: "#000000",
                subRectBorderColor: "#707070",
                subRectColor: "#bbbbbb",
                rectOpacity: 0.2,
                rectColor: '#009de0',
                rectPressOpacity: 0.48,
                rectPressColor: "#636363"
            }
        }
    };

    var title = {
        title: {
            alignment: "left",
            visible: true
        }
    };

    var background = {
        background: {
            border: {
                top: {
                    visible: false
                },
                bottom: {
                    visible: false
                },
                left: {
                    visible: false
                },
                right: {
                    visible: false
                }
            },
            drawingEffect: "normal"
        }
    };

    var legend = {
        legend: {
            drawingEffect: "normal",
            marker: {
                size: 14
            },
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373",
                }
            },
            itemMargin: 0.25,
            title: {
                visible: false,
                style: {
                    fontSize: "12px",
                    color: "#000000",
                    fontWeight: "normal"
                }
            }
        },
        sizeLegend: {
            title: {
                visible: true,
                style: {
                    fontSize: "12px",
                    color: "#000000",
                    fontWeight: "normal"
                }
            },
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373",
                }
            },
        }
    };

    var plotArea = {
        plotArea: {
            grid: {
                background: {
                    drawingEffect: "normal"
                }
            },
            gridline: {
                visible: false
            }
        }
    };

    var zAxis = {
        zAxis: {
            title: {
                visible: true
            },
            color: categoryAxisColor
        }
    };

    var showAxisLine = {
        axisline: {
            visible: true
        }
    };

    var hideAxisLine = {
        axisline: {
            visible: false
        }
    };

    var gridline_base = {
        gridline: {
            type: "line",
            size: 1,
            color: axisGridlineColor
        }
    };

    var gridline_h = merge(gridline_base, {
        gridline: {
            showFirstLine: false,
            showLastLine: true
        }
    });

    var gridline_v = merge(gridline_base, {
        gridline: {
            showFirstLine: true,
            showLastLine: false
        }
    });

    var categoryAxis = merge({
        lineSize: 1,
        title: {
            visible: true
        },
        color: categoryAxisColor
    }, vizSpec.layout.categoryAxis);

    var valueAxis = merge({
        lineSize: 1,
        title: {
            visible: true
        },
        color: valueAxisColor
    }, hideAxisLine, vizSpec.layout.valueAxis);

    var dual = {
        title: {
            applyAxislineColor: true
        }
    };

    var horizontalEffect = merge({
        xAxis: merge(valueAxis, gridline_h),
        yAxis: categoryAxis,
        xAxis2: valueAxis
    }, palettes.single);

    var horizontalDualEffect = merge(horizontalEffect, {
        xAxis: merge(dual, vizSpec.layout.dualValue),
        xAxis2: merge(dual, vizSpec.layout.dualValue)
    }, palettes.dual);


    var verticalEffect = merge({
        yAxis: merge(valueAxis, gridline_v),
        xAxis: categoryAxis,
        yAxis2: valueAxis
    }, palettes.single);

    var verticalDualEffect = merge(verticalEffect, {
        yAxis: merge(dual, vizSpec.layout.dualValue),
        yAxis2: merge(dual, vizSpec.layout.dualValue)
    }, palettes.dual);

    var trellis_axes = {
        columnAxis: {
            title: {
                style: {
                    fontSize: 12,
                    color: "#000000"
                }
            }
        },
        rowAxis: {
            title: {
                style: {
                    fontSize: 12,
                    color: "#000000"
                }
            }
        }
    };

    var interaction = {
            interaction : {
                hover : {
                    color : 'darken(20%)',
                    stroke : {
                        visible : false
                    }
                },
                selected : {
                    stroke : {
                        visible : false
                    }
                },
                deselected : {
                    color: 'greyscale()',
                    stroke : {
                        visible : false
                    }
                }
            }
    };

    var zoom = {
        interaction: {
            zoom: {
                direction: "categoryAxis"
            }
        }
    };
    
    var base = merge(title, background, legend, plotArea, trellis_axes, zoom);

    function dualify(props, horizontal) {
        var prefix = horizontal ? "x" : "y",
            val1 = props[prefix + "Axis"],
            val2 = props[prefix + "Axis2"];
        if (val1) {
            delete val1.color;
        }
        if (val2) {
            delete val2.color;
        }
        return props;
    }

    //---------------------------------------------------------
    var barEffect = merge(base, horizontalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var bar3dEffect = merge(base, horizontalEffect, zAxis, interaction);

    var dualbarEffect = dualify(merge(base, horizontalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), true);

    var verticalbarEffect = merge(base, verticalEffect, rangeSlider, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var vertical3dbarEffect = merge(base, verticalEffect, zAxis, interaction);

    var dualverticalbarEffect = dualify(merge(base, verticalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), false);

    var stackedbarEffect = merge(base, horizontalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var dualstackedbarEffect = dualify(merge(base, horizontalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), true);

    var stackedverticalbarEffect = merge(base, verticalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction);

    var dualstackedverticalbarEffect = dualify(merge(base, verticalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), false);

    var lineEffect = merge(base, verticalEffect, rangeSlider, lineWithFixedDataPointSize, interaction);

    var duallineEffect = dualify(merge(base, verticalDualEffect, lineWithFixedDataPointSize, interaction), false);

    var horizontallineEffect = merge(base, horizontalEffect, lineWithFixedDataPointSize, interaction);

    var dualhorizontallineEffect = dualify(merge(base, horizontalDualEffect, lineWithFixedDataPointSize, interaction), true);

    var areaEffect = merge(base, verticalEffect, rangeSlider, areaWithFixedDataPointSize, interaction);

    var horizontalareaEffect = merge(base, horizontalEffect, rangeSlider, areaWithFixedDataPointSize, interaction);

    var combinationEffect = merge(base, verticalEffect, rangeSlider, squareLegendMarkerShape, barWithFixedDataPointSize, legendGroupByShape, interaction);

    var dualcombinationEffect = dualify(merge(base, verticalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, legendGroupByShape, interaction), false);

    var horizontalcombinationEffect = merge(base, horizontalEffect, squareLegendMarkerShape, barWithFixedDataPointSize, legendGroupByShape, interaction);

    var dualhorizontalcombinationEffect = dualify(merge(base, horizontalDualEffect, squareLegendMarkerShape, barWithFixedDataPointSize, interaction), true);

    var infoRadarEffect = merge(base, rangeSlider, interaction, {
        interaction: {
            deselected : {
                area: {
                    color: 'greyscale()'
                }
            }
        },
        plotArea: {
            gridline: {
                color: axisGridlineColor
            },
            polarAxis: {
                title: {
                    style: {
                        fontWeight: "normal",
                        fontSize: "12px",
                        color: "#000000"
                    },
                    visible: true
                },
                axisLine : {
                    size: 1
                },
                hoverShadow: {
                    color: "#f5f5f5"
                },
                mouseDownShadow: {
                    color: "#dadada"
                },
                color: categoryAxisColor,
                label: {
                    style: {
                        fontSize: "11px",
                        color: "#737373"
                    }
                }
            },
            valueAxis: {
                title: {
                    style: {
                        fontWeight: "normal",
                        fontSize: "12px",
                        color: "#000000"
                    }
                },
                color: valueAxisColor,
                label: {
                    style: {
                        fontSize: "10px",
                        color: "#737373"
                    }
                }
            }
        }
    }, palettes.single);

    var bubbleEffect = merge(base, plotArea, {
        yAxis: merge(valueAxis, gridline_h),
        xAxis: valueAxis
    }, palettes.single, interaction);

    var scattermatrixEffect = merge(base, bubbleEffect, {
        plotArea: {
            animation: {
                dataLoading: false,
                dataUpdating: false,
                resizing: false
            }
        }
    });

    var pieEffect = merge(base, squareLegendMarkerShape, palettes.single, interaction, {
        plotArea: {
            dataLabel: {
                distance: -0.5,
                line: {
                    visible: false
                }
            }
        }
    });

    var mbcColor = {
        plotArea: {
           startColor: "#bfebf1",
           endColor: "#0e6977"
        }
    };
    var mapEffect = merge(base, {
        legend: {
            title: {
                visible: true
            }
        },
        xAxis: categoryAxis, // these are for heat map, tree map doesn't have axes
        yAxis: categoryAxis
    }, mbcColor, interaction);

    var infoMapEffect = merge(base, {
        legend: {
            title: {
                visible: true
            }
        },
        categoryAxis: categoryAxis,
        categoryAxis2: categoryAxis
    }, mbcColor, interaction);

    var radarEffect = merge(base, {
        background: {
            visible: false
        },
        plotArea: {
            valueAxis: {
                title: {
                    visible: true
                },
                gridline: {
                    color: axisGridlineColor
                }
            },
            dataline: {
                fill: {
                    transparency: 0
                }
            }
        }
    }, palettes.single);

    var mekkoEffect = merge(base, {
        yAxis: merge(valueAxis, hideAxisLine, gridline_base),
        xAxis: merge(categoryAxis, showAxisLine),
        xAxis2: merge(categoryAxis, showAxisLine)
    }, palettes.single);

    var horizontalmekkoEffect = merge(base, {
        xAxis: merge(valueAxis, hideAxisLine, gridline_base),
        yAxis: merge(categoryAxis, showAxisLine),
        yAxis2: merge(categoryAxis, showAxisLine)
    }, palettes.single);

    var bulletEffect = merge(base, palettes.single, {
        valueAxis:{
            title:{
                visible:true
            }
        },
        categoryAxis:{
            title:{
                visible:true
            },
            axisTick:{
                visible: false
            },
            hoverShadow:{
                color:"#f5f5f5"
            },
            mouseDownShadow:{
                color:"#dadada"
            }
        },
        plotArea:{
            gridline:{
                visible : false
            }
        }
    });

    var trellisBulletEffect = merge(bulletEffect, {
        plotArea:{
            gridline:{
                visible:false
            }
        }
    });

    var tagcloudEffect = merge(title, legend, {
        legend : {
            title : {
                visible : true
            }
        }
    }, mbcColor);

    var numericEffect = merge(title, background, {
        plotArea: {
            valuePoint: {
                label: {
                    fontColor: '#000000'
                }
            }
        }
    });
    
    var linkLineEffect = {
        plotArea: {
            linkline: {
                color: "#6d6c6c"
            }
        }
    };
    
    var datapointColorEffect = {
        plotArea : {
            dataPoint : {
                color : {
                    positive : "#77d36f",
                    negative : "#f24269",
                    total : "#bbbdbf"
    
                }
            }
        }
    };
    
    var waterfallEffect = merge(verticalbarEffect, linkLineEffect, datapointColorEffect);
    
    var stackedwaterfallEffect = merge(stackedverticalbarEffect, linkLineEffect, datapointColorEffect);
    
    var horizontalwaterfallEffect = merge(barEffect, linkLineEffect, datapointColorEffect);
    
    var horizontalstackedwaterfallEffect = merge(stackedbarEffect, linkLineEffect, datapointColorEffect);
 
    sap.viz.extapi.env.Template.register({
        id: "standard_lumira",
        name: "Standard Lumira",
        version: "4.0.0",
        properties: {
            'viz/bar': barEffect,
            'viz/3d_bar': bar3dEffect,
            'viz/image_bar': barEffect,
            'viz/multi_bar': barEffect,
            'viz/dual_bar': dualbarEffect,
            'viz/multi_dual_bar': dualbarEffect,
            'viz/column': verticalbarEffect,
            'viz/3d_column': vertical3dbarEffect,
            'viz/multi_column': verticalbarEffect,
            'viz/dual_column': dualverticalbarEffect,
            'viz/multi_dual_column': dualverticalbarEffect,
            'viz/stacked_bar': stackedbarEffect,
            'viz/multi_stacked_bar': stackedbarEffect,
            'viz/dual_stacked_bar': dualstackedbarEffect,
            'viz/multi_dual_stacked_bar': dualstackedbarEffect,
            'viz/100_stacked_bar': stackedbarEffect,
            'viz/multi_100_stacked_bar': stackedbarEffect,
            'viz/100_dual_stacked_bar': dualstackedbarEffect,
            'viz/multi_100_dual_stacked_bar': dualstackedbarEffect,
            'viz/stacked_column': stackedverticalbarEffect,
            'viz/multi_stacked_column': stackedverticalbarEffect,
            'viz/dual_stacked_column': dualstackedverticalbarEffect,
            'viz/multi_dual_stacked_column': dualstackedverticalbarEffect,
            'viz/100_stacked_column': stackedverticalbarEffect,
            'viz/multi_100_stacked_column': stackedverticalbarEffect,
            'viz/100_dual_stacked_column': dualstackedverticalbarEffect,
            'viz/multi_100_dual_stacked_column': dualstackedverticalbarEffect,
            'riv/cbar': merge(legend, plotArea, {
                background: {
                    drawingEffect: "normal"
                },
                yAxis: categoryAxis
            }),
            'viz/combination': combinationEffect,
            'viz/horizontal_combination': horizontalcombinationEffect,
            'viz/dual_combination': dualcombinationEffect,
            'viz/dual_horizontal_combination': dualhorizontalcombinationEffect,
            'viz/boxplot': merge(base, {
                yAxis: merge(valueAxis, hideAxisLine, gridline_v),
                xAxis: categoryAxis
            }, palettes.single),
            'viz/horizontal_boxplot': merge(base, {
                xAxis: merge(valueAxis, hideAxisLine, gridline_h),
                yAxis: categoryAxis
            }, palettes.single),
            'viz/waterfall': merge(base, {
                yAxis: merge(valueAxis, hideAxisLine, gridline_v),
                xAxis: {
                    title: {
                        visible: true
                    },
                    color: categoryAxisColor
                }
            }, palettes.single),
            'viz/horizontal_waterfall': merge(base, {
                xAxis: merge(valueAxis, hideAxisLine, gridline_h),
                yAxis: {
                    title: {
                        visible: true
                    },
                    color: categoryAxisColor
                }
            }, palettes.single),

            'viz/stacked_waterfall': stackedverticalbarEffect,
            'viz/horizontal_stacked_waterfall': stackedbarEffect,

            'viz/line': lineEffect,
            'viz/multi_line': lineEffect,
            'viz/dual_line': duallineEffect,
            'viz/multi_dual_line': duallineEffect,
            'viz/horizontal_line': horizontallineEffect,
            'viz/multi_horizontal_line': horizontallineEffect,
            'viz/dual_horizontal_line': dualhorizontallineEffect,
            'viz/multi_dual_horizontal_line': dualhorizontallineEffect,

            'viz/area': lineEffect,
            'viz/multi_area': lineEffect,
            'viz/100_area': lineEffect,
            'viz/multi_100_area': lineEffect,
            'viz/horizontal_area': horizontallineEffect,
            'viz/multi_horizontal_area': horizontallineEffect,
            'viz/100_horizontal_area': horizontallineEffect,
            'viz/multi_100_horizontal_area': horizontallineEffect,
            'viz/pie': pieEffect,
            'viz/multi_pie': pieEffect,
            'viz/donut': pieEffect,
            'viz/multi_donut': pieEffect,
            'viz/pie_with_depth': pieEffect,
            'viz/donut_with_depth': pieEffect,
            'viz/multi_pie_with_depth': pieEffect,
            'viz/multi_donut_with_depth': pieEffect,
            'viz/bubble': bubbleEffect,
            'viz/multi_bubble': bubbleEffect,
            'viz/scatter': bubbleEffect,
            'viz/multi_scatter': bubbleEffect,
            'viz/scatter_matrix': scattermatrixEffect,
            'viz/radar': radarEffect,
            'viz/multi_radar': radarEffect,
            'viz/tagcloud': tagcloudEffect,
            'viz/heatmap': mapEffect,
            'viz/treemap': mapEffect,
            'viz/mekko': mekkoEffect,
            'viz/100_mekko': mekkoEffect,
            'viz/horizontal_mekko': horizontalmekkoEffect,
            'viz/100_horizontal_mekko': horizontalmekkoEffect,
            'viz/bullet': bulletEffect,
            'viz/number': {
                plotArea: {
                    valuePoint: {
                        label: {
                            fontColor: '#000000'
                        }
                    }
                }
            },

            'info/column': info(verticalbarEffect),
            'info/timeseries_column': infoTime(verticalbarEffect),
            'info/timeseries_stacked_column': infoTime(verticalbarEffect),
            'info/timeseries_100_stacked_column': infoTime(verticalbarEffect),
            'info/bar': info(barEffect),
            'info/line': info(lineEffect),
            'info/timeseries_line': infoTime(lineEffect),
            "info/timeseries_combination": infoTime(combinationEffect),
            "info/dual_timeseries_combination": infoTime( infoDual(combinationEffect), "dual"),
            'info/pie': info(pieEffect),
            'info/donut': info(pieEffect),
            'info/scatter': infoBubble(bubbleEffect),
            'info/bubble': infoBubble(bubbleEffect),
            'info/stacked_column': info(stackedverticalbarEffect),
            'info/stacked_bar': info(stackedbarEffect),
            'info/mekko': infoMekko(stackedverticalbarEffect),
            'info/100_mekko': infoMekko(stackedverticalbarEffect),
            'info/horizontal_mekko': infoMekko(stackedbarEffect),
            'info/100_horizontal_mekko': infoMekko(stackedbarEffect),
            'info/combination': info(combinationEffect),
            'info/stacked_combination': info(combinationEffect),
            'info/combinationEx': infoDual(dualcombinationEffect, true),
            'info/dual_stacked_combination': infoDual(dualcombinationEffect),
            'info/dual_column': infoDual(dualverticalbarEffect),
            'info/dual_line': infoDual(duallineEffect),
            'info/dual_bar': infoDual(dualbarEffect),
            'info/100_stacked_column': info(stackedverticalbarEffect),
            'info/100_stacked_bar': info(stackedbarEffect),
            'info/horizontal_line': info(horizontallineEffect),
            'info/dual_horizontal_line': infoDual(dualhorizontallineEffect),
            'info/horizontal_combination': info(horizontalcombinationEffect),
            'info/horizontal_stacked_combination': info(horizontalcombinationEffect),
            'info/dual_horizontal_stacked_combination': infoDual(dualhorizontalcombinationEffect),
            'info/dual_combination': infoDual(dualcombinationEffect),
            'info/dual_horizontal_combination': infoDual(dualhorizontalcombinationEffect),
            'info/treemap' : infoTreemap(mapEffect),
            'info/area' : info(areaEffect),
            'info/horizontal_area' : info(horizontalareaEffect),
            'info/100_area' : info(areaEffect),
            'info/100_horizontal_area' : info(horizontalareaEffect),
            'info/tagcloud' : infoTagcloud(tagcloudEffect),
            'info/heatmap' : infoHeatmap(infoMapEffect),
            'info/number': infoNumber(numericEffect),
            'info/waterfall':info(waterfallEffect),
            'info/stacked_waterfall' : info(stackedwaterfallEffect),
            'info/horizontal_waterfall': info(horizontalwaterfallEffect),
            'info/horizontal_stacked_waterfall': info(horizontalstackedwaterfallEffect),
            'info/radar': infoRadar(infoRadarEffect),

            'info/trellis_area' : trellis(info(areaEffect)),
            'info/trellis_horizontal_area' : trellis(info(horizontalareaEffect)),
            'info/trellis_100_horizontal_area' : trellis(info(horizontalareaEffect)),
            'info/trellis_100_area' : trellis(info(areaEffect)),
            'info/trellis_column': trellis(info(verticalbarEffect)),
            'info/trellis_bar': trellis(info(barEffect)),
            'info/trellis_line': trellis(info(lineEffect)),
            'info/trellis_pie': trellis(info(pieEffect)),
            'info/trellis_donut': trellis(info(pieEffect)),
            'info/trellis_scatter': trellis(infoBubble(bubbleEffect)),
            'info/trellis_bubble': trellis(infoBubble(bubbleEffect)),
            'info/trellis_stacked_column': trellis(info(stackedverticalbarEffect)),
            'info/trellis_stacked_bar': trellis(info(stackedbarEffect)),
            'info/trellis_combination': trellis(info(combinationEffect)),
            'info/trellis_dual_column': trellis(infoDual(dualverticalbarEffect)),
            'info/trellis_dual_line': trellis(infoDual(duallineEffect)),
            'info/trellis_dual_bar': trellis(infoDual(dualbarEffect)),
            'info/trellis_100_stacked_column': trellis(info(stackedverticalbarEffect)),
            'info/trellis_100_stacked_bar': trellis(info(stackedbarEffect)),
            'info/trellis_horizontal_line': trellis(info(horizontallineEffect)),
            'info/trellis_dual_horizontal_line': trellis(infoDual(dualhorizontallineEffect)),
            'info/trellis_dual_stacked_bar': trellis(infoDual(dualbarEffect)),
            'info/trellis_dual_stacked_column': trellis(infoDual(dualverticalbarEffect)),
            'info/trellis_horizontal_combination': trellis(info(horizontalcombinationEffect)),
            'info/trellis_treemap': trellis(info(mapEffect)),

            'info/trellis_radar': trellis(infoRadar(infoRadarEffect)),
            'info/dual_stacked_bar': infoDual(dualstackedbarEffect),
            'info/100_dual_stacked_bar': infoDual(dualstackedbarEffect),
            'info/dual_stacked_column': infoDual(dualstackedverticalbarEffect),
            'info/100_dual_stacked_column': infoDual(dualstackedverticalbarEffect),
            'info/time_bubble': infoBubble(bubbleEffect),
            'info/timeseries_scatter': infoTimeBubble(bubbleEffect),
            'info/timeseries_bubble': infoTimeBubble(bubbleEffect),
            'info/bullet': info(infoBullet(bulletEffect)),
            'info/timeseries_bullet': infoTime(info(infoBullet(bulletEffect))),
            'info/vertical_bullet': info(infoBullet(bulletEffect)),
        },

        // css property not apply for info chart flag
        isBuiltIn : true,

        //v-longtick must be set after v-categoryaxisline
        css: ".v-datapoint .v-boxplotmidline{stroke:#333333;}\
          .v-longtick{stroke:#b3b3b3;}\
          .v-m-title .v-title{fill:#000000;font-size:21px;font-weight:normal;}\
          .v-m-legend .v-label{fill:#737373;font-size:10px;font-weight:normal;}\
          .v-m-sizeLegend .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
          .v-m-sizeLegend .v-label{fill:#737373;font-size:10px;font-weight:normal;}\
          .v-m-legend .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
          .v-hovershadow{fill:#f5f5f5;}\
          .v-hovershadow-mousedown{fill:#dadada;}\
          .v-m-main .v-m-plot .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
          .v-m-main .v-m-plot .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
          .v-m-yAxis .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
          .v-m-yAxis .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
          .v-m-xAxis .v-title{font-size:12px;font-weight:normal;}\
          .v-m-xAxis .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
          .v-m-yAxis2 .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
          .v-m-yAxis2 .v-label{fill:#737373;font-size:11px;font-weight:normal;}\
          .v-m-xAxis2 .v-title{fill:#000000;font-size:12px;font-weight:normal;}\
          .v-m-xAxis .v-label{fill:#737373;font-size:11px;font-weight:normal;}",
        scales : function() {
            var obj = {};
            var singleChartTypes = ['info/column', 'info/bar', 'info/line', 'info/pie', 'info/donut',
                'info/scatter', 'info/bubble', 'info/stacked_column', 'info/stacked_bar',
                'info/combination', 'info/stacked_combination', 'info/100_stacked_column',
                'info/mekko', 'info/100_mekko', 'info/horizontal_mekko', 'info/100_horizontal_mekko',
                'info/100_stacked_bar', 'info/horizontal_line',  'info/horizontal_combination',
                'info/horizontal_stacked_combination', 'info/trellis_column', 'info/trellis_bar',
                'info/trellis_line', 'info/trellis_pie', 'info/trellis_donut', 'info/trellis_scatter',
                'info/trellis_bubble', 'info/trellis_stacked_column', 'info/trellis_stacked_bar',
                'info/trellis_combination', 'info/trellis_100_stacked_column', 'info/trellis_100_stacked_bar',
                'info/trellis_horizontal_line', 'info/trellis_horizontal_combination', 'info/time_bubble'];
            singleChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "color",
                    "palette": palettes.single.plotArea.colorPalette
                }];
            });
            var dualChartTypes = ['info/dual_stacked_combination', 'info/dual_column', 'info/dual_line',
                'info/dual_bar', 'info/dual_horizontal_line', 'info/dual_horizontal_stacked_combination',
                'info/trellis_dual_column', 'info/trellis_dual_line', 'info/trellis_dual_bar',
                'info/trellis_dual_stacked_bar', 'info/trellis_dual_stacked_column',
                'info/trellis_dual_horizontal_line', 'info/dual_stacked_bar',
                'info/100_dual_stacked_bar', 'info/dual_stacked_column', 'info/100_dual_stacked_column'];
            dualChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "color",
                    "palette": [palettes.dual.plotArea.primaryValuesColorPalette, palettes.dual.plotArea.secondaryValuesColorPalette]
                }];
            });

            var mbcChartTypes = ['info/treemap', 'info/trellis_treemap', 'info/heatmap', 'info/tagcloud'];
            mbcChartTypes.forEach(function(e) {
                obj[e] = [{
                    "feed": "color",
                    "startColor": mbcColor.plotArea.startColor,
                    "endColor": mbcColor.plotArea.endColor
                }];
            });

            obj['info/combinationEx'] = [{
                "feed": "color",
                "palette": [[palettes.single.plotArea.colorPalette, palettes.dual.plotArea.primaryValuesColorPalette], palettes.dual.plotArea.secondaryValuesColorPalette]
            }];

            return obj;
        }()
    });


    function info(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.valueAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine: {
                visible: false
            },
            gridline: {
                type: "line",
                color: axisGridlineColor,
                showLastLine: true
            },
            color: valueAxisColor,
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            }
        };

        ret.categoryAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine : {
                size: 1
            },
            gridline: {
                color: axisGridlineColor
            },
            axisTick:{
                visible: false
            },
            hoverShadow: {
                color: "#f5f5f5"
            },
            mouseDownShadow: {
                color: "#dadada"
            },
            color: categoryAxisColor,
            label: {
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            }
        };

        ret = merge(ret, layoutRatio,padding,palettes.single, gridLineStyle, referenceLineStyle);

        general(ret);
        return ret;
    }

    function infoTime(obj, isDual){
        var ret = info(obj);
        ret.timeAxis = ret.categoryAxis;
        delete ret.categoryAxis;

        ret = merge(ret, {
            timeAxis : {
                interval : {
                    unit : 'minlevel'
                }
            }
        });

        if(isDual){
            ret.plotArea.background = background["background"];
        }

        return ret;
    }

    function infoDual(obj, isComboEx) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }
        var applyAxislineColor = isComboEx ? [false, true] : true;
        ret.valueAxis = {
            title: {
                visible: true,
                applyAxislineColor: applyAxislineColor,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine: {
                visible: false
            },
            gridline: {
                type: "line",
                color: axisGridlineColor,
                showFirstLine: true
            },
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            }
        };
        ret.categoryAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine : {
                size: 1
            },
            gridline: {
                color: axisGridlineColor
            },
            axisTick:{
                visible: false
            },
            hoverShadow: {
                color: "#f5f5f5"
            },
            mouseDownShadow: {
                color: "#dadada"
            },
            color: categoryAxisColor,
            label: {
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            }
        };
        ret.valueAxis2 = {
            title: {
                visible: true,
                applyAxislineColor: applyAxislineColor,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine: {
                visible: false
            },
            gridline: {
                color: axisGridlineColor
            },
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            }
        };

        var maxWidth = isComboEx ? 0.2 : 0.1;
        ret = merge(ret, layoutRatio,padding, palettes.dual, gridLineStyle, referenceLineStyle);
        ret = merge(ret, {
            valueAxis: {
                layout: {
                    maxHeight: 0.1,
                    maxWidth: maxWidth
                }
            },
            valueAxis2: {
                layout: {
                    maxHeight: 0.1,
                    maxWidth: maxWidth
                }
            }
        });

        general(ret);
        return ret;
    }

    function infoTimeBubble(obj) {
        var ret = infoBubble(obj);
        ret.valueAxis = ret.valueAxis2;
        delete ret.valueAxis2;
        ret.timeAxis = {
                title: {
                    visible: true,
                    style: {
                        fontWeight: "normal",
                        fontSize: "12px",
                        color: "#000000"
                    }
                },
                axisLine : {
                    size: 1
                },
                gridline: {
                    color: axisGridlineColor
                },
                axisTick:{
                    visible: false
                },
                hoverShadow: {
                    color: "#f5f5f5"
                },
                mouseDownShadow: {
                    color: "#dadada"
                },
                color: categoryAxisColor,
                label: {
                    style: {
                        fontSize: "11px",
                        color: "#737373"
                    }
                }
            };
        return ret;
    }

    function infoBubble(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.valueAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine: {
                visible: true
            },
            gridline: {
                type: "line",
                color: axisGridlineColor,
                showLastLine: true
            },
            color: valueAxisColor,
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            }
        };

        ret.valueAxis2 = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine: {
                visible: false
            },
            gridline: {
                color: axisGridlineColor
            },
            color: valueAxisColor,
            label: {
                style: {
                    fontSize: "10px",
                    color: "#737373"
                }
            }
        };

        ret.sizeLegend = merge(ret.sizeLegend || {}, {
            title: {
                visible : true,
                style: {
                    fontSize: "12px",
                    color: "#000000"
                }
            }
        });
        ret = merge(ret, padding, palettes.single, gridLineStyle, referenceLineStyle);

        general(ret);
        return ret;
    }

    function infoMekko(obj) {
        return merge(infoDual(obj), {
            valueAxis: {
                color: '#000000'
            },
            valueAxis2: {
                color: "#000000"
            }
        });
    }

    function trellis(obj){
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.grid = {
            background: {
                alternateColors: ["#f4f4f4", "#ffffff"],
                alternatePattern: "byColumn"
            }
        };
        obj.plotArea.gridline.visible = false;
        return obj;
    }

    function general(obj) {
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background;
        delete obj.background;

        delete obj.xAxis;
        delete obj.xAxis2;
        delete obj.yAxis;
        delete obj.yAxis2;
        obj.legend.hoverShadow = {
            color: "#f5f5f5"
        };

        if(obj.categoryAxis) {
            if(!obj.categoryAxis.label) {
                obj.categoryAxis.label = {};
            }
            obj.categoryAxis.label.angle = 45;
        }

        obj.legend.mouseDownShadow = {
            color: "#dadada"
        };

        obj.title = merge(obj.title, {
            alignment  : "left",
            style : {
                fontWeight:"normal",
                fontSize: "21px",
                color: "#000000"
            }
        });
    }

    function infoTreemap(obj) {
        obj = merge(background, obj);
        var ret = info(obj);
        ret.plotArea.colorPalette = ["#353838", "#0e606d" , "#188ba1" , "#18b3cf" , "#5dc4e7" , "#a5d9ec" , "#e6f4fa"];
        ret.plotArea.labelPosition = 'topleft';
        return ret;
    }

    function infoTagcloud(obj) {
        obj = merge(background, obj);
        var ret = info(obj);
        ret.plotArea.colorPalette = ["#353838", "#0e606d" , "#188ba1" , "#18b3cf" , "#5dc4e7" , "#a5d9ec" , "#e6f4fa"];
        return ret;
    }

    function infoNumber(obj){
        obj.plotArea = obj.plotArea || {};
        obj.plotArea.background = obj.background;
        delete obj.background;

        obj.title = merge(obj.title, {
            alignment  : "left",
            style : {
                fontWeight:"normal",
                fontSize: "21px",
                color: "#000000"
            }
        });
        return obj;
    }

    function infoBullet(obj){
        obj.plotArea.actualColor = ["#73d2e0", "#bbd03b", "#999d20", 
                                    "#f2910f", "#fccd8c", "#a5d5cb", 
                                    "#00adc6", "#ed6b06"]
        obj.plotArea.additionalColor = ["#99F8FF", "#E1F661", "#BFC346", 
                                        "#FFB735", "#FFF3B2", "#CBFBF1", 
                                        "#26D3EC", "#FF912C"];
        obj.plotArea.forecastColor = ["#e2e2e2"];
        return obj;
    }

    function infoHeatmap(obj) {
        var ret = {};
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = obj[i];
            }
        }

        ret.categoryAxis = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine : {
                size: 1
            },
            gridline: {
                color: axisGridlineColor
            },
            axisTick:{
                visible: false
            },
            hoverShadow: {
                color: "#f5f5f5"
            },
            mouseDownShadow: {
                color: "#dadada"
            },
            color: categoryAxisColor,
            label: {
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            }
        };

        ret.categoryAxis2 = {
            title: {
                visible: true,
                style: {
                    fontWeight: "normal",
                    fontSize: "12px",
                    color: "#000000"
                }
            },
            axisLine : {
                size: 1
            },
            gridline: {
                color: axisGridlineColor
            },
            axisTick:{
                visible: false
            },
            hoverShadow: {
                color: "#f5f5f5"
            },
            mouseDownShadow: {
                color: "#dadada"
            },
            color: categoryAxisColor,
            label: {
                style: {
                    fontSize: "11px",
                    color: "#737373"
                }
            }
        };


        ret.plotArea.colorPalette = ["#353838", "#0e606d" , "#188ba1" , "#18b3cf" , "#5dc4e7" , "#a5d9ec" , "#e6f4fa"];
        general(ret);
        return ret;
    }

    function infoRadar(obj) {
        var ret = jQuery.extend(true, {}, obj);
        general(ret);
        return ret;
    }
})();
