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
ALTER SEQUENCE "ObraSocial_id_seq" RESTART WITH 6;

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
ALTER SEQUENCE "Profesional_id_seq" RESTART WITH 12;

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
ALTER SEQUENCE "ProfesionalObraSocial_id_seq" RESTART WITH 21;

INSERT INTO "Paciente" ("id", "nombre", "apellido", "dni", "direccion", "fecha_nacimiento", "telefono", "id_obra_social", "num_obra_social", "antecedentes") VALUES
  (1, 'Aya', 'Shameimaru', '12345678', 'Tengu Village 100', '1995-10-25 15:30:00.123', '+543871234567', 2, '98765432', 'Padre: Infarto de miocardio a los 55 años. Madre: Diabetes tipo 2. Abuela materna: Hipertensión arterial.'),
  (2, 'Momiji', 'Inubashiri', '98765432', 'Tengu Village 101', '1998-05-12 08:00:00.456', '+543872345678', 3, '12345678', NULL),
  (3, 'Nitori', 'Kawashiro', '11223344', 'Kappa Village 200', '2001-08-01 11:45:00.789', '+543873456789', 1, '55667788', NULL),
  (4, 'Koishi', 'Komeiji', '55667788', 'Chireiden 300', '1992-03-17 22:10:00.012', '+543874567890', 4, '99001122', NULL),
  (5, 'Satori', 'Komeiji', '99001122', 'Chireiden 301', '1990-11-04 18:20:00.345', '+543875678901', 2, '33445566', NULL),
  (6, 'Byakuren', 'Hijiri', '33445566', 'Myouren Temple 400', '1985-07-29 09:55:00.678', '+543876789012', 3, '77889900', NULL),
  (7, 'Toyosatomimi', 'no Miko', '77889900', 'Hall of Dreams 500', '1988-02-14 14:05:00.901', '+543877890123', 1, '22334455', NULL),
  (8, 'Kasodani', 'Kyouko', '22334455', 'Myouren Temple 401', '1996-09-03 07:30:00.123', '+543878901234', NULL, NULL, NULL),
  (9, 'Seiga', 'Kaku', '66778899', 'Graveyard 600', '1980-12-05 16:50:00.456', '+543879012345', 4, '66778899', NULL),
  (10, 'Mamizou', 'Futatsuiwa', '00112233', 'Bamboo Forest 700', '1994-06-20 10:15:00.789', '+543870123456', NULL, NULL, NULL),
  (11, 'Cirno', 'Baka', '1231132', 'Misty Lake 123', '1939-09-01 10:00:00.000', '+543871234567', NULL, NULL, NULL);
ALTER SEQUENCE "Paciente_id_seq" RESTART WITH 12;

INSERT INTO "HistoriaClinica" (id, id_paciente, id_profesional, fecha, motivo, detalle, examen_fisico, signos_vitales, diagnostico, tratamiento, medicamentos, estudios, indicaciones, observaciones, proximo_control)
VALUES
  (1, 1, 1,
    '2024-01-15 09:00:00.000',
    'Control rutinario',
    'Paciente refiere sentirse bien en general. Sin síntomas cardiovasculares. Mantiene actividad física regular.',
    'Paciente en buen estado general. Signos vitales estables.',
    '{ "presion": "120/80", "frecuencia": "72", "temperatura": "30.5", "peso": "68", "altura": "165", "oxigenacion": "98" }',
    'Control cardiológico normal',
    'Continuar con medicación actual',
    '[{ "nombre": "Enalapril", "dosis": "10mg", "frecuencia": "1 vez al dia", "duracion": "Continuar"}, { "nombre": "Aspirina", "dosis": "100mg", "frecuencia": "1 vez al dia", "duracion": "Continuar"}]',
    '[{ "tipo": "Electrocardiograma", "resultado": "Normal", "fecha": "2024-01-15"}, {"tipo": "Analisis de sangre", "resultado": "Valores normales", "fecha": "2024-01-10"}]',
    'Mantener dieta baja en sodio. Continuar con ejercicio regular. Control en 6 meses.',
    'Paciente colaborador, cumple bien con el tratamiento',
    '2024-07-15 09:00:00.000'
  ),
  (2, 2, 2,
    '2023-12-10 09:00:00.000',
    'Seguimiento hipertension',
    'Paciente con antecedentes de hipertensión arterial. Refiere adherencia al tratamiento.',
    'Buen estado general. Auscultación cardiopulmonar normal.',
    '{ "presion": "125/85", "frecuencia": "75", "temperatura": "36.3", "peso": "69", "altura": "165", "oxigenacion": "98" }',
    'Hipertensión arterial controlada',
    'Ajuste de medicación',
    '[{ "nombre": "Enalapril", "dosis": "10mg", "frecuencia": "1 vez al día", "duracion": "3 meses" }]',
    NULL,
    'Dieta hiposódica. Control de peso. Ejercicio moderado.',
    'Buen control de la presión arterial.',
    '2024-01-15 09:00:00.000'
  );
ALTER SEQUENCE "Paciente_id_seq" RESTART WITH 2;

INSERT INTO "Turno" ("id", "id_profesional", "id_paciente", "fecha", "estado") VALUES
  (1, 1,  1, '2025-09-21 11:00:00.00', 'PROGRAMADO'),
  (2, 1,  1, '2025-08-21 11:00:00.00', 'CANCELADO'),
  (3, 2,  2, '2025-09-21 09:00:00.00', 'EN_SALA_ESPERA'),
  (4, 3,  3, '2025-08-31 09:00:00.00', 'ASISTIO'),
  (5, 4,  9, '2025-08-30 09:30:00.00', 'PROGRAMADO'),
  (6, 7,  4, '2025-08-29 09:20:00.00', 'NO_ASISTIO'),
  (7, 11, 11, '2025-08-28 10:20:00.00', 'CANCELADO');
ALTER SEQUENCE "Turno_id_seq" RESTART WITH 8;

COMMIT;
