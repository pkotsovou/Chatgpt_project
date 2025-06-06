package com.chatgpt.chatgpt_project.models;

import jakarta.persistence.Entity;
import lombok.*;
import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_llm_generated", nullable = false)
    private Boolean isLLMGenerated;

    @Column(name = "completion_model")
    private String completionModel;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // To thread στο οποίο ανήκει το μήνυμα
    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;

    // Ο user που έστειλε το μήνυμα (null αν είναι bot message)
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

