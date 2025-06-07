package com.chatgpt.chatgpt_project.controllers;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.models.dto.user.UserTraitDTO;
import com.chatgpt.chatgpt_project.services.UserTraitService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/traits")
@PreAuthorize("isAuthenticated()")
public class UserTraitController extends BaseController {

    private final UserTraitService userTraitService;

    public UserTraitController(UserTraitService userTraitService) {
        this.userTraitService = userTraitService;
    }

    @GetMapping("/me")
    public UserTraitDTO getMyTraits(Authentication authentication) throws ChatgptException {
        Long userId = extractUserIdFromAuthentication(authentication);
        return userTraitService.getTraitsForUser(userId);
    }

    @PostMapping("/me")
    public void saveMyTraits(@RequestBody UserTraitDTO dto, Authentication authentication) throws ChatgptException {
        Long userId = extractUserIdFromAuthentication(authentication);
        userTraitService.saveTraitsForUser(userId, dto);
    }
}
