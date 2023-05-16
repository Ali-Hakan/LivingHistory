package com.LivingHistory.Controller;

import com.LivingHistory.Model.Story;
import com.LivingHistory.Model.User;
import com.LivingHistory.Service.StoryService;
import com.LivingHistory.Service.UserService;
import com.LivingHistory.Utils.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
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
    private JwtUtils jwtUtils;

    public StoryController(StoryService storyService, UserService userService) {
        this.storyService = storyService;
        this.userService = userService;
    }

    @PostMapping("/createStory")
    public ResponseEntity<Story> createStory(@RequestBody Story story, @RequestHeader("Authorization") String token) {
        String username = jwtUtils.extractUsernameFromJwtToken(token);

        User user = userService.findByUsername(username);
        story.setUser(user);
    
        Story createdStory = storyService.createStory(story);
        return ResponseEntity.ok(createdStory);
    }
}