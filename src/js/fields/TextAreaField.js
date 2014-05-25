(function($, _, Backbone) {

    WebvsEd.TextAreaField = WebvsEd.Field.extend({
        fieldName: "TextAreaField",

        textAreaTemplate: _.template("<textarea rows='<%= rows %>' cols='<%= cols %>' class='text'></textarea>"),

        events: _.extend({
            "change .text": "handleChange",
            "keyup .text": "handleChange",
        }, WebvsEd.Field.prototype.events),

        initialize: function(opts) {
            this.rows = opts.rows || 10;
            this.cols = opts.cols || 50;

            this.keyupChange = opts.keyupChange?true:false;
            this.debounceWait = _.isUndefined(opts.debounceWait)?1000:opts.debounceWait;

            if(this.keyupChange) {
                this.debouncedChangeValue = _.debounce(_.bind(this.changeValue, this), this.debounceWait);
            }

            WebvsEd.Field.prototype.initialize.call(this, opts);
        },

        renderField: function() {
            WebvsEd.Field.prototype.renderField.call(this);
            this.fieldBody.append(this.textAreaTemplate({
                rows: this.rows,
                cols: this.cols
            }));
        },
        
        isEmpty: function(value) {
            return (WebvsEd.Field.prototype.isEmpty(value) || value === "");
        },

        renderValue: function() {
            this.$closest(".text").val(_.isNull(this.value)?"":this.value);
        },

        changeValue: function() {
            this.cleanAndTrigger(this.$closest(".text").val());
        },

        handleChange: function(event) {
            if(event.type == "keyup" && this.keyupChange) {
                this.debouncedChangeValue();
            } else if(event.type == "change") {
                this.changeValue();
            }
        }
    });

})(jQuery, _, Backbone);
