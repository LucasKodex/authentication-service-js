-- CreateTable
CREATE TABLE "Permission" (
    "uid" TEXT NOT NULL,
    "permission" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Role" (
    "uid" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "User" (
    "uid" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "role_uid" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_permission_key" ON "Permission"("permission");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_key" ON "Role"("role");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_uid_fkey" FOREIGN KEY ("role_uid") REFERENCES "Role"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
