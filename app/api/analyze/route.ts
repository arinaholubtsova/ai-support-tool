import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import type { AnalysisResult } from '@/types/ticket'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `Ти — досвідчений аналітик служби підтримки клієнтів. Проаналізуй звернення клієнта і поверни строго валідний JSON без будь-якого іншого тексту, markdown або пояснень.

Правила класифікації:
- priority "низький" → загальне інформаційне запитання, без терміновості
- priority "середній" → є проблема, яка потребує розгляду, але не критична
- priority "високий" → критична проблема, скарга, фінансовий збиток, ризик відтоку клієнта

- category "оплата" → питання рахунків, платежів, повернення коштів, підписок
- category "доставка" → питання доставки, логістики, статусу замовлення, втраченого товару
- category "скарга" → незадоволення, претензія, негативний досвід, вимога компенсації
- category "інше" → технічна підтримка, загальне питання, не підпадає під інші категорії

Структура відповіді:
{
  "priority": "низький" | "середній" | "високий",
  "category": "оплата" | "доставка" | "скарга" | "інше",
  "summary": "Одне речення — стислий підсумок суті звернення українською мовою.",
  "draftResponse": "Ввічлива, коротка та конкретна відповідь клієнту українською мовою, з підтвердженням отримання звернення та наступним кроком."
}`

export async function POST(req: NextRequest) {
  try {
    const { ticketId } = await req.json()

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId є обов'язковим" }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })

    if (!ticket) {
      return NextResponse.json({ error: 'Звернення не знайдено' }, { status: 404 })
    }

    // Call OpenAI API with JSON mode
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Клієнт: ${ticket.clientName}\n\nЗвернення:\n${ticket.text}`,
        },
      ],
    })

    const rawText = completion.choices[0]?.message?.content
    if (!rawText) {
      throw new Error('Empty response from OpenAI')
    }

    let analysis: AnalysisResult
    try {
      analysis = JSON.parse(rawText)
    } catch {
      console.error('[analyze] Failed to parse AI JSON:', rawText)
      return NextResponse.json(
        { error: 'Не вдалося розпарсити відповідь AI' },
        { status: 500 }
      )
    }

    // Validate required fields
    const validPriorities = ['низький', 'середній', 'високий']
    const validCategories = ['оплата', 'доставка', 'скарга', 'інше']

    if (
      !validPriorities.includes(analysis.priority) ||
      !validCategories.includes(analysis.category) ||
      !analysis.summary ||
      !analysis.draftResponse
    ) {
      console.error('[analyze] Invalid AI response structure:', analysis)
      return NextResponse.json(
        { error: 'AI повернув некоректну структуру даних' },
        { status: 500 }
      )
    }

    // Persist analysis results
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        priority: analysis.priority,
        category: analysis.category,
        summary: analysis.summary,
        draftResponse: analysis.draftResponse,
      },
    })

    
    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('[POST /api/analyze]', error)
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера під час аналізу' },
      { status: 500 }
    )
  }
}
