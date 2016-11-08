import React, { PropTypes } from 'react';
import reqwest from 'reqwest';

class ViewApp extends React.Component {
    state = {
        url: '',
    }

    componentDidMount() {
        const { location } = this.props;
        if (!location.state) {
            reqwest({
                url: `/api/appstore/${this.props.params.id}`,
            }).then(resp => {
                if (resp.success) {
                    this.setState({
                        url: resp.data ? resp.data.url : '',
                    });
                }
            });
        }
    }

    render() {
        const { location } = this.props;
        if (location.state && location.state.url) {
            return (
                <iframe src={location.state.url} scrolling="yes"></iframe>
            );
        }

        return (
            <iframe src={this.state.url}></iframe>
        );
    }
}

ViewApp.propTypes = {
    params: PropTypes.object,
    location: PropTypes.object,
};

export default ViewApp;
