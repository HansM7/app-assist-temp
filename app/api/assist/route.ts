import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const id = Number(session?.user.id);

    const newDate = new Date();
    // reducir 5 horas a la fecha
    newDate.setHours(newDate.getHours() - 5);

    await prisma.assistance.create({
      data: {
        user_id: id,
        date: newDate,
      },
    });

    return NextResponse.json("Asistencia creada correctamente");
  } catch (error) {
    return NextResponse.json("Error server", { status: 500 });
  }
}
