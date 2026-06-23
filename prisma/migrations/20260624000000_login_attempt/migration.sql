-- Brute-force shield log for /admin/login. One row per authorize attempt.
CREATE TABLE "LoginAttempt" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "success"   BOOLEAN NOT NULL,
    "ip"        TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoginAttempt_email_createdAt_idx" ON "LoginAttempt" ("email", "createdAt");
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt" ("createdAt");
