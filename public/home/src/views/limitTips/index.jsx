import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import './limitTips.less';

const limitTips = (props) => (
    <div className="limit-tips">
        <div className="tips">
            <h4>提示：</h4>
            <p>
                您暂时无法登陆，当前在线座席人数已超过套餐限额。
            </p>
            <p>
                如有需要，<Link to="/setting/combo">点击前往</Link>修改套餐。
            </p>
        </div>
    </div>
);

export default limitTips;
