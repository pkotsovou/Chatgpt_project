package com.chatgpt.chatgpt_project.mappers;

import com.chatgpt.chatgpt_project.models.User;
import com.chatgpt.chatgpt_project.models.dto.user.UserRegisterDTO;
import com.chatgpt.chatgpt_project.models.dto.user.UserResponseDTO;
import com.chatgpt.chatgpt_project.models.dto.user.UserUpdateDTO;

import java.util.List;

public class UserMapper {
    public static User toEntity(UserRegisterDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setName(dto.getName());
        return user;
    }


    public static UserResponseDTO toResponseDTO(User user, List<String> traits) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAboutMe(),
                user.getCustomPrompt(),
                user.getWhatDoYouDo(),
                user.getAnythingElse(),
                traits
        );
    }

    public static UserResponseDTO toResponseDTO(User user) {
        return toResponseDTO(user, List.of());
    }

    public static void updateUserFromDTO(User user, UserUpdateDTO dto) {
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setAboutMe(dto.getAboutMe());
        user.setCustomPrompt(dto.getCustomPrompt());
        user.setWhatDoYouDo(dto.getWhatDoYouDo());
        user.setAnythingElse(dto.getAnythingElse());
    }
}
