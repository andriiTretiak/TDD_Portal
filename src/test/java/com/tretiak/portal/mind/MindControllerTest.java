package com.tretiak.portal.mind;

import com.tretiak.portal.TestPage;
import com.tretiak.portal.error.ApiError;
import com.tretiak.portal.mind.vm.MindVM;
import com.tretiak.portal.user.User;
import com.tretiak.portal.user.UserRepository;
import com.tretiak.portal.user.UserService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.support.BasicAuthenticationInterceptor;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceUnit;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static com.tretiak.portal.TestUtil.createValidMind;
import static com.tretiak.portal.TestUtil.createValidUser;
import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class MindControllerTest {

    private static final String API_1_0_MINDS = "/api/1.0/minds";
    @Autowired
    private TestRestTemplate testRestTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private MindRepository mindRepository;

    @PersistenceUnit
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private MindService mindService;

    @Before
    public void cleanup(){
        testRestTemplate.getRestTemplate().getInterceptors().clear();
        mindRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_receiveOk(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsUnauthorized_receivesUnauthorized(){
        Mind mind = createValidMind();
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsUnauthorized_receivesApiError(){
        Mind mind = createValidMind();
        ResponseEntity<ApiError> response = postMind(mind, ApiError.class);
        assertThat(response.getBody().getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindSaveToDataBase(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);
        assertThat(mindRepository.count()).isEqualTo(1);
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindSaveToDataBaseWithTimestamp(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);

        Mind inDb = mindRepository.findAll().get(0);

        assertThat(inDb.getTimestamp()).isNotNull();
    }

    @Test
    public void postMind_whenMindContentIsNullAndUserIsAuthorized_receiveBadRequest(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postMind_whenMindContentLess10CharactersAndUserIsAuthorized_receiveBadRequest(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        mind.setContent("123456789");
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postMind_whenMindContentIs5000CharactersAndUserIsAuthorized_receiveOk(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        String veryLongString = IntStream.rangeClosed(1, 5000).mapToObj(value -> "x").collect(Collectors.joining());
        mind.setContent(veryLongString);
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void postMind_whenMindContentMore5000CharactersAndUserIsAuthorized_receiveBadRequest(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        String veryLongString = IntStream.rangeClosed(1, 5001).mapToObj(value -> "x").collect(Collectors.joining());
        mind.setContent(veryLongString);
        ResponseEntity<Object> response = postMind(mind, Object.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    public void postMind_whenMindContentIsNullAndUserIsAuthorized_receiveApiErrorWithValidationErrors(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = new Mind();
        ResponseEntity<ApiError> response = postMind(mind, ApiError.class);
        Map<String, String> validationErrors = response.getBody().getValidationErrors();
        assertThat(validationErrors.get("content")).isNotNull();
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindSavedWithAuthenticatedUserInfo(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);

        Mind inDb = mindRepository.findAll().get(0);

        assertThat(inDb.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_mindCanBeAccessedFromUserEntity(){
        User user = userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        postMind(mind, Object.class);

        EntityManager entityManager = entityManagerFactory.createEntityManager();

        User inDb = entityManager.find(User.class, user.getId());
        assertThat(inDb.getMinds().size()).isEqualTo(1);
    }

    @Test
    public void getMinds_whenThereAreNoMinds_receiveOk(){
        ResponseEntity<Object> response = getMinds(new ParameterizedTypeReference<Object>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    public void getMinds_whenThereAreNoMinds_receivePageWithZeroItems(){
        ResponseEntity<TestPage<Object>> response = getMinds(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(0);
    }

    @Test
    public void getMinds_whenThereAreMinds_receivePageWithItems(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<Object>> response = getMinds(new ParameterizedTypeReference<TestPage<Object>>() {});
        assertThat(response.getBody().getTotalElements()).isEqualTo(3);
    }

    @Test
    public void getMinds_whenThereAreMinds_receivePageWithMindVM(){
        User user = userService.save(createValidUser("user1"));
        mindService.save(user, createValidMind());
        ResponseEntity<TestPage<MindVM>> response = getMinds(new ParameterizedTypeReference<TestPage<MindVM>>() {});
        MindVM storeMind = response.getBody().getContent().get(0);
        assertThat(storeMind.getUser().getUsername()).isEqualTo("user1");
    }

    @Test
    public void postMind_whenMindIsValidAndUserIsAuthorized_receiveMindVm(){
        userService.save(createValidUser("user1"));
        authenticate("user1");
        Mind mind = createValidMind();
        ResponseEntity<MindVM> response = postMind(mind, MindVM.class);
        assertThat(response.getBody().getUser().getUsername()).isEqualTo("user1");
    }

    private <T>ResponseEntity<T> postMind(Mind mind, Class<T> responseType) {
        return testRestTemplate.postForEntity(API_1_0_MINDS, mind, responseType);
    }

    private <T>ResponseEntity<T> getMinds(ParameterizedTypeReference<T> responseType) {
        return testRestTemplate.exchange(API_1_0_MINDS, HttpMethod.GET, null, responseType);
    }

    private void authenticate(String username) {
        testRestTemplate.getRestTemplate()
                .getInterceptors()
                .add(new BasicAuthenticationInterceptor(username, "P4ssword"));
    }
}
