(function($, _, Backbone) {

    WebvsEd.TextField = WebvsEd.Field.extend({
        fieldName: "TextField",

        inputTemplate: _.template([
            "<% if(label) { %>",
            "    <label class='fixed-width' for='<%= fid %>'><%= label %></label>",
            "<% } %>",
            "<input id='<%= fid %>' class='input' type='text'/>",
        ].join("")),

        events: _.extend({
            "change .input": "handleChange",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.label = opts.label;
            WebvsEd.Field.prototype.initialize.call(this, opts);
        },

        renderField: function() {
            WebvsEd.Field.prototype.renderField.call(this);
            this.fieldBody.append(this.inputTemplate({
                fid: this.fid,
                label: this.label
            }));
        },

        isEmpty: function(value) {
            return (WebvsEd.Field.prototype.isEmpty(value) || value === "");
        },

        renderValue: function() {
            this.$closest(".input").val(this.value);
        },

        handleChange: function() {
            this.cleanAndTrigger(this.$closest(".input").val());
        }
    });

})(jQuery, _, Backbone);
