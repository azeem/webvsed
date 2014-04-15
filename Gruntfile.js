module.exports = function(grunt) {
    var jsFiles = [
        "src/js/Base.js",
        "src/js/fields/Field.js",
        "src/js/fields/TextField.js",
        "src/js/fields/IntegerField.js",
        "src/js/fields/BooleanField.js",
        "src/js/fields/EnumField.js",
        "src/js/fields/TextAreaField.js",
        "src/js/fields/JSONField.js",
        "src/js/fields/ContainerField.js",
        "src/js/fields/ArrayField.js",
        "src/js/fields/ObjectField.js",
        "src/js/FormDefs.js",
        "src/js/PanelsView.js",
        "src/js/EditorView.js"
    ];

    var lessFiles = [
        "src/less/**/*.less"
    ];

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', "src/js/**/*.js"],
            options: {
                globals: {
                    WebvsEd: true
                },
                evil: true
            }
        },

        concat: {
            dev: {
                files: {
                    "build/webvsed.js": jsFiles,
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    "build/webvsed.min.js": jsFiles,
                }
            }
        },

        less: {
           dev: {
                options: {
                    sourceMap: true,
                    sourceMapName: "build/lessSourceMap.map"
                },
                files: {
                    "build/webvsed.css": lessFiles
                }
            },
            dist: {
                files: {
                    "build/webvsed.min.css": lessFiles
                }
            }
        },

        clean: {
            build: ['build/*'],
        },

        connect: {
            server: {
                options: {
                    port: 8000,
                    base: ".",
                    directory: ".",
                    livereload: true
                }
            }
        },

        watch: {
            app: {
                files: ["src/**/*", "examples/**/*"],
                tasks: ["default"],
                options: {
                    livereload: true
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-concat");

    // Default task.
    grunt.registerTask('default', ['jshint', 'clean', 'concat:dev', 'less:dev']);
    grunt.registerTask('dist', ['jshint', 'clean', 'uglify:dist', 'less:dist']);
    grunt.registerTask("debug", ["default", "connect", "watch"]);
};
