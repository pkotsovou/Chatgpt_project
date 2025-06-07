package com.chatgpt.chatgpt_project.utils;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FileContentExtractor {

    public static String extractFileContent(Path filePath, String originalFilename) {
        try {
            if (originalFilename.toLowerCase().endsWith(".txt")) {
                return extractTextFromTxt(filePath);
            } else if (originalFilename.toLowerCase().endsWith(".pdf")) {
                return extractTextFromPdf(filePath);
            } else {
                return "File type not supported for reading.";
            }
        } catch (IOException e) {
            return "Failed to read uploaded file content.";
        }
    }

    private static String extractTextFromTxt(Path filePath) throws IOException {
        return Files.readString(filePath);
    }

    private static String extractTextFromPdf(Path filePath) throws IOException {
        try (PDDocument document = PDDocument.load(filePath.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }
}
