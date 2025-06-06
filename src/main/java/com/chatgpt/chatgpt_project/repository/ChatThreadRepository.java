package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, Long> {
    List<ChatThread> findByUserId(Long userId);
}

