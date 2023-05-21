package com.LivingHistory.Service;

import com.LivingHistory.Modal.Story;
import com.LivingHistory.Modal.Custom.Comment;
import com.LivingHistory.Modal.Custom.Feedback;
import com.LivingHistory.Modal.DTO.CommentDTO;
import com.LivingHistory.Modal.DTO.FeedbackDTO;
import com.LivingHistory.Modal.DTO.StoryDTO;
import com.LivingHistory.Modal.DTO.StoryRequest;
import com.LivingHistory.Repository.StoryRepository;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class StoryService {
    private final StoryRepository storyRepository;

    public StoryService(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
    }

    public Story createStory(Story story) {
        return storyRepository.save(story);
    }

    public List<StoryDTO> searchStories(String query) {
        List<Story> stories = storyRepository.findAll("%" + query + "%");
        for (Story story : stories) {
            int relevance = calculateRelevance(story, query);
            story.setRelevance(relevance);
        }

        stories.sort((s1, s2) -> {
            if (s1.getUser().getNickname().equalsIgnoreCase(query)
                    && !s2.getUser().getNickname().equalsIgnoreCase(query)) {
                return -1;
            } else if (!s1.getUser().getNickname().equalsIgnoreCase(query)
                    && s2.getUser().getNickname().equalsIgnoreCase(query)) {
                return 1;
            } else {
                return Integer.compare(s2.getRelevance(), s1.getRelevance());
            }
        });

        List<StoryDTO> storyDtos = new ArrayList<>();
        for (Story story : stories) {
            StoryDTO storyDto = new StoryDTO();
            storyDto.setId(story.getId());
            storyDto.setTitle(story.getTitle());
            storyDto.setContent(story.getContent());
            storyDto.setTags(story.getTags());
            storyDto.setDates(story.getDates());
            storyDto.setLocations(story.getLocations());
            storyDto.setNickname(story.getUser().getUsername());
            storyDto.setCreationDate(story.getCreationDate());
            storyDtos.add(storyDto);

            List<CommentDTO> commentDtos = new ArrayList<>();
            for (Comment comment : story.getComments()) {
                CommentDTO commentDto = new CommentDTO();
                commentDto.setId(comment.getId());
                commentDto.setUsername(comment.getUser().getUsername());
                commentDto.setNickname(comment.getUser().getNickname());
                commentDto.setContent(comment.getContent());
                commentDtos.add(commentDto);
            }
            storyDto.setComments(commentDtos);

            List<FeedbackDTO> feedbackDtos = new ArrayList<>();
            for (Feedback feedback : story.getFeedbacks()) {
                FeedbackDTO feedbackDto = new FeedbackDTO();
                feedbackDto.setId(feedback.getId());
                feedbackDto.setUsername(feedback.getUser().getUsername());
                feedbackDto.setNickname(feedback.getUser().getNickname());
                feedbackDto.setLiked(feedback.isLiked());
                feedbackDtos.add(feedbackDto);
            }
            storyDto.setFeedbacks(feedbackDtos);
        }

        return storyDtos;
    }

    public List<StoryDTO> advancedSearchStories(StoryRequest storyRequest) throws ParseException {
        if (storyRequest.getNickname() != null)
            if (!storyRequest.getNickname().isEmpty())
                storyRequest.setNickname("%" + storyRequest.getNickname() + "%");
            else
                storyRequest.setNickname(null);
        if (storyRequest.getLocations() != null)
            if (!storyRequest.getLocations().isEmpty())
                storyRequest.setLocations("%" + storyRequest.getLocations() + "%");
            else
                storyRequest.setLocations(null);
        if (storyRequest.getContent() != null)
            if (!storyRequest.getContent().isEmpty())
                storyRequest.setContent("%" + storyRequest.getContent() + "%");
            else
                storyRequest.setContent(null);
        if (storyRequest.getStartDate() == null)
            storyRequest.setStartDate(new SimpleDateFormat("yyyy-MM-dd").parse("1000-01-01"));
        if (storyRequest.getEndDate() == null)
            storyRequest.setEndDate(new SimpleDateFormat("yyyy-MM-dd").parse("9999-12-31"));

        List<Story> stories = storyRepository.findAllAdvanced(storyRequest.getNickname(),
                storyRequest.getLocations(),
                storyRequest.getContent(),
                storyRequest.getContent(),
                storyRequest.getContent(),
                storyRequest.getStartDate(),
                storyRequest.getEndDate());

        List<StoryDTO> storyDtos = new ArrayList<>();
        for (Story story : stories) {
            StoryDTO storyDto = new StoryDTO();
            storyDto.setId(story.getId());
            storyDto.setTitle(story.getTitle());
            storyDto.setContent(story.getContent());
            storyDto.setTags(story.getTags());
            storyDto.setDates(story.getDates());
            storyDto.setLocations(story.getLocations());
            storyDto.setNickname(story.getUser().getUsername());
            storyDto.setCreationDate(story.getCreationDate());
            storyDtos.add(storyDto);

            List<CommentDTO> commentDtos = new ArrayList<>();
            for (Comment comment : story.getComments()) {
                CommentDTO commentDto = new CommentDTO();
                commentDto.setId(comment.getId());
                commentDto.setUsername(comment.getUser().getUsername());
                commentDto.setNickname(comment.getUser().getNickname());
                commentDto.setContent(comment.getContent());
                commentDtos.add(commentDto);
            }
            storyDto.setComments(commentDtos);

            List<FeedbackDTO> feedbackDtos = new ArrayList<>();
            for (Feedback feedback : story.getFeedbacks()) {
                FeedbackDTO feedbackDto = new FeedbackDTO();
                feedbackDto.setId(feedback.getId());
                feedbackDto.setUsername(feedback.getUser().getUsername());
                feedbackDto.setNickname(feedback.getUser().getNickname());
                feedbackDto.setLiked(feedback.isLiked());
                feedbackDtos.add(feedbackDto);
            }
        }

        return storyDtos;
    }

    private int calculateRelevance(Story story, String query) {
        int count = 0;
        String storyText = story.getContent();

        int index = storyText.toLowerCase().indexOf(query.toLowerCase());
        while (index != -1) {
            count++;
            index = storyText.toLowerCase().indexOf(query.toLowerCase(), index + query.length());
        }

        return count;
    }
}