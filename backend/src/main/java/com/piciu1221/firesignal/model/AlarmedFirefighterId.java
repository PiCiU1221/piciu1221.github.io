package com.piciu1221.firesignal.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class AlarmedFirefighterId implements Serializable {

    private Integer alarmId;
    private Integer firefighterId;
}
