package br.com.fatec.fatecrooms.service;

import br.com.fatec.fatecrooms.DTO.RoomDTO;
import br.com.fatec.fatecrooms.DTO.RoomRequest;
import br.com.fatec.fatecrooms.model.Room;
import br.com.fatec.fatecrooms.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<RoomDTO> listAll() {
        return roomRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public List<RoomDTO> listBookable() {
        return roomRepository.findByBookable((byte) 1)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public RoomDTO findById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sala não encontrada."));
        return toDTO(room);
    }

    public RoomDTO create(RoomRequest request) {
        Room room = new Room();
        room.setUserId(0);
        room.setName(request.getName());
        room.setLocation(request.getLocation());
        room.setBookable(request.getBookable() != null ? request.getBookable() : (byte) 1);
        room.setNotes(request.getNotes());
        return toDTO(roomRepository.save(room));
    }

    public RoomDTO update(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sala não encontrada."));

        room.setName(request.getName());
        room.setLocation(request.getLocation());
        if (request.getBookable() != null) room.setBookable(request.getBookable());
        room.setNotes(request.getNotes());

        return toDTO(roomRepository.save(room));
    }

    public String delete(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sala não encontrada."));
        roomRepository.delete(room);
        return "Sala '" + room.getName() + "' removida com sucesso.";
    }

    private RoomDTO toDTO(Room room) {
        return new RoomDTO(
                room.getId(),
                room.getName(),
                room.getLocation(),
                room.getBookable(),
                room.getNotes()
        );
    }
}