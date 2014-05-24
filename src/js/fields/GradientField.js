(function($, _, Backbone) {

    WebvsEd.GradientField = WebvsEd.Field.extend({
        fieldName: "GradientField",

        template: _.template([
            "    <div title='Click to add color stops' class='gradient'></div>",
            "    <div class='color-stops'></div>",
            "<div class='color-picker'><input type'text'/></div>"
        ].join("")),

        colorStopTemplate: _.template([
            "<div title='Right-click to edit' class='color-stop'>&#x25B2;</div>",
        ].join("")),

        menuTemplate: _.template([
            "<ul class='ctxtmenu color-stop-menu'>",
            "    <li class='remove'><a href='#'><span class='ui-icon ui-icon-minus'></span>Remove</a></li>",
            "    <li class='edit-color'><a href='#'><span class='ui-icon ui-icon-pencil'></span>Edit Color</a></li>",
            "    <li class='set-position'><a href='#'><span class='ui-icon ui-icon-arrow-4'></span>Set Position</a></li>",
            "</ul>"
        ].join("")),

        events: _.extend({
            "click .gradient": "handleAddColorStop",
            "contextmenu .color-stop": "handleColorStopMenu",
            "change": "handleColorChange",
            "click .color-stop-menu .remove": "handleMenuRemove",
            "click .color-stop-menu .edit-color": "handleMenuEdit",
            "click .color-stop-menu .set-position": "handleMenuSetPosition",
            "drag": "handleDrag",
            "dragstop": "handleDragStop",
        }, WebvsEd.ArrayField.prototype.events),

        initialize: function(opts) {
            this.colorStops = [];
            this.gradientWidth = opts.gradientWidth || 450;
            this.colorStopWidth = opts.colorStopWidth || 20;
            WebvsEd.Field.prototype.initialize.call(this, opts);
        },

        parseValue: function(rawValue) {
            if(!_.isArray(rawValue)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be an array");
            }
            var isValidFormat = _.every(rawValue, function(item) {
                return (_.isNumber(item.index) &&
                        item.index >=0 &&
                        item.index <= 255 &&
                        _.isString(item.color));
            });
            if(!isValidFormat || rawValue.length < 2) {
                return new WebvsEd.InvalidValue(rawValue, "Invalid format");
            }
            return _.sortBy(rawValue, "index");
        },

        render: function() {
            WebvsEd.Field.prototype.render.call(this);
            this.fieldBody.append(this.template());
            this.colorPicker = this.$(".color-picker");
            this.colorPicker.css("position", "absolute").hide();
            this.colorPicker.find("input").spectrum({
                flat: true,
                showInput: true,
                showInitial: true,
                preferredFormat: "hex",
                cancelText: ""
            });

            this.ctxtMenu = $(this.menuTemplate());
            this.$el.append(this.ctxtMenu);
            this.ctxtMenu.menu().css("position", "absolute").hide();

            this.$(".color-stops").css("width", this.gradientWidth + this.colorStopWidth);
            this.$(".gradient").css("width", this.gradientWidth);

            $("body").on("click", _.bind(function(event) {
                if(!this.colorPicker.has(event.target).length) {
                    this.colorPicker.hide();
                } 
                this.ctxtMenu.hide();
            }, this));
        },

        renderValue: function() {
            this.$(".color-stops").empty();
            var maxWidth = this.gradientWidth;
            for(var i = 0;i < this.value.length;i++) {
                var stop = this.value[i];
                this.addColorStop((stop.index/255)*maxWidth, stop.color);
            }
            this.setGradient(this.value);
        },

        addColorStop: function(pos, color) {
            color = color || "#FFFFFF";
            var colorStop = $(this.colorStopTemplate());
            this.$(".color-stops").append(colorStop);
            colorStop.css({left: pos, width: this.colorStopWidth}).draggable({
                containment: "parent",
                axis: "x"
            });

            this.setColorStopColor(colorStop, color);
            colorStop.data("webvsedColor", color);
        },

        setColorStopColor: function(colorStop, color) {
            colorStop.css("color", color);
        },

        setGradient: function(stops) {
            var cssStops = _.map(stops, function(item) {
                return item.color + " " + ((item.index*100)/255) + "%";
            }).join(",");
            this.$(".gradient").css("background", "linear-gradient(to right,"+cssStops+")");
        },

        rebuildValue: function(noTrigger) {
            var stops = [];
            var gradientWidth = this.gradientWidth;
            this.$(".color-stops .color-stop").each(function() {
                var colorStop = $(this);
                stops.push({
                    index: Math.floor((colorStop.position().left*255)/gradientWidth),
                    color: colorStop.data("webvsedColor")
                });
            });
            stops = _.sortBy(stops, "index");
            this.setGradient(stops);
            if(!noTrigger) {
                this.cleanAndTrigger(stops);
            }
        },

        // event handlers

        handleDrag: function() {
            this.rebuildValue(true);
        },

        handleDragStop: function() {
            this.rebuildValue();
        },

        handleAddColorStop: function(event) {
            if(this.isEmpty(this.value)) {
                this.addColorStop(0, "#000000");
                var end = this.gradientWidth;
                this.addColorStop(end, "#FFFFFF");
            } else {
                var pos = event.pageX - this.$(".color-stops").offset().left - this.colorStopWidth/2;
                this.addColorStop(pos);
            }
            this.rebuildValue();
        },

        handleColorStopMenu: function(event) {
            var colorStop = $(event.target);
            var pos = colorStop.offset();
            pos.top += colorStop.outerHeight();
            this.ctxtMenu.css(pos).show();
            event.preventDefault();

            if(this.$(".color-stops .color-stop").length == 2) {
                this.ctxtMenu.find(".remove").hide();
            } else {
                this.ctxtMenu.find(".remove").show();
            }

            this.ctxtColorStop = colorStop;
        },

        handleColorChange: function(event, color) {
            this.colorPicker.hide();
            color = "#" + color.toHex();
            this.ctxtColorStop.data("webvsedColor", color);
            this.setColorStopColor(this.ctxtColorStop, color);
            this.rebuildValue();
        },

        handleMenuRemove: function() {
            this.ctxtColorStop.remove();
            this.ctxtColorStop= null;
            this.rebuildValue();
        },

        handleMenuEdit: function(event) {
            var pos = this.ctxtColorStop.offset();
            pos.top += this.ctxtColorStop.outerHeight();
            var color = this.ctxtColorStop.data("webvsedColor");
            // set color twice so that initial selection is cleared
            this.colorPicker.find("input").spectrum("set", color).spectrum("set", color);
            this.colorPicker.css(pos).show();
            this.ctxtMenu.hide();
            event.stopImmediatePropagation();
        },

        handleMenuSetPosition: function() {
            var position;
            var baseMessage = "Enter new position (0-255)";
            var message = baseMessage;
            while(true) {
                var input = prompt(message);
                if(_.isNull(input)) {
                    return;
                }
                position = parseInt(input);
                if(_.isNaN(position) || position > 255 && position < 0) {
                    message = "'" + input + "; is not a number between 0 and 255\n" + baseMessage;
                } else {
                    break;
                }
            }
            
            this.ctxtColorStop.css("left", (position/255)*this.gradientWidth);
            this.rebuildValue();
        }
    });

})(jQuery, _, Backbone);
