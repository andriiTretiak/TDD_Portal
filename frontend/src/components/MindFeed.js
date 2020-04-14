import React, {Component} from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from "./Spinner";
import MindView from "./MindView";
import Modal from "./Modal";

class MindFeed extends Component {

    state = {
        page: {
            content: []
        },
        isLoadingMinds: false,
        newMindsCount: 0,
        isLoadOldMinds: false,
        isLoadNewMinds: false,
        isDeletingMind: false
    };

    componentDidMount() {
        this.setState({isLoadingMinds: true});
        apiCalls.loadMinds(this.props.user)
            .then(value => {
                this.setState({
                        page: value.data,
                        isLoadingMinds: false
                    }, () => {
                        this.counter = setInterval(this.checkCount, 3000);
                    }
                );
            });
    }

    componentWillUnmount() {
        clearInterval(this.counter);
    }

    checkCount = () => {
        const minds = this.state.page.content;
        let topMindId = 0;
        if (minds.length > 0) {
            topMindId = minds[0].id;
        }
        apiCalls.loadNewMindsCount(topMindId, this.props.user)
            .then(value => {
                this.setState({newMindsCount: value.data.count})
            });
    };

    onClickLoadMore = () => {
        const minds = this.state.page.content;
        if (minds.length === 0) {
            return;
        }
        const mindAtBottom = minds[minds.length - 1];
        this.setState({isLoadOldMinds: true});
        apiCalls.loadOldMinds(mindAtBottom.id, this.props.user)
            .then((value) => {
                const page = {...this.state.page};
                page.content = [...page.content, ...value.data.content];
                page.last = value.data.last;
                this.setState({
                    page,
                    isLoadOldMinds: false
                });
            }).catch(reason => {
            this.setState({
                isLoadOldMinds: false
            });
        });
    };

    onClickLoadNew = () => {
        const minds = this.state.page.content;
        let topMindId = 0;
        if (minds.length > 0) {
            topMindId = minds[0].id;
        }
        this.setState({isLoadNewMinds: true});
        apiCalls.loadNewMinds(topMindId, this.props.user)
            .then(value => {
                const page = {...this.state.page};
                page.content = [...value.data, ...page.content];
                this.setState({
                    page,
                    newMindsCount: 0,
                    isLoadNewMinds: false
                });
            }).catch(reason => {
            this.setState({
                isLoadNewMinds: false
            });
        });
    };

    onClickDeleteMind = (mind) => {
        this.setState({mindToBeDeleted: mind});
    };

    onClickModalCancel = () => {
        this.setState({mindToBeDeleted: undefined});
    };

    onClickModalOk = () => {
        this.setState({isDeletingMind: true});
        apiCalls.deleteMind(this.state.mindToBeDeleted.id)
            .then(value => {
                const page ={...this.state.page};
                page.content = page.content.filter(mind => mind.id !== this.state.mindToBeDeleted.id);
                this.setState({
                    mindToBeDeleted: undefined,
                    page,
                    isDeletingMind: false
                });
            });
    };

    render() {
        if (this.state.isLoadingMinds) {
            return <Spinner/>;
        }
        if (this.state.page.content.length === 0 && this.state.newMindsCount === 0) {
            return (
                <div className="card card-header text-center">
                    There are no minds
                </div>
            );
        }
        return <div>
            {this.state.newMindsCount > 0 && (
                <div
                    className="card card-header text-center"
                    onClick={!this.state.isLoadNewMinds && this.onClickLoadNew}
                    style={{cursor: this.state.isLoadNewMinds ? 'not-allowed' : 'pointer'}}
                >
                    {this.state.isLoadNewMinds ? <Spinner/> : this.state.newMindsCount === 1 ? 'There is 1 new mind'
                        : `There are ${this.state.newMindsCount} new minds`}
                </div>
            )}
            {this.state.page.content.map((mind) => {
                return <MindView
                    key={mind.id}
                    mind={mind}
                    onClickDeleteMind={() => this.onClickDeleteMind(mind)}
                />
            })}
            {this.state.page.last === false && (
                <div
                    className="card card-header text-center"
                    onClick={!this.state.isLoadOldMinds && this.onClickLoadMore}
                    style={{cursor: this.state.isLoadOldMinds ? 'not-allowed' : 'pointer'}}
                >
                    {this.state.isLoadOldMinds ? <Spinner/> : 'Load More'}
                </div>
            )}
            <Modal
                visible={this.state.mindToBeDeleted && true}
                onClickCancel={this.onClickModalCancel}
                body={this.state.mindToBeDeleted && `Are you sure to delete '${this.state.mindToBeDeleted.content}'`}
                title="Delete!"
                okButton={"Delete Mind"}
                onClickOk={this.onClickModalOk}
                pendingApiCall={this.state.isDeletingMind}
            />
        </div>
    }
}

export default MindFeed;