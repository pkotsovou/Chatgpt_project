package com.chatgpt.chatgpt_project.controllers;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.mappers.ChatThreadMapper;
import com.chatgpt.chatgpt_project.models.ChatThread;
import com.chatgpt.chatgpt_project.models.dto.chatThread.ChatThreadResponseDTO;
import com.chatgpt.chatgpt_project.models.dto.chatThread.CreateThreadRequestDTO;
import com.chatgpt.chatgpt_project.services.ChatThreadService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/threads")
@PreAuthorize("isAuthenticated()")
public class ChatThreadController extends BaseController {

    private final ChatThreadService chatThreadService;

    public ChatThreadController(ChatThreadService chatThreadService) {
        this.chatThreadService = chatThreadService;
    }

    @PostMapping
    public ChatThread createThread(@RequestBody CreateThreadRequestDTO request, Authentication authentication) throws ChatgptException {

        Long userId = extractUserIdFromAuthentication(authentication);

        return chatThreadService.createThread(userId, request.getName());
    }

    @GetMapping("/user/me")
    public List<ChatThreadResponseDTO> getMyThreads(Authentication authentication) throws ChatgptException {

        Long userId = extractUserIdFromAuthentication(authentication);

        List<ChatThread> threads = chatThreadService.getThreadsForUser(userId);

        return threads.stream()
                .map(ChatThreadMapper::toDTO)
                .toList();
    }

    @PutMapping("/{threadId}")
    public ChatThreadResponseDTO  updateThreadName(@PathVariable("threadId") Long threadId, @RequestBody CreateThreadRequestDTO request, Authentication authentication) throws ChatgptException {

        Long userId = extractUserIdFromAuthentication(authentication);

        ChatThread updatedThread = chatThreadService.updateThreadName(userId, threadId, request.getName());

        return ChatThreadMapper.toDTO(updatedThread);
    }


    @DeleteMapping("/{threadId}")
    public void deleteThread(@PathVariable("threadId") Long threadId, Authentication authentication) throws ChatgptException {

        Long userId = extractUserIdFromAuthentication(authentication);

        chatThreadService.deleteThread(userId, threadId);
    }
}
