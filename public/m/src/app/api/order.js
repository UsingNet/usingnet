/**
 * Created by henry on 16-2-20.
 */
define(['./rest'], function(Rest){
    return new Rest({
        url:'/api/order'
    });
});