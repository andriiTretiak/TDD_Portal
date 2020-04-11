package com.tretiak.portal.file;

import com.tretiak.portal.configuration.AppConfiguration;
import com.tretiak.portal.user.UserRepository;
import com.tretiak.portal.user.UserService;
import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.*;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.io.File;
import java.io.IOException;

import static com.tretiak.portal.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class FileUploadControllerTest {

    private static final String API_1_0_MINDS_UPLOAD = "/api/1.0/minds/upload";

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private AppConfiguration appConfiguration;

    @Before
    public void init() throws IOException {
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
        FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
    }

    @Test
    public void uploadFile_withImageFromAuthorizedUser_receiveOk(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        ResponseEntity<Object> response = uploadFile(getRequestEntity(), Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void uploadFile_withImageFromUnauthorizedUser_receiveUnauthorized(){
        ResponseEntity<Object> response = uploadFile(getRequestEntity(), Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    private <T>ResponseEntity<T> uploadFile(HttpEntity<?> requestEntity, Class<T> responseType){
        return testRestTemplate.exchange(API_1_0_MINDS_UPLOAD, HttpMethod.POST, requestEntity, responseType);
    }

    private HttpEntity<MultiValueMap<String, Object>> getRequestEntity() {
        ClassPathResource imageResource = new ClassPathResource("profile.png");
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", imageResource);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        return new HttpEntity<>(body, headers);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
