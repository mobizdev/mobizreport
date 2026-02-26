-- Script for M1System database (Central)
CREATE DATABASE [M1System];
GO

USE [M1System];
GO

CREATE TABLE [dbo].[TenantCompany](
    [Id] [INT] IDENTITY(1,1) NOT NULL,
    [CompanyCode] [NVARCHAR](20) NOT NULL UNIQUE,   -- Unique identifier (e.g., 'sfm')
    [DbName] [NVARCHAR](100) NOT NULL,
    [DbServer] [NVARCHAR](100) NOT NULL,
    [DbUser] [NVARCHAR](100) NOT NULL,
    [DbPassword] [NVARCHAR](100) NOT NULL,
    [IsActive] [BIT] NOT NULL DEFAULT 1,
    [Created_at] [DATETIME2](7) DEFAULT GETDATE(),
    PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO

-- Sample Data
INSERT INTO [dbo].[TenantCompany] ([CompanyCode], [DbName], [DbServer], [DbUser], [DbPassword], [IsActive])
VALUES ('demo', 'Demo_Tenant_DB', 'localhost', 'sa', 'password', 1);
GO
