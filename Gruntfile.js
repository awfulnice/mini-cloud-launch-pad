// Gruntfile.js
module.exports = function(grunt) {

	grunt
			.initConfig({
				pkg : grunt.file.readJSON('package.json'),
				karma : {
					unit : {
						options : {
							frameworks : [ 'jasmine' ],
							singleRun : true,
							browsers : [ 'PhantomJS' ],
							files : [
									'public/libs/angular/angular.js',
									'public/libs/angular-mocks/angular-mocks.js',
									'public/libs/angular-bootstrap/ui-bootstrap.js',
									'public/libs/angular-route/angular-route.min.js',

									'public/src/app.js',
									'public/src/general/*.js',

									'test/**/*.js' ]
						}
					}
				},

				// JS TASKS
				// ================================================================
				// check all js files for errors
				jshint : {
					all : [ 'public/src/**/*.js' ]
				},

				// take all the js files and minify them into app.min.js
				uglify : {
					build : {
						files : {
							'public/dist/app.min.js' : [ 'public/src/**/*.js',
									'public/src/*.js' ]
						}
					}
				},

				// CSS TASKS
				// ===============================================================
				// process the less file to style.css
				less : {
					build : {
						files : {
							'public/dist/css/style.css' : 'public/src/css/style.less'
						}
					}
				},
				// take the processed style.css file and minify
				cssmin : {
					build : {
						files : {
							'public/dist/css/style.min.css' : 'public/dist/css/style.css'
						}
					}
				},

				// COOL TASKS
				// ==============================================================
				// watch css and js files and process the above tasks
				watch : {
					css : {
						files : [ 'public/src/css/**/*.less' ],
						tasks : [ 'less', 'cssmin' ]
					},
					js : {
						files : [ 'public/src/**/*.js' ],
						tasks : [ 'jshint', 'uglify' ]
					}
				},

				// watch our node server for changes
				nodemon : {
					dev : {
						script : 'server.js'
					}
				},
				// run watch and nodemon at the same time
				concurrent : {
					options : {
						logConcurrentOutput : true
					},
					tasks : [ 'nodemon', 'watch' ]
				},

				debug : {
					src : [ 'test/**/*.js' ],
					options : {
						output : 'docs/'
					}
				}

			});

	grunt.loadNpmTasks('grunt-docco');
	// load nodemon

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-karma');

	// grunt.registerTask('default', ['less', 'cssmin', 'jshint', 'uglify',
	// 'concurrent']);

	// Default task(s).
	grunt.registerTask('default', [ 'concurrent' ]);

	// Other tasks
	grunt.registerTask('ugly', [ 'less', 'cssmin', 'uglify', ]);
	// grunt.registerTask('test', [ 'jshint', 'karma' ]);
	grunt.registerTask('test', [ 'karma' ]);

	grunt.registerTask('doc', [ 'docco' ]);

	// register the nodemon task when we run grunt
	// grunt.registerTask('default', [ 'nodemon' ]);

};