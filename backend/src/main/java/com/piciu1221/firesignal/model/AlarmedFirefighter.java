package com.piciu1221.firesignal.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Table(name = "alarmed_firefighters")
@Data
public class AlarmedFirefighter implements Serializable {

    @EmbeddedId
    private AlarmedFirefighterId id;

    @ManyToOne
    @MapsId("alarmId")
    @JoinColumn(name = "alarm_id")
    private Alarm alarm;

    @ManyToOne
    @MapsId("firefighterId")
    @JoinColumn(name = "firefighter_id")
    private Firefighter firefighter;

    @Column(name = "accepted")
    private Boolean accepted;
}
