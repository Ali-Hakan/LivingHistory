package com.LivingHistory.Controller;

import com.LivingHistory.Exception.JWTTokenExpiration;
import com.LivingHistory.Modal.Story;
import com.LivingHistory.Modal.User;
import com.LivingHistory.Modal.Custom.Comment;
import com.LivingHistory.Modal.Custom.Feedback;
import com.LivingHistory.Modal.DTO.StoryDTO;
import com.LivingHistory.Modal.Request.StoryRequest;
import com.LivingHistory.Service.StoryService;
import com.LivingHistory.Service.UserService;
import com.LivingHistory.Utilization.JwtUtils;

import java.text.ParseException;
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
    private JwtUtils jwtUtils;

    public StoryController(StoryService storyService, UserService userService, JwtUtils jwtUtils) {
        this.storyService = storyService;
        this.userService = userService;
        this.jwtUtils = jwtUtils;
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
    public ResponseEntity<List<StoryDTO>> searchStories(@RequestParam("query") String query) {
        List<StoryDTO> stories = storyService.searchStories(query);
        return ResponseEntity.ok(stories);
    }

    @PostMapping("/advancedSearchStories")
    public ResponseEntity<List<StoryDTO>> advancedSearchStories(@RequestBody StoryRequest storyRequest)
            throws ParseException {
        List<StoryDTO> stories = storyService.advancedSearchStories(storyRequest);
        return ResponseEntity.ok(stories);
    }

    @PostMapping("/comments")
    public ResponseEntity<Comment> addCommentToStory(@RequestBody Comment newComment,
            @RequestHeader("Authorization") String token) throws Exception {
        try {
            String username = jwtUtils.extractUsernameFromJwtToken(token);
            User user = userService.findByUsername(username);

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            if (user != null) {
                Long storyId = newComment.getStory().getId();
                Story story = storyService.getStoryById(storyId);

                if (story == null) {
                    return ResponseEntity.notFound().build();
                }

                newComment.setUser(user);
                newComment.setStory(story);

                Comment savedComment = storyService.addCommentToStory(newComment);

                return ResponseEntity.ok(savedComment);
            } else {
                return ResponseEntity.badRequest().body(null);
            }

        } catch (JWTTokenExpiration e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtils.extractUsernameFromJwtToken(token);
            User user = userService.findByUsername(username);

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }

            Comment comment = storyService.getCommentById(commentId);

            if (comment == null) {
                return ResponseEntity.notFound().build();
            }
            if (comment.getUser().equals(user)) {
                storyService.deleteComment(comment);
                return ResponseEntity.ok("Comment deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Forbidden");
            }

        } catch (JWTTokenExpiration e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    @PostMapping("/stories/{storyId}/feedback")
    public ResponseEntity<String> addFeedbackToStory(
            @PathVariable Long storyId,
            @RequestHeader("Authorization") String token,
            @RequestParam("value") int value) throws Exception {
        try {
            String username = jwtUtils.extractUsernameFromJwtToken(token);
            User user = userService.findByUsername(username);

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }

            Story story = storyService.getStoryById(storyId);

            if (story == null) {
                return ResponseEntity.notFound().build();
            }

            Feedback existingFeedback = story.getFeedbacks()
                    .stream()
                    .filter(feedback -> feedback.getUser().equals(user))
                    .findFirst()
                    .orElse(null);

            boolean liked = (value == 1);

            if (existingFeedback != null) {
                if (existingFeedback.isLiked() == liked) {
                    story.getFeedbacks().remove(existingFeedback);
                    storyService.saveStory(story);
                    return ResponseEntity.ok("User feedback deleted");
                } else {
                    existingFeedback.setLiked(liked);
                    storyService.saveStory(story);
                    return ResponseEntity.ok(liked ? "Story liked" : "Story disliked");
                }
            } else {
                Feedback feedback = new Feedback(liked, user);
                story.getFeedbacks().add(feedback);
                storyService.saveStory(story);
                return ResponseEntity.ok(liked ? "Story liked" : "Story disliked");
            }
        } catch (JWTTokenExpiration e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    @GetMapping("/stories")
    public ResponseEntity<List<StoryDTO>> getAllStoriesSortedByCreationDate() {
        List<StoryDTO> stories = storyService.getAllStoriesSortedByCreationDate();
        return ResponseEntity.ok(stories);
    }

    @PutMapping("/updateStory/{storyId}")
    public ResponseEntity<Story> updateStory(@PathVariable Long storyId, @RequestBody Story story,
            @RequestHeader("Authorization") String token) throws Exception {
        try {
            String username = jwtUtils.extractUsernameFromJwtToken(token);
            User user = userService.findByUsername(username);

            if (username == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            if (user != null) {
                Story existingStory = storyService.getStoryById(storyId);
                if (existingStory == null) {
                    return ResponseEntity.notFound().build();
                }

                existingStory.setTitle(story.getTitle());
                existingStory.setContent(story.getContent());
                existingStory.setDates(story.getDates());
                existingStory.setLocations(story.getLocations());
                existingStory.setTags(story.getTags());

                Story updatedStory = storyService.updateStory(storyId, existingStory);
                return ResponseEntity.ok(updatedStory);
            } else {
                return ResponseEntity.badRequest().body(null);
            }
        } catch (JWTTokenExpiration e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }
}