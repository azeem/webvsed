(function($, _, Backbone) {

    WebvsEd.ObjectField = WebvsEd.ContainerField.extend({
        fieldName: "ObjectField",

        objectTemplate: _.template([
            "<div class='objectItems'></div>"
        ].join("")),

        events: _.extend({
            "valueChange .objectItems": "handleChange",
        }, WebvsEd.ContainerField.prototype.events),

        initialize: function(opts) {
            this.fieldOpts = opts.fields;
            this.fields = {};

            WebvsEd.ContainerField.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WebvsEd.ContainerField.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.objectTemplate());

            for(var i = 0;i < this.fieldOpts.length;i++) {
                var field = WebvsEd.makeField(this.fieldOpts[i]);
                this.fields[field.key] = field;
                this.$closest(".objectItems").append(field.el);
            }
        },

        renderValue: function() {
            for(var key in this.value) {
                var field = this.fields[key];
                if(field) {
                    field.setValue(this.value[key]);
                }
            }
        },

        handleChange: function(event, field, fieldValue) {
            if(!_.contains(this.fields, field)) {
                return;
            }
            if(_.isNull(this.value)) {
                this.value = {}; 
                // TODO: not sure if this is sane behavior
                // fill in values from all fields
                // so that default values get populated
                for(var key in this.fields) {
                    this.value[key] = this.fields[key].getValue();
                }
            }
            this.value[field.key] = fieldValue;
            this.cleanAndTrigger();
        }
    });

})(jQuery, _, Backbone);
