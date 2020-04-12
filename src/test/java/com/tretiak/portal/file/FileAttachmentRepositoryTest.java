package com.tretiak.portal.file;

import com.tretiak.portal.mind.Mind;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Date;
import java.util.List;

import static com.tretiak.portal.TestUtil.createValidMind;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
public class FileAttachmentRepositoryTest {

    @Autowired
    private TestEntityManager testEntityManager;

    @Autowired
    FileAttachmentRepository fileAttachmentRepository;

    @Test
    public void findDateBeforeAndMindIsNull_whenAttachmentDateOlderThanOneHour_returnsAll(){
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getOneHourOldFileAttachment());
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndMindIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(3);
    }

    @Test
    public void findDateBeforeAndMindIsNull_whenAttachmentDateOlderThanOneHourButHaveMind_returnsNone(){
        Mind mind1 = testEntityManager.persist(createValidMind());
        Mind mind2 = testEntityManager.persist(createValidMind());
        Mind mind3 = testEntityManager.persist(createValidMind());

        testEntityManager.persist(getOldFileAttachmentWithMind(mind1));
        testEntityManager.persist(getOldFileAttachmentWithMind(mind2));
        testEntityManager.persist(getOldFileAttachmentWithMind(mind3));
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndMindIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(0);
    }

    @Test
    public void findDateBeforeAndMindIsNull_whenAttachmentDateWithinOneHour_returnsNone(){
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndMindIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(0);
    }

    @Test
    public void findDateBeforeAndMindIsNull_whenSomeAttachmentsOldSomeNewAndSomeWithMind_returnsAttachmentsWithOlderAndNoMindAssigned(){
        Mind mind1 = testEntityManager.persist(createValidMind());
        testEntityManager.persist(getOldFileAttachmentWithMind(mind1));
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        Date oneHourAgo = new Date(System.currentTimeMillis() - (60*60*1000));
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndMindIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(1);
    }

    private FileAttachment getOneHourOldFileAttachment(){
        Date date = new Date(System.currentTimeMillis() - (60*60*1000) - 1);
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(date);
        return fileAttachment;
    }

    private FileAttachment getFileAttachmentWithinOneHour(){
        Date date = new Date(System.currentTimeMillis() - (60*1000));
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(date);
        return fileAttachment;
    }

    private FileAttachment getOldFileAttachmentWithMind(Mind mind){
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setMind(mind);
        return fileAttachment;
    }
}
