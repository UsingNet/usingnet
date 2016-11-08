/**
 * Created by henry on 16-2-19.
 */
(function(){
    $('include').each(function(_, include){
        var name = include.getAttribute('src');
        if(name=='pages'){
            $.ajax({
                url:'../.tmp/pages',
                async: false,
                success: function(data){
                    $(include).replaceWith(data);
                }
            });
        }else{
            $.ajax({
                url:name,
                async: false,
                success: function(data){
                    $(include).replaceWith(data);
                }
            });
        }
    });
})();