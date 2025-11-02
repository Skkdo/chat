package chat.backend.dto.common;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    private String id;
    private String title;
    private int userCount;
}
