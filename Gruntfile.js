/*jshint ignore:start*/
//Wrapper function with one parameter
module.exports = function(grunt) {
    var bannerContent = '/*! <%= pkg.name %> v<%= pkg.version %> - ' +
                     '<%= grunt.template.today("yyyy-mm-dd") %> \n' +
                     ' *  License: <%= pkg.license %> */\n';
    var name = '<%= pkg.name %>-v<%= pkg.version%>';
    
    var latest = '<%= pkg.name %>';
   
    var devRelease = 'distrib/'+name+'.js';
    var minRelease = 'distrib/'+name+'.min.js';
    var sourceMapMin = 'distrib/'+name+'.min.js';
    var sourceMapUrl = name+'.min.js';
   
    var lDevRelease = 'distrib/'+latest+'.js';
    var lMinRelease = 'distrib/'+latest+'.min.js';
    var lSourceMapMin = 'distrib/'+latest+'.min.js.map';
    
    
    var inputFiles = ['sylvester.js',
                      'emitter.js',
                      'js/**/*.js'];
    
    var rjsshims = {
        gunzip:  {
            exports: 'Zlib.Gunzip'
        },
        inflate: {
            exports: 'Zlib.Inflate'
        }
    };
    
    var rjspaths = {
        "canvasGameEngine": "../canvasGameEngine",
        gunzip: "../node_modules/zlibjs/bin/gunzip.min",
        inflate: "../node_modules/zlibjs/bin/inflate.min"
    };
    
    grunt.initConfig({
        // pkg is used from templates and therefore
        // MUST be defined inside initConfig object
        pkg : grunt.file.readJSON('package.json'),
        copy: {
            development: { // copy non-minified release file
                src: devRelease,
                dest: lDevRelease
            },
            minified: { // copy minified release file
                src: minRelease,
                dest: lMinRelease
            },
            smMinified: { // source map of minified release file
                src: sourceMapMin,
                dest: lSourceMapMin
            }
        },
        uglify: {
            options: {
                banner: bannerContent,
                sourceMapRoot: '../',
                sourceMap: 'distrib/'+name+'.min.js.map',
                sourceMapUrl: name+'.min.js.map'
            },
            target : {
                src : inputFiles,
                dest : 'distrib/' + name + '.min.js'
            }
        },
        // concat configuration
        concat: {
            options: {
                banner: bannerContent
            },
            target : {
                src : inputFiles,
                dest : 'distrib/' + name + '.js'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            target: {
                src : ['canvasGameEngine.js', 'canvasGameEngine/**/*.js']
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: "lib",
                    paths: rjspaths,
                    include: ["../tools/almond", "canvasGameEngine"],
                    exclude: ["jquery"],
                    out: "dist/canvasGameEngine.min.js",
                    wrap: {
                        "startFile": "tools/wrap.start",
                        "endFile": "tools/wrap.end"
                    },
                    optimize: "uglify2",
                    shim: rjsshims,
                    generateSourceMaps: true,
                    preserveLicenseComments: false
                }
            },
            compileUnopt: {
                options: {
                    baseUrl: "lib",
                    paths: rjspaths,
                    include: ["../tools/almond", "canvasGameEngine"],
                    exclude: ["jquery"],
                    out: "dist/canvasGameEngine.js",
                    wrap: {
                        "startFile": "tools/wrap.start",
                        "endFile": "tools/wrap.end"
                    },
                    optimize: "none",
                    shim: rjsshims,
                    generateSourceMaps: true,
                    preserveLicenseComments: false
                }
            }
            
        }
    });
    
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
    
  grunt.registerTask('default', ['jshint', 'requirejs']);

};