/**
 * Created by user1 on 2015/8/13.
 */
/**
 * @ģ���ʽ��
 * @author �±���
 * @date 2015-8-11
 * @param html {String} ģ��html
 * @param data {Object} ����
 * @return �������ݸ�ʽ�����html
 * */
function formatter(html, data) {
    return html.replace(/[{]{2}\w+[}]{2}/g,
        function (m, p1, p2) {
            return data[m.substring(2, m.length - 2)];
        });
}
/**
 * @�������
 * @author �±���
 * @date 2015-8-14
 * @param array {Array} ����
 * @param value {String|Number} Ҫ���˵�ֵ
 * */
function filter(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            array.splice(i--, 1);
        }
    }
}