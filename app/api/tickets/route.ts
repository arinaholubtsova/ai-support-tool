import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('[GET /api/tickets]', error)
    return NextResponse.json(
      { error: 'Не вдалося отримати список звернень' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { clientName, text } = body

    if (!clientName?.trim() || !text?.trim()) {
      return NextResponse.json(
        { error: "Поля «Ім'я клієнта» та «Текст звернення» є обов'язковими" },
        { status: 400 }
      )
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientName: clientName.trim(),
        text: text.trim(),
      },
    })

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('[POST /api/tickets]', error)
    return NextResponse.json(
      { error: 'Не вдалося зберегти звернення' },
      { status: 500 }
    )
  }
}
