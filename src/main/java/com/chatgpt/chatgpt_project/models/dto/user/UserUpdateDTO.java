package com.chatgpt.chatgpt_project.models.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDTO {
    private String name;
    private String email;
    private String password;
    private String aboutMe;
    private String customPrompt;
    private String whatDoYouDo;
    private String anythingElse;
}
