# Fatec Rooms
Sistema de reserva e gerenciamento de salas — Fatec Zona Leste

O Fatec Rooms é uma plataforma web projetada para digitalizar o agendamento de laboratórios e espaços acadêmicos. O sistema substitui processos manuais por um fluxo de trabalho estruturado entre o corpo docente e a coordenação, garantindo integridade nos agendamentos e controle de disponibilidade.

---

## Perfis de Acesso

**Professor**
* Solicitação de reservas por data, sala e período.
* Acompanhamento de status (Pendente, Aprovado, Rejeitado, Cancelado).
* Gestão de calendário pessoal e visualização de disponibilidade.

**Coordenador**
* Gestão de solicitações e moderação de novos usuários.
* Administração de salas, períodos e configurações globais.
* Acesso a relatórios de utilização e estatísticas do sistema.

---

## Tecnologias

<details>

<summary>Backend</summary>

* Java 17 com Spring Boot 3
* Spring Security & JWT (Autenticação e Autorização)
* Spring Data JPA & MySQL (Persistência)
* Flyway (Versionamento de banco de dados)
* Swagger / OpenAPI 3 (Documentação)

</details>

<details>

<summary>Frontend</summary>
  
* React 19 & Vite
* React Router 7 (Navegação)
* Tailwind CSS (Estilização)
* Recharts (Visualização de dados)

</details>  
 
## Pré-requisitos
 
- Docker e Docker Compose
- Instância MySQL acessível (local ou remota)
- JDK 17+ (apenas para desenvolvimento local do backend sem Docker)
- Node.js 20+ (apenas para desenvolvimento local do frontend sem Docker)
---
 

## Variáveis de Ambiente
 
Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:
 
---
 
### Níveis de acesso (`authlevel`)
 
| Valor | Perfil | Permissões |
|---|---|---|
| `0` | Pendente | Aguardando aprovação do coordenador |
| `1` | Coordenador | Acesso total ao sistema |
| `2` | Professor | Reservas e consultas |
 
 
## Endpoints
 
A documentação completa e interativa está disponível no **Swagger UI** em `/swagger-ui/index.html`.
 
---

### Regras de negócio
- A data da reserva deve ser futura e respeitar o prazo mínimo de antecedência configurado pelo coordenador (padrão: 7 dias).
- Não é possível reservar salas aos domingos.
- Períodos de sábado só estão disponíveis em datas de sábado e vice-versa.
- O sistema impede conflitos de horário: tanto por ID de período quanto por sobreposição de intervalos de tempo.
- Reservas com status `CANCELLED` ou `REJECTED` não podem ser reativadas.
---
 
## Licença
 
Projeto Interdisciplinar para a **Fatec Zona Leste**. Todos os direitos reservados © 2026.
