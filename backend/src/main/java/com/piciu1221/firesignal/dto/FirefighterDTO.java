package com.piciu1221.firesignal.dto;

import lombok.Data;

@Data
public class FirefighterDTO {
    private String firefighterName;

    public FirefighterDTO(String firefighterName) {
        this.firefighterName = firefighterName;
    }
}
