(function($, _, Backbone) {

    WebvsEd.ObjectField = WebvsEd.ContainerField.extend({
        fieldName: "ObjectField",

        objectTemplate: _.template([
            "<div class='objectItems'></div>"
        ].join("")),

        initialize: function(opts) {
            this.fieldOpts = opts.fields;
            this.fields = {};

            WebvsEd.ContainerField.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WebvsEd.ContainerField.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.objectTemplate());

            for(var i = 0;i < this.fieldOpts.length;i++) {
                var field = WebvsEd.makeField(this.fieldOpts[i], {parent: this});
                this.fields[field.key] = field;
                this.$closest(".objectItems").append(field.el);
                this.listenTo(field, "valueChange", this.handleChange);
            }
        },

        getField: function(key) {
            return this.fields[key];
        },

        renderValue: function() {
            for(var key in this.value) {
                var field = this.fields[key];
                if(field) {
                    field.setValue(this.value[key]);
                }
            }
        },

        remove: function() {
            for(var key in this.fields) {
                this.fields[key].remove();
            }
            WebvsEd.ContainerField.prototype.remove.apply(this, arguments);
        },

        rebuildValue: function() {
            var value = {};
            for(var key in this.fields) {
                var field = this.fields[key];
                value[key] = field.getValue();
            }
            this.cleanAndTrigger(value);
        },

        // event handlers

        handleChange: function(field, fieldValue) {
            if(!_.contains(this.fields, field)) {
                return;
            }
            this.rebuildValue();
        }
    });

    _.extend(WebvsEd.ObjectField.prototype, WebvsEd.DotKeyMixin(WebvsEd.ContainerField));

})(jQuery, _, Backbone);
