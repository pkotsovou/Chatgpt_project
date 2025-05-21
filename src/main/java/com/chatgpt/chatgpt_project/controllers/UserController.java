package com.chatgpt.chatgpt_project.controllers;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import com.chatgpt.chatgpt_project.models.dto.TokenDTO;
import com.chatgpt.chatgpt_project.models.User;
import com.chatgpt.chatgpt_project.models.dto.user.UserRegisterDTO;
import com.chatgpt.chatgpt_project.models.dto.user.UserResponseDTO;
import com.chatgpt.chatgpt_project.models.dto.user.UserUpdateDTO;
import com.chatgpt.chatgpt_project.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final JwtEncoder jwtEncoder;

    @Autowired
    public UserController(UserService userService, JwtEncoder jwtEncoder) {
        this.userService = userService;
        this.jwtEncoder = jwtEncoder;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserResponseDTO> register(@RequestBody UserRegisterDTO userDto) throws ChatgptException {
        logger.debug("Registering user: {}", userDto.getEmail());
        return userService.register(userDto);
    }

    @PostMapping("/login")
    public TokenDTO login(Authentication authentication) throws ChatgptException {
        User loggedInUser = (User) authentication.getPrincipal(); // UserDetails

        // 2) Build JWT claims
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("chatgptapp")
                .issuedAt(now)
                .expiresAt(now.plus(6, ChronoUnit.HOURS))
                .subject(loggedInUser.getEmail())
                .build();

        // 3) Encode & return token
        String token = jwtEncoder.encode(JwtEncoderParameters.from(claims))
                .getTokenValue();

        return new TokenDTO(token);
    }

    // GET ME
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMe(Authentication authentication) throws ChatgptException {
        return userService.getMe(authentication);
    }

    // UPDATE ME
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMe(@RequestBody UserUpdateDTO updatedUserDto, Authentication authentication) throws ChatgptException {
        return userService.updateMe(updatedUserDto, authentication);
    }

    // DELETE ME
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMe(Authentication authentication) throws ChatgptException {
        return userService.deleteMe(authentication);
    }

}
