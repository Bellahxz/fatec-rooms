-- V12__remove_semester_from_holidays.sql
-- Remove a relação de feriados com semestres.
-- Feriados agora são globais no sistema.

ALTER TABLE holidays DROP FOREIGN KEY fk_holidays_semester;
ALTER TABLE holidays DROP INDEX uq_holiday_semester_date;
ALTER TABLE holidays DROP COLUMN semester_id;

ALTER TABLE holidays ADD CONSTRAINT uq_holiday_date UNIQUE (holiday_date);
