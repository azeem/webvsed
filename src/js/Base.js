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

})(jQuery, _, Backbone);
