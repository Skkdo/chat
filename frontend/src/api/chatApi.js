export async function getHistory(roomId, lastChatId) {
  const response = await fetch('/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        roomId : roomId,
        chatId : lastChatId,
    }),
  });
  if (!response.ok) throw new Error('Failed to create room');
  return await response.json();
}