Ext.define('Admin.view.dashboard2.Numeric', {
    extend: 'Ext.chart.axis.Numeric',
    getMaximum: function() {
        var me = this;
        var value = this.callParent(arguments);
        if (Ext.isNumber(value)) {
            return value;
        }

        var max = -Infinity,
            boundSeries = me.boundSeries,
            layout = me.getLayout(),
            segmenter = me.getSegmenter(),
            visibleRange = me.getVisibleRange(),
            getRangeMethod = 'get' + me.getDirection() + 'Range',
            context, attr, majorTicks,
            series, i, ln;

        // For each series bound to this axis, ask the series for its min/max values
        // and use them to find the overall min/max.
        for (i = 0, ln = boundSeries.length; i < ln; i++) {
            series = boundSeries[i];
            var minMax = series[getRangeMethod]();

            if (minMax) {
                if (minMax[1] > max) {
                    max = minMax[1];
                }
            }
        }
        if (!isFinite(max)) {
            max = me.prevMax;
        }

        if (me.getLabelInSpan()) {
            max += me.getIncrement();
        }
        return max * 1.2;
    }
});
