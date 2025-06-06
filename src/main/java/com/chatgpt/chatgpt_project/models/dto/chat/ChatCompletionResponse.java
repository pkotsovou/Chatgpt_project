package com.chatgpt.chatgpt_project.models.dto.chat;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatCompletionResponse {
    private String id;
    private String object;
    private long created;
    private String model;
    private List<Choice> choices;

    private Usage usage;

//    @JsonProperty("usage_breakdown")
//    private UsageBreakdown usageBreakdown;

    @JsonProperty("system_fingerprint")
    private String systemFingerprint;

//    @JsonProperty("x_groq")
//    private XGroq xGroq;

}
