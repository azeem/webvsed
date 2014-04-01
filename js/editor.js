(function($) {

    $.widget("webvsed.webvsEditor", {
        options: {
            width: 700,
            height: 500
        },

        _create: function() {
            this.idCounter = 1000;
            this.rootNodeId = null;

            this._renderUI();
            this._bind();

            // setup initial state
            this._fixDimensions();
            this.panels.webvsedPanels("showPanel", this.tree.tree("getNodeById", this.rootNodeId));
        },

        /**
         * Builds the UI DOM and initializes it
         */
        _renderUI: function() {
            // Build main editor
            var box = $([
                "<div class='webvsed-box'>",
                "    <div class='webvsed-row1'>",
                "        <div class='webvsed-toolbar'>",
                "            <div class='webvsed-buttonset'>",
                "                <button data-webvsed-icon='ui-icon-plus' class='webvsed-toolbar-insert'>Add New</button>",
                "                <button data-webvsed-icon='ui-icon-minus' class='webvsed-toolbar-remove'>Remove</button>",
                "            </div>",
                "            <button data-webvsed-icon='ui-icon-close' class='webvsed-toolbar-close'>Close Panel</button>",
                "            <button data-webvsed-icon='ui-icon-extlink' class='webvsed-toolbar-pop'>Pop Out</button>",
                "        </div>",
                "    </div>",
                "    <div class='webvsed-row2'>",
                "        <div class='webvsed-panels'>",
                "        </div>",
                "        <div class='webvsed-sidebar'>",
                "            <div class='webvsed-tree'></div>",
                "        </div>",
                "    </div>",
                "</div>"
            ].join(""));
            this.element.append(box);

            this.box = box;
            this.row1 = box.children(".webvsed-row1");
            this.row2 = box.children(".webvsed-row2");
            this.toolbar = this.row1.children(".webvsed-toolbar");
            this.sidebar = this.row2.children(".webvsed-sidebar");
            this.tree = this.sidebar.children(".webvsed-tree");
            this.panels = this.row2.children(".webvsed-panels");

            // Build Menus
            var addComponentMenu = this._buildAddComponentMenu();
            var treeCtxMenu = $([
                "<ul class='webvsed-ctxmenu'>",
                "    <li><a href='#'><span class='ui-icon ui-icon-plus'></span>Add New</a></li>",
                "    <li class='webvsed-treectx-disable'><a href='#'><span class='ui-icon ui-icon-pause'></span>Disable</a></li>",
                "    <li class='webvsed-treectx-enable'><a href='#'><span class='ui-icon ui-icon-play'></span>Enable</a></li>",
                "    <li class='webvsed-treectx-set-id'><a href='#'><span class='ui-icon ui-icon-pencil'></span>Set ID</a></li>",
                "    <li class='webvsed-treectx-remove'><a href='#'><span class='ui-icon ui-icon-minus'></span>Remove</a></li>",
                "</ul>"
            ].join(""));
            treeCtxMenu.children(":eq(0)").append(addComponentMenu.clone(true, true));
            treeCtxMenu.menu().hide().css("position", "absolute");
            this.box.append(treeCtxMenu);
            addComponentMenu.menu().hide().css("position", "absolute");
            this.box.append(addComponentMenu);
            this.addComponentMenu = addComponentMenu;
            this.treeCtxMenu = treeCtxMenu;


            // Build Toolbar buttons
            this.toolbar.find("button").each(function() {
                var button = $(this);
                button.button({
                    icons: {
                        primary: button.data("webvsedIcon")
                    },
                    text: false
                });
            });
            this.toolbar.children(".webvsed-buttonset").each(function() {
                $(this).buttonset();
            });

            // Build Sidebar and Tree
            this.sidebar.resizable({
                handles: "e"
            });
            this.tree.tree({
                autoOpen: 2,
                keyboardSupport: false,
                dragAndDrop: true,
                onCanMove: function(node) {
                    return node.component.id != "root";
                },
                onCanMoveTo: function(movedNode, targetNode, position) {
                    if(position == "inside") {
                        return (targetNode.component instanceof Webvs.Container);
                    } else {
                        return (targetNode.component.id != "root");
                    }
                },
                data:[this._buildTree(this.options.webvsMain.rootComponent)]
            });

            // Build Panels
            this.panels.webvsedPanels();
        },

        /**
         * Bind events
         */
        _bind: function() {
            var _this = this;

            // Tree context menu events
            this.tree.on("tree.contextmenu", function(event) {
                _this.treeCtxMenuNode = event.node;
                if(event.node.component.enabled) {
                    _this.treeCtxMenu.find(".webvsed-treectx-enable").hide();
                    _this.treeCtxMenu.find(".webvsed-treectx-disable").show();
                } else {
                    _this.treeCtxMenu.find(".webvsed-treectx-enable").show();
                    _this.treeCtxMenu.find(".webvsed-treectx-disable").hide();
                }
                _this.treeCtxMenu.css({left: event.click_event.pageX, top: event.click_event.pageY}).show();
            });
            this.treeCtxMenu.on("click", ".webvsed-component-add", function() {
                _this._addNewComponent($(this).data("componentName"), _this.treeCtxMenuNode);
            });
            this.treeCtxMenu.on("click", ".webvsed-treectx-remove", function() {
                _this._removeComponent(_this.treeCtxMenuNode);
            });
            this.treeCtxMenu.on("click", ".webvsed-treectx-enable,.webvsed-treectx-disable", function(event) {
                _this._toggleComponentEnable(_this.treeCtxMenuNode);
            });
            this.treeCtxMenu.on("click", ".webvsed-treectx-set-id", function(event) {
                _this._setComponentId(_this.treeCtxMenuNode);
            });

            // Hide all context menus
            $("body").on("click", function(event) {
                _this.addComponentMenu.hide();
                _this.treeCtxMenu.hide();
                _this.treeCtxMenuNode = null;
            });

            // toolbar button events
            this.toolbar.find(".webvsed-toolbar-insert").on("click", function(event) {
                var button = $(this);
                var offset = button.offset();
                offset.top += button.outerHeight();
                _this.addComponentMenu.css({left: offset.left, top: offset.top}).show();
                event.stopPropagation(); // prevent context menu hide from firing
            });
            this.toolbar.find(".webvsed-toolbar-remove").on("click", function(event) {
                _this._removeComponent(_this.panels.webvsedPanels("getCurrentPanel").node);
            });
            this.toolbar.find(".webvsed-toolbar-close").on("click", function() {
                var panelId = _this.panels.webvsedPanels("getCurrentPanel").node.id;
                _this.panels.webvsedPanels("closePanel", panelId);
            });
            this.toolbar.find(".webvsed-toolbar-pop").on("click", function() {
                var panelId = _this.panels.webvsedPanels("getCurrentPanel").node.id;
                _this.panels.webvsedPanels("popPanel", panelId);
            });

            // toolbar insert menu
            this.addComponentMenu.on("click", ".webvsed-component-add", function() {
                var node = _this.panels.webvsedPanels("getCurrentPanel").node;
                _this._addNewComponent($(this).data("componentName"), node);
            });

            // fix dimensions when sidebar is resized
            this.sidebar.on("resize", function() {
                _this._fixDimensions();
            });

            // show tab when tree item is selected
            this.tree.on("tree.select", function(event) {
                _this.panels.webvsedPanels("showPanel", event.node);
            });

            this.tree.on("tree.move", function(event) {
                _this._moveComponent(event.move_info);
            });

            this.panels.on("panelActivate", function(event, panel) {
                _this._setToolbarStates(panel);
                _this.tree.tree("selectNode", panel.node);
            });

            // set option in webvs when form value changes
            this.box.on("change", ".webvsed-form", function(event) {
                _this._updateComponent($(this), $(event.target));
            });
        },

        _slugify: function(str) {
            return $.trim(str).toLowerCase().replace(/\s+/, "_");
        },

        _buildAddComponentMenu: function() {
            var addMenu = $("<ul class='webvsed-ctxmenu'></ul>");
            // Create a menu fom Webvs ComponentRegistry entries
            for(var name in Webvs.ComponentRegistry) {
                var componentClass = Webvs.ComponentRegistry[name];
                var path = componentClass.Meta.menu;
                path = path?path.split("/"):[];

                // find the the list where the item will be inserted
                // creating nonexisting entries on the way
                var menuLoc = addMenu;
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

                var newItem = $("<li class='webvsed-component-add'><a href='#'><span class='ui-icon ui-icon-gear'></span>"+name+"</a></li>");
                newItem.data("componentName", name);
                menuLoc.append(newItem);
            }
            return addMenu;
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
            this.panels.css("width", this.row2.width()-this.sidebar.outerWidth());
        },

        _updateComponent: function(form, field) {
            var node = this.tree.tree("getNodeById", form.parent().data("webvsedNodeId"));
            var control, errorMessage;
            if(form.hasClass("webvsed-default-form")) {
                control = Alpaca(form.get());
                var json = control.getValue();
                var parent = node.component.parent;

                var newComponent;
                try {
                    newComponent = parent.createComponent(json);
                } catch(e) {
                    errorMessage = e.message;
                }

                if(newComponent) {
                    var pos = node.parent.children.indexOf(node);
                    parent.detachComponent(node.component.id);
                    parent.addComponent(newComponent, pos);
                    this.tree.tree("updateNode", node, {
                        component: newComponent
                    });
                    this._setComponentId(node, newComponent.id);
                }
            } else {
                var path = [];
                field.parents(".alpaca-fieldset-item-container").each(function() {
                    path.push($(this).data("alpacaItemContainerItemKey"));
                });
                path.reverse();
                control = Alpaca(form.get()).getControlByPath(path.join("/"));
                var value = control.getValue();
                try {
                    node.component.setOption(path.join("."), value);
                } catch(e) {
                    errorMessage = e.message;
                }
            }

            // set the error message on the control
            var controlEl = $(control.getEl());
            if(errorMessage) {
                controlEl.append("<div class='webvsed-field-error ui-state-error'><span class='ui-icon ui-icon-alert'></span><span class='webvsed-field-error-text'>"+errorMessage+"</span></div>");
            } else {
                controlEl.children(".webvsed-field-error").remove();
            }
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
            this.panels.webvsedPanels("showPanel", this.tree.tree("getNodeById", id));
        },

        _removeComponent: function(node) {
            if(!window.confirm("Remove '" + node.name + "'?")) {
                return;
            }
            var component = node.component.parent.detachComponent(node.component.id);
            component.destroy();
            this.tree.tree("removeNode", node);
            this.panels.webvsedPanels("closePanel", node.id);
        },

        _toggleComponentEnable: function(node) {
            node.component.enabled = !node.component.enabled;
            if(node.component.enabled) {
                $(node.element).removeClass("webvsed-tree-node-disabled");
            } else {
                $(node.element).addClass("webvsed-tree-node-disabled");
            }
        },

        _setComponentId: function(node, newId) {
            if(!newId) {
                var message = "Enter new ID for " + node.component.id;
                while(true) {
                    newId = window.prompt(message);
                    if(!newId) {
                        return;
                    }
                    newId = $.trim(newId);
                    if(!newId.match(/^[\w\d_-]+$/)) {
                        message = ["ID should contain only alphanumeric, underscore or minus",
                                   "Enter new ID for " + node.component.id].join("\n");
                    } else {
                        break;
                    }
                }
            }

            node.component.id = newId;
            this.tree.tree("updateNode", node, newId);

            // update tab/dialog title if open
            this.panels.webvsedPanels("updateTitle", node.id);
        },

        _moveComponent: function(moveInfo) {
            var component = moveInfo.moved_node.component;
            var prevParent = moveInfo.previous_parent.component;
            var targetNode = moveInfo.target_node;
            var newParent, pos;
            if(moveInfo.position == "inside") {
                newParent = targetNode.component;
                pos = null;
            } else {
                newParent = targetNode.component.parent;
                pos = targetNode.parent.children.indexOf(targetNode);
                if(moveInfo.position == "after") {
                    pos++;
                }
            }
            prevParent.detachComponent(component.id);
            newParent.addComponent(component, pos);
        },

        _setToolbarStates: function(panel) {
            // set toolbar button states
            this.toolbar.find("button").button("option", "disabled", false);
            if(panel.node.id == this.rootNodeId) {
                this.toolbar.find(".webvsed-toolbar-remove,.webvsed-toolbar-close,.webvsed-toolbar-pop").button("option", "disabled", true);
            }
            var popButtonOptions;
            if(panel.tab) {
                popButtonOptions = {icons:{primary: "ui-icon-arrowthick-1-ne"}, label:"Pop Out"};
            } else {
                popButtonOptions = {icons:{primary: "ui-icon-arrowthick-1-sw"}, label:"Pop In"};
            }
            this.toolbar.find(".webvsed-toolbar-pop").button("option", popButtonOptions);
        }
    });

})(jQuery);
