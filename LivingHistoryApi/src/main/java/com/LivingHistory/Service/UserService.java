package com.LivingHistory.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.LivingHistory.Modal.User;
import com.LivingHistory.Repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public void createUser(String email, String password, String username, String nickname, String gender) {
        String hashedPassword = passwordEncoder.encode(password);
        User user = new User();
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setUsername(username);
        user.setNickname(nickname);
        user.setGender(gender);
        userRepository.save(user);
    }

    public boolean checkUser(String username, String email) {
        User userByUsername = userRepository.findByUsername(username);
        User userByEmail = userRepository.findByEmail(email);
        if (userByUsername != null || userByEmail != null) {
            return false; 
        }
        return true; 
    }

    public boolean authenticateUser(String usernameOrEmail, String password) {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail);
        if (user == null) {
            return false;
        }
        return passwordEncoder.matches(password, user.getPassword());
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}