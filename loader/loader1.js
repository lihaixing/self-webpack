function loader1 (source) {
    return source + '\n\n' + 'console.log("loader1")'
}

module.exports = loader1;