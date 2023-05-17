package com.LivingHistory.Modal;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

import com.LivingHistory.Modal.Custom.DateInterval;
import com.LivingHistory.Modal.Custom.Location;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@Entity
@Table(name = "story")
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "story")
    private String story;

    @Column(name = "tag")
    @ElementCollection
    private List<String> tag;

    @Column(name = "date")
    @ElementCollection
    private List<DateInterval> date;

    @Column(name = "location")
    @ElementCollection
    private List<Location> location;

    @JsonIgnoreProperties({"password", "email", "gender"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "relevance_count")
    private int relevanceCount;
}