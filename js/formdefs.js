(function($) {
    var FormDefs = {};
    window.webvsFormdefs = FormDefs;

    FormDefs.EffectList = {
        "schema": {
            "type": "object",
            "required": false,
            "properties": {
                "new1394600618312": {
                    "readonly": false,
                    "required": false,
                    "default": "",
                    "format": "",
                    "enum": [
                        "Replace",
                        "Additive",
                        "Maximum"
                    ]
                },
                "new1394600686252": {
                    "type": "boolean",
                    "required": false
                },
                "new1394600816270": {
                    "type": "boolean",
                    "required": false
                }
            }
        },
        "options": {
            "focus": false,
            "type": "object",
            "validate": true,
            "disabled": false,
            "showMessages": true,
            "collapsible": true,
            "legendStyle": "button",
            "fields": {
                "new1394600618312": {
                    "id": "",
                    "type": "select",
                    "validate": true,
                    "showMessages": true,
                    "disabled": false,
                    "hidden": false,
                    "label": "Output Blend Mode",
                    "fieldClass": "",
                    "hideInitValidationError": false,
                    "focus": false,
                    "name": "output",
                    "dataSource": "",
                    "multiple": false,
                    "size": -1,
                    "emptySelectFirst": true,
                    "readonly": false
                },
                "new1394600686252": {
                    "id": "",
                    "type": "checkbox",
                    "validate": true,
                    "showMessages": true,
                    "disabled": false,
                    "hidden": false,
                    "label": "Clear every frame",
                    "fieldClass": "",
                    "hideInitValidationError": false,
                    "focus": false,
                    "name": "clearFrame",
                    "rightLabel": ""
                },
                "new1394600816270": {
                    "id": "",
                    "type": "checkbox",
                    "validate": true,
                    "showMessages": true,
                    "disabled": false,
                    "hidden": false,
                    "label": "Enable On Beat",
                    "fieldClass": "",
                    "hideInitValidationError": false,
                    "focus": false,
                    "name": "enableOnBeat",
                    "rightLabel": ""
                }
            }
        }
    };

})(jQuery);
