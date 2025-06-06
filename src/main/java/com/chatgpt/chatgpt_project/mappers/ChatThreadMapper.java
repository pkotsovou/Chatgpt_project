package com.chatgpt.chatgpt_project.mappers;

import com.chatgpt.chatgpt_project.models.ChatThread;
import com.chatgpt.chatgpt_project.models.dto.chatThread.ChatThreadResponseDTO;

public class ChatThreadMapper {
    public static ChatThreadResponseDTO toDTO(ChatThread thread) {
        return new ChatThreadResponseDTO(
                thread.getId(),
                thread.getName(),
                thread.getCreatedAt()
        );
    }
}
