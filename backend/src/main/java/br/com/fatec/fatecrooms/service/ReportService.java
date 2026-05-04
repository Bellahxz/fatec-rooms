package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.RoomReportDTO;
import br.com.fatec.fatecrooms.model.Booking;
import br.com.fatec.fatecrooms.repository.BookingRepository;
import br.com.fatec.fatecrooms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<RoomReportDTO> getRoomsReport() {
        List<Booking> allBookings = bookingRepository.findAll();

        return roomRepository.findAll().stream().map(room -> {
            List<Booking> roomBookings = allBookings.stream()
                    .filter(b -> b.getRoom().getId().equals(room.getId()))
                    .toList();

            long total     = roomBookings.size();
            long approved  = roomBookings.stream().filter(b -> b.getStatus() == Booking.Status.APPROVED).count();
            long pending   = roomBookings.stream().filter(b -> b.getStatus() == Booking.Status.PENDING).count();
            long cancelled = roomBookings.stream().filter(b -> b.getStatus() == Booking.Status.CANCELLED).count();
            long rejected  = roomBookings.stream().filter(b -> b.getStatus() == Booking.Status.REJECTED).count();

            return new RoomReportDTO(
                    room.getId(),
                    room.getName(),
                    room.getLocation(),
                    total,
                    approved,
                    pending,
                    cancelled,
                    rejected
            );
        }).toList();
    }
}
