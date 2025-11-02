package chat.backend.service;

import chat.backend.dto.common.Chat;
import chat.backend.dto.common.Preview;
import chat.backend.dto.response.ChatResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisSubscriber implements MessageListener {
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${preview.channel}")
    private String PREVIEW;

    @Value("${chat.channel}")
    private String CHAT;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(pattern, StandardCharsets.UTF_8);
            String body = new String(message.getBody(), StandardCharsets.UTF_8);

            if(channel.equals(CHAT)){
                ChatResponse chat = objectMapper.readValue(body, ChatResponse.class);
                String roomId = chat.getRoomId();
                messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", chat);

            }else if(channel.equals(PREVIEW)) {
                Preview preview = objectMapper.readValue(body, Preview.class);
                String roomId = preview.getRoomId();
                messagingTemplate.convertAndSend("/topic/room/" + roomId + "/preview", preview);
            }
        } catch (Exception e) {
            log.error("onMessage 처리 실패", e);
        }
    }
}
