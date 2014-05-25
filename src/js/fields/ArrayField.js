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
            "sortstart .arrayItems": "handleSortStart",
            "sortstop .arrayItems": "handleSortStop"
        }, WebvsEd.ContainerField.prototype.events),

        initialize: function(opts) {
            this.arrayItemOpts = opts.arrayItem;

            this.fields = [];
            WebvsEd.ContainerField.prototype.initialize.call(this, opts);
        },

        addItem: function(value) {
            var key = this.fields.length;
            var field = WebvsEd.makeField(this.arrayItemOpts, {parent: this, key: key});
            var item = $(this.itemTemplate());
            this.$closest(".arrayItems").append(item);
            item.find(".itemBody").append(field.el);
            field.render();

            this.fields.push(field);
            if(value) {
                field.setValue(value);
            }
            this.listenTo(field, "valueChange", this.handleChange);
            return field;
        },

        renderField: function() {
            WebvsEd.ContainerField.prototype.renderField.call(this);
            this.fieldBody.append(this.arrayTemplate());
            this.$closest(".arrayItems").sortable({
                handle: ".movehandle"
            });
        },

        renderValue: function() {
            var i;
            // remove all existing fields
            for(i = 0;i < this.fields.length;i++) {
                this.fields[i].remove();
            }
            this.fields = [];
            this.$closest(".arrayItems").empty();

            // create new fields
            if(this.value) {
                for(i = 0;i < this.value.length;i++){
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

        remove: function() {
            for(var i = 0;i < this.fields.length;i++) {
                this.fields[i].remove();
            }
            WebvsEd.ContainerField.prototype.remove.call(this, arguments);
        },

        rebuildValue: function() {
            var value = [];
            for(var i = 0;i < this.fields.length;i++) {
                value.push(this.fields[i].getValue());
            }
            this.cleanAndTrigger(value);
        },

        resetKeys: function() {
            for(var i = 0;i < this.fields.length;i++) {
                this.fields[i].setKey(i);
            }
        },

        //events

        handleAddItem: function() {
            var field = this.addItem();
            if(field.valid) {
                this.rebuildValue();
            }
        },

        handleRemoveItem: function(event) {
            var item = $(event.target).closest(".arrayItem");
            var index = item.index();
            var field = this.fields.splice(index, 1)[0];
            field.remove();
            item.remove();
            this.resetKeys();
            this.rebuildValue();
        },

        handleChange: function() {
            this.rebuildValue();
        },

        handleSortStart: function(event, ui) {
            this.sortStartIndex = ui.item.index();
        },

        handleSortStop: function(event, ui) {
            var sortStopIndex = ui.item.index();
            var field = this.fields[this.sortStartIndex];

            this.fields.splice(this.sortStartIndex, 1);
            this.fields.splice(sortStopIndex, 0, field);

            this.resetKeys();
            this.rebuildValue();
        }
    });

})(jQuery, _, Backbone);
