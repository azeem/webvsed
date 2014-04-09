(function($, _, Backbone) {

    WebvsEd.EditorView = Backbone.View.extend({
        classname: WebvsEd.getClass("editor", "box"),

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
            "    <div class='panels'>",
            "    </div>",
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
            "        <li data-webvsed-component-name='<%= className %>' class='component-add'>",
            "            <a href='#'><span class='ui-icon ui-icon-gear'></span><%= className %></a>",
            "        </li>",
            "    <% }) %>",
            "    <% _.each(menu.subMenus, function(menuName, subMenu) { %>",
            "        <li>",
            "            <a href='#'><span class='ui-icon ui-icon-suitcase'></span><%= menuName %></a>",
            "            <%= self(subMenu) %>",
            "        </li>",
            "    <% }) %>",
            "</ul>",
        ].join(""));

        events: {
            "tree.contextmenu > .row2 > .sidebar tree": "handleTreeCtxtMenu",
            "tree.select > .row2 > .sidebar tree": "handleTreeSelect",
            "tree.move > .row2 > .sidebar tree": "handleTreeMove",

            "click > .treectxtmenu .component-add": "handleMenuAdd",
            "click > .treectxtmenu .remove": "handleMenuRemove",
            "click > .treectxtmenu .enable": "handleMenuEnableDisable",
            "click > .treectxtmenu .set-id": "handleMenuSetId",

            "click > .row1 > .toolbar .insert": "handleToolbarInsert",
            "click > .row1 > .toolbar .remove": "handleToolbarRemove",
            "click > .row1 > .toolbar .close": "handleToolbarClose",
            "click > .row1 > .toolbar .pop": "handleToolbarPop",

            "click > .addmenu .component-add": "handleToolbarAdd",

            "resize > .row2 > .sidebar": "fixDimensions",

            "panelActivate > .row2 > .panels": "handlePanelActivate"
        },

        initialize: function(opts) {
            this.width = opts.width || 700;
            this.height = opts.height || 700;
            this.webvsMain = opts.webvsMain;

            this.idCounter = 0;

            this.render();
        },

        render: function() {
            this.$el.append(this.template());
            this.toolbar = this.$el.find(".row1 .toolbar");
            this.sidebar = this.$el.find(".row2 .sidebar");
            this.tree = this.$el.find(".row2 .tree");

            // create the menus
            var addMenuHtml = this.buildAddComponentMenu();
            var treeCtxtMenu = $(this.treeCtxtMenuTemplate({addMenu: addMenuHtml}));
            treeCtxtMenu.menu().hide().css("posiiton", "absolute");
            this.$el.append(treeCtxtMenu);
            this.treeCtxtMenu = treeCtxtMenu;
            var addComponentMenu = $(addMenuHtml);
            addComponentMenu.menu().hide().css("posiiton", "absolute");
            this.$el.append(addComponentMenu);
            this.addComponentMenu = addComponentMenu;

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
            this.panels = new WebvsEd.PanelsView({element: this.$el.find(".row2 .panels")});
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
                if(key.length == 0) {
                    return object;
                }
                if(!(key[0] in object.subMenus)) {
                    object[key[0]] = {
                        items: [],
                        subMenus: {}
                    };
                }
                return findOrCreate(object[key[0]], _.rest(key));
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

            var this_ = this;
            var recurTemplate = function(menu) {
                return this_.addMenuTemplate({
                    menu: menu,
                    self: recurTemplate
                });
            };

            return recurTemplate(menu);
        },

        fixDimensions: function() {
            this.$el.css({
                width: this.options.width,
                height: this.options.height
            });
            var row2 = this.$(".row2");
            var row1 = this.$(".row1");
            var panels = this.$(".panels");
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

        toggleComponentEnable: function(node) {
            node.component.enabled = !node.component.enabled;
            if(node.component.enabled) {
                $(node.element).removeClass("webvsed-tree-node-disabled");
            } else {
                $(node.element).addClass("webvsed-tree-node-disabled");
            }
        },

        setComponentId: function(node, newId) {
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
            this.panels.updateTitle(node.id);
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

        handleMenuAdd: function() {
            this.addNewComponent($(event.target).data("componentName"), this.treeCtxtMenuNode);
        },

        handleMenuRemove: function() {
            this.removeComponent(this.treeCtxtMenuNode);
        },

        handleMenuEnableDisable: function() {
            this.toggleComponentEnable(this.treeCtxtMenuNode);
        },

        handleMenuSetId: function() {
            this.setComponentId(this.treeCtxtMenuNode);
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
            this.panels.popPanel(panelId);
        },

        handleToolbarAdd: function() {
            var node = this.panels.getCurrentPanel().node;
            this.addNewComponent($(event.target).data("componentName"), node);
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
        }
    });

})(jQuery, _, Backbone);
