/**
 * Created by henry on 15-12-7.
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/main.js',
                dest: 'build/app.min.js'
            }
        },
        clean: {
            build:["./build"],
            release:["./release"]
        },
        copy:{
            v1:{
                files:[
                    {expand:true, cwd: './src/v1', src:["./image/**"], dest:"./build/v1"},
                    {expand:true, cwd: './src/v1', src:["./css/ie-css3.htc"], dest:"./build/v1"}
                ]
            },
            v2:{
                files:[
                    {expand:true, cwd: './src/v2', src:["./image/**", "./fonts/**"], dest:"./build/v2"}
                ]
            },
            release:{
                files:[
                    {expand:true, cwd: './build', src:["./*/image/**","./*/fonts/**"], dest:"./release/build"},
                    {expand:false, cwd: './', src:["./index.html"], dest:"./release/index.html"}
                ]
            }
        },
        requirejs: {
            v1: {
                options: {
                    baseUrl: "src/v1/app",
                    mainConfigFile: "./src/v1/app/config.js",
                    name: "main",
                    include:["../../../node_modules/almond/almond"],
                    out: "build/v1/app.min.js"
                }
            },
            v2: {
                options: {
                    baseUrl: "src/v2/app",
                    mainConfigFile: "./src/v2/config.js",
                    name: "main",
                    include:["../../../node_modules/almond/almond"],
                    out: "build/v2/app.min.js"
                }
            }
        },
        cssmin: {
            options: {
                compatibility : 'ie8',
                shorthandCompacting: false,
                roundingPrecision: -1,
                keepSpecialComments: 0
            },
            v1: {
                files: {
                    'build/v1/css/main.min.css': ['./src/v1/css/main.css']
                }
            },
            v2: {
                files: {
                    'build/v2/css/main.min.css': ['./src/v2/css/main.css']
                }
            }
        },
        'string-replace': {
            release: {
                files: {
                    'release/': ['build/*/*/*.css','build/*/*.js','build/*.js']
                },
                options: {
                    replacements: [{
                        pattern: /usingnet\.net/ig,
                        replacement: 'usingnet.com'
                    }]
                }
            }
        },
        'watch': {
            v1:{
                files: 'src/v1/**/*.*',
                tasks: ['build:v1']
            },
            v2:{
                files: 'src/v2/**/*.*',
                tasks: ['build:v2']
            }
        },

        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            v1: {
                src: ['build/v1/**/*.{css,js}']
            },
            v2: {
                src: ['build/v2/**/*.{css,js}']
            }
        },

        updaterev:{
            v1:{
                src: ['build/app.min.js', 'build/v1/**/*.{css,js}'],
                pwd:'build/v1'
            },
            v2:{
                src: ['build/app.min.js', 'build/v2/**/*.{css,js}'],
                pwd:'build/v2'
            }
        }
    });

    grunt.task.registerMultiTask('updaterev', 'Update Reversion', function(){
        for(var i = 0;this.data.src && i<this.data.src.length;i++){
            var paths = grunt.file.expand(this.data.src[i]);
            for(var j=0;j<paths.length;j++){
                if(grunt.file.isFile(paths[j])){
                    var file_content = grunt.file.read(paths[j]);
                    for(var source in grunt.filerev.summary){
                        grunt.file.write(source, grunt.file.read(grunt.filerev.summary[source]));
                        file_content = file_content.replace(
                            new RegExp((source.replace(/(\W)/g,function(all, match){return '\\'+match;})), 'g'),
                            grunt.filerev.summary[source]
                        );
                        grunt.file.write(paths[j], file_content);
                    }
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-filerev');

    // Default task(s).
    grunt.registerTask('build:v1', ['clean:build', 'requirejs:v1', 'cssmin:v1', 'copy:v1', 'uglify', 'filerev:v1', 'updaterev:v1']);
    grunt.registerTask('build:v2', ['clean:build', 'requirejs:v2', 'cssmin:v2', 'copy:v2', 'uglify', 'filerev:v2', 'updaterev:v2']);
    grunt.registerTask('build', ['clean:build', 'requirejs:v1', 'cssmin:v1', 'copy:v1', 'requirejs:v2', 'cssmin:v2', 'copy:v2', 'uglify', 'filerev', 'updaterev']);
    grunt.registerTask('release', ['clean:release','build', 'copy:release', 'string-replace:release']);
    grunt.registerTask('default', ['release']);

};
