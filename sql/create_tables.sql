-- =============================================
-- Políticas de Desconto - Script de criação
-- =============================================

-- 1. Criar o banco de dados (execute conectado ao master)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'politicas_desconto')
BEGIN
    CREATE DATABASE politicas_desconto;
END
GO

USE politicas_desconto;
GO

-- 2. Tabela de políticas (capa)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.POLITICAS_DESCONTO') AND type = 'U')
BEGIN
    CREATE TABLE dbo.POLITICAS_DESCONTO (
        ID           INT IDENTITY(1,1)   NOT NULL,
        DESCRICAO    VARCHAR(255)        NOT NULL,
        PERC_DESCONTO DECIMAL(5,2)       NOT NULL,
        DT_INICIO    DATETIME2           NOT NULL,
        DT_FIM       DATETIME2           NOT NULL,
        DT_CRIACAO   DATETIME2           NOT NULL DEFAULT GETDATE(),
        ATIVO        BIT                 NOT NULL DEFAULT 1,
        CONSTRAINT PK_POLITICAS_DESCONTO PRIMARY KEY (ID)
    );

    CREATE INDEX IX_POLITICAS_DESCONTO_ATIVO ON dbo.POLITICAS_DESCONTO (ATIVO);
    CREATE INDEX IX_POLITICAS_DESCONTO_VIGENCIA ON dbo.POLITICAS_DESCONTO (DT_INICIO, DT_FIM);
END
GO

-- 3. Tabela de produtos vinculados à política
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.POLITICAS_DESCONTO_PRODUTOS') AND type = 'U')
BEGIN
    CREATE TABLE dbo.POLITICAS_DESCONTO_PRODUTOS (
        ID           INT IDENTITY(1,1)   NOT NULL,
        ID_POLITICA  INT                 NOT NULL,
        CODPROD      VARCHAR(30)         NOT NULL,
        DT_INCLUSAO  DATETIME2           NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_POLITICAS_DESCONTO_PRODUTOS PRIMARY KEY (ID),
        CONSTRAINT FK_PDPROD_POLITICA FOREIGN KEY (ID_POLITICA)
            REFERENCES dbo.POLITICAS_DESCONTO (ID),
        CONSTRAINT UQ_POLITICA_PRODUTO UNIQUE (ID_POLITICA, CODPROD)
    );

    CREATE INDEX IX_PDPROD_POLITICA ON dbo.POLITICAS_DESCONTO_PRODUTOS (ID_POLITICA);
    CREATE INDEX IX_PDPROD_CODPROD  ON dbo.POLITICAS_DESCONTO_PRODUTOS (CODPROD);
END
GO
