package com.chatgpt.chatgpt_project.services;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.models.ChatThread;
import com.chatgpt.chatgpt_project.models.User;
import com.chatgpt.chatgpt_project.repository.ChatThreadRepository;
import com.chatgpt.chatgpt_project.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatThreadService {

    private final ChatThreadRepository chatThreadRepository;
    private final UserRepository userRepository;

    public ChatThreadService(ChatThreadRepository chatThreadRepository, UserRepository userRepository) {
        this.chatThreadRepository = chatThreadRepository;
        this.userRepository = userRepository;
    }

    public ChatThread createThread(Long userId, String name) throws ChatgptException {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ChatgptException("User not found", HttpStatus.NOT_FOUND));

        ChatThread thread = ChatThread.builder()
                .name(name)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        return chatThreadRepository.save(thread);
    }

    public List<ChatThread> getThreadsForUser(Long userId) {
        return chatThreadRepository.findByUserId(userId);
    }

    public ChatThread updateThreadName(Long userId, Long threadId, String newName) throws ChatgptException {

        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ChatgptException("Thread not found", HttpStatus.NOT_FOUND));

        if (!thread.getUser().getId().equals(userId)) {
            throw new ChatgptException("You do not have permission to update this thread.", HttpStatus.FORBIDDEN);
        }

        thread.setName(newName);

        return chatThreadRepository.save(thread);
    }

    public void deleteThread(Long userId, Long threadId) throws ChatgptException {

        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ChatgptException("Thread not found", HttpStatus.NOT_FOUND));

        if (!thread.getUser().getId().equals(userId)) {
            throw new ChatgptException("You do not have permission to delete this thread.", HttpStatus.FORBIDDEN);
        }

        chatThreadRepository.delete(thread);
    }

    public void getThreadForUser(Long userId, Long threadId) throws ChatgptException {
        ChatThread thread = chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ChatgptException("Thread not found", HttpStatus.NOT_FOUND));

        if (!thread.getUser().getId().equals(userId)) {
            throw new ChatgptException("You do not have access to this thread.", HttpStatus.FORBIDDEN);
        }

    }
}

