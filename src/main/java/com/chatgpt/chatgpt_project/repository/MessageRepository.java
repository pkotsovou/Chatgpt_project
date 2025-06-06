package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByThreadIdOrderByCreatedAtAsc(Long threadId);
}
