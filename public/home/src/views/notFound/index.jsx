import React from 'react';
import { Link } from 'react-router';
import './not-found.less';

const NotFound = () => {
    return (
        <div className="not-found">
            <div className="pesan-error">
                <div>
                    <div className="not-found-text">404</div>
                    <div className="hint">这里什么都没有</div>
                </div>

            </div>
            <Link to="/" className="ant-btn back-home">回首页</Link>
        </div>
    );
};

export default NotFound;
