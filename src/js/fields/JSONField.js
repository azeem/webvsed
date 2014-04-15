(function($, _, Backbone) {

    WebvsEd.JSONField = WebvsEd.TextAreaField.extend({
        fieldName: "JSONField",

        parseValue: function(rawValue) {
            rawValue = WebvsEd.TextAreaField.prototype.parseValue.call(this, rawValue);
            if(rawValue instanceof WebvsEd.InvalidValue) {
                return rawValue;
            }

            var parsedJson;
            try {
                parsedJson = JSON.parse(rawValue)
            } catch (err) {
                return new WebvsEd.InvalidValue(rawValue, err.message);
            }
            return parsedJson;
        },

        renderValue: function() {
            this.$closest(".text").val(_.isNull(this.value)?"":JSON.stringify(this.value));
        }
    });

})(jQuery, _, Backbone);
