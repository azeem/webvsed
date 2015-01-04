(function($, _, Backbone) {

    var MainForm = function(main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "ObjectField",
                    key: "meta",
                    title: "Meta",
                    model: main,
                    collapsible: true,
                    collapsed: false,
                    fields: [
                        {
                            type: "TextField",
                            key: "name",
                            title: "Preset Name",
                            required: false,
                            default: ""
                        },
                        {
                            type: "TextAreaField",
                            key: "description",
                            title: "Description",
                            required: false,
                            default: "",
                            rows: 8
                        }
                    ]
                },
                {
                    type: "ObjectField",
                    key: "resources",
                    title: "Resources",
                    collapsible: true,
                    collapsed: true,
                    fields: [
                        {
                            type: "KeyValueField",
                            key: "uris",
                            model: main.rsrcMan,
                            keyField: {
                                type: "TextField",
                                title: "Name"
                            },
                            valueField: {
                                type: "URIField",
                                title: "Resource",
                                key: "uri"
                            }
                        }
                    ]
                },
                {
                    type: "BooleanField",
                    key: "clearFrame",
                    label: "Clear Frame",
                    model: main.rootComponent
                },
            ]
        };
    };

    WebvsEd.MainPanelView = Backbone.View.extend({
        className: WebvsEd.getClass("main-panel"),

        initialize: function(opts) {
            this.main = opts.main;
        },

        render: function() {
            this.mainForm = WebvsEd.makeField(MainForm(this.main));
            this.$el.append(this.mainForm.el);
            this.mainForm.render();
        }
    });

})(jQuery, _, Backbone);
