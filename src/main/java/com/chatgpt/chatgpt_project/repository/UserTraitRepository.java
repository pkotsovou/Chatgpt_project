package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.UserTrait;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserTraitRepository extends JpaRepository<UserTrait, Long> {

    List<UserTrait> findByUserId(Long userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM UserTrait t WHERE t.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}
