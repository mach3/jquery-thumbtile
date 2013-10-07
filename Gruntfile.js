
module.exports = function(grunt){

	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");

	var banner = grunt.template.process(
		grunt.file.read("src/banner.js"),
		{data: grunt.file.readJSON("package.json")}
	);

	grunt.initConfig({

		concat: {
			dist: {
				options: { banner: banner },
				files: {
					"dist/thumbtile.js": ["src/thumbtile.js"]
				}
			}
		},

		uglify: {
			dist: {
				options: { banner: banner },
				files: {
					"dist/thumbtile.min.js": ["src/thumbtile.js"]
				}
			}
		}

	});

	grunt.registerTask("default", ["concat:dist", "uglify:dist"]);



};
