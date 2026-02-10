// AI Service Integration for Dynamic Content Generation
// Supports multiple AI providers: OpenAI, Google Gemini, Anthropic Claude

interface AIProvider {
  generateContent(prompt: string, context: any): Promise<string>;
}

interface UserContext {
  name: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  weakestHabit: string;
  strongestHabit: string;
  daysSinceJoin: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  lastActivity: Date;
  milestoneReached?: number;
  mnzdHabits?: Array<{
    id: string;
    name: string;
    description: string;
    completed: number;
    total: number;
    rate: number;
  }>;
  todayCompleted?: number;
  totalHabits?: number;
}

// Google Gemini AI Provider
class GeminiAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private loggedStatusCodes = new Set<number>();

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = (model || process.env.GEMINI_MODEL || 'gemini-flash-latest').trim();
  }

  private get baseUrl(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
  }

  async generateContent(prompt: string, context: UserContext): Promise<string> {
    console.log(`🤖 DEBUG: Gemini AI request for prompt: ${prompt}`);
    console.log(`🤖 DEBUG: Context data:`, JSON.stringify(context, null, 2));
    
    try {
      const fullPrompt = this.buildPrompt(prompt, context);
      console.log(`🤖 DEBUG: Full prompt sent to Gemini:`, fullPrompt);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const responseBody = await response.text().catch(() => '');
        console.log(`🤖 DEBUG: Gemini API error ${response.status}:`, responseBody);

        if (!this.loggedStatusCodes.has(response.status)) {
          this.loggedStatusCodes.add(response.status);
          const hint =
            response.status === 404
              ? 'Model not found/available for this API key (try setting GEMINI_MODEL).'
              : 'Gemini request failed.';
          console.warn(`Gemini AI unavailable (${response.status}) using model "${this.model}". ${hint}`);
          if (process.env.NODE_ENV !== 'production' && responseBody) {
            console.warn(`Gemini error body (truncated): ${responseBody.slice(0, 400)}`);
          }
        }

        const fallback = this.getFallbackContent(prompt, context);
        console.log(`🤖 DEBUG: Using fallback content:`, fallback);
        return fallback;
      }

      const data = await response.json();
      console.log(`🤖 DEBUG: Gemini API response:`, JSON.stringify(data, null, 2));
      
      const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (aiContent) {
        console.log(`🤖 DEBUG: AI generated content:`, aiContent);
        return aiContent.trim();
      } else {
        console.log(`🤖 DEBUG: No AI content in response, using fallback`);
        const fallback = this.getFallbackContent(prompt, context);
        console.log(`🤖 DEBUG: Fallback content:`, fallback);
        return fallback;
      }
    } catch (error) {
      console.log(`🤖 DEBUG: Gemini AI request exception:`, error);
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Gemini AI request failed; using fallback content.');
      }
      const fallback = this.getFallbackContent(prompt, context);
      console.log(`🤖 DEBUG: Exception fallback content:`, fallback);
      return fallback;
    }
  }

  private buildPrompt(basePrompt: string, context: UserContext): string {
    const mnzdDetails = context.mnzdHabits?.map(habit => 
      `${habit.name}: ${Math.round(habit.rate * 100)}% completion (${habit.completed}/${habit.total} days)`
    ).join(', ') || 'No habit data available';
    
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemainingInMonth = daysInMonth - dayOfMonth;
    const randomSeed = Math.floor(Math.random() * 10000);
    
    const styleVariations = [
      'Be energetic and enthusiastic with emojis',
      'Be calm and reflective',
      'Be motivational like a coach',
      'Be friendly and casual',
      'Be direct and action-oriented',
      'Be inspiring with a quote',
      'Be humorous and light',
      'Be wise and philosophical'
    ];
    const style = styleVariations[randomSeed % styleVariations.length];
    
    const contentAngles = [
      'Focus on progress made',
      'Emphasize consistency',
      'Highlight specific habit improvement',
      'Celebrate small wins',
      'Challenge to do better',
      'Reflect on journey so far',
      'Compare to last week',
      'Set intention for today'
    ];
    const angle = contentAngles[Math.floor(randomSeed / 100) % contentAngles.length];
    
    // Calculate total tracked days (not streak)
    const totalTrackedDays = context.daysSinceJoin;
    
    // Determine performance level for evening
    const todayCompletion = context.todayCompleted || 0;
    const totalHabits = context.totalHabits || 4;
    const completionRate = totalHabits > 0 ? Math.round((todayCompletion / totalHabits) * 100) : 0;
    
    let performanceLevel = '';
    if (todayCompletion === 0) {
      performanceLevel = 'NO tasks completed today - needs encouragement for tomorrow';
    } else if (todayCompletion === 1) {
      performanceLevel = '1 task completed - acknowledge effort, encourage more tomorrow';
    } else if (todayCompletion === 2) {
      performanceLevel = '2 tasks completed - good progress, motivate to finish stronger';
    } else if (todayCompletion === 3) {
      performanceLevel = '3 tasks completed - excellent work, almost perfect';
    } else if (todayCompletion >= totalHabits) {
      performanceLevel = 'ALL tasks completed - celebrate this achievement!';
    }

    // Correct greeting based on time
    const timeGreeting = context.timeOfDay === 'morning' ? 'Good morning' : 
                        context.timeOfDay === 'afternoon' ? 'Good afternoon' :
                        context.timeOfDay === 'evening' ? 'Good evening' : 'Hello';

    // Calculate month-to-date completion rate
    const monthToDateRate = (context as any).monthToDatePossible > 0 ? 
      Math.round(((context as any).monthToDateCompleted / (context as any).monthToDatePossible) * 100) : 0;

    return `You are a motivational habit coach. Generate a ${basePrompt} email.

User: ${context.name}
Day of Month: ${dayOfMonth}
Days Remaining in Month: ${daysRemainingInMonth}
Total Days in Month: ${daysInMonth}
Tracked Days: ${(context as any).trackedDaysThisMonth || 0}
Completion Rate: ${monthToDateRate}%
Tasks: ${(context as any).monthToDateCompleted}/${(context as any).monthToDatePossible}
Habits: ${mnzdDetails}

Write:
1. Subject line: "Day ${dayOfMonth} - [slogan based on ${monthToDateRate}% rate]"
2. Message: 2-3 complete sentences starting with "${timeGreeting} ${context.name}". Reference their data and ${daysRemainingInMonth} days left in month. Be motivating.

Format:
Subject: Day ${dayOfMonth} - [slogan]
Message: [complete sentences]

Write now:`;
  }

  private getFallbackContent(prompt: string, context: UserContext): string {
    // Fallback content when AI fails
    const fallbacks = {
      morning: `Good morning ${context.name}! 🌅 You're ${context.currentStreak} days strong. Today, let's focus on your ${context.weakestHabit} practice and keep building that amazing streak!`,
      evening: `Great work today ${context.name}! 🌙 You've maintained a ${Math.round(context.completionRate * 100)}% completion rate. Reflect on your progress and prepare for tomorrow's success!`,
      milestone: `🎉 Incredible achievement ${context.name}! ${context.milestoneReached} days of consistency shows your dedication to the MNZD methodology. You're building something extraordinary!`,
      recovery: `Hey ${context.name}! 🌱 Your ${context.longestStreak}-day streak shows what you're capable of. Every expert was once a beginner. Today is perfect for a fresh start!`,
      weekly: `Week summary for ${context.name}: ${Math.round(context.completionRate * 100)}% completion rate! 📊 Your strongest area is ${context.strongestHabit}. Let's focus on improving ${context.weakestHabit} next week.`
    };

    return fallbacks[prompt as keyof typeof fallbacks] || fallbacks.morning;
  }
}

