const gulp = require("gulp")
const pug = require("gulp-pug")
const pugI18n = require("gulp-pug-i18n")
const sass = require("gulp-sass")
const importer = require("node-sass-package-importer")
const webpack = require("webpack-stream")
const browserSync = require("browser-sync").create()

const src = "./src"
const dest = "./dest"

const config = {
    src: "./src",
    dest: "./dest",
    assets: {
        src: src + "/assets/**",
        dest: dest + "/assets"
    },
    pug: {
        src: src + "/pug/*.pug",
        basedir: src,
        pretty: true,
        i18n: {
            locales: src + "/locale/*.*",
            namespace: "$T",
            default: "ja-JP",
            filename: "{{basename}}{-{{lang}}}{-{{region}}}.html"
        }
    },
    js: {
        src: src + "/js/*.js",
        dest: dest + "/js",
        uglify: false
    },
    webpack: {
        mode: "development",
        entry: src + "/js/app.js",
        output: {
            filename: "bundle.js"
        }
    },
    sass: {
        src: src + "/sass/*.scss",
        dest: dest + "/css"
    },
    fontAwesome: {
        src: "./node_modules/@fontawesome/fontawesome-free/webfonts/**",
        dest: dest + "/webfonts"
    }
}

gulp.task("assets", done => {
    gulp.src(config.assets.src)
        .pipe(gulp.dest(config.assets.dest))
    done()
})
gulp.task("font-awesome", () =>
    gulp.src(config.fontAwesome.src)
        .pipe(gulp.dest(config.fontAwesome.dest))
)
gulp.task("pug", () =>
    gulp.src(config.pug.src)
        .pipe(pugI18n(config.pug))
        .pipe(gulp.dest(config.dest))
)
gulp.task("sass", () => {
    return gulp.src(config.sass.src)
        .pipe(sass({
            importer: importer()
        })).on("error", sass.logError)
        .pipe(gulp.dest(config.sass.dest))
})
gulp.task("webpack", () =>
    gulp.src(config.webpack.entry)
        .pipe(webpack(config.webpack))
        .pipe(gulp.dest(config.js.dest))
)

gulp.task("build", gulp.series(
    "assets",
    "pug",
    "webpack",
    "sass",
    "font-awesome"
))

gulp.task("browser-sync", done => {
    browserSync.init({
        server: {
            baseDir: config.dest,
            index: "index.html"
        }
    })
    done()
})
gulp.task("bs-reload", done => {
    browserSync.reload()
    done()
})

gulp.task("watch", () => {
    gulp.watch(config.dest + "/**/*.js", gulp.task("bs-reload"))
    gulp.watch(config.dest + "/**/*.html", gulp.task("bs-reload"))
    gulp.watch(config.dest + "/**/*.css", gulp.task("bs-reload"))

    gulp.watch(config.sass.src, gulp.task("sass"))
    gulp.watch([config.pug.src, config.pug.i18n.locales], gulp.task("pug"))
    gulp.watch(config.js.src, gulp.task("webpack"))
})

gulp.task("default", gulp.series("browser-sync", "watch"))