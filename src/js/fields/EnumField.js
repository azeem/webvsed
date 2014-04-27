(function($, _, Backbone) {

    WebvsEd.EnumField = WebvsEd.Field.extend({
        fieldName: "EnumField",

        selectTemplate: _.template([
            "<% if(label) { %>",
            "    <label class='fixed-width' for='<%= fid %>'><%= label %></label>",
            "<% } %>",
            "<select id='<%= fid %>' class='input'>",
            "<% _.each(enums, function(enumItem) { %>",
            "    <option value='<%= enumItem.value %>'><%= enumItem.label %></option>",
            "<% }); %>",
            "</select>",
        ].join("")),

        radioTemplate: _.template([
            "<fieldset class='input'>",
            "<% _.each(enums, function(enumItem) { %>",
            "    <label><input type='radio' name='<%= fid %>' value='<%= enumItem.value %>'/><%= enumItem.label %></label>",
            "<% }); %>",
            "</fieldset>",
        ].join("")),

        events: _.extend({
            "change .input": "handleChange",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.enum = opts.enum;
            this.enumLabels = opts.enumLabels || {};
            this.label = opts.label;
            this.radio = opts.radio?true:false;
            WebvsEd.Field.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WebvsEd.Field.prototype.render.apply(this, arguments);

            var data = {
                label: this.label,
                enums: _.map(this.enum, function(value) {
                    return {value: value, label: this.enumLabels[value] || value};
                }, this),
                fid: this.fid
            };

            if(this.radio) {
                this.fieldBody.append(this.radioTemplate(data));
            } else {
                this.fieldBody.append(this.selectTemplate(data));
            }
        },

        parseValue: function(rawValue) {
            var value = _.find(this.enum, function(value) {
                return (value == rawValue);
            });
            if(value) {
                return value;
            } else {
                return new WebvsEd.InvalidValue(rawValue, "Value must be one of " + this.enum.join(", "));
            }
        },

        renderValue: function() {
            if(this.radio) {
                this.$closest("input[type='radio']").prop("checked", false);
                this.$closest("input[type='radio'][value='"+this.value+"']").prop("checked", true);
            } else {
                var index = this.enum.indexOf(this.value);
                this.$closest("select").prop("selectedIndex", index);
            }
        },

        handleChange: function(event) {
            this.value = $(event.target).val();
            this.cleanAndTrigger();
        }
    });

})(jQuery, _, Backbone);
