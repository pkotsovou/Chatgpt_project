package com.chatgpt.chatgpt_project.models.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponseDTO {

    private Long id;
    private String content;
    private Boolean isLLMGenerated;
    private String completionModel;
    private LocalDateTime createdAt;

    private Long threadId;
    private Long userId; // μπορεί να είναι null για LLM messages
}
