package com.LivingHistory.Service;

import com.LivingHistory.Modal.Story;
import com.LivingHistory.Repository.StoryRepository;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StoryService {
    @Autowired
    private final StoryRepository storyRepository;

    public StoryService(StoryRepository storyRepository) {
        this.storyRepository = storyRepository;
    }

    public Story createStory(Story story) {
        return storyRepository.save(story);
    }

    @Autowired
    public List<Story> searchStories(String query) {
        List<Story> stories = storyRepository.findAll(query);
        for (Story story : stories) {
            int relevanceCount = calculateRelevanceCount(story, query);
            story.setRelevanceCount(relevanceCount);
        }
        
        stories.sort((s1, s2) -> {
            if (s1.getUser().getNickname().equalsIgnoreCase(query) && !s2.getUser().getNickname().equalsIgnoreCase(query)) {
                return -1; 
            } else if (!s1.getUser().getNickname().equalsIgnoreCase(query) && s2.getUser().getNickname().equalsIgnoreCase(query)) {
                return 1;
            } else {
                return Integer.compare(s2.getRelevanceCount(), s1.getRelevanceCount());
            }
        });
    
        return stories;
    }

    private int calculateRelevanceCount(Story story, String query) {
        int count = 0;
        String storyText = story.getStory();

        int index = storyText.toLowerCase().indexOf(query.toLowerCase());
        while (index != -1) {
            count++;
            index = storyText.toLowerCase().indexOf(query.toLowerCase(), index + query.length());
        }

        return count;
    }
}