package chat.backend.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chat {
    private String roomId;
    private String senderId;
    private String sender;
    private String message;
    private long timestamp;
}
