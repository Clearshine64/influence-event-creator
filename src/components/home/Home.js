import React from 'react';
import { Container } from "react-bootstrap";
import {
  Link,
} from "react-router-dom";


export default function Home() {
  // const { active, account, library, connector, activate, deactivate } = useWeb3React()

  // async function connect() {
  //   try {
  //     await activate(injected)
  //   } catch (ex) {
  //     console.log(ex)
  //   }
  // }

  // async function disconnect() {
  //   try {
  //     deactivate()
  //   } catch (ex) {
  //     console.log(ex)
  //   }
  // }

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
            fontSize: 12,
            lineHeight: "17px",
            alignItems: "center",
            textAlign: "center",
            marginTop: 50,
            letterSpacing: "5px",
            color: "#303030",
          }}
        >
          LIVESTREAM TO YOUR FAVORITE
          <br />
          AUDIENCES AND GET PAID IN CRYPTO
        </div>
        <div
          style={{
            fontFamily: "LuloCleanW01-One",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "22px",
            lineHeight: "31px",
            alignItems: "center",
            textAlign: "center",
            marginTop: 15,
            letterSpacing: "6px",
          }}
        >
          CONNECT YOUR
          <br /> WALLET TO SIGN IN
        </div>
        <div style={{
          textAlign: "center",
          marginTop: 150
        }}>
          <Link className="wallet-button" to="/connectors"
            style={{
              textDecoration: "none",
              letterSpacing: "1.5px",
              color: "#919194",
              fontSize: 20,
              backgroundColor: "#242429",
              padding: "10px 20px 10px 20px",
              borderRadius: "20px",
            }}
          >CONNECT WALLET</Link>
        </div>
      </Container>
    </div>
  )
}
