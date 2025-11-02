package chat.backend.service;

import chat.backend.dto.common.Room;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SetOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {
    private final StringRedisTemplate stringRedisTemplate;

    public String createRoom(String title) {
        String roomId = UUID.randomUUID().toString();

        Map<String, String> roomData = new HashMap<>();
        roomData.put("id", roomId);
        roomData.put("title", title);
        roomData.put("userCount", "0");

        stringRedisTemplate.opsForSet().add("room:list", roomId);
        stringRedisTemplate.opsForHash().putAll("room:" + roomId, roomData);
        return roomId;
    }

    public void joinRoom(String roomId) {
        stringRedisTemplate.opsForHash().increment("room:" + roomId, "userCount", 1);
        stringRedisTemplate.persist("room:" + roomId);
    }

    public void leaveRoom(String roomId) {
        Long userCount = stringRedisTemplate.opsForHash().increment("room:" + roomId, "userCount", -1);
        if (userCount <= 0) {
            stringRedisTemplate.expire("room:" + roomId, 30, TimeUnit.SECONDS);
        }
    }

    public Room getRoomInfo(String roomId) {
        Map<String, String> roomData = stringRedisTemplate.<String, String>opsForHash().entries("room:" + roomId);

        if (roomData.isEmpty()) {
            return null;
        }

        return Room.builder()
                .id(roomData.get("id"))
                .title(roomData.get("title"))
                .userCount(Integer.parseInt(roomData.get("userCount")))
                .build();
    }

    public List<Room> getAllRooms() {
        Set<String> roomIds = stringRedisTemplate.opsForSet().members("room:list");

        if (roomIds == null || roomIds.isEmpty()) {
            return Collections.emptyList();
        }

        return roomIds.stream()
                .map(this::getRoomInfo)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

}

