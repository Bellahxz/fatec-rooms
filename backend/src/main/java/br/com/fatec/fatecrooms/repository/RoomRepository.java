package br.com.fatec.fatecrooms.repository;

import br.com.fatec.fatecrooms.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Integer> {
    List<Room> findByBookable(Byte bookable);
}