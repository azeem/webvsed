(function($, _, Backbone) {

    WebvsEd.MainEditorView = Backbone.View.extend({
        className: WebvsEd.getClass("editor", "box"),

        template: _.template([
            "<div class='row1'>",
            "</div>",
            "<div class='row2'>",
            "</div>",
        ].join("")),

        initialize: function(opts) {
            this.width = opts.width || 700;
            this.height = opts.height || 500;
            this.main = opts.webvsMain;
        },

        render: function() {
            this.$el.append(this.template());
            this.toolbar = this.$el.find(".row1 .toolbar");

            this.sidebarView = new WebvsEd.SidebarView({main: this.main});
            this.tabsView = new WebvsEd.TabsView();
            this.$(".row2").append(this.sidebar.el).append(this.tabs.el);

            this.toolbarView = new WebvsEd.ToolbarView({tabsView: this.tabsView});
            this.$(".row1").append(this.toolbarView.el);

            this.listenTo(this.tabsView, "panelActivate", this.handlePanelActivate);
            this.listenTo(this.sidebarView, "resize", this.handleSidebarResize);
            this.listenTo(this.sidebarView, "treeSelect", this.handleTreeSelect);

            this.fixDimensions();
        },

        fixDimensions: function() {
            this.$el.css({
                width: this.width,
                height: this.height
            });
            var row2 = this.$(".row2");
            var row1 = this.$(".row1");
            var tabs = this.tabsView.$el;
            var sidebar = this.sidebarView.$el
            row2.css("height", this.$el.height()-row1.outerHeight());
            panels.css("width", row2.width()-sidebar.outerWidth());
        },

        // event handlers

        handlePanelActivate: function(panelInfo) {
            if(!panelInfo.panelView instanceof WebvsEd.MainPanelView &&
               !panelInfo.panelView instanceof WebvsEd.ComponentPanelView) {
                return;
            }
            this.sidebarView.selectNode(panelInfo.id);
        },

        handleTreeSelect: function(node) {
            var panelInfo = this.tabsView.getPanel(node.id);
            if(!panelInfo) {
                // create panel if not already open
                var panelView = new WebvsEd.ComponentPanelView({component: node.component});
                panelInfo = this.tabsView.createPanel(node.id, node.name, panelView);
            }
            activatePanel(node.id);
        },

        handleSidebarResize: function() {
            this.fixDimensions();
        }
    });

})(jQuery, _, Backbone);
