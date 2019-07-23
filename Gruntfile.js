module.exports = function(grunt) {
    //Grunt 配置.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //压缩js
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        //代码检测
        jshint: {
            files: ['*.js'],
            options: {
                "strict": true,
                "globalstrict"  : true,
                "node":true,
                "browser":true,
                globals: {
                    exports: true
                }
            }
        },

        //生成API文档
        jsdoc : {
            dist : {
                src: ['*.js'],
                options: {
                    destination: 'doc'
                }
            }
        },

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                }
            },
            demo:{
                files: {
                    './src/app/build/app.js': ['./src/app/app.main.js']
                }
            }
        },
    });
     // 加载包含 "uglify" 任务的插件。
     grunt.loadNpmTasks('grunt-contrib-uglify');
     // 加载包含 "jshint" 任务的插件。
     grunt.loadNpmTasks('grunt-contrib-jshint');
     //加载包含 "browserify" 任务的插件。
     grunt.loadNpmTasks('grunt-browserify');
     grunt.loadNpmTasks('grunt-jsdoc');
     // 默认被执行的任务列表。
     grunt.registerTask('default', ['concat','uglify','jshint']);
     grunt.registerTask('app', ['browserify:demo']);
};