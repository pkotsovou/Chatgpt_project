package com.chatgpt.chatgpt_project.mappers;

import com.chatgpt.chatgpt_project.models.Message;
import com.chatgpt.chatgpt_project.models.dto.message.MessageResponseDTO;

public class MessageMapper {
    public static MessageResponseDTO toDTO(Message message) {
        return new MessageResponseDTO(
                message.getId(),
                message.getContent(),
                message.getIsLLMGenerated(),
                message.getCompletionModel(),
                message.getCreatedAt(),
                message.getThread().getId(),
                message.getUser() != null ? message.getUser().getId() : null,
                message.getFileUrl()
        );
    }
}
