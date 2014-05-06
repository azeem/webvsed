(function($, _, Backbone) {

    WebvsEd.KeyValueField = WebvsEd.ContainerField.extend({
        fieldName: "KeyValueField",

        keyvalTemplate: _.template([
            "<div class='controls'>",
            "    <button class='addItem ui-button' title='Add Item'>",
            "        <span class='ui-icon ui-icon-plus'></span>",
            "    </button>",
            "</div>",
            "<div class='keyvalItems items'>",
            "</div>",
        ].join("")),

        itemTemplate: _.template([
            "<div class='keyvalItem item'>",
            "    <div class='controls'>",
            "        <button class='removeItem ui-button' title='Remove Item'>",
            "            <span class='ui-icon ui-icon-minus'></span>",
            "        </button>",
            "    </div>",
            "    <div class='itemBody'>",
            "    </div>",
            "</div>",
        ].join("")),

        events: _.extend({
            "click .addItem": "handleAddItem",
            "click .removeItem": "handleRemoveItem",
            "valueChange .keyvalItem": "handleChange",
        }, WebvsEd.ContainerField.prototype.events),

        initialize: function(opts) {
            this.valFieldOpts = opts.valueField;
            this.keyFieldOpts = opts.keyField;

            this.fields = [];
            WebvsEd.ContainerField.prototype.initialize.apply(this, arguments);
        },

        parseValue: function(rawValue) {
            if(!_.isArray(rawValue)) {
                return _.pairs(rawValue);
            } else {
                var checkPair = function(pair) {
                    return (_.isArray(pair) && pair.length == 2);
                };
                if(_.every(rawValue, checkPair)) {
                    return rawValue;
                } else {
                    return new InvalidValue(rawValue, "Value must be object or array of key-value pairs");
                }
            }
        },

        render: function() {
            WebvsEd.ContainerField.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.keyvalTemplate());
        },

        renderValue: function() {
            this.$closest(".keyvalItems").empty();
            if(this.value) {
                for(var i = 0;i < this.value.length;i++) {
                    this.addItem(this.value[i][0], this.value[i][1]);
                }
            }
        },

        uniqueKeyValidator: function(value, field) {
            if(_.isNull(this.value)) {
                return;
            }
            for(var i = 0;i < this.value.length;i++) {
                if(this.fields[i].keyField === field) {
                    continue;
                }
                if(this.value[i][0] == value) {
                    return new WebvsEd.InvalidValue(value, value + " already exists");
                }
            }
        },

        addItem: function(key, value) {
            var keyValidators = this.keyFieldOpts.validators || [];
            keyValidators.push(_.bind(this.uniqueKeyValidator, this));
            var keyField = WebvsEd.makeField(this.keyFieldOpts, {
                parent: this,
                required: true,
                validators: keyValidators,
            });
            var valField = WebvsEd.makeField(this.valFieldOpts, {parent: this});
            var itemHtml = $(this.itemTemplate());
            this.$closest(".keyvalItems").append(itemHtml);
            itemHtml.find(".itemBody").append(keyField.el).append(valField.el);

            var fieldsEntry = {
                keyField: keyField,
                valField: valField
            };
            this.fields.push(fieldsEntry);

            if(!(_.isUndefined(key) || _.isUndefined(value))) {
                keyField.setValue(key);
                valField.setValue(value);
            }

            return fieldsEntry;
        },

        getValue: function() {
            var value = WebvsEd.ContainerField.prototype.getValue.apply(this, arguments);
            return _.object(value);
        },

        remove: function() {
            for(var i = 0;i < this.fields.length;i++) {
                this.fields[i].keyField.remove();
                this.fields[i].valField.remove();
            }
            WebvsEd.ContainerField.prototype.remove.apply(this, arguments);
        },

        rebuildValue: function() {
            var value = {};
            for(var i = 0;i < this.fields.length;i++) {
                var field = this.fields[i];
                value[field.keyField.getValue()] = field.valField.getValue();
            }
            this.cleanAndTrigger(value);
        },

        // event handlers
        handleAddItem: function() {
            var entry = this.addItem();
            entry.keyField.$el.addClass("key");
            if(entry.keyField.valid && entry.valField.valid) {
                this.rebuildValue();
            }
        },

        handleRemoveItem: function(event) {
            var itemHtml = $(event.target).closest(".keyvalItem");
            var index = itemHtml.index();
            var field = this.fields.splice(index, 1)[0];
            field.keyField.remove();
            field.valField.remove();
            itemHtml.remove();
            this.rebuildValue();
        },

        handleChange: function(event, field, value) {
            var target = $(event.target);
            var index = target.closest(".keyvalItem").index();
            if(this.fields[index].keyField.valid && this.fields[index].valField.valid) {
                this.rebuildValue();
            }
        }

    });

})(jQuery, _, Backbone);
