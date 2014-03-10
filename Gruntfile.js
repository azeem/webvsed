module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', "js/**/*.js"]
        },

        uglify: {
            dist: {
                files: {
                "dist/js/main.min.js": "js/**/*.js",
                }
            }
        },

        clean: {
            dist: ['dist/*']
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
                files: ["js/**/*.js", "css/**/*.css", "index.html"],
                tasks: ["jshint"],
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

    // Default task.
    grunt.registerTask('default', ['clean:dist', 'jshint', 'uglify:dist']);
    grunt.registerTask("debug", ["connect", "watch"]);
};
