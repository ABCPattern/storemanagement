const math = require('mathjs')

function pagination(pageno, capacity, count) {
    let firstpage, lastpage
    if ((pageno - 1) == 0) {
        firstpage = true
        lastpage = false
    }
    if (pageno == math.ceil(count / capacity)) {
        firstpage = false
        lastpage = true
    }
    if (math.ceil(count / capacity) == 1) {
        firstpage = true
        lastpage = true
    }
    if ((pageno - 1) > 0 && pageno != math.ceil(count / capacity)) {
        firstpage = false
        lastpage = false
    }
    const pagination = {
        "count": count,
        "current-page": pageno,
        "total_pages": math.ceil(count / capacity),
        "per_page": capacity,
        "firstpage": firstpage,
        "lastpage": lastpage
    }
    return pagination
}

module.exports = pagination