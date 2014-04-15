(function($, _, Backbone) {

    WebvsEd.EditorView = Backbone.View.extend({
        className: WebvsEd.getClass("editor", "box"),

        template: _.template([
            "<div class='row1'>",
            "    <div class='toolbar'>",
            "        <div class='buttonset'>",
            "            <button data-webvsed-icon='ui-icon-plus' class='insert'>Add New</button>",
            "            <button data-webvsed-icon='ui-icon-minus' class='remove'>Remove</button>",
            "        </div>",
            "        <button data-webvsed-icon='ui-icon-close' class='close'>Close Panel</button>",
            "        <button data-webvsed-icon='ui-icon-extlink' class='pop'>Pop Out</button>",
            "    </div>",
            "</div>",
            "<div class='row2'>",
            "    <div class='sidebar'>",
            "        <div class='tree'></div>",
            "    </div>",
            "</div>",
        ].join("")),

        treeCtxtMenuTemplate: _.template([
            "<ul class='ctxtmenu treectxtmenu'>",
            "    <li class='add'><a href='#'><span class='ui-icon ui-icon-plus'></span>Add New</a><%= addMenu %></li>",
            "    <li class='disable'><a href='#'><span class='ui-icon ui-icon-pause'></span>Disable</a></li>",
            "    <li class='enable'><a href='#'><span class='ui-icon ui-icon-play'></span>Enable</a></li>",
            "    <li class='set-id'><a href='#'><span class='ui-icon ui-icon-pencil'></span>Set ID</a></li>",
            "    <li class='remove'><a href='#'><span class='ui-icon ui-icon-minus'></span>Remove</a></li>",
            "</ul>"
        ].join("")),

        addMenuTemplate: _.template([
            "<ul class='ctxtmenu addmenu'>",
            "    <% _.each(menu.items, function(className) { %>",
            "        <li class='component-add'>",
            "            <a data-webvsed-component-name='<%= className %>' href='#'><span class='ui-icon ui-icon-gear'></span><%= className %></a>",
            "        </li>",
            "    <% }) %>",
            "    <% _.each(menu.subMenus, function(subMenu, menuName) { %>",
            "        <li>",
            "            <a href='#'><span class='ui-icon ui-icon-suitcase'></span><%= menuName %></a>",
            "            <%= self(subMenu) %>",
            "        </li>",
            "    <% }) %>",
            "</ul>",
        ].join("")),

        events: {
            "tree.contextmenu > .row2 > .sidebar .tree": "handleTreeCtxtMenu",
            "tree.select > .row2 > .sidebar .tree": "handleTreeSelect",
            "tree.move > .row2 > .sidebar .tree": "handleTreeMove",

            "click > .treectxtmenu .component-add": "handleMenuAdd",
            "click > .treectxtmenu .remove": "handleMenuRemove",
            "click > .treectxtmenu .disable": "handleMenuEnableDisable",
            "click > .treectxtmenu .enable": "handleMenuEnableDisable",
            "click > .treectxtmenu .set-id": "handleMenuSetId",

            "click > .row1 > .toolbar .insert": "handleToolbarInsert",
            "click > .row1 > .toolbar .remove": "handleToolbarRemove",
            "click > .row1 > .toolbar .close": "handleToolbarClose",
            "click > .row1 > .toolbar .pop": "handleToolbarPop",

            "click > .addmenu .component-add": "handleToolbarAdd",

            "resize > .row2 > .sidebar": "fixDimensions",

            "panelActivate > .row2": "handlePanelActivate",
            "headerChange > .row2": "handleHeaderChange"
        },

        initialize: function(opts) {
            this.width = opts.width || 700;
            this.height = opts.height || 500;
            this.webvsMain = opts.webvsMain;
            this.idCounter = 0;
        },

        render: function() {
            this.$el.append(this.template());
            this.toolbar = this.$el.find(".row1 .toolbar");
            this.sidebar = this.$el.find(".row2 .sidebar");
            this.tree = this.$el.find(".row2 .tree");

            // create the menus
            var addMenuHtml = this.buildAddComponentMenu();
            var treeCtxtMenu = $(this.treeCtxtMenuTemplate({addMenu: addMenuHtml}));
            treeCtxtMenu.menu().hide().css("position", "absolute");
            this.$el.append(treeCtxtMenu);
            this.treeCtxtMenu = treeCtxtMenu;
            var addComponentMenu = $(addMenuHtml);
            addComponentMenu.menu().hide().css("position", "absolute");
            this.$el.append(addComponentMenu);
            this.addComponentMenu = addComponentMenu;
            $("body").on("click", _.bind(function() {
                this.treeCtxtMenu.hide();
                this.addComponentMenu.hide();
                this.treeCtxtMenuNode = null;
            }, this));

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
            this.toolbar.children(".buttonset").each(function() {
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
                onCanMove: _.bind(this.handleTreeCanMove, this),
                onCanMoveTo: _.bind(this.handleTreeCanMoveTo, this),
                data:[this.buildTree(this.webvsMain.rootComponent)]
            });

            // build panels
            this.panels = new WebvsEd.PanelsView();
            this.$(".row2").prepend(this.panels.el);
            this.panels.render();

            // initial setup
            this.fixDimensions();
            this.panels.showPanel(this.tree.tree("getNodeById", this.rootNodeId));
        },

        buildTree: function(component) {
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

        buildAddComponentMenu: function() {
            var findOrCreate = function(object, key) {
                if(_.isString(key)) {
                    key = key.split("/");
                }
                if(!key || key.length === 0) {
                    return object;
                }
                if(!(key[0] in object.subMenus)) {
                    object.subMenus[key[0]] = {
                        items: [],
                        subMenus: {}
                    };
                }
                return findOrCreate(object.subMenus[key[0]], _.rest(key));
            };

            var menu = {
                items: [],
                subMenus: {}
            };
            for(var name in Webvs.ComponentRegistry) {
                var componentClass = Webvs.ComponentRegistry[name];
                var menuLoc = findOrCreate(menu, componentClass.Meta.menu);
                menuLoc.items.push(name);
            }

            var recurTemplate = _.bind(function(menu) {
                return this.addMenuTemplate({
                    menu: menu,
                    self: recurTemplate
                });
            }, this);

            return recurTemplate(menu);
        },

        fixDimensions: function() {
            this.$el.css({
                width: this.width,
                height: this.height
            });
            var row2 = this.$(".row2");
            var row1 = this.$(".row1");
            var panels = this.panels.$el;
            row2.css("height", this.$el.height()-row1.outerHeight());
            panels.css("width", row2.width()-this.sidebar.outerWidth());
        },


        addNewComponent: function(componentName, node) {
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
            this.panels.showPanel(this.tree.tree("getNodeById", id));
        },

        removeComponent: function(node) {
            if(!window.confirm("Remove '" + node.name + "'?")) {
                return;
            }
            var component = node.component.parent.detachComponent(node.component.id);
            component.destroy();
            this.tree.tree("removeNode", node);
            this.panels.closePanel(node.id);
        },

        componentEnable: function(node, enabled) {
            if(_.isUndefined(enabled)) {
                enabled = !node.component.enabled;
            }
            node.component.enabled = enabled;
            if(enabled) {
                $(node.element).removeClass("node-disabled");
            } else {
                $(node.element).addClass("node-disabled");
            }
        },

        setComponentId: function(node, newId) {
            newId = $.trim(newId);
            if(!newId.match(/^[\w\d_-]+$/)) {
                return false;
            }

            if(newId == node.component.id) {
                return true;
            }

            var findId = function(node, id) {
                if(node.component.id == id) {
                    return true;
                }
                for(var i = 0;i < node.children.length;i++) {
                    if(findId(node.children[i], id)) {
                        return true;
                    }
                }
                return false;
            };

            if(findId(this.tree.tree("getNodeById", this.rootNodeId), newId)) {
                return false;
            }

            node.component.id = newId;
            this.tree.tree("updateNode", node, newId);
            this.panels.updateTitle(node.id);

            return true;
        },

        moveComponent: function(moveInfo) {
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

        // event handlers
        
        handleTreeCtxtMenu: function(event) {
            this.treeCtxtMenuNode = event.node;
            if(event.node.component.enabled) {
                this.treeCtxtMenu.find(".enable").hide();
                this.treeCtxtMenu.find(".disable").show();
            } else {
                this.treeCtxtMenu.find(".enable").show();
                this.treeCtxtMenu.find(".disable").hide();
            }
            this.treeCtxtMenu.css({left: event.click_event.pageX, top: event.click_event.pageY}).show();
        },

        handleTreeSelect: function(event) {
            this.panels.showPanel(event.node);
        },

        handleTreeMove: function(event) {
            this.moveComponent(event.move_info);
        },

        handleTreeCanMove: function(node) {
            return node.component.id != "root";
        },

        handleTreeCanMoveTo: function(movedNode, targetNode, position) {
            if(position == "inside") {
                return (targetNode.component instanceof Webvs.Container);
            } else {
                return (targetNode.component.id != "root");
            }
        },

        handleMenuAdd: function(event) {
            this.addNewComponent($(event.target).data("webvsedComponentName"), this.treeCtxtMenuNode);
            event.preventDefault();
        },

        handleMenuRemove: function() {
            this.removeComponent(this.treeCtxtMenuNode);
        },

        handleMenuEnableDisable: function() {
            this.componentEnable(this.treeCtxtMenuNode);
        },

        handleMenuSetId: function() {
            var message = "Enter new ID for " + node.component.id;
            while(true) {
                var newId = window.prompt(message);
                if(!newId) {
                    return;
                }
                if(!this.setComponentId(newId, treeCtxtMenuNode)) {
                    message = ["ID should be unique and contain only alphanumeric, underscore or minus",
                               "Enter new ID for " + node.component.id].join("\n");
                } else {
                    break;
                }
            }
        },

        handleToolbarInsert: function(event) {
            var button = $(event.target);
            var offset = button.offset();
            offset.top += button.outerHeight();
            this.addComponentMenu.css({left: offset.left, top: offset.top}).show();
            event.stopPropagation(); // prevent context menu hide from firing
        },

        handleToolbarRemove: function() {
            this.removeComponent(this.panels.getCurrentPanel().node);
        },
        
        handleToolbarClose: function() {
            var panelId = this.panels.getCurrentPanel().node.id;
            this.panels.closePanel(panelId);
        },

        handleToolbarPop: function() {
            var panelId = this.panels.getCurrentPanel().node.id;
            this.panels.togglePopPanel(panelId);
        },

        handleToolbarAdd: function(event) {
            var node = this.panels.getCurrentPanel().node;
            this.addNewComponent($(event.target).data("webvsedComponentName"), node);
            event.preventDefault();
        },

        handlePanelActivate: function(event, panel) {
            // set toolbar button states
            this.toolbar.find("button").button("option", "disabled", false);
            if(panel.node.id == this.rootNodeId) {
                this.toolbar.find(".remove,.close,.pop").button("option", "disabled", true);
            }
            var popButtonOptions;
            if(panel.tab) {
                popButtonOptions = {icons:{primary: "ui-icon-arrowthick-1-ne"}, label:"Pop Out"};
            } else {
                popButtonOptions = {icons:{primary: "ui-icon-arrowthick-1-sw"}, label:"Pop In"};
            }
            this.toolbar.find(".pop").button("option", popButtonOptions);
            this.tree.tree("selectNode", panel.node);
        },

        handleHeaderChange: function(event, info) {
            if(info.name == "id") {
                var state = false;
                var message;
                if(!this.setComponentId(info.node, info.value)) {
                    state = true;
                    message = "ID should be unique and contain only alphanumeric, underscore or minus";
                }
                this.panels.setHeaderError(info.node.id, state, message);
            } else if(info.name == "enabled") {
                this.componentEnable(info.node, info.value);
            }
        }
    });

})(jQuery, _, Backbone);
