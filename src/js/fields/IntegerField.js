(function($, _, Backbone) {

    WebvsEd.NumberField = WebvsEd.TextField.extend({
        fieldName: "NumberField",

        events: _.extend({
            "spinchange .input": "handleChange"
        }, WebvsEd.TextField.prototype.events),

        initialize: function(opts) {
            this.spinner = opts.spinner;
            this.integer = opts.integer?true:false;
            WebvsEd.TextField.prototype.initialize.apply(this, arguments);
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

        render: function() {
            WebvsEd.TextField.prototype.render.apply(this, arguments);
            if(this.spinner) {
                var opts = {};
                if($.isPlainObject(this.spinner)) {
                    opts = this.spinner;
                }
                this.$closest(".input").spinner(opts);
            }
        }
    });

})(jQuery, _, Backbone);
