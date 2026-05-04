package br.com.fatec.fatecrooms.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RoomReportDTO {
    private Integer roomId;
    private String name;
    private String location;
    private long totalBookings;
    private long approvedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private long rejectedBookings;
}
