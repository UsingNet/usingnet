/**
 * Created by jhli on 16-02-17.
 */
define(['../lib/class', 'text!template/evaluation.html', 'lib/ajax', 'lib/template'], function(Class, html, Ajax, Template) {
    return new Class().extend(function() {
        var me = this;
        var evaluate = document.createElement('<div id="evaluatePanel"></div>');
        // evaluate.id = 'evaluatePanel';
        evaluate.style.height = window.innerHeight || document.documentElement.clientHeight - 48 + 'px';
        evaluate.style.position = 'absolute';
        evaluate.style.top = '48px';
        evaluate.style.width = window.innerWidth || document.documentElement.clientWidth + 'px';
        evaluate.style.bottom = '0';
        evaluate.style.left = '0';
        evaluate.style.right = '0';
        evaluate.style.zIndex = 9999;
        evaluate.style.background = '#FAFAFA';

        evaluate.innerHTML = Template(html, {
            buttonBackground: document.querySelector('.header').style.backgroundColor
        });

        var levels = evaluate.querySelectorAll('.evaluation-btn div');
        var evaluationLevel = evaluate.querySelector('#evaluationLevel');
        var submitButton = evaluate.querySelector('.evaluation-submit');
        var closeEvaluateIcon = evaluate.querySelector('.close-evaluation-icon');

        for (var i = 0; i < levels.length; i++) {
            (function(i) {
                levels[i].addEventListener('click', function() {
                    for (var j = 0; j < levels.length; j++) {
                        levels[j].style.backgroundColor = '#FAFAFA';
                    }
                    evaluationLevel.value = levels[i].className.toUpperCase();
                    levels[i].style.backgroundColor = '#fff';
                });
            })(i);
        }

        submitButton.addEventListener('click', function() {
            Ajax.post('api/evaluation', {
                order_id: document.querySelector('#evaluationOrderIdValue').value,
                level: evaluationLevel.value,
                content: document.querySelector('#evaluationContent').value
            }, function(data) {
                if (data.success) {
                    alert('评价成功！');
                    me.hideDialog();
                } else {
                    alert(data.msg);
                }
            });
        });

        closeEvaluateIcon.addEventListener('click', function() {
            me.hideDialog();
        });


        me.appendTo = function(dom) {
            if (document.querySelector('#evaluatePanel')) {
                me.showDialog();
            } else {
                dom.appendChild(evaluate);
            }
        };

        me.hideDialog = function() {
            var panel = document.querySelector('#evaluatePanel');
            panel.style.display = 'none';
        };

        me.showDialog = function() {
            var panel = document.querySelector('#evaluatePanel');
            panel.style.display = 'block';
        };
    });
});
