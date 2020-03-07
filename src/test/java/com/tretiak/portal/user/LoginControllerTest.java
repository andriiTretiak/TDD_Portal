package com.tretiak.portal.user;

import com.tretiak.portal.error.ApiError;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import static com.tretiak.portal.user.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LoginControllerTest {

    private static final String API_1_0_LOGIN = "/api/1.0/login";

    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Before
    public void cleanup(){
        userRepository.deleteAll();
        testRestTemplate.getRestTemplate().getInterceptors().clear();
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveUnauthorized(){
        ResponseEntity<Object> response = login(null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutIncorrectCredentials_receiveUnauthorized(){
        authenticate();
        ResponseEntity<Object> response = login(null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiError(){
        ResponseEntity<ApiError> response = login(null, ApiError.class);
        assertThat(response.getBody().getUrl()).isEqualTo(API_1_0_LOGIN);
    }

    @Test
    public void postLogin_withoutUserCredentials_receiveApiErrorWithoutValidationErrors(){
        ResponseEntity<String> response = login(null, String.class);
        assertThat(response.getBody().contains("validationErrors")).isFalse();
    }

    @Test
    public void postLogin_withoutIncorrectCredentials_receiveUnauthorizedWithoutWWWAuthenticateHeader(){
        authenticate();
        ResponseEntity<Object> response = login(null, Object.class);
        assertThat(response.getHeaders().containsKey("WWW-Authenticate")).isFalse();
    }

    @Test
    public void postLogin_withValidCredentials_receiveOk(){
        userService.save(createValidUser());
        authenticate();
        ResponseEntity<Object> response = login(null, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private void authenticate() {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor("test-user", "P4ssword"));
    }

    private <T> ResponseEntity<T> login(Object request, Class<T> response){
        return testRestTemplate.postForEntity(API_1_0_LOGIN, request, response);
    }
}