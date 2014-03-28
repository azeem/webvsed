(function($) {
    $.widget("webvs.webvspanels", {
        _create: function() {
            this.panelInfo = {};
            this.panelOrder = [];

            this._renderUI();
            this._bind();
        },
        
        _renderUI: function() {
            var tabs = $([
                "<div class='webvsed-tabs'>",
                "    <ul></ul>",
                "</div>",
            ].join(""));
            this.element.append(tabs);
            tabs.tabs({
                heightStyle: "fill"
            });

            var panelCtxMenu = $([
                "<ul class='webvsed-ctxmenu'>",
                "    <li class='webvsed-tabctx-pop'><a href='#'><span class='ui-icon ui-icon-arrowthick-1-ne'></span>Popout</a></li>",
                "    <li class='webvsed-tabctx-close'><a href='#'><span class='ui-icon ui-icon-close'></span>Close</a></li>",
                "</ul>"
            ].join(""));
            panelCtxMenu.menu().hide().css("position", "absolute");
            this.element.append(panelCtxMenu);

            this.tabs = tabs;
            this.tabList = tabs.children().first();
            this.panelCtxMenu = panelCtxMenu;
        },

        _bind: function() {
            var _this = this;
            this.tabList.on("contextmenu", "li", function(event) {
                var tab = $(this);
                if(tab.index() !== 0) {
                    _this._showPanelCtxMenu(tab.data("webvsedNodeId"), event.pageX, event.pageY);
                }
                event.preventDefault();
            });
            this.panelCtxMenu.children(".webvsed-tabctx-close").on("click", function(event) {
                _this.closePanel(_this.panelCtxMenuPanel);
                event.preventDefault();
            });
            this.panelCtxMenu.children(".webvsed-tabctx-pop").on("click", function(event) {
                _this.popPanel(_this.panelCtxMenuPanel);
                event.preventDefault();
            });

            $("body").on("click", function(event) {
                _this.panelCtxMenu.hide();
                _this.panelCtxMenuPanel = null;
            });

            // select tree item when tab is selected
            this.tabs.on("tabsactivate", function(event, ui) {
                if(event.originalEvent) { // don't run for tabs refresh
                    _this.activatePanel(ui.newTab.data("webvsedNodeId"));
                }
            });

            // dialog event
            this.element.on("dialogbeforeclose", function(event, ui) {
                var id = $(event.target).data("webvsedNodeId");
                _this.closePanel(id);
            });
            this.element.on("contextmenu", ".ui-dialog .ui-dialog-titlebar", function(event) {
                _this._showPanelCtxMenu($(this).next().data("webvsedNodeId"), event.pageX, event.pageY);
                event.preventDefault();
            });

            // Panel focus events
            this.tabList.on("click", ".ui-state-active", function() {
                _this.activatePanel($(this).data("webvsedNodeId"));
            });
            this.element.on("mousedown", ".webvsed-panel", function(event) {
                _this.activatePanel($(this).data("webvsedNodeId"));
            });
            this.element.on("mousedown", ".ui-dialog", function(event) {
                _this.activatePanel($(this).find(".webvsed-panel").data("webvsedNodeId"));
            });
        },

        _showPanelCtxMenu: function(id, x, y) {
            var panelInfo = this.panelInfo[id];
            var popMenuEntry = this.panelCtxMenu.find(".webvsed-tabctx-pop a");
            if(panelInfo.tab) {
                popMenuEntry.html("<span class='ui-icon ui-icon-arrowthick-1-ne'></span>Pop Out");
            } else {
                popMenuEntry.html("<span class='ui-icon ui-icon-arrowthick-1-sw'></span>Pop In");
            }
            this.panelCtxMenuPanel = id;
            this.panelCtxMenu.css({left: x, top: y}).show();
        },

        getCurrentPanel: function() {
            return this.panelInfo[this.panelOrder[this.panelOrder.length-1]];
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

        activatePanel: function(id) {
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
            this.tabList.children().removeClass("webvsed-panelstate-active");
            this.element.find(".ui-dialog").removeClass("webvsed-panelstate-active");

            // set the panelstate class
            if(panelInfo.tab) {
                panelInfo.tab.addClass("webvsed-panelstate-active");
                this.tabs.tabs("option", "active", panelInfo.tab.index());
            } else {
                panelInfo.panel.parent(".ui-dialog").addClass("webvsed-panelstate-active");
                panelInfo.panel.dialog("moveToTop");
            }

            this.element.trigger("panelActivate", panelInfo);
        },

        popPanel: function(id) {
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
                var tab = $("<li data-webvsed-node-id='"+node.id+"'><a href='#webvsed-"+node.id+"'>"+node.name+"</a></li>");
                this.tabList.append(tab);
                panelInfo.tab = tab;
            }
            this.tabs.tabs("refresh");
            this.activatePanel();
        },

        closePanel: function(id) {
            var panelInfo = this.panelInfo[id];

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

        showPanel: function(node) {
            var panelInfo = this.panelInfo[node.id];
            if(!panelInfo) {
                // create the tab
                var tab = $("<li data-webvsed-node-id='"+node.id+"'><a href='#webvsed-"+node.id+"'>"+node.name+"</a></li>");
                this.tabList.append(tab);

                // create the tab panel
                var panel = $("<div data-webvsed-node-id='"+node.id+"' class='webvsed-panel' id='webvsed-"+node.id+"'></div>");
                this.tabs.append(panel);

                // create form inside tab panel
                var componentClass = node.component.constructor.Meta.name;
                var form = $("<div class='webvsed-form'></div>");
                var alpacaOpts;
                if(componentClass in webvsFormdefs) {
                    alpacaOpts = $.extend({data: node.component.opts}, webvsFormdefs[componentClass]);
                } else {
                    var json = node.component.generateOptionsObj();
                    alpacaOpts = $.extend({data: JSON.stringify(json)}, webvsFormdefs.Default);
                    form.addClass("webvsed-default-form");
                }
                form.appendTo(panel).alpaca(alpacaOpts);

                this.panelInfo[node.id] = {
                    node: node,
                    tab: tab,
                    panel: panel
                };

                this.panelOrder.push(node.id);

                // refresh and set the active tab
                this.tabs.tabs("refresh");
                this.activatePanel();
            } else {
                this.activatePanel(node.id);
            }
        }
        
    });
})(jQuery);
