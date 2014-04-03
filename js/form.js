(function($, _, Backbone) {

    /**
     * @class
     * An object to indicate field validation/parsing errors
     * @memberof WebvsEd
     * @constructor
     */
    WebvsEd.InvalidValue = function(value, message) {
        this.value = value;
        this.message = message;
    };

    WebvsEd.validatorRegistry = {
        "range": function(opts, value) {
            if("min" in opts && value < opts.min) {
                return new WebvsEd.InvalidValue(value, "Value should be greater than or equal to " + opts.min);
            }
            if("max" in opts && value > opts.max) {
                return new WebvsEd.InvalidValue(value, "Value should be less than or equal to " + opts.max);
            }
        }
    };

    WebvsEd.Field = Backbone.View.extend({
        tagName: "div",

        baseTemplate: _.template([
            "<% if(title) { %>",
            "    <div class='title'><%= title %></div>",
            "<% } %>",
            "<div class='fieldBody'></div>",
            "<ul class='messages'></ul>"
        ].join("")),

        msgTemplate: _.template([
            "<% _.each(messages, function(message) { %>",
            "    <li class='message-item'><%= message %></li>",
            "<% }) %>",
        ].join("")),

        initialize: function(opts) {
            this.id = opts.id;
            this.title = opts.title;
            this.required = opts.required?true:false;
            this.validators = opts.validators || [];
            if(!_.isArray(this.validators)) {
                this.validators = [this.validators];
            }
            this.defaultValue = opts.default;

            this.value = null;
            this.valid = true;
            this.messages = [];

            this.render();
            this.setValue(this.defaultValue || null);
        },

        render: function() {
            this.$el.html(this.baseTemplate({
                title: this.title
            }));
            this.fieldBody = this.$(".fieldBody");
        },

        renderValue: function() {},

        validate: function() {},

        parseValue: function(rawValue) {
            return rawValue;
        },

        clean: function(value) {
            this.valid = false;
            this.messages = [];
            this.value = value;

            // check for empty values
            if(!value) {
                if(this.required) {
                    this.addMessage("This value is required");
                    return;
                } else {
                    this.valid = true;
                    return;
                }
            }

            // parse the value into javascript object
            value = this.parseValue(value);
            if(value instanceof WebvsEd.InvalidValue) {
                this.addMessage(value.message);
                return;
            }
            this.value = value; // set to parsed value

            var validation;

            // validate the parsed value
            validation = this.validate(value);
            if(validation instanceof WebvsEd.InvalidValue) {
                this.addMessage(validation.message);
                return;
            }

            // run all user specified validators
            var failed = false;
            for(var i = 0;i < this.validators.length;i++) {
                var validator = this.validators[i];
                if($.isFunction(validator)) {
                    validation = validator(value);
                } else {
                    var opts = validator;
                    validator = WebvsEd.validatorRegistry[validator.type];
                    if(!validator) {
                        throw new Error("Unknown validator " + validator.type);
                    }
                    validation = validator(opts, value);
                }
                if(validation instanceof WebvsEd.InvalidValue) {
                    failed = true;
                    this.addMessage(validation.message);
                }
            }
            if(failed) {
                return;
            }

            this.valid = true;
        },

        addMessage: function(msg) {
            this.messages.push(msg);
        },

        renderMessages: function() {
            var msgList = this.$(".messages");
            if(this.messages.length > 0) {
                msgList.empty().append(this.msgTemplate({
                    messages: this.messages
                })).show();
            } else {
                msgList.hide();
            }
        },

        setValue: function(value) {
            this.clean(value);
            this.renderValue();
            this.renderMessages();
        },

        getValue: function() {
            return this.value;
        },

        cleanAndTrigger: function(value) {
            this.clean(value);
            this.renderMessages();
            if(this.valid) {
                this.triggerValueChange();
            }
        },

        triggerValueChange: function() {
            this.$el.trigger("valueChange", [this, this.value]);
        },

        className: function() {
            return WebvsEd.getClass("field", this.name.toLowerCase());
        }
    });

    WebvsEd.TextField = WebvsEd.Field.extend({
        name: "TextField",

        inputTemplate: _.template([
            "<% if(label) { %>",
            "    <label><%= label %>",
            "        <input class='input' type='text'/>",
            "    </label>",
            "<% } else { %>",
            "    <input class='input' type='text'/>",
            "<% } %>",
        ].join("")),

        events: {
            "change .input": "handleChange",
        },

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

        renderValue: function() {
            this.$(".input").val(this.value);
        },

        handleChange: function() {
            this.cleanAndTrigger(this.$(".input").val());
        }
    });

    WebvsEd.IntegerField = WebvsEd.TextField.extend({
        name: "IntegerField",

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
                this.$(".input").spinner(opts);
            }
        }
    });

    WebvsEd.BooleanField = WebvsEd.Field.extend({
        name: "BooleanField",

        checkBoxTemplate: _.template([
            "<% if(label) { %>",
            "    <label><%= label %>",
            "        <input class='input' type='checkbox'/>",
            "    </label>",
            "<% } else { %>",
            "    <input class='input' type='checkbox'/>",
            "<% } %>",
        ].join("")),

        events: {
            "change .input": "handleChange",
        },

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
            this.$(".input").prop("checked", this.value?true:false);
        },

        handleChange: function() {
            this.cleanAndTrigger(this.$(".input").prop("checked"));
        }
    });

    WebvsEd.EnumField = WebvsEd.Field.extend({
        name: "EnumField",

        selectTemplate: _.template([
            "<select class='input'>",
            "<% _.each(enums, function(enumItem) { %>",
            "    <option value='<%= enumItem.value %>'><%= enumItem.label %></option>",
            "<% }); %>",
            "</select>",
        ].join("")),

        radioTemplate: _.template([
            "<fieldset class='input'>",
            "<% _.each(enums, function(enumItem) { %>",
            "    <label><input type='radio' name='<%= name %>' value='<%= enumItem.value %>'/><%= enumItem.label %></label>",
            "<% }); %>",
            "</fieldset>",
        ].join("")),

        events: {
            "change .input": "handleChange"
        },

        initialize: function(opts) {
            this.enum = opts.enum;
            this.enumLabels = opts.enumLabels || {};
            this.radio = opts.radio?true:false;
            WebvsEd.Field.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WebvsEd.Field.prototype.render.apply(this, arguments);

            WebvsEd.EnumField.radioNameCounter = WebvsEd.EnumField.radioNameCounter || 0;
            var data = {
                enums: _.map(this.enum, function(value) {
                    return {value: value, label: this.enumLabels[value] || value};
                }, this),
                name: "enumfield-radio"+WebvsEd.EnumField.radioNameCounter++
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
                this.$("input[type='radio']").prop("checked", false);
                this.$("input[type='radio'][value='"+this.value+"']").prop("checked", true);
            } else {
                var index = this.enum.indexOf(this.value);
                this.$("select").prop("selectedIndex", index);
            }
        },

        handleChange: function(event) {
            this.cleanAndTrigger($(event.target).val());
        }
    });

    WebvsEd.ArrayField = WebvsEd.Field.extend({
        name: "ArrayField",

        arrayTemplate: _.template([
            "<div class='controls'>",
            "    <button class='addItem ui-button' title='Add Item'>",
            "        <span class='ui-icon ui-icon-plus'></span>",
            "    </button>",
            "</div>",
            "<div class='arrayItems'>",
            "</div>",
        ].join("")),

        itemTemplate: _.template([
            "<div class='arrayItem'>",
            "    <div class='controls'>",
            "        <button class='removeItem ui-button' title='Remove Item'>",
            "            <span class='ui-icon ui-icon-minus'></span>",
            "        </button>",
            "        <div class='movehandle' title='Move Item'>",
            "            <span class='ui-icon ui-icon-grip-dotted-vertical'></span>",
            "        </div>",
            "    </div>",
            "    <div class='itemBody'>",
            "    </div>",
            "</div>",
        ].join("")),

        events: {
            "click .addItem": "handleAddItem",
            "click .removeItem": "handleRemoveItem",
            "valueChange .arrayItem": "handleChange",
            "sortstart .arrayItems": "handleSortStart",
            "sortstop .arrayItems": "handleSortStop"
        },

        initialize: function(opts) {
            this.arrayItemOpts = opts.arrayItem;

            this.fields = [];
            WebvsEd.Field.prototype.initialize.apply(this, arguments);
        },

        addItem: function(value) {
            var field = WebvsEd.makeField(this.arrayItemOpts);
            var item = $(this.itemTemplate());
            this.$(".arrayItems").append(item);
            item.find(".itemBody").append(field.el);
            item.data("arrayFieldItemIndex", this.fields.length);

            this.fields.push(field);
            if(value) {
                field.setValue(value);
            }
            return field;
        },

        render: function() {
            WebvsEd.Field.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.arrayTemplate());
            this.$(".arrayItems").sortable({
                handle: ".movehandle"
            });
        },

        renderValue: function() {
            this.$(".arrayItems").empty();
            if(this.value) {
                for(var i = 0;i < this.value.length;i++){
                    this.addItem(this.value[i]);
                }
            }
        },

        parseValue: function(rawValue) {
            if(!_.isArray(rawValue)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be a list");
            }
            return rawValue;
        },

        handleAddItem: function() {
            var field = this.addItem();
            var value = field.getValue();
            if(_.isNull(this.value)) {
                this.value = [value];
            } else {
                this.value.push(value);
            }
            this.triggerValueChange();
        },

        handleRemoveItem: function(event) {
            var item = $(event.target).closest(".arrayItem");
            var index = item.index();
            this.value.splice(index, 1);
            this.fields.splice(index, 1);
            item.remove();
            this.triggerValueChange();
        },

        handleChange: function(event, field, itemValue) {
            var index = $(event.target).closest(".arrayItem").index();
            this.value[index] = itemValue;
            this.triggerValueChange();
        },

        handleSortStart: function(event, ui) {
            this.sortStartIndex = ui.item.index();
        },

        handleSortStop: function(event, ui) {
            var sortStopIndex = ui.item.index();
            var itemValue = this.value[this.sortStartIndex];
            var field = this.fields[this.sortStartIndex];

            this.value.splice(this.sortStartIndex, 1);
            this.value.splice(sortStopIndex, 0, itemValue);

            this.fields.splice(this.sortStartIndex, 1);
            this.fields.splice(sortStopIndex, 0, field);

            this.triggerValueChange();
        }
    });

    /*WebvsEd.ObjectField = WebvsEd.Field.extend({
        name: "ObjectField",

        render: function() {
        }
    });*/

})(jQuery, _, Backbone);
