(function($, _, Backbone) {

    WebvsEd.EditorView = Backbone.View.extend({
        className: WebvsEd.getClass("editor", "box"),

        template: _.template([
            "<div class='row1'>",
            "</div>",
            "<div class='row2'>",
            "</div>",
        ].join("")),

        initialize: function(opts) {
            this.main = opts.webvsMain;
        },

        render: function() {
            this.$el.append(this.template());

            this.tabsView = new WebvsEd.TabsView();
            this.tabsView.render();
            this.sidebarView = new WebvsEd.SidebarView({main: this.main, tabsView: this.tabsView});
            this.sidebarView.render();
            this.$(".row2").append(this.sidebarView.el).append(this.tabsView.el);

            this.toolbarView = new WebvsEd.ToolbarView({tabsView: this.tabsView});
            this.toolbarView.render();
            this.$(".row1").append(this.toolbarView.el);

            this.listenTo(this.sidebarView, "resize", this.handleSidebarResize);

            this.reflow();

            var mainPanelView = new WebvsEd.MainPanelView({main: this.main});
            var rootNode = this.sidebarView.getRootNode();
            this.tabsView.createPanel(rootNode.id, rootNode.name, mainPanelView);
            mainPanelView.render();
            this.tabsView.activatePanel(rootNode.id);
        },

        reflow: function() {
            var row2 = this.$(".row2");
            var row1 = this.$(".row1");
            var tabs = this.tabsView.$el;
            var sidebar = this.sidebarView.$el;
            row2.css("height", this.$el.height()-row1.outerHeight());
            this.tabsView.$el.css("width", row2.innerWidth()-sidebar.outerWidth());
            this.tabsView.reflow();
        },

        // event handlers

        handleSidebarResize: function() {
            this.reflow();
        },
    });

})(jQuery, _, Backbone);
