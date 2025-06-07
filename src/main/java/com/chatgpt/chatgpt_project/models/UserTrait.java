package com.chatgpt.chatgpt_project.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_traits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTrait {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String trait;
}
