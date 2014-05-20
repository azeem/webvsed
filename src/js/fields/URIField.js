(function($, _, Backbone) {

    WebvsEd.URIField = WebvsEd.Field.extend({
        fieldName: "URIField",

        urlPattern: /^(http|https):\/\/(([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|localhost)(\:[0-9]{1,5})?(([0-9]{1,5})?\/.*)?$/i,
        
        inputTemplate: _.template([
            "<div class='container'>",
            "    <div class='preview'></div>",
            "    <div class='line1'><input class='text' placeholder='Enter a URL or Browse' type='text'></div>",
            "    <div class='line2'>",
            "        <button title='Browse to add file as Data URI' class='browse'>Browse</button>",
            "        <input style='display:none' class='file-input' type='file'>",
            "    </div>",
            "</div>",
        ].join("")),

        events: _.extend({
            "click .browse": "handleBrowseClick",
            "change .file-input": "handleFileChange",
            "change .text": "handleTextChange",
            "focus .text": "handleTextFocus",
            "blur .text": "handleTextBlur",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            WebvsEd.Field.prototype.initialize.apply(this, arguments);
            this.isData = false;
        },

        parseValue: function(rawValue) {
            rawValue = WebvsEd.TextField.prototype.parseValue.call(this, rawValue);
            if(rawValue instanceof WebvsEd.InvalidValue) {
                return rawValue;
            }
            var value = $.trim(rawValue);
        },

        validate: function(value) {
            if(value.substring(0, 5) != "data:" && !this.urlPattern.test(value)) {
                return new WebvsEd.InvalidValue(rawValue, "Value should be a URL or a Data URI");
            }
        },

        postClean: function() {
            this.isData = false;
            this.mimeType = null;

            if(!this.valid) {
                return;
            }

            if(value.substring(0, 5) == "data:") {
                var mimeType = value.substring(5, value.indexOf(",")).split(";")[0];
                if(mimeType == "base64" || mimeType.indexOf("charset") === 0) {
                    mimeType = "text/plain";
                }
                this.mimeType = mimeType;
                this.isData = true;
                return value;
            }
        },

        isEmpty: function(value) {
            return (WebvsEd.Field.prototype.isEmpty(value) || value === "");
        },

        render: function() {
            WebvsEd.Field.prototype.render.apply(this, arguments);
            this.fieldBody.append(this.inputTemplate());
        },

        renderValue: function() {
            if(!this.isData) {
                this.$(".text").val(this.value);
            }
            this.setPreview();
            this.setDataPlaceHolder();
        },

        setPreview: function() {
            var preview = this.$(".preview");
            preview.css("background-image", "none");

            if(!this.valid || this.isEmpty(this.value)) {
                preview.html("<span>No Value</span>");
                return;
            }

            preview.html("<span>Loading Preview<span>");
            var image = new Image();
            image.src = this.value;
            image.onload = function() {
                preview.html("").css("background-image", "url(" + image.src + ")");
            };
            image.onerror = function() {
                preview.html("<span>No Preview Available<span>");
            };
        },

        unsetDataPlaceHolder: function() {
            this.$(".text").val("").removeClass("is-data");
        },

        setDataPlaceHolder: function() {
            var text = this.$(".text");
            if(this.isData) {
                text.val("[" + this.mimeType + " file]");
                text.addClass("is-data");
            } else {
                text.removeClass("is-data");
            }
        },

        // events

        handleTextFocus: function() {
            if(this.isData) {
                this.unsetDataPlaceHolder();
            }
        },

        handleTextBlur: function() {
            var text = this.$(".text");
            if(this.isData && text.val() === "") {
                this.setDataPlaceHolder();
            }
        },

        handleTextChange: function() {
            this.cleanAndTrigger(this.$(".text").val());
            this.setPreview();
            this.setDataPlaceHolder();
        },

        handleFileChange: function(event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = _.bind(function(event) {
                this.isData = true;
                this.cleanAndTrigger(event.target.result);
                this.setPreview();
                this.setDataPlaceHolder();
            }, this);
            reader.readAsDataURL(file);
        },

        handleBrowseClick: function() {
            this.$(".file-input").click();
        },
    });

})(jQuery, _, Backbone);
