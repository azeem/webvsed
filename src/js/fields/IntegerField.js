(function($, _, Backbone) {

    WebvsEd.IntegerField = WebvsEd.TextField.extend({
        fieldName: "IntegerField",

        events: _.extend({
            "spinchange .input": "handleChange"
        }, WebvsEd.TextField.prototype.events),

        initialize: function(opts) {
            this.spinner = opts.spinner;
            WebvsEd.TextField.prototype.initialize.apply(this, arguments);
        },

        parseValue: function(rawValue) {
            rawValue = WebvsEd.TextField.prototype.parseValue.call(this, rawValue);
            if(rawValue instanceof WebvsEd.InvalidValue) {
                return rawValue;
            }

            var value = parseInt(rawValue);
            if(isNaN(value)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be an integer");
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
