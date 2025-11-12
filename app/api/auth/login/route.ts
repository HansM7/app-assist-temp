import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json("No existe ese correo", { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json("Contraseña incorrecta", { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      correo: user.email,
      nombre_completo: user.name,
      rol: "USER",
    });
  } catch (error) {
    return NextResponse.json("Error server", { status: 500 });
  }
}
