package chat.backend.controller;

import chat.backend.dto.common.Chat;
import chat.backend.dto.common.Preview;
import chat.backend.dto.request.ChatHistoryRequest;
import chat.backend.dto.response.ChatResponse;
import chat.backend.service.ChatService;
import chat.backend.service.RedisPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final RedisPublisher redisPublisher;
    private final ChatService chatService;

    @MessageMapping("/chat")
    public void send(Chat chat) {
        chat.setTimestamp(System.currentTimeMillis());

        ChatResponse chatResponse = redisPublisher.publishChat(chat);

        Preview preview = Preview.builder()
                .chatId(chatResponse.getChatId())
                .roomId(chatResponse.getRoomId())
                .lastMessage(chatResponse.getMessage())
                .timestamp(chatResponse.getTimestamp())
                .build();
        redisPublisher.publishPreview(preview);
    }

    @PostMapping("/history")
    @ResponseBody
    public ResponseEntity<List<ChatResponse>> getHistory(
            @RequestBody ChatHistoryRequest request
    ) {
        List<ChatResponse> response = chatService.getHistory(request.getRoomId(), request.getChatId());
        return ResponseEntity.ok(response);
    }
}
