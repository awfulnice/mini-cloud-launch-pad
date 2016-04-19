// Gruntfile.js
module.exports = function(grunt) {

  grunt.initConfig({

    // configure nodemon
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    debug: {
        src: ['test/**/*.js'],
        options: {
          output: 'docs/'
        }
      }

  });

  
  grunt.loadNpmTasks('grunt-docco');
  // load nodemon
  grunt.loadNpmTasks('grunt-nodemon');

  // register the nodemon task when we run grunt
  grunt.registerTask('default', ['nodemon']);  

};