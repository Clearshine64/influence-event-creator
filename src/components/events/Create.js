import React, {Component} from 'react';
import { withRouter } from 'react-router';
import { Container, Form,  } from "react-bootstrap";
import ImbueEventsContract from '../../contracts/ImbuEvents.json';
import getWeb3 from "../../getWeb3";
import DatetimeRangePicker from 'react-datetime-range-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import axios from 'axios';

import '../../bootstrap/dist/css/bootstrap.min.css';
import './Create.css';

import ethereum from '../../images/ethereum.jpg';
import CONTRACT_ADDRESS from '../../common/contracts';
const CryptoJS = require("crypto-js");

function shortenText(text) {
  var ret = text;
  if (ret.length > 0) {
      ret = ret.substr(0, 6) + "..." + ret.substr(text.length - 5, text.length - 1);
  }
  return ret;
}

class Create extends Component {
  constructor(props) {
    super(props);

    this.state = {
      walletBalance: 0,
      address: '',
      isFreeOrPaid: false,
      storageValue: 0, 
      web3: null, 
      accounts: null, 
      contract: null,
      startDate: new Date(),
      endDate: new Date(),
      errorName: '',
      errorPrice: '',
      errorDescription: '',
      isLoading: false
    };

  }

  componentWillMount() {
    this.loadBlockchainData();
  }

  setFree = () => {
    this.setState({
      isFreeOrPaid: false
    });
  }

  setPaid = () => {
    this.setState({
      isFreeOrPaid: true
    });
  }

  loadBlockchainData = async() => {
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    
    // Get Wallet Address and Balance
    this.setState({ address: web3.currentProvider.selectedAddress});

    web3.eth.getBalance(web3.currentProvider.selectedAddress, (err, result) => {
      if (err) {
        console.log(err)
      } else {
        this.setState({ walletBalance: web3.utils.fromWei(result, "ether")});
      }
    })

    // Load abi and address from testnet
    const imbueEvents = new web3.eth.Contract(ImbueEventsContract.abi, CONTRACT_ADDRESS);
    this.setState({ web3, accounts, contract: imbueEvents });
  }

  createEvent = (name, description, price, startDate, endDate, streamData) => {
    this.state.contract.methods.createEvent(name, description, price, startDate, endDate, streamData).send({ from: this.state.account })
    .on('receipt', () => {
      // redirect to events page
      this.setState({ isLoading: false });
      var redirectLink = '/events';
      this.props.history.push(redirectLink);
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      this.setState({isLoading: false});
    })
    .on('error', (error, receipt) => {
      this.setState({isLoading: false});
    })
  }

  changeDateRange = (event) => {
    // get changed datetime and save to state
    this.setState({
      startDate: moment(event.start).format('YYYY-MM-DD H:mm:ss'),
      endDate: moment(event.end).format('YYYY-MM-DD H:mm:ss')
    });
  }
  
  submitForm = (event) => {
    event.preventDefault();

    if (this.eventName.value === '') {
      this.setState({
        errorName: 'This field is required.'
      });
    } else if (this.eventDescrption.value === '') {
      this.setState({
        errorDescription: 'This field is required.'
      });
    } else if (!this.state.isFreeOrPaid || (this.eventPrice && this.eventPrice.value !== '')) {
      if (this.state.walletBalance > 0) {
        const apiKey = '40500865-8d73-47ef-a1ba-1e2610776430';
        const streamName = 'test_stream';
        const streamProfiles = [
          {
            name: "720p",
            bitrate: 2000000,
            fps: 30,
            width: 1280,
            height: 720,
          },
          {
            name: "480p",
            bitrate: 1000000,
            fps: 30,
            width: 854,
            height: 480,
          },
          {
            name: "360p",
            bitrate: 500000,
            fps: 30,
            width: 640,
            height: 360,
          },
        ];
        const authorizationHeader = `Bearer ${apiKey}`;
  
        try {
          const createStreamResponse = axios.post(
            "https://livepeer.com/api/stream",
            {
              name: streamName,
              profiles: streamProfiles,
            },
            {
              headers: {
                "content-type": "application/json",
                authorization: authorizationHeader, // API Key needs to be passed as a header
              },
            }
          );
          this.setState({ isLoading: true });
  
          createStreamResponse.then((data) => {
            const responseData = data;
            if (responseData && responseData.data) {
              const {id, streamKey, playbackId} = responseData.data;
  
              const name = this.eventName.value;
              const description = this.eventDescrption.value;
  
              let price = 0;
              if (this.state.isFreeOrPaid) {
                price = this.state.web3.utils.toWei(this.eventPrice.value.toString(), 'Ether');
              } else {
                price = this.state.web3.utils.toWei('0', 'Ether');
              }
  
              let streamData = id + '&&' + streamKey + '&&' + playbackId + '&&' + apiKey;
              streamData = CryptoJS.AES.encrypt(streamData, name).toString();
              this.createEvent(name, description, price, this.state.startDate.toString(), this.state.endDate.toString(), streamData);
            } else {
              console.log("Something went wrong1");
            }
          });
  
        } catch (error) {
  
          // Handles Invalid API key error
          if (error.response.status === 403) {
            console.log("error 403");
          }
          console.log("Something went wrong");
        }
      } else {
        alert("Insufficient Fund !");
      }
      
    } else {
      this.setState({
        errorName: '',
        errorPrice: 'This field is required.'
      });
    }
  }

