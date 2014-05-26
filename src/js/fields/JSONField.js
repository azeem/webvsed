(function($, _, Backbone) {

    WebvsEd.JSONField = WebvsEd.TextAreaField.extend({
        fieldName: "JSONField",

        initialize: function(opts) {
            this.indent = _.isUndefined(opts.indent)?2:opts.indent;
            WebvsEd.TextAreaField.prototype.initialize.apply(this, arguments);
        },

        parseValue: function(rawValue) {
            rawValue = WebvsEd.TextAreaField.prototype.parseValue.call(this, rawValue);
            if(rawValue instanceof WebvsEd.InvalidValue) {
                return rawValue;
            }

            if(_.isString(rawValue)) {
                var parsedJson;
                try {
                    parsedJson = JSON.parse(rawValue);
                } catch (err) {
                    return new WebvsEd.InvalidValue(rawValue, err.message);
                }
                return parsedJson;
            } else {
                return rawValue;
            }
        },

        renderValue: function() {
            var string = "";
            if(!_.isNull(this.value)) {
                string = JSON.stringify(this.value, null, this.indent);
            }
            this.$closest(".text").val(string);
        }
    });

    WebvsEd.DotKeyMixin(WebvsEd.JSONField, WebvsEd.TextAreaField);

})(jQuery, _, Backbone);
