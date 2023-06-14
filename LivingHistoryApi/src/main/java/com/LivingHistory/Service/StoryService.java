package com.LivingHistory.Service;

import com.LivingHistory.Modal.Story;
import com.LivingHistory.Modal.Custom.Comment;
import com.LivingHistory.Modal.Custom.Feedback;
import com.LivingHistory.Modal.DTO.CommentDTO;
import com.LivingHistory.Modal.DTO.FeedbackDTO;
import com.LivingHistory.Modal.DTO.StoryDTO;
import com.LivingHistory.Modal.Request.StoryRequest;
import com.LivingHistory.Repository.CommentRepository;
import com.LivingHistory.Repository.StoryRepository;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class StoryService {
    private final StoryRepository storyRepository;

    private final CommentRepository commentRepository;

    public StoryService(StoryRepository storyRepository, CommentRepository commentRepository) {
        this.storyRepository = storyRepository;
        this.commentRepository = commentRepository;
    }

    public Story createStory(Story story) {
        return storyRepository.save(story);
    }

    public Story updateStory(Long storyId, Story updatedStory) throws Exception {
        Optional<Story> storyOptional = storyRepository.findById(storyId);
        if (storyOptional.isPresent()) {
          Story story = storyOptional.get();
          story.setTitle(updatedStory.getTitle());
          story.setContent(updatedStory.getContent());
          story.setDates(updatedStory.getDates());
          story.setLocations(updatedStory.getLocations());
          story.setTags(updatedStory.getTags());
          return storyRepository.save(story);
        }
        throw new Exception("Story not found");
      }

    public List<StoryDTO> getAllStoriesSortedByCreationDate() {
        List<Story> stories = storyRepository.findAll();

        stories.sort(Comparator.comparing(Story::getCreationDate).reversed());

        List<StoryDTO> storyDtos = new ArrayList<>();
        for (Story story : stories) {
            StoryDTO storyDto = new StoryDTO();
            storyDto.setId(story.getId());
            storyDto.setTitle(story.getTitle());
            storyDto.setContent(story.getContent());
            storyDto.setTags(story.getTags());
            storyDto.setDates(story.getDates());
            storyDto.setLocations(story.getLocations());
            storyDto.setNickname(story.getUser().getNickname());
            storyDto.setCreationDate(story.getCreationDate());
            storyDto.setUsername(story.getUser().getUsername());
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
            storyDto.setNickname(story.getUser().getNickname());
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
            storyRequest.setStartDate(new SimpleDateFormat("yyyy-MM-dd").parse("9999-12-31"));
        if (storyRequest.getEndDate() == null)
            storyRequest.setEndDate(new SimpleDateFormat("yyyy-MM-dd").parse("1000-01-01"));

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

    public Story getStoryById(Long id) throws Exception {
        Optional<Story> storyOptional = storyRepository.findById(id);
        if (storyOptional.isPresent()) {
            return storyOptional.get();
        }
        throw new Exception("Story not found");
    }

    public Comment addCommentToStory(Comment comment) {
        Comment savedComment = commentRepository.save(comment);

        savedComment.getStory().getComments().add(savedComment);
        storyRepository.save(savedComment.getStory());

        return savedComment;
    }

    public Comment getCommentById(Long commentId) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        return commentOptional.orElse(null);
    }

    public void deleteComment(Comment comment) {
        comment.getStory().getComments().remove(comment);
        commentRepository.delete(comment);
    }

    public Story saveStory(Story story) {
        return storyRepository.save(story);
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