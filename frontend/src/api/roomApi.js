export async function fetchRooms() {
  const response = await fetch('/rooms');
  if (!response.ok) throw new Error('Failed to fetch rooms');
  return await response.json();
}

export async function createRoom(title) {
  const response = await fetch('/create-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({title: title}),
  });
  if (!response.ok) throw new Error('Failed to create room');
  return await response.json();
}

