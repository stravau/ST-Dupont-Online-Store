-- Group every per-row write from one Excel upload under a shared
-- batchId, so the audit viewer can collapse the whole batch into a
-- single expandable card. Existing rows stay NULL (no batch).
ALTER TABLE "AdminAction" ADD COLUMN "batchId" TEXT;

CREATE INDEX "AdminAction_batchId_idx" ON "AdminAction" ("batchId");
