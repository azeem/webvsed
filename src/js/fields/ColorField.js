(function($, _, Backbone) {
    WebvsEd.ColorField = WebvsEd.Field.extend({
        fieldName: "ColorField",

        colorPattern: /^#[0-9a-fA-F]{6,6}$/,

        inputTemplate: _.template([
            "<% if(label) { %>",
            "    <label class='fixed-width' for='<%= fid %>'><%= label %></label>",
            "<% } %>",
            "<input id='<%= fid %>' class='color' type='text' />"
        ].join("")),

        events: _.extend({
            "change .color": "handleChange",
            "click label": "handleLabelClick"
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.label = opts.label;
            WebvsEd.Field.prototype.initialize.call(this, opts);
        },

        validate: function(rawValue) {
            if(!this.colorPattern.test(rawValue)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be a hex color value");
            }
        },

        renderField: function() {
            WebvsEd.Field.prototype.renderField.call(this);
            var html = this.inputTemplate({
                fid: this.fid,
                label: this.label,
            });
            this.fieldBody.append(html);
            this.$(".color").spectrum({
                showInput: true,
                showInitial: true,
                preferredFormat: "hex"
            });
        },

        renderValue: function() {
            if(!_.isNull(this.value)) {
                this.$(".color").spectrum("set", this.value);
            }
        },

        // events
        handleChange: function(event, color) {
            this.cleanAndTrigger(color.toHexString());
        },

        handleLabelClick: function() {
            this.$(".color").spectrum("toggle");
            return false;
        }
    });
})(jQuery, _, Backbone);
