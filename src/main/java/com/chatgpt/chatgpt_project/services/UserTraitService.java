package com.chatgpt.chatgpt_project.services;

import com.chatgpt.chatgpt_project.models.User;
import com.chatgpt.chatgpt_project.models.UserTrait;
import com.chatgpt.chatgpt_project.models.dto.user.UserTraitDTO;
import com.chatgpt.chatgpt_project.repository.UserRepository;
import com.chatgpt.chatgpt_project.repository.UserTraitRepository;
import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserTraitService {

    private final UserRepository userRepository;
    private final UserTraitRepository userTraitRepository;

    public UserTraitService(UserRepository userRepository, UserTraitRepository userTraitRepository) {
        this.userRepository = userRepository;
        this.userTraitRepository = userTraitRepository;
    }

    public UserTraitDTO getTraitsForUser(Long userId) throws ChatgptException {
        List<UserTrait> traits = userTraitRepository.findByUserId(userId);

        List<String> traitStrings = traits.stream()
                .map(UserTrait::getTrait)
                .collect(Collectors.toList());

        UserTraitDTO dto = new UserTraitDTO();
        dto.setTraits(traitStrings);

        return dto;
    }

    @Transactional
    public void saveTraitsForUser(Long userId, UserTraitDTO dto) throws ChatgptException {

        // Δεν θέλουμε exception → Optional<User>
        Optional<User> optionalUser = userRepository.findById(userId);

        if (optionalUser.isEmpty()) {
            // Αν δεν υπάρχει user, απλά return.
            return;
        }

        User user = optionalUser.get();

        // Για απλότητα → σβήνουμε όλα τα προηγούμενα traits και ξαναβάζουμε τα νέα
        userTraitRepository.deleteByUserId(userId);

        List<UserTrait> traitsToSave = dto.getTraits().stream()
                .map(trait -> UserTrait.builder()
                        .user(user)
                        .trait(trait)
                        .build())
                .collect(Collectors.toList());

        userTraitRepository.saveAll(traitsToSave);
    }
}
