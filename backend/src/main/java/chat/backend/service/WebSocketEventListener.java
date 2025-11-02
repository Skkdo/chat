package chat.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final RoomService roomService;

    @EventListener
    public void handleSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        String roomId = accessor.getSubscriptionId();
        log.info("subscribe start destination = {}", destination);

        if(destination != null && destination.startsWith("/topic/room/")) {
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                Set<String> joinedRooms = (Set<String>) sessionAttributes.get("joinedRooms");

                if (joinedRooms == null) {
                    joinedRooms = new HashSet<>();
                    sessionAttributes.put("joinedRooms", joinedRooms);
                }

                if(!joinedRooms.contains(roomId)) {
                    joinedRooms.add(roomId);
                    log.info("handleSubscribe - new room join. roomId : {}", roomId);
                    roomService.joinRoom(roomId);
                }else {
                    log.info("handleSubscribe - Already in room. roomId : {}", roomId);
                }
            }
        }
    }

    @EventListener
    public void handleUnsubscribe(SessionUnsubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        log.info("unsubscribe start destination = {}", destination);

        if(destination != null && destination.startsWith("/topic/room/")) {
            String[] parts = destination.split("/");
            String roomId = parts[3];

            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null) {
                Set<String> joinedRooms = (Set<String>) sessionAttributes.get("joinedRooms");
                if(joinedRooms != null) {
                    boolean exist = joinedRooms.remove(roomId);
                    if(exist) {
                        log.info("handleUnsubscribe - unsubscribe room. roomId : {}", roomId);
                        roomService.leaveRoom(roomId);
                    }else {
                        log.info("handleUnsubscribe - not subscribe room. roomId : {}", roomId);
                    }
                }
            }
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();

        if (sessionAttributes != null) {
            Set<String> joinedRooms = (Set<String>) sessionAttributes.get("joinedRooms");
            if (joinedRooms != null) {
                for (String roomId : joinedRooms) {
                    log.info("handleDisconnect - disconnect room. roomId : {}", roomId);
                    roomService.leaveRoom(roomId);
                }
                log.info("handleDisconnect - disconnect complete");
            }
        }
    }
}
