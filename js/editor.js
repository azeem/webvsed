(function($) {

    $.widget("webvs.webvseditor", {
        options: {
            width: 700,
            height: 500
        },

        _create: function() {
            this._openTabs = [];

            this._renderUI();
            this._bind();
        },

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

            this.tabCtxMenu = tabCtxMenu;
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

            this._treeSelectNode("root");
            this._showTab(this.tree.tree("getNodeById", "root"));
        },

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
        
        _fixDimensions: function() {
            this.box.css({
                width: this.options.width,
                height: this.options.height
            });
            this.row2.css("height", this.box.height()-this.row1.outerHeight());
            this.pane.css("width", this.row2.width()-this.sidebar.outerWidth());
        },

        _bind: function() {
            var this_ = this;

            // show context menu on tabs
            this.tabList.on("contextmenu", "li", function(event) {
                this_._showTabCtxMenu($(this), event.pageX, event.pageY);
                event.preventDefault();
            });

            // hide context menu on click anywhere
            $("body").on("click", function(event) {
                this_.tabCtxMenu.hide();
            });

            // close tab
            this.tabCtxMenu.children(".webvsed-tabctx-close").on("click", function() {
                this_._closeTab(this_._tabCtxMenuCurrentTab);
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
                this_._treeSelectNode(ui.newTab.data("webvsedComponentId"));
            });

            // set option in webvs when form value changes
            this.tabs.on("change", ".webvsed-form", function(event) {
                this_._setWebvsOption($(this), $(event.target));
            });
        },

        _showTabCtxMenu: function(tab, x, y) {
            this._tabCtxMenuCurrentTab = tab;
            this.tabCtxMenu.css({left: x, top: y}).show();
        },

        _setWebvsOption: function(form, field) {
            var componentId = form.parent().data("webvsedComponentId");
            var node = this.tree.tree("getNodeById", componentId);

            var path = [];
            field.parents(".alpaca-fieldset-item-container").each(function() {
                path.push($(this).data("alpacaItemContainerItemKey"));
            });
            path.reverse();

            var value = Alpaca(form.get()).getControlByPath(path.join("/")).getValue();
            node.component.setOption(path.join("."), value);
        },

        _treeSelectNode: function(id) {
            if(this.tree.tree("getSelectedNode").id == id) {
                return;
            }
            var node = this.tree.tree("getNodeById", id);
            this.tree.tree("selectNode", node);
        },

        _closeTab: function(tab) {
            var componentId = tab.data("webvsedComponentId");
            tab.remove();
            $("#webvsed-"+componentId).remove();
            this.tabs.tabs("refresh");
            var index = this._openTabs.indexOf(componentId);
            this._openTabs.splice(index, 1);
            if(this.tree.tree("getSelectedNode").id == componentId && this._openTabs.length > 0) {
                index = Math.min(index, this._openTabs.length-1);
                this.tabs.tabs({active: index});
                this._treeSelectNode(this._openTabs[index]);
            }
        },

        _showTab: function(node) {
            if(this._openTabs.indexOf(node.id) != -1) {
                // switch to open tab
                var index = $("#webvsed-"+node.id).index()-1;
                this.tabs.tabs("option", "active", index);
                return;
            }

            // create the tab
            this.tabList.append("<li data-webvsed-component-id='"+node.id+"'><a href='#webvsed-"+node.id+"'>"+node.name+"</a></li>");

            // create the tab pane
            var componentClass = Webvs.getComponentClassName(node.component.constructor);
            if(componentClass in webvsFormdefs) {
                var tabContent = $("<div data-webvsed-component-id='"+node.id+"' id='webvsed-"+node.id+"'><div class='webvsed-form'></div></div>");
                this.tabs.append(tabContent);
                var alpacaOpts = { data: node.component.opts };
                $.extend(alpacaOpts, webvsFormdefs[componentClass]);
                tabContent.find(".webvsed-form").alpaca(alpacaOpts);
            } else {
                this.tabs.append("<div id='webvsed-"+node.id+"'>UI not defined</div>");
            }
            
            // refresh and set the active tab
            this.tabs.tabs("refresh");
            this.tabs.tabs("option", "active", this._openTabs.length);
            this._openTabs.push(node.id);
        }
    });

})(jQuery);
