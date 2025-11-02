import { create } from 'zustand';

export const useJoinedRoomsStore = create((set) => ({
  joinedRooms: [],

  // 방 참여
joinRoom: (room) =>
  set((state) => {
    const exists = state.joinedRooms.find((r) => r.id === room.id);
    if (exists) return state;

    return {
      joinedRooms: [
        ...state.joinedRooms,
        {
          id: room.id,
          title: room.title,
          userCount: room.userCount + 1,
          lastMessage: room.lastMessage,
          chatId: room.chatId,
          firstEnter: true,
        },
      ],
    };
  }),

  updateRoom: (roomId, updatedFields) =>
    set((state) => ({
      joinedRooms: state.joinedRooms.map((room) =>
        room.id === roomId ? { ...room, ...updatedFields } : room
      ),
    })),

  leaveRoom: (roomId) =>
    set((state) => ({
      joinedRooms: state.joinedRooms.filter((r) => r.id !== roomId),
    })),

}));

useJoinedRoomsStore.subscribe((state) => {
  console.log('[Zustand] joinedRooms 업데이트됨:', state.joinedRooms);
});
