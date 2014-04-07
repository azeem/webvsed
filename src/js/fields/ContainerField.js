(function($, _, Backbone) {

    WebvsEd.ContainerField = WebvsEd.Field.extend({
        tagName: "fieldset",

        baseTemplate: _.template([
            "<% if(title) { %>",
            "    <legend class='title'><%= title %></legend>",
            "<% } %>",
            "<div class='content'>",
            "    <div class='fieldBody'></div>",
            "    <ul class='messages ui-state-error ui-corner-all'></ul>",
            "</div>"
        ].join("")),

        events: _.extend({
            "click .title": "toggleCollapse"
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            if(opts.collapsible) {
                this.collapsible = true;
                this.startCollapsed = opts.collapsed?true:false;
            }
            WebvsEd.Field.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WebvsEd.Field.prototype.render.apply(this, arguments);
            if(this.startCollapsed) {
                this.$closest(".content").hide();
            }
        },

        toggleCollapse: function() {
            if(!this.collapsible) {
                return;
            }
            this.$closest(".content").slideToggle();
        }
    });

})(jQuery, _, Backbone);
