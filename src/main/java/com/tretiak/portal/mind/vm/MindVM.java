package com.tretiak.portal.mind.vm;

import com.tretiak.portal.file.vm.FileAttachmentVM;
import com.tretiak.portal.mind.Mind;
import com.tretiak.portal.user.vm.UserVM;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MindVM {

    private long id;
    private String content;
    private long date;
    private UserVM user;
    private FileAttachmentVM attachment;

    public MindVM(Mind mind) {
        this.id = mind.getId();
        this.content = mind.getContent();
        this.date = mind.getTimestamp().getTime();
        this.user = new UserVM(mind.getUser());
        if(mind.getAttachment()!=null){
            this.attachment = new FileAttachmentVM(mind.getAttachment());
        }
    }
}
