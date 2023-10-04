package com.piciu1221.firesignal.dto;

import lombok.Data;

@Data
public class ConsolidatedAlarmInfoDTO {
    private int count;
    private boolean hasAcceptedCommander;
    private int acceptedDriversCount;
    private int acceptedFirefightersCount;
    private boolean hasAcceptedTechnicalRescue;

    public ConsolidatedAlarmInfoDTO(int count, boolean hasAcceptedCommander, int acceptedDriversCount, int acceptedFirefightersCount, boolean hasAcceptedTechnicalRescue) {
        this.count = count;
        this.hasAcceptedCommander = hasAcceptedCommander;
        this.acceptedDriversCount = acceptedDriversCount;
        this.acceptedFirefightersCount = acceptedFirefightersCount;
        this.hasAcceptedTechnicalRescue = hasAcceptedTechnicalRescue;
    }
}
