package com.LivingHistory.Modal;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.List;

import com.LivingHistory.Modal.Custom.Comment;
import com.LivingHistory.Modal.Custom.DateCustom;
import com.LivingHistory.Modal.Custom.Feedback;
import com.LivingHistory.Modal.Custom.Location;
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

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "creation_date")
    private Date creationDate;

    @Column(name = "tag")
    @ElementCollection
    private List<String> tags;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "story_comment", joinColumns = @JoinColumn(name = "story_id"), inverseJoinColumns = @JoinColumn(name = "comment_id"))
    private List<Comment> comments;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "story_feedback", joinColumns = @JoinColumn(name = "story_id"), inverseJoinColumns = @JoinColumn(name = "feedback_id"))
    private List<Feedback> feedbacks;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "story_date", joinColumns = @JoinColumn(name = "story_id"), inverseJoinColumns = @JoinColumn(name = "date_id"))
    private List<DateCustom> dates;

    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "story_location", joinColumns = @JoinColumn(name = "story_id"), inverseJoinColumns = @JoinColumn(name = "location_id"))
    private List<Location> locations;

    @JsonIgnoreProperties({"password", "email", "gender"})
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Transient
    private int relevance;

    @PrePersist
    protected void onCreate() {
        creationDate = new Date();
    }
}