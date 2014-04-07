(function($) {

    /**
     * Shallow traverses given element and initializes all Fields with markup.
     * Field class name should be specified in data-wef attribute.
     * Field options should be specified in data-wef-options attribute as
     * JSON or a string. If options is a string then its taken from the
     * fieldOptions param.
     * @memberof WebvsEd
     * @param {jQuery} element - the elements which should be initialized
     * @param {object} [fieldOptions] - field options for elements
     */
    WebvsEd.makeForm = function(element, fieldOptions) {
        if(fieldOptions) {
            // set field options by key
            element.find("[data-wef-options]").each(function() {
                var field = $(this);
                var options = field.data("wefOptions");
                if(!$.isPlainObject(options)) {
                    options = fieldOptions[options];
                    field.data("wefOptions", options);
                }
            });
        }

        var processed = [];
        element.find("[data-wef]").each(function() {
            for(var i = 0;i < processed.length;i++) {
                // skip sub-sub field definitions
                if(processed[i].has(this).length > 0) {
                    return;
                }
            }
            var field = $(this);
            var fieldClass = "webvsed" + field.data("wef");
            var options = field.data("wefOptions") || {};
            field[fieldClass](options);
            processed.push(field);
        });
    };

    WebvsEd.widgetMethod = function(field) {
        var widgetName = field.data("webvsedWidgetName");
        var args = Array.prototype.slice.call(arguments, 1);
        return field[widgetName].apply(field, args);
    };

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

    WebvsEd.validatorRegistry = {};
    /**
     * Registers a validator to be used in Fields
     * @memberof WebvsEd
     * @param {jQuery} name - name of the validator
     * @param {function} [func] - validator function. receives and options object and value
     *                            to be validated. Should return InvalidValue object for invalid
     *                            values.
     */
    WebvsEd.registerValidator = function(name, func) {
        WebvsEd.validatorRegistry[name] = func;
    };

    WebvsEd.formDefRegistry = {};
    WebvsEd.registerFormDef = function(name, template, fieldOptions) {
        formDefRegistry[name] = {
            template: template,
            fieldOptions: fieldOptions || {}
        };
    };
    WebvsEd.createForm = function(parent, formName, initValue) {
        var formDef = WebvsEd.formRegistry[formName];
        if(!formDef) {
            formDef = WebvsEd.formDefRegistry.Default;
        }
        var form = $(formDef.template).appendTo(parent);
        WebvsEd.makeForm(form, formDef.fieldOptions);
    };

    // Validators
    WebvsEd.registerValidator("range", function(opts, value) {
        if("min" in opts && value < opts.min) {
            return new WebvsEd.InvalidValue(value, "Value should be greater than or equal to " + opts.min);
        }
        if("max" in opts && value > opts.max) {
            return new WebvsEd.InvalidValue(value, "Value should be less than or equal to " + opts.max);
        }
    });


    /**
     * @class
     * Field base class. Handles validtion cycle.
     * @memberof $.webvsed
     */
    $.widget("webvsed.webvsedField", {
        options: {
            required: false,
            default: null,
            validators: [],
            labels: {}
        },

        /**
         * Initializes the Field
         * @memberof $.webvsEd.webvsedField#
         */
        _create: function() {
            // create DOM
            var fieldClassName = this.widgetName;
            fieldClassName = fieldClassName.substring("webvsed".length).toLowerCase();
            fieldClassName = "webvsed-" + fieldClassName;
            this.element.addClass("webvsed-field " + fieldClassName);
            this.element.data("webvsedWidgetName", this.widgetName);
            this.msgElement = $("<ul class='webvsed-field-messages'></ul>");
            this.element.after(this.msgElement);

            // set initial state
            this.valid = true;
            this.setValue(this.options.default || null);
        },

        /**
         * Parses a raw string value into a javascript object
         * Override to implement, custom parsing.
         * @memberof $.webvsEd.webvsedField#
         * @param {string} rawVal - raw value
         */
        _parseValue: function(rawVal) {
            return rawVal;
        },

        /**
         * Field specific validation. This is run
         * after _parseValue and before user specific validations
         * @memberof $.webvsEd.webvsedField#
         * @param {object} value - parsed value
         */
        _validate: function(value) {},

        /**
         * Runs validation cycle
         * @memberof $.webvsEd.webvsedField#
         * @param {object} value - raw value to be used
         */
        _clean: function(value) {
            this.valid = false;
            this.messages = [];
            this.value = value; // set to raw value

            // check for empty values
            if(!value) {
                if(this.options.required) {
                    this.addMessage("This value is required");
                    return;
                } else {
                    this.valid = true;
                    return;
                }
            }

            // parse the value into javascript object
            value = this._parseValue(value);
            if(value instanceof WebvsEd.InvalidValue) {
                this.addMessage(value.message);
                return;
            }
            this.value = value; // set to parsed value

            var validation;

            // validate the parsed value
            validation = this._validate(value);
            if(validation instanceof WebvsEd.InvalidValue) {
                this.addMessage(validation.message);
                return;
            }

            // run all user specified validators
            var failed = false;
            for(var i = 0;i < this.options.validators.length;i++) {
                var validator = this.options.validators[i];
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
            this.msgElement.empty();
            if(this.messages.length > 0) {
                for(var i = 0;i < this.messages.length;i++) {
                    this.msgElement.append("<li class='webvsed-field-message'>"+this.messages[i]+"</li>");
                }
                this.msgElement.show();
            } else {
                this.msgElement.hide();
            }
        },

        _renderValue: function() {},

        _triggerValueChange: function() {
            this.element.trigger("valueChange", [this, this.value]);
        },

        _changeValue: function(value) {
            this._clean(value);
            this.renderMessages();
            if(this.valid) {
                this._triggerValueChange();
            }
        },

        setValue: function(value) {
            this._clean(value);
            this._renderValue();
            this.renderMessages();
        },

        getValue: function() {
            return this.value;
        }
    });

    $.widget("webvsed.webvsedTextField", $.webvsed.webvsedField, {
        defaultElement: "<input/>",
        _create: function() {
            this.element.attr("type", "text");

            var _this = this;
            this.element.on("change", function(event) {
                _this._changeValue(_this.element.val());
            });
            this._super();
        },

        _renderValue: function() {
            this.element.val(this.value);
        }
    });

    $.widget("webvsed.webvsedIntegerField", $.webvsed.webvsedTextField, {
        _parseValue: function(rawValue) {
            rawValue = this._super(rawValue);
            if(rawValue instanceof WebvsEd.InvalidValue) {
                return rawValue;
            }

            var value = parseInt(rawValue);
            if(isNaN(value)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be an integer");
            } else {
                return value;
            }
        }
    });

    $.widget("webvsed.webvsedEnumField", $.webvsed.webvsedField, {
        options: {
            enum: []
        },
        _create: function() {
            this.radio = (this.element.prop("tagName") !== "SELECT");

            if(this.options.required && !this.radio) {
                this.element.attr("required", "required");
            }

            if(this.radio) {
                this.constructor.radioNameCounter = this.constructor.radioNameCounter || 0;
                this.name = "webvsed-radio" + this.constructor.radioNameCounter++;
            }

            // create the options
            for(var i = 0;i < this.options.enum.length;i++) {
                var value = this.options.enum[i];
                var label = this.options.labels[value] || value;
                if(this.radio) {
                    this.element.append("<input type='radio' id='"+this.name+i+"' name='"+this.name+"' value='"+value+"'/><label for='"+this.name+i+"'>"+label+"</label>");
                } else {
                    this.element.append("<option value='"+value+"'>"+label+"</option>");
                }
            }

            var _this = this;
            this.element.on("change", function(event) {
                if(_this.radio) {
                    _this._changeValue($(event.target).val());
                } else {
                    _this._changeValue(_this.element.val());
                }
            });

            this._super();
        },

        _parseValue: function(rawValue) {
            for(var i = 0;i < this.options.enum.length;i++) {
                var value = this.options.enum[i];
                if(rawValue == value) {
                    return value;
                }
            }
            return new WebvsEd.InvalidValue(rawValue, "Value must be one of " + this.options.enum.join(", "));
        },

        _renderValue: function() {
            console.log("rendering");
            if(this.radio) {
                this.element.find("input[type='radio']").prop("checked", false);
                this.element.find("input[type='radio'][value='"+this.value+"']").prop("checked", true);
            } else {
                var index = this.options.enum.indexOf(this.value);
                this.element.prop("selectedIndex", index);
            }
        }
    });

    $.widget("webvsed.webvsedBooleanField", $.webvsed.webvsedField, {
        _create: function() {
            this.element.attr("type", "checkbox");

            var _this = this;
            this.element.on("change", function() {
                _this._changeValue(_this.element.prop("checked"));
            });
            
            this._super();
        },

        _parseValue: function(rawValue) {
            if(typeof(rawValue) == "string") {
                return rawValue.toLowerCase() == "true";
            } else {
                return rawValue?true:false;
            }
        },

        _renderValue: function() {
            if(this.value) {
                this.element.prop("checked", true);
            } else {
                this.element.prop("checked", false);
            }
        }
    });

    $.widget("webvsed.webvsedArrayField", $.webvsed.webvsedField, {
        _create: function() {
            this.template = this.element.children().clone(true, true);
            this.element.empty();
            this._buildUI();

            // Bind events
            var _this = this;
            this.element.on("click", ".webvsed-arrayfield-add", function() {
                var item = _this._addItem();
                var itemValue = WebvsEd.widgetMethod(item.find(".webvsed-field"), "getValue");
                if(_this.value === null) {
                    _this.value = [itemValue];
                } else {
                    _this.value.push(itemValue);
                }
                _this._triggerValueChange();
            });

            this.items.on("click", ".webvsed-arrayfield-remove", function() {
                var item = $(this).closest(".webvsed-arrayfield-item");
                _this.value.splice(item.index(), 1);
                item.remove();
                _this._triggerValueChange();
            });

            this.items.on("valueChange", function(event, field, itemValue) {
                var index = field.element.closest(".webvsed-arrayfield-item").index();
                _this.value[index] = itemValue;
                _this._triggerValueChange();
            });

            this.items.on("sortstart", function(event, ui) {
                _this.sortStartIndex = ui.item.index();
            });
            this.items.on("sortstop", function(event, ui) {
                var sortStopIndex = ui.item.index();
                var itemValue = _this.value[_this.sortStartIndex];
                _this.value.splice(_this.sortStartIndex, 1);
                _this.value.splice(sortStopIndex, 0, itemValue);
                _this._triggerValueChange();
            });

            this._super();
        },

        _parseValue: function(rawValue) {
            if(!$.isArray(rawValue)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be a list");
            }
            return rawValue;
       },

        _buildUI: function() {
            this.element.append([
                "<div class='webvsed-arrayfield-controls'>",
                "    <button class='ui-button webvsed-arrayfield-add' title='Add Item'>",
                "        <span class='ui-icon ui-icon-plus'></span>",
                "    </button>",
                "</div>",
                "<div class='webvsed-arrayfield-items'>",
                "</div>",
            ].join(""));

            this.items = this.element.find(".webvsed-arrayfield-items");
            this.items.sortable({
                handle: ".webvsed-arrayfield-itemcontrols"
            });
        },

        _addItem: function(itemValue) {
            var item = $([
                "<div class='webvsed-arrayfield-item'>",
                "    <div class='webvsed-arrayfield-itemcontrols'>",
                "        <button class='ui-button webvsed-arrayfield-remove' title='Remove item'>",
                "            <span class='ui-icon ui-icon-minus'></span>",
                "        </button>",
                "        <div class='webvsed-arrayfield-movehandle' title='Move Item'>",
                "            <span class='ui-icon ui-icon-grip-dotted-vertical'></span>",
                "        </div>",
                "    </div>",
                "</div>"
            ].join(""));
            item.append(this.template.clone(true, true));
            this.items.append(item);

            // build the form and set value
            WebvsEd.makeForm(item);
            if(itemValue) {
                WebvsEd.widgetMethod(item.find(".webvsed-field"), "setValue", itemValue);
            }
            return item;
        },
        
        _renderValue:function() {
            this.items.empty();
            for(var i = 0;i < this.value.length;i++) {
                this._addItem(this.value[i]);
            }
        }
    });

})(jQuery);
