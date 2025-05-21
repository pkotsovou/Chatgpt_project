package com.chatgpt.chatgpt_project.exceptions;

import lombok.Data;
import org.springframework.http.HttpStatus;

@Data
public class ChatgptException extends Exception{

    private HttpStatus httpStatus;

    public ChatgptException(String message) {
        super(message);
    }

    public ChatgptException(String message, HttpStatus httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public ChatgptException(String message, Throwable cause) {
        super(message, cause);
    }

    public ChatgptException(Throwable cause) {
        super(cause);
    }
}
