import React from 'react';
import * as apiCalled from '../api/apiCalls';
import UserListItem from "./UserListItem";

export class UserList extends React.Component {

    state = {
        page: {
            content: [],
            number: 0,
            size: 3
        }
    };

    componentDidMount() {
        this.loadData();
    }

    loadData(requestPage = 0) {
        apiCalled.listUsers({page: requestPage, size: this.state.page.size})
            .then((response) => {
                this.setState({
                    page: response.data,
                    loadError: undefined
                })
            })
            .catch(error => {
                this.setState({loadError: 'User load failed'});
            });
    }

    onClickNext = () => {
        this.loadData(this.state.page.number + 1);
    };

    onClickPrevious = () => {
        this.loadData(this.state.page.number - 1);
    };

    render() {
        return (
            <div className="card">
                <h3 className='card-title m-auto'>Users</h3>
                <div className="list-group list-group-flush" data-testid="usergroup">
                    {this.state.page.content.map((user) => {
                        return <UserListItem key={user.username} user={user}/>;
                    })}
                </div>
                <div className="clearfix">
                    {!this.state.page.first && (<span
                        className="badge badge-light float-left"
                        style={{cursor: 'pointer'}}
                        onClick={this.onClickPrevious}
                    >
                        {`< previous`}
                    </span>)}
                    {!this.state.page.last && (<span
                        className="badge badge-light float-right"
                        style={{cursor: 'pointer'}}
                        onClick={this.onClickNext}
                    >
                        next >
                    </span>)}
                    {this.state.loadError && <span className="text-center text-danger">{this.state.loadError}</span>}
                </div>
            </div>
        )
    }
}

export default UserList;