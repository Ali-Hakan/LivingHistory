package com.LivingHistory.Controller;

import com.LivingHistory.Exception.JWTTokenExpiration;
import com.LivingHistory.Modal.Story;
import com.LivingHistory.Modal.User;
import com.LivingHistory.Service.StoryService;
import com.LivingHistory.Service.UserService;
import com.LivingHistory.Utilization.JWT;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class StoryController {
    @Autowired
    private StoryService storyService;

    @Autowired
    private UserService userService;

    @Autowired
    private JWT jwtUtils;

    public StoryController(StoryService storyService, UserService userService) {
        this.storyService = storyService;
        this.userService = userService;
    }

    @PostMapping("/createStory")
    public ResponseEntity<Story> createStory(@RequestBody Story story, @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtils.extractUsernameFromJwtToken(token);
            User user = userService.findByUsername(username);

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            if (user != null) {
                story.setUser(user);
                Story createdStory = storyService.createStory(story);
                return ResponseEntity.ok(createdStory);
            } else {
                return ResponseEntity.badRequest().body(null);
            }
        } catch (JWTTokenExpiration e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @GetMapping("/searchStories")
    public ResponseEntity<List<Story>> searchStories(@RequestParam("query") String query) {
        List<Story> stories = storyService.searchStories(query);
        return ResponseEntity.ok(stories);
    }
}