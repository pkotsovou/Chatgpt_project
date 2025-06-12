package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByThreadIdOrderByCreatedAtAsc(Long threadId);
    @Transactional
    @Modifying
    @Query("DELETE FROM Message m WHERE m.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}
