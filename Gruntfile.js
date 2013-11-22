module.exports = function (grunt) {

	grunt.initConfig({
		watch: {
			options: {
				livereload: true
			},
			less: {
				files: ['calendar/**/*.less'],
				tasks: ['less']
			},
			jade: {
				files: [
					'calendar/**/*.jade',
					'index.jade'
				],
				tasks: ['jade']
			}
		},
	    connect: {
			server: {
				options: {
					port: 9001,
					base: '.',
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
					var files = grunt.file.expandMapping(['calendar/**/*.jade'], '', {
						cwd: '.',
						rename: function (destBase, destPath) {
							return destBase + destPath.replace(/\.jade$/, '.html');
						}
					});

					files.push({
						src: 'index.jade',
						dest: 'index.html'
					});

					return files;
				})()
			}
		},
		less: {
			development: {
				options: {
					paths: ['calendar']
				},
				files: {
				  'calendar/calendar.css': 'calendar/calendar.less',
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