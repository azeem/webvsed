(function($, _, Backbone) {

    WebvsEd.EnumField = WebvsEd.Field.extend({
        fieldName: "EnumField",

        selectTemplate: _.template([
            "<% if(label) { %>",
            "    <label class='fixed-width' for='<%= fid %>'><%= label %></label>",
            "<% } %>",
            "<select id='<%= fid %>' class='input'>",
            "<% _.each(enums, function(enumItem) { %>",
            "    <% if(enumItem.groupStart) { %>",
            "        <optgroup label='<%= enumItem.label %>'>",
            "    <% } else if(enumItem.groupEnd) { %>",
            "        </optgroup>",
            "    <% } else { %>",
            "        <option value='<%= enumItem.value %>'><%= enumItem.label %></option>",
            "    <% } %>",
            "<% }); %>",
            "</select>",
        ].join("")),

        radioTemplate: _.template([
            "<fieldset class='input'>",
            "<% _.each(enums, function(enumItem) { %>",
            "    <% if(enumItem.groupStart) { %>",
            "        <h4><%= enumItem.label %></h4>",
            "    <% } else if(!enumItem.groupEnd) { %>",
            "        <label><input type='radio' name='<%= fid %>' value='<%= enumItem.value %>'/><%= enumItem.label %></label>",
            "    <% } %>",
            "<% }); %>",
            "</fieldset>",
        ].join("")),

        events: _.extend({
            "change .input": "handleChange",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.enumLabels = opts.enumLabels || {};
            if(WebvsEd.isEventLike(opts.enum)) {
                this.enumModel = opts.enum;
                this.enumKey = opts.enumKey;
            }
            this.buildEnum(opts.enum);

            this.label = opts.label;
            this.radio = opts.radio?true:false;
            WebvsEd.Field.prototype.initialize.call(this, opts);
        },

        renderField: function() {
            WebvsEd.Field.prototype.renderField.call(this);
            this.renderEnum();
            if(this.enumModel) {
                // listen for enumeration changes
                this.listenTo(this.enumModel, 'change', this.handleEnumChange);
            }
        },

        renderEnum: function() {
            var data = {
                label: this.label,
                enums: this.enumRender,
                fid: this.fid
            };

            this.fieldBody.empty();
            if(this.radio) {
                this.fieldBody.append(this.radioTemplate(data));
            } else {
                this.fieldBody.append(this.selectTemplate(data));
            }
        },

        parseValue: function(rawValue) {
            var values = this.enumValues;
            var value = _.find(values, function(value) {
                return (value == rawValue);
            });
            if(value) {
                return value;
            } else {
                return new WebvsEd.InvalidValue(rawValue, "Value must be one of " + values.join(", "));
            }
        },

        renderValue: function() {
            if(this.radio) {
                this.$closest("input[type='radio']").prop("checked", false);
                this.$closest("input[type='radio'][value='"+this.value+"']").prop("checked", true);
            } else {
                var index = this.enumValues.indexOf(this.value);
                this.$closest("select").prop("selectedIndex", index);
            }
        },

        buildEnum: function(enumSrc) {
            if(WebvsEd.isEventLike(enumSrc)) {
                if(_.isFunction(this.enumKey)) {
                    enumSrc = this.enumKey(enumSrc);
                } else {
                    enumSrc = enumSrc.get(this.enumKey);
                }
            }

            var mapEnum = _.bind(function(value) {
                if(!_.isObject(value)) {
                    // simple value
                    return {value: value, label: this.enumLabels[value] || value};
                } else if("value" in value && "label" in value) {
                    // value and label
                    return value;
                } else if("label" in value && "options" in value) {
                    // group
                    var enums = _.map(value.options, mapEnum);
                    enums.unshift({groupStart: true, label: value.label});
                    enums.push({groupEnd: true});
                    return enums;
                }
            }, this);

            this.enumRender = _.chain(enumSrc).map(mapEnum).flatten().uniq(false, function(item) {
                return ("value" in item?item.value:item);
            }).value();

            this.enumValues = _.chain(this.enumRender).filter(function(item) {
                return ("value" in item);
            }).map(function(item) {
                return item.value;
            }).value();
        },

        // event handlers

        handleChange: function(event) {
            this.cleanAndTrigger($(event.target).val());
        },

        handleEnumChange: function() {
            this.buildEnum(this.enumModel);
            if(this.enumValues.indexOf(this.value) == -1) {
                // if current value is not in the new enum
                // then set value to null
                var newValue = null;
                if(!this.isEmpty(this.defaultValue)) {
                    newValue = this.defaultValue;
                }
                this.setValue(newValue);
                this.setModelValue();
            }
            this.renderEnum();
            this.renderValue();
        }
    });

})(jQuery, _, Backbone);
