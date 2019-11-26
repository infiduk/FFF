import React, { Component } from 'react'

import { ListGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { HistoryList } from '../components/List'

import history from '../assets/history.png'

export default class History extends Component {
    constructor(props) {
        super(props)
        this.state = {
            list: [],
            id: this.props.match.params.id
        }
    }

    componentDidMount() {
        window.sessionStorage.getItem('name') ? this.history() : window.location.assign('/signin')
    }

    // 투표 히스토리 조회 API
    history = async () => {
        const { id } = this.state

        try {
            const res = await fetch('http://ch-4ml.iptime.org:8080/vote/history', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache': 'no-cache'
                },
                credentials: 'include',
                body: JSON.stringify({ 'id': id })
            })

            const json = await res.json()

            res.status === 200
                ? this.setState({ list: json.data })
                : alert('히스토리 조회에 실패하였습니다.')
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        return (
            <div>
                <div style={{ margin: 10 }}>
                <img
                        alt='history'
                        src={history}
                        style={{ height: '70px', marginTop: '-15px', marginBottom: '-10px', marginLeft: 15 }}
                    />
                    <ListGroup variant='flush'>
                        <br />
                        {this.state.list.map(list => {
                            return (
                                <HistoryList
                                    key={`list-${list.TxId}`}
                                    tx={list.TxId}
                                    timestamp={list.Timestamp}
                                />
                            )
                        })}
                        <hr />
                    </ListGroup>
                </div>
            </div>
        )
    }
}