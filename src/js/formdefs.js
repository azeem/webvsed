(function($, _, Backbone) {
    var FormDefs = {};
    WebvsEd.FormDefs = FormDefs;

    FormDefs.Default = {
        type: "JSONField",
        keyupChange: true,
        title: "Component Options"
    };


    FormDefs.Picture = function(rsrcEnumModel) {
        return {
            type: "ObjectField",
            noTrigger: true,
            fields: [
                {
                    type: "EnumField",
                    enum: rsrcEnumModel,
                    label: "Image",
                    key: "src"
                },
                {
                    type: "NumberField",
                    label: "X Position",
                    key: "x",
                    spinner: {
                        step: 0.01
                    }
                },
                {
                    type: "NumberField",
                    label: "Y Position",
                    key: "y",
                    spinner: {
                        step: 0.01
                    }
                }
            ]
        };
    };

    FormDefs.ClearScreen = {
        type: "ObjectField",
        noTrigger: true,
        fields: [
            {
                type: "ColorField",
                key: "color",
                label: "Clear Color",
            },
            {
                type: "EnumField",
                label: "Blend Mode",
                key: "blendMode",
                enum: _.keys(Webvs.BlendModes)
            },
            {
                type: "NumberField",
                label: "Beat Count",
                key: "beatCount",
                integer: true,
                spinner: {
                    min: 0
                }
            }
        ]
    };

    FormDefs.SuperScope = {
        type: "ObjectField",
        noTrigger: true,
        fields: [
            {
                type: "EnumField",
                label: "Blend Mode",
                key: "blendMode",
                enum: _.keys(Webvs.BlendModes)
            },
            {
                type: "EnumField",
                label: "Data Source",
                key: "source",
                enum: _.keys(Webvs.Source)
            },
            {
                type: "EnumField",
                label: "Source Channel",
                key: "channel",
                enum: _.keys(Webvs.Channels)
            },
            {
                type: "EnumField",
                label: "Draw Mode",
                key: "drawMode",
                enum: _.keys(Webvs.SuperScope.DrawModes)
            },
            {
                type: "NumberField",
                label: "Thickness",
                key: "thickness",
                integer: true,
                spinner: {
                    min: 1
                }
            },
            {
                type: "NumberField",
                label: "Clone",
                key: "clone",
                integer: true,
                spinner: {
                    min: 1
                }
            },
            {
                type: "NumberField",
                label: "Color Cycle Speed",
                key: "cycleSpeed",
                spinner: {
                    min: 0,
                    max: 1,
                    step: 0.01
                }
            },
            {
                type: "ArrayField",
                title: "Colors",
                key: "colors",
                collapsible: true,
                collapsed: true,
                noChangeBubble: true,
                arrayItem: {
                    type: "ColorField",
                    default: "#ffffff"
                }
            },
            {
                type: "ObjectField",
                title: "Code",
                collapsible: true,
                collapsed: true,
                noTrigger: true,
                key: "code",
                fields: [
                    {
                        type: "TextAreaField",
                        key: "init",
                        title: "Init",
                        rows: 5,
                        keyupChange: true,
                        required: false
                    },
                    {
                        type: "TextAreaField",
                        key: "perFrame",
                        title: "Per Frame",
                        rows: 5,
                        keyupChange: true,
                        required: false
                    },
                    {
                        type: "TextAreaField",
                        key: "onBeat",
                        title: "On Beat",
                        rows: 5,
                        keyupChange: true,
                        required: false
                    },
                    {
                        type: "TextAreaField",
                        key: "perPoint",
                        title: "Per Point",
                        rows: 5,
                        keyupChange: true,
                        required: false
                    }
                ]
            }
        ]
    };

})(jQuery, _, Backbone);
