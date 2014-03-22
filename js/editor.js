(function($) {

    $.widget("webvs.webvseditor", {
        options: {
            width: 700,
            height: 500
        },

        _create: function() {
            this.panelInfo = {};
            this.panelOrder = [];
            this.idCounter = 1000;
            this.rootNodeId = null;

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
                autoOpen: 2,
                data:[this._buildTree(this.options.webvsMain.rootComponent)]
            });

            this.tabs.tabs({
                heightStyle: "fill"
            });

            this._fixDimensions();

            this._showPanel(this.tree.tree("getNodeById", this.rootNodeId));
        },

        /**
         * Bind events
         */
        _bind: function() {
            var webvsed = this;

            // Tab context Menu events
            this.tabList.on("contextmenu", "li", function(event) {
                var tab = $(this);
                if(tab.index() !== 0) {
                    webvsed.tabCtxMenuPanel = tab.data("webvsedNodeId");
                    webvsed.tabCtxMenu.css({left: event.pageX, top: event.pageY}).show();
                }
                event.preventDefault();
            });
            this.tabCtxMenu.children(".webvsed-tabctx-close").on("click", function(event) {
                webvsed._closePanel(webvsed.tabCtxMenuPanel);
                event.preventDefault();
            });
            this.tabCtxMenu.children(".webvsed-tabctx-popout").on("click", function(event) {
                webvsed._popoutPanel(webvsed.tabCtxMenuPanel);
                event.preventDefault();
            });

            // Tree context menu events
            this.tree.on("tree.contextmenu", function(event) {
                webvsed.treeCtxMenuNode = event.node;
                if(event.node.component.enabled) {
                    webvsed.treeCtxMenu.find(".webvsed-treectx-enable").hide();
                    webvsed.treeCtxMenu.find(".webvsed-treectx-disable").show();
                } else {
                    webvsed.treeCtxMenu.find(".webvsed-treectx-enable").show();
                    webvsed.treeCtxMenu.find(".webvsed-treectx-disable").hide();
                }
                webvsed.treeCtxMenu.css({left: event.click_event.pageX, top: event.click_event.pageY}).show();
            });
            this.treeCtxMenu.on("click", ".webvsed-treectx-insert", function() {
                webvsed._addNewComponent($(this).data("componentName"), webvsed.treeCtxMenuNode);
            });
            this.treeCtxMenu.on("click", ".webvsed-treectx-remove", function() {
                webvsed._removeComponent(webvsed.treeCtxMenuNode);
            });
            this.treeCtxMenu.on("click", ".webvsed-treectx-enable,.webvsed-treectx-disable", function(event) {
                webvsed._toggleComponentEnable(webvsed.treeCtxMenuNode);
            });


            // Hide all context menus
            $("body").on("click", function(event) {
                webvsed.tabCtxMenu.hide();
                webvsed.treeCtxMenu.hide();
                this.tabCtxMenuPanel = null;
                this.treeCtxMenuNode = null;
            });

            // fix dimensions when sidebar is resized
            this.sidebar.on("resize", function() {
                webvsed._fixDimensions();
            });

            // show tab when tree item is selected
            this.tree.on("tree.select", function(event) {
                if(event.node) {
                    webvsed._showPanel(event.node);
                }
            });

            // select tree item when tab is selected
            this.tabs.on("tabsactivate", function(event, ui) {
                if(event.originalEvent) { // don't run for tabs refresh
                    webvsed._activatePanel(ui.newTab.data("webvsedNodeId"));
                }
            });

            this.box.on("dialogbeforeclose", function(event, ui) {
                var id = $(event.target).data("webvsedNodeId");
                webvsed._closePanel(id);
            });

            // Panel focus events
            this.tabList.on("click", ".ui-state-active", function() {
                webvsed._activatePanel($(this).data("webvsedNodeId"));
            });
            this.box.on("mousedown", ".webvsed-panel", function(event) {
                webvsed._activatePanel($(this).data("webvsedNodeId"));
            });
            this.box.on("mousedown", ".ui-dialog", function(event) {
                webvsed._activatePanel($(this).find(".webvsed-panel").data("webvsedNodeId"));
            });

            // set option in webvs when form value changes
            this.box.on("change", ".webvsed-form", function(event) {
                webvsed._setWebvsOption($(this), $(event.target));
            });
        },

        _slugify: function(str) {
            return $.trim(str).toLowerCase().replace(/\s+/, "_");
        },

        _buildTreeMenu: function() {
            var treeCtxMenu = $([
                "<ul class='webvsed-ctxmenu'>",
                "    <li><a href='#'><span class='ui-icon ui-icon-plus'></span>Add New</a></li>",
                "    <li class='webvsed-treectx-disable'><a href='#'><span class='ui-icon ui-icon-pause'></span>Disable</a></li>",
                "    <li class='webvsed-treectx-enable'><a href='#'><span class='ui-icon ui-icon-play'></span>Enable</a></li>",
                "    <li class='webvsed-treectx-set-name'><a href='#'><span class='ui-icon ui-icon-pencil'></span>Set Name</a></li>",
                "    <li class='webvsed-treectx-remove'><a href='#'><span class='ui-icon ui-icon-minus'></span>Remove</a></li>",
                "</ul>"
            ].join(""));

            var insertMenu = $("<ul></ul>");
            // Create a menu fom Webvs ComponentRegistry entries
            for(var name in Webvs.ComponentRegistry) {
                var componentClass = Webvs.ComponentRegistry[name];
                var path = componentClass.Meta.menu;
                path = path?path.split("/"):[];

                // find the the list where the item will be inserted
                // creating nonexisting entries on the way
                var menuLoc = insertMenu;
                for(var i = 0;i < path.length;i++) {
                    var subMenuClass = "webvsed-insertmenu-" + this._slugify(path[i]);
                    var subMenu = menuLoc.find("."+subMenuClass);
                    if(subMenu.length === 0) {
                        var newSubMenu = $("<li><a href='#'><span class='ui-icon ui-icon-suitcase'></span>"+path[i]+"</a><ul class='"+subMenuClass+"'></ul></li>");
                        menuLoc.append(newSubMenu);
                        subMenu = newSubMenu.children(":eq(1)");
                    }
                    menuLoc = subMenu;
                }

                var newItem = $("<li class='webvsed-treectx-insert'><a href='#'><span class='ui-icon ui-icon-gear'></span>"+name+"</a></li>");
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
            var id = this.idCounter++;
            if(component.id == "root") {
                label = "Main";
                this.rootNodeId = id;
            } else {
                label = component.id;
            }
            var node = {
                id: id,
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

        _setWebvsOption: function(form, field) {
            var node = this.tree.tree("getNodeById", form.parent().data("webvsedNodeId"));

            var path = [];
            field.parents(".alpaca-fieldset-item-container").each(function() {
                path.push($(this).data("alpacaItemContainerItemKey"));
            });
            path.reverse();

            var value = Alpaca(form.get()).getControlByPath(path.join("/")).getValue();
            node.component.setOption(path.join("."), value);
        },

        _addNewComponent: function(componentName, node) {
            var parentComponent, pos, treeMethod;
            if(node.component instanceof Webvs.Container) {
                parentComponent = node.component;
                pos = null;
                treeMethod = "appendNode";
            } else {
                parentComponent = node.component.parent;
                pos = node.parent.children.indexOf(node);
                treeMethod = "addNodeBefore";
            }
            var component = parentComponent.addComponent({type: componentName}, pos);
            var id = this.idCounter++;
            this.tree.tree(treeMethod, {
                id: id,
                label: component.id,
                component: component
            }, node);
            this._showPanel(this.tree.tree("getNodeById", id));
        },

        _removeComponent: function(node) {
            var component = node.component.parent.detachComponent(node.id);
            component.destroy();
            this.tree.tree("removeNode", node);
            this._closePanel(node.id);
        },

        _toggleComponentEnable: function(node) {
            console.dir(node);
            node.component.enabled = !node.component.enabled;
            if(node.component.enabled) {
                $(node.element).removeClass("webvsed-tree-node-disabled");
            } else {
                $(node.element).addClass("webvsed-tree-node-disabled");
            }
        },

        _activatePanel: function(id) {
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
            this.box.find(".ui-dialog").removeClass("webvsed-panelstate-active");

            // set the panelstate class
            if(panelInfo.tab) {
                panelInfo.tab.addClass("webvsed-panelstate-active");
                this.tabs.tabs("option", "active", panelInfo.tab.index());
            } else {
                panelInfo.panel.parent(".ui-dialog").addClass("webvsed-panelstate-active");
                panelInfo.panel.dialog("moveToTop");
            }

            // select tree node
            this.tree.tree("selectNode", panelInfo.node);
        },

        _popoutPanel: function(id) {
            var panelInfo = this.panelInfo[id];
            if(!panelInfo.tab) {
                return;
            }

            panelInfo.tab.remove();
            panelInfo.tab = null;
            panelInfo.panel.dialog({
                title: panelInfo.node.name,
                appendTo: this.box,
                width: 500,
                height: 500
            });
            this.tabs.tabs("refresh");

            this._activatePanel();
        },

        _closePanel: function(id) {
            var panelInfo = this.panelInfo[id];

            if(panelInfo.tab) {
                panelInfo.panel.remove();
                panelInfo.tab.remove();
                this.tabs.tabs("refresh");
            }

            this.panelInfo[id] = undefined;
            this.panelOrder.splice(this.panelOrder.indexOf(id), 1);

            this._activatePanel();
        },

        _showPanel: function(node) {
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

                this.panelOrder.push(node.id);

                // refresh and set the active tab
                this.tabs.tabs("refresh");
                this._activatePanel();
            } else {
                this._activatePanel(node.id);
            }

        }
    });

})(jQuery);
