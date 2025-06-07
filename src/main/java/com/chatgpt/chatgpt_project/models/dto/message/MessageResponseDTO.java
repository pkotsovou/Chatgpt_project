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
    private String fileUrl;

    private Long threadId;
    private Long userId; // μπορεί να είναι null για LLM messages

    public MessageResponseDTO(Long id, String content, Boolean isLLMGenerated, String completionModel, LocalDateTime createdAt, Long threadId, Long userId, String fileUrl){
        this.id = id;
        this.content = content;
        this.isLLMGenerated = isLLMGenerated;
        this.completionModel = completionModel;
        this.createdAt = createdAt;
        this.fileUrl = fileUrl;
        this.threadId = threadId;
        this.userId = userId;
    }

    public MessageResponseDTO(Long id, String content, Boolean isLLMGenerated, String completionModel, LocalDateTime createdAt, Long id1, Long aLong, Object o, String fileUrl) {
    }
}
