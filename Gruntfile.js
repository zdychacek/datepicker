module.exports = function (grunt) {

	grunt.initConfig({
		watch: {
			options: {
				livereload: true
			},
			less: {
				files: ['app/**/*.less'],
				tasks: ['less']
			},
			jade: {
				files: [
					'app/**/*.jade'
				],
				tasks: ['jade']
			}
		},
	    connect: {
			server: {
				options: {
					port: 9001,
					base: 'app',
					keepalive: true
				}
			}
		},
		concurrent: {
			options: {
				logConcurrentOutput: true,
			},
			tasks: [
				'connect',
				'watch'
			]
		},
		jade: {
			development: {
				options: {
					pretty: true
				},
				files: (function () {
					return grunt.file.expandMapping(['app/**/*.jade'], '', {
						cwd: '.',
						rename: function (destBase, destPath) {
							return destBase + destPath.replace(/\.jade$/, '.html');
						}
					});
				})()
			}
		},
		less: {
			development: {
				options: {
					paths: ['app']
				},
				files: {
				  'app/styles.css': 'app/styles.less',
				}
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', [
		'jade:development',
		'less:development',
		'concurrent'
	]);
};