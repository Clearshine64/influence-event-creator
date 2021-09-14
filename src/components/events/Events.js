import React, {Component} from 'react';
import { Link, withRouter } from "react-router-dom";
import { Container, Row, Col, OverlayTrigger, Popover } from "react-bootstrap";
import ImbueEventsContract from '../../contracts/ImbuEvents.json';
import getWeb3 from "../../getWeb3";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareSquare, faCopy } from '@fortawesome/free-solid-svg-icons';
import './Events.css';
import CONTRACT_ADDRESS from '../../common/contracts';
const moment = require('moment');
var CryptoJS = require("crypto-js");

class Events extends Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
    }

    this.loadBlockchainData = this.loadBlockchainData.bind(this);
  }

  componentDidMount() {
    this.loadBlockchainData();
    console.log('events page will mount');
  }

  async loadBlockchainData() {
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    // Load abi and address from testnet
    const imbueEvents = new web3.eth.Contract(ImbueEventsContract.abi, CONTRACT_ADDRESS);
    this.setState({ web3, accounts, contract: imbueEvents });

    // Load events
    const eventCount = await imbueEvents.methods.eventCount().call();
    this.setState({ eventCount });
    for (var i = 1; i <= eventCount; i++) {
      const event = await imbueEvents.methods.events(i).call();
      this.setState({
        events: [...this.state.events, event]
      })
    }
  }

  startEvent = (id) => {
    // let {events} = this.state;
    // this.state.contract.methods.startEvent(id).send({from: this.state.account})
    // .on('receipt', () => {
    //   events.filter((event) => event.id === id).map((event) => {
    //     event.isStarted = true;
    //     event[8] = true;
    //   })
    //   this.setState({ events: events });
    //   console.log('receipt');
    // })
    // .on('confirmation', (receipt) => {
    //   console.log('event subscribed');
    // })
    // .on('error', function(error, receipt){
    //   console.log(error);
    // })

    this.props.history.push(`/event/${id}`);
  }

  goEventDetail = (event) => {
    let redirectPath = `http://localhost:3001/event/${event[4]}/${event[0]}/${event[2]}`;
    window.open(redirectPath, '_blank');
  }

  copyToClipboard = (streamKey) => {
    navigator.clipboard.writeText(streamKey);
  }

  render() {
    const {events, account} = this.state;
    
    return (
      <div className="home">
        <Container
          className='MyContainer'
          style={{
            display: 'block',
            margin: 'auto',
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginTop: 70,
              fontSize:40,
              letterSpacing: "7px",
              fontFamily: "MyWebFont",
              color: "#3c3c3c",
            }}
          >
            I M B U E
          </div>
          <div
            style={{
              fontFamily: "LuloCleanW01-One",
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: "22px",
              lineHeight: "27px",
              alignItems: "center",
              textAlign: "center",
              marginTop: 70,
              letterSpacing: "6px",
            }}
          >
            UP COMING
            <br /> EVENTS
          </div>
          {
            events.length > 0 ?
              ( <div>
                  <div style={{
                    textAlign: "center",
                    marginTop: 30
                  }}>
                    <Link className="wallet-button" to="/event/create">CREATE EVENTS</Link>
                  </div>
                  {events.filter((event) => event.owner === account).map((event, index) => {
                    let streamData = CryptoJS.AES.decrypt(event.streamData, event.name).toString(CryptoJS.enc.Utf8).split('&&')
                    let streamKey = streamData[1];
                    return (
                    <OverlayTrigger trigger="click" placement="top" key={index} overlay={
                      <Popover id="popover-basic">
                        <Popover.Title as="h3">Stream Key</Popover.Title>
                        <Popover.Content>
                          {streamKey}&nbsp;&nbsp;&nbsp;
                          <FontAwesomeIcon icon={faCopy} 
                            onClick={() => this.copyToClipboard(streamKey)}
                            style={{ cursor: 'pointer' }} />
                        </Popover.Content>
                      </Popover>
                    }>
                    <div
                      style={{
                        backgroundColor: "#242429",
                        borderRadius: 20,
                        marginTop: 20,
                        height: 60,
                        marginBottom: 20
                      }}
                    >
                      <Row>
                        <Col sm={5}>
                          <h4 title={event.description} style={{ color: "#FFFFFF", marginTop: 13, textAlign: 'left', paddingLeft: 30, letterSpacing: 2 }}>
                            {event.name}
                          </h4>
                        </Col>
                        <Col sm={3} style={{ color: "#FFFFFF", marginTop: 8 }}>
                          {
                            moment(event.startTime).format('MMM Do YYYY') === moment(event.endTime).format('MMM Do YYYY') ?
                              <h5 style={{ textAlign: "center", marginLeft: 10, color: "#919194", fontSize: '1.15rem' }}>
                                {moment(event.startTime).format('MMM Do YYYY')} <br /> 
                                {moment(event.startTime).format('h A')} - {moment(event.endTime).format('h A')}
                              </h5>
                              :
                              <h5 style={{ textAlign: "center", marginLeft: 10, color: "#919194", fontSize: '1.15rem' }}>
                                {moment(event.startTime).format('MMM Do YYYY h A')} - <br /> 
                                {moment(event.endTime).format('MMM Do YYYY h A')}
                              </h5>
                          }
                        </Col>
                        <Col sm={1} style={{ color: "#FFFFFF", marginTop: 15 }}>
                          <FontAwesomeIcon className='icon-share' icon={faShareSquare} size="lg" 
                          onClick={() => this.goEventDetail(event)} />
                        </Col>
                        <Col
                         sm={3}
                        >
                           { !event.isStarted &&
                            <h5 className="start-event" onClick={() => this.startEvent(event.id)}>
                              START EVENT
                            </h5>
                          }
                        </Col>
                      </Row>
                    </div>
                    </OverlayTrigger>)
                  })
                }
              </div>)
            :
            ( <div
                style={{
                  fontFamily: "LuloCleanW01-One",
                  fontStyle: "normal",
                  fontWeight: "normal",
                  fontSize: 15,
                  lineHeight: "17px",
                  alignItems: "center",
                  textAlign: "center",
                  marginTop: 70,
                  letterSpacing: "5px",
                  color: "#303030",
                }}
              >
                NO UPCOMING EVENTS... CREATE ONE
                <div style={{
                  textAlign: "center",
                  marginTop: 50
                }}>
                  <Link className="wallet-button" to="/event/create"
                    style={{
                      textDecoration: "none",
                      letterSpacing: "1.5px",
                      color: "#919194",
                      fontSize: 20,
                      backgroundColor: "#242429",
                      padding: "10px 20px 10px 20px",
                      borderRadius: "20px",
                    }}
                  >CREATE EVENTS</Link>
                </div>
              </div>)
          }
          
        </Container>
      </div>
    );
  }
}

export default withRouter(Events);
