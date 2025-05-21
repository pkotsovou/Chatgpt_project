package com.chatgpt.chatgpt_project.models.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String aboutMe;
    private String customPrompt;
    private String whatDoYouDo;
    private String anythingElse;
}
