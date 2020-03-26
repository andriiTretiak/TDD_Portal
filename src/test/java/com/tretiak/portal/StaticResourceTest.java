package com.tretiak.portal;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class StaticResourceTest {
    @Test
    public void checkStaticFolder_whenAppIsInitialize_uploadFolderMustExist(){
        File uploadFolder = new File("uploads-test");
        boolean uploadFolderExists = uploadFolder.exists() && uploadFolder.isDirectory();
        assertThat(uploadFolderExists).isTrue();
    }
}
