package com.chatgpt.chatgpt_project.models.dto.chatThread;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatThreadResponseDTO {
    private Long id;
    private String name;
    private LocalDateTime createdAt;
}

