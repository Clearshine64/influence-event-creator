import React, { useEffect, useState, useRef } from 'react';
import getWeb3 from "../../getWeb3";
import ImbueEventsContract from '../../contracts/ImbuEvents.json';
import CONTRACT_ADDRESS from '../../common/contracts';
import styles from './styles.css';

const CAMERA_CONSTRAINTS = {
  audio: true,
  video: true,
}; 

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(null);
  const [textOverlay, setTextOverlay] = useState('Live from the Metaverse!');
  const [account, setAccount] = useState(null);
  const [web3, setWeb3]  = useState(null);
  const [contract, setContract] = useState(null);

  const inputStreamRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const requestAnimationRef = useRef();
  const nameRef = useRef();


  useEffect(() => {
    async function fetchData() {
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      // Load abi and address from testnet
      const imbueEvents = new web3.eth.Contract(ImbueEventsContract.abi, CONTRACT_ADDRESS);

      setWeb3(web3);
      setContract(imbueEvents);
    }

    fetchData();
  }, []);

  const enableCamera = async () => {
    inputStreamRef.current = await navigator.mediaDevices.getUserMedia(
      CAMERA_CONSTRAINTS
    );
    videoRef.current.srcObject = inputStreamRef.current;

    await videoRef.current.play();

    // We need to set the canvas height/width to match the video element.
    canvasRef.current.height = videoRef.current.clientHeight;
    canvasRef.current.width = videoRef.current.clientWidth;

    requestAnimationRef.current = requestAnimationFrame(updateCanvas);

    setCameraEnabled(true);
  };

  const updateCanvas = () => {
    if (videoRef.current.ended || videoRef.current.paused) {
      return;
    }

    const ctx = canvasRef.current.getContext('2d');

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.clientWidth,
      videoRef.current.clientHeight
    );

    ctx.fillStyle = '#FB3C4E';
    ctx.font = '50px Akkurat';
    ctx.fillText(nameRef.current, 10, 50, canvasRef.current.width - 20);

    requestAnimationRef.current = requestAnimationFrame(updateCanvas);
  };

  const stopStreaming = () => {
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setStreaming(false);
  };

  const startStreaming = () => {
    setStreaming(true);

    const protocol = window.location.protocol.replace('http', 'ws');
    const wsUrl = `${protocol}//${window.location.host}/rtmp?key=${streamKey}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.addEventListener('open', function open() {
      setConnected(true);

      contract.methods.startEvent(this.props.eventId).send({from: account});
    });

    wsRef.current.addEventListener('close', () => {
      setConnected(false);
      stopStreaming();
    });

    const videoOutputStream = canvasRef.current.captureStream(30); // 30 FPS

    // Let's do some extra work to get audio to join the party.
    // https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
    const audioStream = new MediaStream();
    const audioTracks = inputStreamRef.current.getAudioTracks();
    audioTracks.forEach(function (track) {
      audioStream.addTrack(track);
    });

    const outputStream = new MediaStream();
    [audioStream, videoOutputStream].forEach(function (s) {
      s.getTracks().forEach(function (t) {
        outputStream.addTrack(t);
      });
    });

    mediaRecorderRef.current = new MediaRecorder(outputStream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 3000000,
    });

    mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
      wsRef.current.send(e.data);
    });

    mediaRecorderRef.current.addEventListener('stop', () => {
      stopStreaming();
      wsRef.current.close();
    });

    mediaRecorderRef.current.start(1000);
  };

  useEffect(() => {
    nameRef.current = textOverlay;
  }, [textOverlay]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestAnimationRef.current);
    };
  }, []);
// 6B47C1
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h1>LandPeer</h1>
        <p>
        Live streams from the Metaverse
        </p>

        {cameraEnabled &&
          (streaming ? (
            <div>
              <span
                className={`${styles.streamStatus} ${
                  connected ? styles.connected : styles.disconnected
                }`}
              >
                {connected ? 'Connected' : 'Disconnected'}
              </span>
              <input
                placeholder="Text Overlay"
                type="text"
                value={textOverlay}
                onChange={(e) => setTextOverlay(e.target.value)}
              />
              <button onClick={stopStreaming}>Stop Streaming</button>
            </div>
          ) : (
            <>
              <input
                placeholder="Livepeer Stream Key"
                type="text"
                onChange={(e) => setStreamKey(e.target.value)}
              />
              <button
                className={styles.startButton}
                disabled={!streamKey}
                onClick={startStreaming}
              >
                Start Streaming
              </button>
            </>
          ))}
      </div>
      <div
        className={`${styles.videoContainer} ${
          cameraEnabled && styles.cameraEnabled
        }`}
      >
        {!cameraEnabled && (
          <button className={styles.startButton} onClick={enableCamera}>
            Enable Camera
          </button>
        )}
        <div className={styles.inputVideo}>
          <video ref={videoRef} muted playsInline></video>
        </div>
        <div className={styles.outputCanvas}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};
