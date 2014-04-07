module.exports = function(grunt) {
    var jsFiles = [
        "src/js/Base.js",
        "src/js/fields/Field.js",
        "src/js/fields/TextField.js",
        "src/js/fields/IntegerField.js",
        "src/js/fields/BooleanField.js",
        "src/js/fields/EnumField.js",
        "src/js/fields/ContainerField.js",
        "src/js/fields/ArrayField.js",
        "src/js/fields/ObjectField.js"
    ];

    var lessFiles = [
        "src/less/**/*.less"
    ];

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', "js/**/*.js"],
            options: {
                globals: {
                    WebvsEd: true
                },
                evil: true
            }
        },

        uglify: {
            dev: {
                options: {
                    sourceMap: true,
                    sourceMapName: "build/jsSourceMap.map"
                },
                files: {
                    "build/webvsed.js": jsFiles,
                }
            },
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

    // Default task.
    grunt.registerTask('default', ['jshint', 'clean', 'uglify:dev', 'less:dev']);
    grunt.registerTask('dist', ['jshint', 'clean', 'uglify:dist', 'less:dist']);
    grunt.registerTask("debug", ["connect", "watch"]);
};
