package com.chatgpt.chatgpt_project.controllers;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.mappers.MessageMapper;
import com.chatgpt.chatgpt_project.models.Message;
import com.chatgpt.chatgpt_project.models.dto.message.CreateMessageRequestDTO;
import com.chatgpt.chatgpt_project.models.dto.message.MessageResponseDTO;
import com.chatgpt.chatgpt_project.services.ChatThreadService;
import com.chatgpt.chatgpt_project.services.MessageService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/messages")
@PreAuthorize("isAuthenticated()")
public class MessageController extends BaseController {

    private final MessageService messageService;
    private final ChatThreadService chatThreadService;

    public MessageController(MessageService messageService, ChatThreadService chatThreadService) {
        this.messageService = messageService;
        this.chatThreadService = chatThreadService;
    }

    // Απλό JSON - χωρίς αρχείο
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public MessageResponseDTO createMessageJson(
            @RequestBody CreateMessageRequestDTO request,
            Authentication authentication
    ) throws ChatgptException {
        Long userId = extractUserIdFromAuthentication(authentication);

        // Έλεγχος access στο thread
        chatThreadService.getThreadForUser(userId, request.getThreadId());

        // Δημιουργία μηνύματος χωρίς αρχείο
        Message llmMessage = messageService.createMessageAndGetCompletion(
                userId,
                request.getThreadId(),
                request.getContent(),
                request.getModel(),
                null
        );

        return MessageMapper.toDTO(llmMessage);
    }


    // Multipart - με αρχείο
    @PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MessageResponseDTO createMessageWithFile(
            @RequestPart("data") String data,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication
    ) throws ChatgptException {
        Long userId = extractUserIdFromAuthentication(authentication);

        // Μετατροπή του data (JSON string) σε DTO
        CreateMessageRequestDTO request;
        try {
            ObjectMapper mapper = new ObjectMapper();
            request = mapper.readValue(data, CreateMessageRequestDTO.class);
        } catch (JsonProcessingException e) {
            throw new ChatgptException("Invalid message data format", HttpStatus.BAD_REQUEST);
        }

        // Έλεγχος access στο thread
        chatThreadService.getThreadForUser(userId, request.getThreadId());


        // Handle file upload
        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            String originalFilename = file.getOriginalFilename();
            String newFileName = java.util.UUID.randomUUID() + "_" + originalFilename;
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, newFileName);

            try {
                java.nio.file.Files.createDirectories(filePath.getParent());
                file.transferTo(filePath.toFile());
            } catch (Exception e) {
                throw new ChatgptException("File upload failed: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
            }

            fileUrl = "/uploads/" + newFileName;
        }

        // Δημιουργία μηνύματος με fileUrl
        Message llmMessage = messageService.createMessageAndGetCompletion(
                userId,
                request.getThreadId(),
                request.getContent(),
                request.getModel(),
                fileUrl
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