// OpenAI Provider (if you prefer)
class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string, context: UserContext): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are a motivational habit coach for the Never Break The Chain app using MNZD methodology.'
          }, {
            role: 'user',
            content: this.buildPrompt(prompt, context)
          }],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.getFallbackContent(prompt, context);
    } catch (error) {
      console.error('OpenAI error:', error);
      return this.getFallbackContent(prompt, context);
    }
  }

  private buildPrompt(prompt: string, context: UserContext): string {
    return `Generate a personalized ${prompt} message for ${context.name} who has a ${context.currentStreak}-day streak (best: ${context.longestStreak}), ${Math.round(context.completionRate * 100)}% completion rate, strongest in ${context.strongestHabit}, needs work on ${context.weakestHabit}. Time: ${context.timeOfDay}. Keep it under 150 words, encouraging, and include a call to action.`;
  }

  private getFallbackContent(prompt: string, context: UserContext): string {
    // Same fallback as Gemini
    const fallbacks = {
      morning: `Good morning ${context.name}! 🌅 You're ${context.currentStreak} days strong. Today, let's focus on your ${context.weakestHabit} practice and keep building that amazing streak!`,
      evening: `Great work today ${context.name}! 🌙 You've maintained a ${Math.round(context.completionRate * 100)}% completion rate. Reflect on your progress and prepare for tomorrow's success!`,
      milestone: `🎉 Incredible achievement ${context.name}! ${context.milestoneReached} days of consistency shows your dedication to the MNZD methodology. You're building something extraordinary!`,
      recovery: `Hey ${context.name}! 🌱 Your ${context.longestStreak}-day streak shows what you're capable of. Every expert was once a beginner. Today is perfect for a fresh start!`,
      weekly: `Week summary for ${context.name}: ${Math.round(context.completionRate * 100)}% completion rate! 📊 Your strongest area is ${context.strongestHabit}. Let's focus on improving ${context.weakestHabit} next week.`
    };

    return fallbacks[prompt as keyof typeof fallbacks] || fallbacks.morning;
  }
}

