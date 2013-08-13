/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: false,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
            "$": true,
            "Webvs": true,
            "SC": true,
            "_": true,
            "Dancer": true
        }
      },
      files: ['Gruntfile.js', "app/**/*.js"]
    },

    copy: {
        dev: {
            files: [
                {expand: true, flatten:false, cwd: "app/", src: ["./**/*.!(html)"], dest: "build/"},
            ]
        },
        dist: {
            files: [
                {dest:"dist/bootstrap",  cwd:"bower_components/bootstrap/bootstrap", src:"**/*",             expand:true, flatten:false},
                {dest:"dist/jquery-ui",  cwd:"bower_components/jquery-ui",           src:"themes/base/**/*", expand:true, flatten:false},
                {dest:"dist/css/jqtree.css",     src:"bower_components/jqtree/jqtree.css"},
                {dest:"dist/css/spectrum.css",   src:"bower_components/spectrum/spectrum.css"},
                {expand: true, flatten:false, cwd: "app/", src: ["./**/*.!(html|js)"], dest: "dist/"},
            ]
        },
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        files: {
            "dist/js/main.min.js": "app/js/editor.js",
            "dist/js/libs.min.js": [
                "bower_components/jquery/jquery.js",
                "bower_components/jquery-ui/ui/jquery-ui.js",
                "bower_components/underscore/underscore.js",
                "bower_components/dancer.js/lib/fft.js",
                "bower_components/dancer.js/dancer.js",
                "bower_components/stats.js/build/stats.min.js",
                "bower_components/spectrum/spectrum.js",
                "bower_components/jsonform/lib/jsonform.js",
                "bower_components/jqtree/tree.jquery.js",
                "bower_components/bootstrap/bootstrap/js/bootstrap.js",
                "bower_components/webvs/lib/D.min.js",
                "bower_components/webvs/dist/webvs.min.js"
            ]
        }
      }
    },

    preprocess: {
        dev: {
            options: {
                context: {
                    mode: "dev"
                }
            },
            files: {
                "build/index.html": "app/index.html",
            }
        },
        dist: {
            options: {
                context: {
                    mode: "dist"
                }
            },
            files: {
                "dist/index.html": "app/index.html",
            }
        }
    },

    clean: {
      dev: ['build/*'],
      dist: ['dist/*'],
    }
    /*watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
    }*/
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks("grunt-preprocess");

  // Default task.
  grunt.registerTask('default', ["clean:dev", 'jshint', 'copy:dev', 'preprocess:dev']);
  grunt.registerTask('dist', ["clean:dist", 'jshint', 'copy:dist', 'uglify', 'preprocess:dist']);

};
