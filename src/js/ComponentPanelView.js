(function($, _, Backbone) {

    WebvsEd.ComponentPanelView = Backbone.View.extend({
        className: WebvsEd.getClass("component-panel"),

        template: _.template([
            "<div class='header'>",
            "</div>",
            "<div class='body'>",
            "</div>"
        ].join("")),

        initialize: function(opts) {
            this.component = opts.component;
            this.main = opts.main;
        },

        render: function() {
            this.$el.append(this.template());

            this.enableField = new WebvsEd.BooleanField({
                key: "enabled",
                model: this.component
            });
            this.idField = new WebvsEd.TextField({
                key: "id",
                model: this.component,
                validators: [
                    {
                        type: "regex",
                        regex: /^[a-z0-9\-_]+$/i,
                        message: "ID should contain only Alphanumeric, Underscore or Minus"
                    }
                ]
            });

            this.$(".header").append(this.enableField.el).append(this.idField.el);

            var componentClass = this.component.constructor.Meta.name;
            var formDef;
            if(componentClass in WebvsEd.FormDefs) {
                formDef = WebvsEd.FormDefs[componentClass];
            } else {
                formDef = WebvsEd.FormDefs.Default;
            }
            this.componentForm = WebvsEd.makeField(formDef(this.component, this.main));
            this.$(".body").append(this.componentForm.el);
        },

        remove: function() {
            this.enableField.remove();
            this.idField.remove();
            this.componentForm.remove();
            Backbone.View.prototype.remove.call(this);
        }
    });
    
})(jQuery, _, Backbone);
