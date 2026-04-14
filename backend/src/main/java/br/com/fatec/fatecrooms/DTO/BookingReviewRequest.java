package br.com.fatec.fatecrooms.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingReviewRequest {
    // true = aprovado, false = rejeitado
    private boolean approved;
    private String rejectReason;
}