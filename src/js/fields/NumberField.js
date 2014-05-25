(function($, _, Backbone) {

    WebvsEd.NumberField = WebvsEd.TextField.extend({
        fieldName: "NumberField",

        events: _.extend({
            "spinchange .input": "handleChange",
            "spinstop .input": "handleSpinStop"
        }, WebvsEd.TextField.prototype.events),

        initialize: function(opts) {
            if($.isPlainObject(opts.spinner)) {
                this.spinner = opts.spinner;
            }

            this.integer = opts.integer?true:false;
            WebvsEd.TextField.prototype.initialize.call(this, opts);
        },

        parseValue: function(rawValue) {
            rawValue = WebvsEd.TextField.prototype.parseValue.call(this, rawValue);
            if(rawValue instanceof WebvsEd.InvalidValue) {
                return rawValue;
            }

            var value;
            if(this.integer) {
              value = parseInt(rawValue);
            } else {
              value = parseFloat(rawValue);
            }
            if(isNaN(value)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be a " + (this.integer?"integer":"number"));
            } else {
                return value;
            }
        },

        renderField: function() {
            WebvsEd.TextField.prototype.renderField.call(this);
            if(this.spinner) {
                this.$closest(".input").spinner(this.spinner);
            }
        },

        // events
        handleSpinStop: function() {
            this.$closest(".input").change();
        }
    });

})(jQuery, _, Backbone);
