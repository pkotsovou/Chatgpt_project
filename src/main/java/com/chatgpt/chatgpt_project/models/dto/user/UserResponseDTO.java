package com.chatgpt.chatgpt_project.models.dto.user;

import com.chatgpt.chatgpt_project.models.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String aboutMe;
    private String customPrompt;
    private String whatDoYouDo;
    private String anythingElse;
    private List<String> traits;


    public UserResponseDTO(Long id, String name, String email, String aboutMe, String customPrompt, String whatDoYouDo, String anythingElse, List<String> traits) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.aboutMe = aboutMe;
        this.customPrompt = customPrompt;
        this.whatDoYouDo = whatDoYouDo;
        this.anythingElse = anythingElse;
        this.traits = traits;
    }
}
