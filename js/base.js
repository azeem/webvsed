(function($, _, Backbone) {
    
    WebvsEd = {};
    window.WebvsEd = WebvsEd;


    WebvsEd.cssPrefix = "webvsed";
    WebvsEd.getClass = function() {
        return (_.map(arguments, function(className) {
            return WebvsEd.cssPrefix + "-" + className;
        }).join(" "));
    };

    WebvsEd.makeField = function(opts) {
        var fieldClass = WebvsEd[opts.type];
        if(!fieldClass) {
            throw new Error("Unknown field class " + fieldClass);
        }
        return (new fieldClass(opts));
    };

})(jQuery, _, Backbone);
