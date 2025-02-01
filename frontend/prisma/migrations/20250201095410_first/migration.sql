-- CreateTable
CREATE TABLE "PutOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "strike_price" REAL NOT NULL,
    "premium_price" REAL NOT NULL,
    "expiry" DATETIME NOT NULL,
    "asset" TEXT NOT NULL,
    "seller_address" TEXT NOT NULL,
    "buyer_address" TEXT,
    "asset_transfered" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PutOption_asset_idx" ON "PutOption"("asset");

-- CreateIndex
CREATE INDEX "PutOption_seller_address_idx" ON "PutOption"("seller_address");

-- CreateIndex
CREATE INDEX "PutOption_buyer_address_idx" ON "PutOption"("buyer_address");
