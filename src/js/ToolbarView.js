(function($, _, Backbone) {

    WebvsEd.ToolbarView = Backbone.View.extend({
        className: Webved.getClass("toolbar"),

        template: _.template([
            "<div class='buttonset'>",
            "    <button data-webvsed-icon='ui-icon-plus' class='insert'>Add New</button>",
            "    <button data-webvsed-icon='ui-icon-minus' class='remove'>Remove</button>",
            "</div>",
            "<button data-webvsed-icon='ui-icon-close' class='close'>Close Panel</button>",
            "<button data-webvsed-icon='ui-icon-extlink' class='pop'>Pop Out</button>",
        ].join("")),

        events: {
            "click .insert" : "handleToolbarInsert",
            "click .remove" : "handleToolbarRemove",
            "click .close"  : "handleToolbarClose",
            "click .pop"    : "handleToolbarPop"
        },

        initialize: function(opts) {
            this.tabsView = opts.tabsView;
        },

        render: function() {
            this.$el.append(this.template());
            this.addMenu = $(WebvsEd.buildAddComponentMenu());
            this.$el.append(this.addMenu);

            // Build Toolbar buttons
            this.$("button").each(function() {
                var button = $(this);
                button.button({
                    icons: {
                        primary: button.data("webvsedIcon")
                    },
                    text: false
                });
            });
            this.$(".buttonset").each(function() {
                $(this).buttonset();
            });

            // hide menu on click anywhere
            $("body").on("click", _.bind(function() {
                this.addMenu.hide();
            }, this));

            this.listenTo(this.tabsView, "panelActivate", this.handlePanelActivate);
        },

        // event handlers
        handleToolbarInsert: function(event) {
            var button = $(event.target);
            var offset = button.offset();
            offset.top += button.outerHeight();
            this.addMenu.css({left: offset.left, top: offset.top}).show();
            event.stopPropagation(); // prevent context menu hide from firing
        },

        handleToolbarRemove: function() {
            var node = this.panelView.getCurrentPanel();
            if(!window.confirm("Remove '" + node.name + "'?")) {
                return;
            }
            var component = node.component.parent.detachComponent(node.component.id);
            component.destroy();
        },
        
        handleToolbarClose: function() {
            var panelId = this.tabsView.getCurrentPanel().id;
            this.tabsView.closePanel(panelId);
        },

        handleToolbarPop: function() {
            var panelId = this.tabsView.getCurrentPanel().id;
            this.tabsView.togglePopPanel(panelId);
        },

        handleToolbarAdd: function(event) {
            var node = this.panels.getCurrentPanel().node;
            this.addNewComponent($(event.target).data("webvsedComponentName"), node);
            event.preventDefault();
        },

        handlePanelActivate: function(panelInfo) {
            // set the toolbar button states
            this.$("button").button("option", "disabled", false);
            if(panelInfo.panelView instanceof WebvsEd.MainPanelView) {
                this.$(".remove,.close,.pop").button("option", "disabled", true);
            }
            var popButtonOptions;
            if(panel.tab) {
                popButtonOptions = {icons:{primary: "ui-icon-arrowthick-1-ne"}, label:"Pop Out"};
            } else {
                popButtonOptions = {icons:{primary: "ui-icon-arrowthick-1-sw"}, label:"Pop In"};
            }
            this.$(".pop").button("option", popButtonOptions);
        }

    });
    
})(jQuery, _, Backbone);
