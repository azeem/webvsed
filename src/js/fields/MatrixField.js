(function($, _, Backbone) {

    WebvsEd.MatrixField = WebvsEd.Field.extend({
        fieldName: "MatrixField",
        template: _.template([
            "<div class='controls'>",
            "    <button class='incr-size ui-button' title='Increase Size'>",
            "        <span class='ui-icon ui-icon-plus'></span>",
            "    </button>",
            "    <button class='decr-size ui-button' title='Decrease Size'>",
            "        <span class='ui-icon ui-icon-minus'></span>",
            "    </button>",
            "</div>",
            "<table class='matrix'>",
            "</table>"
        ].join("")),

        matrixTemplate: _.template([
            "<% _.times(size, function(i) { %>",
            "    <tr>",
            "        <% _.times(size, function(j) { %>",
            "            <td><input value='<%= value[size*i+j] %>' type='text'/></td>",
            "        <% }); %>",
            "    </tr>",
            "<% }); %>"
        ].join("")),

        events: _.extend({
            "change .matrix input": "handleChange",
            "click .incr-size": "handleSizeIncrease",
            "click .decr-size": "handleSizeDecrease",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.defaultCellValue = opts.defaultCellValue;
            if(_.isUndefined(this.defaultCellValue)) {
                this.defaultCellValue = 0;
            }
            WebvsEd.Field.prototype.initialize.call(this, opts);
        },

        parseValue: function(rawValue) {
            if(!_.isArray(rawValue)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be an array");
            }
            return rawValue;
        },

        validate: function(value) {
            size = Math.floor(Math.sqrt(value.length));
            if(size*size != value.length) {
                return new WebvsEd.InvalidValue(rawValue, "Value is not a square matrix");
            }
        },

        render: function() {
            WebvsEd.Field.prototype.render.call(this);
            this.fieldBody.append(this.template());
        },

        matrixSize: function(arr) {
            return Math.floor(Math.sqrt(arr.length));
        },

        renderValue: function() {
            this.$(".matrix").empty();
            if(!this.valid || !this.value) {
                return;
            }
            var size = this.matrixSize(this.value);
            var tableHtml = this.matrixTemplate({size: size, value: this.value});
            this.$(".matrix").append(tableHtml);
        },

        rebuildValue: function() {
            var value = [];
            this.$(".matrix input").each(function() {
                var cellValue = parseInt($(this).val());
                value.push(cellValue);
            });
            this.cleanAndTrigger(value);
        },

        // event handlers

        handleChange: function(event) {
            var target = $(event.target);
            var value = parseInt(target.val());
            if(_.isNaN(value)) {
                value = this.defaultCellValue;
            }
            target.val(value);
            this.rebuildValue();
        },

        handleSizeIncrease: function() {
            var i;
            var newValue = [];
            if(!this.value) {
                for(i = 0;i < 4;i++) {
                    newValue.push(this.defaultCellValue);
                }
            } else {
                var currentSize = this.matrixSize(this.value);
                // add new column
                for(i = 0;i < this.value.length;i++) {
                    newValue.push(this.value[i]);
                    if((i+1)%currentSize === 0) {
                        newValue.push(this.defaultCellValue);
                    }
                }
                // add new row
                for(i = 0;i < currentSize+1;i++) {
                    newValue.push(this.defaultCellValue);
                }
            }
            this.cleanAndTrigger(newValue);
            this.renderValue();
        },

        handleSizeDecrease: function() {
            var i;
            var currentSize = this.matrixSize(this.value);
            if(currentSize == 2) {
                return;
            }
            var newValue = [];
            // add new column
            for(i = 0;i < this.value.length-currentSize;i++) {
                if((i+1)%currentSize !== 0) {
                    newValue.push(this.value[i]);
                }
            }
            this.cleanAndTrigger(newValue);
            this.renderValue();
        }
    });

})(jQuery, _, Backbone);
