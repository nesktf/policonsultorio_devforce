BEGIN;

-- Admin has "admin" as password. Stored a sha256 sum
INSERT INTO "User" ("id", "nombre", "email", "password", "rol") VALUES
  (1, 'admin', 'admin@admin.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'GERENTE'),
  (2, 'profesional', 'profesional@gmail.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'PROFESIONAL'),
  (3, 'mesa', 'mesa@gmail.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'MESA_ENTRADA');

-- ALTER SEQUENCE "User_id_seq" RESTART WITH 1;

INSERT INTO "ObraSocial" ("id", "nombre", "estado") VALUES
  (1, 'IPSS', 'ACTIVA'),
  (2, 'OSDE', 'ACTIVA'),
  (3, 'Swiss Medical', 'ACTIVA'),
  (4, 'Hourai Services', 'ACTIVA'),
  (5, 'Scarlet Services', 'INACTIVA');
ALTER SEQUENCE "ObraSocial_id_seq" RESTART WITH 5;

INSERT INTO "Profesional" ("id", "nombre", "apellido", "direccion", "dni", "especialidad", "telefono") VALUES
  (1, 'Eirin', 'Yagokoro', 'Forest of the Lost 1452', '3123412', 'Cardiología', '+543871234564'),
  (2, 'Reimu', 'Hakurei', 'Hakurei Shrine 1031', '12345678', 'Medicina General', '+543871234567'),
  (3, 'Marisa', 'Kirisame', 'Forest of Magic 2120', '87654321', 'Traumatología', '+543872345678'),
  (4, 'Sakuya', 'Izayoi', 'Scarlet Devil Mansion 3032', '11223344', 'Cirugía', '+543873456789'),
  (5, 'Remilia', 'Scarlet', 'Scarlet Devil Mansion 3121', '55667788', 'Cardiología', '+543874567890'),
  (6, 'Youmu', 'Konpaku', 'Netherworld 4320', '99001122', 'Neurología', '+543875678901'),
  (7, 'Flandre', 'Scarlet', 'Scarlet Devil Mansion 2132', '33445566', 'Psiquiatría', '+543876789012'),
  (8, 'Yuyuko', 'Saigyouji', 'Netherworld 41', '77889900', 'Oncología', '+543877890123'),
  (9, 'Yukari', 'Yakumo', 'Boundary 60', '66778899', 'Ginecología', '+543879012345'),
  (10, 'Ran', 'Yakumo', 'Boundary 61', '00112233', 'Oftalmología', '+543870123456'),
  (11, 'Chen', 'Yakumo', 'Boundary 62', '00112244', 'Dermatología', '+543870233456');
ALTER SEQUENCE "Profesional_id_seq" RESTART WITH 11;

INSERT INTO "ProfesionalObraSocial" ("id", "id_obra_social", "id_profesional") VALUES
  (1, 3, 5),
  (2, 1, 9),
  (3, 4, 2),
  (4, 2, 7),
  (5, 3, 1),
  (6, 1, 11),
  (7, 4, 4),
  (8, 2, 6),
  (9, 3, 10),
  (10, 1, 3),
  (11, 4, 8),
  (12, 2, 5),
  (13, 3, 9),
  (14, 1, 2),
  (15, 4, 7),
  (16, 2, 8),
  (17, 1, 3),
  (18, 4, 8),
  (19, 1, 1),
  (20, 2, 3);
ALTER SEQUENCE "ProfesionalObraSocial_id_seq" RESTART WITH 20;

INSERT INTO "Paciente" ("id", "nombre", "apellido", "dni", "direccion", "fecha_nacimiento", "telefono", "id_obra_social", "num_obra_social") VALUES
  (1, 'Aya', 'Shameimaru', '12345678', 'Tengu Village 100', '1995-10-25 15:30:00.123', '+543871234567', 2, '98765432'),
  (2, 'Momiji', 'Inubashiri', '98765432', 'Tengu Village 101', '1998-05-12 08:00:00.456', '+543872345678', 3, '12345678'),
  (3, 'Nitori', 'Kawashiro', '11223344', 'Kappa Village 200', '2001-08-01 11:45:00.789', '+543873456789', 1, '55667788'),
  (4, 'Koishi', 'Komeiji', '55667788', 'Chireiden 300', '1992-03-17 22:10:00.012', '+543874567890', 4, '99001122'),
  (5, 'Satori', 'Komeiji', '99001122', 'Chireiden 301', '1990-11-04 18:20:00.345', '+543875678901', 2, '33445566'),
  (6, 'Byakuren', 'Hijiri', '33445566', 'Myouren Temple 400', '1985-07-29 09:55:00.678', '+543876789012', 3, '77889900'),
  (7, 'Toyosatomimi', 'no Miko', '77889900', 'Hall of Dreams 500', '1988-02-14 14:05:00.901', '+543877890123', 1, '22334455'),
  (8, 'Kasodani', 'Kyouko', '22334455', 'Myouren Temple 401', '1996-09-03 07:30:00.123', '+543878901234', NULL, NULL),
  (9, 'Seiga', 'Kaku', '66778899', 'Graveyard 600', '1980-12-05 16:50:00.456', '+543879012345', 4, '66778899'),
  (10, 'Mamizou', 'Futatsuiwa', '00112233', 'Bamboo Forest 700', '1994-06-20 10:15:00.789', '+543870123456', NULL, NULL),
  (11, 'Cirno', 'Baka', '1231132', 'Misty Lake 123', '1939-09-01 10:00:00.000', '+543871234567', NULL, NULL);
ALTER SEQUENCE "Paciente_id_seq" RESTART WITH 11;

INSERT INTO "HistoriaClinica" ("id", "id_paciente", "id_profesional", "motivo", "detalle") VALUES
  (1, 1, 1, 'Infección Cardíaca', 'Al paciente se le extirpó el corazón por que se veía feo en las tomografías. Fue reemplazado por una bolsa con sangre y una bomba de nafta.'),
  (2, 2, 2, 'Migrañas', 'El paciente expresa haber empezado a sentir dolores de cabeza luego de comer carne en descomposición. Se le ha recetado un paracetamol y se le ha enviado a casa'),
  (3, 3, 3, 'Traumatismos Múltiples', 'El paciente se rompió 84 huesos del cuerpo al caer en una máquina para empaquetar pepinos. Se han iniciado tratamientos de recuperación'),
  (4, 9, 4, 'Extracción de material extraño', 'El paciente se ha quedado atorado misteriosamente dentro de una pared mientras se la construía. Se han llevado a cabo procedimientos para remover los materiales de construcción de su cintura.'),
  (5, 4, 7, 'Esquizofrenia', 'El paciente ha empezado a experimentar síntomas de esquizofrenia luego de lastimarse un ojo. Se ha iniciado un tratamiento con medicamentos.'),
  (6, 11, 11, 'Cáncer de pìel', 'El paciente presenta síntomas de cáncer de piel luego de haberse sometido a un experimento con energía misteriosa a manos de una mujer en silla de ruedas. Se ha iniciado quimioterapia.');
ALTER SEQUENCE "HistoriaClinica_id_seq" RESTART WITH 6;

INSERT INTO "Turno" ("id", "id_profesional", "id_paciente", "fecha", "estado") VALUES
  (1, 1,  1, '2025-09-21 11:00:00.00', 'CONFIRMADO'),
  (2, 1,  1, '2025-08-21 11:00:00.00', 'CANCELADO'),
  (3, 2,  2, '2025-09-21 09:00:00.00', 'CONFIRMADO'),
  (4, 3,  3, '2025-08-31 09:00:00.00', 'CONFIRMADO'),
  (5, 4,  9, '2025-08-30 09:30:00.00', 'CONFIRMADO'),
  (6, 7,  4, '2025-08-29 09:20:00.00', 'CONFIRMADO'),
  (7, 11, 11, '2025-08-28 10:20:00.00', 'CONFIRMADO');
ALTER SEQUENCE "Turno_id_seq" RESTART WITH 7;

COMMIT;
