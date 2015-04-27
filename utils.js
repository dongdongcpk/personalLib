/**
 * 判断参数时间是否为今天
 * @param time
 * @returns {boolean}
 */
var isToday = function (time) {
    var date = new Date(time).toLocaleDateString();
    var nowDate = new Date().toLocaleDateString();
    return date === nowDate;
};

/**
 * 判断当前时间是否在参数时间范围内
 * @param startDate
 * @param endDate
 * @returns {boolean}
 */
var inEffectiveTime = function (startDate, endDate) {
    var start = Date.parse(startDate);
    var end = Date.parse(endDate);
    var now = new Date().getTime();
    return start <= now && now <= end;
};