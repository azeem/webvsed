(function($, _, Backbone) {

    WebvsEd.ArrayField = WebvsEd.ContainerField.extend({
        fieldName: "ArrayField",

        arrayTemplate: _.template([
            "<div class='controls'>",
            "    <button class='addItem ui-button' title='Add Item'>",
            "        <span class='ui-icon ui-icon-plus'></span>",
            "    </button>",
            "</div>",
            "<div class='arrayItems items'>",
            "</div>",
        ].join("")),

        itemTemplate: _.template([
            "<div class='arrayItem item'>",
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

        events: _.extend({
            "click .addItem": "handleAddItem",
            "click .removeItem": "handleRemoveItem",
            "valueChange .arrayItem": "handleChange",
            "sortstart .arrayItems": "handleSortStart",
            "sortstop .arrayItems": "handleSortStop"
        }, WebvsEd.ContainerField.prototype.events),

        initialize: function(opts) {
            this.arrayItemOpts = opts.arrayItem;

            this.fields = [];
            WebvsEd.ContainerField.prototype.initialize.apply(this, arguments);
        },

        addItem: function(value) {
            var field = WebvsEd.makeField(this.arrayItemOpts, this);
            var item = $(this.itemTemplate());
            this.$closest(".arrayItems").append(item);
            item.find(".itemBody").append(field.el);

            this.fields.push(field);
            if(value) {
                field.setValue(value);
            }
            return field;
        },

        render: function() {
            WebvsEd.ContainerField.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.arrayTemplate());
            this.$closest(".arrayItems").sortable({
                handle: ".movehandle"
            });
        },

        renderValue: function() {
            this.$closest(".arrayItems").empty();
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
            if(field.valid) {
                this.cleanAndTrigger();
            }
        },

        handleRemoveItem: function(event) {
            var item = $(event.target).closest(".arrayItem");
            var index = item.index();
            this.value.splice(index, 1);
            var field = this.fields.splice(index, 1)[0];
            field.remove();
            item.remove();
            this.cleanAndTrigger();
        },

        handleChange: function(event, field, itemValue) {
            var index = $(event.target).closest(".arrayItem").index();
            this.value[index] = itemValue;
            this.cleanAndTrigger();
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

            this.cleanAndTrigger();
        }
    });

})(jQuery, _, Backbone);
