# 🤖 LLM Setup Guide - Best Models for Education

**Complete guide to using the best AI models for generating educational content**

---

## 🎯 TL;DR - Quick Recommendations

### Free Options (Start Here):
1. **Groq** - Llama 3.1 70B (Fast, Free, Good quality)
2. **Google** - Gemini 2.0 Flash Exp (Free experimental tier)
3. **OpenRouter** - Multiple free models

### Best Quality:
1. **Claude 3.5 Sonnet** - Best reasoning and educational content ($3/1M tokens)
2. **GPT-4o** - Strong curriculum alignment ($5/1M tokens)
3. **Gemini 1.5 Pro** - Great for multilingual ($3.50/1M tokens)

### Best Speed:
1. **Groq** - 2-10x faster than others (FREE)
2. **Gemini Flash** - Very fast response times

---

## 🚀 Setup Instructions

### Option 1: Groq (RECOMMENDED FOR FREE TIER)

**Why Groq?**
- ✅ **FREE** with generous limits
- ✅ Extremely fast (2-10x faster than competitors)
- ✅ Llama 3.1 70B is very capable
- ✅ No credit card required
- ✅ Great for testing and development

**Setup Steps**:
```bash
1. Go to: https://console.groq.com/
2. Sign up (free, no credit card)
3. Create API key: https://console.groq.com/keys
4. Copy your API key
```

**Configuration**:
```bash
# Edit server/.env:
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.1-70b-versatile
```

**Available Models**:
- `llama-3.1-70b-versatile` - Best quality (recommended)
- `llama-3.1-8b-instant` - Fastest
- `mixtral-8x7b-32768` - Good alternative

**Limits**:
- Free tier: 30 requests/minute
- 14,400 requests/day
- More than enough for education platform

---

### Option 2: Anthropic Claude (BEST QUALITY)

**Why Claude?**
- ✅ Best reasoning and educational content
- ✅ Excellent at curriculum alignment
- ✅ Strong ethical guidelines
- ✅ Great explanations
- ✅ Affordable ($3/1M input tokens)

**Setup Steps**:
```bash
1. Go to: https://console.anthropic.com/
2. Sign up (requires payment method)
3. Get $5 free credit for new accounts
4. Create API key: https://console.anthropic.com/settings/keys
5. Copy your API key
```

**Configuration**:
```bash
# Edit server/.env:
ANTHROPIC_API_KEY=sk-ant-your_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

**Available Models**:
- `claude-3-5-sonnet-20241022` - **Best** (recommended)
- `claude-3-5-haiku-20241022` - Fastest, cheaper
- `claude-3-opus-20240229` - Most capable (expensive)

**Cost Estimate**:
- ~500 tokens per question generation
- 100 questions = ~50,000 tokens = $0.15
- **$5 credit = ~3,000 questions**

---

### Option 3: OpenAI (POPULAR CHOICE)

**Why OpenAI?**
- ✅ Reliable and well-documented
- ✅ Strong curriculum knowledge
- ✅ Good multilingual support
- ✅ Industry standard

**Setup Steps**:
```bash
1. Go to: https://platform.openai.com/
2. Sign up (requires payment method)
3. Add credits ($5 minimum)
4. Create API key: https://platform.openai.com/api-keys
5. Copy your API key
```

**Configuration**:
```bash
# Edit server/.env:
OPENAI_API_KEY=sk-proj-your_key_here
OPENAI_MODEL=gpt-4o-mini
```

**Available Models**:
- `gpt-4o-mini` - **Best value** (recommended) - $0.15/1M tokens
- `gpt-4o` - Best quality - $5/1M tokens
- `gpt-4-turbo` - Good balance - $10/1M tokens

**Cost Estimate**:
- gpt-4o-mini: 100 questions = $0.015
- gpt-4o: 100 questions = $0.25
- **$5 credit = 2,000-30,000 questions** (depending on model)

---

### Option 4: Google Gemini (GREAT FOR MULTILINGUAL)

**Why Gemini?**
- ✅ FREE tier available (generous limits)
- ✅ Excellent multilingual (Telugu, Hindi)
- ✅ Fast response times
- ✅ Long context window
- ✅ No credit card for free tier

**Setup Steps**:
```bash
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create API key (free tier, no credit card)
4. Copy your API key
```

**Configuration**:
```bash
# Edit server/.env:
GOOGLE_API_KEY=AIzaSy_your_key_here
GOOGLE_MODEL=gemini-1.5-flash
```

**Available Models**:
- `gemini-2.0-flash-exp` - FREE experimental (recommended for testing)
- `gemini-1.5-flash` - Fast and cheap
- `gemini-1.5-pro` - Best quality for multilingual

**Free Tier Limits**:
- 15 requests/minute
- 1,500 requests/day
- More than enough for development

---

### Option 5: OpenRouter (ACCESS MANY MODELS)

**Why OpenRouter?**
- ✅ One API for many models
- ✅ Many free models available
- ✅ Easy to switch models
- ✅ No rate limits on free tier

**Setup Steps**:
```bash
1. Go to: https://openrouter.ai/
2. Sign up (free)
3. Get API key: https://openrouter.ai/keys
4. Copy your API key
```

**Configuration**:
```bash
# Edit server/.env:
OPENROUTER_API_KEY=sk-or-your_key_here
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

