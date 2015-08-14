/**
 * Created by user1 on 2015/8/13.
 */
/**
 * @模板格式化
 * @author 陈柄宏
 * @date 2015-8-11
 * @param html {String} 模板html
 * @param data {Object} 数据
 * @return 根据数据格式化后的html
 * */
function formatter(html, data) {
    return html.replace(/[{]{2}\w+[}]{2}/g,
        function (m, p1, p2) {
            return data[m.substring(2, m.length - 2)];
        });
}
/**
 * @数组过滤
 * @author 陈柄宏
 * @date 2015-8-14
 * @param array {Array} 数组
 * @param value {String|Number} 要过滤的值
 * */
function filter(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            array.splice(i--, 1);
        }
    }
}