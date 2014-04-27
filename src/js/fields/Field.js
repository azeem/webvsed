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

    /**
     * Creates a fied from its options
     * @param {object} opts - field options
     * @param {string} opts.type - field class name
     * @returns {WebvsEd.Field} - instantiated field
     * @memberof WebvsEd
     */
    WebvsEd.makeField = function(opts, parent) {
        var fieldClass = WebvsEd[opts.type];
        if(!fieldClass) {
            throw new Error("Unknown field class " + fieldClass);
        }
        var field = new fieldClass(opts);
        field.setParent(parent);
        return field;
    };


    /**
     * @class
     * Base class for all field types
     * @memberof WebvsEd
     * @constructor
     */
    WebvsEd.Field = Backbone.View.extend({
        tagName: "div",

        baseTemplate: _.template([
            "<% if(title) { %>",
            "    <div class='title'><%= title %></div>",
            "<% } %>",
            "<div class='fieldBody'></div>",
            "<ul class='messages ui-state-error ui-corner-all'></ul>",
        ].join("")),

        msgTemplate: _.template([
            "<% _.each(messages, function(message) { %>",
            "    <li class='message-item'><%= message %></li>",
            "<% }) %>",
        ].join("")),

        initialize: function(opts) {
            this.key = opts.key;
            if(!this.key) {
                WebvsEd.Field.fieldKeyCounter = WebvsEd.Field.fieldKeyCounter || 0;
                this.key = this.fieldName + WebvsEd.Field.fieldKeyCounter++;
            }

            this.title = opts.title;

            this.noTrigger = opts.noTrigger?true:false;

            if(_.isUndefined(opts.required)) {
                this.required = true;
            } else {
                this.required = opts.required?true:false;
            }

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
            if(!this.title) {
                this.$el.addClass("no-title");
            }
            this.$el.html(this.baseTemplate({
                title: this.title
            }));
            this.fieldBody = this.$closest(".fieldBody");
        },

        renderValue: function() {},

        validate: function(value) {},

        parseValue: function(rawValue) {
            return rawValue;
        },

        clean: function() {
            this.valid = false;
            this.messages = [];

            // check for empty values
            if(this.isEmpty(this.value)) {
                if(this.required) {
                    this.addMessage("This value is required");
                    return;
                } else {
                    this.valid = true;
                    return;
                }
            }

            // parse the value into javascript object
            var parsedValue = this.parseValue(this.value);
            if(parsedValue instanceof WebvsEd.InvalidValue) {
                this.addMessage(parsedValue.message);
                return;
            }
            this.value = parsedValue; // set to parsed value

            var validation;

            // validate the parsed value
            validation = this.validate(this.value);
            if(validation instanceof WebvsEd.InvalidValue) {
                this.addMessage(validation.message);
                return;
            }

            // run all user specified validators
            var failed = false;
            for(var i = 0;i < this.validators.length;i++) {
                var validator = this.validators[i];
                if($.isFunction(validator)) {
                    validation = validator(this.value, this);
                } else {
                    var opts = validator;
                    validator = WebvsEd.validatorRegistry[validator.type];
                    if(!validator) {
                        throw new Error("Unknown validator " + validator.type);
                    }
                    validation = validator(opts, this.value, this);
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

        isEmpty: function(value) {
            return (_.isNull(value) || _.isUndefined(value));
        },

        addMessage: function(msg) {
            this.messages.push(msg);
        },

        renderMessages: function() {
            var msgList = this.$closest(".messages");
            if(this.messages.length > 0) {
                this.$el.addClass("has-message");
                msgList.empty().append(this.msgTemplate({
                    messages: this.messages
                })).show();
            } else {
                this.$el.removeClass("has-message");
                msgList.hide();
            }
        },

        setValue: function(value) {
            this.value = value;
            this.clean();
            this.renderValue();
            this.renderMessages();
        },

        getValue: function() {
            return this.value;
        },

        cleanAndTrigger: function() {
            this.clean();
            this.renderMessages();
            if(this.valid && !this.noTrigger) {
                this.$el.trigger("valueChange", [this, this.getValue()]);
            }
        },

        $closest: function(selector) {
            return this.$el.closestDescendant(selector);
        },

        setParent: function(parent) {
            this.parent = parent;
        },

        getPath: function() {
            var prefix = "";
            if(this.parent) {
                prefix = this.parent.getPath() + ".";
            }
            return (prefix + this.key);
        },

        className: function() {
            return WebvsEd.getClass("field", this.fieldName.toLowerCase());
        }
    });

})(jQuery, _, Backbone);
