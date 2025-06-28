// Fixed meditation-duration questions that will be used consistently
const FIXED_MEDITATION_QUESTIONS = [
  "Can you please generate a 2 mins short meditation session for physical relief?",
  "Please generate a 5 mins long meditation script to address physical and energetic healing!",
  "Please generate a long 10 mins meditation script for me to address the root cause of my issue discussed and resolve it!"
];

// Get fallback questions - always returns the same fixed meditation questions
const getFallbackQuestions = (): string[] => {
  return [...FIXED_MEDITATION_QUESTIONS];
};

export const generateSuggestedQuestions = (lastAiResponse: string): string[] => {
  const response = lastAiResponse.toLowerCase();
  const questions: string[] = [];

  // Context-aware meditation questions based on response content
  // All questions still focus on meditation script generation with specific durations

  // Meditation and mindfulness related questions
  if (response.includes('meditat') || response.includes('mindful') || response.includes('breath') || response.includes('relax')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for deeper mindfulness?",
      "Please generate a 5 mins long meditation script for enhanced awareness and presence!",
      "Please generate a long 10 mins meditation script to establish a profound meditation practice!"
    );
  }

  // Stress and anxiety related questions
  else if (response.includes('stress') || response.includes('anxiet') || response.includes('worry') || response.includes('overwhelm')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for immediate stress relief?",
      "Please generate a 5 mins long meditation script for anxiety management and calm!",
      "Please generate a long 10 mins meditation script to transform stress patterns at the root level!"
    );
  }

  // Sleep related questions
  else if (response.includes('sleep') || response.includes('rest') || response.includes('insomnia') || response.includes('tired')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for better sleep preparation?",
      "Please generate a 5 mins long meditation script for deep relaxation before bed!",
      "Please generate a long 10 mins meditation script to resolve sleep issues completely!"
    );
  }

  // Emotional regulation questions
  else if (response.includes('emotion') || response.includes('anger') || response.includes('sad') || response.includes('upset') || response.includes('frustrated')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for emotional balance?",
      "Please generate a 5 mins long meditation script for emotional healing and stability!",
      "Please generate a long 10 mins meditation script to transform emotional patterns at the core!"
    );
  }

  // Pain or physical discomfort
  else if (response.includes('pain') || response.includes('hurt') || response.includes('tension') || response.includes('headache') || response.includes('body')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for physical relief?",
      "Please generate a 5 mins long meditation script for body healing and comfort!",
      "Please generate a long 10 mins meditation script to address physical and energetic healing!"
    );
  }

  // Relationship and communication questions
  else if (response.includes('relationship') || response.includes('communication') || response.includes('conflict') || response.includes('family') || response.includes('partner')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for relationship harmony?",
      "Please generate a 5 mins long meditation script for heart-centered communication!",
      "Please generate a long 10 mins meditation script to heal relationship patterns and create deeper connection!"
    );
  }

  // Work and productivity questions
  else if (response.includes('work') || response.includes('productiv') || response.includes('focus') || response.includes('career') || response.includes('job')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for work clarity and focus?",
      "Please generate a 5 mins long meditation script for enhanced productivity and purpose!",
      "Please generate a long 10 mins meditation script to align with your highest career path!"
    );
  }

  // Self-care and wellness questions
  else if (response.includes('self-care') || response.includes('wellness') || response.includes('health') || response.includes('confidence') || response.includes('self-worth')) {
    questions.push(
      "Can you please generate a 2 mins short meditation session for self-love and acceptance?",
      "Please generate a 5 mins long meditation script for inner confidence and worth!",
      "Please generate a long 10 mins meditation script to cultivate deep self-acceptance and empowerment!"
    );
  }

  // If no specific context detected or questions array is empty, use fixed fallback questions
  if (questions.length === 0) {
    questions.push(...getFallbackQuestions());
  }

  // Always return exactly 3 questions for consistency
  return questions.slice(0, 3);
};

// Export the fixed questions for use in other components if needed
export { FIXED_MEDITATION_QUESTIONS, getFallbackQuestions };