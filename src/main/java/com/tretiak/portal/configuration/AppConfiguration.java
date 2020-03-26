package com.tretiak.portal.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;


@Data
@Configuration
@ConfigurationProperties(prefix = "portal")
public class AppConfiguration {
    private String uploadPath;
    private String profileImagesFolder = "profile";
    private String attachmentsFolder = "attachments";

    public String getFullProfileImagesPath() {
        return uploadPath + "/" + profileImagesFolder;
    }

    public String getFullAttachmentsPath() {
        return uploadPath + "/" + attachmentsFolder;
    }
}
