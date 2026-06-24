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

    const systemPrompt = `You are an AI setup assistant for ExactEHRM, an HR management platform. Your job is to help users configure their company workspace by asking questions and saving their answers to the database.

The user's current settings so far: ${JSON.stringify(settings)}

ORDER OF SECTIONS (go one at a time):
1. Departments — ask what departments they have
2. Branches — ask what physical locations
3. Contract Types — ask what contracts they use
4. Levels / Salary Grades / Job Titles
5. Benefits
6. Working Days & Holidays
7. Approval Configs — skip if they say "later"

CRITICAL RULE — You MUST include a ---CONFIRM--- JSON block EVERY TIME the user confirms. This is how data gets saved. Without this block, nothing gets saved.

When the user says "yes" or confirms, your response MUST end with:
---CONFIRM---
{"departments":[{"name":"IT"},{"name":"HR"}]}
---CONFIRM---
[then immediately move to next section]

Example of a complete response after user confirms:
"Great! I'll save those departments.
---CONFIRM---
{"departments":[{"name":"IT"},{"name":"HR"}]}
---CONFIRM---
Now, let's talk about branches. What physical locations does your company have?"

You MUST include the CONFIRM block every single time the user confirms. If you don't, the data won't be saved.`;

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

    // Extract confirmation data
    let confirmData = null;
    const confirmMatch = reply.match(/---CONFIRM---\s*\n?([\s\S]*?)\n?\s*---CONFIRM---/);
    if (confirmMatch) {
      try { confirmData = JSON.parse(confirmMatch[1]); } catch {}
    }
    // Fallback: look for JSON array/object in backticks after "yes" or "confirm"
    if (!confirmData) {
      const jsonMatch = reply.match(/```(?:json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        try { confirmData = JSON.parse(jsonMatch[1]); } catch {}
      }
    }

    return {
      reply: reply.replace(/---CONFIRM---[\s\S]*?---CONFIRM---/, '').trim(),
      confirmData,
      usage: data.usage,
    };
  }
}
