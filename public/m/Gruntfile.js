/**
 * Created by henry on 16-2-19.
 */

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        dirs: {
            src: 'src',
            dest: 'build',
            tmp:'.tmp'
        },
        /**
         * 0. clean all v
         * 1. concat pages dir pages.html  v
         * 2. main.html include pages.html v
         * 3. concat vendor js v
         * 4. concat main js v
         * 5. concat main css v
         * 6. copy to build v
         * 7. replace js, css v
         * 8. minhtml v
         * 9. clean tmp
         * 10. watch
         **/
        clean: {
            all: ["<%= dirs.dest %>", "<%= dirs.tmp %>"],
            tmp: ["<%= dirs.tmp %>"]
        },

        concat:{
            pages:{
                src:['<%= dirs.tmp %>/include/pages/*.html'],
                dest: '<%= dirs.tmp %>/pages',
                options:{
                    separator:'\n',
                    process: function(source, path) {
                        var name = path.match(/(\w+)\.html/)[1];
                        if(name == 'index'){
                            return '<div class="page page-current" id="' + name + '">' + source + '</div>';
                        }else{
                            return '<div class="page" id="' + name + '">' + source + '</div>';
                        }
                    }
                }
            },
            vendor:{
                src:['node_modules/zepto/zepto.min.js',
                    '<%= dirs.src %>/app/msui/sm.config.js',
                    '<%= dirs.src %>/app/msui/sm.min.js',
                    '<%= dirs.src %>/app/msui/sm-extend.min.js'],
                dest: '<%= dirs.tmp %>/app/vendor.js'
            }
        },

        copy:{
            //index:{
            //    src: '<%= dirs.src %>/index.html',
            //    dest: '<%= dirs.tmp %>/index.html'
            //},
            build:{
                files:[
                    {expand:true, src:[
                        'image/**',
                        'font/**'
                    ], dest:"./<%= dirs.dest %>", cwd: './<%= dirs.src %>'},
                    {expand: true, src:[
                        'css/main.min.css',
                        'index.html',
                        'app/main.min.js'
                    ], dest:'./<%= dirs.dest %>/', cwd:'./<%= dirs.tmp %>'}
                ]
            }
        },

        include:{
            pages:{
                src:['pages/*.html'],
                dest: '<%= dirs.tmp %>/include',
                cwd:'<%= dirs.src %>/app/'
            },
            index_prepare:{
                src:['index.html'],
                dest: '<%= dirs.tmp %>',
                cwd:'<%= dirs.src %>/',
                ignore_not_exists: true
            },
            index:{
                src:['index.html'],
                dest: '<%= dirs.tmp %>',
                cwd:'<%= dirs.tmp %>/'
            }
        },


        requirejs:{
            build: {
                options: {
                    baseUrl: "<%= dirs.src %>/app",
                    mainConfigFile: "<%= dirs.src %>/config.js",
                    name: "main",
                    include:["../../node_modules/almond/almond"],
                    out: "<%= dirs.tmp %>/app/main.min.js"
                }
            }
        },

        cssmin: {
            main:{
                files:[
                    {src:'<%= dirs.src %>/css/main.css', dest:'<%= dirs.tmp %>/css/main.min.css'}
                ]
            }
        },

        uglify:{
            vendor:{
                files:[
                    {src:'<%= dirs.tmp %>/app/vendor.js', dest:'<%= dirs.dest %>/app/vendor.min.js'}
                ]
            }
        },

        useminPrepare: {
            html: '<%= dirs.tmp %>/index.html',
            options: {
                dest: 'build',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            build: {
                src: ['<%= dirs.dest %>/app/vendor.min.js', '<%= dirs.dest %>/app/main.min.js', '<%= dirs.dest %>/css/main.min.css']
            }
        },

        usemin: {
            html: ['build/index.html'],
            css: ['build/css/main.css'],
            options: {
                assetsDirs: [

                ]
            }
        },

        htmlmin:{
            build:{
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files:{
                    'build/index.html':'build/index.html'
                }
            }
        },

        watch: {
            debug: {
                files: ['src/app/pages/**/*.html'],
                tasks: ['clean:tmp', 'pages'],
                options: {
                    spawn: false,
                    atBegin: true
                }
            }
        }

    });

    grunt.task.registerMultiTask('include', 'Include Html', function(){
        var srcs = typeof(this.data.src) == 'string' ? [this.data.src] : this.data.src;
        var cwd = this.data.cwd;
        var dest = this.data.dest;
        var ignore_not_exists = this.data.ignore_not_exists || false;

        var file_cache = {};
        var max_include_stack = this.data['max_include_stack'] || 10;
        var include_stack = 0;
        var error = null;

        function parsing_file(name){
            max_include_stack++;
            if(include_stack > max_include_stack){
                error = "include over max_include_stack.";
                return false;
            }

            if(typeof(file_cache[name]) == 'undefined'){
                if(grunt.file.isFile(name)){
                    file_cache[name] = grunt.file.read(name).replace(/<include\s+src=['|"]([^'^"]+)['|"]><\/include>/g, function(tag, include_src){
                        if(include_src=='/'){
                            include_src = grunt.file.expand(cwd+include_src.substr(1));
                        }else{
                            include_src = grunt.file.expand(name.replace(/\/[^\/]+$/, '')+'/'+include_src);
                        }
                        if(include_src.length==0){
                            return tag;
                        }
                        var html = '';
                        var dep;
                        while(dep = include_src.pop()){
                           var piece = parsing_file(dep);
                            if(piece) {
                                html += piece;
                            }else{
                                return tag;
                            }
                        }
                        return html;
                    });
                }else{
                    file_cache[name] = false;
                    if(ignore_not_exists){
                        return false;
                    }else{
                        error = 'Unabled to read file "' + name + '". Maybe you need ignore_not_exists option';
                        return false;
                    }
                }
            }

            if(include_stack > max_include_stack){
                error = "include over max_include_stack.";
                return false;
            }
            max_include_stack--;
            return file_cache[name];
        }

        for(var i=0;i<srcs.length;i++){
            var files = grunt.file.expand(cwd+srcs[i]);
            for(var j=0;j<files.length;j++){
                grunt.file.write(dest + '/' + (files[j].replace(cwd, '')), parsing_file(files[j]));
                if(error){
                    grunt.log.errorlns(error);
                    return false;
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
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-usemin');
    // Default task(s).

    grunt.registerTask('pages', [
        'include:pages',
        'concat:pages'
    ]);

    grunt.registerTask('build', [
        'clean:all',
        'useminPrepare',
        'pages',
        //'copy:index',
        'include:index_prepare',
        'include:index',
        'concat:vendor',
        'requirejs:build',
        'cssmin:main',
        'copy:build',
        'uglify:vendor',
        'filerev:build',
        'usemin',
        'htmlmin:build',
        'clean:tmp'
    ]);

    grunt.registerTask('default', ['build']);

};