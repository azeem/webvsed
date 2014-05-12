(function($, _, Backbone) {

    WebvsEd.SidebarView = Backbone.View.extend({
        className: WebvsEd.getClass("sidebar"),

        template: _.template([
            "<div class='tree'></div>"
        ].join("")),

        ctxtMenuTemplate: _.template([
            "<ul class='ctxtmenu treectxtmenu'>",
            "    <li class='add'><a href='#'><span class='ui-icon ui-icon-plus'></span>Add New</a><%= addMenu %></li>",
            "    <li class='disable'><a href='#'><span class='ui-icon ui-icon-pause'></span>Disable</a></li>",
            "    <li class='enable'><a href='#'><span class='ui-icon ui-icon-play'></span>Enable</a></li>",
            "    <li class='set-id'><a href='#'><span class='ui-icon ui-icon-pencil'></span>Set ID</a></li>",
            "    <li class='remove'><a href='#'><span class='ui-icon ui-icon-minus'></span>Remove</a></li>",
            "</ul>"
        ].join("")),

        events: {
            "tree.contextmenu .tree": "handleCtxtMenu",
            "tree.select .tree": "handleTreeSelect",
            "tree.move .tree": "handleTreeMove",
            "resize": "handleResize",

            "click > .treectxtmenu .component-add": "handleMenuAdd",
            "click > .treectxtmenu .remove": "handleMenuRemove",
            "click > .treectxtmenu .disable": "handleMenuEnableDisable",
            "click > .treectxtmenu .enable": "handleMenuEnableDisable",
            "click > .treectxtmenu .set-id": "handleMenuSetId",
        },

        initialize: function(opts) {
            this.main = opts.main;
        },

        render: function() {
            this.$el.resizable({
                handles: "e"
            });

            var addMenuHtml = WebvsEd.buildAddComponentMenu();
            var ctxtMenu = $(this.ctxtMenuTemplate({addMenu: addMenuHtml}));
            this.$el.append(ctxtMenu);
            ctxtMenu.menu().hide().css("position", "absolute");
            this.ctxtMenu = ctxtMenu;

            this.tree = this.$(".tree");
            this.tree.tree({
                autoOpen: 2,
                keyboardSupport: false,
                dragAndDrop: true,
                onCanMove: _.bind(this.handleTreeCanMove, this),
                onCanMoveTo: _.bind(this.handleTreeCanMoveTo, this),
                data:[this.buildTree(this.main.rootComponent)]
            });
        },

        buildNode: function(component) {
            if(component.id == "root") {
                label = "Main";
            } else {
                label = component.id;
            }
            return {
                id: _.uniqueId("node_"),
                component: component,
                label: label
            };
        },
        
        buildTree: function(component) {
            var label;
            var node = buildNode(component);
            if(component instanceof Webvs.Container) {
                this.addContainerListeners(component);
                node.children = [];
                for(var i = 0;i < component.components.length;i++) {
                    node.children.push(this.buildTree(component.components[i]));
                }
            }
            return node;
        },

        findNode: function(componentId, root) {
            if(!root) {
                root = this.tree.getTree();
            }
            if(root.component.id == componentId) {
                return root;
            }
            for(var i = 0;i < root.children.length;i++) {
                var result;
                if(result = this.findNode(componentId, root.children[i])) {
                    return result;
                }
            }
        },

        addContainerListeners: function(container) {
            this.listenTo(container, "addComponent", this.handleAddComponent);
            this.listenTo(container, "removeComponent", this.handleRemoveComponent);
        },

        selectNode: function(nodeId) {
            var node = this.tree.tree("getNodeById", nodeId);
            this.tree.tree("selectNode", node);
        },

        // event handlers

        handleAddComponent: function(component, parent, opts) {
            if(component instanceof Webvs.Container) {
                this.addContainerListeners(component);
            }
            var parentNode = this.findNode(parent.id);
            if(opts.pos == parentNode.children.length) {
                this.tree.tree("appendNode", this.buildNode(component), parentNode);
            } else {
                this.tree.tree("addNodeBefore", this.buildNode(component), parentNode.children[opts.pos]);
            }
        },

        handleRemoveComponent: function(component, parent, opts) {
            this.stopListening(component);
            var node = this.findNode(component.id);
            this.tree.tree("removeNode", node);
        },

        handleCtxtMenu: function(event) {
            this.ctxtMenuNode = event.node;
            if(event.node.component.enabled) {
                this.ctxtMenu.find(".enable").hide();
                this.ctxtMenu.find(".disable").show();
            } else {
                this.ctxtMenu.find(".enable").show();
                this.ctxtMenu.find(".disable").hide();
            }
            this.ctxtMenu.css({left: event.click_event.pageX, top: event.click_event.pageY}).show();
        },

        handleTreeSelect: function(event) {
            this.trigger("treeSelect", event.node);
        },

        handleTreeMove: function(event) {
            var component = event.moveInfo.moved_node.component;
            var prevParent = event.moveInfo.previous_parent.component;
            var targetNode = event.moveInfo.target_node;
            var newParent, pos;
            if(event.moveInfo.position == "inside") {
                newParent = targetNode.component;
                pos = 0;
            } else {
                newParent = targetNode.component.parent;
                pos = targetNode.parent.children.indexOf(targetNode);
                if(event.moveInfo.position == "after") {
                    pos++;
                }
            }
            prevParent.detachComponent(component.id);
            newParent.addComponent(component, pos);
        },

        handleMenuAdd: function() {
            var componentName = $(event.target).data("webvsedComponentName");
            var node = this.ctxtMenuNode;
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
            parentComponent.addComponent({type: componentName}, pos);
        },

        handleMenuRemove: function() {
            var node = this.ctxtMenuNode;
            if(!window.confirm("Remove '" + node.name + "'?")) {
                return;
            }
            var component = node.component.parent.detachComponent(node.component.id);
            component.destroy();
        },

        handleMenuEnableDisable: function() {
            var node = this.ctxtMenuNode;
            node.component.set("enabled", !node.component.get("enabled"));
        },

        handleMenuSetId: function() {
            var node = this.ctxtMenuNode;
            var promptMsg = "Enter new ID for " + node.component.id;
            var message = promptMsg;
            while(true) {
                var newId = window.prompt(message);
                try {
                    node.component.setId("id", newId);
                } catch(e) {
                    message = e.message + "\n" + promptMsg;
                }
            }
        },

        handleResize: function() {
            this.trigger("resize");
        }
    });

})(jQuery, _, Backbone);
