package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.UserTrait;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTraitRepository extends JpaRepository<UserTrait, Long> {

    List<UserTrait> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
