(function($, _, Backbone) {

    WebvsEd.BooleanField = WebvsEd.Field.extend({
        fieldName: "BooleanField",

        checkBoxTemplate: _.template([
            "<% if(label) { %>",
            "    <label><%= label %>",
            "        <input class='input' type='checkbox'/>",
            "    </label>",
            "<% } else { %>",
            "    <input class='input' type='checkbox'/>",
            "<% } %>",
        ].join("")),

        events: _.extend({
            "change .input": "handleChange",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.label = opts.label;
            WebvsEd.Field.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WebvsEd.Field.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.checkBoxTemplate({
                label: this.label
            }));
        },

        parseValue: function(rawValue) {
            if(typeof(rawValue) == "string") {
                return rawValue.toLowerCase() == "true";
            } else {
                return rawValue?true:false;
            }
        },

        renderValue: function() {
            this.$closest(".input").prop("checked", this.value?true:false);
        },

        handleChange: function() {
            this.cleanAndTrigger(this.$closest(".input").prop("checked"));
        }
    });

})(jQuery, _, Backbone);
