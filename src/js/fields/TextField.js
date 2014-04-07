(function($, _, Backbone) {

    WebvsEd.TextField = WebvsEd.Field.extend({
        fieldName: "TextField",

        inputTemplate: _.template([
            "<% if(label) { %>",
            "    <label><%= label %>",
            "        <input class='input' type='text'/>",
            "    </label>",
            "<% } else { %>",
            "    <input class='input' type='text'/>",
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
            this.fieldBody.append(this.inputTemplate({
                label: this.label
            }));
        },

        isEmpty: function(value) {
            return (WebvsEd.Field.prototype.isEmpty(value) || value == "");
        },

        renderValue: function() {
            this.$closest(".input").val(this.value);
        },

        handleChange: function() {
            this.value = this.$closest(".input").val();
            this.cleanAndTrigger();
        }
    });

})(jQuery, _, Backbone);
