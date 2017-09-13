/* eslint-disable global-require */
module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required grunt tasks
  require('jit-grunt')(grunt, {
    lockfile: 'grunt-lock',
  });


  const localConfig = 'grunt_config.json';
  if (!grunt.file.exists(localConfig)) {
    grunt.file.copy(`${localConfig}.dist`, localConfig);
    grunt.log.errorlns(`Default ${localConfig} file is created. Please customize it to your needs and run grunt again.`);
  }

  // Configurable paths
  const config = {
    resources_dir: 'Resources',
    public_dir: 'Resources/public',
    dev_dir: 'Resources/public/dev',
    local: grunt.file.readJSON(localConfig),
  };

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    config,

    // Prevent multiple grunt instances
    lockfile: {
      grunt: {
        path: 'grunt.lock',
      },
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      gruntfile: {
        files: ['Gruntfile.js'],
        options: {
          reload: true,
        },
      },
      sass: {
        files: ['<%= config.resources_dir %>/sass/{,*/}*.{scss,sass}'],
        tasks: ['sass', 'postcss'],
      },
      babel: {
        files: ['<%= config.resources_dir %>/es6/{,*/}*.js'],
        tasks: ['concat', 'babel', 'browserify'],
      },
    },

    // Creates symlink of public directories to public/dev
    symlink: {
      images: {
        src: '<%= config.public_dir %>/images',
        dest: '<%= config.dev_dir %>/images',
      },
      fonts: {
        src: '<%= config.public_dir %>/fonts',
        dest: '<%= config.dev_dir %>/fonts',
      },
      vendor: {
        src: '<%= config.public_dir %>/vendor',
        dest: '<%= config.dev_dir %>/vendor',
      },
    },

    // Compiles es6 js files to supported js
    concat: {
      options: {
        sourceMap: true,
        sourceMapStyle: 'inline',
      },
      js: {
        src: [
          '<%= config.resources_dir %>/es6/{,*/}*.js',
        ],
        dest: '.tmp/js/app.js',
      },
    },
    babel: {
      options: {
        sourceMap: 'inline',
      },
      dist: {
        files: {
          '<%= config.dev_dir %>/js/app.js': '.tmp/js/app.js',
        },
      },
    },
    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
        },
      },
      dist: {
        files: {
          '<%= config.dev_dir %>/js/app.js': '<%= config.dev_dir %>/js/app.js',
        },
      },
    },

    // Compiles Sass to CSS and generates necessary files if requested
    sass: {
      options: {
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true,
        includePaths: ['.'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.resources_dir %>/sass',
          src: ['*.{scss,sass}'],
          dest: '.tmp/css',
          ext: '.css',
        }],
      },
    },

    postcss: {
      options: {
        map: true,
        processors: [
          // Add vendor prefixed styles
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'],
          }),
        ],
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/css/',
          src: '{,*/}*.css',
          dest: '<%= config.dev_dir %>/css',
        }],
      },
    },

    uglify: {
      my_target: {
        files: {
          '<%= config.public_dir %>/js/app.js': ['<%= config.dev_dir %>/js/app.js'],
        },
      },
    },

    cssmin: {
      target: {
        options: {
          level: 1,
        },
        files: [{
          expand: true,
          cwd: '<%= config.dev_dir %>/css',
          src: ['*.css', '!*.min.css'],
          dest: '<%= config.public_dir %>/css',
          ext: '.css',
        }],
      },
    },

    browserSync: {
      dev: {
        bsFiles: {
          src: [
            '<%= config.dev_dir %>/js/*.js',
            '<%= config.dev_dir %>/css/*.css',
          ],
        },
        options: {
          watchTask: true,
          proxy: {
            target: config.local.domain,
          },
          host: config.local.ip || null,
        },
      },
    },
  });


  grunt.registerTask('serve', 'Start the server and preview your app', () => {
    grunt.task.run([
      'lockfile',
      'symlink',
      'sass:dist',
      'postcss',
      'concat',
      'babel',
      'browserify',
      'watch',
    ]);
  });

  grunt.registerTask('default', [
    'serve',
  ]);

  grunt.registerTask('sync', 'Build production css and js and start browserSync to watch changes and automatically reload site', () => {
    grunt.task.run([
      'lockfile',
      'symlink',
      'sass:dist',
      'postcss',
      'concat',
      'babel',
      'browserify',
      'browserSync',
      'watch',
    ]);
  });

  grunt.registerTask('build', 'Build production css and js', () => {
    grunt.task.run([
      'symlink',
      'sass:dist',
      'postcss',
      'concat',
      'babel',
      'browserify',
      'uglify',
      'cssmin',
    ]);
  });
  grunt.registerTask('build_css', 'Build production css', () => {
    grunt.task.run([
      'sass:dist',
      'postcss',
      'cssmin',
    ]);
  });
  grunt.registerTask('build_js', 'Build production js', () => {
    grunt.task.run([
      'concat',
      'babel',
      'browserify',
      'uglify',
    ]);
  });
};
