import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_ENDPOINT = 'http://localhost:8080/ws';

const client = new Client({
  webSocketFactory: () => new SockJS(WS_ENDPOINT),
  reconnectDelay: 5000,
});

let connected = false;

client.onConnect = () => {
  connected = true;
  console.log('STOMP connected');
};

client.onDisconnect = () => {
  connected = false;
  console.log('STOMP disconnected');
};

client.onStompError = (frame) => {
  console.error('STOMP error', frame);
};

client.activate();

export default client;
export { client, connected };
