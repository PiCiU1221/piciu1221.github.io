package com.piciu1221.firesignal.dto;

import lombok.Data;

@Data
public class AlarmDisplayRequestDTO {
    private String username;
    private int skip;
    private int howMuch;
}
