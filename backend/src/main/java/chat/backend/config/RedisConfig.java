package chat.backend.config;

import chat.backend.service.RedisSubscriber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

@Configuration
public class RedisConfig {
    @Value("${spring.data.redis.host}")
    private String HOST;

    @Value("${spring.data.redis.port}")
    private int PORT;

    @Value("${preview.channel}")
    private String PREVIEW;

    @Value("${chat.channel}")
    private String CHAT;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(HOST, PORT);
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory redisConnectionFactory,
            RedisSubscriber redisSubscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);
        container.addMessageListener(redisSubscriber, new ChannelTopic(PREVIEW));
        container.addMessageListener(redisSubscriber, new ChannelTopic(CHAT));
        return container;
    }
}
