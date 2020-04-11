import React, {Component} from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from "./Spinner";
import MindView from "./MindView";

class MindFeed extends Component {

    state ={
        page: {
            content: []
        },
        isLoadingMinds: false
    };

    componentDidMount() {
        this.setState({isLoadingMinds: true});
        apiCalls.loadMinds(this.props.user)
            .then(value => {
                this.setState({
                    page: value.data,
                    isLoadingMinds: false
                });
            });
    }

    onClickLoadMore = () => {
        const minds = this.state.page.content;
        if(minds.length === 0){
            return;
        }
        const mindAtBottom = minds[minds.length -1];
        apiCalls.loadOldMinds(mindAtBottom.id, this.props.user)
            .then((value) => {
                const  page = {...this.state.page};
                page.content = [...page.content, ...value.data.content];
                page.last = value.data.last;
                this.setState({page});
            });
    };

    render() {
        if(this.state.isLoadingMinds){
            return <Spinner/>;
        }
        if(this.state.page.content.length === 0){
            return (
                <div className="card card-header text-center">
                    There are no minds
                </div>
            );
        }
        return <div>
            {this.state.page.content.map((mind) => {
                return <MindView key={mind.id} mind={mind}/>
            })}
            {this.state.page.last === false && (
                <div
                    className="card card-header text-center"
                    onClick={this.onClickLoadMore}
                    style={{cursor: 'pointer'}}
                >
                    Load More
                </div>
            )}
        </div>
    }
}

export default MindFeed;