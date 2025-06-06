package com.chatgpt.chatgpt_project.models.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatCompletionRequest {
    private String model;
    private List<ChatMessage> messages;


}
