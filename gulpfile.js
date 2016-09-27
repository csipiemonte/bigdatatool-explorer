var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var bower = require('gulp-bower');

gulp.task('default', ['copyToWebapp']);


gulp.task('compress', function() {
  return gulp.src('bigdata-explorer/src/js/**/*.js')
  	.pipe(concat('bigdata-explorer-lib.js'))
    .pipe(gulp.dest('dist/js/'))
    .pipe(rename('bigdata-explorer-lib.min.js'))
	.pipe(uglify().on('error', function(e){
            console.log(e);
         }))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('copyResources', function() {
	  return gulp.src(['bigdata-explorer/src/**/*', '!bigdata-explorer/src/js/**/*'])
	               .pipe(gulp.dest('dist'));
	});

gulp.task('copyToWebapp',["compress", "copyResources"], function() {
	  return gulp.src(['dist/**/*'])
	               .pipe(gulp.dest('webapp/lib/bigdata-explorer/dist'));
});


