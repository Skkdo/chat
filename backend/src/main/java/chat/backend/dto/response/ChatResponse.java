package chat.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {
    private String chatId;
    private String roomId;
    private String senderId;
    private String sender;
    private String message;
    private long timestamp;
}
