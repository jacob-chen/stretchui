/**
 * Created by user1 on 2015/8/12.
 */

$.fn.slide = function (start, end, hooke, startSpeed) {
    var $self = $(this);
    var amplitude = end - start;
    var sign = amplitude > 0 ? 1 : -1;
    var shiftSqure = amplitude * amplitude;
    var speed = startSpeed;
    speed *= sign;
    var intervalId = window.setInterval(function () {
        $self.css({left: start += speed});
        var shift = end - start;
        if (amplitude * shift <= 0) {
            clearInterval(intervalId);
            $self.css({left: end});
        }
        speed = hooke * Math.sqrt(shiftSqure - shift * shift);
        speed = speed != 0 ? speed : startSpeed;
        speed *= sign;
    }, 10);
};