package com.chatgpt.chatgpt_project.models.dto.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Choice {
    private int index;
    private ChatMessage message;
    private Object logprobs;
    @JsonProperty("finish_reason")
    private String finishReason;

}
