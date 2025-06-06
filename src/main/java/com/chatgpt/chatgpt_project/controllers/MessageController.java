package com.chatgpt.chatgpt_project.controllers;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.mappers.MessageMapper;
import com.chatgpt.chatgpt_project.models.Message;
import com.chatgpt.chatgpt_project.models.dto.message.CreateMessageRequestDTO;
import com.chatgpt.chatgpt_project.models.dto.message.MessageResponseDTO;
import com.chatgpt.chatgpt_project.services.ChatThreadService;
import com.chatgpt.chatgpt_project.services.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@PreAuthorize("isAuthenticated()")
public class MessageController extends BaseController{

    private final MessageService messageService;
    private final ChatThreadService chatThreadService;

    public MessageController(MessageService messageService, ChatThreadService chatThreadService) {
        this.messageService = messageService;
        this.chatThreadService = chatThreadService;
    }

    @PostMapping
    public MessageResponseDTO createMessage(@RequestBody CreateMessageRequestDTO request, Authentication authentication) throws ChatgptException {

        Long userId = extractUserIdFromAuthentication(authentication);

        // Ελέγχουμε αν ο χρήστης έχει access στο thread
        chatThreadService.getThreadForUser(userId, request.getThreadId());

        Message llmMessage = messageService.createMessageAndGetCompletion(
                userId,
                request.getThreadId(),
                request.getContent(),
                request.getModel()
        );

        return MessageMapper.toDTO(llmMessage);
    }

    @GetMapping("/thread/{threadId}")
    public List<MessageResponseDTO> getMessagesForThread(@PathVariable Long threadId, Authentication authentication) throws ChatgptException {

        Long userId = extractUserIdFromAuthentication(authentication);

        // Ελέγχουμε αν ο χρήστης έχει access στο thread
        chatThreadService.getThreadForUser(userId, threadId);

        List<Message> messages = messageService.getMessagesForThread(threadId);

        return messages.stream()
                .map(MessageMapper::toDTO)
                .toList();
    }


}

