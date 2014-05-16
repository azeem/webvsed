(function($, _, Backbone) {

    WebvsEd.SidebarView = Backbone.View.extend({
        className: WebvsEd.getClass("sidebar"),

        template: _.template([
            "<div class='resize-container'>",
            "    <div class='tree'></div>",
            "</div>",
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
            "resize .resize-container": "handleResize",

            "click > .treectxtmenu .component-add": "handleMenuAdd",
            "click > .treectxtmenu .remove": "handleMenuRemove",
            "click > .treectxtmenu .disable": "handleMenuEnableDisable",
            "click > .treectxtmenu .enable": "handleMenuEnableDisable",
            "click > .treectxtmenu .set-id": "handleMenuSetId",
        },

        initialize: function(opts) {
            this.main = opts.main;
            this.tabsView = opts.tabsView;
        },

        render: function() {
            this.$el.append(this.template());

            this.$(".resize-container").resizable({
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
                data:[this.buildTree()]
            });

            this.listenTo(this.tabsView, "panelActivate", this.handlePanelActivate);

            // hide menu on click anywhere
            $("body").on("click", _.bind(function() {
                this.ctxtMenu.hide();
            }, this));
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
            if(!component) {
                component = this.main.rootComponent;
            }

            this.addListeners(component);

            var label;
            var node = this.buildNode(component);
            if(component instanceof Webvs.Container) {
                node.children = [];
                for(var i = 0;i < component.components.length;i++) {
                    node.children.push(this.buildTree(component.components[i]));
                }
            }
            return node;
        },

        findNode: function(componentId, root) {
            if(!root) {
                root = this.getRootNode();
            }
            if(root.component.id == componentId) {
                return root;
            }
            for(var i = 0;i < root.children.length;i++) {
                var result;
                if((result = this.findNode(componentId, root.children[i]))) {
                    return result;
                }
            }
        },

        getRootNode: function() {
            return this.tree.tree("getTree").children[0];
        },

        addListeners: function(component) {
            this.listenTo(component, "change:id", this.handleIdChange);
            if(component instanceof Webvs.Container) {
                this.listenTo(component, "addComponent", this.handleAddComponent);
                this.listenTo(component, "detachComponent", this.handleDetachComponent);
            }
        },

        createAndOpenPanel: function(node) {
            var panelInfo = this.tabsView.getPanel(node.id);
            if(!panelInfo) {
                // create panel if not already open
                var panelView = new WebvsEd.ComponentPanelView({component: node.component, main:this.main});
                panelInfo = this.tabsView.createPanel(node.id, node.name, panelView);
                panelView.render();
            }
            this.tabsView.activatePanel(node.id);
        },

        // event handlers

        handleAddComponent: function(component, parent, opts) {
            if(opts.isMove) {
                return;
            }
            this.addListeners(component);
            var parentNode = this.findNode(parent.id);
            if(opts.pos == parentNode.children.length) {
                this.tree.tree("appendNode", this.buildNode(component), parentNode);
            } else {
                this.tree.tree("addNodeBefore", this.buildNode(component), parentNode.children[opts.pos]);
            }
            this.createAndOpenPanel(this.findNode(component.id));
        },

        handleDetachComponent: function(component, parent, opts) {
            if(opts.isMove) {
                return;
            }
            this.stopListening(component);
            var node = this.findNode(component.id);
            this.tree.tree("removeNode", node);
        },

        handleCtxtMenu: function(event) {
            this.ctxtMenuNode = event.node;
            this.ctxtMenu.find("li").show();

            if(event.node.id == this.getRootNode().id) {
                this.ctxtMenu.find(".set-id").hide();
                this.ctxtMenu.find(".remove").hide();
                this.ctxtMenu.find(".enable").hide();
                this.ctxtMenu.find(".disable").hide();
            } else if(event.node.component.enabled) {
                this.ctxtMenu.find(".enable").hide();
            } else {
                this.ctxtMenu.find(".disable").hide();
            }
            this.ctxtMenu.css({left: event.click_event.pageX, top: event.click_event.pageY}).show();
        },

        handleTreeSelect: function(event) {
            this.createAndOpenPanel(event.node);
        },

        handleTreeMove: function(event) {
            var component = event.move_info.moved_node.component;
            var prevParent = event.move_info.previous_parent.component;
            var targetNode = event.move_info.target_node;
            var newParent, pos;
            if(event.move_info.position == "inside") {
                newParent = targetNode.component;
                pos = 0;
            } else {
                newParent = targetNode.component.parent;
                pos = targetNode.parent.children.indexOf(targetNode);
                if(event.move_info.position == "after") {
                    pos++;
                }
            }
            prevParent.detachComponent(component.id, {isMove: true});
            newParent.addComponent(component, pos, {isMove: true});
        },

        handleMenuAdd: function(event) {
            var componentName = $(event.target).data("webvsedComponentName");
            var node = this.ctxtMenuNode;
            WebvsEd.addComponentBeforeOrInside(node.component, componentName);
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
                if(_.isNull(newId)) {
                    break;
                }
                if(node.component.set("id", newId)) {
                    break;
                }
                message = node.component.lastError.message + "\n" + promptMsg;
            }
        },

        handleResize: function() {
            this.trigger("resize");
        },

        handleTreeCanMove: function(node) {
            return (node.id != this.getRootNode().id);
        },

        handleTreeCanMoveTo: function(movedNode, targetNode, position) {
            if(position == "inside") {
                return (targetNode.component instanceof Webvs.Container);
            } else {
                return (targetNode.id != this.getRootNode().id);
            }
        },

        handleIdChange: function(component, newId, options) {
            var node = this.findNode(component.id);
            this.tree.tree("updateNode", node, newId);
            this.tabsView.updateTitle(node.id, node.name);
        },

        handlePanelActivate: function(panelInfo) {
            if(!panelInfo.panelView instanceof WebvsEd.MainPanelView &&
               !panelInfo.panelView instanceof WebvsEd.ComponentPanelView) {
                return;
            }
            var node = this.tree.tree("getNodeById", panelInfo.id);
            this.tree.tree("selectNode", node);
        },

    });

})(jQuery, _, Backbone);
