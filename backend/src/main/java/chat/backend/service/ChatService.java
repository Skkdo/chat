package chat.backend.service;

import chat.backend.dto.response.ChatResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.Limit;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final StringRedisTemplate redisTemplate;

    public List<ChatResponse> getHistory(String roomId, String chatId) {
        if (chatId == null || chatId.isBlank()) {
            return List.of();
        }
        List<ChatResponse> chatsBeforeId = getChatsBeforeId(roomId, chatId);
        List<ChatResponse> chatsAfterId = getChatsAfterId(roomId, chatId);


        return Stream.concat(
                chatsBeforeId.stream(),
                chatsAfterId.stream())
                .toList();
    }

    public List<ChatResponse> getChatsBeforeId(String roomId, String chatId) {
        String streamKey = "room:" + roomId + ":messages";

        Range<String> range = Range.closed("-", chatId);

        List<MapRecord<String, Object, Object>> records = redisTemplate.opsForStream().range(streamKey, range, Limit.limit().count(50));

        if (records == null) {
            return Collections.emptyList();
        }

        return records.stream()
                .map(record -> {
                    Map<Object, Object> value = record.getValue();
                    return ChatResponse.builder()
                            .chatId(record.getId().getValue())
                            .roomId(roomId)
                            .senderId(value.get("senderId").toString())
                            .sender(value.get("sender").toString())
                            .message(value.get("message").toString())
                            .timestamp(Long.parseLong(value.get("timestamp").toString()))
                            .build();
                })
                .toList();
    }

    public List<ChatResponse> getChatsAfterId(String roomId, String chatId) {
        String streamKey = "room:" + roomId + ":messages";

        Range<String> range = Range.open(chatId, "+");

        List<MapRecord<String, Object, Object>> records = redisTemplate.opsForStream().range(streamKey, range);

        if (records == null) {
            return Collections.emptyList();
        }

        return records.stream()
                .map(record -> {
                    Map<Object, Object> value = record.getValue();
                    return ChatResponse.builder()
                            .chatId(record.getId().getValue())
                            .roomId(roomId)
                            .senderId(value.get("senderId").toString())
                            .sender(value.get("sender").toString())
                            .message(value.get("message").toString())
                            .timestamp(Long.parseLong(value.get("timestamp").toString()))
                            .build();
                })
                .toList();
    }
}
