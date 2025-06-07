package com.chatgpt.chatgpt_project.services;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.models.Message;
import com.chatgpt.chatgpt_project.models.User;
import com.chatgpt.chatgpt_project.models.ChatThread;
import com.chatgpt.chatgpt_project.models.UserTrait;
import com.chatgpt.chatgpt_project.models.dto.chat.ChatCompletionRequest;
import com.chatgpt.chatgpt_project.models.dto.chat.ChatCompletionResponse;
import com.chatgpt.chatgpt_project.models.dto.chat.ChatMessage;
import com.chatgpt.chatgpt_project.repository.MessageRepository;
import com.chatgpt.chatgpt_project.repository.ChatThreadRepository;
import com.chatgpt.chatgpt_project.repository.UserRepository;
import com.chatgpt.chatgpt_project.repository.UserTraitRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import com.chatgpt.chatgpt_project.utils.FileContentExtractor;
import java.nio.file.Paths;
import java.nio.file.Path;



import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final UserRepository userRepository;
    private final UserTraitRepository userTraitRepository;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public MessageService(MessageRepository messageRepository, ChatThreadRepository chatThreadRepository, UserRepository userRepository, UserTraitRepository userTraitRepository) {
        this.messageRepository = messageRepository;
        this.chatThreadRepository = chatThreadRepository;
        this.userRepository = userRepository;
        this.userTraitRepository = userTraitRepository;
    }

    String safeValue(String value, String fallback) {
        return (value != null && !value.isBlank()) ? value : fallback;
    }

    public Message createMessageAndGetCompletion(Long userId, Long threadId, String content, String model, String fileUrl) throws ChatgptException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ChatgptException("User not found", HttpStatus.NOT_FOUND));

        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ChatgptException("Thread not found", HttpStatus.NOT_FOUND));

        List<String> traits = userTraitRepository.findByUserId(userId).stream()
                .map(UserTrait::getTrait)
                .toList();

        String traitsText = traits.isEmpty() ? "None specified." : String.join(", ", traits);

        String fileContent = "";

        if (fileUrl != null) {
            try {
                // Προσοχή → εδώ "απογυμνώνουμε" το url prefix, πχ αν fileUrl = "/uploads/xxx" → κρατάμε το path
                String filePathStr = fileUrl.startsWith("/") ? fileUrl.substring(1) : fileUrl;
                Path filePath = Paths.get(filePathStr);

                // Extract content
                String originalFilename = filePath.getFileName().toString();
                fileContent = FileContentExtractor.extractFileContent(filePath, originalFilename);
            } catch (Exception e) {
                fileContent = "Failed to read uploaded file content.";
            }
        }


        String systemPrompt = """
            You are a helpful assistant.
            You are chatting with %s.
            About the user: %s.
            Occupation: %s.
            Additional info: %s.
            Please adapt your tone and style according to the following user traits: %s.            
            """.formatted(
                safeValue(user.getName(), "Anonymous User"),
                safeValue(user.getAboutMe(), "Not provided."),
                safeValue(user.getWhatDoYouDo(), "Not provided."),
                safeValue(user.getAnythingElse(), "Not provided."),
                traitsText
            );

        if (!fileContent.isBlank()) {
            systemPrompt += """

            The user has uploaded a document with the following content:
            
            %s
            """.formatted(fileContent);
        }

        // Save user message first
        Message userMessage = Message.builder()
                .content(content)
                .isLLMGenerated(false)
                .completionModel(null)
                .createdAt(LocalDateTime.now())
                .thread(thread)
                .user(user)
                .fileUrl(fileUrl)
                .build();

        messageRepository.save(userMessage);

        // Prepare chat history for LLM
        List<Message> previousMessages = messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);

        // Optional: Αν θες να στέλνεις μόνο τα τελευταία 10 messages:
        int maxMessages = 15;
        if (previousMessages.size() > maxMessages) {
            previousMessages = previousMessages.subList(previousMessages.size() - maxMessages, previousMessages.size());
        }

        // Build full ChatMessage list
        ChatMessage systemMessage = new ChatMessage("system", systemPrompt);

        List<ChatMessage> chatHistory = previousMessages.stream()
                .map(m -> new ChatMessage(
                        m.getIsLLMGenerated() ? "assistant" : "user",
                        m.getContent()
                ))
                .collect(Collectors.toList());

        // Add current user message (the new one we just saved)
        chatHistory.add(new ChatMessage("user", content));

        List<ChatMessage> fullChatMessages = new ArrayList<>();
        fullChatMessages.add(systemMessage); // system prompt first
        fullChatMessages.addAll(chatHistory); // chat history + current message

        // Call Groq API
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + groqApiKey);

        ChatCompletionRequest chatCompletionRequest = new ChatCompletionRequest();
        chatCompletionRequest.setModel(model);
        chatCompletionRequest.setMessages(fullChatMessages);

        HttpEntity<ChatCompletionRequest> httpEntity =
                new HttpEntity<>(chatCompletionRequest, headers);

        ChatCompletionResponse response;
        try {
            response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    httpEntity,
                    ChatCompletionResponse.class
            ).getBody();
        } catch (Exception e) {
            throw new ChatgptException("Error calling Groq API: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
            throw new ChatgptException("Empty response from Groq API", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        String llmReplyContent = response.getChoices().get(0).getMessage().getContent();

        // Save LLM reply message
        Message llmMessage = Message.builder()
                .content(llmReplyContent)
                .isLLMGenerated(true)
                .completionModel(response.getModel())
                .createdAt(LocalDateTime.now())
                .thread(thread)
                .user(null) // no user for LLM message
                .build();

        messageRepository.save(llmMessage);

        // Return LLM reply message
        return llmMessage;
    }

    public List<Message> getMessagesForThread(Long threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

}
