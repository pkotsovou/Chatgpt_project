package com.chatgpt.chatgpt_project.exceptions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatgptErrorEntity {
    private String message;
    private Integer errorCode;
    private String errorDescription;
}
