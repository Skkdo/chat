import { client } from './stompClient';

export function subscribeChat(roomId, onMessage) {
  const destination = `/topic/room/${roomId}/chat`;
  const subscription = client.subscribe(destination, (message) => {
    const body = JSON.parse(message.body);
    onMessage(body);
  },
  {id: roomId}
  );

  return () =>
    subscription.unsubscribe({
        id: roomId,
        destination,
    });
}


export function subscribePreview(roomId, onUpdate) {
  const destination = `/topic/room/${roomId}/preview`;
  const subscription = client.subscribe(destination, (message) => {
    const updatedRoom = JSON.parse(message.body);
    onUpdate(updatedRoom);
  },
  {id: roomId}
  );
  return () =>
    subscription.unsubscribe({
        id: roomId,
        destination,
    });
}

export function sendChatMessage(message) {
  client.publish({
    destination: `/app/chat`,
    body: JSON.stringify(message),
  });
}


