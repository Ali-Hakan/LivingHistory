package com.LivingHistory.LivingHistory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.LivingHistory.Controller.UserController;
import com.LivingHistory.Modal.User;
import com.LivingHistory.Service.UserService;
import com.LivingHistory.Utilization.JwtUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.security.NoSuchAlgorithmException;
import java.util.Map;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {
    @Mock
    private UserService userService;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private UserController userController;

    @Test
    void createUser_UserAlreadyExists_ReturnsBadRequest() {
        User newUser = new User();
        newUser.setUsername("username");
        newUser.setPassword("password");
        newUser.setEmail("email");  // Ensure email is not null
        when(userService.checkUser(any(), any())).thenReturn(false);
    
        ResponseEntity<Void> response = userController.createUser(newUser);
    
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    
        verify(userService).checkUser(any(), any());
        verify(userService, never()).createUser(any(), any(), any(), any(), any());
    }
    
    @Test
    void login_ValidCredentials_ReturnsTokenAndUserInfo() throws NoSuchAlgorithmException {
        User newUser = new User();
        newUser.setUsername("username");
        newUser.setPassword("password");
        when(userService.authenticateUser(any(), any())).thenReturn(newUser);
        when(jwtUtils.generateJwtToken(any())).thenReturn("dummyToken");
    
        ResponseEntity<Map<String, Object>> response = userController.login(newUser);
    
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("success"));
        assertTrue(response.getBody().containsKey("token"));
        assertTrue(response.getBody().containsKey("username"));
        assertTrue(response.getBody().containsKey("nickname"));
    
        verify(userService).authenticateUser(any(), any());
        verify(jwtUtils).generateJwtToken(any());
    }

    @Test
    void login_InvalidCredentials_ReturnsUnauthorized() throws NoSuchAlgorithmException {
        User newUser = new User();
        newUser.setUsername("username");
        newUser.setPassword("password");
        when(userService.authenticateUser(any(), any())).thenReturn(null);

        ResponseEntity<Map<String, Object>> response = userController.login(newUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse((boolean) response.getBody().get("success"));

        verify(userService).authenticateUser(any(), any());
        verify(jwtUtils, never()).generateJwtToken(any());
    }

    @Test
    void getUserByToken_ValidToken_ReturnsUser() {
        when(jwtUtils.extractUsernameFromJwtToken(anyString())).thenReturn("username");
        when(userService.getUserByUsername(anyString())).thenReturn(new User());

        ResponseEntity<User> response = userController.getUserByToken("token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        verify(jwtUtils).extractUsernameFromJwtToken("token");
        verify(userService).getUserByUsername("username");
    }

    @Test
    void getUserByToken_InvalidToken_ReturnsNotFound() {
        when(jwtUtils.extractUsernameFromJwtToken(anyString())).thenReturn(null);

        ResponseEntity<User> response = userController.getUserByToken("token");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        verify(jwtUtils).extractUsernameFromJwtToken("token");
        verify(userService, never()).getUserByUsername(anyString());
    }
}
