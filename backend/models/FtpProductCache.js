/**
 * FTP product cache – stores synced rows from vCloudTech FTP API for import-from-cache.
 * Used by POST /api/products/import-from-ftp-cache and FTP cache sync endpoints.
 */
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FtpProductCache = sequelize.define(
    "FtpProductCache",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ftpId: { type: DataTypes.INTEGER, allowNull: true },
      tableName: { type: DataTypes.STRING(255), allowNull: true },
      internalSku: { type: DataTypes.STRING(255), allowNull: true },
      mfrSku: { type: DataTypes.STRING(255), allowNull: true },
      vendorName: { type: DataTypes.STRING(255), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      msrp: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      cogs: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      weight: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
      dimensions: { type: DataTypes.STRING(255), allowNull: true },
      upc: { type: DataTypes.STRING(64), allowNull: true },
      stock: { type: DataTypes.INTEGER, allowNull: true },
      distributor: { type: DataTypes.STRING(255), allowNull: true },
      ftpCreatedAt: { type: DataTypes.DATE, allowNull: true },
      ftpUpdatedAt: { type: DataTypes.DATE, allowNull: true },
      lastSyncedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "ftp_product_cache",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["ftpId", "tableName"] },
        { fields: ["mfrSku", "vendorName"] },
        { fields: ["internalSku"] },
      ],
    }
  );

  return FtpProductCache;
};
