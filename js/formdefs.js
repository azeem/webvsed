(function($) {
    var FormDefs = {};
    window.webvsFormdefs = FormDefs;

    function getEnumKeys(obj) {
        var keys = [];
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }

    FormDefs.Default = {
        "schema": {
            "type": "string",
            "title": "Options (JSON)"
        },
        "options": {
            "type": "json"
        }
    };

    FormDefs.SuperScope = {
        "schema": {
            "type": "object",
            "properties": {
                "blendMode": {
                    "title": "Output blend mode",
                    "required": true,
                    "enum": getEnumKeys(Webvs.BlendModes)
                },
                "channel": {
                    "title": "Sound channel",
                    "required": true,
                    "enum": getEnumKeys(Webvs.Channels)
                },
                "source": {
                    "title": "Scope data source",
                    "required": true,
                    "enum": getEnumKeys(Webvs.Source)
                },
                "drawMode": {
                    "title": "Drawing mode",
                    "required": true,
                    "enum": getEnumKeys(Webvs.SuperScope.DrawModes)
                },
                "thickness": {
                    "title": "Line/Dot thickness",
                    "type": "integer",
                    "minimum": 1
                },
                "clone": {
                    "title": "Instance clones",
                    "type": "integer",
                    "minimum": 1
                },
                "code": {
                    "title": "Code",
                    "type": "object",
                    "properties": {
                        "init": {
                            "title": "Initialization",
                            "type": "string"
                        },
                        "onBeat": {
                            "title": "On Beat",
                            "type": "string"
                        },
                        "perFrame": {
                            "title": "Per Frame",
                            "type": "string"
                        },
                        "perPoint": {
                            "title": "Per Point",
                            "type": "string"
                        }
                    }
                }
            }
        },
        "options": {
            "fields": {
                "thickness": {
                    "size": 4
                },
                "clone": {
                    "size": 4
                },
                "code": {
                    "collapsed": true,
                    "fields": {
                        "init": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        },
                        "onBeat": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        },
                        "perFrame": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        },
                        "perPoint": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        }
                    }
                }
            }
        }
    };

    FormDefs.DynamicMovement = {
        "schema": {
            "type": "object",
            "properties": {
                "noGrid": {
                    "title": "Disable interpolation",
                    "type": "boolean"
                },
                "gridW": {
                    "title": "Grid width",
                    "type": "integer",
                    "dependencies": "noGrid"
                },
                "gridH": {
                    "title": "Grid height",
                    "type": "integer",
                    "dependencies": "noGrid"
                },
                "blend": {
                    "title": "Blend output",
                    "type": "boolean"
                },
                "compat": {
                    "title": "AVS compaibility mode",
                    "type": "boolean"
                },
                "bFilter": {
                    "title": "Bilinear filtering",
                    "type": "boolean"
                },
                "coord": {
                    "required": true,
                    "title": "Coordinate mode",
                    "enum": getEnumKeys(Webvs.DynamicMovement.CoordModes)
                },
                "code": {
                    "title": "Code",
                    "type": "object",
                    "properties": {
                        "init": {
                            "title": "Initialization",
                            "type": "string"
                        },
                        "onBeat": {
                            "title": "On Beat",
                            "type": "string"
                        },
                        "perFrame": {
                            "title": "Per Frame",
                            "type": "string"
                        },
                        "perPixel": {
                            "title": "Per Pixel",
                            "type": "string"
                        }
                    }
                }
            }
        },
        "options": {
            "fields": {
                "noGrid": {
                    "fieldClass": "alpaca-no-label",
                    "rightLabel": "Disable interpolation",
                },
                "gridW": {
                    "size": 4,
                    "dependencies": {
                        "noGrid": false
                    }
                },
                "gridH": {
                    "size": 4,
                    "dependencies": {
                        "noGrid": false
                    }
                },
                "blend": {
                    "fieldClass": "alpaca-no-label",
                    "rightLabel": "Blend output",
                },
                "compat": {
                    "fieldClass": "alpaca-no-label",
                    "rightLabel": "AVS compaibility mode",
                },
                "bFilter": {
                    "fieldClass": "alpaca-no-label",
                    "rightLabel": "Bilinear filtering",
                },
                "code": {
                    "collapsed": true,
                    "fields": {
                        "init": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        },
                        "onBeat": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        },
                        "perFrame": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        },
                        "perPixel": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea"
                        }
                    }
                }
            }
        }
    };

    FormDefs.BufferSave = {
        "schema": {
            "type": "object",
            "properties": {
                "action": {
                    "title": "Action",
                    "required": true,
                    "enum": getEnumKeys(Webvs.BufferSave.Actions)
                },
                "bufferId": {
                    "title": "Buffer index",
                    "type": "integer",
                    "minimum": 1
                },
                "blendMode": {
                    "title": "Output blend mode",
                    "required": true,
                    "enum": getEnumKeys(Webvs.BlendModes)
                },
            }
        },
        "options": {
            "fields": {
                "bufferId": {
                    "size": 4,
                },
                "action": {
                    "optionLabels": {
                        "SAVE": "Save",
                        "RESTORE": "Restore",
                        "SAVERESTORE": "Save and Restore",
                        "RESTORESAVE": "Restore and Save"
                    }
                }
            }
        }
    };

    FormDefs.EffectList = {
        "schema": {
            "type": "object",
            "properties": {
                "output": {
                    "title": "Output blend mode",
                    "required": true,
                    "enum": getEnumKeys(Webvs.EffectList.ELBlendModes)
                },
                "input": {
                    "title": "Input blend mode",
                    "required": true,
                    "enum": getEnumKeys(Webvs.EffectList.ELBlendModes)
                },
                "clearFrame": {
                    "title": "Clear every frame",
                    "type": "boolean"
                },
                "enableOnBeat": {
                    "title": "Enable only on beat",
                    "type": "boolean"
                },
                "enableOnBeatFor": {
                    "title": "Enable frame count",
                    "type": "integer",
                    "minimum": 1,
                    "dependencies": "enableOnBeat"
                },
                "code": {
                    "title": "Code",
                    "type": "object",
                    "properties": {
                        "init": {
                            "title": "Initialization",
                            "type": "string"
                        },
                        "perFrame": {
                            "title": "Per Frame",
                            "type": "string"
                        }
                    }
                }
            }
        },
        "options": {
            "fields": {
                "clearFrame": {
                    "fieldClass": "alpaca-no-label",
                    "rightLabel": "Clear every frame"
                },
                "enableOnBeat": {
                    "fieldClass": "alpaca-no-label",
                    "rightLabel": "Enable only on beat"
                },
                "enableOnBeatFor": {
                    "size": 4,
                    "dependencies": {
                        "enableOnBeat": true
                    }
                },
                "code": {
                    "collapsed": true,
                    "fields": {
                        "init": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea",
                        },
                        "perFrame": {
                            "fieldClass": "alpaca-code-textarea",
                            "type": "textarea",
                        }
                    }
                }
            }
        }
    };

})(jQuery);
