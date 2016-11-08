/**
 * Created by henry on 16-1-19.
 */
if (window.addEventListener) {
    requirejs(['src/v2/config'], function () {
        requirejs(['main'], function () {
        });
    });
}else{
    requirejs(['src/v1/app/config'], function () {
        requirejs(['main'], function () {
        });
    });
}