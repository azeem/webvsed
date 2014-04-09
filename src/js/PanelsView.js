(function($, _, Backbone) {

    WebvsEd.PanelsView = Backbone.View.extend({
        className: WebvsEd.getClass("panels"),

        template: _.template([
            "<div class='tabs'>",
            "    <ul></ul>",
            "</div>",
            "<ul class='ctxtMenu'>",
            "    <li class='pop'><a href='#'><span class='ui-icon ui-icon-arrowthick-1-ne'></span>Popout</a></li>",
            "    <li class='close'><a href='#'><span class='ui-icon ui-icon-close'></span>Close</a></li>",
            "</ul>"
        ].join("")),

        tabTemplate: _.template(
            "<li data-webvsed-node-id='<%= node.id %>'><a href='#webvsed-<%= node.id %>'><%= node.name %></a></li>"
        ),

        panelTemplate: _.template(
            "<div data-webvsed-node-id='<%= node.id %>' class='panel' id='webvsed-<%= node.id %>'></div>"
        ),

        popMenuTextTemplate: _.template([
            "<% if(tab) { %>",
            "    <span class='ui-icon ui-icon-arrowthick-1-ne'></span>Pop Out",
            "<% } else { %>",
            "    <span class='ui-icon ui-icon-arrowthick-1-sw'></span>Pop In",
            "<% } %>"
        ].join("")),

        events: {
            "contextmenu > .tabs ul li": "handleTabCtxtMenu",
            "click > .ctxtMenu .close":  "handleMenuClose",
            "click > .ctxtMenu .pop":    "handleMenuPop",
            "tabsactivate > .tabs":      "handlePanelActivate",
            "dialogbeforeclose":         "handleDialogClose",
            "contextmenu > .ui-dialog .ui-dialog-titlebar": "handleDialogCtxtMenu",
            "click > .tabs ul .ui-state-active": "handlePanelActivate",
            "mousedown > .tabs .panel":          "handlePanelActivate",
            "mousedown > .ui-dialog":            "handlePanelActivate"
        },

        initialize: function() {
            this.panelInfo = {};
            this.panelOrder = [];
            this.render();
        },

        render: function() {
            this.$el.append(this.template());

            this.tabs = this.$el.children(".tabs");
            this.tabs.tabs({
                heightStyle: "fill"
            });

            this.tabList = tabs.children().first();

            this.ctxtMenu = this.$el.children(".ctxtMenu");
            this.ctxtMenu.menu().hide().css("position", "absolute");
        },

        showCtxtMenu: function(id, x, y) {
            var panelInfo = this.panelInfo[id];
            var popMenuEntry = this.ctxtMenu.find(".pop a");
            popMenuEntry.html(this.popMenuTextTemplate({tab: panelInfo.tab?true:false});
            this.ctxtMenuPanel = id;
            this.ctxtMenu.css({left: x, top: y}).show();
        },

        closePanel: function(id) {
            var panelInfo = this.panelInfo[id];

            panelInfo.form.remove();
            if(panelInfo.tab) {
                panelInfo.panel.remove();
                panelInfo.tab.remove();
                this.tabs.tabs("refresh");
            } else {
                panelInfo.panel.dialog("destroy").remove();
            }

            this.panelInfo[id] = undefined;
            this.panelOrder.splice(this.panelOrder.indexOf(id), 1);

            this.activatePanel();
        },

        activatePanel: function() {
            var panelInfo;
            if(id) {
                // move the given id to the end of the order
                this.panelOrder.splice(this.panelOrder.indexOf(id), 1);
                this.panelOrder.push(id);
                panelInfo = this.panelInfo[id];
            } else {
                panelInfo = this.panelInfo[this.panelOrder[this.panelOrder.length-1]];
            }

            // reset panelstate
            var panelstateClassName = WebvsEd.getClass("panelstate-active");
            this.tabList.children().removeClass(panelstateClassName);
            this.$(".ui-dialog").removeClass(panelstateClassName);

            // set the panelstate class
            if(panelInfo.tab) {
                panelInfo.tab.addClass(panelstateClassName);
                this.tabs.tabs("option", "active", panelInfo.tab.index());
            } else {
                panelInfo.panel.parent(".ui-dialog").addClass(panelstateClassName);
                panelInfo.panel.dialog("moveToTop");
            }

            this.$el.trigger("panelActivate", panelInfo);
        },

        togglePopPanel: function(id) {
            var panelInfo = this.panelInfo[id];
            if(panelInfo.tab) {
                panelInfo.tab.remove();
                panelInfo.tab = null;
                panelInfo.panel.dialog({
                    title: panelInfo.node.name,
                    appendTo: this.element,
                    width: 500,
                    height: 500
                });
            } else {
                panelInfo.panel.dialog("destroy").appendTo(this.tabs);
                var node = panelInfo.node;
                var tab = $(this.tabTemplate({node: node}));
                this.tabList.append(tab);
                panelInfo.tab = tab;
            }
            this.tabs.tabs("refresh");
            this.activatePanel();
        },

        getCurrentPanel: function() {
            return this.panelInfo[this.panelOrder[this.panelOrder.length-1]];
        },

        showPanel: function(node) {
            var panelInfo = this.panelInfo[node.id];
            if(!panelInfo) {
                var tab = this.tabTemplate({node: node});
                this.tabList.append(tab);
                var panel = this.panelTemplate({node: node});
                this.tabs.append(panel);

                var componentClass = node.component.constructor.Meta.name;
                var formDef = WebvsEd.FormDefs[componentClass] || WebvsEd.FormDefs.Default;
                var form = WebvsEd.makeField(formDef);
                panel.append(form.el);

                this.panelInfo[node.id] = {
                    node: node,
                    tab: tab,
                    panel: panel,
                    form: form
                };

                this.panelOrder.push(node.id);

                // refresh and set the active tab
                this.tabs.tabs("refresh");
                this.activatePanel();
            } else {
                this.activatePanel(node.id);
            }
        },

        updateTitle: function() {
            var panelInfo = this.panelInfo[id];
            var title = panelInfo.node.component.id;
            if(panelInfo) {
                if(panelInfo.tab) {
                    panelInfo.tab.children().text(title);
                } else {
                    panelInfo.panel.dialog("option", "title", title);
                }
            }
        },

        // event handlers

        handleTabCtxtMenu: function(event) {
            var tab = $(event.target);
            if(tab.index() !== 0) {
                this.showCtxtMenu(tab.data("webvsedNodeId"), event.pageX, event.pageY);
            }
            event.preventDefault();
        },

        handleMenuClose: function(event) {
            this.closePanel(this.ctxtMenuPanel);
            event.preventDefault();
        },

        handleMenuPop: function(event) {
            this.togglePopPanel(this.ctxtMenuPanel);
            event.preventDefault();
        },

        handleDialogClose: function(event) {
            var id = $(event.target).data("webvsedNodeId");
            this.closePanel(id);
        },

        handleDialogCtxtMenu: function(event) {
            var id = $(event.target).next().data("webvsedNodeId");
            this.showCtxtMenu(id, event.pageX, event.pageY);
            event.preventDefault();
        },

        handlePanelActivate: function(event) {
            if(event.originalEvent) { // don't run for tabs refresh
                var target = $(event.target);
                var id = target.data("webvsedNodeId");

                if(!id) { // this event is from a dialog
                    var panel = target.find(".panel");
                    if(panel.length === 0) {
                        return;
                    }
                    id = panel.data("webvsedNodeId");
                }

                this.activatePanel(id);
            }
        }
    });

})(jQuery, _, Backbone);
