package com.chatgpt.chatgpt_project.models.dto.chatThread;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateThreadRequestDTO {
    private String name;
}
