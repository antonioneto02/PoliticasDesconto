-- =============================================
-- Política de Desconto (por grupo/produto) - Script de criação
-- =============================================

-- 1. Criar o banco de dados (execute conectado ao master)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'politica_desconto')
BEGIN
    CREATE DATABASE politica_desconto;
END
GO

USE politica_desconto;
GO

-- 2. Tabela de políticas de desconto por grupo/produto
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.POLITICA_DESCONTO') AND type = 'U')
BEGIN
    CREATE TABLE dbo.POLITICA_DESCONTO (
        ID          INT IDENTITY(1,1)  NOT NULL,
        CODGRUPO    VARCHAR(30)        NOT NULL,
        PRODUTO     VARCHAR(30)        NOT NULL,
        PERC_DESC   DECIMAL(5,2)       NOT NULL,
        DT_INICIO   DATETIME2          NOT NULL,
        DT_FIM      DATETIME2          NOT NULL,
        DT_CRIACAO  DATETIME2          NOT NULL DEFAULT GETDATE(),
        ATIVO       BIT                NOT NULL DEFAULT 1,
        CONSTRAINT PK_POLITICA_DESCONTO PRIMARY KEY (ID)
    );

    CREATE INDEX IX_POLDESC_ATIVO    ON dbo.POLITICA_DESCONTO (ATIVO);
    CREATE INDEX IX_POLDESC_VIGENCIA ON dbo.POLITICA_DESCONTO (DT_INICIO, DT_FIM);
    CREATE INDEX IX_POLDESC_GRUPO    ON dbo.POLITICA_DESCONTO (CODGRUPO);
    CREATE INDEX IX_POLDESC_PRODUTO  ON dbo.POLITICA_DESCONTO (PRODUTO);
END
GO
