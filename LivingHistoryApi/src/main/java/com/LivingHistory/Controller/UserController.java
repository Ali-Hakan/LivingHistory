package com.LivingHistory.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.LivingHistory.Model.User;
import com.LivingHistory.Service.UserService;
import com.LivingHistory.Utils.JwtUtils;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@RequestBody User user) {
        boolean userExists = userService.checkUser(user.getUsername(), user.getEmail());
        if (!userExists) 
            return ResponseEntity.badRequest().build();
        userService.createUser(user.getEmail(), user.getPassword(), user.getUsername(), user.getNickname(), user.getGender());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) throws NoSuchAlgorithmException {
        String usernameOrEmail = user.getUsername();
        String password = user.getPassword();
        boolean authenticated = userService.authenticateUser(usernameOrEmail, password);
        if (authenticated) {
            String jwtToken = jwtUtils.generateJwtToken(usernameOrEmail);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("token", jwtToken);
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/secret-key")
    public ResponseEntity<String> getSecretKey() throws NoSuchAlgorithmException {
        String secretKey = jwtUtils.generateSecretKey();
        return ResponseEntity.ok(secretKey);
    }
}