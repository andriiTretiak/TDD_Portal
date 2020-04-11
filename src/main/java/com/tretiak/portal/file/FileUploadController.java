package com.tretiak.portal.file;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.UUID;

@RestController
@RequestMapping("/api/1.0")
public class FileUploadController {

    @PostMapping("/minds/upload")
    FileAttachment uploadForMind(){
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(new Date());
        fileAttachment.setName(UUID.randomUUID().toString().replace("-", ""));
        return fileAttachment;
    }
}
