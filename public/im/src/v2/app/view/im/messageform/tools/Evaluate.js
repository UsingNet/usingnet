/**
 * Created by jhli on 16-02-15.
 */
define(['lib/class', 'text!./Evaluate.html', 'lib/ajax', 'view/messagebubble/MessageBubble'], function(Class, html, Ajax, Bubble) {
    return new Class().extend(function(textArea, messager) {
        var button = document.createElement('a');
        button.className = 'pure-button tools-button';
        button.href = 'javascript:void(0)';
        button.title = '评价';
        button.id = 'evaluationButton';
        button.innerHTML = '<span class="fa fa-thumbs-up"></span><input id="evaluationAgent" type="hidden">';

        button.addEventListener('click', function(e) {
            if (document.querySelector('#evaluationDiv')) {
                return;
            }
            var article = document.querySelector('article');
            var footer = document.querySelector('footer');
            var evaluation = document.createElement('div');
            evaluation.id = 'evaluationDiv';
            evaluation.style.background = '#FAFAFA';
            evaluation.style.position = 'absolute';
            evaluation.style.top = '3em';
            evaluation.style.bottom = '8em';
            evaluation.style.zIndex = 999999;
            evaluation.innerHTML = html;
            evaluation.style.width = article.offsetWidth + 'px';
            evaluation.style.height = article.offsetHeight + footer.offsetHeight + 'px';

            var hideBtn = evaluation.querySelector('.evaluation-hide');
            hideBtn.addEventListener('click', function(e) {
                document.body.removeChild(evaluation);
            });

            var levels = evaluation.querySelectorAll('.evaluation-btn div');
            var evaluationLevel = evaluation.querySelector('#evaluationLevel');
            for (var i = 0; i < levels.length; i++) {
                levels[i].addEventListener('click', function(e) {
                    var level = this;
                    evaluationLevel.value = level.getAttribute('data-level');
                    for (var j = 0; j < levels.length; j++) {
                        levels[j].className = '';
                    }
                    level.className = 'evaluation-select';
                });
            }

            var submit = evaluation.querySelector('button.evaluation-submit');
            var evaluationContent = evaluation.querySelector('#evaluationContent');
            submit.addEventListener('click', function(e) {
                var order_id = document.getElementById('evaluationAgent').value;
                var level = evaluationLevel.value;
                var content = evaluationContent.value;
                if (!order_id || !level) {
                    Bubble.showError(!!order_id ? '请选择评价。' : '对话开始后才能进行评价。', 3);
                    return;
                }

                Ajax.post('api/evaluation', {order_id: order_id, level: level, content: content}, function(data) {
                    if (data.success) {
                        Bubble.showSuccess('评价成功！', 3);
                        document.body.removeChild(evaluation);
                    } else {
                        Bubble.showSuccess(data.msg ? data.msg : '服务器错误，评价失败，请联系客服人员处理。', 3);
                    }
                });
            });

            document.body.appendChild(evaluation);
        });

        return button;
    });
});