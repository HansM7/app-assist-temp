import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const data = await prisma.user.createMany({
    data: [
      {
        email: "admin@gmail.com",
        name: "User admin",
        password: bcrypt.hashSync("admin", 11),
        dni: "12345678",
        role: "ADMIN",
      },
      {
        email: "user@gmail.com",
        name: "User user",
        password: bcrypt.hashSync("user", 11),
        dni: "12345678",
        role: "USER",
      },
    ],
  });

  return NextResponse.json(data);
}
