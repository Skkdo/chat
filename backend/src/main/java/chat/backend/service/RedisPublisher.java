package chat.backend.service;

import chat.backend.dto.common.Chat;
import chat.backend.dto.response.ChatResponse;
import chat.backend.dto.common.Preview;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisPublisher {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${preview.channel}")
    private String PREVIEW;

    @Value("${chat.channel}")
    private String CHAT;

    public void publishPreview(Preview message) {
        try {
            String jsonMessage = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(PREVIEW, jsonMessage);
        } catch (JsonProcessingException e) {
            log.error("Preview 직렬화 실패", e);
        }
    }

    public ChatResponse publishChat(Chat message) {
        String streamKey = "room:" + message.getRoomId() + ":messages";
        RecordId recordId = redisTemplate.opsForStream().add(streamKey, Map.of(
                "senderId", message.getSenderId(),
                "sender", message.getSender(),
                "message", message.getMessage(),
                "timestamp", String.valueOf(message.getTimestamp())
        ));

        ChatResponse chatResponse = ChatResponse.builder()
                .roomId(message.getRoomId())
                .senderId(message.getSenderId())
                .sender(message.getSender())
                .message(message.getMessage())
                .timestamp(message.getTimestamp())
                .chatId(recordId.getValue())
                .build();

        try {
            String json = objectMapper.writeValueAsString(chatResponse);
            redisTemplate.convertAndSend(CHAT, json);
        } catch (JsonProcessingException e) {
            log.error("Chat 직렬화 실패", e);
        }
        return chatResponse;
    }
}