// Main AI Content Service
export class AIContentService {
  private provider: AIProvider | null = null;
  private isEnabled: boolean = false;

  constructor() {
    // Initialize based on available API keys
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      this.provider = new GeminiAIProvider(geminiKey, process.env.GEMINI_MODEL);
      this.isEnabled = true;
      console.log('🤖 AI Content Service initialized with Gemini');
    } else if (openaiKey) {
      this.provider = new OpenAIProvider(openaiKey);
      this.isEnabled = true;
      console.log('🤖 AI Content Service initialized with OpenAI');
    } else {
      this.isEnabled = false;
      console.log('⚠️ AI Content Service disabled - no API keys found');
    }
  }

  async generateMorningMotivation(context: UserContext): Promise<{
    subject: string;
    message: string;
    focusArea: string;
  }> {
    console.log(`🤖 AI: Generating morning motivation for ${context.name}`);
    
    if (!this.isEnabled || !this.provider) {
      console.log(`🤖 AI: Disabled, using dynamic fallback`);
      return this.getFallbackMorningContent(context);
    }

    try {
      const prompt = 'morning motivation';
      const aiResponse = await this.provider.generateContent(prompt, context);
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        console.log(`🤖 AI: Empty response, using fallback`);
        return this.getFallbackMorningContent(context);
      }
      
      console.log(`🤖 AI: Generated content (${aiResponse.length} chars)`);
      
      // Parse AI response for Subject and Message
      let subject = '';
      let message = '';
      
      // Try to parse structured format first
      const subjectMatch = aiResponse.match(/Subject:\s*(.+?)(?:\n|$)/i);
      const messageMatch = aiResponse.match(/Message:\s*([\s\S]+?)$/i);
      
      if (subjectMatch && messageMatch) {
        subject = subjectMatch[1].trim();
        message = messageMatch[1].trim();
      } else {
        // Fallback: treat entire response as message
        const lines = aiResponse.split('\n').filter(l => l.trim());
        if (lines.length >= 2 && lines[0].toLowerCase().includes('day')) {
          subject = lines[0].replace(/^Subject:\s*/i, '').trim();
          message = lines.slice(1).join(' ').replace(/^Message:\s*/i, '').trim();
        } else {
          message = aiResponse;
        }
      }
      
      const today = new Date();
      const dayOfMonth = today.getDate();
      const monthToDateRate = (context as any).monthToDatePossible > 0 ? 
        Math.round(((context as any).monthToDateCompleted / (context as any).monthToDatePossible) * 100) : 0;
      
      if (!subject) {
        subject = `Day ${dayOfMonth} - ${monthToDateRate > 80 ? "You're Crushing It!" : monthToDateRate > 50 ? "Keep Building Momentum!" : "Fresh Start Energy!"}`;
      }
      
      if (!message || message.length < 50) {
        // Message too short, use fallback
        console.log(`🤖 AI: Message too short (${message.length} chars), using fallback`);
        return this.getFallbackMorningContent(context);
      }
      
      const result = {
        subject,
        message,
        focusArea: context.weakestHabit
      };
      return result;
    } catch (error) {
      console.error('🤖 AI: Error generating morning content:', error);
      return this.getFallbackMorningContent(context);
    }
  }

  async generateEveningReflection(context: UserContext): Promise<{
    subject: string;
    message: string;
    reflection: string;
  }> {
    console.log(`🤖 DEBUG: generateEveningReflection called with context:`, JSON.stringify(context, null, 2));
    
    if (!this.isEnabled || !this.provider) {
      console.log(`🤖 DEBUG: AI disabled for evening, using fallback`);
      return this.getFallbackEveningContent(context);
    }

    try {
      const prompt = 'evening reflection';
      console.log(`🤖 DEBUG: Calling AI provider for evening with prompt: ${prompt}`);
      const aiResponse = await this.provider.generateContent(prompt, context);
      console.log(`🤖 DEBUG: AI provider returned for evening:`, aiResponse);
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        console.log(`🤖 DEBUG: AI returned empty message, using fallback`);
        return this.getFallbackEveningContent(context);
      }
      
      // Parse AI response
      let subject = '';
      let message = '';
      
      const subjectMatch = aiResponse.match(/Subject:\s*(.+?)(?:\n|$)/i);
      const messageMatch = aiResponse.match(/Message:\s*([\s\S]+?)$/i);
      
      if (subjectMatch && messageMatch) {
        subject = subjectMatch[1].trim();
        message = messageMatch[1].trim();
      } else {
        const lines = aiResponse.split('\n').filter(l => l.trim());
        if (lines.length >= 2 && lines[0].toLowerCase().includes('day')) {
          subject = lines[0].replace(/^Subject:\s*/i, '').trim();
          message = lines.slice(1).join(' ').replace(/^Message:\s*/i, '').trim();
        } else {
          message = aiResponse;
        }
      }
      
      const today = new Date();
      const dayOfMonth = today.getDate();
      const completionRate = Math.round(context.completionRate * 100);
      
      if (!subject) {
        subject = `Day ${dayOfMonth} - ${completionRate >= 75 ? 'Strong Finish!' : completionRate >= 50 ? 'Good Progress!' : 'Tomorrow Awaits!'}`;
      }
      
      if (!message || message.length < 50) {
        console.log(`🤖 DEBUG: Message too short, using fallback`);
        return this.getFallbackEveningContent(context);
      }
      
      const result = {
        subject,
        message,
        reflection: 'Reflect on today and prepare for tomorrow.'
      };
      console.log(`🤖 DEBUG: Final evening reflection result:`, result);
      return result;
    } catch (error) {
      console.error('🤖 DEBUG: AI evening reflection error:', error);
      const fallback = this.getFallbackEveningContent(context);
      console.log(`🤖 DEBUG: Using evening fallback due to error:`, fallback);
      return fallback;
    }
  }

  async generateMilestoneMessage(context: UserContext): Promise<{
    subject: string;
    message: string;
    achievement: string;
    nextGoal: string;
  }> {
    if (!this.isEnabled || !this.provider) {
      return this.getFallbackMilestoneContent(context);
    }

    try {
      const prompt = 'milestone celebration';
      const aiMessage = await this.provider.generateContent(prompt, context);
      
      const milestoneTitle = this.getMilestoneTitle(context.milestoneReached || context.currentStreak);
      const nextMilestone = this.getNextMilestone(context.currentStreak);
      
      return {
        subject: `🎉 ${context.currentStreak} Days - ${milestoneTitle} Achieved!`,
        message: aiMessage,
        achievement: `${milestoneTitle} - ${context.currentStreak} Days`,
        nextGoal: `Next milestone: ${nextMilestone.title} at ${nextMilestone.days} days`
      };
    } catch (error) {
      console.error('AI milestone message error:', error);
      return this.getFallbackMilestoneContent(context);
    }
  }

  async generateWeeklySummary(context: any): Promise<{
    subject: string;
    message: string;
    insights: string[];
    recommendations: string[];
  }> {
    console.log(`🤖 DEBUG: generateWeeklySummary called with context:`, JSON.stringify(context, null, 2));
    
    if (!this.isEnabled || !this.provider) {
      console.log(`🤖 DEBUG: AI disabled for weekly summary, using fallback`);
      return this.getFallbackWeeklySummaryContent(context);
    }

    try {
      const prompt = 'weekly summary';
      console.log(`🤖 DEBUG: Calling AI provider for weekly summary with prompt: ${prompt}`);
      const aiResponse = await this.provider.generateContent(prompt, context);
      console.log(`🤖 DEBUG: AI provider returned for weekly summary:`, aiResponse);
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        return this.getFallbackWeeklySummaryContent(context);
      }
      
      // Parse response
      const subjectMatch = aiResponse.match(/Subject:\s*(.+?)(?:\n|$)/i);
      const messageMatch = aiResponse.match(/Message:\s*([\s\S]+?)$/i);
      
      const subject = subjectMatch ? subjectMatch[1].trim() : `Week ${this.getWeekNumber()} - Your Progress Report`;
      const message = messageMatch ? messageMatch[1].trim() : aiResponse.trim();
      
      const result = {
        subject,
        message: message.length >= 50 ? message : `Great week ${context.name}! You completed ${context.tasksCompleted || 0}/${context.totalPossibleTasks || 28} tasks. Your ${context.topHabit} is strong. Focus on ${context.improvementArea} next week!`,
        insights: this.extractInsights(message, context),
        recommendations: this.extractRecommendations(message, context)
      };
      console.log(`🤖 DEBUG: Final weekly summary result:`, result);
      return result;
    } catch (error) {
      console.error('🤖 DEBUG: AI weekly summary error:', error);
      const fallback = this.getFallbackWeeklySummaryContent(context);
      console.log(`🤖 DEBUG: Using weekly summary fallback due to error:`, fallback);
      return fallback;
    }
  }

  async generateComebackMessage(context: UserContext, daysSinceLastActivity: number): Promise<{
    subject: string;
    message: string;
    motivation: string;
  }> {
    if (!this.isEnabled || !this.provider) {
      return this.getFallbackComebackContent(context, daysSinceLastActivity);
    }

    try {
      const prompt = 'comeback encouragement';
      const aiMessage = await this.provider.generateContent(prompt, {
        ...context,
        daysSinceJoin: daysSinceLastActivity
      });
      
      return {
        subject: `🌟 Welcome Back ${context.name} - Your Journey Awaits`,
        message: aiMessage,
        motivation: 'Every comeback story starts with a single step. Take it today!'
      };
    } catch (error) {
      console.error('AI comeback message error:', error);
      return this.getFallbackComebackContent(context, daysSinceLastActivity);
    }
  }

  // Helper methods
  private getMotivationalTitle(context: UserContext): string {
    const titles = [
      'Unstoppable Force',
      'Chain Builder',
      'Habit Master',
      'Consistency King',
      'MNZD Warrior',
      'Progress Pioneer'
    ];
    return titles[context.currentStreak % titles.length];
  }

  // Get milestone title with medically-proven intervals
  private getMilestoneTitle(days: number): string {
    const milestones = [
      { days: 366, title: 'LEGENDARY MASTER', emoji: '👑', reset: true },
      { days: 300, title: 'TRANSFORMATION TITAN', emoji: '🌟' },
      { days: 240, title: 'CONSISTENCY CHAMPION', emoji: '🏆' },
      { days: 180, title: 'HABIT HERO', emoji: '⚡' },
      { days: 120, title: 'DISCIPLINE MASTER', emoji: '💎' },
      { days: 90, title: 'QUARTER WARRIOR', emoji: '⚔️' },
      { days: 66, title: 'NEURAL ARCHITECT', emoji: '🧠' }, // Neural pathway formation
      { days: 45, title: 'MOMENTUM MASTER', emoji: '🚀' }, // Habit automation
      { days: 30, title: 'MONTHLY CHAMPION', emoji: '🎯' },
      { days: 21, title: 'HABIT FORMER', emoji: '💪' }, // Classic 21-day rule
      { days: 14, title: 'FORTNIGHT FIGHTER', emoji: '🔥' },
      { days: 7, title: 'WEEK WARRIOR', emoji: '⭐' },
      { days: 3, title: 'STARTER STRONG', emoji: '🌱' }
    ];
    
    return milestones.find(m => m.days <= days)?.title || 'BEGINNER';
  }

  private getNextMilestone(currentDays: number): { days: number; title: string } {
    const milestones = [3, 7, 14, 21, 30, 45, 66, 90, 120, 180, 240, 300, 366];
    const nextDays = milestones.find(m => m > currentDays) || (currentDays < 366 ? 366 : currentDays + 30);
    return {
      days: nextDays,
      title: this.getMilestoneTitle(nextDays)
    };
  }

  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  }

  // Extract structured data from AI content
  private extractInsights(content: string, context: UserContext): string[] {
    return [
      `Current streak: ${context.currentStreak} days`,
      `Completion rate: ${Math.round(context.completionRate * 100)}%`,
      `Strongest habit: ${context.strongestHabit}`,
      `Focus area: ${context.weakestHabit}`
    ];
  }

  private extractRecommendations(content: string, context: UserContext): string[] {
    const habitTips = {
      meditation: 'Try 5-minute morning mindfulness sessions',
      nutrition: 'Prep healthy snacks for the week',
      zone: 'Schedule workouts like important meetings',
      discipline: 'Use the Pomodoro Technique for focus'
    };

    return [
      habitTips[context.weakestHabit.toLowerCase() as keyof typeof habitTips] || 'Focus on consistency over perfection',
      'Track your progress daily for better awareness'
    ];
  }

  private extractGoals(content: string, context: UserContext): string[] {
    const targetRate = Math.min(context.completionRate * 100 + 15, 100);
    return [
      `Achieve ${Math.round(targetRate)}% completion rate`,
      `Improve ${context.weakestHabit} consistency`,
      `Extend streak to ${context.currentStreak + 7} days`
    ];
  }

  // Fallback content methods
  private getFallbackMorningContent(context: UserContext) {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const monthToDateRate = (context as any).monthToDatePossible > 0 ? 
      Math.round(((context as any).monthToDateCompleted / (context as any).monthToDatePossible) * 100) : 0;
    
    const slogans = monthToDateRate > 80 ? 
      ["You're On Fire!", "Unstoppable Force!", "Crushing It!", "Momentum Master!", "Excellence Mode!"] :
      monthToDateRate > 50 ? 
      ["Keep Pushing!", "Building Strong!", "Steady Progress!", "On The Rise!", "Growing Daily!"] :
      ["Fresh Start!", "New Energy!", "Let's Go!", "Rise Up!", "Today's The Day!"];
    
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];
    
    const motivations = [
      `Good morning ${context.name}! You've tracked ${(context as any).trackedDaysThisMonth || 0} days this month at ${monthToDateRate}%. Your consistency in ${context.strongestHabit} is paying off. Let's keep the momentum going!`,
      `Rise and shine ${context.name}! With ${(context as any).monthToDateCompleted || 0}/${(context as any).monthToDatePossible || 0} tasks completed (${monthToDateRate}%), you're building something amazing. Focus on ${context.weakestHabit} today!`,
      `Good morning ${context.name}! ${(context as any).trackedDaysThisMonth || 0} days tracked means you're serious about growth. Your ${context.strongestHabit} is strong - time to level up ${context.weakestHabit}!`
    ];
    const randomIndex = Math.floor(Math.random() * motivations.length);
    
    return {
      subject: `Day ${dayOfMonth} - ${randomSlogan}`,
      message: motivations[randomIndex],
      focusArea: context.weakestHabit
    };
  }

  private getFallbackEveningContent(context: UserContext) {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const completionRate = Math.round(context.completionRate * 100);
    const todayCompleted = (context as any).todayCompleted || 0;
    const totalHabits = (context as any).totalHabits || 4;
    
    const slogans = completionRate >= 75 ? 
      ['Strong Finish!', 'Well Done!', 'Excellent Work!'] :
      completionRate >= 50 ? 
      ['Good Progress!', 'Keep Going!', 'Building Up!'] :
      ['Tomorrow Awaits!', 'Fresh Start Tomorrow!', 'New Day Coming!'];
    
    const randomSlogan = slogans[Math.floor(Math.random() * slogans.length)];
    
    const messages = [
      `Good evening ${context.name}! You completed ${todayCompleted}/${totalHabits} habits today (${completionRate}%). Your ${context.strongestHabit} consistency is impressive. Rest well and recharge for tomorrow!`,
      `Evening ${context.name}! Today's ${completionRate}% completion shows your dedication. You're making real progress in ${context.strongestHabit}. Tomorrow's another opportunity to shine!`,
      `Well done ${context.name}! ${todayCompleted} habits completed today. Your commitment to ${context.strongestHabit} is building something extraordinary. Keep the momentum going!`
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    
    return {
      subject: `Day ${dayOfMonth} - ${randomSlogan}`,
      message: messages[randomIndex],
      reflection: 'Every day of consistency brings you closer to your goals.'
    };
  }

  private getFallbackMilestoneContent(context: UserContext) {
    const milestoneTitle = this.getMilestoneTitle(context.currentStreak);
    const nextMilestone = this.getNextMilestone(context.currentStreak);
    
    return {
      subject: `🎉 ${context.currentStreak} Days - ${milestoneTitle} Achieved!`,
      message: `Incredible achievement ${context.name}! ${context.currentStreak} days of consistency shows your dedication to the MNZD methodology. You're not just building habits, you're building character. Keep this momentum going!`,
      achievement: `${milestoneTitle} - ${context.currentStreak} Days`,
      nextGoal: `Next milestone: ${nextMilestone.title} at ${nextMilestone.days} days`
    };
  }

  private getFallbackWeeklySummaryContent(context: any) {
    return {
      subject: `📊 Week ${this.getWeekNumber()} Summary - Your MNZD Journey`,
      message: `Great week ${context.name}! You completed ${context.daysCompleted || 0} out of ${context.totalDays || 7} days. Your strongest area is ${context.topHabit} and there's room to grow in ${context.improvementArea}. Keep building that momentum!`,
      insights: [
        `Completed ${context.daysCompleted || 0} out of ${context.totalDays || 7} days this week`,
        `Your strongest habit: ${context.topHabit}`,
        `Growth opportunity: ${context.improvementArea}`,
        `Current streak: ${context.currentStreak} days`
      ],
      recommendations: [
        `Focus on improving ${context.improvementArea} consistency`,
        `Maintain your strong performance in ${context.topHabit}`,
        'Track daily progress for better awareness',
        'Celebrate small wins to build momentum'
      ]
    };
  }

  private getFallbackComebackContent(context: UserContext, daysSinceLastActivity: number) {
    return {
      subject: `🌟 Welcome Back ${context.name} - Your Journey Awaits`,
      message: `It's been ${daysSinceLastActivity} days since your last visit, but your ${context.longestStreak}-day streak shows what you're capable of! Every expert was once a beginner, and every comeback story starts with a single step. Today is perfect for a fresh start with MNZD!`,
      motivation: 'Your potential is unlimited. Your comeback story starts now!'
    };
  }
}

// Export singleton instance
export const aiContentService = new AIContentService();
