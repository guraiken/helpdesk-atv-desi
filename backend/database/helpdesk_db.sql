DROP DATABASE IF EXISTS helpdesk_db;
CREATE DATABASE helpdesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE helpdesk_db;

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('Solicitante', 'Técnico') NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255)
);

CREATE TABLE chamados (
    id_chamado INT AUTO_INCREMENT PRIMARY KEY,
    assunto VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    id_categoria INT NOT NULL,
    prioridade ENUM('Baixa', 'Média', 'Alta') NOT NULL,
    id_solicitante INT NOT NULL,
    id_tecnico INT NULL,
    data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Aberto', 'Em atendimento', 'Finalizado') NOT NULL DEFAULT 'Aberto',
    solucao TEXT NULL,
    CONSTRAINT fk_chamados_categoria FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria),
    CONSTRAINT fk_chamados_solicitante FOREIGN KEY (id_solicitante) REFERENCES usuarios (id_usuario),
    CONSTRAINT fk_chamados_tecnico FOREIGN KEY (id_tecnico) REFERENCES usuarios (id_usuario)
);

CREATE TABLE historico_atendimentos (
    id_historico INT AUTO_INCREMENT PRIMARY KEY,
    id_chamado INT NOT NULL,
    id_tecnico INT NOT NULL,
    data_atendimento DATETIME NOT NULL,
    observacao TEXT NOT NULL,
    status_resultante ENUM('Aberto', 'Em atendimento', 'Finalizado') NOT NULL,
    CONSTRAINT fk_historico_chamado FOREIGN KEY (id_chamado) REFERENCES chamados (id_chamado) ON DELETE CASCADE,
    CONSTRAINT fk_historico_tecnico FOREIGN KEY (id_tecnico) REFERENCES usuarios (id_usuario)
);

INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Ana Souza', 'ana.souza@helpdesk.com', '$2b$10$QgkwtX3DOhQd8vlifs3UbuLsp2daVR0xqc038Zgg/NkB3Mt58QWDC', 'Solicitante'),
('Bruno Lima', 'bruno.lima@helpdesk.com', '$2b$10$QgkwtX3DOhQd8vlifs3UbuLsp2daVR0xqc038Zgg/NkB3Mt58QWDC', 'Solicitante'),
('Carla Mendes', 'carla.mendes@helpdesk.com', '$2b$10$QgkwtX3DOhQd8vlifs3UbuLsp2daVR0xqc038Zgg/NkB3Mt58QWDC', 'Solicitante'),
('Diego Ramos', 'diego.ramos@helpdesk.com', '$2b$10$QgkwtX3DOhQd8vlifs3UbuLsp2daVR0xqc038Zgg/NkB3Mt58QWDC', 'Técnico'),
('Elisa Prado', 'elisa.prado@helpdesk.com', '$2b$10$QgkwtX3DOhQd8vlifs3UbuLsp2daVR0xqc038Zgg/NkB3Mt58QWDC', 'Técnico'),
('Fábio Costa', 'fabio.costa@helpdesk.com', '$2b$10$QgkwtX3DOhQd8vlifs3UbuLsp2daVR0xqc038Zgg/NkB3Mt58QWDC', 'Técnico');

INSERT INTO categorias (nome, descricao) VALUES
('Hardware', 'Problemas com equipamentos físicos, como computadores, impressoras e periféricos'),
('Software', 'Problemas com sistemas operacionais, aplicativos e licenças'),
('Rede', 'Problemas de conectividade, internet, Wi-Fi e acesso a recursos de rede');

INSERT INTO chamados (assunto, descricao, id_categoria, prioridade, id_solicitante, id_tecnico, data_abertura, status, solucao) VALUES
('Computador não liga', 'O computador da recepção não liga após queda de energia.', 1, 'Alta', 1, 4, '2026-11-03 08:15:00', 'Finalizado', 'Fonte de alimentação substituída e equipamento testado.'),
('Erro ao abrir planilhas', 'O Excel fecha sozinho ao abrir arquivos da pasta compartilhada.', 2, 'Média', 2, 5, '2026-11-04 09:40:00', 'Em atendimento', NULL),
('Wi-Fi instável na sala de reuniões', 'A conexão cai várias vezes durante as reuniões.', 3, 'Média', 3, 6, '2026-11-05 14:20:00', 'Em atendimento', NULL),
('Impressora sem toner', 'A impressora do financeiro está imprimindo folhas em branco.', 1, 'Baixa', 1, NULL, '2026-11-06 10:05:00', 'Aberto', NULL),
('Instalação do leitor de PDF', 'Solicito a instalação de um leitor de PDF no meu computador.', 2, 'Baixa', 2, NULL, '2026-11-07 11:30:00', 'Aberto', NULL),
('Sem acesso à pasta de rede', 'Não consigo acessar a pasta compartilhada do setor de compras.', 3, 'Alta', 3, NULL, '2026-11-08 16:45:00', 'Aberto', NULL);

INSERT INTO historico_atendimentos (id_chamado, id_tecnico, data_atendimento, observacao, status_resultante) VALUES
(1, 4, '2026-11-03 08:30:00', 'Chamado assumido pelo técnico.', 'Em atendimento'),
(1, 4, '2026-11-03 09:10:00', 'Identificada falha na fonte de alimentação.', 'Em atendimento'),
(1, 4, '2026-11-03 10:00:00', 'Fonte de alimentação substituída e equipamento testado.', 'Finalizado'),
(2, 5, '2026-11-04 10:00:00', 'Chamado assumido pelo técnico.', 'Em atendimento'),
(2, 5, '2026-11-04 10:45:00', 'Reparo do Office iniciado, aguardando conclusão.', 'Em atendimento'),
(3, 6, '2026-11-05 15:00:00', 'Chamado assumido pelo técnico.', 'Em atendimento');
