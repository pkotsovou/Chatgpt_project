package com.chatgpt.chatgpt_project.controllers;

import com.chatgpt.chatgpt_project.exceptions.ChatgptException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class BaseController {

    protected Long extractUserIdFromAuthentication(Authentication authentication) throws ChatgptException {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ChatgptException("Unauthorized", HttpStatus.UNAUTHORIZED);
        }

        // Εδώ κάνουμε έλεγχο αν είναι JwtAuthenticationToken
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            // Προσπαθούμε να διαβάσουμε το claim "userId"
            Object userIdObj = jwtAuth.getToken().getClaim("userId");

            if (userIdObj == null) {
                throw new ChatgptException("Missing userId in token", HttpStatus.UNAUTHORIZED);
            }

            try {
                return Long.parseLong(userIdObj.toString());
            } catch (NumberFormatException e) {
                throw new ChatgptException("Invalid userId in token", HttpStatus.UNAUTHORIZED);
            }
        }

        // Αν για κάποιο λόγο έχουμε άλλο authentication type, πετάμε exception
        throw new ChatgptException("Unsupported authentication type", HttpStatus.UNAUTHORIZED);

    }
}
