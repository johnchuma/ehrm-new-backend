import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  @Post('chat')
  @HttpCode(200)
  @ApiOperation({ summary: 'Chat with AI setup assistant' })
  async chat(@Body() body: any) {
    const messages = body.messages || [];
    const settings = body.settings || {};

    const systemPrompt = `You are an AI setup assistant for ExactEHRM, an HR management platform. Your job is to help the user configure their company workspace settings by having a natural conversation.

The user's current settings so far: ${JSON.stringify(settings)}

Guide the user through setting up each section one at a time:
1. Company Profile (name, industry, size, country, etc.)
2. Departments - what departments does their company have?
3. Branches - what physical locations?
4. Contract Types - what employment contracts do they use?
5. Levels / Salary Grades / Job Titles
6. Benefits
7. Working Days & Holidays
8. Approval Configs

For each topic, ask a few simple questions. After gathering info for a section, summarize what you'll save and ask for confirmation before proceeding.

When the user confirms, respond with a JSON block at the end of your message like:
---CONFIRM---
{"departments":[{"name":"Human Resources"},{"name":"Finance"}]}
---CONFIRM---

Only include the CONFIRM block when the user explicitly says yes or confirms. Keep responses friendly and concise.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';

    // Extract confirmation data if present
    const confirmMatch = reply.match(/---CONFIRM---\n([\s\S]*?)\n---CONFIRM---/);
    let confirmData = null;
    if (confirmMatch) {
      try { confirmData = JSON.parse(confirmMatch[1]); } catch {}
    }

    return {
      reply: reply.replace(/---CONFIRM---[\s\S]*?---CONFIRM---/, '').trim(),
      confirmData,
      usage: data.usage,
    };
  }
}
