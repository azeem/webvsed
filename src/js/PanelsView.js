(function($, _, Backbone) {

    WebvsEd.PanelsView = Backbone.View.extend({
        className: WebvsEd.getClass("panels"),

        template: _.template([
            "<div class='tabs'>",
            "    <ul></ul>",
            "</div>",
            "<ul class='ctxtmenu panelctxtmenu'>",
            "    <li class='pop'><a href='#'><span class='ui-icon ui-icon-arrowthick-1-ne'></span>Popout</a></li>",
            "    <li class='close'><a href='#'><span class='ui-icon ui-icon-close'></span>Close</a></li>",
            "</ul>"
        ].join("")),

        tabTemplate: _.template(
            "<li data-webvsed-node-id='<%= node.id %>'><a href='#webvsed-<%= node.id %>'><%= node.name %></a></li>"
        ),

        panelTemplate: _.template([
            "<div data-webvsed-node-id='<%= node.id %>' class='panel' id='webvsed-<%= node.id %>'>",
            "    <%= header %>",
            "    <div class='body'>",
            "    </div>",
            "</div>"
        ].join("")),

        popMenuTextTemplate: _.template([
            "<% if(tab) { %>",
            "    <span class='ui-icon ui-icon-arrowthick-1-ne'></span>Pop Out",
            "<% } else { %>",
            "    <span class='ui-icon ui-icon-arrowthick-1-sw'></span>Pop In",
            "<% } %>"
        ].join("")),

        headerTemplate: _.template([
            "<% if(node.component.id !== 'root') { %>",
            "    <div class='header'>",
            "        <input name='enabled' <%= (node.component.enabled)?'checked=\\'checked\\'':'' %> type='checkbox'/>",
            "        <input name='id' type='text' value='<%= node.component.id %>'/>",
            "    </div>",
            "<% } %>",
        ].join("")),

        headerErrorTemplate: _.template("<div class='message ui-state-error ui-corner-all'><%= message %></div>"),

        events: {
            "contextmenu > .tabs ul li": "handleTabCtxtMenu",
            "click > .panelctxtmenu .close":  "handleMenuClose",
            "click > .panelctxtmenu .pop":    "handleMenuPop",
            "tabsactivate > .tabs":      "handlePanelActivate",
            "dialogbeforeclose":         "handleDialogClose",
            "contextmenu > .ui-dialog .ui-dialog-titlebar": "handleDialogCtxtMenu",
            "click > .tabs ul .ui-state-active": "handlePanelActivate",
            "mousedown > .tabs .panel":          "handlePanelActivate",
            "mousedown > .ui-dialog":            "handlePanelActivate",

            "change > .tabs > .panel .header input":     "handlePanelHeaderChange",
            "change > .ui-dialog > .panel .header input":     "handlePanelHeaderChange",

            "valueChange > .tabs > .panel":     "handlePanelValueChange",
            "valueChange > .ui-dialog > .panel":     "handlePanelValueChange"
        },

        initialize: function(opts) {
            this.panelInfo = {};
            this.panelOrder = [];
            this.webvsMain = opts.webvsMain;
        },

        render: function() {
            this.$el.append(this.template());

            this.tabs = this.$el.children(".tabs");
            this.tabs.tabs({
                heightStyle: "fill"
            });

            this.tabList = this.tabs.find("ul");

            this.ctxtMenu = this.$el.children(".ctxtmenu");
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

        activatePanel: function(id) {
            var panelInfo;
            if(!_.isUndefined(id)) {
                // move the given id to the end of the order
                this.panelOrder.splice(this.panelOrder.indexOf(id), 1);
                this.panelOrder.push(id);
                panelInfo = this.panelInfo[id];
            } else {
                panelInfo = this.panelInfo[this.panelOrder[this.panelOrder.length-1]];
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

            this.$el.trigger("panelActivate", panelInfo);
        },

        togglePopPanel: function(id) {
            var panelInfo = this.panelInfo[id];
            if(panelInfo.tab) {
                panelInfo.tab.remove();
                panelInfo.tab = null;
                panelInfo.panel.dialog({
                    title: panelInfo.node.name,
                    appendTo: this.el,
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
                var tab = $(this.tabTemplate({node: node}));
                this.tabList.append(tab);
                var panelHeader = this.headerTemplate({node: node});
                var panel = $(this.panelTemplate({node: node, header: panelHeader}));
                this.tabs.append(panel);

                var componentClass = node.component.constructor.Meta.name;
                var form;
                var isDefaultForm = false;
                var isRootForm = false;
                if(node.component.id == "root") {
                    form = WebvsEd.makeField(WebvsEd.FormDefs.Main);
                    isRootForm = true;
                } else if(componentClass in WebvsEd.FormDefs) {
                    form = WebvsEd.makeField(WebvsEd.FormDefs[componentClass]);
                } else {
                    form = WebvsEd.makeField(WebvsEd.FormDefs.Default);
                    isDefaultForm = true;
                }
                panel.find(".body").append(form.el);

                this.panelInfo[node.id] = {
                    node: node,
                    tab: tab,
                    panel: panel,
                    form: form,
                    isDefaultForm: isDefaultForm,
                    isRootForm: isRootForm
                };

                this.panelOrder.push(node.id);

                this.updateForm(node.id);

                // refresh and set the active tab
                this.tabs.tabs("refresh");
                this.activatePanel();
            } else {
                this.activatePanel(node.id);
            }
        },

        updateTitle: function(id) {
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

        setHeaderError: function(id, state, message) {
            var panelInfo = this.panelInfo[id];
            var header = panelInfo.panel.find(".header");
            header.find(".message").remove();
            if(state) {
                header.addClass("error");
                if(message) {
                    header.append(this.headerErrorTemplate({message: message}));
                }
            } else {
                header.removeClass("error");
            }
        },

        updateHeader: function(id) {
            var panelInfo = this.panelInfo[id];
            panelInfo.panel.find(".header").replaceWith(this.headerTemplate({node: panelInfo.node}));
        },

        updateForm: function(id) {
            var panelInfo = this.panelInfo[id];
            if(panelInfo.isDefaultForm) {
                var json = panelInfo.node.component.generateOptionsObj();
                panelInfo.form.setValue(json);
            } else if(panelInfo.isRootForm) {
                panelInfo.form.setValue(panelInfo.node.component.opts);
                panelInfo.form.getField("meta").setValue(this.webvsMain.meta);
            } else {
                panelInfo.form.setValue(panelInfo.node.component.opts);
            }
        },

        isDefaultForm: function(id) {
            return this.panelInfo[id].isDefaultForm;
        },

        // event handlers

        handleTabCtxtMenu: function(event) {
            var tab = $(event.currentTarget);
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
            var id = $(event.currentTarget).next().data("webvsedNodeId");
            this.showCtxtMenu(id, event.pageX, event.pageY);
            event.preventDefault();
        },

        handlePanelActivate: function(event, ui) {
            var id;
            var target = $(event.currentTarget);
            if(target.is(".tabs")) {
                if(!event.originalEvent) {
                    return; // don't run for tabs refresh
                }
                id = ui.newTab.data("webvsedNodeId");
            } else if(target.is(".panel") || target.is(".tabs ul .ui-state-active")) {
                id = target.data("webvsedNodeId");
            } else if(target.is(".ui-dialog")) {
                id = target.find(".panel").data("webvsedNodeId");
            }
            this.activatePanel(id);
        },

        handlePanelHeaderChange: function(event) {
            var input = $(event.target);
            var id = input.closest(".panel").data("webvsedNodeId");
            var panelInfo = this.panelInfo[id];
            var name = input.attr("name");
            var value;
            if(input.attr("type") == "checkbox") {
                value = input.is(":checked");
            } else {
                value = input.val();
            }
            this.$el.trigger("headerChange", {
                name: name,
                value: value,
                node: panelInfo.node,
                isDefaultForm: panelInfo.isDefaultForm
            });
        },

        handlePanelValueChange: function(event, field, value) {
            var id = field.$el.closest(".panel").data("webvsedNodeId");
            var panelInfo = this.panelInfo[id];
            this.$el.trigger("panelValueChange", {
                node: panelInfo.node,
                field: field,
                value: value,
                isDefaultForm: panelInfo.isDefaultForm
            });
        }
    });

})(jQuery, _, Backbone);
