package chat.backend.controller;

import chat.backend.dto.common.Room;
import chat.backend.dto.request.CreateRoomRequest;
import chat.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/create-room")
    public ResponseEntity<Map<String, String>> createRoom(
            @RequestBody CreateRoomRequest request
    ) {
        String roomId = roomService.createRoom(request.getTitle());
        return ResponseEntity.ok(Map.of("roomId", roomId));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getRooms() {
        List<Room> response = roomService.getAllRooms();
        return ResponseEntity.ok(response);
    }
}
