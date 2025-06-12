package com.chatgpt.chatgpt_project.services;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.mappers.UserMapper;
import com.chatgpt.chatgpt_project.models.ChatThread;
import com.chatgpt.chatgpt_project.models.User;
import com.chatgpt.chatgpt_project.models.dto.user.UserRegisterDTO;
import com.chatgpt.chatgpt_project.models.dto.user.UserResponseDTO;
import com.chatgpt.chatgpt_project.models.dto.user.UserUpdateDTO;
import com.chatgpt.chatgpt_project.repository.ChatThreadRepository;
import com.chatgpt.chatgpt_project.repository.MessageRepository;
import com.chatgpt.chatgpt_project.repository.UserRepository;
import com.chatgpt.chatgpt_project.repository.UserTraitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserTraitRepository userTraitRepository;

    public UserService(UserRepository userRepository, UserTraitRepository userTraitRepository, BCryptPasswordEncoder passwordEncoder, ChatThreadRepository chatThreadRepository, MessageRepository messageRepository) {
        this.userRepository = userRepository;
        this.userTraitRepository = userTraitRepository;
        this.passwordEncoder = passwordEncoder;
        this.chatThreadRepository = chatThreadRepository;
        this.messageRepository = messageRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }


    public ResponseEntity<UserResponseDTO> register(UserRegisterDTO userDto) throws ChatgptException {
        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new ChatgptException("Το email είναι υποχρεωτικό", HttpStatus.BAD_REQUEST);
        }

        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new ChatgptException("Ο κωδικός είναι υποχρεωτικός", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new ChatgptException("Το email χρησιμοποιείται ήδη", HttpStatus.CONFLICT);
        }

        User user = UserMapper.toEntity(userDto);

        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserMapper.toResponseDTO(savedUser));
    }


    // Get current user from Authentication (αντί για session)
    public ResponseEntity<UserResponseDTO> getMe(Authentication authentication) throws ChatgptException {
        User user = extractUser(authentication);
        System.out.println("Authenticated as: " + authentication.getName());

        // Βρίσκουμε traits του user
        List<String> traits = userTraitRepository.findByUserId(user.getId()).stream()
                .map(t -> t.getTrait())
                .toList();

        return ResponseEntity.ok(UserMapper.toResponseDTO(user, traits));
    }


    // Update me
    public ResponseEntity<UserResponseDTO> updateMe(UserUpdateDTO updatedUserDto, Authentication authentication) throws ChatgptException {
        User user = extractUser(authentication);

        user.setName(updatedUserDto.getName());
        // Disallow email change
        if (!user.getEmail().equals(updatedUserDto.getEmail())) {
            throw new ChatgptException("Δεν επιτρέπεται η αλλαγή email.", HttpStatus.BAD_REQUEST);
        }

        if (updatedUserDto.getPassword() != null && !updatedUserDto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUserDto.getPassword()));
        }
        user.setAboutMe(updatedUserDto.getAboutMe());
        user.setCustomPrompt(updatedUserDto.getCustomPrompt());
        user.setWhatDoYouDo(updatedUserDto.getWhatDoYouDo());
        user.setAnythingElse(updatedUserDto.getAnythingElse());

        User updatedUser = userRepository.save(user);

        List<String> traits = userTraitRepository.findByUserId(user.getId()).stream()
                .map(t -> t.getTrait())
                .toList();

        return ResponseEntity.ok(UserMapper.toResponseDTO(updatedUser, traits));
    }

    @Transactional
    public ResponseEntity<?> deleteMe(Authentication authentication) throws ChatgptException {
        User user = extractUser(authentication);

        // 1. Fetch threads first
        List<ChatThread> threads = chatThreadRepository.findByUserId(user.getId());
        chatThreadRepository.deleteAll(threads);

        // 2. Delete user
        userRepository.delete(user);

        return ResponseEntity.noContent().build();
    }




    // Helper
    private User extractUser(Authentication authentication) throws ChatgptException {
        if (authentication == null || authentication.getName() == null) {
            throw new ChatgptException("Μη εξουσιοδοτημένος χρήστης", HttpStatus.UNAUTHORIZED);
        }

        String email = authentication.getName(); // απευθείας από το JWT subject
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ChatgptException("Ο χρήστης δεν βρέθηκε", HttpStatus.NOT_FOUND));
    }



}
