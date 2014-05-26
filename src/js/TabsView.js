(function($, _, Backbone) {

    WebvsEd.TabsView = Backbone.View.extend({
        className: WebvsEd.getClass("tabs-view"),

        template: _.template([
            "<div class='tabs'>",
            "    <ul></ul>",
            "</div>",
        ].join("")),

        tabTemplate: _.template(
            "<li data-webvsed-panel-id='<%= id %>'><a href='#webvsed-panel-<%= id %>'><%= title %></a></li>"
        ),

        panelTemplate: _.template([
            "<div data-webvsed-panel-id='<%= id %>' class='panel' id='webvsed-panel-<%= id %>'>",
            "</div>"
        ].join("")),

        ctxtMenuTemplate: _.template([
            "<ul class='ctxtmenu panelctxtmenu'>",
            "    <li class='pop'><a href='#'><span class='ui-icon ui-icon-arrowthick-1-ne'></span>Popout</a></li>",
            "    <li class='close'><a href='#'><span class='ui-icon ui-icon-close'></span>Close</a></li>",
            "</ul>"
        ].join("")),

        popMenuTextTemplate: _.template([
            "<% if(tab) { %>",
            "    <span class='ui-icon ui-icon-arrowthick-1-ne'></span>Pop Out",
            "<% } else { %>",
            "    <span class='ui-icon ui-icon-arrowthick-1-sw'></span>Pop In",
            "<% } %>"
        ].join("")),

        events: {
            "contextmenu > .tabs ul li": "handleTabCtxtMenu",
            "tabsactivate > .tabs":      "handlePanelActivate",
            "click > .tabs ul .ui-state-active": "handlePanelActivate",
            "mousedown > .tabs .panel":          "handlePanelActivate",
        },

        floatEvents: {
            "click .panelctxtmenu .close":  "handleMenuClose",
            "click .panelctxtmenu .pop":    "handleMenuPop",
            "dialogbeforeclose .ui-dialog": "handleDialogClose",
            "mousedown .ui-dialog":         "handlePanelActivate",
            "contextmenu .ui-dialog .ui-dialog-titlebar": "handleDialogCtxtMenu"
        },

        initialize: function() {
            this.panelInfo = {};
            this.panelOrder = [];
        },

        render: function() {
            this.$el.append(this.template());

            this.tabs = this.$(".tabs");
            this.tabs.tabs({
                heightStyle: "fill"
            });

            this.tabList = this.tabs.find("ul");

            this.ctxtMenu = $(this.ctxtMenuTemplate());
            this.floatContainer.append(this.ctxtMenu);
            this.ctxtMenu.menu().hide().css("position", "absolute");

            $("body").on("click", _.bind(function() {
                this.ctxtMenu.hide();
                this.ctxtMenuPanel = null;
            }, this));
        },

        showCtxtMenu: function(id, x, y) {
            var panelInfo = this.panelInfo[id];
            var popMenuEntry = this.ctxtMenu.find(".pop a");
            popMenuEntry.html(this.popMenuTextTemplate({tab: panelInfo.tab?true:false}));
            this.ctxtMenuPanel = id;
            this.ctxtMenu.css({left: x, top: y}).show();
        },

        closePanel: function(id) {
            var panelInfo = this.panelInfo[id];
            if(!panelInfo) {
                return;
            }

            panelInfo.panelView.remove();
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

        activatePanel: function(id) {
            var panelInfo;
            if(!_.isUndefined(id)) {
                // move the given id to the end of the order
                this.panelOrder.splice(this.panelOrder.indexOf(id), 1);
                this.panelOrder.push(id);
                panelInfo = this.panelInfo[id];
            } else {
                panelInfo = this.getCurrentPanel();
            }

            // reset panelstate
            this.tabList.children().removeClass("panelstate-active");
            this.$(".ui-dialog").removeClass("panelstate-active");

            // set the panelstate class
            if(panelInfo.tab) {
                panelInfo.tab.addClass("panelstate-active");
                this.tabs.tabs("option", "active", panelInfo.tab.index());
            } else {
                panelInfo.panel.parent(".ui-dialog").addClass("panelstate-active");
                panelInfo.panel.dialog("moveToTop");
            }

            this.trigger("panelActivate", panelInfo);
        },

        togglePopPanel: function(id) {
            var panelInfo = this.panelInfo[id];
            if(panelInfo.tab) {
                panelInfo.tab.remove();
                panelInfo.tab = null;
                panelInfo.panel.dialog({
                    title: panelInfo.title,
                    appendTo: this.floatContainer,
                    width: 500,
                    height: 500
                });
            } else {
                panelInfo.panel.dialog("destroy").appendTo(this.tabs);
                var tab = $(this.tabTemplate(panelInfo));
                this.tabList.append(tab);
                panelInfo.tab = tab;
            }
            this.tabs.tabs("refresh");
            this.activatePanel();
        },

        createPanel: function(id, title, panelView) {
            var panelInfo = {
                id: id,
                title: title,
                panelView: panelView
            };

            // create the tab
            panelInfo.tab = $(this.tabTemplate(panelInfo));
            this.tabList.append(panelInfo.tab);

            // create the panel
            panelInfo.panel = $(this.panelTemplate(panelInfo));
            this.tabs.append(panelInfo.panel);
            panelInfo.panel.append(panelView.el);

            this.panelInfo[id] = panelInfo;
            this.panelOrder.push(id);

            this.tabs.tabs("refresh");
            return panelInfo;
        },

        updateTitle: function(id, title) {
            var panelInfo = this.panelInfo[id];
            if(panelInfo) {
                panelInfo.title = title;
                if(panelInfo.tab) {
                    panelInfo.tab.children().text(title);
                } else {
                    panelInfo.panel.dialog("option", "title", title);
                }
            }
        },

        getCurrentPanel: function() {
            return this.panelInfo[this.panelOrder[this.panelOrder.length-1]];
        },

        getPanel: function(id) {
            return this.panelInfo[id];
        },

        // event handlers
        
        handleTabCtxtMenu: function(event) {
            var tab = $(event.currentTarget);
            if(tab.index() !== 0) {
                this.showCtxtMenu(tab.data("webvsedPanelId"), event.pageX, event.pageY);
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

        handlePanelActivate: function(event, ui) {
            var id;
            var target = $(event.currentTarget);
            if(target.is(".tabs")) {
                if(!event.originalEvent) {
                    return; // don't run for tabs refresh
                }
                id = ui.newTab.data("webvsedPanelId");
            } else if(target.is(".panel") || target.is(".tabs ul .ui-state-active")) {
                id = target.data("webvsedPanelId");
            } else if(target.is(".ui-dialog")) {
                id = target.find(".panel").data("webvsedPanelId");
            }
            this.activatePanel(id);
        },

        handleDialogClose: function(event) {
            var id = $(event.target).data("webvsedPanelId");
            this.closePanel(id);
        },

        handleDialogCtxtMenu: function(event) {
            var id = $(event.currentTarget).next().data("webvsedPanelId");
            this.showCtxtMenu(id, event.pageX, event.pageY);
            event.preventDefault();
        }
    });

    WebvsEd.FloatsMixin(WebvsEd.TabsView);

})(jQuery, _, Backbone);
