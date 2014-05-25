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
                    },
                    hideWhen: {
                        key: "enableOnBeat",
                        condition: false
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

    // Trans

    FormDefs.ColorMap = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    key: "key",
                    enum: _.keys(Webvs.ColorMap.MapKey),
                    model: component,
                    label: "Map Key",
                },
                {
                    type: "EnumField",
                    key: "output",
                    enum: _.keys(Webvs.BlendModes),
                    model: component,
                    label: "Blend Mode",
                },
                {
                    type: "EnumField",
                    key: "mapCycleMode",
                    enum: _.keys(Webvs.ColorMap.MapCycleModes),
                    model: component,
                    label: "Map Cycle Mode",
                },
                {
                    type: "ArrayField",
                    title: "Color Maps",
                    key: "maps",
                    model: component,
                    collapsible: true,
                    collapsed: true,
                    arrayItem: {
                        type: "GradientField",
                        gradientWidth: 300,
                        default: [
                            {index: 0, color: "#000000"},
                            {index: 255, color: "#FFFFFF"}
                        ]
                    }
                }
            ]
        };
    };

    FormDefs.ColorClip = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    key: "mode",
                    enum: _.keys(Webvs.ColorClip.ClipModes),
                    model: component,
                    label: "Clip Mode",
                },
                {
                    type: "NumberField",
                    key: "level",
                    model: component,
                    label: "Near Level",
                    spinner: {
                        min: 0,
                        max: 1,
                        step: 0.01
                    },
                    hideWhen: {
                        key: "mode",
                        condition: "NEAR",
                        inverse: true
                    }
                },
                {
                    type: "ColorField",
                    key: "color",
                    model: component,
                    label: "Clip Color",
                },
                {
                    type: "ColorField",
                    key: "outColor",
                    model: component,
                    label: "Output Color",
                }
            ]
        };
    };

    FormDefs.DynamicMovement = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "BooleanField",
                    key: "bFilter",
                    model: component,
                    label: "Bilinear Filter",
                },
                {
                    type: "BooleanField",
                    key: "blend",
                    model: component,
                    label: "Blend Output",
                },
                {
                    type: "BooleanField",
                    key: "noGrid",
                    model: component,
                    label: "Disable Grid",
                },
                {
                    type: "NumberField",
                    label: "Grid Width",
                    key: "gridW",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 1
                    },
                    hideWhen: {
                        key: "noGrid",
                        condition: true
                    }
                },
                {
                    type: "NumberField",
                    label: "Grid Height",
                    key: "gridH",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 1
                    },
                    hideWhen: {
                        key: "noGrid",
                        condition: true
                    }
                },
                {
                    type: "EnumField",
                    key: "coord",
                    enum: _.keys(Webvs.DynamicMovement.CoordModes),
                    model: component,
                    label: "Coordinates Mode",
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
                            key: "perPixel",
                            title: "Per Pixel",
                            rows: 5,
                            keyupChange: true,
                            required: false
                        }
                    ]
                }
            ]
        };
    };

    FormDefs.FadeOut = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "ColorField",
                    key: "color",
                    model: component,
                    label: "Fade Color",
                },
                {
                    type: "NumberField",
                    label: "Fade speed",
                    key: "speed",
                    model: component,
                    spinner: {
                        min: 0,
                        max: 1,
                        step: 0.01
                    }
                }
            ]
        };
    };

    FormDefs.Convolution = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    enum: _.keys(Webvs.Convolution.EdgeModes),
                    label: "Edge Mode",
                    key: "edgeMode",
                    model: component
                },
                {
                    type: "BooleanField",
                    key: "autoScale",
                    label: "Auto Scale",
                    model: component
                },
                {
                    type: "NumberField",
                    label: "Scale",
                    key: "scale",
                    model: component,
                    hideWhen: {
                        key: "autoScale",
                        condition: true
                    }
                },
                {
                    type: "NumberField",
                    label: "Bias",
                    key: "bias",
                    model: component,
                },
                {
                    type: "MatrixField",
                    title: "Kernel",
                    key: "kernel",
                    model: component,
                    minSize: 3,
                    sizeStep: 2
                }
            ]
        };
    };

    // Render

    FormDefs.Texer = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "EnumField",
                    enum: main.rsrcMan,
                    enumKey: WebvsEd.makeRsrcEnum,
                    default: "avsres_texer_circle_edgeonly_19x19.bmp",
                    label: "Image",
                    key: "imageSrc",
                    model: component
                },
                {
                    type: "EnumField",
                    label: "Data Source",
                    key: "source",
                    model: component,
                    enum: _.keys(Webvs.Source)
                },
                {
                    type: "BooleanField",
                    key: "resizing",
                    label: "Resizing",
                    model: component
                },
                {
                    type: "BooleanField",
                    key: "wrapAround",
                    label: "Wrap Around",
                    model: component
                },
                {
                    type: "BooleanField",
                    key: "colorFiltering",
                    label: "Color Filtering",
                    model: component
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

    FormDefs.MovingParticle = function(component, main) {
        return {
            type: "ObjectField",
            fields: [
                {
                    type: "ColorField",
                    key: "color",
                    model: component,
                    label: "Color",
                },
                {
                    type: "NumberField",
                    label: "Distance",
                    key: "distance",
                    model: component,
                    spinner: {
                        min: 0,
                        step: 0.01
                    }
                },
                {
                    type: "NumberField",
                    label: "Particle Size",
                    key: "particleSize",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 0
                    }
                },
                {
                    type: "BooleanField",
                    key: "onBeatSizeChange",
                    label: "Change size on beat",
                    model: component
                },
                {
                    type: "NumberField",
                    label: "On beat size",
                    key: "onBeatParticleSize",
                    model: component,
                    integer: true,
                    spinner: {
                        min: 0
                    },
                    hideWhen: {
                        key: "onBeatSizeChange",
                        condition: false
                    }
                },
                {
                    type: "EnumField",
                    label: "Blend Mode",
                    key: "blendMode",
                    model: component,
                    enum: _.keys(Webvs.BlendModes)
                },
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
