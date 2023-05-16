package com.LivingHistory.Service;

import com.LivingHistory.Model.Story;
import com.LivingHistory.Repository.StoryRepository;
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
}