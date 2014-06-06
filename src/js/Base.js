(function($, _, Backbone) {
    
    /**
     * Webvs Editor namespace
     * @alias WebvsEd
     * @namespace
     */
    WebvsEd = {};
    window.WebvsEd = WebvsEd;


    /**
     * Prefix for all css classes
     */
    WebvsEd.cssPrefix = "webvsed";

    /**
     * Retruns prefixed css classes
     * @param {...string} classes - css classes to be prefixed
     * @returns {string} prefixed css classes separated by space
     */
    WebvsEd.getClass = function() {
        return (_.map(arguments, function(className) {
            return WebvsEd.cssPrefix + "-" + className;
        }).join(" "));
    };

    WebvsEd.FloatsMixin = function(constructor) {
        var oldInitialize = constructor.prototype.initialize;
        var oldRemove = constructor.prototype.remove;
        _.extend(constructor.prototype, {
            initialize: function(opts) {
                oldInitialize.call(this, opts);
                this.uniqFloatClass = "float-element-" + this.cid;

                if(this.floatEvents) {
                    for(var key in this.floatEvents) {
                        var callback = _.bind(this[this.floatEvents[key]], this);
                        key = $.trim(key);
                        var splitIndex = key.indexOf(" ");
                        var selector;
                        if(splitIndex >= 0) {
                            event = key.substr(0, splitIndex);
                            selector = "." + this.uniqFloatClass + $.trim(key.substr(splitIndex + 1));
                        } else {
                            event = key;
                            selector = "." + this.uniqFloatClass;
                        }
                        $("body").on(event, selector, callback);
                    }
                }
            },

            findFloat: function(selector) {
                return $("." + this.uniqFloatClass + selector);
            },

            floatElement: function(element) {
                var classes = "float-element " + this.uniqFloatClass + " " + (_.result(this, "floatClassName") || "");
                if(element.hasClass("ui-dialog-content")) {
                    element.dialog("option", "dialogClass", classes);
                } else {
                    element.addClass(classes);
                    $("body").append(element);
                }
            },

            remove: function() {
                oldRemove.call(this);
                $(this.uniqFloatClass).remove();
            }

        });
    };

    WebvsEd.makeRsrcEnum = function(rsrMan) {
        var uris = _.keys(rsrMan.get("uris"));
        var packs = rsrMan.get("packs");
        var enums = [];
        if(uris.length > 0) {
            enums.push({label: "Preset Resources", options: uris});
        }
        for(var i = 0;i < packs.length;i++) {
            var pack = packs[i];
            var label = pack.name || ("Pack " + i);
            enums.push({label: label, options: pack.fileNames});
        }
        return enums;
    };

    WebvsEd.isEventLike = function(obj) {
        return (
            "on"  in obj && _.isFunction(obj.on) &&
            "off" in obj && _.isFunction(obj.off)
        );
    };

    WebvsEd.buildAddComponentMenu = function(template) {
        if(!template) {
            template = _.template([
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
            ].join(""));
        }

        WebvsEd.addComponentBeforeOrInside = function(component, componentName) {
            var parentComponent, pos;
            if(component instanceof Webvs.Container) {
                parentComponent = component;
                pos = null;
            } else {
                parentComponent = component.parent;
                pos = parentComponent.components.indexOf(component);
            }
            parentComponent.addComponent({type: componentName}, pos);
        };
        
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

        var recurTemplate = function(menu) {
            return template({
                menu: menu,
                self: recurTemplate
            });
        };

        return recurTemplate(menu);
    };

})(jQuery, _, Backbone);