**Recommended Free Models**:
- `google/gemini-2.0-flash-exp:free` - Fast, capable
- `meta-llama/llama-3.1-70b-instruct:free` - Good quality
- `microsoft/phi-3-medium-128k-instruct:free` - Decent

---

## 📊 Comparison Table

| Provider | Best Model | Cost | Speed | Quality | Free Tier | Best For |
|----------|-----------|------|-------|---------|-----------|----------|
| **Groq** | Llama 3.1 70B | FREE | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ Yes | Testing, development |
| **Anthropic** | Claude 3.5 Sonnet | $3/1M | ⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ❌ No | Best quality education |
| **OpenAI** | GPT-4o-mini | $0.15/1M | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ❌ No | Reliable, popular |
| **Google** | Gemini Flash | FREE | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ Yes | Multilingual |
| **OpenRouter** | Various | Varies | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ Yes | Flexibility |

---

## 🎓 Which LLM for Which Task?

### Quiz Question Generation
**Best**: Claude 3.5 Sonnet or GPT-4o  
**Budget**: Groq Llama 3.1 70B or Gemini Flash  
**Why**: Need accurate, curriculum-aligned questions

### Lesson Content Generation
**Best**: Claude 3.5 Sonnet  
**Budget**: GPT-4o-mini  
**Why**: Need coherent, educational explanations

### Multilingual (Telugu/Hindi)
**Best**: Gemini 1.5 Pro  
**Budget**: Gemini Flash or GPT-4o-mini  
**Why**: Gemini has best multilingual support

### Explanations & Feedback
**Best**: Claude 3.5 Sonnet  
**Budget**: Any model works well  
**Why**: Need clear, concise explanations

### High Volume / Testing
**Best**: Groq or Gemini Free Tier  
**Budget**: FREE  
**Why**: No cost, generous limits

---

## 💰 Cost Estimates

### For 1,000 Questions Generated:

| Provider | Model | Cost | Notes |
|----------|-------|------|-------|
| Groq | Llama 3.1 70B | **FREE** | Best free option |
| Google | Gemini Flash | **FREE** | Free tier |
| OpenAI | GPT-4o-mini | **$1.50** | Very affordable |
| Anthropic | Claude 3.5 Sonnet | **$3.00** | Best quality |
| OpenAI | GPT-4o | **$5.00** | Premium quality |

### Monthly Estimates (1,000 students, 10 quizzes each):
- 10,000 quiz attempts
- ~100 question generations/day
- ~3,000 questions/month

**Cost**:
- Groq: **FREE**
- Google: **FREE** (within limits)
- OpenAI GPT-4o-mini: **$4.50/month**
- Claude 3.5 Sonnet: **$9/month**
- OpenAI GPT-4o: **$15/month**

---

## 🔧 Configuration Guide

### Step-by-Step Setup:

1. **Choose your provider** (see recommendations above)

2. **Get API key** (follow provider-specific steps)

3. **Edit server/.env**:
```bash
# Open file
cd server
notepad .env

# Add your provider's credentials
# (Only configure ONE provider)
```

4. **Restart backend**:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

5. **Verify configuration**:
```bash
# Check health endpoint
curl http://localhost:3000/health

# Should show:
{
  "llmConfigured": true,
  "provider": "Your Provider Name"
}
```

6. **Check available providers**:
```bash
curl http://localhost:3000/api/questions/providers
```

---

## 🧪 Testing Your Setup

### Test Question Generation:

1. **Login as teacher**

2. **Go to "Generate" page**

3. **Fill in the form**:
   - Subject: Mathematics
   - Topic: Algebra
   - Class: 8
   - Difficulty: medium
   - Questions: 5

