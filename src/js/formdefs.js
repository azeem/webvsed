(function($, _, Backbone) {
    var FormDefs = {};
    WebvsEd.FormDefs = FormDefs;

    FormDefs.Default = {
        type: "JSONField",
        keyupChange: true,
        title: "Component Options"
    };

    FormDefs.Main = {
        type: "ObjectField",
        noTrigger: true,
        fields: [
            {
                type: "ObjectField",
                key: "meta",
                title: "Meta",
                noChangeBubble: true,
                collapsible: true,
                collapsed: true,
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
                        default: ""
                    }
                ]
            },
            {
                type: "BooleanField",
                key: "clearFrame",
                label: "Clear Frame"
            },
        ]
    };

})(jQuery, _, Backbone);
