import React, { Component } from 'react'

import { ListGroup } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { MainList, ToBeList } from '../components/List'

import quizlist from '../assets/quiz-list.png'

export default class Main extends Component {
    constructor(props) {
        super(props)
        this.state = {
            list: []
        }
    }

    componentDidMount() {
        window.sessionStorage.getItem('name') ? this.vote() : window.location.assign('/signin')
    }

    // 투표 목록 조회 API
    vote = async () => {
        try {
            const res = await fetch('http://ch-4ml.iptime.org:8080/vote', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache': 'no-cache'
                },
                credentials: 'include',
            })

            const json = await res.json()

            res.status === 200
                ? this.setState({ list: json.data.votes })
                : alert('목록 조회에 실패하였습니다.')
        } catch (err) {
            console.log(err)
        }
    }

    render() {
        return (
            <div>
                <div style={{ margin: 10 }}>
                    <img
                        alt='quiz-list'
                        src={quizlist}
                        style={{ height: '70px', marginTop: '-15px', marginBottom: '-10px', marginLeft: 15 }}
                    />
                    <ListGroup variant='flush'>
                        <br />
                        {this.state.list.map(list => {
                            if (list.status === '1') {
                                return (
                                    <MainList
                                        key={`list-${list.id}`}
                                        href={`/game/${list.id}`}
                                        choice1={list.choice1}
                                        choice2={list.choice2}
                                        date={list.end}
                                        category={list.category}
                                    />
                                )
                            } else if (list.status === '0') {
                                return (
                                    <ToBeList
                                        key={`list-${list.id}`}
                                        href={`/game/${list.id}`}
                                        choice1={list.choice1}
                                        choice2={list.choice2}
                                        date={list.end}
                                        category={list.category}
                                    />
                                )
                            }
                            return ''
                        })}
                        <hr />
                    </ListGroup>
                </div>
            </div>
        )
    }
}