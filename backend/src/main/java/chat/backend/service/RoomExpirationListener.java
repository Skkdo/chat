package chat.backend.service;

import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.KeyExpirationEventMessageListener;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;

@Component
public class RoomExpirationListener extends KeyExpirationEventMessageListener {

    private final StringRedisTemplate stringRedisTemplate;

    public RoomExpirationListener(RedisMessageListenerContainer listenerContainer, StringRedisTemplate stringRedisTemplate) {
        super(listenerContainer);
        this.stringRedisTemplate = stringRedisTemplate;
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();

        if (expiredKey.startsWith("room:")) {
            String roomId = expiredKey.replace("room:", "");
            stringRedisTemplate.opsForSet().remove("room:list", roomId);
        }
    }
}
