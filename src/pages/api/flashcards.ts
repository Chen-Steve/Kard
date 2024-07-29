import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Bad Request', details: 'userId is required' }, { status: 400 });
  }

  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { userId: userId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(flashcards);
  } catch (error) {
    console.error('GET flashcards error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question, answer, userId } = await request.json();
    console.log("Received userId:", userId); // Log the received userId

    if (!userId) {
      return NextResponse.json({ error: 'Bad Request', details: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log("User found:", user); // Log the user object

    if (!user) {
      return NextResponse.json({ error: 'Not Found', details: 'User not found' }, { status: 404 });
    }

    const flashcardsCount = await prisma.flashcard.count({ where: { userId } });
    const newFlashcard = await prisma.flashcard.create({
      data: { 
        question, 
        answer, 
        order: flashcardsCount, 
        userId: userId
      },
    });
    return NextResponse.json(newFlashcard, { status: 201 });
  } catch (error) {
    console.error('POST flashcard error:', error);
    console.error('Error details:', (error as Error).message); // Log the error message
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, question, answer, order } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', details: 'Flashcard id is required' }, { status: 400 });
    }
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: id },
      data: { 
        question, 
        answer,
        order,
      },
    });
    return NextResponse.json(updatedFlashcard);
  } catch (error) {
    console.error('PUT flashcard error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}