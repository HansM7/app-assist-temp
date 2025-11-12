-- CreateTable
CREATE TABLE "assistance" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assistance_pkey" PRIMARY KEY ("id")
);
