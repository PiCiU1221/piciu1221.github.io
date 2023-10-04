package com.piciu1221.firesignal.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.io.Serializable;

@Data
@Entity
@Table(name = "alarms")
public class Alarm implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alarm_id")
    private Integer alarmId;

    @Column(name = "alarm_city", nullable = false)
    private String alarmCity;

    @Column(name = "alarm_street", nullable = false)
    private String alarmStreet;

    @Column(name = "alarm_description", nullable = false)
    private String alarmDescription;

    @Column(name = "date_time", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", insertable = false)
    private LocalDateTime dateTime;
}
