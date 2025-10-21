INSERT IGNORE INTO tb_tipo_usuario (id_tipo_usuario, nome_tipo_usuario) 
VALUES (1, 'Cliente'), (2, 'Admin');

INSERT IGNORE INTO tb_usuario (id_usuario, cpf, email, nome_usuario, senha, tipo_usuario_id) VALUES
(1, '11122233344', 'admin@gmail.com', 'AdminQu8', 'admin32u', 2);