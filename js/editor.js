(function($) {

    $.widget("webvs.webvseditor", {
        options: {
            width: 700,
            height: 500
        },

        _create: function() {
            this.panelInfo = {};

            this._renderUI();
            this._bind();
        },

        /**
         * Builds the UI DOM and initializes it
         */
        _renderUI: function() {
            var box = $([
                "<div class='webvsed-box'>",
                "    <div class='webvsed-row1'>",
                "        <div class='webvsed-toolbar'>",
                "        </div>",
                "    </div>",
                "    <div class='webvsed-row2'>",
                "        <div class='webvsed-pane'>",
                "            <div class='webvsed-tabs'>",
                "                <ul></ul>",
                "            </div>",
                "        </div>",
                "        <div class='webvsed-sidebar'>",
                "            <div class='webvsed-tree'></div>",
                "        </div>",
                "    </div>",
                "</div>"
            ].join(""));
            this.element.append(box);

            var tabCtxMenu = $([
                "<ul class='webvsed-ctxmenu'>",
                "    <li class='webvsed-tabctx-popout'><a href='#'><span class='ui-icon ui-icon-extlink'></span>Popout</a></li>",
                "    <li class='webvsed-tabctx-close'><a href='#'><span class='ui-icon ui-icon-close'></span>Close</a></li>",
                "</ul>"
            ].join(""));
            tabCtxMenu.menu().hide().css("position", "absolute");
            $("body").append(tabCtxMenu);

            var treeCtxMenu = this._buildTreeMenu();
            treeCtxMenu.menu().hide().css("position", "absolute");
            $("body").append(treeCtxMenu);

            this.tabCtxMenu = tabCtxMenu;
            this.treeCtxMenu = treeCtxMenu;
            this.box = box;
            this.row1 = box.children(".webvsed-row1");
            this.row2 = box.children(".webvsed-row2");

            this.sidebar = this.row2.children(".webvsed-sidebar");
            this.tree = this.sidebar.children(".webvsed-tree");

            this.pane = this.row2.children(".webvsed-pane");
            this.tabs = this.pane.find(".webvsed-tabs");
            this.tabList = this.tabs.children("ul");

            this.sidebar.resizable({
                handles: "e"
            });
            this.tree.tree({
                data:[this._buildTree(this.options.webvsMain.rootComponent)]
            });

            this.tabs.tabs({
                heightStyle: "fill"
            });

            this._fixDimensions();

            this._showTab(this.tree.tree("getNodeById", "root"));
        },

        /**
         * Bind events
         */
        _bind: function() {
            var this_ = this;

            // Tab context Menu events
            this.tabList.on("contextmenu", "li", function(event) {
                this_._showTabCtxMenu($(this), event.pageX, event.pageY);
                event.preventDefault();
            });
            this.tabCtxMenu.children(".webvsed-tabctx-close").on("click", function(event) {
                this_._closeTab(this_.menuBoundTab);
                event.preventDefault();
            });
            this.tabCtxMenu.children(".webvsed-tabctx-popout").on("click", function(event) {
                this_._closeTab(this_.menuBoundTab, true);
                event.preventDefault();
            });

            // Tree context menu events
            this.tree.on("tree.contextmenu", function(event) {
                this_._showTreeCtxMenu(event.node, event.click_event.pageX, event.click_event.pageY);
            });

            // Hide all context menus
            $("body").on("click", function(event) {
                this_.tabCtxMenu.hide();
                this_.treeCtxMenu.hide();
            });

            // fix dimensions when sidebar is resized
            this.sidebar.on("resize", function() {
                this_._fixDimensions();
            });

            // show tab when tree item is selected
            this.tree.on("tree.select", function(event) {
                if(event.node) {
                    this_._showTab(event.node);
                }
            });

            // select tree item when tab is selected
            this.tabs.on("tabsactivate", function(event, ui) {
                if(event.originalEvent) { // don't run for tabs refresh
                    this_._activatePanel(ui.newTab.data("webvsedComponentId"));
                }
            });

            this.box.on("dialogbeforeclose", function(event, ui) {
                var panel = $(event.target);
                var id = panel.data("webvsedComponentId");
                this_.panelInfo[id] = undefined;
                var newActivePanel = this_.tabList.children(".ui-state-active").data("webvsedComponentId");
                this_._activatePanel(newActivePanel);
            });

            this.tabList.on("click", ".ui-state-active", function() {
                this_._activatePanel($(this).data("webvsedComponentId"));
            });
            this.box.on("mousedown", ".webvsed-panel", function(event) {
                this_._activatePanel($(this).data("webvsedComponentId"));
            });
            this.box.on("mousedown", ".ui-dialog", function(event) {
                this_._activatePanel($(this).find(".webvsed-panel").data("webvsedComponentId"));
            });

            // set option in webvs when form value changes
            this.box.on("change", ".webvsed-form", function(event) {
                this_._setWebvsOption($(this), $(event.target));
            });
        },

        _slugify: function(str) {
            return $.trim(str).toLowerCase().replace(/\s+/, "_");
        },

        _buildTreeMenu: function() {
            var treeCtxMenu = $([
                "<ul class='webvsed-ctxmenu'>",
                "    <li class='webvsed-treectx-insert'><a href='#'><span class='ui-icon ui-icon-extlink'></span>Add New</a><li>",
                "    <li class='webvsed-treectx-remove'><a href='#'><span class='ui-icon ui-icon-close'></span>Remove</a></li>",
                "</ul>"
            ].join(""));

            var insertMenu = $("<ul></ul>");
            for(var name in Webvs.ComponentRegistry) {
                var componentClass = Webvs.ComponentRegistry[name];
                var path = componentClass.Meta.menu;
                path = path?path.split("/"):[];
                var menuLoc = insertMenu;
                for(var i = 0;i < path.length;i++) {
                    var subMenuClass = "webvsed-insertmenu-" + this._slugify(path[i]);
                    var subMenu = menuLoc.find("."+subMenuClass);
                    if(subMenu.length === 0) {
                        var newSubMenu = $("<li><a href='#'>"+path[i]+"</a><ul class='"+subMenuClass+"'></ul></li>");
                        menuLoc.append(newSubMenu);
                        subMenu = newSubMenu.children(":eq(1)");
                    }
                    menuLoc = subMenu;
                }

                var newItem = $("<li><a href='#'>"+name+"</a></li>");
                newItem.data("componentName", name);
                menuLoc.append(newItem);
            }

            treeCtxMenu.children(":eq(0)").append(insertMenu);

            return treeCtxMenu;
        },

        /**
         * Builds the sidebar tree from webvs instance
         */
        _buildTree: function(component) {
            var label;
            if(component.id == "root") {
                label = "Main";
            } else {
                label = component.id;
            }
            var node = {
                id: component.id,
                component: component,
                label: label
            };
            if(component instanceof Webvs.Container) {
                node.children = [];
                for(var i = 0;i < component.components.length;i++) {
                    node.children.push(this._buildTree(component.components[i]));
                }
            }
            return node;
        },

        /**
         * Fixes the dimensions of the sidebar and panes
         */
        _fixDimensions: function() {
            this.box.css({
                width: this.options.width,
                height: this.options.height
            });
            this.row2.css("height", this.box.height()-this.row1.outerHeight());
            this.pane.css("width", this.row2.width()-this.sidebar.outerWidth());
        },

        _showTreeCtxMenu: function(node, x, y) {
            this.menuBoundNode = node;
            this.treeCtxMenu.css({left: x, top: y}).show();
        },

        _showTabCtxMenu: function(tab, x, y) {
            if(tab.index() === 0) {
                return;
            }
            this.menuBoundTab = tab;
            this.tabCtxMenu.css({left: x, top: y}).show();
        },

        _setWebvsOption: function(form, field) {
            var node = this.tree.tree("getNodeById", form.parent().data("webvsedComponentId"));

            var path = [];
            field.parents(".alpaca-fieldset-item-container").each(function() {
                path.push($(this).data("alpacaItemContainerItemKey"));
            });
            path.reverse();

            var value = Alpaca(form.get()).getControlByPath(path.join("/")).getValue();
            node.component.setOption(path.join("."), value);
        },

        _activatePanel: function(id) {
            var panelInfo = this.panelInfo[id];
            this.tabList.children().removeClass("webvsed-panelstate-active");
            this.box.find(".ui-dialog").removeClass("webvsed-panelstate-active");
            if(panelInfo.tab) {
                panelInfo.tab.addClass("webvsed-panelstate-active");
                this.tabs.tabs("option", "active", panelInfo.tab.index());
            } else {
                panelInfo.panel.parent(".ui-dialog").addClass("webvsed-panelstate-active");
                panelInfo.panel.dialog("moveToTop");
            }
            if(this.tree.tree("getSelectedNode").id == id) {
                return;
            }
            this.tree.tree("selectNode", panelInfo.node);
        },

        _closeTab: function(tab, popout) {
            var id = tab.data("webvsedComponentId");

            // remove or popout the panel
            var panel = this.panelInfo[id].panel;
            if(popout) {
                panel.dialog({
                    title: id,
                    appendTo: this.box,
                    width: 500,
                    height: 500
                });
                this.panelInfo[id].tab = undefined;
            } else {
                panel.remove();
                this.panelInfo[id] = undefined;
            }

            tab.remove();
            this.tabs.tabs("refresh");

            // change active tab
            if(this.tree.tree("getSelectedNode").id == id && popout) {
                this._activatePanel(id);
            }
        },

        _showTab: function(node) {
            var panelInfo = this.panelInfo[node.id];
            if(!panelInfo) {
                // create the tab
                var tab = $("<li data-webvsed-component-id='"+node.id+"'><a href='#webvsed-"+node.id+"'>"+node.name+"</a></li>");
                this.tabList.append(tab);

                // create the tab panel
                var panel = $("<div data-webvsed-component-id='"+node.id+"' class='webvsed-panel' id='webvsed-"+node.id+"'></div>");
                this.tabs.append(panel);

                // create form inside tab panel
                var componentClass = node.component.constructor.Meta.name;
                if(componentClass in webvsFormdefs) {
                    var alpacaOpts = $.extend({data: node.component.opts}, webvsFormdefs[componentClass]);
                    var form = $("<div class='webvsed-form'></div>");
                    form.appendTo(panel).alpaca(alpacaOpts);
                } else {
                    panel.append("<p>Form Definition Not Found</o>");
                }

                this.panelInfo[node.id] = {
                    node: node,
                    tab: tab,
                    panel: panel
                };

                // refresh and set the active tab
                this.tabs.tabs("refresh");
            }
            this._activatePanel(node.id);
        }
    });

})(jQuery);
