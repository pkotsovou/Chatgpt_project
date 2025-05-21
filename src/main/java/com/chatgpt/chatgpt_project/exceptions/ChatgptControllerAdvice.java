package com.chatgpt.chatgpt_project.exceptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ChatgptControllerAdvice {
    Logger logger = LoggerFactory.getLogger(this.getClass());

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ChatgptErrorEntity> handleException(Exception e){
        // Log the exception
        logger.error("Bootcamp App error: ", e);

        ChatgptErrorEntity errorEntity = new ChatgptErrorEntity();
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

        if (e instanceof ChatgptException) {
            httpStatus = ((ChatgptException) e).getHttpStatus();
        }

        errorEntity.setErrorCode(httpStatus.value());
        errorEntity.setErrorDescription(httpStatus.name());
        errorEntity.setMessage(e.getMessage());


        return ResponseEntity.status(httpStatus).body(errorEntity);

    }
}
