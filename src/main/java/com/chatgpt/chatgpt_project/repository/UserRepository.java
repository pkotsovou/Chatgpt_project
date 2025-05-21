package com.chatgpt.chatgpt_project.repository;

import com.chatgpt.chatgpt_project.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
