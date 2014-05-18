(function($, _, Backbone) {
    var FormDefs = {};
    WebvsEd.FormDefs = FormDefs;

    FormDefs.Default = function(component) {
        return {
            type: "JSONField",
            keyupChange: true,
            title: "Component Options",
            key: ".",
            model: component,
            reRender: true
        };
    };

    FormDefs.EffectList = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    label: "Output Blend Mode",
                    key: "output",
                    model: component,
                    enum: _.keys(Webvs.EffectList.ELBlendModes)
                },
                {
                    type: "EnumField",
                    label: "Input Blend Mode",
                    key: "input",
                    model: component,
                    enum: _.keys(Webvs.EffectList.ELBlendModes)
                },
                {
                    type: "BooleanField",
                    key: "clearFrame",
                    label: "Clear Frame",
                    model: component
                },
                {
                    type: "BooleanField",
                    key: "enableOnBeat",
                    label: "Enable on beat",
                    model: component
                },
                {
                    type: "NumberField",
                    label: "Enable on beat for",
                    key: "enableOnBeatFor",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 0
                    }
                },
                {
                    type: "ObjectField",
                    title: "Code",
                    collapsible: true,
                    collapsed: true,
                    key: "code",
                    model: component,
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
                        }
                    ]
                }
            ]
        };
    };

    FormDefs.Picture = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    enum: main.rsrcMan,
                    enumKey: WebvsEd.makeRsrcEnum,
                    default: "avsres_texer_circle_edgeonly_19x19.bmp",
                    label: "Image",
                    key: "src",
                    model: component
                },
                {
                    type: "NumberField",
                    label: "X Position",
                    key: "x",
                    model: component,
                    spinner: {
                        step: 0.01
                    }
                },
                {
                    type: "NumberField",
                    label: "Y Position",
                    key: "y",
                    model: component,
                    spinner: {
                        step: 0.01
                    }
                }
            ]
        };
    };

    FormDefs.ClearScreen = function(component) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "ColorField",
                    key: "color",
                    model: component,
                    label: "Clear Color",
                },
                {
                    type: "EnumField",
                    label: "Blend Mode",
                    key: "blendMode",
                    model: component,
                    enum: _.keys(Webvs.BlendModes)
                },
                {
                    type: "NumberField",
                    label: "Beat Count",
                    key: "beatCount",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 0
                    }
                }
            ]
        };
    };

    FormDefs.SuperScope = function(component) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    label: "Blend Mode",
                    key: "blendMode",
                    model: component,
                    enum: _.keys(Webvs.BlendModes)
                },
                {
                    type: "EnumField",
                    label: "Data Source",
                    key: "source",
                    model: component,
                    enum: _.keys(Webvs.Source)
                },
                {
                    type: "EnumField",
                    label: "Source Channel",
                    key: "channel",
                    model: component,
                    enum: _.keys(Webvs.Channels)
                },
                {
                    type: "EnumField",
                    label: "Draw Mode",
                    key: "drawMode",
                    model: component,
                    enum: _.keys(Webvs.SuperScope.DrawModes)
                },
                {
                    type: "NumberField",
                    label: "Thickness",
                    key: "thickness",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 1
                    }
                },
                {
                    type: "NumberField",
                    label: "Clone",
                    key: "clone",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 1
                    }
                },
                {
                    type: "NumberField",
                    label: "Color Cycle Speed",
                    key: "cycleSpeed",
                    model: component,
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
                    model: component,
                    collapsible: true,
                    collapsed: true,
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
                    key: "code",
                    model: component,
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
    };

})(jQuery, _, Backbone);
