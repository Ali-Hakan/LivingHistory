package com.LivingHistory.Modal.Custom;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

import jakarta.persistence.Embeddable;

@Getter
@Setter
@Embeddable
public class DateInterval {
    private Date startDate;
    private Date endDate;

    public DateInterval(Date startDate, Date endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public DateInterval() {
    }
}