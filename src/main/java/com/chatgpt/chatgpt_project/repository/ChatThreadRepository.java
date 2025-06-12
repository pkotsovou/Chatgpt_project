package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ChatThreadRepository extends JpaRepository<ChatThread, Long> {
    List<ChatThread> findByUserId(Long userId);
    @Transactional
    @Modifying
    @Query("DELETE FROM ChatThread c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}

