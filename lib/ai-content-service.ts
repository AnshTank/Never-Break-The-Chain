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
    this.model = (model || process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
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
            topP: 0.95,
            maxOutputTokens: 200,
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
        return aiContent;
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

    return `${basePrompt}

User Context:
- Name: ${context.name}
- Current Streak: ${context.currentStreak} days
- Longest Streak: ${context.longestStreak} days
- Overall Completion Rate: ${Math.round(context.completionRate * 100)}%
- Strongest Habit: ${context.strongestHabit}
- Weakest Habit: ${context.weakestHabit}
- Days Since Join: ${context.daysSinceJoin}
- Time of Day: ${context.timeOfDay}
- Last Activity: ${context.lastActivity.toDateString()}
- Today's Progress: ${context.todayCompleted || 0}/${context.totalHabits || 4} habits completed
- MNZD Habit Details: ${mnzdDetails}
${context.milestoneReached ? `- Milestone Reached: ${context.milestoneReached} days` : ''}

Requirements:
- Keep response under 150 words
- Be encouraging and personal
- Reference specific user data and habit names
- Use the user's actual MNZD habit names (not generic ones)
- Include relevant emojis
- End with a call to action
- Make it feel personal and motivating`;
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
    console.log(`🤖 DEBUG: generateMorningMotivation called with context:`, JSON.stringify(context, null, 2));
    
    if (!this.isEnabled || !this.provider) {
      console.log(`🤖 DEBUG: AI disabled, using fallback`);
      return this.getFallbackMorningContent(context);
    }

    try {
      const prompt = 'morning motivation';
      console.log(`🤖 DEBUG: Calling AI provider with prompt: ${prompt}`);
      const aiMessage = await this.provider.generateContent(prompt, context);
      console.log(`🤖 DEBUG: AI provider returned:`, aiMessage);
      
      const result = {
        subject: `🌅 Day ${context.currentStreak + 1} - ${this.getMotivationalTitle(context)}`,
        message: aiMessage,
        focusArea: context.weakestHabit
      };
      console.log(`🤖 DEBUG: Final morning motivation result:`, result);
      return result;
    } catch (error) {
      console.error('🤖 DEBUG: AI morning motivation error:', error);
      const fallback = this.getFallbackMorningContent(context);
      console.log(`🤖 DEBUG: Using fallback due to error:`, fallback);
      return fallback;
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
      const aiMessage = await this.provider.generateContent(prompt, context);
      console.log(`🤖 DEBUG: AI provider returned for evening:`, aiMessage);
      
      const result = {
        subject: `🌙 Day ${context.currentStreak} Complete - Reflection Time`,
        message: aiMessage,
        reflection: 'Take a moment to appreciate your progress and plan for tomorrow.'
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
      const aiMessage = await this.provider.generateContent(prompt, context);
      console.log(`🤖 DEBUG: AI provider returned for weekly summary:`, aiMessage);
      
      const result = {
        subject: `📊 Week ${this.getWeekNumber()} Summary - Your MNZD Journey`,
        message: aiMessage,
        insights: this.extractInsights(aiMessage, context),
        recommendations: this.extractRecommendations(aiMessage, context)
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
    return {
      subject: `🌅 Day ${context.currentStreak + 1} - Rise and Shine!`,
      message: `Good morning ${context.name}! You're ${context.currentStreak} days strong. Today, let's focus on your ${context.weakestHabit} practice and keep building that amazing streak! Your consistency is the foundation of transformation.`,
      focusArea: context.weakestHabit
    };
  }

  private getFallbackEveningContent(context: UserContext) {
    return {
      subject: `🌙 Day ${context.currentStreak} Complete - Well Done!`,
      message: `Great work today ${context.name}! You've maintained a ${Math.round(context.completionRate * 100)}% completion rate. Your dedication to MNZD is building something extraordinary. Reflect on today's wins and prepare for tomorrow's success!`,
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
