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
        },
        "regex": function(opts, value) {
            if(!opts.regex.test(value)) {
                var message = opts.message || ("Value should match " + opts.regex);
                return new WebvsEd.InvalidValue(value, message);
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
    WebvsEd.makeField = function(opts, overrideOpts) {
        var fieldClass = WebvsEd[opts.type];
        if(!fieldClass) {
            throw new Error("Unknown field class " + opts.type);
        }
        opts = _.clone(opts);
        _.extend(opts, overrideOpts);
        var field = new fieldClass(opts);
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
            // set options
            this.title        = opts.title;
            this.noTrigger    = opts.noTrigger?true:false;
            this.model        = opts.model;
            this.required     = _.isUndefined(opts.required)?true:opts.required;
            this.defaultValue = opts.default;
            this.parent       = opts.parent;
            this.reRender     = opts.reRender;
            this.validators = opts.validators || [];
            if(!_.isArray(this.validators)) {
                this.validators = [this.validators];
            }

            if(opts.hideWhen && this.model) {
                this.hideWhen = opts.hideWhen;
                this.listenTo(this.model, "change:" + opts.hideWhen.key, this.handleHideWhen);
            }

            // init properties
            this.fid = _.uniqueId(this.fieldName);
            this.value = null;
            this.valid = true;
            this.messages = [];

            this.setKey(opts.key);
            this.render();

            // set the initial value from model or
            // defaultValue
            var modelValue = this.getModelValue(this.key);
            if(!this.isEmpty(modelValue)) {
                this.setValue(modelValue);
            } else if(!this.isEmpty(this.defaultValue)) {
                this.setValue(this.defaultValue);
                this.setModelValue();
            } else {
                this.setValue(null);
            }
        },

        render: function() {
            if(!this.title) {
                this.$el.addClass("no-title");
            }
            this.$el.html(this.baseTemplate({
                title: this.title
            }));
            this.fieldBody = this.$closest(".fieldBody");
            this.conditionalHide();
        },

        renderValue: function() {},

        validate: function(value) {},

        parseValue: function(rawValue) {
            return rawValue;
        },

        clean: function(noParse) {
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
            if(!noParse) {
                var parsedValue = this.parseValue(this.value);
                if(parsedValue instanceof WebvsEd.InvalidValue) {
                    this.addMessage(parsedValue.message);
                    return;
                }
                this.value = parsedValue; // set to parsed value
            }

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

        setKey: function(key) {
            if(this.model) {
                this.stopListening(this.model, "change:" + this.key);
                this.listenTo(this.model, "change:" + key, this.handleModelChange);
            }
            this.key = key;
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

        setModelValue: function() {
            if(this.valid && this.model) {
                this.model.set(this.key, this.getValue(), {fid: this.fid});
            }
        },

        getModelValue: function(key) {
            if(this.model) {
                return this.model.get(key);
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

        cleanAndTrigger: function(value) {
            this.value = value;
            this.clean();
            this.renderMessages();
            this.setModelValue();
            if(this.valid && !this.noTrigger) {
                this.trigger("valueChange", this, this.getValue());
            }
        },

        $closest: function(selector) {
            return this.$el.closestDescendant(selector);
        },

        className: function() {
            return WebvsEd.getClass("field", this.fieldName.toLowerCase());
        },

        conditionalHide: function() {
            if(!this.hideWhen) {
                return;
            }
            var value = this.model.get(this.hideWhen.key);
            var hide;
            if(_.isFunction(this.hideWhen.condition)) {
                hide = this.hideWhen.condition.call(this, value);
            } else {
                hide = (value == this.hideWhen.condition);
            }

            if(hide) {
                this.$el.hide();
            } else {
                this.$el.show();
            }
        },

        // event handlers

        handleModelChange: function(model, value, options) {
            if(!this.reRender && options.fid == this.fid) {
                // dont handle if event was raised
                // by this field itself
                return;
            }
            this.value = value;
            this.clean(true);
            this.renderValue();
            this.renderMessages();
            if(this.valid) {
                if(!this.noTrigger) {
                    this.trigger("valueChange", this, this.getValue());
                }
            }
        },

        handleHideWhen: function(model, value) {
            this.conditionalHide();
        }

    });

})(jQuery, _, Backbone);
