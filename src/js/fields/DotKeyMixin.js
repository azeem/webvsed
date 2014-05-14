(function($, _, Backbone) {

    WebvsEd.DotKeyMixin = function(parentClass) {
        return {
            setKey: function(key) {
                if(key == ".") {
                    this.key = key;
                    if(this.model) {
                        this.stopListening(this.model);
                        this.listenTo(this.model, "change", this.handleModelChange);
                    }
                } else {
                    parentClass.prototype.setKey.call(this, key);
                }
            },

            setModelValue: function() {
                if(this.key == "." && this.valid && this.model) {
                    this.model.set(this.getValue(), {fid: this.fid});
                } else {
                    parentClass.prototype.setModelValue.call(this);
                }
            },

            getModelValue: function(key) {
                if(key == "." && this.model) {
                    return this.model.toJSON();
                } else {
                    return parentClass.prototype.getModelValue.call(this, key);
                }
            },

            handleModelChange: function(model, value, options) {
                if(this.key == ".") {
                    options = value;
                    value = this.model.toJSON();
                }
                parentClass.prototype.handleModelChange.call(this, model, value, options);
            }
        };
    };

})(jQuery, _, Backbone);