  render() {
    const {isFreeOrPaid, errorName, errorPrice, errorDescription, isLoading} = this.state;

    return (
      <div className="connectors">
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
          <div className="wallet-status">
            <div style={{ width: 15, height: 15, backgroundColor: "#9CFFA6", borderRadius: "50%", marginTop: 8 }}>
            </div>
            <div style={{ 
              height: 31, 
              backgroundColor: "#edeef2", 
              fontSize: 11,
              lineHeight: "31px",
              paddingLeft: 10,
              paddingRight: 10,
              fontWeight: 500,
              marginLeft: 10,
              letterSpacing: 3,
              width: "285px"
              }}>
              <span>{ Math.round(this.state.walletBalance * 100000) / 100000 + 'ETH' }</span>
              <span style={{ 
                marginLeft: 10, 
                padding: "5px 8px", 
                borderRadius: 5, 
                backgroundColor: "#f7f8fa"
              }}>
                <span>{ shortenText(this.state.address) }</span>
                <img style={{ width: 12, marginLeft: 10 }} src={ethereum} alt='ethereum' />
              </span>
            </div>
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
              letterSpacing: "7px",
              marginBottom: 20
            }}
          >
            CREATE EVENT
          </div>
          <Form onSubmit={(event) => this.submitForm(event)} >
            <Form.Group className="mb-3 event-input" controlId="formGroupEventName">
              <Form.Control type="text" placeholder="EVENT NAME" ref={(input) => { this.eventName = input }} />
              { errorName !== '' && <span className='error-message'>This field is required.</span>}
            </Form.Group>
            <Form.Group className="mb-3 event-input" controlId="formGroupEventDescription">
              <Form.Control type="text" placeholder="DESCRIPTION" ref={(input) => { this.eventDescrption = input }} />
              { errorDescription !== '' && <span className='error-message'>This field is required.</span>}
            </Form.Group>
            <Form.Group className="mb-3 event-input" controlId="formGroupDateTime">
              <DatetimeRangePicker onChange={(event) => this.changeDateRange(event)} />
            </Form.Group>
            { isFreeOrPaid ? 
              (<div className="row">
              <span className="mb-3 event-input btn-paid">
                <span className='btn-word-left hover-text' 
                  onClick={this.setFree} 
                  style={{ color: "rgb(183 175 175)" }}>FREE</span>
                <span className='btn-word-right'
                 onClick={this.setPaid}
                 style={{ color: "#000000" }}>PAID</span>
              </span>
            </div>)
              :
              (<div className="row">
              <span className="mb-3 event-input btn-paid"
              >
                <span className='btn-word-left' 
                  onClick={this.setFree} 
                  style={{ color: "#000000" }}>FREE</span>
                <span className='btn-word-right hover-text'
                 onClick={this.setPaid}
                 style={{ color: "rgb(183 175 175)" }}>PAID</span>
              </span>
            </div>)
            }
            { isFreeOrPaid && 
              <div className="row">
                <Form.Group className="mb-3 event-input event-price" controlId="formGroupPrice">
                  <Form.Control type="number" min={0} step='0.000001' placeholder="PRICE (DAI)" ref={(input) => { this.eventPrice = input }} />
                  { errorPrice !== '' && <span className='error-message'>This field is required.</span>}
                </Form.Group>
              </div>
            }
            <div style={{
              textAlign: "center",
              marginTop: 50
            }}>
              { isLoading ?
                (
                  <button className="wallet-button" disabled={isLoading}
                    style={{
                      letterSpacing: "1.5px",
                      color: "#919194",
                      fontSize: 20,
                      backgroundColor: "#242429",
                      padding: "10px 20px 10px 20px",
                      borderRadius: "25px",
                    }}
                  >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <FontAwesomeIcon icon={faCircleNotch} size="lg" spin />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>
                )
                :
                (
                  <button className="wallet-button" type="submit"
                    style={{
                      letterSpacing: "1.5px",
                      color: "#919194",
                      fontSize: 20,
                      backgroundColor: "#242429",
                      padding: "10px 20px 10px 20px",
                      borderRadius: "25px",
                    }}
                  >CREATE EVENT</button>
                )
              }
              </div>
          </Form>
        </Container>
      </div>
    );
  }
}

export default withRouter(Create);