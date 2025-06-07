package com.chatgpt.chatgpt_project.models.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMessageRequestDTO {
    private Long threadId;
    private String content;
    private String model;
}

