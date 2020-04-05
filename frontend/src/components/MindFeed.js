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
                <div className="card card-header text-center">
                    Load More
                </div>
            )}
        </div>
    }
}

export default MindFeed;