4. **Click "Generate"**

5. **Check results**:
   - Questions should be relevant
   - Options should make sense
   - Should indicate which LLM was used

### Expected Quality:

**Good Response** ✅:
- Questions are curriculum-aligned
- Options are plausible
- Language is age-appropriate
- Explanations are clear

**Poor Response** ❌:
- Generic questions
- Obvious correct answers
- Advanced vocabulary for grade level
- Missing context

If quality is poor → Try a different model or adjust prompts

---

## 🎨 Prompt Customization

The platform uses enhanced prompts optimized for education. You can customize them in:

**File**: `server/prompts/enhancedPrompts.js`

### Customization Options:

1. **Difficulty levels** (easy, medium, hard)
2. **Content types** (quiz, practice, assessment)
3. **Subject-specific guidelines**
4. **Rural education adaptations**
5. **Quality criteria**

### Example Modifications:

```javascript
// Make questions easier
// Edit DIFFICULTY_TEMPLATES.easy

// Add new subject
// Edit SUBJECT_GUIDELINES

// Change quality criteria
// Edit QUALITY_CRITERIA
```

---

## 🚨 Troubleshooting

### "LLM not configured" message:
```bash
✓ Check API key is in server/.env
✓ Key doesn't contain "your_" placeholder
✓ Backend server restarted after adding key
✓ Check /health endpoint
```

### Questions are generic/poor quality:
```bash
✓ Use better model (Claude or GPT-4o)
✓ Provide more detailed lesson text
✓ Check prompt templates
✓ Adjust temperature (lower = more consistent)
```

### Rate limit errors:
```bash
✓ Check provider's rate limits
✓ Reduce question count per request
✓ Add delay between requests
✓ Consider paid tier
```

### API key not working:
```bash
✓ Verify key is correct (copy-paste carefully)
✓ Check key has credits/active
✓ Try regenerating key
✓ Check provider's dashboard
```

---

## 📈 Scaling Recommendations

### Development (< 100 users):
→ **Use Groq or Gemini Free Tier**  
Cost: FREE  
Quality: Good  

### Production (100-1,000 users):
→ **Use GPT-4o-mini or Claude Haiku**  
Cost: $5-20/month  
Quality: Very Good  

### Enterprise (1,000+ users):
→ **Use Claude 3.5 Sonnet or GPT-4o**  
Cost: $50-200/month  
Quality: Excellent  

### Consider:
- Caching common questions
- Pre-generating question banks
- User-generated content
- Question recycling
- Batch generation

---

## 🎯 Best Practices

### 1. Start with Free Tier
- Test with Groq or Gemini first
- Verify question quality
- Ensure system works
- Estimate usage

### 2. Evaluate Quality
- Generate 50-100 test questions
- Review manually
- Get teacher feedback
- Compare different models

### 3. Monitor Usage
- Track API calls
- Watch costs
- Monitor quality
- Adjust as needed

### 4. Optimize Prompts
- Provide detailed lesson text
- Use appropriate difficulty
- Specify learning objectives
- Include context

### 5. Cache & Reuse
- Save generated questions
- Build question banks
- Reuse good questions
- Reduce API calls

---

## ✅ Quick Start Checklist

```
□ Choose LLM provider (recommend: Groq for free, Claude for quality)
□ Sign up and get API key
□ Add API key to server/.env
□ Restart backend server
□ Check /health endpoint (llmConfigured: true)
□ Login as teacher
□ Generate test questions
□ Review quality
□ Deploy to production
□ Monitor usage and costs
```

---

## 📞 Support & Resources

### Provider Documentation:
- **Groq**: https://console.groq.com/docs
- **Anthropic**: https://docs.anthropic.com/
- **OpenAI**: https://platform.openai.com/docs
- **Google**: https://ai.google.dev/docs
- **OpenRouter**: https://openrouter.ai/docs

### Getting Help:
1. Check provider's status page
2. Review API documentation
3. Test with curl/Postman
4. Check backend logs
5. Review error messages

---

## 🎉 You're Ready!

With these LLM options, you can generate high-quality educational content at scale. Start with the free tier, test quality, then upgrade based on your needs.

**Recommended Path**:
1. Start: Groq (free, fast, good quality)
2. Scale: GPT-4o-mini (affordable, reliable)
3. Premium: Claude 3.5 Sonnet (best quality)

---

**Document Created**: June 8, 2026  
**Version**: 1.0  
**Status**: Production Ready  

