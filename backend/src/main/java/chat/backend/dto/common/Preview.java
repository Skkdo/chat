package chat.backend.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Preview {
    private String chatId;
    private String roomId;
    private String lastMessage;
    private long timestamp;
}
