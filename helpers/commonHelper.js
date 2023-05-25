function pagination(page, limit, records) {
    const results = {};
    limit = limit == 0 ? 5 : limit;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    if (endIndex < records.length) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }
    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }
    results.totalPages = {
        page: Math.ceil(records.length / limit),
        limit: limit,
        totalRecords: records.length
    };
    results.result = records.slice(startIndex, endIndex);
    return results;
}

export default {
    pagination
}