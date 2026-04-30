package br.com.fatec.fatecrooms.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@fatecrooms.com.br}")
    private String from;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    /**
     * Envia e-mail com link/token para redefinição de senha.
     *
     * @param toEmail   destinatário
     * @param token     token seguro gerado para o reset
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/redefinir-senha?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("Fatec Rooms — Redefinição de Senha");
        message.setText(
                "Olá,\n\n" +
                        "Recebemos uma solicitação para redefinir a senha da sua conta.\n\n" +
                        "Clique no link abaixo (ou copie e cole no navegador) para criar uma nova senha:\n\n" +
                        resetLink + "\n\n" +
                        "Este link expira em 30 minutos.\n\n" +
                        "Caso você não tenha solicitado a redefinição, ignore este e-mail e sua senha permanecerá a mesma.\n\n" +
                        "Atenciosamente,\n" +
                        "Equipe Fatec Rooms"
        );

        log.info("Username: {}", username);
        log.info("Password: {}", password);
        log.info("Reset link gerado: {}", resetLink);
        log.info("Loaded username: {}", username);
        log.info("Loaded password: {}", password != null ? "******" : "null");

        try {
            mailSender.send(message);
            log.info("E-mail de redefinição de senha enviado para: {}", toEmail);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de redefinição para {}: {}", toEmail, e.getMessage());
            // Não propaga a exceção para não vazar se o e-mail existe ou não
            throw new IllegalStateException("Não foi possível enviar o e-mail de redefinição. Tente novamente mais tarde.");
        }
    }
}