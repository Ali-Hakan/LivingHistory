package com.LivingHistory.LivingHistory;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.LivingHistory.Controller.StoryController;
import com.LivingHistory.Modal.Story;
import com.LivingHistory.Modal.User;
import com.LivingHistory.Modal.Custom.Comment;
import com.LivingHistory.Modal.DTO.StoryDTO;
import com.LivingHistory.Modal.Request.StoryRequest;
import com.LivingHistory.Service.StoryService;
import com.LivingHistory.Service.UserService;
import com.LivingHistory.Utilization.JwtUtils;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StoryControllerTest {
    @Mock
    private StoryService storyService;

    @Mock
    private UserService userService;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private StoryController storyController;

    @Test
    void searchStories_ValidQuery_ReturnsListOfStories() {
        List<StoryDTO> stories = new ArrayList<>();
        when(storyService.searchStories(anyString())).thenReturn(stories);

        ResponseEntity<List<StoryDTO>> response = storyController.searchStories("query");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(stories, response.getBody());

        verify(storyService).searchStories("query");
    }

    @Test
    void advancedSearchStories_ValidRequest_ReturnsListOfStories() throws ParseException {
        List<StoryDTO> stories = new ArrayList<>();
        when(storyService.advancedSearchStories(any())).thenReturn(stories);

        ResponseEntity<List<StoryDTO>> response = storyController.advancedSearchStories(new StoryRequest());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(stories, response.getBody());

        verify(storyService).advancedSearchStories(any());
    }

    @Test
    void addCommentToStory_ValidData_ReturnsOkResponse() throws Exception {
        User user = new User();
        Story story = new Story();
        story.setId(1L);
        Comment comment = new Comment();
        comment.setStory(story);
    
        when(userService.findByUsername(anyString())).thenReturn(user);
        when(jwtUtils.extractUsernameFromJwtToken(anyString())).thenReturn("username");
        when(storyService.getStoryById(anyLong())).thenReturn(story);
        when(storyService.addCommentToStory(any())).thenReturn(new Comment());
    
        ResponseEntity<Comment> response = storyController.addCommentToStory(comment, "token");
    
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    
        verify(userService).findByUsername("username");
        verify(jwtUtils).extractUsernameFromJwtToken("token");
        verify(storyService).getStoryById(anyLong());
        verify(storyService).addCommentToStory(any());
    }
}
